# Contributing

I'm happy to merge PRs if anyone would like to help! I'm also open to feature suggestions and bug
reports! Regardless of which you want to contribute, please be as descriptive as possible. If
submitting a PR, please explain why your change is necessary in the PR and commit messages. Big
features should first be discussed over an issue, so please start there first!

The UI portions of this userscript are written with [Svelte 3](https://svelte.dev/) and
[Typescript](https://www.typescriptlang.org/), then built with [Vite](https://vitejs.dev/).
You'll most likely have to be familiar with Svelte to work on it, though it's pretty easy
to get up to speed. A small script (`/dist.js`) takes the Vite build and bundles it with the userscript
metadata block, incrementing the version number if creating a release build.

## Development Workflow

You will need [Node.js](https://nodejs.org/en/) and ideally should be pretty familiar with
Javascript development. Development mostly centers around testing things on a test webpage that simulates a
VRV video page.

You will also need to setup and install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. Fork the repository, create a branch for your feature.
1. Copy any number of `.mp4` videos to the `videos/` directory in the project root (they can be nested in folders).
1. In separate terminal windows run each of these:
   1. `npm run build-static:dev` (compiles front end scripts, both for the subtitler and the dev server)
   1. `npm run build-server:dev` (compiles typescript files for the server)
   1. `./run.sh dev` (starts the dev server)
1. Open a web browser to `http://localhost:3500`, scroll down and select a video.

### Development

1. Edit files in `src/` and save
1. Your browser should automatically reload with your changes
1. Repeat until you're done with the feature you're working on.
1. Run `npm run build-subtitler:test` and paste the code from `dist/jimaku-player.user.js` into Tampermonkey
   and try out your changes on VRV/Crunchyroll, please try to do some general regression testing around anything that
   possibly could be impacted by your changes.
1. Submit a PR targeting master from your fork!

You can find all source files in `src/`. Here is breakdown of those directories:

- The subtitler code (what turns into the Jimaku Player userscript) is in `src/static/subtitler`.
- The dev server front end is in `src/static/local-player` (separated into `host` and `player`, as it uses an `iframe` to mimic the way VRV's player works)
- The dev server's code is in `src/server`

When releasing a new build `npm run build-subtitler:release` will create a production build of the userscript. I
won't accept PRs that include a new build of the userscript, I will build new releases myself so I can verify
the contents and make an announcement on Discord.
