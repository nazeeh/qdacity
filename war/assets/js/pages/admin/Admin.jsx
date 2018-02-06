import React from 'react';
import { FormattedMessage } from 'react-intl';

import {BtnDefault} from "../../common/styles/Btn.jsx";
import styled from 'styled-components';

const StyledContainer = styled.div`
	margin-bottom: -50px;
`;

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';

export default class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: [],
			selectedUserId: ''
		};

		this.setProjects = this.setProjects.bind(this);
		this.removeProject = this.removeProject.bind(this);

		scroll(0, 0);
	}

	setSelectedUserId(userId) {
		this.setState({
			selectedUserId: userId
		});
	}

	setProjects(projects) {
		this.setState({
			projects: projects
		});
	}

	removeProject(index) {
		this.state.projects.splice(index, 1);
		this.setState({
			projects: this.state.projects
		});
	}

	navigateTo(to) {
		this.props.history.push(
			'/Admin/' + to
		);
	}

	render() {
		if (
			!this.props.auth.authState.isUserSignedIn ||
			!this.props.auth.authState.isUserRegistered
		) {
			return <UnauthenticatedUserPanel history={this.props.history} />;
		}
		return (
			<StyledContainer className="container main-content">
				<div className="row">
					<BtnDefault
						onClick={() => this.navigateTo("Stats")}
					>
						<FormattedMessage id="admin.section.stats" defaultMessage="Statistics" />
					</BtnDefault>
					<BtnDefault
						onClick={() => this.navigateTo("Costs")}
					>
						<FormattedMessage id="admin.section.stats" defaultMessage="Costs" />
					</BtnDefault>
					<BtnDefault
						onClick={() => this.navigateTo("Control")}
					>
						<FormattedMessage id="admin.section.control" defaultMessage="Administration" />
					</BtnDefault>
				</div>
			</StyledContainer>
		);
	}
}
