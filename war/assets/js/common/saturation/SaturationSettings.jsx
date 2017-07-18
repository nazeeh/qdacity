import SaturationWeights from '../saturation/SaturationWeights'

        export default class SaturationSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        if (this.props.saturationParameters) {
            this.drawTable();
        }
    }

    drawTable() {
        if (typeof this.props.saturationParameters !== 'undefined') {
            var saturationWeightsNames = new SaturationWeight(this.props.saturationParameters).getNameAndWeightsArray();
            for (var i in saturationWeightsNames) {
                $("#saturationOptionsTable").find("tbody").append("<tr><td>" + saturationWeightsNames[i][0] + "</td><td>" + this.toPercent(saturationWeightsNames[i][1]) + "</td></tr>");
                //TODO saturation ab xx%
            }
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