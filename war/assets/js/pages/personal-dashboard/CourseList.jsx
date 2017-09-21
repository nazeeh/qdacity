import React from 'react';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import CourseEndPoint from '../../common/endpoints/CourseEndpoint';


import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';
import Confirm from '../../common/modals/Confirm';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
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


export default class CourseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.init();

		this.paginationClick = this.paginationClick.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
		this.showNewCourseModal = this.showNewCourseModal.bind(this);
		this.createNewCourse = this.createNewCourse.bind(this);

	}

	init() {
		var _this = this;
		var courseList = [];
		CourseEndPoint.listCourse().then(function (resp) {
			resp.items = resp.items || [];
			resp.items.forEach(function (prj) {
				prj.type = "COURSE";
				console.log(prj);
			});
			var courses = courseList.concat(resp.items)
			courses = _this.sortCourses(courses);
			_this.props.setCourses(courses);
		});
	}

	sortCourses (courses) {
		courses.sort(function (a, b) {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
		return courses;
	}



	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}

	leaveCourse(e, course, index) {
		var _this = this;
		e.stopPropagation();
		var decider = new BinaryDecider('Please confirm leaving this course', 'Cancel', 'Leave');
		decider.showModal().then(function (value) {
			if (value == 'optionB') {
				var type = course.type;
				if (typeof type == 'undefined') type = "COURSE";
				CourseEndPoint.removeUser(course.id, type).then(function (resp) {
					_this.props.removeCourse(index);
				});
			}
		});
	}

	deleteCourse(e, course, index) {
		var _this = this;
		e.stopPropagation();
		var confirm = new Confirm('Do you want to delete the course ' + course.name + '?');
		confirm.showModal().then(function () {
			var type = course.type;
			if (typeof type == 'undefined') type = "COURSE";
			CourseEndPoint.removeCourse(course.id, type).then(function (resp) {
				// remove course from parent state
				_this.props.removeCourse(index);
			});
		});

	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});

	}

	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}



	showNewCourseModal() {
		var _this = this;
		var modal = new CustomForm('Create a new course', '');
		modal.addTextInput('name', "Course Name", 'Name', '');
		modal.addTextField('desc', "Course Description", 'Description');
		modal.showModal().then(function (data) {
			_this.createNewCourse(data.name, data.desc);
		});
	}

	createNewCourse(name, description) {
		var _this = this;
		var course = {};

		course.name = name;
		course.description = description;
		CourseEndPoint.insertCourse(course).then(function (insertedCourse) {

				insertedCourse.type = "COURSE";
				_this.props.addCourse(insertedCourse);

		});
	}

	renderDeleteBtn(course, index) {
			return <StyledListItemBtn onClick={(e) => this.deleteCourse(e, course, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
						<i className="fa fa-trash "></i>
					</StyledListItemBtn>
	}


	render() {
		var _this = this;

		//Render Components

		//Render search and newPrjBtn
		const projectListMenu = <StyledProjectListMenu>
			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder="Search"
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<StyledNewPrjBtn id="newProject">
					<BtnDefault
						id="newPrjBtn"
						href="#"
						onClick={this.showNewCourseModal}

					>
					<i className="fa fa-plus fa-fw"></i>
					New Course
					</BtnDefault>
				</StyledNewPrjBtn>

			</StyledSearchField>

		</StyledProjectListMenu>

		//Rebder List Items
		var filteredList = this.props.courses.filter(
			(course) => {
				return course.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
			}
		);
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = filteredList.slice(firstItem, lastItem);

		function prjClick(prj) {
			_this.props.history.push('/CourseDashboard?course=' + prj.id);
		}
		const renderListItemContent = (course, index) => {
			return ([
				<span>{course.name}</span>,
				<div>
				{this.renderDeleteBtn(course, index)}
				<StyledListItemBtn onClick={(e) => this.leaveCourse(e, course, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
					<i className="fa fa-sign-out"></i>
				</StyledListItemBtn>

			</div>
			])
		}
		const renderListItems = itemsToDisplay.map((course, index) => {
				return <StyledListItemPrimary key={course.id} onClick={() => prjClick(course)} clickable={true}>
						{renderListItemContent(course, index)}
					</StyledListItemPrimary>;

		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.props.courses.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<StyledPaginationItem
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				{projectListMenu}
				<StyledProjectList className="">
					{renderListItems}
	            </StyledProjectList>
	            <StyledPagination className="pagination">
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}