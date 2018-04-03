//@ts-check
import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';
import {
    ItemList,
    StyledListItemDefault,
    StyledListItemPrimary,
	StyledListItemBtn
} from '../../common/styles/ItemList.jsx';
import Confirm from '../../common/modals/Confirm';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint.js';

export default class GroupProjectList extends Component {
	constructor(props) {
        super(props);

        this.state = {
            projects: []
        };

        this.renderProject = this.renderProject.bind(this);
		this.editorClick = this.editorClick.bind(this);
		this.projectClick = this.projectClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.collectProjects(nextProps.userGroupId);
    }

    async collectProjects(userGroupId = this.props.userGroupId) {
        const resp = await ProjectEndpoint.listProjectByUserGroupId(userGroupId);  
        const projects = [];
        for(const project of resp.items || []) {
            project.type = 'PROJECT';
            projects.push(project);
        }
        this.setState({
            projects: this.sortProjects(projects)
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
    
    projectClick(e, prj, index) {
		e.stopPropagation();
		this.props.history.push(
			'/ProjectDashboard?project=' + prj.id + '&type=' + prj.type
		);
    }

    deleteProject(e, project, index) {
        e.stopPropagation();
        
		const { formatMessage } = IntlProvider.intl;
        const _this = this;
        
		const confirm = new Confirm(
			formatMessage(
				{
					id: 'group.projectlist.confirm_delete',
					defaultMessage: 'Do you want to delete the project {name}?'
				},
				{
					name: project.name
				}
			)
        );
		confirm.showModal().then(function() {
            console.log('triggered');
			ProjectEndpoint.removeProject(project.id).then(function(resp) {
				_this.collectProjects();
			});
		}, function(err) {
            console.log('Canceled');
        });
	}

    renderProjects() {
        return  <ItemList
                    hasSearch={true}
                    key={'itemlist'}
                    hasPagination={true}
                    itemsPerPage={8}
                    items={this.state.projects}
                    renderItem={this.renderProject}
                />
    }

    renderDeleteBtn(project, index) {
		if (typeof project.revisionID == 'undefined') {
			return (
				<StyledListItemBtn
					onClick={e => this.deleteProject(e, project, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<i className="fa fa-trash " />
				</StyledListItemBtn>
			);
		} else {
			return '';
		}
    }
    
    renderProject(project, index) {
        return (
            <StyledListItemDefault
                key={project.id}
                onClick={e => this.projectClick(e, project, index)}
                clickable='true'
            >
            {project.name}
            <div>
				{this.renderDeleteBtn(project, index)}
                <StyledListItemBtn
                        onClick={e => this.editorClick(e, project, index)}
                        className=" btn fa-lg"
                        color={Theme.darkGreen}
                        colorAccent={Theme.darkGreenAccent}
                    >
                        <i className="fa fa-tags" />
                </StyledListItemBtn>
            </div>
            </StyledListItemDefault>
        );
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