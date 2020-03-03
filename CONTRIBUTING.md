# Contributing

I'm happy to merge PRs if anyone would like to help! I'm also open to feature suggestions and bug
 reports! Regardless of which you want to contribute, please be as descriptive as possible. If
 submitting a PR, please explain why your change is necessary in the PR and commit messages.

The UI portions of this userscript are written with [Svelte 3](https://svelte.dev/), and built with
 [Webpack](https://webpack.js.org/). You'll most likely have to be familiar with Svelte to work on
 it, though it's pretty easy to get up to speed. A small script (`dist.js`) takes the Webpack build
 and bundles it with the userscript metadata block, incrementing the version number if creating a
 release build.
 
## Development Workflow

You will need [Node.js](https://nodejs.org/en/) and should be pretty familiar with Javascript
 development.

1. Edit files in `src/`
2. Run `npm run dev` to build a new userscript in `dist/vrv-subtitler.user.js`
3. Paste that file into Tampermonkey.
4. Test
5. Submit a PR!

When releasing a new build `npm run release` will create a production build of the userscript.

I won't accept PRs that include a new build of the userscript, I will build new releases myself so I
 can ensure the minified production code hasn't been tampered.

The development build command currently has an `xclip` command. I'm just using that to
 automatically copy the userscript to my clipboard. It was an easy stop-gap solution but can
 definitely be improved.
 
## Files of note

* **src/parsers/** - The files in this folder are parsers for each supported format. It parses
 each raw subtitle file into an array of objects with start/end times in milliseconds, and the
 subtitle text that should show in between those times.
* **src/VideoController.js** - When opening the tray or when clicking a subtitle (to open a Jisho
 search) the video should be automatically paused. The VideoController class handles when the
 video should be paused or resumed. It just maintains an array of reasons why a video should be
 paused, and if no reasons remain it will resume playing the video.
* **src/main.js** - Creates and mounts the Svelte app.
* **src/App.svelte** - The main component that orchestrates everything.
* **src/SubtitlePrompt.svelte** - Basically just a file input, allows you to select a subtitle file,
 then passes the file content back up to the App component which takes it from there.
* **src/Subtitles.svelte** - The component that actually shows the subtitles over the video.
* **src/Tray.svelte** - The sidebar that contains settings for how the script behaves, and a list of
 recent subtitles to easily view if you missed what someone said.

