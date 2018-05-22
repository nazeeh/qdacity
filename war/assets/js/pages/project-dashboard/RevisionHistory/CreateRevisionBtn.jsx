import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import TextField from '../../../common/modals/TextField';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledCreateRevisionBtn = BtnDefault.extend`
	margin-left: 5px;
	& > i {
		padding-right: 5px;
	}
`;

export default class CreateRevisionBtn extends React.Component {
	constructor(props) {
		super(props);
	}

	showNewRevisionModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var modal = new TextField(
			formatMessage({
				id: 'createrevisionbtn.revision_comment',
				defaultMessage: 'Revision Comment'
			}),
			formatMessage({
				id: 'createrevisionbtn.revision_comment.sample',
				defaultMessage:
					'Use this field to describe this revision in a few sentences'
			})
		);
		modal.showModal().then(function(text) {
			_this.props.createNewRevision(_this.props.project.getId(), text);
		});
	}

	render() {
		if (this.props.isProjectOwner) {
			return (
				<StyledCreateRevisionBtn id="CreateRevisionBtn"
					type="button"
					className="pull-right"
					onClick={() => this.showNewRevisionModal()}
				>
					<i className="fa fa-plus-circle fa-lg" />
					<b>
						<FormattedMessage
							id="createrevisionbtn.create_revision"
							defaultMessage="Create Revision"
						/>
					</b>
				</StyledCreateRevisionBtn>
			);
		} else {
			return '';
		}
	}
}
