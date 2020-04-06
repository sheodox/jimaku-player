# <img src="https://raw.githubusercontent.com/sheodox/jimaku-player/master/static/logo.svg?sanitize=true" width="160" height="160" alt="logo"> 字幕プレーヤー

This is a [Tampermonkey](https://www.tampermonkey.net/) userscript that lets you provide your own subtitles to play over anime on
 [VRV](https://vrv.co/), to help with learning Japanese.

[Install (requires Tampermonkey)](https://github.com/sheodox/jimaku-player/raw/master/dist/jimaku-player.user.js)

## Features

* Easily choose a subtitle file to use as you start watching an episode, then align them however
 you need so timing is never an issue.
* Click on a subtitle to open a [Jisho.org](https://jisho.org) search for that line (the video
 will automatically pause, and resume when you return).
* Choose your own subtitle text color if the subtitles don't specify one.
* Hover over the right side of the video to see a tray with some options, buttons to select a
 different subtitle file or re-align the current file, and the last ten subtitles so you
 can look back at a line you might have missed without having to rewind.

Currently supported subtitle formats:
* [.srt](https://en.wikipedia.org/wiki/SubRip) - supported
* [.vtt](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) - basic support
 (positioning, and some forms of alignment)
* [.ass/.ssa](https://en.wikipedia.org/wiki/SubStation_Alpha) - pretty good support (most general
 font styles like font family, size, colors, outlines, shadows, bold, italic, underline, strikethrough,
 etc), and many overrides are supported (position, outline/shadow colors and widths, fonts and
  sizing, bold, italic etc.)

If you would like support for other subtitle formats, please create an issue and I'll look into
 it. I would love to support more subtitle formats and features!

## Usage

### Step 1 - Select a subtitle file

Click to open a file selection dialog for the episode's subtitles.

![screenshot](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/select-srt.png)

### Step 2 - Align subtitles

Click the button when the first line is spoken, so the subtitles appear at the correct time.

![screenshot](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/align-subs.png)

### Step 3 - Watch!

![screenshot](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/subtitles.png)

### Settings and recent subs

Hover over the right side of the screen to show some settings and the last few subtitles.

![screenshot](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/tray.png)

### Click subtitles to search for words you don't know!

![screenshot](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/click-to-search.png)


## Alignment

Some subtitles might have a different start time than VRV does, like if VRV plays a studio's
 intro before the episode but the subtitle timings assumes the episode starts immediately. In
 instances like that the subtitles would show at the wrong times from when the lines are actually said by
 possibly a considerable amount, and wouldn't be useful at all and is extremely distracting.
 Because of this the first step after selecting a subtitle file for the episode is to align the
 subtitles. A button will appear over the video and show the first line in the subtitles. 
 Just click the button when that first line is spoken and the subtitles should all play at the
 same time.


## Issues

If you have any issues, please let me know! This has worked well for me for a couple of anime,
but are likely issues I don't know about with parsing, or lack of support for some extra
 formatting that can be present in an subtitle file. Please don't hesitate to 
 [create an issue](https://github.com/sheodox/jimaku-player/issues/new)!
 
Please read the [contributing guide](https://github.com/sheodox/jimaku-player/blob/master/CONTRIBUTING.md) if you would like to help out!

[Check out my other Japanese learning focused Userscripts!](https://github.com/sheodox/japanese-userscripts#vrv-srt-playeruserjs)
