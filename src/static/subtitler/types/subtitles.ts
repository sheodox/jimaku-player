import type { SubRip, SubRipSubtitle } from '../parsers/SubRip';
import type { ASS, ASSSubtitle } from '../parsers/ASS';

export type SubtitleParser = SubRip | ASS;
export type Subtitle = SubRipSubtitle | ASSSubtitle;
