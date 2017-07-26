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
            _this.setState({saturationParameters: resp});
        });
    }

    toPercent(value) {
        if(value!='undefined')
            return (value * 100).toFixed(2);
        else
            return -1;
    }

    render() {
        if (!this.state.saturationParameters)
            return null;

        let rows = [];
        var saturationWeightsNames = new SaturationWeights(this.state.saturationParameters).getNameAndWeightsArray();
        for (var i in saturationWeightsNames) {
            let rowID = `row${i}`
            let cell = []
            for (var idx = 0; idx < 3; idx++) { 
                let cellID = `cell${i}-${idx}`
                if (idx > 0) {
                    //TODO saturationThreshold
                    cell.push(<td key={cellID} id={cellID}><input type="number"  min="0" max="100"  defaultValue="-1" value={this.toPercent(saturationWeightsNames[i][idx])} /></td>)
                } else {
                    cell.push(<td key={cellID} id={cellID}>{saturationWeightsNames[i][idx]}</td>)
                }
            }
            rows.push(<tr key={i} id={rowID}>{cell}</tr>)
        }
        return(<div>
            <p><b>Saturation Configuration</b></p>
            <p>Default interval for saturation: <input id="interval" type="number" value="-1" min="1" max="20"  defaultValue="-1" /> revisions</p>
            <table id="saturationOptionsTable" className="display">
                <thead>
                    <tr><th>Change</th><th>Weight in %</th><th>Saturation at XX%</th></tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>);
    }

}