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
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

import { BtnDefault } from '../../common/styles/Btn.jsx';

const StyledNewPrjBtn = styled.div`
	padding-left: 5px;
`;

export default class TermCourseList extends React.Component {
	constructor(props) {
		super(props);

		this.itemList = null;

		this.showNewTermCourseModal = this.showNewTermCourseModal.bind(this);
		this.authenticationProvider = props.auth.authentication;

		this.renderTerm = this.renderTerm.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.course != undefined &&
			nextProps.course != null &&
			nextProps.course.terms == undefined
		) {
			if(this.props.course != undefined && this.props.course != null && 
				nextProps.course.id == this.props.course.id) {
				// TODO: pull up initialization of term course data into parent component
				return; // no need to rerender
			}
			// #workaround
			// and the collect initial data in this component only once (terms set)
			this.collectInitialData(nextProps.course);
		}
	}

	collectInitialData(course) {
		const _this = this;
		var courseTermListPromise = CourseEndpoint.listTermCourse(course.id);

		courseTermListPromise.then(function(resp3) {
			var termList = [];
			resp3.items = resp3.items || [];
			resp3.items.forEach(function(crs) {
				var participants = [];
				var isUserParticipant = [];
				//Get the id of the current user and check whether he's a participant in the term or not, then save this info in the course object
				if (!(typeof crs.participants == 'undefined'))
					participants = crs.participants;
				status = crs.open;
				isUserParticipant = participants.includes(
					_this.props.auth.userProfile.qdacityId
				);
				termList.push({
					text: crs.term,
					id: crs.id,
					participants: participants,
					isUserParticipant: isUserParticipant,
					isUserOwner: _this.props.isCourseOwner,
					isOpen: status
				});
			});
			course.isUserOwner = _this.props.isCourseOwner;
			course.terms = termList;
			_this.props.setCourse(course);
		});
	}

	showNewTermCourseModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var course = this.props.course;
		var modal = new CustomForm(
			formatMessage({
				id: 'termcourselist',
				defaultMessage: 'Create a new term course'
			}),
			''
		);
		modal.addTextInput(
			'name',
			formatMessage({
				id: 'term.course.term_name',
				defaultMessage: 'Term Name'
			}),
			formatMessage({
				id: 'term.course.term_name_template',
				defaultMessage: 'Name'
			}),
			''
		);
		modal.showModal().then(function(data) {
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
		CourseEndPoint.insertTermCourse(termCourse).then(function(
			insertedTermCourse
		) {
			var termList = courseTerms;
			termList.push({
				text: term,
				id: insertedTermCourse.id,
				participants: [],
				isUserParticipant: false,
				isOpen: 'true'
			});
			course.terms = termList;
			_this.props.setCourse(course);
		});
	}

	removeTermCourse(e, term, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var course = this.props.course;
		var courseTerms = course.terms;
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'term.course.delete_term',
					defaultMessage:
						'Do you want to delete the term {name} of this course?'
				},
				{
					name: term.text
				}
			)
		);
		confirm.showModal().then(function() {
			CourseEndPoint.removeTermCourse(term.id).then(function(resp) {
				var termToRemove = courseTerms.find(
					thisTerm => thisTerm.id === term.id
				);
				courseTerms.splice(courseTerms.indexOf(termToRemove.id), 1);
				course.terms = courseTerms;
				_this.props.setCourse(course);
			});
		});
	}

	joinTermCourse(e, term, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm(
			formatMessage(
				{
					id: 'term.course.join_term',
					defaultMessage: 'Do you want to join the term {name} of this course?'
				},
				{
					name: term.text
				}
			)
		);
		confirm.showModal().then(function() {
			_this.props.auth.authentication.getCurrentUser().then(function(resp) {
				CourseEndPoint.addParticipant(term.id, resp.id).then(function(resp2) {
					_this.props.addParticipant(term);
				});
			});
		});
	}

	leaveTermCourse(e, term, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm(
			formatMessage(
				{
					id: 'term.course.leave_term',
					defaultMessage: 'Do you want to leave the term {name} of this course?'
				},
				{
					name: term.text
				}
			)
		);
		confirm.showModal().then(function() {
			_this.authenticationProvider.getCurrentUser().then(function(resp) {
				CourseEndPoint.removeParticipant(term.id, resp.id).then(function(
					resp2
				) {
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
		if (course.isUserOwner) return '';
		//Show join/leave button depending on whether the user is a participant in the course
		if (!term.isUserParticipant) {
			return (
				<StyledListItemBtn
					onClick={e => this.joinTermCourse(e, term, index)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<i className="fa fa-tags" />
				</StyledListItemBtn>
			);
		} else {
			return (
				<StyledListItemBtn
					onClick={e => this.leaveTermCourse(e, term, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<i className="fa fa-sign-out" />
				</StyledListItemBtn>
			);
		}
	}

	renderDeleteButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner) {
			return (
				<StyledListItemBtn
					onClick={e => this.removeTermCourse(e, term, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<i className="fa fa-trash " />
				</StyledListItemBtn>
			);
		}
	}

	renderConfigureButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner) {
			return (
				<StyledListItemBtn id="configureTermCourseBtn"
					onClick={e => this.configureTermCourse(e, term, index)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<i className="fa fa-cog " />
				</StyledListItemBtn>
			);
		}
	}

	renderCreateTermButton() {
		var course = this.props.course;
		if (course.isUserOwner) {
			return [
				<StyledNewPrjBtn id="newProject">
					<BtnDefault
						id="newPrjBtn"
						href="#"
						onClick={this.showNewTermCourseModal}
					>
						<i className="fa fa-plus fa-fw" />
						<FormattedMessage
							id="term.course.new_term"
							defaultMessage="New Term Course"
						/>
					</BtnDefault>
				</StyledNewPrjBtn>
			];
		}
	}

	renderTerm(term, index) {
		if (term.isOpen == 'true') {
			return (
				<StyledListItemPrimary>
					<span>{term.text}</span>
					<div>
						{this.renderJoinButton(term, index)}
						{this.renderDeleteButton(term, index)}
						{this.renderConfigureButton(term, index)}
					</div>
				</StyledListItemPrimary>
			);
		} else {
			return '';
		}
	}

	render() {
		if (this.props.course == undefined || this.props.course == null)
			return null;

		return (
			<div>
				<ListMenu>
					{this.itemList ? this.itemList.renderSearchBox() : ''}

					{this.renderCreateTermButton()}
				</ListMenu>

				<ItemList
					ref={r => {
						if (r) this.itemList = r;
					}}
					hasSearch={true}
					hasPagination={true}
					doNotrenderSearch={true}
					itemsPerPage={8}
					items={this.props.course.terms || []}
					renderItem={this.renderTerm}
					getItemText={item => item.text}
				/>
			</div>
		);
	}
}
