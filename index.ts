import Elysia from 'elysia';
import {
	completedAnimes,
	getAnimeDetails,
	getEpisodeDetails,
	OngoingLists,
} from './otaku';

new Elysia()
	.get('/', (req) => {
		return 'halo';
	})
	.get('/ongoing', async (req) => {
		const page = Number(req.query?.page || 1);
		const [ongoingAnime, _err] = await OngoingLists(page);
		if (_err) {
			return {
				status: false,
				message: _err.message,
			};
		}
		return ongoingAnime;
	})
	.get('/completed', async (req) => {
		const page = Number(req.query?.page || 1);
		const [completedAnime, _err] = await completedAnimes(page);
		if (_err) {
			return {
				status: false,
				message: _err.message,
			};
		}
		return completedAnime;
	})
	.get('/anime/:slug', async (req) => {
		const { slug } = req.params;
		// fetch data from anime API
		const [anime, err] = await getAnimeDetails(slug);
		if (err) return { status: false, message: err.message };
		return anime;
	})
	.get('/episode/:slug', async (req) => {
		const { slug } = req.params;
		const [episode, err] = await getEpisodeDetails(slug);
		if (err) return { status: false, message: err.message };
		return episode;
	})
	.listen(Number(process.env.PORT || 3000));
