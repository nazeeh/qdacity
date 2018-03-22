//@ts-check
import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import SignInFormula from './SigninFormula.jsx';

import { BtnLg } from '../../../common/styles/Btn.jsx';

const PanelWrapper = styled.div`
	border: 1px solid ${props => props.theme.borderPrimaryHighlight};
	padding: 20px 50px 20px 50px;
	margin-bottom: 20px;
	padding-bottom: 20px;
	background-color: ${props => props.theme.defaultPaneBg};
	color: ${props => props.theme.defaultText};
	margin-left: auto;
	margin-right: auto;
	width: 90%;
	max-width: 400px;
	opacity: 0.8;
	& > div {
		font-size: 18px;
	}
`;

export default class SigninPanel extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
            <PanelWrapper className="container-fluid">
				<SignInFormula 
					theme={this.props.theme}
					auth={this.props.auth}
					history={this.props.history}/>
            </PanelWrapper>
		);
	}
}
