const { parseColor, getOverride } = require('./ASS');

test('getOverride()', () => {
	const nestedClipOverride =
			'\\clip(504,315,536,844)\\bord0\\shad0\\c&HF7F6CE&\\t(0,458,\\clip(504,315,929,450))\\pos(728,330)}',
		override = getOverride(nestedClipOverride, 't', true);
	expect(override.params).toStrictEqual(['0', '458', '\\clip(504,315,929,450)']);
	expect(override.overrides).toBe('\\clip(504,315,536,844)\\bord0\\shad0\\c&HF7F6CE&\\pos(728,330)}');
});

test('parseColor()', () => {
	//pure white with full alpha
	expect(parseColor('&H00FFFFFF').rgba).toBe('rgba(255, 255, 255, 1.000)');
	//pure white with implicit alpha
	expect(parseColor('&HFFFFFF').rgba).toBe('rgba(255, 255, 255, 1.000)');

	//the above pure whites, in lowercase
	expect(parseColor('&H00ffffff').rgba).toBe('rgba(255, 255, 255, 1.000)');
	expect(parseColor('&Hffffff').rgba).toBe('rgba(255, 255, 255, 1.000)');
});
