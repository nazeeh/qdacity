import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import Course from './Course';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';

const StyledDashboard = styled.div `
	margin-top: 35px;
`;

export default class CourseDashboard extends React.Component {
	constructor(props) {
		super(props);
		var urlParams = URI(window.location.search).query(true);

		var course = new Course(urlParams.course);

		this.state = {
			course: course,
		};
		$("body").css({
			overflow: "auto"
		});
	}

	init() {
		if (!this.userPromise) {
			this.userPromise = this.props.account.getCurrentUser();
			this.setCourseProperties();
		}
	}



	setCourseProperties() {
		var _this = this;
		var course = this.state.course;
		CourseEndpoint.getCourse(course.getId()).then(function (resp) {
			course.setName(resp.name);
			course.setDescription(resp.description);
			console.log(course.name);
		});
	}



	render() {
		if (!this.props.account.getProfile) return null;
		this.init();

		return (
			<StyledDashboard className="container main-content">

		  	</StyledDashboard>
		);
	}
}
