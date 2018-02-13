///@ts-check
/// <reference types="react-intl" />
import { IntlProvider, intlShape } from 'react-intl';
import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * This module wraps the react-intl extension in a
 * global instance to allow global usage of translations
 * even outside of application context or in other trees of the
 * application forest.
 */

const globalLocalizationState = {
	/** @type {ReactIntl.InjectedIntl} */
	intl: undefined,
	/** @type {Set<String>} */
	supportedLanguages: new Set(['en'])
};

/**
 * Load messages from *compiled* json file
 * @param {String} [language=en] language to load
 * @returns {Promise<JSON?>}
 */
async function loadMessages(language = 'en') {
	try {
		const response = await fetch(`dist/messages/${language}.json`);
		if (response.ok) return await response.json();
		throw response.statusText;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export default class LocalizationProvider extends IntlProvider {
	constructor(
		props,
		context = {
			intl: LocalizationProvider.intl
		}
	) {
		super(props, context);
		globalLocalizationState.intl = this.getChildContext().intl;
		if (window['QDAcityLocalization'] == undefined) {
			window['QDAcityLocalization'] = this;
			const fallbackLanguage = LocalizationProvider.userLanguage;
			this.changeLanguage(fallbackLanguage);
		}
	}

	componentDidUpdate() {
		// update state to our globalLocalization object
		// this is required, so that modals show new language on next invocation
		globalLocalizationState.intl = this.getChildContext().intl;
	}

	/*static get contextTypes() {
		return {
			intl: intlShape
		};
	}

	static get childContextTypes() {
		return {
			intl: intlShape.isRequired
		};
	}*/

	static get propTypes() {
		return {
			app: PropTypes.element.isRequired
		};
	}

	/**
	 * returns current instance of intl
	 */
	static get intl() {
		return globalLocalizationState.intl;
	}

	/**
	 * Checks if language is in list of existing languages
	 * @param {String} language
	 * @returns {boolean}
	 */
	static isSupportedLanguage(language) {
		return globalLocalizationState.supportedLanguages.has(language);
	}

	/**
	 * Changes application language to requested language (if available)
	 * @param {String} language language to load
	 */
	async changeLanguage(language = 'en') {
		if (!LocalizationProvider.isSupportedLanguage(language)) return;
		const json = await loadMessages(language);
		//@ts-ignore
		this.props.app.setState({
			messages: json,
			language: language
		});
	}

	/**
	 * @returns {String} language that the user agent is requesting
	 */
	static get userLanguage() {
		// @ts-ignore
		const localeOrLanguage =
			navigator.language || navigator.browserLanguage || 'en-US';
		const language = localeOrLanguage.split('-', 2).shift();
		return language;
	}
}
