import { load } from 'cheerio';
import { returnValue, setError } from '../utils/response';
import type {
	AnimeDetails,
	CompletedAnimes,
	EpisodeDetails,
	OngoingPage,
} from '../types';
import redis from '../utils/redis';

export const OngoingLists = async (page: number = 1) => {
	try {
		const cached = await redis.get<string>(`current_ongoing_anime_${page}`);
		if (cached) return returnValue<OngoingPage>(JSON.parse(cached));
		const url =
			process.env.OTAKU_DOMAIN +
			(page > 1 ? `ongoing-anime/page/${page}/` : 'ongoing-anime/');
		const response = await fetch(url);
		const $ = load(await response.text());

		const maxPages = $('.page-numbers')
			.toArray()
			.filter((e) => {
				return !$(e).hasClass('next');
			})
			?.pop();

		const ongoingAnimeList = $('.rapi .venz ul li')
			.map((i, el) => {
				const title = $(el).find('h2.jdlflm')?.text()?.trim();
				const url = $(el).find('.thumb a').attr('href');
				const latest = parseInt(
					$(el)
						.find('.detpost .epz')
						.text()
						.replace(/episode\s/gi, '')
				);
				const thumb = $(el).find('.thumb img').attr('src');

				return { title, url, latest, thumb };
			})
			.toArray();

		const values = {
			animes: ongoingAnimeList,
			maxPages: Number(maxPages ? $(maxPages).text() : '1'),
			page,
		};
		await redis.set(`current_ongoing_anime_${page}`, JSON.stringify(values));
		return returnValue<OngoingPage>(values);
	} catch (error) {
		return setError(error as Error);
	}
};
export const completedAnimes = async (page: number = 1) => {
	try {
		const cached = await redis.get<string>(`current_completed_${page}`);
		if (cached) return returnValue<CompletedAnimes>(JSON.parse(cached));
		const url =
			process.env.OTAKU_DOMAIN +
			(page > 1 ? `complete-anime/page/${page}/` : 'complete-anime/');
		const response = await fetch(url);
		const $ = load(await response.text());

		const maxPages = $('.page-numbers')
			.toArray()
			.filter((e) => {
				return !$(e).hasClass('next');
			})
			?.pop();

		const completed = $('.rapi .venz ul li')
			.map((i, el) => {
				const title = $(el).find('h2.jdlflm')?.text()?.trim();
				const url = $(el).find('.thumb a').attr('href');
				const latest = parseInt(
					$(el)
						.find('.detpost .epz')
						.text()
						.replace(/episode\s/gi, '')
				);
				const thumb = $(el).find('.thumb img').attr('src');

				return { title, url, latest, thumb };
			})
			.toArray();

		const values = {
			animes: completed,
			maxPages: Number(maxPages ? $(maxPages).text() : '1'),
			page: page,
		};
		await redis.set(`current_completed_${page}`, JSON.stringify(values));
		return returnValue<CompletedAnimes>(values);
	} catch (error) {
		return setError(error as Error);
	}
};

