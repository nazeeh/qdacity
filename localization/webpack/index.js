const path = require('path');
const metadataSubscriber = Symbol('ExtractMessagesPlugin');

class ExtractMessagesPlugin {
	constructor({ outputPath }) {
		this.outputPath = outputPath;
	}

	apply(compiler) {
		compiler.plugin('compilation', (compilation) => {
			if(!this.outputPath) throw new Error('Required option outputPath is not set');
			compilation.plugin('normal-module-loader', (context, module) => {
				context[metadataSubscriber] = (metadata) => {
					if(!metadata['react-intl'] || !metadata['react-intl'].messages) {
						return;
					}
					const messages = metadata['react-intl'].messages;
					if (messages.length <= 0) return;

					const pathInfo = path.parse(path.relative(this.outputPath, module.resource));
					delete pathInfo.base;
					pathInfo.ext = '.json';
					const filename = '../../messages/'+path.format(pathInfo);
					const serializedData = JSON.stringify(messages, null, 2);
					compilation.assets[filename] = {
						source() {
							return serializedData;
						},
						size() {
							return serializedData.length;
						}
					};
				};
			});
		});
	}
}

module.exports = ExtractMessagesPlugin;
module.exports.metadataSubscriber = metadataSubscriber;
