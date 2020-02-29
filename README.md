# VRV Subtitler

This is a Tampermonkey userscript that lets you provide your own [subtitles in `srt` format](https://en.wikipedia.org/wiki/SubRip) to play over anime on VRV, to help with learning Japanese.

[Install (requires Tampermonkey)](https://github.com/sheodox/vrv-subtitler/raw/master/dist/vrv-subtitler.user.js)

## Features

* Easily choose an SRT file to use as you start watching an episode.
* Click a button to 'align' the subtitles.
* Hover over the right side of the video to see a tray with some options, buttons to select a
 different subtitle file or re-align the current file, and the last ten recent subtitles so you
 can look back at a line you might have missed without having to rewind.
* Click on a subtitle to open a [Jisho.org](https://jisho.org) search for that line.

### Alignment

Some subtitles might have a different start time than VRV does, like if VRV plays a studio's
 intro before the episode but the SRT file assumes the episode starts immediately. In instances
 like that the subtitles would show at the wrong times from when the lines are actually said by
 possibly a considerable amount, and wouldn't be useful at all and is extremely distracting.
 Because of this the first step after selecting an SRT file for the episode is to align the
 subtitles. A button will appear over the video and show the first line in the subtitles. 
 Just click the button when that first line is spoken and the subtitles should all play at the
 same time.


## Issues

If you have any issues, please let me know! This has worked well for me for a couple of anime,
but are likely issues I don't know about with parsing, or lack of support for some extra
 formatting that can be present in an SRT file. Please don't hesitate to 
 [create an issue](https://github.com/sheodox/vrv-subtitler/issues/new)!

[Check out my other Japanese learning focused Userscripts!](https://github.com/sheodox/japanese-userscripts#vrv-srt-playeruserjs)
