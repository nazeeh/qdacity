import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledName = styled.span`
	margin-left: 5px;
`;

const StyledHeading = styled.h5`
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
		var courseName = this.props.course.name ? this.props.course.name : '';
		var termCourseName = this.props.termCourse.term
			? this.props.termCourse.term
			: '';
		return (
			<StyledHeading>
				<i className="fa fa-newspaper-o" />
				<StyledName onClick={e => this.courseTitleClicked(e)}>
					<FormattedMessage
						id="titlerow.this_course"
						defaultMessage="This course: {name}"
						values={{ name: courseName }}
					/>
				</StyledName>
				--&gt;
				<StyledName>
					<FormattedMessage
						id="titlerow.term_course"
						defaultMessage="TermCourse: {name}"
						values={{ name: termCourseName }}
					/>
				</StyledName>
			</StyledHeading>
		);
	}
}
