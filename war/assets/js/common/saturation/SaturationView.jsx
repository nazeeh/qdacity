import SaturationChart from '../saturation/SaturationChart.jsx';
import SaturationDetails from '../saturation/SaturationDetails.jsx';
export default class SaturationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {'results': [], 'mrSat': null};
        this.projectId = props.projectId;
    }

    componentDidMount() {
        this.showSaturationView();
    }
    componentDidUpdate() {
        this.showSaturationView();
    }

    showSaturationView() {
        var _this = this;
        gapi.client.qdacity.saturation.getHistoricalSaturationResults({
            'projectId': _this.projectId
        }).execute(function (resp) {
            if (!resp.code) {
                $('#loadingAnimation').addClass('hidden');
                _this.state.results = resp.items || [];
                _this.state.mrSat = _this.getMostRecentSaturation();
                _this.showDetails();
            } else {
                // Log error
            }
        });
    }

    showDetails() {
        this.prepareDataTable();
        this.drawDiagram();
    }

    drawDiagram() {
        var satChart = new SaturationChart({"results": this.state.results});
        satChart.drawChart();
    }

    getMostRecentSaturation() {
        if (this.state.results.length > 0) {
            var mostRecenResult = this.state.results[0];
            for (var i in this.state.results) {
                var myDate = new Date(mostRecenResult.creationTime);
                var otherDate = new Date(this.state.results[i].creationTime);
                if (myDate < otherDate) {
                    mostRecenResult = this.state.results[i];
                }
            }
            return mostRecenResult;
        } else {
            return null;
        }
    }

    prepareDataTable() {
        var saturationDetails = new SaturationDetails({"saturation": this.state.mrSat});
        saturationDetails.initTable();
        saturationDetails.drawDataTable();
    }

    render() {
        return (
                <div>
                    <SaturationDetails saturation={this.state.saturation} />
                    <SaturationChart results={this.state.results} />
                </div>
                );
    }

}