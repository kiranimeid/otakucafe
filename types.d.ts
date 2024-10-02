export type AnimeDetails = {
	title: string;
	metadata: Record<string, { name: string; value: string }>;
	synopsis: string | null;
	urldata: {
		type: string | undefined;
		urls: {
			url: string | undefined;
			title: string;
		}[];
	}[];
};

export type OngoingPage = {
	animes: {
		title: string;
		url: string | undefined;
		latest: number;
		thumb: string | undefined;
	}[];
	maxPages: number;
	page: number;
};
export type CompletedAnimes = OngoingPage;

export type EpisodeDetails = {
	title: string;
	episodeNumber: number;
	streams: {
		[x: string]: {
			host: string;
			source: string;
		}[];
	};
	downloads: {
		sources: {
			host: string;
			link: string;
		}[];
		quality: string;
		size: string;
	}[];
};
