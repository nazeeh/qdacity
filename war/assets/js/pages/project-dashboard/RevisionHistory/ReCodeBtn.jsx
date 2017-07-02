import React from 'react'

import Alert from '../../../common/modals/Alert';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

export default class ClassName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	requestValidationAccess() {
		var projectEndpoint = new ProjectEndpoint();

		projectEndpoint.requestValidationAccess(this.props.revId)
			.then(
				function (val) {
					(new Alert("You have successfully requested a copy of this revision."
						+ "<br/> You will be notified by email when the project owner authorizes your request."
						+ "<br/> Once authorized you will see your copy on your dashboard.")).showModal();
				})
			.catch(handleBadResponse);
	}

	render() {
		return (
			<a onClick={() => this.requestValidationAccess()} className="btn btn-info btn-xs ">Re-Code</a>
		);
	}
}