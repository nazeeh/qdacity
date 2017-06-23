import React from 'react'

export default class ClassName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	requestValidationAccess(revId) {
		var projectEndpoint = new ProjectEndpoint();

		projectEndpoint.requestValidationAccess(revId)
			.then(
				function (val) {
					alertify.success("Request has been filed");
				})
			.catch(handleBadResponse);
	}

	render(){
		return(
			<a onClick={() => this.requestValidationAccess()} className="btn btn-info btn-xs ">Re-Code</a>
		);
	}
}
