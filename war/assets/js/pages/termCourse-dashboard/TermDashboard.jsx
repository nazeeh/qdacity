import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import TermCourse from './TermCourse';
import BtnDefault from '../../common/styles/Btn.jsx';
import Participants from "./Participants/Participants.jsx";

const StyledNewPrjBtn = styled.div `
	padding-left: 5px;
`;
const StyledDashboard = styled.div `
	margin-top: 70px;
	margin-left: auto;
	margin-right: auto;
	width: 1170px;
	display: grid;
    grid-template-columns: 6fr 6fr;
    grid-template-areas:
        "terms teachers";
	grid-column-gap: 20px;
`;

export default class TermDashboard extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);

		var termCourse = new TermCourse(urlParams.termCourse);

		this.state = {
			termCourse: termCourse,
			isTermCourseOwner: false,
		};

	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.listTermCourseParticipantsPromise = CourseEndpoint.listTermCourseParticipants(this.state.termCourse.getId());
			this.setParticipants();
			this.setUserRights();
		}
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function (user) {
			var isTermCourseOwner = _this.props.account.isTermCourseOwner(user, _this.state.termCourse.getId());
			_this.setState({
				isTermCourseOwner: isTermCourseOwner
			});
		});
	}

	setParticipants() {
		var _this = this;
		this.listTermCourseParticipantsPromise.then(function (resp) {
			var termCourse = _this.state.termCourse;
			resp.items = resp.items || [];
			termCourse.participants = resp.items;
			_this.setState({
				termCourse: termCourse
			});
		});
	}
	render() {

		if (!this.props.account.getProfile() || !this.props.account.isSignedIn()) return null;
		this.init();
		var termCourse = this.state.termCourse;
		console.log(termCourse);
		return (
			<StyledDashboard>
				<Participants termCourse={this.state.termCourse}/>
		  	</StyledDashboard>
		);
	}
}
