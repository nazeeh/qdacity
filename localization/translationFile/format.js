import {TFStates, TFSyntax} from './constants';

function *parser(lines) {
	let messageIdent = {};
	for(const token of tokenizer(lines)) {
		switch(token.type) {
			case TFSyntax.COMMENT:
				if (messageIdent.defaultMessage != undefined) {
					yield messageIdent;
					messageIdent = {};
				}
				if(messageIdent.description == undefined) {
					messageIdent.description = token.value;
				} else {
					messageIdent.description += `\n${token.value}`;
				}
				break;
			case TFSyntax.KEY:
				if (messageIdent.defaultMessage != undefined) {
					yield messageIdent;
					messageIdent = {};
				}
				if(messageIdent.id == undefined) {
					messageIdent.id = token.value;
				} else {
					messageIdent.id += token.value;
				}
				break;
			case TFSyntax.VALUE:
				if(messageIdent.defaultMessage == undefined) {
					messageIdent.defaultMessage = token.value;
				} else {
					messageIdent.defaultMessage += `\n${token.value}`;
				}
				break;
		}
	}
	if(messageIdent.defaultMessage) {
		yield messageIdent;
	}
}

function* tokenizer(lines) {
	let state = TFStates.START;
	for(const line of lines) {
		if (line.trim() == '') continue;
		if (line.match(/^#/)) {
			yield {type: TFSyntax.COMMENT, value: line.replace(/^\s*#/, '')};
		} else if (line.match(/^\w/) && !line.match(/=/)) {
			yield { type: TFSyntax.KEY, value: line.trim() };
			state = TFStates.KEY;
		} else if(line.match(/^\w/) && line.match(/=/)) {
			const [key, ...values] = line.split(/=/);
			yield {type: TFSyntax.KEY, value: key.trim()};
			yield {type: TFSyntax.VALUE, value: values.join('=').trimLeft()};
			state = TFStates.VALUE;
		} else if(line.match(/^\s/)) {
			const trimmed = line.substr(1); // remove indent
			if (trimmed.length == 0) continue;
			if(state == TFStates.START) {
				yield { type: TFSyntax.KEY, value: trimmed };
			} else if(state == TFStates.VALUE) {
				yield {type: TFSyntax.VALUE, value: trimmed};
			}
		} else {
			throw new Error(`Invalid Syntax near '${line}'`);
		}
	}
}

export {
	tokenizer,
	parser
};