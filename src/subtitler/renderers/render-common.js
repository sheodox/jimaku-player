export function joinStyles(stylesArray) {
	return stylesArray
		//ensure we're not putting `;undefined;` in the styles
		.filter(style => !!style)
		.join(';');
}
