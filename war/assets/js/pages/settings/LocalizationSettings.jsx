//@ts-check
import React, { Component } from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import {
	FormattedMessage,
	FormattedDate,
	FormattedRelative,
	FormattedTime,
	FormattedNumber
} from 'react-intl';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Flex = styled.div`
	display: flex;
`;

const RowFlow = Flex.extend`
	flex-direction: column;
	align-items: flex-start;
`;

const ColumnFlow = Flex.extend`
	flex-direction: row;
	align-items: center;
`;

const Box = RowFlow.extend`
	padding: 10px;
	outline: 1px solid ${props => props.theme.borderDefault};
	background: ${props => props.theme.defaultPaneBg};
`;

const Slant = styled.span`
	color: rgba(0, 0, 0, 0.7);
`; // TODO: move to theme

const SectionContent = ColumnFlow.extend`
	margin-top: 20px;
	margin-left: 30px;
	width: 100%;
	flex-wrap: wrap;
	justify-content: space-evenly;
`;

const Item = ColumnFlow.extend`
	justify-content: space-evenly;
	padding: 10px;
	background: #cccccc33;
`; // Todo move to theme

const SectionTitle = styled.h2`
	width: 100%;
	padding-bottom: 7px;
	margin: 0px;
	border-bottom: 1px solid ${props => props.theme.borderDefault};
`;

const Spacer = styled.div`
	width: 30px;
`;

const Category = Box.extend`
	margin-top: 30px;
`;

export default class LocalizationSettingsPage extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			locale: props.locale,
			language: props.language,
			messages: props.messages
		};
		this.previewProvider = { language: IntlProvider.language };
	}

	componentWillReceiveProps(props) {
		this.getIntlUpdate(props);
	}

	getIntlUpdate(props) {
		const { locale, language, messages } = props;
		let update = false,
			updatePreview = false;
		if (this.state.locale != locale) updatePreview = true;
		if (this.state.language != language) update = true;
		this.setState(
			{
				locale: locale,
				language: language,
				messages: messages
			},
			() => {
				if (update) this.forceUpdate();
				else if (updatePreview) this.previewProvider.forceUpdate();
			}
		);
	}

	getRegionOptions() {
		const language = this.previewProvider.language;
		const selectedRegion = this.previewProvider.locale;
		const regionCodeSet = IntlProvider.getRegionsForLanguage(language);
		if (regionCodeSet.length == 0)
			return <option value="en-US">United States</option>;
		const regions = Array.from(regionCodeSet)
			.map(regionCode => [
				`${language}-${regionCode}`,
				IntlProvider.getNameOfRegion(regionCode)
			])
			.filter(x => x[1] != undefined)
			.map(regionInfo => {
				const [regionCode, regionName] = regionInfo;
				const props = {};
				if (regionCode == selectedRegion) props.selected = true;
				return (
					<option {...props} value={regionCode}>
						{regionName}
					</option>
				);
			});
		return regions;
	}

	getLanguageOptions() {
		const languages = IntlProvider.supportedLanguages;
		const selectedLanguage = this.previewProvider.language;
		return Array.from(languages).map(language => {
			const props = {};
			if (language == selectedLanguage) props.selected = true;
			return (
				<option value={language} {...props}>
					{IntlProvider.getNameOfLanguage(language)}
				</option>
			);
		});
	}

	applyDisplaySettings() {
		const selectedLanguage = this.previewProvider.language;
		const selectedRegion = this.previewProvider.locale.split('-', 2)[1];

		localStorage.setItem('language', `${selectedLanguage}-${selectedRegion}`);
		IntlProvider.changeLanguage(selectedLanguage, selectedRegion);
	}

	render() {
		return (
			<div className="container main-content">
				<Category>
					<SectionTitle>
						<FormattedMessage id="settings.display" defaultMessage="Display" />
					</SectionTitle>
					<SectionContent>
						<Item>
							<div>
								<FormattedMessage
									id="settings.language"
									defaultMessage="Language"
								/>
							</div>
							<Spacer />
							<div>
								<select
									onChange={event => {
										this.previewProvider
											.changeLanguage(event.target.value)
											.then(() => this.forceUpdate());
									}}
								>
									{this.getLanguageOptions()}
								</select>
							</div>
						</Item>
						<Item>
							<div>
								<FormattedMessage
									id="settings.region"
									defaultMessage="Region"
								/>
							</div>
							<Spacer />
							<div>
								<select
									onChange={event => {
										this.previewProvider
											.changeLocale(event.target.value)
											.then(() => this.previewProvider.forceUpdate());
									}}
								>
									{this.getRegionOptions()}
								</select>
							</div>
						</Item>
						<Item>
							<IntlProvider
								app={this}
								messages={this.state.messages}
								language={this.state.language}
								locale={this.state.locale}
								isGlobal={false}
								ref={provider => (this.previewProvider = provider)}
							>
								<div>
									<span>
										<FormattedMessage id="preview" defaultMessage="Preview" />:
									</span>
									<div>
										<FormattedDate
											year="numeric"
											month="long"
											day="2-digit"
											value={new Date()}
										/>{' '}
										<FormattedTime value={new Date()} /> <br />
										<FormattedRelative
											updateInterval="1"
											style="best fit"
											value={new Date()}
										/>
									</div>
									<div>
										<FormattedNumber value="100000" /> <br />
										<FormattedNumber
											value="100000"
											style="currency"
											currency="$"
										/>{' '}
										<br />
										<FormattedNumber value="12.3333" style="percent" />
									</div>
								</div>
							</IntlProvider>
						</Item>
					</SectionContent>
					<button onClick={() => this.applyDisplaySettings()}>
						<FormattedMessage id="modal.apply" defaultMessage="Apply" />
					</button>
				</Category>
			</div>
		);
	}

	static get propTypes() {
		return {
			auth: PropTypes.object.isRequired
		};
	}
}
