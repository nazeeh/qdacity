import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import CourseEndpoint from 'endpoints/CourseEndpoint';
import CourseEndPoint from '../../common/endpoints/CourseEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';
import Confirm from '../../common/modals/Confirm';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault,
} from '../../common/styles/List';

import StyledSearchField from '../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../common/styles/Btn.jsx';

const StyledNewPrjBtn = styled.div `
	padding-left: 5px;
`;

const StyledProjectListMenu = styled.div `
	display:flex;
	flex-direction:row;
	& > .searchfield{
		height: inherit !important;
		flex:1;
	}
`;


const StyledProjectList = StyledBoxList.extend `
	padding-top: 5px;
`;


export default class TermCourseList extends React.Component {
	constructor(props) {
		super(props);

		this.showNewTermCourseModal = this.showNewTermCourseModal.bind(this);
		this.authenticationProvider = props.auth.authentication;

		this.init();
	}

	init() {
		var _this = this;
		var course = this.props.course;
		var owners = [];
		var isUserOwner = [];
		var coursePromise = CourseEndpoint.getCourse(course.getId());
		var courseTermListPromise = CourseEndpoint.listTermCourse(course.getId());
		var getAccountPromise = this.authenticationProvider.getCurrentUser();

		//Get the course, its terms, participants and save all info in the course object
		coursePromise.then(function (resp) {
			if (!(typeof resp.owners == 'undefined')) owners = resp.owners;
			course.setName(resp.name);
			course.setDescription(resp.description);
			getAccountPromise.then(function (resp2) {
				isUserOwner = owners.includes(resp2.id);
				courseTermListPromise.then(function (resp3) {
					var termList = [];
					resp3.items = resp3.items || [];
					resp3.items.forEach(function (crs) {
						var participants = [];
						var isUserParticipant = [];
						//Get the id of the current user and check whether he's a participant in the term or not, then save this info in the course object
						if (!(typeof crs.participants == 'undefined')) participants = crs.participants;
						status = crs.open;
						isUserParticipant = participants.includes(resp2.id);
						termList.push({
							text: crs.term,
							id: crs.id,
							participants: participants,
							isUserParticipant: isUserParticipant,
							isUserOwner: isUserOwner,
							isOpen: status
						});
					});
					course.isUserOwner = isUserOwner;
					course.setTerms(termList);
					_this.props.setCourse(course);
				});
			});
		});
	}

	showNewTermCourseModal() {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		var course = this.props.course;
		var modal = new CustomForm(
			formatMessage({ id: 'termcourselist', defaultMessage: 'Create a new term course' }),
			''
		);
		modal.addTextInput(
			'name',
			formatMessage({ id: 'term.course.term_name', defaultMessage: "Term Name" }),
			formatMessage({ id: 'term.course.term_name.sample', defaultMessage: 'Name' }),
			''
		);
		modal.showModal().then(function (data) {
			_this.insertTermCourse(course, data.name);
		});
	}

	insertTermCourse(course, term) {
		var _this = this;
		var courseTerms = course.terms;
		var courseID = course.id;
		var termCourse = {};
		termCourse.courseID = course.id;
		termCourse.term = term;
		CourseEndPoint.insertTermCourse(termCourse).then(function (insertedTermCourse) {
			var termList = courseTerms;
			termList.push({
				text: term,
				id: insertedTermCourse.id,
				participants: [],
				isUserParticipant: false,
				isOpen: "true"
			});
			course.setTerms(termList);
			_this.props.setCourse(course);
		});
	}

	removeTermCourse(e, term, index) {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var course = this.props.course;
		var courseTerms = course.terms;
		var confirm = new Confirm(
			formatMessage({ id: 'term.course.delete_term', defaultMessage: 'Do you want to delete the term {name} of this course?' },
				{ name: term.text }
			)
		);
		confirm.showModal().then(function () {
			CourseEndPoint.removeTermCourse(term.id).then(function (resp) {
				var termToRemove = courseTerms.find(thisTerm => thisTerm.id === term.id);
				courseTerms.splice(courseTerms.indexOf(termToRemove.id), 1);
				course.setTerms(courseTerms);
				_this.props.setCourse(course);
			});
		});
	}

