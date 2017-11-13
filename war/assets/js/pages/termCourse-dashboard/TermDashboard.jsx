import React from 'react';
import styled from 'styled-components';


import CourseEndpoint from 'endpoints/CourseEndpoint';
import 'script-loader!../../../../components/URIjs/URI.min.js';
import 'script-loader!../../../../components/alertify/alertify-0.3.js';
import TermCourse from './TermCourse';

const StyledDashboard = styled.div `
	margin-top: 35px;
`;

export default class TermDashboard extends React.Component {
	constructor(props) {
		super(props);

		var urlParams = URI(window.location.search).query(true);

		var termCourse = new TermCourse(urlParams.termCourse);

	}


	render() {

		return (
			<StyledDashboard className="container main-content">
				<div className="row">
					<div className="box box-default">
						<div className="box-header with-border">
							<h3 className="box-title">Excersises</h3>
						</div>
					</div>
				</div>
		  	</StyledDashboard>
		);
	}
}
