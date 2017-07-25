import React from 'react'

import Users from './Users.jsx';
import AdminStats from './AdminStats.jsx';

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div className="row">
				<div className="col-lg-8">
					<div className="box box-default">
						<div className="box-header with-border">
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
						<Users users={this.state.users}/>
					</div>
				</div>
			</div>
		);
	}
}