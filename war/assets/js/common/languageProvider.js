'use strict';

const supportedLanguages = new Set([
	'de',
	'en'
]);

function loadMessages(reactComponent, language = 'en') {

	fetch(`assets/translations/${language}.json`).then(resp => {
		if (resp.ok) {
			return resp.json();
		}
		throw resp.statusText;
	}).then(json => {
		reactComponent.setState({
			messages: json,
			language: language
		});
	}).catch(error => console.error(error));
}

function isSupportedLanguage(language) {
	return supportedLanguages.has(language);
}

export {
	loadMessages,
	isSupportedLanguage
};