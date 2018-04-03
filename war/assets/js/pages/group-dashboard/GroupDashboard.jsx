//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';
import GroupUserList from './GroupUserList.jsx';
import ProjectList from '../personal-dashboard/ProjectList.jsx';


const StyledDashboard = styled.div`
    margin-top: 35px;
    margin-left: 15px;
    margin-right: 15px;
    
    display: grid;
    grid-gap: 20px;
    grid-template-areas:
        "header header header"
        "projects courses users"
`;

const StyledPageHeader = styled.div`
    grid-area: header;

    padding-left: 20px;
`;

const StyledUserGroupName = styled.span`
    margin-left: 5px;
`;

const StyledUserListWrapper = styled.div`
    grid-area: users;
`;

const StyledProjectListWrapper = styled.div`
    grid-area: projects;
`;


export default class GroupDashboard extends Component {
	constructor(props) {
        super(props);

        const urlParams = URI(window.location.search).query(true);

        this.state = {
            userGroupId: urlParams.userGroup,
            userGroup: {
                name: ''
            },
            isOwner: false,
            isParticipant: false,
            projects: []
        }
        
        this.init(this.state.userGroupId);

		this.setProjects = this.setProjects.bind(this);
		this.addProject = this.addProject.bind(this);
		this.removeProject = this.removeProject.bind(this);
    }

    
	setProjects(projects) {
		this.setState({
			projects: projects
		});
	}

	addProject(project) {
		this.state.projects.push(project);
		this.setState({
			projects: this.state.projects
		});
	}

	removeProject(index) {
		this.state.projects.splice(index, 1);
		this.setState({
			projects: this.state.projects
		});
	}

    init(userGroupId) {
        const _this = this;

        UserGroupEndpoint.getUserGroupById(userGroupId)
            .then(function(resp) {
                _this.setState({
                    userGroup: resp,
                    isOwner: (resp.owners || []).includes(_this.props.auth.userProfile.qdacityId),
                    isParticipant: (resp.isParticipant || []).includes(_this.props.auth.userProfile.qdacityId)
                });        
            })
    }

    render() {
        if(!this.props.auth.authState.isUserSignedIn) {
            return <UnauthenticatedUserPanel history={this.props.history} auth={this.props.auth} />;
        }
        
        return (
            <StyledDashboard>
                <StyledPageHeader className="page-header">
                    <i className="fa fa-users" />
                    <StyledUserGroupName>{this.state.userGroup.name}</StyledUserGroupName>
                </StyledPageHeader>

                <StyledProjectListWrapper>
                    <ProjectList 
                        projects={this.state.projects}
                        setProjects={this.setProjects}
                        addProject={this.addProject}
                        removeProject={this.removeProject}
                        userGroups={[this.state.userGroup]}
                        userGroupId={this.state.userGroupId}
                        history={this.props.history}
                    />
                </StyledProjectListWrapper>

                <StyledUserListWrapper>
                    <GroupUserList 
                        userGroup={this.state.userGroup} 
                        isOwner={this.state.isOwner}
                    />
                </StyledUserListWrapper>
			</StyledDashboard>
        );
    }
}