	joinTermCourse(e, term, index) {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm(
			formatMessage({ id: 'term.course.join_term', defaultMessage: 'Do you want to join the term {name} of this course?' },
				{ name: term.text }
			)
		);
		confirm.showModal().then(function () {
			_this.props.auth.authentication.getCurrentUser().then(function (resp) {
				CourseEndPoint.addParticipant(term.id, resp.id).then(function (resp2) {
					_this.props.addParticipant(term);
				});
			});
		});
	}

	leaveTermCourse(e, term, index) {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm(
			formatMessage({ id: 'term.course.leave_term', defaultMessage: 'Do you want to leave the term {name} of this course?' },
				{ name: term.text }
			)
		);
		confirm.showModal().then(function () {
			_this.authenticationProvider.getCurrentUser().then(function (resp) {
				CourseEndPoint.removeParticipant(term.id, resp.id).then(function (resp2) {
					_this.props.removeParticipant(term);
				});
			});
		});
	}

	configureTermCourse(e, term, index) {
		var _this = this;
		e.stopPropagation();
		this.props.history.push('/TermCourseConfig?termCourse=' + term.id);
	}
	renderJoinButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner) return "";
		//Show join/leave button depending on whether the user is a participant in the course
		if (!term.isUserParticipant) {
			return <StyledListItemBtn onClick={(e) => this.joinTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
				<i className="fa fa-tags"></i>
			</StyledListItemBtn>
		} else {
			return <StyledListItemBtn onClick={(e) => this.leaveTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
					<i className="fa fa-sign-out"></i>
				</StyledListItemBtn>
		}
	}

	renderDeleteButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner) {
			return <StyledListItemBtn onClick={(e) => this.removeTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
			<i className="fa fa-trash "></i>
		</StyledListItemBtn>
		}
	}

	renderConfigureButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner) {
			return <StyledListItemBtn onClick={(e) => this.configureTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
			<i className="fa fa-cog "></i>
		</StyledListItemBtn>
		}
	}

	renderCreateTermButton() {
		var course = this.props.course;
		if (course.isUserOwner) {
			return ([
				<StyledNewPrjBtn id="newProject">
				<BtnDefault
					id="newPrjBtn"
					href="#"
					onClick={this.showNewTermCourseModal}
				>
				<i className="fa fa-plus fa-fw"></i>
				<FormattedMessage id='term.course.new_term' defaultMessage='New Term Course' />
				</BtnDefault>
			</StyledNewPrjBtn>
			])
		}
	}
	render() {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;

		const searchFieldPlaceholder = formatMessage({ id: 'term.course.search', defaultMessage: 'Search' });
		const projectListMenu = <StyledProjectListMenu>


			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder={searchFieldPlaceholder}
				/>
			{this.renderCreateTermButton()}

			</StyledSearchField>

		</StyledProjectListMenu>

		const renderListItemContent = (term, index) => {
			return ([
				<span>{term.text}</span>,
				<div>
						{this.renderJoinButton(term, index)}
						{this.renderDeleteButton(term, index)}
						{this.renderConfigureButton(term, index)}
				</div>
			])
		}
		const itemsToDisplay = this.props.course.terms;
		const renderListItems = itemsToDisplay.map((term, index) => {
			if (term.isOpen == "true") {
				return <StyledListItemPrimary>
						{renderListItemContent(term, index)}
					</StyledListItemPrimary>;
			} else {
				return "";
			}
		})

		return (
			<div>
				{projectListMenu}
				<StyledProjectList className="">
					{renderListItems}
	            </StyledProjectList>
     		</div>
		);
	}


}