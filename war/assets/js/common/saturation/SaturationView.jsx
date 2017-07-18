import SaturationChart from '../saturation/SaturationChart.jsx';
import SaturationDetails from '../saturation/SaturationDetails.jsx';
export default class SaturationView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'results': [],
			'mrSat': undefined
		};
		this.projectId = props.projectId;

		this.showSaturationView();
	}


	showSaturationView() {
		var _this = this;
		gapi.client.qdacity.saturation.getHistoricalSaturationResults({
			'projectId': _this.projectId
		}).execute(function (resp) {
			if (!resp.code) {
				$('#loadingAnimation').addClass('hidden');
				var res = resp.items || [];
				var sat = _this.getMostRecentSaturation(res);
				_this.setState({
					results: res,
					mrSat: sat
				});
			} else {
				// Log error
			}
		});
	}

	getMostRecentSaturation(results) {
		if (results.length > 0) {
			var mostRecenResult = results[0];
			for (var i in results) {
				var myDate = new Date(mostRecenResult.creationTime);
				var otherDate = new Date(results[i].creationTime);
				if (myDate < otherDate) {
					mostRecenResult = results[i];
				}
			}
			return mostRecenResult;
		} else {
			return null;
		}
	}

	render() {
		return (
			<div>
                    <SaturationDetails saturation={this.state.mrSat} />
                    <SaturationChart results={this.state.results} />
                </div>
		);
	}

}