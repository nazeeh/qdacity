import React from 'react';
import { FormattedMessage } from 'react-intl';

import {BtnPrimary} from "../../common/styles/Btn.jsx";
import styled from 'styled-components';

const StyledContainer = styled.div`
	margin-bottom: -50px;
`;
const StyledButtonGroup = styled.div`
	display: flex;
	justify-content: center;

	padding-bottom: 5px;
`;

const SelectedPage = {
	STATISTICS: 'Stats',
	COSTS: 'Costs',
	CONTROL: 'Control'
};

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPage: SelectedPage.CONTROL
		};
	}

	navigateTo(to) {
		this.setState({
			selectedPage: to
		});
		this.props.history.push(
			'/Admin/' + to
		);
	}

	render() {
		if (!this.props.account.getProfile || !this.props.account.isSignedIn())
			return null;

		const page = this.state.selectedPage;
		return (
			<StyledContainer className="container main-content">
				<StyledButtonGroup className="btn-group">
				<BtnPrimary
						active={page === SelectedPage.STATISTICS}
						onClick={() => this.navigateTo("Stats")}
					>
						<FormattedMessage id="admin.section.stats" defaultMessage="Statistics" />
					</BtnPrimary>
					<BtnPrimary
						active={page === SelectedPage.COSTS}
						onClick={() => this.navigateTo("Costs")}
					>
						<FormattedMessage id="admin.section.stats" defaultMessage="Costs" />
					</BtnPrimary>
					<BtnPrimary
						active={page === SelectedPage.CONTROL}
						onClick={() => this.navigateTo("Control")}
					>
						<FormattedMessage id="admin.section.control" defaultMessage="Administration" />
					</BtnPrimary>
				</StyledButtonGroup>
			</StyledContainer>
		);
	}
}
