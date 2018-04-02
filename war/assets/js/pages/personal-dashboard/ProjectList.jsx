import React from 'react';
import { FormattedMessage } from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';
import Confirm from '../../common/modals/Confirm';

import {
	ItemList,
	ListMenu,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/ItemList.jsx';

import { BtnDefault } from '../../common/styles/Btn.jsx';

const StyledNewPrjBtn = styled.div`
	padding-left: 5px;
`;


export default class ProjectList extends React.Component {
	constructor(props) {
		super(props);

		this.itemList = null;

		this.init();

		this.showNewProjectModal = this.showNewProjectModal.bind(this);
		this.createNewProject = this.createNewProject.bind(this);
		this.editorClick = this.editorClick.bind(this);
		this.renderProject = this.renderProject.bind(this);

		
		const { formatMessage } = IntlProvider.intl;
	}

	init() {
		var _this = this;
		var projectList = [];
		var validationPrjPromise = ProjectEndpoint.listValidationProject();
		ProjectEndpoint.listProject().then(function(resp) {
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

	leaveProject(e, project, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var decider = new BinaryDecider(
			formatMessage({
				id: 'projectlist.leave_project',
				defaultMessage: 'Please confirm leaving this project'
			}),
			formatMessage({
				id: 'modal.cancel',
				defaultMessage: 'Cancel'
			}),
			formatMessage({
				id: 'modal.confirm_leave',
				defaultMessage: 'Leave'
			})
		);
		decider.showModal().then(function(value) {
			if (value == 'optionB') {
				var type = project.type;
				if (typeof type == 'undefined') type = 'PROJECT';
				ProjectEndpoint.removeUser(project.id, type).then(function(resp) {
					_this.props.removeProject(index);
				});
			}
		});
	}

	deleteProject(e, project, index) {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var confirm = new Confirm(
			formatMessage(
				{
					id: 'projectlist.confirm_delete',
					defaultMessage: 'Do you want to delete the project {name}?'
				},
				{
					name: project.name
				}
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

	showNewProjectModal() {
		const { formatMessage } = IntlProvider.intl;
		var _this = this;
		var modal = new CustomForm(
			formatMessage({
				id: 'projectlist.create_project',
				defaultMessage: 'Create a new project'
			}),
			''
		);

		const possibleOwners = [];
		possibleOwners.push({
			id: -1,
			name: formatMessage({
				id: 'projectlist.create_project.owner.me',
				defaultMessage: 'my projects'
			})
		});
		for(const userGroup of _this.props.userGroups) {
			possibleOwners.push({
				id: userGroup.id,
				name: userGroup.name
			});
		}
		modal.addSelectComplexOptions(
			'ownerId',
			possibleOwners,
			formatMessage({
				id: 'projectlist.create_project.owner.add',
				defaultMessage: 'Add to'
			}),
			possibleOwners[0]
		);
		modal.addTextInput(
			'name',
			formatMessage({
				id: 'projectlist.project_name',
				defaultMessage: 'Project Name'
			}),
			formatMessage({
				id: 'projectlist.project_name_template',
				defaultMessage: 'Name'
			}),
			''
		);
		modal.addTextField(
			'desc',
			formatMessage({
				id: 'projectlist.project_desc',
				defaultMessage: 'Project Description'
			}),
			formatMessage({
				id: 'projectlist.project_desc_template',
				defaultMessage: 'Description'
			})
		);
		modal.showModal().then(function(data) {
			_this.createNewProject(data.ownerId, data.name, data.desc);
		});
	}

	createNewProject(ownerId, name, description) {
		var _this = this;
		CodesystemEndpoint.insertCodeSystem(0, 'PROJECT').then(function(
			codeSystem
		) {
			var project = {};
			project.codesystemID = codeSystem.id;
			project.maxCodingID = 0;
			project.name = name;
			project.description = description;

			let insertMethodPromise = undefined;
			let afterInsertMethod = undefined;
			if(ownerId === '-1') {
				// add to user's personal projects
				insertMethodPromise = ProjectEndpoint.insertProject(project);
				afterInsertMethod = function(insertedProject) {
					_this.props.addProject(insertedProject);
				}
			} else {
				// add project to a user group
				insertMethodPromise = ProjectEndpoint.insertProjectForUserGroup(ownerId, project);
				afterInsertMethod = function(insertedProject) {
					_this.props.history.push(
						'/GroupDashboard?userGroup=' + ownerId
					);
				}
			}

			insertMethodPromise.then(function(insertedProject) {
				codeSystem.project = insertedProject.id;

				CodesystemEndpoint.updateCodeSystem(codeSystem).then(function(
					updatedCodeSystem
				) {
					insertedProject.type = 'PROJECT';
					afterInsertMethod(insertedProject);
				});
			});
		});
	}

	editorClick(e, prj, index) {
		e.stopPropagation();
		this.props.history.push(
			'/CodingEditor?project=' + prj.id + '&type=' + prj.type
		);
	}

	projectClick(prj) {
		this.props.history.push(
			'/ProjectDashboard?project=' + prj.id + '&type=' + prj.type
		);
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

	renderProjectContent(project, index) {
		return [
			<span>{project.name}</span>,
			<div>
				{this.renderDeleteBtn(project, index)}
				<StyledListItemBtn
					onClick={e => this.leaveProject(e, project, index)}
					className=" btn fa-lg"
					color={Theme.rubyRed}
					colorAccent={Theme.rubyRedAccent}
				>
					<i className="fa fa-sign-out" />
				</StyledListItemBtn>
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
					onClick={this.projectClick.bind(this, project)}
					clickable={true}
				>
					{this.renderProjectContent(project, index)}
				</StyledListItemDefault>
			);
		} else {
			return (
				<StyledListItemPrimary
					key={project.id}
					onClick={this.projectClick.bind(this, project)}
					clickable={true}
				>
					{this.renderProjectContent(project, index)}
				</StyledListItemPrimary>
			);
		}
	}

	render() {
		return (
			<div>
				<ListMenu>
					{this.itemList ? this.itemList.renderSearchBox() : ''}

					<StyledNewPrjBtn id="newProject">
						<BtnDefault
							id="newPrjBtn"
							href="#"
							onClick={this.showNewProjectModal}
						>
							<i className="fa fa-plus fa-fw" />
							<FormattedMessage
								id="projectlist.new_project"
								defaultMessage="New Project"
							/>
						</BtnDefault>
					</StyledNewPrjBtn>
				</ListMenu>

				<ItemList
					ref={r => {
						if (r) this.itemList = r;
					}}
					hasSearch={true}
					hasPagination={true}
					doNotrenderSearch={true}
					itemsPerPage={8}
					items={this.props.projects}
					renderItem={this.renderProject}
				/>
			</div>
		);
	}
}
