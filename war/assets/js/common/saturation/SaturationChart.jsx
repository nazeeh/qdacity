import React from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import GoogleLineChart from '../GoogleLineChart.jsx';
import SaturationAverage from '../saturation/SaturationAverage';

export default class SaturationChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.drawChart();
	}
	componentDidUpdate() {
		// TODO: check if this blocks a redraw on language change
		if (this.props.results) this.drawChart();
	}

	drawChart() {
		const { formatMessage } = IntlProvider.intl;
		this.options = {
			title: formatMessage({
				id: 'saturationchart.historic_development',
				defaultMessage: 'Historical Developement of Saturation'
			}),
			hAxis: {
				title: formatMessage({
					id: 'saturationchart.time',
					defaultMessage: 'Time'
				})
			},
			vAxis: {
				title: formatMessage({
					id: 'saturationchart.saturation',
					defaultMessage: 'Saturation in percent'
				})
			},
			series: {
				0: {
					lineWidth: 8
				} //highlighting the average
			},
			legend: {
				position: 'bottom'
			}
		};

		this.data = new google.visualization.DataTable();
		this.data.addColumn('date', 'X');
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.weighted_average',
				defaultMessage: 'Weighted Average'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.applied_codes',
				defaultMessage: 'Applied Codes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.deleted_code_relationships',
				defaultMessage: 'Deleted Code Relationships'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.deleted_codes',
				defaultMessage: 'Deleted Codes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.new_documents',
				defaultMessage: 'New Documents'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.new_code_relationships',
				defaultMessage: 'New Code Relationships'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.new_codes',
				defaultMessage: 'New Codes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.relocated_codes',
				defaultMessage: 'Relocated Codes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.code_author_changes',
				defaultMessage: 'Code Author Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.codebookentry_definition_changes',
				defaultMessage: 'CodeBookEntry Definition Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.codebookentry_example_changes',
				defaultMessage: 'CodeBookEntry Example Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.codebookentry_short_definition_changes',
				defaultMessage: 'CodeBookEntry Short Definition Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.codebookentry_when_not_to_use_changes',
				defaultMessage: 'CodeBookEntry When Not To Use Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.codebookentry_when_to_use_changes',
				defaultMessage: 'CodeBookEntry When To Use Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.code_color_changes',
				defaultMessage: 'Code Color Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.code_memo_changes',
				defaultMessage: 'Code Memo Changes'
			})
		);
		this.data.addColumn(
			'number',
			formatMessage({
				id: 'saturationchart.code_name_changes',
				defaultMessage: 'Code Name Changes'
			})
		);

		var rows = [];
		for (var i in this.props.results) {
			var sat = this.props.results[i];
			var oneDataSet = [
				new Date(sat.creationTime),
				new SaturationAverage(sat).calculateAvgSaturation(false),
				sat.applyCodeSaturation,
				sat.deleteCodeRelationShipSaturation,
				sat.deleteCodeSaturation,
				sat.documentSaturation,
				sat.insertCodeRelationShipSaturation,
				sat.insertCodeSaturation,
				sat.relocateCodeSaturation,
				sat.updateCodeAuthorSaturation,
				sat.updateCodeBookEntryDefinitionSaturation,
				sat.updateCodeBookEntryExampleSaturation,
				sat.updateCodeBookEntryShortDefinitionSaturation,
				sat.updateCodeBookEntryWhenNotToUseSaturation,
				sat.updateCodeBookEntryWhenToUseSaturation,
				sat.updateCodeColorSaturation,
				sat.updateCodeMemoSaturation,
				sat.updateCodeNameSaturation
			];
			rows.push(oneDataSet);
		}
		this.data.addRows(rows);

		var chart = new GoogleLineChart({
			data: this.data,
			options: this.options,
			graphID: 'saturationChart'
		});
		chart.drawChart();
	}

	render() {
		return (
			<GoogleLineChart
				key={'saturationChart-' + this.props.projectId}
				graphID={'saturationChart'}
				data={this.data}
				options={this.options}
			/>
		);
	}
}
