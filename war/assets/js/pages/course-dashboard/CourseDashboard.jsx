import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import TermCourseList from './TermCourseList.jsx';
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
		this.setCourse = this.setCourse.bind(this);
		this.state = {
			course: course
		};
		$("body").css({
			overflow: "auto"
		});
	}
	setCourse(course) {
		this.setState({
			course: course
		});
		console.log(this.state.course);
	}
	init() {
		this.setCourseProperties();
	}

	setCourseProperties() {
		var _this = this;
		var course = this.state.course;
	}

	render() {

		if (!this.props.account.getProfile) return null;
		this.init();

		return (
			<StyledDashboard className="container main-content">
				<div>
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">Terms</h3>
						</div>
						<div className="box-body">
							<TermCourseList account={this.props.account} course={this.state.course} setCourse={this.setCourse}/>
						</div>
					</div>
				</div>


		  	</StyledDashboard>
		);
	}
}
