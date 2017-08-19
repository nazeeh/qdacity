import SaturationWeights from '../saturation/SaturationWeights.js'

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

		let rows = [];
		var satWeights = new SaturationWeights(this.state.saturationParameters);
		var saturationWeightsNames = satWeights.getNameAndWeightsArray();
		var satCategories = satWeights.getCategorizedArray();
                var catId = 0;
		for (var cat in satCategories) {
                        let catHtmlClass= "category-"+catId;
                        catId = catId +1;
			rows.push(<tr data-toggle="collapse" data-target={catHtmlClass} classname="accordion-toggle" ><th colspan="3">{cat} <span>+</span></th></tr>);
			for (var catIdx in satCategories[cat]) {
				var i = satCategories[cat][catIdx];
				let rowID = `row${i}`
				let cell = []
				for (var idx = 0; idx < 3; idx++) {
					let cellID = `cell${i}-${idx}`
					let inputId = cellID + '-input';
					if (idx > 0) {
						cell.push(<td key={cellID} id={cellID}><input id={inputId} type="number"  min="0" max="100"  defaultValue={this.toPercent(saturationWeightsNames[i][idx])} /></td>)
					} else {
						cell.push(<td key={cellID} id={cellID}>{saturationWeightsNames[i][idx]}</td>)
					}
				}
				rows.push(<tr class={catHtmlClass} key={i} id={rowID}>{cell}</tr>)
			}
		}

		return (<div>
            <p><b>Saturation Configuration</b></p>
            <p>Default interval for saturation: <input id="saturation-interval" type="number" min="1" max="20"  defaultValue={this.state.saturationParameters.lastSatResults} /> revisions</p>
            <table id="saturationOptionsTable" className="display">
                <thead>
                    <tr><th>Change</th><th>Weight in %</th><th>Saturation at XX%</th></tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
        );
	}

}