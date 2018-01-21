import React from 'react';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';
import Confirm from '../../common/modals/Confirm';
import IntlProvider from '../../common/Localization/LocalizationProvider';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

import { BtnDefault } from '../../common/styles/Btn.jsx';

export default class AdminProjectList extends React.Component {
	constructor(props) {
		super(props);
		this.init();

		this.renderProject = this.renderProject.bind(this);
		this.editorClick = this.editorClick.bind(this);
		this.prjClick = this.prjClick.bind(this);
	}

	init() {
		this.fetchProjects(this.props.userId);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.userId !== this.props.userId) {
			this.fetchProjects(nextProps.userId);
		}
	}

	fetchProjects(userId) {
		if (!userId) {
			this.props.setProjects([]);
			return;
		}
		var _this = this;
		var projectList = [];
		var validationPrjPromise = ProjectEndpoint.listValidationProjectByUserId(
			userId
		);
		ProjectEndpoint.listProjectByUserId(userId).then(function(resp) {
			resp.items = resp.items || [];
			resp.items.forEach(function(prj) {
				prj.type = 'PROJECT';
			});
			var projects = projectList.concat(resp.items);

			validationPrjPromise.then(function(resp2) {
				resp2.items = resp2.items || [];
				resp2.items.forEach(function(prj) {
					prj.type = 'VALIDATION';
				});
				projects = projects.concat(resp2.items);
				projects = _this.sortProjects(projects);
				_this.props.setProjects(projects);
			});
		});
	}

	sortProjects(projects) {
		projects.sort(function(a, b) {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
		return projects;
	}

	deleteProject(e, project, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'adminprojectlist.delete_project',
					defaultMessage: 'Do you want to delete the project {name}?'
				},
				{ name: project.name }
			)
		);
		confirm.showModal().then(function() {
			ProjectEndpoint.removeProject(project.id).then(function(resp) {
				// remove project from parent state
				_this.props.removeProject(index);
			});
		});
	}

	isValidationProject(project) {
		if (project.type == 'VALIDATION') return true;
		return false;
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

	editorClick(e, prj, index) {
		e.stopPropagation();
		this.props.history.push(
			'/CodingEditor?project=' + prj.id + '&type=' + prj.type
		);
	}

	prjClick(prj) {
		_this.props.history.push(
			'/ProjectDashboard?project=' + prj.id + '&type=' + prj.type
		);
	}

	renderListItemContent(project, index) {
		return [
			<span>{project.name}</span>,
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
		];
	}

	renderProject(project, index) {
		if (this.isValidationProject(project)) {
			return (
				<StyledListItemDefault
					key={project.id}
					onClick={this.prjClick}
					clickable={true}
				>
					{this.renderListItemContent(project, index)}
				</StyledListItemDefault>
			);
		} else {
			return (
				<StyledListItemPrimary
					key={project.id}
					onClick={this.prjClick}
					clickable={true}
				>
					{this.renderListItemContent(project, index)}
				</StyledListItemPrimary>
			);
		}
	}

	render() {
		return (
			<ItemList
				hasSearch={true}
				hasPagination={true}
				itemsPerPage={8}
				items={this.props.projects}
				renderItem={this.renderProject}
			/>
		);
	}
}
