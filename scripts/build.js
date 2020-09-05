const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'theme');

if (!fs.existsSync(THEME_DIR)) {
	fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {
	// const { base, soft } = await generate();
	const generatedFiles = await generate();

	console.log('generatedFiles:', generatedFiles);

	// for (let index = 0; index < generatedFiles.length; index++) {
	// 	// const element = array[index];
	// 	console.log('generatedFiles[index]::', generatedFiles[index]);
	// }
	// console.log(generatedFiles);

	// return Promise.all([
	// 	fs.promises.writeFile(
	// 		path.join(THEME_DIR, 'dracula.json'),
	// 		JSON.stringify(base, null, 4)
	// 	),
	// 	fs.promises.writeFile(
	// 		path.join(THEME_DIR, 'dracula-soft.json'),
	// 		JSON.stringify(soft, null, 4)
	// 	),
	// ]);
};

if (require.main === module) {
	module.exports();
}
