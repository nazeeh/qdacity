//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import UserGroupEndpoint from '../../common/endpoints/UserGroupEndpoint.js';

import UnauthenticatedUserPanel from '../../common/UnauthenticatedUserPanel.jsx';
import GroupUserList from './GroupUserList.jsx';
import ProjectList from '../personal-dashboard/ProjectList.jsx';
import CourseList from '../personal-dashboard/CourseList.jsx';


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

const StyledCourseListWrapper = styled.div`
    grid-area: courses;
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
            projects: [],
            courses: []
        }
        
        this.init(this.state.userGroupId);

		this.setProjects = this.setProjects.bind(this);
		this.addProject = this.addProject.bind(this);
        this.removeProject = this.removeProject.bind(this);
        
		this.setCourses = this.setCourses.bind(this);
		this.addCourse = this.addCourse.bind(this);
		this.removeCourse = this.removeCourse.bind(this);
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

	setCourses(courses) {
		this.setState({
			courses: courses
		});
	}

	addCourse(course) {
		this.state.courses.push(course);
		this.setState({
			courses: this.state.courses
		});
	}

	removeCourse(index) {
		this.state.courses.splice(index, 1);
		this.setState({
			courses: this.state.courses
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
                    <div>
                        <div className="box box-default">
                            <div className="box-header with-border">
                                <h3 className="box-title">
                                    <FormattedMessage
                                        id="groupdashboard.projects"
                                        defaultMessage="Projects"
                                    />
                                </h3>
                            </div>
                            <div className="box-body">
                                <ProjectList 
                                    projects={this.state.projects}
                                    setProjects={this.setProjects}
                                    addProject={this.addProject}
                                    removeProject={this.removeProject}
                                    userGroups={[this.state.userGroup]}
                                    userGroupId={this.state.userGroupId}
                                    history={this.props.history}
                                />
                            </div>
                        </div>
                    </div>
                </StyledProjectListWrapper>

                <StyledCourseListWrapper>
                    <div>
                        <div className="box box-default">
                            <div className="box-header with-border">
                                <h3 className="box-title">
                                    <FormattedMessage
                                        id="groupdashboard.courses"
                                        defaultMessage="Courses"
                                    />
                                </h3>
                            </div>
                            <div className="box-body">
                                 <CourseList
										courses={this.state.courses}
										setCourses={this.setCourses}
										addCourse={this.addCourse}
										removeCourse={this.removeCourse}
                                        userGroups={[this.state.userGroup]}
                                        userGroupId={this.state.userGroupId}
										history={this.props.history}
									/>
                            </div>
                        </div>
                    </div>
                </StyledCourseListWrapper>

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