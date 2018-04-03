import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import CourseEndpoint from 'endpoints/CourseEndpoint';
import TermCourseList from './TermCourseList.jsx';
import Course from './Course';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import Teachers from './Teachers/Teachers.jsx';
import TitleRow from './TitleRow/TitleRow.jsx';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

const StyledDashboard = styled.div`
	margin-top: 70px;
	margin-left: auto;
	margin-right: auto;
	width: 1170px;
	display: grid;
	grid-template-columns: 6fr 6fr;
	grid-template-areas:
		'titlerow titlerow'
		'terms teachers';
	grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div`
	grid-area: titlerow;
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
		$('body').css({
			overflow: 'auto'
		});

		this.authenticationProvider = props.auth.authentication;

		const _this = this;
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
		this.authenticationProvider.getCurrentUser().then(function(resp) {
			term.participants.push(resp.id);
			term.isUserParticipant = true;
			_this.state.course = course;
			_this.setState(_this.state);
		});
	}

	removeParticipant(term) {
		//Find the id of the term to be removed, then remove the user from participants & set isUserParticipant to false for that term
		var _this = this;
		var id = term.id;
		var course = this.state.course;
		term.participants.splice(term.participants.indexOf(term.id), 1);
		term.isUserParticipant = false;
		_this.state.course = course;
		_this.setState(_this.state);
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.authenticationProvider.getCurrentUser();
			this.setUserRights();
		}
	}

	setUserRights() {
		var _this = this;
		this.userPromise.then(function(user) {
			var isCourseOwner = _this.props.auth.authorization.isCourseOwner(
				user,
				_this.state.course
			);
			_this.state.isCourseOwner = isCourseOwner;
		});
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn
		) {
			return <UnauthenticatedUserPanel history={this.props.history} auth={this.props.auth} />;
		}

		return (
			<StyledDashboard>
				<StyledTitleRow>
					<TitleRow course={this.state.course} />
				</StyledTitleRow>
				<div>
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">
								<FormattedMessage
									id="coursedashboard.terms"
									defaultMessage="Terms"
								/>
							</h3>
						</div>
						<div className="box-body">
							<TermCourseList
								auth={this.props.auth}
								addParticipant={this.addParticipant}
								removeParticipant={this.removeParticipant}
								course={this.state.course}
								setCourse={this.setCourse}
								history={this.props.history}
							/>
						</div>
					</div>
				</div>
				<div>
					<Teachers
						course={this.state.course}
						isCourseOwner={this.state.isCourseOwner}
					/>
				</div>
			</StyledDashboard>
		);
	}
}