export const getAnimeDetails = async (slug: string | null = null) => {
	if (!slug) return setError('No slug provided');

	try {
		const url = process.env.OTAKU_DOMAIN + `anime/${slug}/`;
		const response = await fetch(url);
		const $ = load(await response.text());

		const title = $('.jdlrx h1').text()?.trim();
		const metadata: Record<string, { name: string; value: string }> = {};

		for (const meta of $('.infozingle p')
			.map((i, el) => {
				const metaname = $(el).find('span b').text().trim();
				const metavalue = $(el)
					.find('span')
					.text()
					.replace(/.*\s?:\s?/gi, '')
					.trim();

				return { name: metaname, value: metavalue };
			})
			.toArray()) {
			const key = meta.name.toLocaleLowerCase().replace(/\s+/gi, '_');
			metadata[key] = meta;
		}

		const synopsis = $('.sinopc').html();
		const urldata = $('.episodelist')
			.map((i, el) => {
				const type = $(el)
					.find('.monktit')
					.text()
					.match(/lengkap|batch|episode list/gi)
					?.shift();
				const urls = $(el)
					.find('ul li')
					.map((i, li) => {
						return {
							url: $(li)
								.find('a')
								.attr('href')
								?.replace(/.*\s?(batch|lengkap|episode)\//gi, '')
								.replace('/', ''),
							title: $(li).find('a').text().trim(),
						};
					})
					.toArray();

				return { type, urls };
			})
			.toArray();

		const values = {
			title,
			metadata,
			synopsis,
			urldata,
		};
		await redis.set(`anime_details_${slug}`, JSON.stringify(values));
		return returnValue<AnimeDetails>(values);
	} catch (error) {
		return setError(error as Error);
	}
};

const getEpisodeNonce = async (ref: string | null = null) => {
	const cached = await redis.get<string>('otaku_nonce');
	if (cached) return returnValue<string>(cached);

	const url = process.env.OTAKU_DOMAIN + 'wp-admin/admin-ajax.php';
	const form = new FormData();
	form.append('action', 'aa1208d27f29ca340c92c66d1926f13f');
	const response = await fetch(url, {
		body: form,
		method: 'POST',
		referrer: ref || process.env.OTAKU_DOMAIN,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
	});
	const data = await response.json();
	await redis.set('otaku_nonce', data.data);
	return returnValue<string>(data.data);
};

const getStreamURL = async (data: string, nonce: string, ref: string) => {
	const reqdata = JSON.parse(atob(data));
	const form = new FormData();
	form.append('action', '2a3505c93b0035d3f455df82bf976b84');
	form.append('nonce', nonce);
	reqdata.forEach();

	Object.keys(reqdata).forEach((key) => {
		form.append(key, reqdata[key]);
	});

	const url = process.env.OTAKU_DOMAIN + 'wp-admin/admin-ajax.php';
	const response = await fetch(url, {
		body: form,
		method: 'POST',
		referrer: ref || process.env.OTAKU_DOMAIN,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
	});

	const text = await response.json();
	const { data: value } = text;
	const $ = load(atob(value));
	const source = $('iframe').attr('src');
	return returnValue<string>(source as string);
};

export const getEpisodeDetails = async (slug: string) => {
	if (!slug) return setError('No slug provided');
	try {
		const cached = await redis.get<string>(slug);
		if (cached) return returnValue<EpisodeDetails>(JSON.parse(cached));

		const url = process.env.OTAKU_DOMAIN + 'episode/' + slug;
		const response = await fetch(url);
		const $ = load(await response.text());

		const title = $('h1.posttl')
			.text()
			.replace(/\s+subtitle.*/gi, '');
		const [nonce] = await getEpisodeNonce(url);
		const episodeNumber = Number(title.replace(/.*\s?episode\s?/gi, ''));
		const streams: { [x: string]: { host: string; source: string }[] } = {};
		for (const stream of $('.mirrorstream ul').toArray()) {
			const quality = $(stream)
				.attr('class')
				?.trim()
				.replace('m', '') as string;
			const rawsources = $(stream).find('li').toArray();
			for (const currentsource of rawsources) {
				const data = $(currentsource).find('a').data('content');

				if (!data) continue;
				const [source] = await getStreamURL(data as string, nonce, url);
				const host = $(currentsource).find('a').text().trim();

				if (streams[quality]) {
					streams[quality].push({ host, source });
				} else {
					streams[quality] = [{ host, source }];
				}
			}
		}

		const downloads: {
			sources: { host: string; link: string }[];
			quality: string;
			size: string;
		}[] = [];
		for (const dl of $('.download ul li').toArray()) {
			const sources = $(dl)
				.find('a')
				.map((i, el) => ({
					link: $(el).attr('href') as string,
					host: $(el).text().trim(),
				}))
				.toArray();
			const quality = $(dl).find('strong').text().trim();
			const size = $(dl).find('i').text().trim();

			downloads.push({ sources, quality, size });
		}

		const values = {
			title,
			episodeNumber,
			streams,
			downloads,
		};
		await redis.set(slug, JSON.stringify(values), 60 * 60 * 24);
		return returnValue<EpisodeDetails>(values);
	} catch (error) {
		return setError(error as Error);
	}
};
