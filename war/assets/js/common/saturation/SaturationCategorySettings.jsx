import SaturationWeights from '../saturation/SaturationWeights';

export default class SaturationCategorySettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanded: false,
            category: props.category,
            saturationParameters: props.saturationParameters
        };
    }

    toggleIsExpanded() {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    toPercent(value) {
        if (value != 'undefined')
            return (value * 100).toFixed(2);
        else
            return -1;
    }

    render() {
        var satWeights = new SaturationWeights(this.state.saturationParameters);
        var satNameWeights = satWeights.getNameAndWeightsArray();
        var catIndices = satWeights.getCategorizedArray()[this.state.category];
        let collapsibleText = "[-]";
        let rows = [];
        if (this.state.isExpanded) {
            for (var i in catIndices) {
                var id = catIndices[i];
                let rowID = `row${id}`
                let rowkey = `key${id}`

                let cell = [];
                for (var idx = 0; idx < 3; idx++) {
                    let cellID = `cell${id}-${idx}`
                    let inputId = cellID + '-input';
                    if (idx > 0) {
                        cell.push(<td width="25%" key={cellID} id={cellID}><input id={inputId} type="number"  min="0" max="100"  defaultValue={this.toPercent(satNameWeights[catIndices[i]][idx])} /></td>);
                    } else {
                        cell.push(<td width="50%" key={cellID} id={cellID} >{satNameWeights[catIndices[i]][idx]}</td>);
                    }
                }
                rows.push(<tr id={rowID} key={rowkey} >{cell}</tr>);
            }
        } else {
            let cell = [];
            collapsibleText = "[+]";
            let avgWeights = 0;
            let avgMax = 0;
            for (var i in catIndices) {
                avgWeights = avgWeights + satNameWeights[catIndices[i]][1];
                avgMax = avgMax + satNameWeights[catIndices[i]][2];
            }
            avgWeights = avgWeights / catIndices.length;
            avgMax = avgMax / catIndices.length;

            let label = this.state.category + " (Average):";
            cell.push(<td width="50%" >{label}</td>);
            cell.push(<td width="25%"><input  type="number"  min="0" max="100"  defaultValue={this.toPercent(avgWeights)} /></td>);
            cell.push(<td width="25%"><input  type="number"  min="0" max="100"  defaultValue={this.toPercent(avgMax)} /></td>);
            rows.push(<tr>{cell}</tr>);
        }

        let fullCollapsibleText = this.props.category + " " + collapsibleText;
        return(<div>
        <p onClick={() => this.toggleIsExpanded()} style={{cursor: 'pointer'}} >
            <b>{fullCollapsibleText}</b>
        </p>
        <table id="saturationOptionsTable" className="display" width="100%">
    
            <tbody>
                {rows}
            </tbody>
        </table>
    </div>
                    );
        }
    }