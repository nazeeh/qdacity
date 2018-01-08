import React from 'react';

import CourseEndpoint from '../../../common/endpoints/CourseEndpoint';
import ExerciseEndpoint from '../../../common/endpoints/ExerciseEndpoint';
import Theme from '../../../common/styles/Theme.js';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemDefault
} from '../../../common/styles/List';

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

	editorClick (e, exercise, index) {
		ExerciseEndpoint.getExerciseProjectByRevisionID(exercise.projectRevisionID).then(function (resp) {
			if (!(typeof (resp.revisionID) == 'undefined')) {
					console.log('already clicked');
					//TODO
					//check if the current user is in validation coders then open coding editor if the user is in the list
			}
			else {
				//if not, then create the ExerciseProject:
				ExerciseEndpoint.createExerciseProject(exercise.projectRevisionID, exercise.id).then (function (resp2) {
					console.log(resp2);
					//then redirect to coding editor
				})
			}
		});
	}

	render() {
		var _this = this;

		//Render Components
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.exercises.slice(firstItem, lastItem);

		function prjClick(prj) {}

		const renderListItems = itemsToDisplay.map((exercise, index) => {
			return <StyledListItemDefault key={index} className="clickable">
					<span > {exercise.name} </span>
						<div>
						<StyledListItemBtn onClick={(e) => this.editorClick(e, exercise, index)} className=" btn fa-lg" color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
							<i className="fa fa-tags"></i>
						</StyledListItemBtn>
					</div>
				</StyledListItemDefault>;
		})



		return (
			<div>
				<StyledBoxList key={"itemList"}>
					{renderListItems}
	            </StyledBoxList>
				{this.renderPaginationIfNeccessary()}
     		</div>
		);
	}


}
