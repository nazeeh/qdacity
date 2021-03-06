import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import CourseEndpoint from 'endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import TermCourse from './TermCourse';
import BtnDefault from '../../common/styles/Btn.jsx';
import Participants from './Participants/Participants.jsx';
import Exercises from './Exercises/Exercises.jsx';
import TitleRow from './TitleRow/TitleRow.jsx';
import Confirm from '../../common/modals/Confirm';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

import {
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

const StyledNewPrjBtn = styled.div`
	padding-left: 5px;
`;
const StyledDashboard = styled.div`
	margin-top: 70px;
	margin-left: auto;
	margin-right: auto;
	width: 1170px;
	display: grid;
	grid-template-columns: 6fr 6fr;
	grid-template-areas:
		'titlerow titlerow'
		'terms teachers'
		'joinButton joinButton';
	grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div`
	grid-area: titlerow;
`;

const StyledButton = styled.div`
	grid-area: joinButton;
	margin-left: auto;
	margin-right: auto;
	margin-top: 100px;
`;
export default class TermDashboard extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);

		this.termCourseId = urlParams.termCourse;

		this.addParticipant = this.addParticipant.bind(this);
		this.removeParticipant = this.removeParticipant.bind(this);

		this.state = {
			course: [],
			termCourse: null,
			isTermCourseOwner: false
		};
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.auth.authentication.getCurrentUser();
			this.listTermCourseParticipantsPromise = CourseEndpoint.listTermCourseParticipants(
				this.termCourseId
			);
			this.getTermCoursePromise = CourseEndpoint.getTermCourse(
				this.termCourseId
			);
			this.setTermCourseInfo();
		}
	}

	async setTermCourseInfo() {
		let isUserParticipant = false;
		const user = await this.userPromise;

		let resp = await this.getTermCoursePromise;
		const termCourse = resp;

		const course = await CourseEndpoint.getCourse(resp.courseID);

		const isTermCourseOwner = this.props.auth.authorization.isTermCourseOwner(
			user,
			termCourse,
			course
		);

		resp = await this.listTermCourseParticipantsPromise;
		resp.items = resp.items || [];
		termCourse.participants = resp.items;
		isUserParticipant =
			typeof termCourse.participants.find(o => o.id === user.id) != 'undefined';
		termCourse.isUserParticipant = isUserParticipant;

		this.setState({
			course: course,
			termCourse: termCourse,
			isTermCourseOwner: isTermCourseOwner
		});
	}

	addParticipant(e) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var confirm = new Confirm(
			formatMessage({
				id: 'termdashboard.join_term_confirm',
				defaultMessage: 'Do you want to join this term course?'
			})
		);
		confirm.showModal().then(function() {
			//Add the user to participants & set isUserParticipant to true for that term
			var termCourse = _this.state.termCourse;
			_this.userPromise.then(function(resp) {
				CourseEndpoint.addParticipant(termCourse.id, resp.id).then(function(
					resp2
				) {
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
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var confirm = new Confirm(
			formatMessage({
				id: 'termdashboard.leave_term_confirm',
				defaultMessage: 'Do you want to leave this term course?'
			})
		);
		confirm.showModal().then(function() {
			//Add the user to participants & set isUserParticipant to true for that term
			var termCourse = _this.state.termCourse;
			_this.userPromise.then(function(resp) {
				CourseEndpoint.removeParticipant(termCourse.id, resp.id).then(function(
					resp2
				) {
					var userIndex = termCourse.participants.indexOf(
						typeof termCourse.participants.find(o => o.id === resp.id) ==
							'undefined'
					);
					termCourse.participants.splice(userIndex, 1);
					termCourse.isUserParticipant = false;
					_this.setState({
						termCourse: termCourse
					});
				});
			});
		});
	}

	renderJoinButton() {
		var termCourse = this.state.termCourse;
		//Show join/leave button depending on whether the user is a participant in the course
		if (!termCourse.isUserParticipant) {
			return (
				<StyledListItemBtn id="joinTermCourseBtn"
					onClick={e => this.addParticipant(e)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<FormattedMessage
						id="termdashboard.join_term"
						defaultMessage="Join this term course"
					/>
				</StyledListItemBtn>
			);
		} else {
			return (
				<StyledListItemBtn
					onClick={e => this.removeParticipant(e)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<FormattedMessage
						id="termdashboard.leave_term"
						defaultMessage="Leave this term course"
					/>
				</StyledListItemBtn>
			);
		}
	}

	renderParticipants() {
		var termCourse = this.state.termCourse;
		if (!termCourse.isUserParticipant) {
			return '';
		} else {
			return <Participants termCourse={this.state.termCourse} />;
		}
	}

	renderExercises() {
		var termCourse = this.state.termCourse;
		if (!termCourse.isUserParticipant) {
			return '';
		} else {
			return (
				<Exercises
					termCourse={this.state.termCourse}
					auth={this.props.auth}
					history={this.props.history}
				/>
			);
		}
	}

	render() {
		if (!this.props.auth.authState.isUserSignedIn) {
			return (
				<UnauthenticatedUserPanel
					history={this.props.history}
					auth={this.props.auth}
				/>
			);
		}

		this.init();
		var termCourse = this.state.termCourse;
		if (termCourse == undefined || termCourse == null) return null;

		return (
			<StyledDashboard>
				<StyledTitleRow>
					<TitleRow
						course={this.state.course}
						termCourse={this.state.termCourse}
						history={this.props.history}
					/>
				</StyledTitleRow>
				{this.renderExercises()}
				{this.renderParticipants()}
				<StyledButton>{this.renderJoinButton()}</StyledButton>
			</StyledDashboard>
		);
	}
}
