import 'script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js';
import SaturationWeights from '../saturation/SaturationWeights';
import SaturationAverage from '../saturation/SaturationAverage';
import SaturationCategoryDetail from '../saturation/SaturationCategoryDetail.jsx';

export default class SaturationDetails extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.initTable();
    }
    componentDidUpdate() {
        if (this.props.saturation) {
            this.initTable();
            this.drawDataTable();
        }
    }

    initTable() {
        var dataSet = [];
        var tableMount = $('#saturationTable');
        var columnsArray = [];
        var columnLabelsArray = ['Change Category', 'Saturation', 'Weight (Importance)', 'Configured Maximum'];
        var width = 100 / (columnLabelsArray.length);
        for (var col in columnLabelsArray) {
            columnsArray = columnsArray.concat([{
                    "title": columnLabelsArray[col],
                    "width": "" + width + "%"
                }]);

        }

        var table = tableMount.dataTable({
            "paging": false,
            "scrollY": "170px",
            "bLengthChange": false,
            "data": dataSet,
            "autoWidth": false,
            "columns": columnsArray,
            "aaSorting": [
                [1, 'asc'],
                [2, 'desc']
            ],
        });
    }

    drawDataTable() {
        if (typeof this.props.saturation !== 'undefined') {
            var table = $('#saturationTable').DataTable();
            table.clear();

            var saturationWeights = new SaturationWeights(this.props.saturation.saturationParameters);
            var satCategories = saturationWeights.getCategorizedArray();
            var satAvg = new SaturationAverage(this.props.saturation);

            for (var i in satCategories) {
                var categoryAvg = satAvg.averageForCategory(i);
                table.row.add([i, this.toPercent(categoryAvg[0]), this.toPercent(categoryAvg[1]), this.toPercent(categoryAvg[2])]);
                //table.row.add([saturationNameAndWeightsAndSaturation[i][0], this.toPercent(saturationNameAndWeightsAndSaturation[i][3]), this.toPercent(saturationNameAndWeightsAndSaturation[i][1]), this.toPercent(saturationNameAndWeightsAndSaturation[i][2]), saturationWeights.getCategoryForIndex(i)]);
            }

            var _this = this;
            $('#saturationTable tbody').on('click', 'tr', function () {
                var categoryId = $(this).find("td").eq(0).html();
                var saturationCatDetails = new SaturationCategoryDetail(saturationWeights.getCompleteCategory(_this.props.saturation, categoryId), categoryId);
                saturationCatDetails.showModal();


            });

            table.draw();

        }
    }

    toPercent(value) {
        return (value * 100).toFixed(2) + "%";
    }

    render() {
        if (!this.props.saturation)
            return null;
        return (<div>
            <p>Last calculation of saturation is from: {this.props.saturation.evaluationStartDate} to {this.props.saturation.creationTime}</p>
            <table id="saturationTable" className="display">
        
            </table>
            <p>Parameters used from : {this.props.saturation.saturationParameters.creationTime}</p>
        </div>
                );
    }

}