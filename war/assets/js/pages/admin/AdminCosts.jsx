import React from 'react';
import {FormattedMessage} from 'react-intl';

import DailyCostsChart from './DailyCostsChart.jsx';
import DailyCostsPerActiveUserChart from "./DailyCostsPerActiveUserChart.jsx";
import CostsByServiceChart from "./CostsByServiceChart.jsx";

export default class AdminCosts extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-6">
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="adminstats.daily_costs"
										defaultMessage="Daily costs"
									/>
								</h3>
							</div>
							<div className="box-body">
								<DailyCostsChart
									chartScriptPromise={this.props.chartScriptPromise}
								/>
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="adminstats.daily_costs_per_active_user"
										defaultMessage="Daily costs per active user"
									/>
								</h3>
							</div>
							<div className="box-body">
								<DailyCostsPerActiveUserChart
									chartScriptPromise={this.props.chartScriptPromise}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-6">
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="adminstats.costs_by_service"
										defaultMessage="Costs by service"
									/>
								</h3>
							</div>
							<div className="box-body">
								<CostsByServiceChart
									chartScriptPromise={this.props.chartScriptPromise}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
