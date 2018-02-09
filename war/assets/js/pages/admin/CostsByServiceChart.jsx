import React from "react";

import GooglePieChart from "../../common/GooglePieChart.jsx";
import ChartTimeFrameChooser from "./ChartTimeFrameChooser.jsx";
import IntlProvider from "../../common/Localization/LocalizationProvider";
import BillingStatsEndpoint from "../../common/endpoints/BillingStatsEndpoint";

export default class CostsByServiceChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      googleChartsLoaded: false,
      costsByService: null,
      startDate: null,
      endDate: null
    };

    this.props.chartScriptPromise.then(() => {
      google.charts.load("current", {
        packages: ["corechart"]
      });

      google.charts.setOnLoadCallback(() => {
        this.setState({
          googleChartsLoaded: true
        });
      });
    });
  }

  fetchCostsByService() {
    BillingStatsEndpoint.getCostsByService(
      this.state.startDate,
      this.state.endDate
    ).then(result => {
      result.serviceCosts = result.serviceCosts || {};
      this.setState({
        costsByService: result.serviceCosts
      });
    });
  }

  getDataRows(costsByService) {
    const result = [];
    Object.keys(costsByService).forEach(key => {
      result.push([key, costsByService[key]]);
    });

    return result;
  }

  setTimeFrame(startDate, endDate) {
    this.setState(
      {
        startDate: startDate,
        endDate: endDate,
        costsByService: null
      },
      () => this.fetchCostsByService()
    );
  }

  renderChart() {
    const data = new google.visualization.DataTable();

    const { formatMessage } = IntlProvider.intl;

    data.addColumn(
      "string",
      formatMessage({
        id: "costs_by_service_chart.service",
        defaultMessage: "Service"
      })
    );
    data.addColumn(
      "number",
      formatMessage({
        id: "costs_by_service_chart.costs",
        defaultMessage: "Costs"
      })
    );

    data.addRows(this.getDataRows(this.state.costsByService));

    const options = {
      pieHole: 0.4,
      width: 540,
      height: 400,
      chartArea: {
        left: 70,
        right: 0,
        top: 10
      }
    };

    data.sort([{ column: 1, desc: true }]);

    return (
      <GooglePieChart
        graphID="costsByServiceChart"
        data={data}
        options={options}
      />
    );
  }

  render() {
    return (
      <div>
        <ChartTimeFrameChooser
          onChangeTimeFrame={(startDate, endDate) =>
            this.setTimeFrame(startDate, endDate)
          }
        />
        {this.state.googleChartsLoaded &&
        this.state.costsByService &&
        this.state.startDate &&
        this.state.endDate
          ? this.renderChart()
          : null}
      </div>
    );
  }
}
