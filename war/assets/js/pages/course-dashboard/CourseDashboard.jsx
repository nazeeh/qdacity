import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import TermCourseList from './TermCourseList.jsx';
import Course from './Course';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import Teachers from "./Teachers/Teachers.jsx";

const StyledDashboard = styled.div `
	margin-top: 35px;
`;

export default class CourseDashboard extends React.Component {
	constructor(props) {
		super(props);


		var urlParams = URI(window.location.search).query(true);

		var course = new Course(urlParams.course);
		this.setCourse = this.setCourse.bind(this);
		this.addParticipant = this.addParticipant.bind(this);
		this.removeParticipant = this.removeParticipant.bind(this);

		this.state = {
			course: course,
			isCourseOwner: false
		};
		$("body").css({
			overflow: "auto"
		});
	}
	setCourse(course) {
		this.setState({
			course: course
		});
	}

	addParticipant(term) {
		//Find the id of the term to be added, then add the user to participants & set isUserParticipant to true for that term
		var _this = this;
		var id = term.id;
		var course = this.state.course;
		course.terms.forEach(function (term, index) {
			if (term.id == id) {
				var termIndex = index;
				_this.props.account.getCurrentUser().then(function (resp) {
					course.terms[termIndex].participants.push(resp.id);
					course.terms[termIndex].isUserParticipant = true;
					_this.setState({
						course: course
					});
				});
			}
		});
	}

	removeParticipant(term) {
		//Find the id of the term to be removed, then remove the user from participants & set isUserParticipant to false for that term
		var _this = this;
		var id = term.id;
		var course = this.state.course;
		course.terms.forEach(function (term, index) {
			if (term.id == id) {
				course.terms[index].participants.splice(index, 1);
				course.terms[index].isUserParticipant = false;
				_this.setState({
					course: course
				});
			}
		});
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.setUserRights();
			this.setCourseProperties();
		}
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function (user) {
			var isCourseOwner = _this.props.account.isCourseOwner(user, _this.state.course.getId());
			_this.setState({
				isCourseOwner: isCourseOwner
			});
		});
	}

	setCourseProperties() {
		var _this = this;
		var course = this.state.course;
	}

	render() {

		if (!this.props.account.getProfile) return null;
		if (!this.props.account.isSignedIn()) return null;
		this.init();

		return (
			<StyledDashboard className="container main-content">
				<div>
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">Terms</h3>
						</div>
						<div className="box-body">
							<TermCourseList account={this.props.account} addParticipant={this.addParticipant} removeParticipant={this.removeParticipant} course={this.state.course} setCourse={this.setCourse}/>
						</div>
					</div>
				</div>
				<div className="col-lg-5">
					<Teachers course={this.state.course} isCourseOwner={this.state.isCourseOwner}/>
				</div>
		  	</StyledDashboard>
		);
	}
}
