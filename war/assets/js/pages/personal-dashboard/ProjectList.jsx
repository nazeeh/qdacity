import React from 'react';
import {
	FormattedMessage
} from 'react-intl';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../common/styles/Theme.js';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';
import Confirm from '../../common/modals/Confirm';

import {
	StyledBoxList,
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledListItemPrimary,
	StyledListItemDefault
} from '../../common/styles/List';

import StyledSearchField from '../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../common/styles/Btn.jsx';

const StyledNewPrjBtn = styled.div `
	padding-left: 5px;
`;

const StyledProjectListMenu = styled.div `
	display:flex;
	flex-direction:row;
	& > .searchfield{
		height: inherit !important;
		flex:1;
	}
`;


const StyledProjectList = StyledBoxList.extend `
	padding-top: 5px;
`;


export default class ProjectList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.init();

		this.paginationClick = this.paginationClick.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
		this.showNewProjectModal = this.showNewProjectModal.bind(this);
		this.createNewProject = this.createNewProject.bind(this);
		this.editorClick = this.editorClick.bind(this);
	}

	init() {
		var _this = this;
		var projectList = [];
		var validationPrjPromise = ProjectEndpoint.listValidationProject();
		ProjectEndpoint.listProject().then(function (resp) {
			resp.items = resp.items || [];
			resp.items.forEach(function (prj) {
				prj.type = "PROJECT";
			});
			var projects = projectList.concat(resp.items)

			validationPrjPromise.then(function (resp2) {
				resp2.items = resp2.items || [];
				resp2.items.forEach(function (prj) {
					prj.type = "VALIDATION";
				});
				projects = projects.concat(resp2.items)
				projects = _this.sortProjects(projects);
				_this.props.setProjects(projects);
			});
		});
	}

	sortProjects(projects) {
		projects.sort(function (a, b) {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
		return projects;
	}

	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}

	leaveProject(e, project, index) {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var decider = new BinaryDecider(
			formatMessage({
				id: 'projectlist.leave_project',
				defaultMessage: 'Please confirm leaving this project'
			}),
			formatMessage({
				id: 'projectlist.cancel',
				defaultMessage: 'Cancel'
			}),
			formatMessage({
				id: 'projectlist.leave',
				defaultMessage: 'Leave'
			})
		);
		decider.showModal().then(function (value) {
			if (value == 'optionB') {
				var type = project.type;
				if (typeof type == 'undefined') type = "PROJECT";
				ProjectEndpoint.removeUser(project.id, type).then(function (resp) {
					_this.props.removeProject(index);
				});
			}
		});
	}

	deleteProject(e, project, index) {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		var confirm = new Confirm(
			formatMessage({
				id: 'projectlist.confirm_delete',
				defaultMessage: 'Do you want to delete the project {name}?'
			}, {
				name: project.name
			})
		);
		confirm.showModal().then(function () {
			ProjectEndpoint.removeProject(project.id).then(function (resp) {
				// remove project from parent state
				_this.props.removeProject(index);
			});
		});

	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});

	}

	isActivePage(page) {
		return (page == this.state.currentPage);
	}

	isValidationProject(project) {
		if (project.type == "VALIDATION") return true;
		return false;
	}

	showNewProjectModal() {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		var modal = new CustomForm(
			formatMessage({
				id: 'projectlist.create_project',
				defaultMessage: 'Create a new project'
			}), '');
		modal.addTextInput('name', formatMessage({
			id: 'projectlist.project_name',
			defaultMessage: "Project Name"
		}), 'Name', '');
		modal.addTextField('desc', formatMessage({
			id: 'projectlist.project_desc',
			defaultMessage: "Project Description"
		}), 'Description');
		modal.showModal().then(function (data) {
			_this.createNewProject(data.name, data.desc);
		});
	}

	createNewProject(name, description) {
		var _this = this;
		CodesystemEndpoint.insertCodeSystem(0, "PROJECT").then(function (codeSystem) {
			var project = {};
			project.codesystemID = codeSystem.id;
			project.maxCodingID = 0;
			project.name = name;
			project.description = description;
			ProjectEndpoint.insertProject(project).then(function (insertedProject) {
				codeSystem.project = insertedProject.id;

				CodesystemEndpoint.updateCodeSystem(codeSystem).then(function (updatedCodeSystem) {
					insertedProject.type = "PROJECT";
					_this.props.addProject(insertedProject);
				});
			});
		});
	}

	renderDeleteBtn(project, index) {

		if (typeof project.revisionID == "undefined") {
			return <StyledListItemBtn onClick={(e) => this.deleteProject(e, project, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
						<i className="fa fa-trash "></i>
					</StyledListItemBtn>
		} else {
			return "";
		}
	}

	editorClick(e, prj, index) {
		e.stopPropagation();
		this.props.history.push('/CodingEditor?project=' + prj.id + '&type=' + prj.type);
	}

	render() {
		const {
			formatMessage
		} = IntlProvider.intl;
		var _this = this;
		const searchFieldPlaceholder = formatMessage({
			id: 'projectlist.search',
			defaultMessage: 'Search'
		});

		//Render Components

		//Render search and newPrjBtn
		const projectListMenu = <StyledProjectListMenu>
			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder={searchFieldPlaceholder}
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<StyledNewPrjBtn id="newProject">
					<BtnDefault
						id="newPrjBtn"
						href="#"
						onClick={this.showNewProjectModal}

					>
					<i className="fa fa-plus fa-fw"></i>
					<FormattedMessage id='projectlist.new_project' defaultMessage='New Project' />
					</BtnDefault>
				</StyledNewPrjBtn>

			</StyledSearchField>

		</StyledProjectListMenu>

		//Rebder List Items
		var filteredList = this.props.projects.filter(
			(project) => {
				return project.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
			}
		);
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = filteredList.slice(firstItem, lastItem);

		function prjClick(prj) {
			_this.props.history.push('/ProjectDashboard?project=' + prj.id + '&type=' + prj.type);
		}
		const renderListItemContent = (project, index) => {
			return ([
				<span>{project.name}</span>,
				<div>
				{this.renderDeleteBtn(project, index)}
				<StyledListItemBtn onClick={(e) => this.leaveProject(e, project, index)} className=" btn fa-lg" color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
					<i className="fa fa-sign-out"></i>
				</StyledListItemBtn>
				<StyledListItemBtn onClick={(e) => this.editorClick(e, project, index)} className=" btn fa-lg"  color={Theme.darkGreen} colorAccent={Theme.darkGreenAccent}>
					<i className="fa fa-tags"></i>
				</StyledListItemBtn>
			</div>
			])
		}
		const renderListItems = itemsToDisplay.map((project, index) => {
			if (this.isValidationProject(project)) {
				return <StyledListItemDefault key={project.id} onClick={() => prjClick(project)} clickable={true}>
						{renderListItemContent(project, index)}
					</StyledListItemDefault>;
			} else {
				return <StyledListItemPrimary key={project.id} onClick={() => prjClick(project)} clickable={true}>
						{renderListItemContent(project, index)}
					</StyledListItemPrimary>;
			}
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.props.projects.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<StyledPaginationItem
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
				  active={this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				{projectListMenu}
				<StyledProjectList>
					{renderListItems}
	            </StyledProjectList>
	            <StyledPagination>
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}