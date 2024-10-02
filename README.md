# OtakuCafe

Scraper untuk otakudesu, menggunakan ElysiaJS dan Bun.

## About

`Scraper untuk otakudesu, sepenuhnya menggunakan typescript (Elysia & Bun), ditambah redis untuk cache. Karena sedang bosan, saya buat ini untuk latihan. Silahkan bila ada yang salah atau ada yang request.`

## URL

- [Bun](https://bun.sh)
- [ElysiaJS](https://elysiajs.com)
- [Author Blog](https://hadezuka.dev)
- [Tukutema Store](https://tukutema.com)

## Endpoints

- `/ongoing` for ongoing anime. pagination using `page` query.
- `/completed` for completed animes. pagination using `page` query.
- `/anime/:slug` for Anime details. slug example: `isekai-sikaku-sub-indo`
- `/episode/:slug` for Episode datails. slug example: `iskskhu-episode-1-sub-indo`

## Usage

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
