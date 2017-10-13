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
		this.init();
	}

	init() {
		var _this = this;
		var course = this.props.course;
		CourseEndpoint.getCourse(course.getId()).then(function (resp) {
			course.setName(resp.name);
			course.setDescription(resp.description);
			CourseEndpoint.getTermsCourse(course.getId()).then(function (resp2) {
				var termList = [];
				resp2.items = resp2.items || [];
				resp2.items.forEach(function (crs) {
					termList.push ({
					text: crs.term,
					id: crs.id
				});
				});
				course.setTerms(termList);
				console.log(course);
				_this.props.setCourse(course);
			});
		});
	}

	joinTermCourse(e, term, index) {
		var _this = this;
		e.stopPropagation();

		var confirm = new Confirm('Do you want to join the term ' + term.text + ' of this course?');
		confirm.showModal().then(function () {
			CourseEndPoint.addParticipant(term.id).then(function (resp) {
				console.log(resp);
			});
		});

	}


	render() {
		var _this = this;

		const renderListItemContent = (term, index) => {
			return ([
				<span>{term.text}</span>,
					<div>
						<StyledListItemBtn onClick={(e) => this.joinTermCourse(e, term, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
							<i className="fa fa-trash "></i>
						</StyledListItemBtn>
					<StyledListItemBtn className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
						<i className="fa fa-trash "></i>
					</StyledListItemBtn>
				</div>
			])
		}
		var course = this.props.course;
		const itemsToDisplay = this.props.course.terms;
		const renderListItems = itemsToDisplay.map((term, index) => {
			return <StyledListItemPrimary>
						{renderListItemContent(term, index)}
					</StyledListItemPrimary>;

		})

		return (
			<div>
				<StyledProjectList className="">
					{renderListItems}
	            </StyledProjectList>
     		</div>
		);
	}


}
