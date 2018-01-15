import React from 'react'
import styled from 'styled-components';
import {
	FormattedMessage
} from 'react-intl';

const StyledPage = styled.div `
	margin-top: 35px;
`;

export default class Faq extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<StyledPage className="container main-content">
				<h1><FormattedMessage id='faq.title' defaultMessage='FAQ' /></h1>
				<h2><FormattedMessage id='faq.signin.title' defaultMessage='Signin problems' /></h2>
				<div>
					<FormattedMessage id='faq.signin.description' defaultMessage='If you are experiencing trouble registering or signing in try the following:' />
					<ul>
						<li><FormattedMessage id='faq.signin.signout' defaultMessage='Sign out of all accounts you use for signing into or registering for QDAcity. If you want to use your google account, sign out of all google accounts on the machine you are using.' /></li>
					</ul>
				</div>
				<div>

				</div>
			</StyledPage>
		);
	}
}