import {parser, tokenizer} from './format';

class TranslationFile {
	source() {
		if (this.content != null) return this.content;
		this.content = '';
		for(const messageIdent of this.messageIdentList) {
			const identifier = messageIdent.id.replace(/=/, ''); // strip = from identifiers
			const description = (messageIdent.description || '').split(/\r?\n\r?/).join('\n# ');
			const translation = messageIdent.defaultMessage.split(/\r?\n\r?/).join('\n\t');
			this.content += (description.length > 0) ?
				`# ${description}\n${identifier} = ${translation}\n` :
				`${identifier} = ${translation}\n`;
		}
		return this.content;
	}

	size() {
		return this.source().length;
	}

	getMessageIdents() {
		if(this.messageIdentList != null) return this.messageIdentList;
		const lines = this.content.split(/\n/);
		return this.messageIdentList = Array.from(parser(lines));
	}

	constructor(messageIdentList, content) {
		this.messageIdentList = messageIdentList;
		this.content = content;
	}

	static fromMessageIdentList(messageIdentList) {
		return new TranslationFile(messageIdentList, null);
	}

	static fromContent(content) {
		return new TranslationFile(null, content);
	}
}

export {
	TranslationFile
};