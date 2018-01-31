import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import Alert from '../../../common/modals/Alert';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

export default class ReCodeBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	requestValidationAccess() {
		const { formatMessage } = IntlProvider.intl;
		var projectEndpoint = new ProjectEndpoint();

		projectEndpoint
			.requestValidationAccess(this.props.revId)
			.then(function(val) {
				new Alert(
					formatMessage({
						id: 'recode.btn.request_sucessful',
						defaultMessage:
							'You have successfully requested a copy of this revision.\n' +
							' You will be notified by email when the project owner authorizes your request.\n' +
							' Once authorized you will see your copy on your dashboard.'
					})
				).showModal();
			})
			.catch(handleBadResponse);
	}

	render() {
		return (
			<a
				onClick={() => this.requestValidationAccess()}
				className="btn btn-info btn-xs "
			>
				<FormattedMessage id="recode.btn.recode" defaultMessage="Re-Code" />
			</a>
		);
	}
}
