import React from 'react';
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

		this.init();
	}

	init() {
		var _this = this;
		var course = this.props.course;
		var owners = [];
		var isUserOwner = [];
		//Get the course, its terms, participants and save all info in the course object
		CourseEndpoint.getCourse(course.getId()).then(function (resp) {
			if (!(typeof resp.owners == 'undefined')) owners = resp.owners;
			course.setName(resp.name);
			course.setDescription(resp.description);
			CourseEndpoint.listTermCourse(course.getId()).then(function (resp2) {
				var termList = [];
				resp2.items = resp2.items || [];
				resp2.items.forEach(function (crs) {
					var participants = [];
					var isUserParticipant = [];
					//Get the id of the current user and check whether he's a participant in the term or not, then save this info in the course object
					_this.props.account.getCurrentUser().then(function (resp) {
						if (!(typeof crs.participants == 'undefined')) participants = crs.participants;
						isUserOwner = owners.includes(resp.id);
						status = crs.status;
						isUserParticipant = participants.includes(resp.id);
						termList.push ({
						text: crs.term,
						id: crs.id,
						participants: participants,
						isUserParticipant: isUserParticipant,
						isUserOwner: isUserOwner,
						isOpen: status
					});
					course.isUserOwner = isUserOwner;
					course.setTerms(termList);
					_this.props.setCourse(course);
				});
			});
		});
	});
}

	showNewTermCourseModal() {
		var _this = this;
		var course = this.props.course;
		var modal = new CustomForm('Create a new term course', '');
		modal.addTextInput('name', "Term Name", 'Name', '');
		modal.showModal().then(function (data) {
			_this.insertTermCourse(course, data.name);
		});
	}

	insertTermCourse(course, term) {
		var _this = this;
		var courseTerms = course.terms;
		var courseID = course.id;
			CourseEndPoint.insertTermCourse(courseID, term).then (function(insertedTermCourse) {
				var termList = courseTerms;
				termList.push ({
				text: term,
				id: courseID,
				participants: [],
				isUserParticipant: false,
				isOpen: "true"
			});
			course.setTerms(termList);
			_this.props.setCourse(course);
			});
	}

	removeTermCourse(e, term, index) {
		var _this = this;
		e.stopPropagation();
		var course = this.props.course;
		var courseTerms = course.terms;
		var confirm = new Confirm('Do you want to delete the term ' + term.text + ' of this course?');
		confirm.showModal().then(function () {
			CourseEndPoint.removeTermCourse(term.id).then(function (resp) {
				courseTerms.forEach(function (courseTerm) {
					if (courseTerm.id == term.id) {
						courseTerms.splice(courseTerms.indexOf(term.id), 1);
						course.setTerms(courseTerms);
						_this.props.setCourse(course);
					}
				})
			});
		});
	}

	joinTermCourse(e, term, index) {
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm('Do you want to join the term ' + term.text + ' of this course?');
		confirm.showModal().then(function () {
			CourseEndPoint.addParticipant(term.id).then(function (resp) {
				_this.props.addParticipant(term);
			});
		});

	}

	leaveTermCourse(e, term, index) {
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm('Do you want to leave the term ' + term.text + ' of this course?');
		confirm.showModal().then(function () {
			CourseEndPoint.removeParticipant(term.id).then(function (resp) {
				_this.props.removeParticipant(term);
			});
		});

	}

	renderJoinButton (term, index) {
		var course = this.props.course;
		if (course.isUserOwner) return "";
		//Show join/leave button depending on whether the user is a participant in the course
		if (!term.isUserParticipant) {return <StyledListItemBtn onClick={(e) => this.joinTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
				<i className="fa fa-tags"></i>
			</StyledListItemBtn>}
			else {return <StyledListItemBtn onClick={(e) => this.leaveTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
					<i className="fa fa-sign-out"></i>
				</StyledListItemBtn>}
	}

	renderDeleteButton(term, index) {
		var course = this.props.course;
		if (course.isUserOwner){return <StyledListItemBtn onClick={(e) => this.removeTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
			<i className="fa fa-trash "></i>
		</StyledListItemBtn>}
	}

	renderCreateTermButton() {
		var course = this.props.course;
		if (course.isUserOwner) {return ([
			<StyledNewPrjBtn id="newProject">
				<BtnDefault
					id="newPrjBtn"
					href="#"
					onClick={this.showNewTermCourseModal}
				>
				<i className="fa fa-plus fa-fw"></i>
				New Term Course
				</BtnDefault>
			</StyledNewPrjBtn>
		])}
	}
	render() {
		var _this = this;


		const projectListMenu = <StyledProjectListMenu>


			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder="Search"
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
				</div>
			])
		}
		var account = this.props.account;
		const itemsToDisplay = this.props.course.terms;
		const renderListItems = itemsToDisplay.map((term, index) => {
			if (term.isOpen == "true") {return <StyledListItemPrimary>
						{renderListItemContent(term, index)}
					</StyledListItemPrimary>;}
					else {
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
