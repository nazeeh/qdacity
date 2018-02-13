import path from 'path';
import {scrambleIdent} from './util';
import JSONFile from './json-file';
const metadataSubscriber = Symbol('ExtractMessagesPlugin');

export default class ExtractMessagesPlugin {
	constructor({ outputPath }) {
		this.outputPath = outputPath;
		this.messages = new Map();
	}

	static get metadataSubscriber() {
		return metadataSubscriber;
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
					this.messages.set(path.format(pathInfo), messages);
					delete pathInfo.base;
					pathInfo.ext = '.json';
					const filename = '../../messages/'+path.format(pathInfo);
					compilation.assets[filename] = new JSONFile(messages);
				};
			});
		});
		compiler.plugin('emit', (compilation, done) => {
			const messages = {};
			this.messages.forEach((value, key) => {
				value.forEach((messageIdent) => {
					if (messages.hasOwnProperty(messageIdent.id)) {
						if(messages[messageIdent.id].defaultMessage == messageIdent.defaultMessage) return;
						const mI = JSON.stringify(messages[messageIdent.id], null, 2);
						const newMI = JSON.stringify(messageIdent, null, 2);
						compilation.errors.push(new Error(`duplicate identifiers found\n${mI}\nand\n${newMI}(ignored)`));
						return;
					}

					messages[messageIdent.id] = messageIdent;
				});
			});

			// drop meta information now
			for(const id in messages) {
				messages[id] = messages[id].defaultMessage;
			}
			compilation.assets['../messages/en.json'] = new JSONFile(messages);
			compilation.assets['../messages/test.json'] = new JSONFile(messages, scrambleIdent);
			done();
		});
	}
}

export {
	metadataSubscriber
};
