import React from 'react';
import Jumbotron from '../../common/styles/Jumbotron';

export default class AdvertPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Jumbotron id="welcome" >
				<h1>Shameless Advertisement</h1>
				<div>
					<p>
						We offer <b>paid student jobs</b> to further develop QDAcity. Come talk to us if you are interested.
					</p>
					<p>
						If you don't have a topic for your <b>final thesis</b> yet, and like to program and build stuff, we've also got you covered.
						We are offering a variety of final thesis for students looking to program something awesome as part of a final thesis.
					</p>
					<p>
						In both cases, shoot us an email and we will get back to you.
						<a href="mailto:support@qdacity.com?Subject=QDAcity%20support">
							<span> support@qdacity.com</span>
						</a>
					</p>
					<p>
						For other types of jobs, check
						<a href="https://osr.cs.fau.de/people/jobs/student-jobs/" > our blog</a>.
					</p>


				</div>
			</Jumbotron>
		);
	}
}