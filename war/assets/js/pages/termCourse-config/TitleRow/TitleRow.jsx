import React from 'react';
import styled from 'styled-components';

const StyledProjectName = styled.span `
	margin-left: 5px;
`;

export default class TitleRow extends React.Component {
	constructor(props) {
		super(props);

	}


	render() {
		var termCourseName = (this.props.termCourse.term ? this.props.termCourse.term : "")
		console.log(termCourseName);
		return (
			<h3>
			<i className="fa fa-newspaper-o"></i>
				<StyledProjectName>
					{termCourseName}
				</StyledProjectName>
          </h3>
		);
	}


}