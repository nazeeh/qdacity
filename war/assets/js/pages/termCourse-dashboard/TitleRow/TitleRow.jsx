import React from 'react';
import styled from 'styled-components';

const StyledName = styled.span `
	margin-left: 5px;
`;

const StyledHeading = styled.h5 `
	margin-left: 5px;
`;

export default class TitleRow extends React.Component {
	constructor(props) {
		super(props);

	}

	courseTitleClicked(e) {
		this.props.history.push('/CourseDashboard?course=' + this.props.course.id);
	}
	
	render() {
		var courseName = (this.props.course.name ? this.props.course.name : "")
		var termCourseName = (this.props.termCourse.term ? this.props.termCourse.term : "")
		return (
			<StyledHeading>
			<i className="fa fa-newspaper-o"></i>
			<StyledName onClick={(e) => this.courseTitleClicked(e)}>
				This course: {courseName}
			</StyledName>
			-->
				<StyledName>
					TermCourse: {termCourseName}
				</StyledName>
          </StyledHeading>
		);
	}


}
