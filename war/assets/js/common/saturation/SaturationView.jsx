import SaturationChart from '../saturation/SaturationChart.jsx';
import SaturationDetails from '../saturation/SaturationDetails.jsx';

export default class SaturationView extends React.Component {
    constructor(props) {
        super(props);
        this.results;
        this.projectId = props.projectId;
    }

    showSaturationView() {
        var _this = this;
        gapi.client.qdacity.saturation.getHistoricalSaturationResults({
            'projectId': _this.projectId
        }).execute(function (resp) {
            if (!resp.code) {
                $('#loadingAnimation').addClass('hidden');
                _this.results = resp.items || [];
                _this.showDetails();
            } else {
                // Log error
            }
        });
    }

    showDetails() {
        this.prepareDataTable();
        var mostRecentSaturation = this.getMostRecentSaturation();
        var saturationOverviewhtml = '';
        saturationOverviewhtml += '<p>Last calculation of saturation is from: ' + mostRecentSaturation.evaluationStartDate + ' to ' + mostRecentSaturation.creationTime + '</p>';
        saturationOverviewhtml += '<p>Parameters used from : ' + mostRecentSaturation.saturationParameters.creationTime + '</p>';
        $('#saturationMetaData').html(saturationOverviewhtml);

        this.drawDiagram();
    }

    drawDiagram() {
        ReactDOM.render(<SaturationChart key={'saturationChart-' + this.projectId} projectId={'saturationChart'} results={this.results} />, document.getElementById('saturationChart'));
    }

    getMostRecentSaturation() {
        if (this.results.length > 0) {
            var mostRecenResult = this.results[0];
            for (var i in this.results) {
                var myDate = new Date(mostRecenResult.creationTime);
                var otherDate = new Date(this.results[i].creationTime);
                if (myDate < otherDate) {
                    mostRecenResult = this.results[i];
                }
            }
            return mostRecenResult;
        } else {
            return null;
        }
    }

    prepareDataTable() {
        var saturation = this.getMostRecentSaturation();
        var saturationDetails = new SaturationDetails({"saturation": saturation});
        saturationDetails.drawDataTable();
    }
}