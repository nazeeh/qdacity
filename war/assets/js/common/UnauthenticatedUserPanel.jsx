import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import ReactLoading from '../common/ReactLoading.jsx';
import SigninFormula from '../pages/index/sign-in/SigninFormula.jsx';

const StyledPanel = styled.div`
	padding: 20px 50px 20px 50px;
	border: 1px solid ${props => props.theme.borderDefault};
	background-color: ${props => props.theme.defaultPaneBg};
	& > div {
		font-size: 18px;
	}
`;

const CenteredDiv = styled.div`
	flex-grow: 1;
	text-align: center;
	max-width: 500px;
	display: block;
	margin-left: auto;
	margin-right: auto;
	margin-top: 250px;
	margin-bottom: 20px;
`;

export default class UnauthenticatedUserPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true
		};
		const timeout = props.timeout || 2000;

		const _this = this;
		setTimeout(function() {
			_this.setState({
				loading: false
			});
		}, timeout);
	}

	render() {
		if (this.state.loading) {
			return (
				<CenteredDiv>
					<ReactLoading color="#000" size={100} />
				</CenteredDiv>
			);
		} else {
			return (
				<CenteredDiv>
					<StyledPanel>
						<h4>
							<FormattedMessage
								id="unauthenticated_user_panel.not_logged_in_statement"
								defaultMessage="You are currently not logged in!"
							/>
						</h4>
						<p>
							<FormattedMessage
								id="unauthenticated_user_panel.sign_in_or_register_note"
								defaultMessage="Please sign-in or register to access this page."
							/>
						</p>
						<SigninFormula
							auth={this.props.auth}
							onSignedIn={() => {
								location.reload();
							}}
						/>
					</StyledPanel>
				</CenteredDiv>
			);
		}
	}
}
