//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import {
    ItemList,
    StyledListItemDefault,
    StyledListItemPrimary
} from '../../common/styles/ItemList.jsx';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint.js';

export default class GroupProjectList extends Component {
	constructor(props) {
        super(props);

        this.state = {
            projects: []
        };

        this.renderProject = this.renderProject.bind(this);

        this.collectProjects();
    }

    async collectProjects() {
        const resp = await ProjectEndpoint.listProjectByUserGroupId(this.props.userGroup.id);  
        this.setState({
            projects: this.sortProjects(resp.items || [])
        });      
    }

    sortProjects(projectList) {
        projectList.sort(function(a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        return projectList;
    }

    renderProject(project, index) {
        return (
            <StyledListItemDefault
                key={project.id}
            >
            {project.name}
            </StyledListItemDefault>
        );
    }

    renderProjects() {
        return  <ItemList
                    key={'itemlist'}
                    hasPagination={true}
                    itemsPerPage={8}
                    items={this.state.projects}
                    renderItem={this.renderProject}
                />
    }
    
    render() {
        return (
            <div className="box box-default">
                <div className="box-header with-border">
                    <h3 className="box-title">
                        <FormattedMessage
                            id="usergroup.projectlist.heading"
                            defaultMessage="Projects"
                        />
                    </h3>
                </div>
                <div className="box-body">{this.renderProjects()}</div>
            </div>
        );
    }
}