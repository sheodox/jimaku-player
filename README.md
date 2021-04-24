# <img src="https://raw.githubusercontent.com/sheodox/jimaku-player/master/static/logo.svg?sanitize=true" width="160" height="160" alt="logo"> 字幕プレーヤー

This is a [Tampermonkey](https://www.tampermonkey.net/) userscript that lets you provide your own subtitles to play over anime on
 [VRV](https://vrv.co/) or [Crunchyroll](https://www.crunchyroll.com/), to help with learning
  Japanese.

# [Install (requires Tampermonkey)](https://github.com/sheodox/jimaku-player/raw/master/dist/jimaku-player.user.js)

## Features

* Easily choose a subtitle file to use as you start watching an episode, then align them however
 you need so timing shouldn't be an issue.
* Click on a subtitle to open a [Jisho.org](https://jisho.org) search for that line (the video
 will automatically pause, and resume when you return).
* Choose your own subtitle text color to use if the subtitles don't specify one.
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

![image showing the subtitle selection phase](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/select-subs.png)

### Step 2 - Align subtitles

If you've aligned a show before, that'll be the first suggestion. Otherwise you're able to
 automatically adjust the alignment by pressing a button when a line is said. [More info
  on alignment.](#alignment)

![image showing the last used alignment](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/align-subs-remembered.png)
![image showing specifying a different alignment](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/align-auto.png)

### Step 3 - Watch!

![image showing subtitles in use](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/subtitles.png)

### Settings and recent subs

Hover over the right side of the screen to open a tray that shows the last few subtitles. You can
 click them to open a Jisho search if you missed something.

![image showing the tray open](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/tray.png)

There are a several settings you can adjust, and I'm always adding more!

![image showing settings in the tray](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/tray-settings.png)

### Click subtitles to search for words you don't know!

![image showing hovering over a subtitle](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/click-to-search.png)


## Alignment

Some subtitles might have a different start time than VRV does, like if VRV plays a studio's
 intro before the episode but the subtitle timings assumes the episode starts immediately. In
 instances like that the subtitles would show at the wrong times from when the lines are actually said by
 possibly a considerable amount, and wouldn't be useful at all and is extremely distracting.
 Because of this the first step after selecting a subtitle file for the episode is to align the
 subtitles by figuring out by how much time the subtitles are offset from when they're actually
 said.
 
Most of the time the subtitler can figure out the offset automatically with one button click. It
 will show you the first several subtitles that show up in the script. You can click a subtitle the instant you
 hear that line and the subtitler will calculate the timing discrepancy and the timing of all
 subtitles will be adjusted accordingly.

If the subtitles get misaligned later in the video you can go back to the alignment wizard by
 clicking *Realign Subtitles* in the *Setup* tab of the tray, then search for a word or subtitle
 you hear. It will show the next few lines after each matching search result (it's already too
 late to align to the subtitle you just heard, it'd be a second or two too late), and you can just
  click one of those subtitles the moment you hear one of those.
 
![image showing searching for a subtitle line while aligning](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/align-auto-searched.png)

### Fine Alignment Adjustment

If the alignment is a little off, you can use the fine alignment dialog, found in the Settings
 tab of the tray, which will let you tweak the timing while watching the video until they're
 perfect without having to retry automatic timing or guess at a different manual timing.
 
![image showing the fine adjustment dialog](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/fine-adjustment.png)

## Issues

If you have any issues, please let me know! This has worked well for me for several anime,
but are likely issues I don't know about with parsing, or lack of support for some extra
 formatting that can be present in an subtitle file. Please don't hesitate to 
 [create an issue](https://github.com/sheodox/jimaku-player/issues/new)!
 
Please read the [contributing guide](https://github.com/sheodox/jimaku-player/blob/master/CONTRIBUTING.md) if you would like to help out!

[Check out my other Japanese learning focused Userscripts!](https://github.com/sheodox/japanese-userscripts#vrv-srt-playeruserjs)
