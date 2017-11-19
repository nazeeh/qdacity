import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import TermCourse from './TermCourse';

const StyledDashboard = styled.div `
	margin-top: 35px;
`;

export default class TermDashboard extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);

		var termCourse = new TermCourse(urlParams.termCourse);

		var participants = [];

		this.state = {
			termCourse: termCourse,
			isTermCourseOwner: false,
			participants: participants
		};

	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.setUserRights();
		}
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function (user) {
			console.log(_this.state.termCourse.getId());
			console.log(user);
			var isTermCourseOwner = _this.props.account.isTermCourseOwner(user, _this.state.termCourse.getId());
			console.log(isTermCourseOwner);
			_this.setState({
				isTermCourseOwner: isTermCourseOwner
			});
		});
	}

	render() {

		if (!this.props.account.getProfile() || !this.props.account.isSignedIn()) return null;
		this.init();

		return (
			<StyledDashboard className="container main-content">
				<div className="row">
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">Excersises</h3>
						</div>
					</div>
				</div>
		  	</StyledDashboard>
		);
	}
}
