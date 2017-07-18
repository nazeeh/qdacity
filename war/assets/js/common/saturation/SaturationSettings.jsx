import SaturationWeights from '../saturation/SaturationWeights.js'

        export default class SaturationSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {projectId: props.projectId, saturationParameters: undefined};
    }

    componentDidMount() {
        this.init();
    }


    init() {
        var _this = this;
        gapi.client.qdacity.saturation.getSaturationParameters({
            'projectId': this.state.projectId
        }).execute(function (resp) {
            _this.state.saturationParameters = resp;
            _this.drawTable(resp);
        });
    }

    drawTable(saturationParameters) {
        var saturationWeightsNames = new SaturationWeights(saturationParameters).getNameAndWeightsArray();
        for (var i in saturationWeightsNames) {
            
            //TODO data table?
            $("#saturationOptionsTable").find("tbody").append("<tr><td>" + saturationWeightsNames[i][0] + "</td><td>" + this.toPercent(saturationWeightsNames[i][1]) + "</td></tr>");
            //TODO saturation ab xx%
            $("#saturationOptionsTable").find("tbody").html();
        }

    }

    toPercent(value) {
        return (value * 100).toFixed(2);
    }

    render() {
        if (!this.props.saturationParameters)
            return null;
        return(<div>
            <p><b>Saturation Configuration</b></p>
            <p>Default interval for saturation: <input id="interval" type="number" value="-1" min="1" max="20"  defaultValue="-1" /> revisions</p>
            <table id="saturationOptionsTable" className="display">
                <thead>
                    <tr><th>Change</th><th>Weight in %</th><th>Saturation at XX%</th></tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>);
    }

}