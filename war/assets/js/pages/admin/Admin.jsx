import React from 'react'

import UserList from './UserList.jsx';
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
						<div className="box box-default">
							<div className="box-header with-border">
								<h3 className="box-title">Users</h3>
							</div>
							<div className="box-body">
								<div className="projectlist-menu">
									<span className="searchfield" id="searchform"> <input id="userSearchTerm" type="text" className="search" placeholder="Search" />
										<button id="userSearchFindBtn" type="button" id="search">Find!</button>
									</span>
								</div>
								<UserList />
								<ul id="user-list" className="list compactBoxList">
								</ul>
								<ul className="pagination"></ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}