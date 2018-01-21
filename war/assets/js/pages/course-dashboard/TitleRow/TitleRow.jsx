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

	render() {
		var courseName = this.props.course.name ? this.props.course.name : '';
		return (
			<StyledHeading>
				<i className="fa fa-newspaper-o" />
				<StyledName onClick={e => this.courseTitleClicked(e)}>
					<FormattedMessage
						id="titlerow.course"
						defaultMessage="This course: {name}"
						values={{ name: courseName }}
					/>
				</StyledName>
			</StyledHeading>
		);
	}
}
