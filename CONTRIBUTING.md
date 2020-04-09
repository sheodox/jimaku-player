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

You will need [Node.js](https://nodejs.org/en/) and ideally should be pretty familiar with
 Javascript development. Development mostly centers around testing things on a test webpage that simulates a
 VRV video page. 
 
### Setup
1. Fork the repository, create a branch for your feature.
1. Copy any number of `.mp4` videos to `videos/` (they can be in folders).
1. Run `npm run build:dev` to start Webpack in watch mode.
1. Run `npm run server:dev` to start a test server to serves your videos on a test page, along
 with the compiled script, avoiding the need to interact with VRV or Tampermonkey for the bulk of
 the development workflow.
1. Open a web browser to `http://localhost:3500`, scroll down and select a video.

### Development
1. Edit files in `src/` and save.
1. Refresh your web browser test page and try out your changes.
1. Repeat until you're done with the feature you're working on.
1. Run `npm run build:test` and paste the code from `dist/vrv-subtitler.user.js` into Tampermonkey
 and try out your changes on VRV, please try to do some general regression testing around anything that
 possibly could be impacted by your changes.
1. Submit a PR targeting master from your fork!

When releasing a new build `npm run release` will create a production build of the userscript. I
 won't accept PRs that include a new build of the userscript, I will build new releases myself so I
 can ensure the minified production code hasn't been tampered.

## Files of note

### `src/subtitler/`
These are the source files for the subtitler itself.

* **parsers/** - The files in this folder are parsers for each supported format. They
 parse each raw subtitle file into an array of objects with start/end times in milliseconds, and the
 subtitle text that should show in between those times, along with any specific styling the
 subtitle format has defined. Most styling is computed here and it generates a bunch of inline
 styling, with some exceptions for things that need to be dynamic, but it allows the subtitle
 renderer component (`Subtitles.svelte`) to not need to know much about the subtitle format.
* **VideoController.js** - When opening the tray or when clicking a subtitle (to
 open a Jisho search) the video should be automatically paused. The VideoController class handles when the
 video should be paused or resumed. It just maintains an array of reasons why a video should be
 paused, and if no reasons remain it will resume playing the video.
* **main.js** - Creates and mounts the Svelte app.
* **Align.svelte** - Handles subtitle alignments.
* **App.svelte** - The main component that orchestrates everything.
* **SubtitlePrompt.svelte** - Basically just a file input, allows you to select a subtitle file,
 then selects the right parser based on the file extension, and passes the parsed subtitle file
 back up to the App component to handle it from there.
* **Subtitles.svelte** - The component that actually shows the subtitles over the video, and
 assembles styles between what the parser has defined, and what the user has set in the tray.
* **Tray.svelte** - The sidebar that contains settings for how the script behaves, and a list of
 recent subtitles to easily view if you missed what someone said.
* **settingsStore.js** - This is a collection of Svelte stores that are used for any settings in
 the tray. The values can be bound to in the tray to set them, then subscribed to (or auto-subscribed
 to in templates) to use their values. They are also all automatically persisted, so
 their values will be restored when refreshing. It also avoids having to bind and pass a bunch of
 variables around between Tray/App.svelte and the other components. Just import the stores when
 you need them.


### `src/local-player`

These files handle a local video player site which is used for the development environment.
 There are two Svelte apps here, 'host' and 'player'. Similar to VRV, the 'player' app runs
 inside an iframe and mostly just hosts a video player but it also includes the subtitler script
 without having to use Tampermonkey. Both apps will get compiled to `static/` which is then
 served by the Express server.
