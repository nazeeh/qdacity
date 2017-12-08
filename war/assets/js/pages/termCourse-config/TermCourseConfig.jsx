import React from 'react';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import CourseEndpoint from 'endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import TermCourse from './TermCourse';
import BtnDefault from '../../common/styles/Btn.jsx';
import Participants from "./Participants/Participants.jsx";
import Exercises from "./Exercises/Exercises.jsx";
import TitleRow from "./TitleRow/TitleRow.jsx"
import Confirm from '../../common/modals/Confirm';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault,
} from '../../common/styles/List';

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
				"titlerow titlerow"
        "terms teachers";
	grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div `
    grid-area: titlerow;
`;

export default class TermCourseConfig extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);

		var termCourse = new TermCourse(urlParams.termCourse);

		this.addParticipant = this.addParticipant.bind(this);
		this.removeParticipant = this.removeParticipant.bind(this);

		this.state = {
			course: [],
			termCourse: termCourse,
			isTermCourseOwner: false,
		};

	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.getTermCoursePromise = CourseEndpoint.getTermCourse(this.state.termCourse.id);
			this.listTermCourseParticipantsPromise = CourseEndpoint.listTermCourseParticipants(this.state.termCourse.getId());
			this.setTermCourseInfo();
		}
	}

	setTermCourseInfo() {
		var _this = this;
		var isUserParticipant = false;
		this.userPromise.then(function (user) {
			var isTermCourseOwner = _this.props.account.isTermCourseOwner(user, _this.state.termCourse.getId());
			_this.listTermCourseParticipantsPromise.then(function (resp) {
				var termCourse = _this.state.termCourse;
				resp.items = resp.items || [];
				termCourse.participants = resp.items;
				(typeof (termCourse.participants.find(o => o.id === user.id)) == 'undefined') ? isUserParticipant = false: isUserParticipant = true;
				termCourse.isUserParticipant = isUserParticipant;
				_this.getTermCoursePromise.then(function (resp) {
					termCourse.term = resp.term;
					CourseEndpoint.getCourse(resp.courseID).then(function (course) {
						_this.setState({
							course: course,
							termCourse: termCourse,
							isTermCourseOwner: isTermCourseOwner,
						});
					})
				});
			});
		});
	}

	addParticipant(e) {
		var _this = this;
		var confirm = new Confirm('Do you want to join this term course?');
		confirm.showModal().then(function () {
			//Add the user to participants & set isUserParticipant to true for that term
			var termCourse = _this.state.termCourse;
			_this.userPromise.then(function (resp) {
				CourseEndpoint.addParticipant(termCourse.id, resp.id).then(function (resp2) {
					termCourse.participants.push(resp);
					termCourse.isUserParticipant = true;
					_this.setState({
						termCourse: termCourse
					});
				});
			});
		});
	}

	removeParticipant(e) {
		var _this = this;
		var confirm = new Confirm('Do you want to leave this term course?');
		confirm.showModal().then(function () {
			//Remove the user from the termcourse participants
			var termCourse = _this.state.termCourse;
			_this.userPromise.then(function (resp) {
				CourseEndpoint.removeParticipant(termCourse.id, resp.id).then(function (resp2) {
					var userIndex = termCourse.participants.indexOf((typeof (termCourse.participants.find(o => o.id === resp.id)) == 'undefined'));
					termCourse.participants.splice(userIndex, 1);
					termCourse.isUserParticipant = false;
					_this.setState({
						termCourse: termCourse
					});
				});
			});
		});
	}

	renderParticipants() {
		var termCourse = this.state.termCourse;
		var isUserTermCourseOwner = this.state.isTermCourseOwner;
		if (!isUserTermCourseOwner) {
			return '';
		} else {
			return <Participants termCourse={this.state.termCourse}/>
		}
	}

	renderExercises() {
		var termCourse = this.state.termCourse;
		var isUserTermCourseOwner = this.state.isTermCourseOwner;
		if (!isUserTermCourseOwner) {
			return '';
		} else {
			return <Exercises termCourse={this.state.termCourse}/>
		}
	}

	render() {

		if (!this.props.account.getProfile() || !this.props.account.isSignedIn()) return null;
		this.init();
		var termCourse = this.state.termCourse;
		return (
			<StyledDashboard>
			<StyledTitleRow><TitleRow course={this.state.course} termCourse={this.state.termCourse} history={this.props.history}/></StyledTitleRow>
						{this.renderExercises()}
						{this.renderParticipants()}
		  	</StyledDashboard>
		);
	}
}