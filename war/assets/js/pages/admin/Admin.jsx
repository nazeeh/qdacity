import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BtnPrimary } from '../../common/styles/Btn.jsx';
import styled from 'styled-components';
import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

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

		const urlParts = this.props.history.location.pathname.split('/');
		let page = urlParts[urlParts.length - 1];
		page = page === 'Admin' ? SelectedPage.CONTROL : page;

		this.state = {
			selectedPage: page
		};
	}

	navigateTo(to) {
		this.setState({
			selectedPage: to
		});
		this.props.history.push('/Admin/' + to);
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn ||
			!this.props.auth.authState.isUserRegistered
		) {
			return <UnauthenticatedUserPanel history={this.props.history} />;
		}

		const page = this.state.selectedPage;
		return (
			<StyledContainer className="container main-content">
				<StyledButtonGroup className="btn-group">
					<BtnPrimary
						active={page === SelectedPage.STATISTICS}
						onClick={() => this.navigateTo('Stats')}
					>
						<FormattedMessage
							id="admin.section.stats"
							defaultMessage="Statistics"
						/>
					</BtnPrimary>
					<BtnPrimary
						active={page === SelectedPage.COSTS}
						onClick={() => this.navigateTo('Costs')}
					>
						<FormattedMessage id="admin.section.costs" defaultMessage="Costs" />
					</BtnPrimary>
					<BtnPrimary
						active={page === SelectedPage.CONTROL}
						onClick={() => this.navigateTo('Control')}
					>
						<FormattedMessage
							id="admin.section.control"
							defaultMessage="Administration"
						/>
					</BtnPrimary>
				</StyledButtonGroup>
			</StyledContainer>
		);
	}
}
