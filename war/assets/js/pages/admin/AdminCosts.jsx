import React from 'react';
import {FormattedMessage} from 'react-intl';

import DailyCostsChart from './DailyCostsChart.jsx';
import DailyCostsPerActiveUserChart from "./DailyCostsPerActiveUserChart.jsx";
import CostsByServiceChart from "./CostsByServiceChart.jsx";
import ExtendedCostsByServiceTable from "./ExtendedCostsByServiceTable.jsx";
import BillingStatsEndpoint from "../../common/endpoints/BillingStatsEndpoint";

export default class AdminCosts extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			costThisMonth: null,
			usersThisMonth: null,
			costPerUserThisMonth: null,
		};
		this.init();
	}

	init() {
		BillingStatsEndpoint.getAggregatedStats().then((resp) => {
			this.setState({
				costThisMonth: resp.costThisMonth,
				usersThisMonth: resp.usersThisMonth,
				costPerUserThisMonth: resp.costPerUserThisMonth,
			});
		});
	}

	render() {
		const currencyFormatter = new Intl.NumberFormat('de', {
			style: 'currency',
			currency: 'EUR',
		});

		return (
			<div className="container main-content">
				<div className="box box-default">
					<div className="box-header with-border">
						<h3 className="box-title">
							<FormattedMessage
								id="adminstats.aggregated_costs_stats"
								defaultMessage="Aggregated costs"
							/>
						</h3>
					</div>
					<div className="box-body">
						<div>
							<div className="row">
								<div className="col-lg-4 col-xs-6 small-gutter-right">
									<div className="info-box">
										<div className="info-box-icon bg-aqua">
											<i className="fa fa-eur" aria-hidden="true"/>
										</div>
										<div className="info-box-content">
											<span className="info-box-text">
												<FormattedMessage
													id="adminstats.aggregated_costs_this_month"
													defaultMessage="Costs this month"
												/>
											</span>
											{this.state.costThisMonth && <span id="topStatsDocuments" className="info-box-number">
												{currencyFormatter.format(this.state.costThisMonth)}
											</span>}
										</div>
									</div>
								</div>
								<div className="col-lg-4 col-xs-6 small-gutter">
									<div className="info-box">
										<div className="info-box-icon bg-yellow">
											<i className="fa fa-heartbeat" aria-hidden="true"/>
										</div>
										<div className="info-box-content">
											<span className="info-box-text">
												<FormattedMessage
													id="adminstats.aggregated_costs_users_this_month"
													defaultMessage="Users this month"
												/>
											</span>
											{this.state.usersThisMonth && <span id="topStatsCodes" className="info-box-number">
												{this.state.usersThisMonth}
											</span>}
										</div>
									</div>
								</div>
								<div className="col-lg-4 col-xs-6 small-gutter">
									<div className="info-box">
										<div className="info-box-icon bg-red">
											<i className="fa fa-eur" aria-hidden="true"/>
										</div>
										<div className="info-box-content">
											<span className="info-box-text">
												<FormattedMessage
													id="adminstats.aggregated_costs_per_user_this_month"
													defaultMessage="Costs per user this month"
												/>
											</span>
											{this.state.costPerUserThisMonth && <span id="topStatsCodes" className="info-box-number">
												{currencyFormatter.format(this.state.costPerUserThisMonth)}
											</span>}
										</div>
									</div>
								</div>
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
					<div className="col-lg-6">
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">
									<FormattedMessage
										id="adminstats.extended_costs_by_service"
										defaultMessage="Costs by service extended"
									/>
								</h3>
							</div>
							<div className="box-body">
								<ExtendedCostsByServiceTable
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
