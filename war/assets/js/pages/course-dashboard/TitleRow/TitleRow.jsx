import React from 'react';
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

	render() {
		var courseName = this.props.course.name ? this.props.course.name : '';
		return (
			<StyledHeading>
				<i className="fa fa-newspaper-o" />
				<StyledName onClick={e => this.courseTitleClicked(e)}>
					This course: {courseName}
				</StyledName>
			</StyledHeading>
		);
	}
}
