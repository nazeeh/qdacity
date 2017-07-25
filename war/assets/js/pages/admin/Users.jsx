import React from 'react'
import UserList from './UserList.jsx';

export default class Users extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			search: ''
		};

		this.updateSearch = this.updateSearch.bind(this);
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});
	}

	render(){
		return(
			<div className="box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Users</h3>
				</div>
				<div className="box-body">
					<div className="projectlist-menu">
						<span className="searchfield" id="searchform">
							<input
								type="text"
								className="search"
								placeholder="Search"
								value={this.state.search}
								onChange={this.updateSearch}
							/>
							<button id="userSearchFindBtn" type="button" id="search">Find!</button>
						</span>
					</div>
					<UserList />
					<ul id="user-list" className="list compactBoxList">
					</ul>
					<ul className="pagination"></ul>
				</div>
			</div>
		);
	}
}