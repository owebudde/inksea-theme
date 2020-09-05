const fs = require('fs');
const { readFile } = fs.promises;
const { join } = require('path');
const { Type, Schema, load } = require('js-yaml');
const tinycolor = require('tinycolor2');

/**
 * @typedef {Object} TokenColor - Textmate token color.
 * @prop {string} [name] - Optional name.
 * @prop {string[]} scope - Array of scopes.
 * @prop {Record<'foreground'|'background'|'fontStyle',string|undefined>} settings - Textmate token settings.
 *       Note: fontStyle is a space-separated list of any of `italic`, `bold`, `underline`.
 */

/**
 * @typedef {Object} Theme - Parsed theme object.
 * @prop {Record<'base'|'ansi'|'brightOther'|'other', string[]>} dracula - Dracula color variables.
 * @prop {Record<string, string|null|undefined>} colors - VSCode color mapping.
 * @prop {TokenColor[]} tokenColors - Textmate token colors.
 */

/**
 * @typedef {(yamlContent: string, yamlObj: Theme) => Theme} ThemeTransform
 */

const withAlphaType = new Type('!alpha', {
	kind: 'sequence',
	construct: ([hexRGB, alpha]) => hexRGB + alpha,
	represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = Schema.create([withAlphaType]);

/**
 * Soft variant transform.
 * @type {ThemeTransform}
 */
const transformSoft = (yamlContent, yamlObj) => {
	const brightColors = [
		...yamlObj.dracula.ansi,
		...yamlObj.dracula.brightOther,
	];
	return load(
		yamlContent.replace(/#[0-9A-F]{6}/g, color => {
			if (brightColors.includes(color)) {
				return tinycolor(color)
					.desaturate(20)
					.toHexString();
			}
			return color;
		}),
		{ schema }
	);
};

// TODO:
// 1. Read all files.
// 2. Create soft version of those files.
// 3. Build all of those files.

// TODO: This needs to return all of the built data.
module.exports = async () => {
	// Read all files.
	const srcFileDir = join(__dirname, '..', 'src');
	console.log('srcFileDir:: ', srcFileDir);

	const srcFiles = fs.readdirSync(srcFileDir);
	console.log('srcFiles:: ', srcFiles);

	const themeSchemas = [];

	for (let i = 0; i < srcFiles.length; i++) {
		const yamlFile = await readFile(
			join(__dirname, '..', 'src', srcFiles[i]),
			'utf-8'
		);

		/** @type {Theme} */
		const base = load(yamlFile, { schema });

		// Remove nulls and other falsey values from colors
		for (const key of Object.keys(base.colors)) {
			if (!base.colors[key]) {
				delete base.colors[key];
			}
		}

		themeSchemas.push({
			base,
			soft: transformSoft(yamlFile, base),
		});
	}

	return themeSchemas;
};

// module.exports = async () => {
// 	const yamlFile = await readFile(
// 		join(__dirname, '..', 'src', 'inksea.yml'),
// 		'utf-8'
// 	);

// 	/** @type {Theme} */
// 	const base = load(yamlFile, { schema });

// 	// Remove nulls and other falsey values from colors
// 	for (const key of Object.keys(base.colors)) {
// 		if (!base.colors[key]) {
// 			delete base.colors[key];
// 		}
// 	}

// 	return {
// 		base,
// 		soft: transformSoft(yamlFile, base),
// 	};
// };
