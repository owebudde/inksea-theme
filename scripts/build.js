const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'themes');

if (!fs.existsSync(THEME_DIR)) {
	fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {
	const themeSchemas = await generate();
	const schemaPromiseAllArr = [];

	themeSchemas.forEach(schema => {
		if (schema.hasOwnProperty('soft')) {
			schemaPromiseAllArr.push(
				fs.promises.writeFile(
					path.join(THEME_DIR, `${schema.fileName}-soft.json`),
					JSON.stringify(schema.soft, null, 4)
				)
			);
		} else {
			schemaPromiseAllArr.push(
				fs.promises.writeFile(
					path.join(THEME_DIR, `${schema.fileName}.json`),
					JSON.stringify(schema.base, null, 4)
				)
			);
		}
	});

	return Promise.all(schemaPromiseAllArr);
};

if (require.main === module) {
	module.exports();
}
