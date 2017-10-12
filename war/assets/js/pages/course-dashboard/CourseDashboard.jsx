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
			course: course
		};
		$("body").css({
			overflow: "auto"
		});
	}

	init() {
		this.setCourseProperties();
	}

	setCourseProperties() {
		var _this = this;
		var course = this.state.course;
		CourseEndpoint.getCourse(course.getId()).then(function (resp) {
			course.setName(resp.name);
			course.setDescription(resp.description);
			CourseEndpoint.getTermsCourse(course.getId()).then(function (resp2) {
				var termList = [];
				resp2.items = resp2.items || [];
				resp2.items.forEach(function (crs) {
					termList.push ({
					text: crs.term,
				});
				});
				course.setTerms(termList);
				_this.setState({
						course: course
					});
				console.log(course);
			});
		});
	}

	render() {

		if (!this.props.account.getProfile) return null;
		this.init();

		return (
			<StyledDashboard className="container main-content">
				<h2 className="page-header">
					this is the course: {this.state.course.getName()}
				</h2>
		  	</StyledDashboard>
		);
	}
}
