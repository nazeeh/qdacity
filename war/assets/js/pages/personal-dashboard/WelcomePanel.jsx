import React from 'react';

export default class WelcomePanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="welcome" className="jumbotron">
				<h1>Welcome {this.props.account.getProfile().getGivenName()}</h1>
				<p>QDAcity is currently in beta. We appreciate feedback to
					<a href="mailto:support@qdacity.com?Subject=QDAcity%20support">
						<span> support@qdacity.com</span>
					</a>.
				</p>
				<p>For NYT WS2017 at FAU please request access to <a href="project-dashboard.html?project=6263559650541568&amp;type=PROJECT">this project</a> by clicking "Re-Code" for a specific revision. You will then need to wait for authorization.</p>
			</div>
		);
	}
}