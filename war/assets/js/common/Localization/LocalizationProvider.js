///@ts-check
/// <reference types="react-intl" />
import { IntlProvider, intlShape, addLocaleData } from 'react-intl';
import { Component } from 'react';
import PropTypes from 'prop-types';
import Countries from './countries.js';
import Languages from './languages.js';

/* load supported locale.
	can be changed to dynamic loading
	if amount of supported locales is getting huge
*/
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';

class LocalizationProvider extends IntlProvider {
	constructor(
		props,
		context = {
			intl: LocalizationProvider.intl
		}
	) {
		super(props, context);
		if (this.props.isGlobal) {
			globalLocalizationState.singleton = this;
			globalLocalizationState.intl = this.getChildContext().intl;

			// for debug purposes
			window['QDAcityLocalization'] = this;

			const [fallbackLanguage, fallbackRegion] = LocalizationProvider.userLocale;
			this.changeLanguage(fallbackLanguage, fallbackRegion);
		}
		this.app = this.props.app || this;
	}

	componentDidUpdate() {
		// update state to our globalLocalization object
		// this is required, so that modals show new language on next invocation
		globalLocalizationState.intl = this.getChildContext().intl;
	}

	static get contextTypes() {
		return {
			intl: intlShape
		};
	}

	static get childContextTypes() {
		return {
			intl: intlShape.isRequired
		};
	}

	static get propTypes() {
		return {
			app: PropTypes.element,
			language: PropTypes.string.isRequired,
			locale: PropTypes.string.isRequired,
			messages: PropTypes.object.isRequired,
			isGlobal: PropTypes.bool.isRequired,
		};
	}

	/**
	 * returns current instance of 'global' localization provider.
	 */
	static get instance() {
		return globalLocalizationState.singleton;
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
	 * Checks if locale is loaded
	 * @param {String} locale
	 * @returns {boolean}
	 */
	static isSupportedLocale(locale) {
		const [language, region] = locale.split('-', 2);
		if(!globalLocalizationState.supportedLocales.has(language)) return false;
		return globalLocalizationState.supportedLocales.get(language).has(region);
	}

	/**
	 * Changes application language to requested language (if available)
	 * @param {String} language language to load
	 */
	async changeLanguage(language = 'en', region = null) {
		if (!LocalizationProvider.isSupportedLanguage(language)) return;
		await loadMessages(language, json => {
			if (!region) {
				const regions = LocalizationProvider.getRegionsForLanguage(language);
				region = Array.from(regions).shift();
			}
			if (region == undefined) {
				language = 'en';
				region = 'US';
			}
			const locale = `${language}-${region}`;
			//@ts-ignore
			this.app.setState({
				messages: json,
				language: language,
				locale: locale
			});
		});
	}

	/**
	 * Changes application locale to requested locale (if available)
	 * @param {String} locale locale to use
	 */
	async changeLocale(locale = 'en-US') {
		if (!LocalizationProvider.isSupportedLocale(locale)) return;
		//@ts-ignore
		this.app.setState({
			locale: locale
		});
	}

	get messages() {
		//@ts-ignore
		return this.props.messages;
	}

	get locale() {
		//@ts-ignore
		return this.props.locale;
	}

	get language() {
		//@ts-ignore
		return this.props.language;
	}

	static get messages() {
		if(!LocalizationProvider.instance) return 'en-US';
		return LocalizationProvider.instance.messages;
	}

	static get locale() {
		if(!LocalizationProvider.instance) return 'en-US';
		return LocalizationProvider.instance.locale;
	}

	static get language() {
		if(!LocalizationProvider.instance) return 'en';
		return LocalizationProvider.instance.language;
	}

	static get supportedLanguages() {
		return globalLocalizationState.supportedLanguages;
	}

	static changeLanguage(language = 'en', region = null) {
		console.log(`Language change to ${language} (${region}) requested`);
		if(!LocalizationProvider.instance) {
			console.error('Global state not initialized');
			return;
		}
		LocalizationProvider.instance.changeLanguage(language, region);
	}

	static changeLocale(locale = 'en-US') {
		console.log(`Locale change to ${locale} requested`);
		if(!LocalizationProvider.instance) {
			console.error('Global state not initialized');
			return;
		}
		LocalizationProvider.instance.changeLocale(locale);
	}

	static getRegionsForLanguage(language = 'en') {
		return globalLocalizationState.supportedLocales.get(language) || [];
	}

	static getNameOfRegion(region = 'US') {
		return globalLocalizationState.countries.get(region);
	}

	static getNameOfLanguage(language = 'en') {
		return globalLocalizationState.languages.get(language);
	}

	/**
	 * @returns {Array<String>} language and region that the user agent is requesting
	 */
	static get userLocale() {
		const nonAccountLanguage = localStorage.getItem('language');
		// Waiting for the account on initial load might be extremely slow.
		// Will not be used for now.
		const accountLanguage = null;
		// @ts-ignore
		const localeOrLanguage = nonAccountLanguage || accountLanguage ||
			navigator.language || navigator.browserLanguage || 'en-US';
		return localeOrLanguage.split('-', 2);
	}

	static get userLanguage() {
		return LocalizationProvider.userLocale.shift();
	}
}


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
	supportedLanguages: new Set(['en', 'de', 'test']),
	supportedLocales: new Map(),
	countries: new Map(Countries),
	/** @type {LocalizationProvider} */
	singleton: null,
	languages: new Map(Languages),
};

/**
 * Initialize locales
 */
// fix missing de-DE locale
///@ts-ignore
de.splice(1, 0, {locale: 'de-DE', parentLocale: 'de'});
addLocaleData([...en, ...de, {locale: 'test-US', parentLocale: 'en-US'}]);

// add test US
globalLocalizationState.supportedLocales.set('test', new Set(['US']));
for (const localeInfo of [].concat(en,de)) {
	const [language, region] = localeInfo.locale.split('-', 2);
	if(!globalLocalizationState.supportedLocales.has(language)) {
		globalLocalizationState.supportedLocales.set(language, new Set());
	}
	if (region != undefined)
		globalLocalizationState.supportedLocales.get(language).add(region);
}

/**
 * Load messages from *compiled* json file
 * @param {String} [language=en] language to load
 * @returns {Promise<JSON?>}
 */
async function loadMessages(language = 'en', callback) {
	try {
		const response = await fetch(`dist/messages/${language}.json`);
		if (response.ok) {
			callback(await response.json());
		} else {
			throw response.statusText;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
}

export default LocalizationProvider;

