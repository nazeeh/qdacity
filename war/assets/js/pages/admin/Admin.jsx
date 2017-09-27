import React from 'react'

import Users from './Users.jsx';
import AdminStats from './AdminStats.jsx';

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		scroll(0, 0);
	}


	render() {
		if (!this.props.account.getProfile) return null;
		return (
			<div className="container main-content">
				<div className="row">
					<div className="col-lg-8">
						<div className="box box-default">
							<div className="b ox-header with-border">
								<h3 className="box-title">Statistics</h3>
							</div>
							<div className="box-body">
								<AdminStats />
							</div>
						</div>
						<div id="changeLog"></div>
					</div>
					<div className="col-lg-4">
						<div id="project-selection">
							<Users/>
						</div>
					</div>
				</div>
			</div>


		);
	}
}