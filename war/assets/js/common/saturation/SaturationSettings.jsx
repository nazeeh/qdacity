import React from 'react';
import {
	FormattedMessage
} from 'react-intl';

import SaturationWeights from '../saturation/SaturationWeights.js'
import SaturationCategorySettings from '../saturation/SaturationCategorySettings.jsx'

export default class SaturationSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projectId: props.projectId,
			saturationParameters: undefined
		};
	}

	componentDidMount() {
		this.init();
	}

	init() {
		var _this = this;
		gapi.client.qdacity.saturation.getSaturationParameters({
			'projectId': this.state.projectId
		}).execute(function (resp) {
			_this.setState({
				saturationParameters: resp
			});
		});
	}

	toPercent(value) {
		if (value != 'undefined')
			return (value * 100).toFixed(2);
		else
			return -1;
	}

	render() {
		if (!this.state.saturationParameters)
			return null;

		var satWeights = new SaturationWeights(this.state.saturationParameters);
		var satCategories = satWeights.getCategorizedArray();
		let saturationSettings = [];
		var i = 0;
		for (var cat in satCategories) {
			let key = 'catKey-' + i;
			let id = 'catId-' + i;
			saturationSettings.push(<SaturationCategorySettings catIdx={satWeights.getArtificialCategoryIndex(cat)} key={key} id={id} category={cat} saturationParameters={this.state.saturationParameters} ></SaturationCategorySettings>);
			i = i + 1;
		}

		return (<div>
			<p><b><FormattedMessage id='saturationsettings.saturation_configuration' defaultMessage='Saturation Configuration' /></b></p>
			<p>
			<FormattedMessage
				id='saturationsettings.saturation_interval'
				defaultMessage='Default interval for saturation: {revisions} {lastSatResults, plural, one {revision} other {revisions}}'
				values={{
					revisions: <input id="saturation-interval" type="number" min="1" max="20"  defaultValue={this.state.saturationParameters.lastSatResults} />,
					lastSatResults: this.state.saturationParameters.lastSatResults
				}}
			/>
			</p>
            <table id="saturationOptionsTable" className="display" width="100%">
                <thead>
                    <tr><th width="50%"><FormattedMessage id='saturationsettings.change' defaultMessage='Change' /></th><th width="25%"><FormattedMessage id='saturationsettings.weight' defaultMessage='Weight in %' /></th><th width="25%"><FormattedMessage id='saturationsettings.saturation' defaultMessage='Saturation at XX%' /></th></tr>
                </thead>
            </table>
            <div>
                    {saturationSettings}
            </div>
        </div>);
	}

}