import React from 'react';
import Jumbotron from '../../common/styles/Jumbotron';

export default class WelcomePanel extends React.Component {
	constructor(props) {
		super(props);
		this.redirectToNytProject = this.redirectToNytProject.bind(this);
	}

	redirectToNytProject() {
		this.props.history.push('/ProjectDashboard?project=6263559650541568&amp;type=PROJECT');
	}

	render() {
		return (
			<Jumbotron id="welcome" >
				<h1>Welcome {this.props.account.getProfile().getGivenName()}</h1>
				<div>
					<p>QDAcity is currently in beta. We appreciate feedback to
						<a href="mailto:support@qdacity.com?Subject=QDAcity%20support">
							<span> support@qdacity.com</span>
						</a>.
					</p>
					<p>For <b>NYT WS2017 at FAU</b> please request access to <a onClick={this.redirectToNytProject} className="clickable">this project</a> by clicking "Re-Code" for a specific revision. You will then need to wait for authorization.</p>
				</div>
			</Jumbotron>
		);
	}
}