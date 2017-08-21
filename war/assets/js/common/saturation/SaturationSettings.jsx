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
                    let key = 'catKey-'+i;
                    let id = 'catId-'+i;
                    saturationSettings.push(<SaturationCategorySettings catIdx={satWeights.getArtificialCategoryIndex(cat)} key={key} id={id} category={cat} saturationParameters={this.state.saturationParameters} ></SaturationCategorySettings>);
                    i = i+1;
                }

		return (<div>
            <p><b>Saturation Configuration</b></p>
            <p>Default interval for saturation: <input id="saturation-interval" type="number" min="1" max="20"  defaultValue={this.state.saturationParameters.lastSatResults} /> revisions</p>
            <table id="saturationOptionsTable" className="display" width="100%">
                <thead>
                    <tr><th width="50%">Change</th><th width="25%">Weight in %</th><th width="25%">Saturation at XX%</th></tr>
                </thead>
            </table>
            <div>
                    {saturationSettings}
            </div>
        </div>
        );
	}

}