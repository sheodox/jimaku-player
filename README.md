<div align="center">
	<img src="src/static/assets/logo.svg?sanitize=true" width="160" height="160" alt="logo">
	<h1>字幕プレーヤー</h1>
</div>

This is a [Tampermonkey](https://www.tampermonkey.net/) userscript that lets you provide your own subtitles to play over anime on
[VRV](https://vrv.co/) or [Crunchyroll](https://www.crunchyroll.com/), to help with learning
Japanese.

# [Install](https://github.com/sheodox/jimaku-player/raw/master/dist/jimaku-player.user.js) (requires [Tampermonkey](https://www.tampermonkey.net/))

If Tampermonkey is installed, clicking on the "Install" link above should present you with a Tampermonkey screen asking to confirm
installation, just click "Install" again on that page and you're done!

## Features

- Easily choose a subtitle file to use as you start watching an episode, then align them however
  you need so timing shouldn't be an issue.
- Click on a subtitle to open a [Jisho.org](https://jisho.org) search for that line (the video
  will automatically pause, and resume when you return).
- Choose your own subtitle text color to use if the subtitles don't specify one.
- Hover over the right side of the video to see a tray with some options, buttons to select a
  different subtitle file or re-align the current file, and the last ten subtitles so you
  can look back at a line you might have missed without having to rewind.

Currently supported subtitle formats:

- [.srt](https://en.wikipedia.org/wiki/SubRip) - supported
- [.vtt](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) - basic support
  (positioning, and some forms of alignment)
- [.ass/.ssa](https://en.wikipedia.org/wiki/SubStation_Alpha) - pretty good support (most general
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

### Settings and recent subtitles

Hover over the right side of the screen to open a tray that shows the last few subtitles. You can
click them to open a Jisho search if you missed something. You'll also find settings in here.

![image showing the tray open](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/tray.png)

### Click subtitles to search for words you don't know!

![image showing hovering over a subtitle](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/click-to-search.png)

## Alignment

Sometimes subtitles might be timed differently than the actual anime you're watching, causing subtitles to
show up at the wrong time. "Alignment" is the term Jimaku Player uses for compensating for these issues.

After selecting a subtitle file you're asked to align it. Generally you can assume the default timing is correct
but if subtitles are mistimed that can be fixed.

To align your subtitles, from the "Alignment" menu (which shows automatically after selecting a subtitle file) you can
choose `Chose a different alignment...`, it will show you a few lines of dialog. Pay attention to what's said and as
soon as you hear the start of one of those subtitles press the corresponding button and Jimaku Player will figure out
the correct subtitle timing based on that.

> Hint: If the subtitles you're hearing aren't an option you can search for part of a line of dialog you can hear, then click one of the subsequent lines. You can adjust your alignment at any time from the "Setup" tab in the tray.

![image showing searching for a subtitle line while aligning](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/align-auto-searched.png)

### Fine Alignment Adjustment

If the alignment is just a little wrong, you can use the fine alignment dialog, found in the Settings
tab of the tray. This lets you make tiny adjustments to the alignment to while watching the video
get it perfect.

![image showing the fine adjustment dialog](https://raw.githubusercontent.com/sheodox/jimaku-player/master/images/fine-adjustment.png)

## Issues

If you have any issues, please let me know! This has worked well for me for several anime,
but are likely issues I don't know about with parsing, or lack of support for some extra
formatting that can be present in an subtitle file. Please don't hesitate to
[create an issue](https://github.com/sheodox/jimaku-player/issues/new)!

Please read the [contributing guide](https://github.com/sheodox/jimaku-player/blob/master/CONTRIBUTING.md) if you would like to help out!

[Check out my other Japanese learning focused Userscripts!](https://github.com/sheodox/japanese-userscripts#vrv-srt-playeruserjs)
