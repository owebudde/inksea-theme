const { promises: fs } = require('fs');
const { join } = require('path');
const { Type, Schema, load } = require('js-yaml');
const tinycolor = require('tinycolor2');
const { fstat } = require('fs');

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

const handleFiles = async (srcDir, files) => {
	console.log('handleFiles fired');
	const moddedFiles = [];

	for (let i = 0; i < files.length; i++) {
		const filePath = `${srcDir}/${files[i]}`;
		const yamlFile = await fs.readFile(filePath, 'utf-8');

		/** @type {Theme} */
		const base = load(yamlFile, { schema });

		// Remove nulls and other falsey values from colors
		for (const key of Object.keys(base.colors)) {
			if (!base.colors[key]) {
				delete base.colors[key];
			}
		}

		moddedFiles.push({
			base,
			soft: transformSoft(yamlFile, base),
			themeName: files[i],
		});

		console.log('handleFiles--moddedFiles: ', moddedFiles);
		return moddedFiles;
	}
};

module.exports = async () => {
	const srcFiles = join(__dirname, '..', 'src');

	const themeFiles = await fs.readdir(srcFiles, async (err, files) => {
		if (err) {
			console.log('Unable to scan directory: ' + error);
		}

		const moddedFiles = await handleFiles(srcFiles, files);

		return moddedFiles;
	});

	return themeFiles;
};
