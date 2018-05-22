import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import CourseEndPoint from '../../common/endpoints/CourseEndpoint';
import DropDownButton from '../../common/styles/DropDownButton.jsx';
import StyledButtonContainer from '../../common/styles/DropDownButton.jsx';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

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

const StyledNewCourseBtn = styled.div`
	padding-left: 5px;
`;

export default class CourseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			listStatus: []
		};

		this.itemList = null;

		this.renderCourse = this.renderCourse.bind(this);
		this.showNewCourseModal = this.showNewCourseModal.bind(this);
		this.createNewCourse = this.createNewCourse.bind(this);

		this.collectCourses();
	}

	componentWillReceiveProps(nextProps) {
		if (
			this.props.userGroupId !== nextProps.userGroupId &&
			(this.props.userGroupId !== undefined ||
				nextProps.userGroupId !== undefined)
		) {
			// wait for userGroupId to be loaded
			this.collectCourses(nextProps.userGroupId);
		}
	}

	collectCourses(userGroupId = this.props.userGroupId) {
		var _this = this;
		var courseList = [];

		if (!this.props.userGroupId) {
			// personal dashboard: user in focus
			var listCoursePromise = CourseEndPoint.listCourse();
			var listTermCoursePromise = CourseEndPoint.listTermCourseByParticipant();
		} else {
			// group dashboard: user group in focus
			var listCoursePromise = CourseEndPoint.listCourseByUserGroupId(
				userGroupId
			);
			var listTermCoursePromise = CourseEndPoint.listTermCourseByUserGroupId(
				userGroupId
			);
		}
		listCoursePromise.then(function(resp) {
			resp.items = resp.items || [];
			var courses = courseList.concat(resp.items);
			//In case the user is not an owner of any course, the list of terms in which he's a participant should still be fetched
			if (courses.length == 0) {
				_this.fetchTermsByPromise(listTermCoursePromise);
			}
			courses = _this.sortCourses(courses);
			var counter = resp.items.length;
			courses.forEach(function(crs, index) {
				CourseEndPoint.listTermCourse(crs.id).then(function(resp2) {
					counter -= 1;
					var termList = [];
					resp2.items = resp2.items || [];
					resp2.items.forEach(function(crs, index) {
						termList.push({
							text: crs.term,
							onClick: _this.termCourseClicked.bind(_this, crs),
							id: crs.id
						});
					});
					courses[index].terms = termList;
					if (counter == 0) {
						_this.props.setCourses(courses);
						_this.fetchTermsByPromise(listTermCoursePromise);
					}
				});
			});
		});
	}

	fetchTermsByPromise(listTermCourseByParticipantPromise) {
		var _this = this;
		//the array below contains the response of listTermCourseByParticipant without duplicate courseIDs
		var coursesWithTermsArray = [];

		listTermCourseByParticipantPromise.then(function(termsResponse) {
			termsResponse.items = termsResponse.items || [];
			var termCourses = termsResponse.items;

			//Restructure the array in order to remove duplicates of a courseID and group termCourses by course
			termCourses.forEach(function(termCourse) {
				if (coursesWithTermsArray.length == 0) {
					var termList = [];
					var idList = [];
					var termCourseList = [];
					termList.push(termCourse.term);
					idList.push(termCourse.id);
					termCourseList.push(termCourse);
					coursesWithTermsArray.push({
						courseID: termCourse.courseID,
						terms: termList,
						onClick: _this.termCourseClicked.bind(_this, termCourse),
						ids: idList,
						termCourses: termCourseList
					});
					return;
				}

				//if the course does not exist, add it & add the first termCourse, otherwise add the term to the existing course
				var isCourseInArray = coursesWithTermsArray.find(
					o => o.courseID === termCourse.courseID
				);
				if (typeof isCourseInArray === 'undefined') {
					var termList = [];
					idList = [];
					termCourseList = [];
					idList.push(termCourse.id);
					termList.push(termCourse.term);
					termCourseList.push(termCourse);
					coursesWithTermsArray.push({
						courseID: termCourse.courseID,
						terms: termList,
						onClick: _this.termCourseClicked.bind(_this, termCourse),
						ids: idList,
						termCourses: termCourseList
					});
				} else {
					coursesWithTermsArray[
						coursesWithTermsArray.indexOf(isCourseInArray)
					].terms.push(termCourse.term);
					coursesWithTermsArray[
						coursesWithTermsArray.indexOf(isCourseInArray)
					].ids.push(termCourse.id);
					coursesWithTermsArray[
						coursesWithTermsArray.indexOf(isCourseInArray)
					].termCourses.push(termCourse);
				}
			});

			//Iterate over the courses array and add the courses(terms) in which the user is a participant to the CourseList
			coursesWithTermsArray.forEach(function(courseFromArray) {
				CourseEndPoint.getCourse(courseFromArray.courseID).then(function(
					courseResponse
				) {
					var termList = [];
					var course = courseResponse;
					courseFromArray.terms.forEach(function(term, index) {
						termList.push({
							text: term,
							onClick: _this.termCourseClicked.bind(
								_this,
								courseFromArray.termCourses[index]
							),
							id: courseFromArray.ids[index]
						});
					});
					course.terms = termList;
					_this.props.addCourse(course);
				});
			});
		});
	}

	sortCourses(courses) {
		courses.sort(function(a, b) {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
		return courses;
	}

	leaveCourse(e, course, index) {
		if (this.props.userGroupId) return; // user group cannot leave group

		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var decider = new BinaryDecider(
			formatMessage({
				id: 'courselist.leave_course',
				defaultMessage: 'Please confirm leaving this course'
			}),
			formatMessage({
				id: 'modal.cancel',
				defaultMessage: 'Cancel'
			}),
			formatMessage({
				id: 'modal.confirm_leave',
				defaultMessage: 'Leave'
			})
		);
		decider.showModal().then(function(value) {
			if (value == 'optionB') {
				var type = course.type;
				if (typeof type == 'undefined') type = 'COURSE';
				CourseEndPoint.removeUser(course.id, type).then(function(resp) {
					_this.props.removeCourse(index);
				});
			}
		});
	}

	deleteCourse(e, course, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'courselist.delete',
					defaultMessage: 'Do you want to delete the course {course}?'
				},
				{
					course: course.name
				}
			)
		);
		confirm.showModal().then(function() {
			var type = course.type;
			if (typeof type == 'undefined') type = 'COURSE';
			CourseEndPoint.removeCourse(course.id, type).then(function(resp) {
				// remove course from parent state
				_this.props.removeCourse(index);
			});
		});
	}

	configureCourse(e, course, index) {
		e.stopPropagation();
		this.props.history.push('/CourseDashboard?course=' + course.id);
	}

	courseClick(course, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var statusArray = this.state.listStatus;
		var courseIndex = statusArray.indexOf(
			statusArray.find(o => o.selectedCourseID === course.id)
		);
		if (typeof statusArray[courseIndex] == 'undefined') {
			var confirm = new Confirm(
				formatMessage({
					id: 'courselist.assign_term',
					defaultMessage:
						'This course has no terms, would you like to configure it?'
				})
			);
			confirm.showModal().then(function() {
				_this.props.history.push('/CourseDashboard?course=' + course.id);
			});
		} else {
			var termCourseID = statusArray[courseIndex].selectedTermCourseID;
			this.props.history.push('/TermDashboard?termCourse=' + termCourseID);
		}
	}

	showNewCourseModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var modal = new CustomForm(
			formatMessage({
				id: 'courselist.create',
				defaultMessage: 'Create a new course'
			}),
			''
		);

		const possibleOwners = [];
		possibleOwners.push({
			id: -1,
			name: formatMessage({
				id: 'courselist.create_course.owner.me',
				defaultMessage: 'my courses'
			})
		});
		for (const userGroup of _this.props.userGroups) {
			possibleOwners.push({
				id: userGroup.id,
				name: userGroup.name
			});
		}
		const defaultOwner = _this.props.userGroupId
			? possibleOwners[1] // only 2 elements, 2nd is the user group
			: possibleOwners[0]; // 'my courses' if not the userGroup mode active
		modal.addSelectComplexOptions(
			'ownerId',
			possibleOwners,
			formatMessage({
				id: 'courselist.create_course.owner.add',
				defaultMessage: 'Add to'
			}),
			defaultOwner.id
		);

		modal.addTextInput(
			'name',
			formatMessage({
				id: 'courselist.course_name',
				defaultMessage: 'Course Name'
			}),
			formatMessage({
				id: 'courselist.course_name_template',
				defaultMessage: 'Name'
			}),
			''
		);
		modal.addTextInput(
			'term',
			formatMessage({
				id: 'courselist.course_term',
				defaultMessage: 'Course Term'
			}),
			formatMessage({
				id: 'courselist.course_term_template',
				defaultMessage: 'Term'
			}),
			''
		);
		modal.addTextField(
			'desc',
			formatMessage({
				id: 'courselist.course_desc',
				defaultMessage: 'Course Description'
			}),
			formatMessage({
				id: 'courselist.course_desc_template',
				defaultMessage: 'Description'
			})
		);
		modal.showModal().then(function(data) {
			_this.createNewCourse(data.ownerId, data.name, data.desc, data.term);
		});
	}

	createNewCourse(ownerId, name, description, term) {
		var _this = this;
		var course = {};

		course.name = name;
		course.description = description;
		let insertMethodPromise;
		let afterInsertMethod;
		let termCourseInserMethod;
		if (ownerId === '-1') {
			// add to user's personal courses
			insertMethodPromise = CourseEndPoint.insertCourse(course);
			afterInsertMethod = function(insertedCourse) {
				_this.props.addCourse(insertedCourse);
				_this.props.history.push('/PersonalDashboard');
			};
			termCourseInserMethod = function(termCourse) {
				return CourseEndPoint.insertTermCourse(termCourse);
			};
		} else {
			// add course to a user group
			insertMethodPromise = CourseEndPoint.insertCourseForUserGroup(
				ownerId,
				course
			);
			afterInsertMethod = function(insertedCourse) {
				_this.props.addCourse(insertedCourse);
				_this.props.history.push('/GroupDashboard?userGroup=' + ownerId);
			};
			termCourseInserMethod = function(termCourse) {
				return CourseEndPoint.insertTermCourseForUserGroup(ownerId, termCourse);
			};
		}
		insertMethodPromise.then(function(insertedCourse) {
			var termCourse = {};
			termCourse.courseID = insertedCourse.id;
			termCourse.term = term;
			termCourseInserMethod(termCourse).then(function(insertedTermCourse) {
				var termList = [];
				termList.push({
					text: insertedTermCourse.term,
					id: insertedTermCourse.id
				});
				insertedCourse.terms = termList;
				afterInsertMethod(insertedCourse);
			});
		});
	}

	//This function sets the default termCourse for each course in the dropdown list
	//It also fills the statusArray which includes info about the currently selected course/termCourse in the list
	defineInitText(course, index) {
		var text = '';
		var _this = this;
		if (!(typeof course.terms == 'undefined')) {
			if (!(typeof course.terms[course.terms.length - 1] == 'undefined')) {
				text = course.terms[course.terms.length - 1].text;
				var statusArray = this.state.listStatus;
				var courseIndex = statusArray.find(
					o => o.selectedCourseID === course.id
				);
				if (typeof courseIndex == 'undefined') {
					this.state.listStatus.push({
						selectedCourseID: course.id,
						selectedTermCourseID: course.terms[course.terms.length - 1].id
					});
				}
			}
		}
		return text;
	}

	//This function sets the selectedTermCourseID in the statusArray to the one that was just clicked
	termCourseClicked(termCourse) {
		var statusArray = this.state.listStatus;
		var courseIndex = statusArray.find(
			o => o.selectedCourseID === termCourse.courseID
		);
		this.state.listStatus[
			this.state.listStatus.indexOf(courseIndex)
		].selectedTermCourseID =
			termCourse.id;
	}

	renderLeaveCourseButton(course, index) {
		if (this.props.userGroupId) return; // user group cannot leave group

		return (
			<StyledListItemBtn
				onClick={e => this.leaveCourse(e, course, index)}
				className=" btn fa-lg"
				color={Theme.rubyRed}
				colorAccent={Theme.rubyRedAccent}
			>
				<i className="fa fa-sign-out" />
			</StyledListItemBtn>
		);
	}

	renderCourseContent(course, index) {
		return [
			<span>{course.name}</span>,
			<div>
				<DropDownButton
					isListItemButton={true}
					items={course.terms}
					initText={this.defineInitText(course, index)}
				/>
				<StyledListItemBtn
					onClick={e => this.deleteCourse(e, course, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<i className="fa fa-trash " />
				</StyledListItemBtn>
				<StyledListItemBtn id="configureCourseBtn"
					onClick={e => this.configureCourse(e, course, index)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<i className="fa fa-cog " />
				</StyledListItemBtn>
				{this.renderLeaveCourseButton(course, index)}
			</div>
		];
	}

	renderCourse(course, index) {
		return (
			<StyledListItemPrimary
				key={course.id}
				onClick={() => this.courseClick(course, index)}
				clickable={true}
			>
				{this.renderCourseContent(course, index)}
			</StyledListItemPrimary>
		);
	}

	render() {
		return (
			<div>
				<ListMenu>
					{this.itemList ? this.itemList.renderSearchBox() : ''}

					<StyledNewCourseBtn id="newCourse">
						<BtnDefault
							id="newCourseBtn"
							href="#"
							onClick={this.showNewCourseModal}
						>
							<i className="fa fa-plus fa-fw" />
							<FormattedMessage
								id="courselist.new_course"
								defaultMessage="New Course"
							/>
						</BtnDefault>
					</StyledNewCourseBtn>
				</ListMenu>

				<ItemList
					ref={r => {
						if (r) this.itemList = r;
					}}
					hasSearch={true}
					hasPagination={true}
					doNotrenderSearch={true}
					itemsPerPage={8}
					items={this.props.courses}
					renderItem={this.renderCourse}
				/>
			</div>
		);
	}
}
