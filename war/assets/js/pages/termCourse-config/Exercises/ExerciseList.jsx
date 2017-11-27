import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import styled from 'styled-components';
import CustomForm from '../../../common/modals/CustomForm';
import Theme from '../../../common/styles/Theme.js';
import Confirm from '../../../common/modals/Confirm';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemDefault
} from '../../../common/styles/List';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledNewExBtn = styled.div `
	padding-bottom: 5px;
`;

export default class ExerciseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exercises: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 5
		};

		this.init();

		this.paginationClick = this.paginationClick.bind(this);
		this.showNewExerciseModal = this.showNewExerciseModal.bind(this);
	}

	init() {
		this.getExercises();
	}

	getExercises() {
		var _this = this;
		ExerciseEndpoint.listTermCourseExercises(this.props.termCourse.getId()).then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				exercises: resp.items
			});
		});
	}

	showNewExerciseModal() {
		var _this = this;
		var modal = new CustomForm('Create a new exercise', '');
		modal.addTextInput('name', "Exercise Name", 'Name', '');
		modal.showModal().then(function (data) {
			_this.createNewExercise(data.name);
		});
	}

	createNewExercise(name) {
		var _this = this;
		var exercise = {};
		var termCourseID = this.props.termCourse.id;
		var exercises = this.state.exercises;
		exercise.name = name;
		exercise.termCourseID = termCourseID;
		ExerciseEndpoint.insertExercise(exercise).then(function (resp){
			exercises.push(resp);
			_this.setState({
				exercises: exercises
			})
		})
	}

	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}


	isActivePage(page) {
		return (page == this.state.currentPage);
	}

	renderPaginationIfNeccessary() {
		if (this.state.exercises.length <= this.state.itemsPerPage) {
			return '';
		} else {
			//Render Pagination
			const pageNumbers = [];
			for (let i = 1; i <= Math.ceil(this.state.exercises.length / this.state.itemsPerPage); i++) {
				pageNumbers.push(i);
			}
			const renderPaginationItems = pageNumbers.map(pageNo => {
				return (
					<StyledPaginationItem
		              key={pageNo}
		              id={pageNo}
		              onClick={this.paginationClick}
		              active= {this.isActivePage(pageNo)}
		            >
		              {pageNo}
				  </StyledPaginationItem>
				);
			});
			return <StyledPagination key={"pagination"}>
					{renderPaginationItems}
            	</StyledPagination>
		}

	}


	deleteExercise(e, exercise, index) {
		var _this = this;
		var exercises = this.state.exercises;
		e.stopPropagation();
		var confirm = new Confirm('Do you want to delete the exercise ' + exercise.name + '?');
		confirm.showModal().then(function () {
			ExerciseEndpoint.removeExercise(exercise.id).then(function (resp) {
				var index = exercises.indexOf(exercises.find(o => o.id === exercise.id));
				exercises.splice(index, 1);
				_this.setState ({
					exercises: exercises
				});
			});
		});

	}
	render() {
		var _this = this;


		const newExerciseButton = <StyledNewExBtn>

					<BtnDefault onClick={this.showNewExerciseModal}>
					<i className="fa fa-plus fa-fw"></i>
					New Exercise
					</BtnDefault>

		</StyledNewExBtn>
		//Render Components
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.exercises.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
		}

		const renderListItems = itemsToDisplay.map((exercise, index) => {
			return <StyledListItemDefault key={index} className="clickable">
					<span > {exercise.name} </span>
						<div>
						<StyledListItemBtn onClick={(e) => this.deleteExercise(e, exercise, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
							<i className="fa fa-trash "></i>
						</StyledListItemBtn>
					</div>
				</StyledListItemDefault>;
		})



		return (
			<div>
				{newExerciseButton}
				<StyledBoxList key={"itemList"}>
					{renderListItems}
	            </StyledBoxList>
				{this.renderPaginationIfNeccessary()}
     		</div>
		);
	}


}
