import GoogleLineChart from '../GoogleLineChart.jsx';
import SaturationAverage from '../saturation/SaturationAverage';

export default class SaturationChart extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.drawChart();
    }
    componentDidUpdate() {
        if (this.props.results) this.drawChart();
    }

    drawChart() {    
        this.options = {
            title: 'Historical Developement of Saturation',
            hAxis: {
                title: 'Time'
            },
            vAxis: {
                title: 'Saturation in percent'
            },
            series: {
                0: {lineWidth: 8} //highlighting the average
            },
            legend: {position: 'bottom'}
        };

        this.data = new google.visualization.DataTable();
        this.data.addColumn('date', 'X');
        this.data.addColumn('number', 'Weighted Average');
        this.data.addColumn('number', 'Applied Codes');
        this.data.addColumn('number', 'Deleted Code Relationships');
        this.data.addColumn('number', 'Deleted Codes');
        this.data.addColumn('number', 'New Documents');
        this.data.addColumn('number', 'New Code Relationships');
        this.data.addColumn('number', 'New Codes');
        this.data.addColumn('number', 'Relocated Codes');
        this.data.addColumn('number', 'Code Author Changes');
        this.data.addColumn('number', 'CodeBookEntry Definition Changes');
        this.data.addColumn('number', 'CodeBookEntry Exaple Changes');
        this.data.addColumn('number', 'CodeBookEntry Short Definition Changes');
        this.data.addColumn('number', 'CodeBookEntry When Not To Use Changes');
        this.data.addColumn('number', 'CodeBookEntry When To Use Changes');
        this.data.addColumn('number', 'Code Color Changes');
        this.data.addColumn('number', 'Code Memo Changes');
        this.data.addColumn('number', 'Code Name Changes');

        var rows = [];
        for (var i in this.props.results) {
            var sat = this.props.results[i];
            var oneDataSet = [new Date(sat.creationTime),
                new SaturationAverage(sat).calculateAvgSaturation(false),
                sat.applyCodeSaturation,
                sat.deleteCodeRelationShipSaturation,
                sat.deleteCodeSaturation,
                sat.documentSaturation,
                sat.insertCodeRelationShipSaturation,
                sat.insertCodeSaturation,
                sat.relocateCodeSaturation,
                sat.updateCodeAuthorSaturation,
                sat.updateCodeBookEntryDefinitionSaturation,
                sat.updateCodeBookEntryExampleSaturation,
                sat.updateCodeBookEntryShortDefinitionSaturation,
                sat.updateCodeBookEntryWhenNotToUseSaturation,
                sat.updateCodeBookEntryWhenToUseSaturation,
                sat.updateCodeColorSaturation,
                sat.updateCodeMemoSaturation,
                sat.updateCodeNameSaturation,
            ];
            rows.push(oneDataSet);
        }
        this.data.addRows(rows);

        var chart = new GoogleLineChart({"data": this.data, "options": this.options, "graphID": 'saturationChart'});
        chart.drawChart();
    }

    render() {
        return (<GoogleLineChart key={'saturationChart-' + this.props.projectId} graphID={'saturationChart'} data={this.data} options={this.options}/>);
    }
}
