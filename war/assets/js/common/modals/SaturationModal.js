import ReactLoading from '../ReactLoading.jsx';
import VexModal from './VexModal';
import SaturationChart from '../saturation/SaturationChart.jsx';
import SaturationDetails from '../saturation/SaturationDetails.jsx';

export default class SaturationModal extends VexModal {

    constructor(projectId) {
        super();
        this.formElements = '';
        this.projectId = projectId;
        this.results;
        this.formElements += '<div id="saturation" style="text-align: center; background-color: #eee; font-color:#222; overflow:hidden; overflow-x: scroll;"><div id="saturationMetaData"></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="saturationTable"></table><div style="height: 350px;" id="saturationChart"></div><div id="loadingAnimation" class="centerParent"><div id="reactLoading" class="centerChild"></div></div></div>';
    }

    showModal() {
        var _this = this;
        var promise = new Promise(
                function (resolve, reject) {

                    var formElements = _this.formElements;
                    var buttonArray = [$.extend({}, vex.dialog.buttons.YES, {
                            text: 'OK'
                        })];
                    vex.dialog.open({
                        message: "Saturation",
                        contentCSS: {
                            width: '900px'
                        },
                        input: formElements,
                        buttons: buttonArray,
                        callback: function (data) {

                            if (data != false) {
                                resolve(data);
                            } else
                                reject(data);
                        }
                    });
                    ReactDOM.render(<ReactLoading color={'#444'} />, document.getElementById('reactLoading'));
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
        );
        return promise;
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