//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';
import {
    ItemList,
    StyledListItemDefault,
    StyledListItemPrimary,
	StyledListItemBtn
} from '../../common/styles/ItemList.jsx';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint.js';

export default class GroupProjectList extends Component {
	constructor(props) {
        super(props);

        this.state = {
            projects: []
        };

        this.renderProject = this.renderProject.bind(this);
		this.editorClick = this.editorClick.bind(this);

        this.collectProjects();
    }

    async collectProjects() {
        const resp = await ProjectEndpoint.listProjectByUserGroupId(this.props.userGroupId);  
        for(const project of resp.items) {
            project.type = 'PROJECT';
        }
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

    editorClick(e, prj, index) {
		e.stopPropagation();
		this.props.history.push(
			'/CodingEditor?project=' + prj.id + '&type=' + prj.type
		);
	}

    renderProject(project, index) {
        return (
            <StyledListItemDefault
                key={project.id}
            >
            {project.name}

            <StyledListItemBtn
					onClick={e => this.editorClick(e, project, index)}
					className=" btn fa-lg"
					color={Theme.darkGreen}
					colorAccent={Theme.darkGreenAccent}
				>
					<i className="fa fa-tags" />
            </StyledListItemBtn>
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