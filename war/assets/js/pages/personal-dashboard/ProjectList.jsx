import React from 'react';
import styled from 'styled-components';

import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';

import {
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn
} from '../../common/styles/List';

const StyledNewPrjBtn = styled.div `
	padding-left: 5px;
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
		var _this = this;
		e.stopPropagation();
		var decider = new BinaryDecider('Please confirm leaving this project', 'Cancel', 'Leave');
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
		var _this = this;
		e.stopPropagation();
		ProjectEndpoint.removeProject(project.id).then(function (resp) {
			// remove project from parent state
			_this.props.removeProject(index);
		});
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});

	}

	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}

	isValidationProject(project) {
		return 'clickable ' + ((project.type == "VALIDATION") ? 'validationProjectItem' : ' ');
	}

	showNewProjectModal() {
		var _this = this;
		var modal = new CustomForm('Create a new project', '');
		modal.addTextInput('name', "Project Name", 'Name', '');
		modal.addTextField('desc', "Project Description", 'Description');
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
			return <StyledListItemBtn onClick={(e) => this.deleteProject(e, project, index)} className=" btn  fa-stack fa-lg">
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-trash fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</StyledListItemBtn>
		} else {
			return "";
		}
	}

	editorClick(e, prj, index){
		e.stopPropagation();
		this.props.history.push('/CodingEditor?project=' + prj.id + '&type=' + prj.type);
	}

	render() {
		var _this = this;

		//Render Components

		//Render search and newPrjBtn
		const projectListMenu = <div className="projectlist-menu">
			<span className="searchfield" id="searchform">
				<input
					type="text"
					placeholder="Search"
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<button type="button" id="search">Find!</button>
				<StyledNewPrjBtn id="newProject">
					<button
						id="newPrjBtn"
						className="btn btn-primary" href="#"
						onClick={this.showNewProjectModal}

					>
					<i className="fa fa-plus fa-fw"></i>
					New
					</button>
				</StyledNewPrjBtn>

			</span>

		</div>

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

		const renderListItems = itemsToDisplay.map((project, index) => {
			return <li
					key={project.id}
					className={this.isValidationProject(project)}
					onClick={() => prjClick(project)}

				>
					<span>{project.name}</span>
					{this.renderDeleteBtn(project, index)}
					<StyledListItemBtn onClick={(e) => this.leaveProject(e, project, index)} className=" btn  fa-stack fa-lg" >
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-sign-out fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</StyledListItemBtn>
					<StyledListItemBtn onClick={(e) => this.editorClick(e, project, index)} className=" btn  fa-stack fa-lg" >
						<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
						<i className="fa fa-pencil fa-stack-1x fa-inverse fa-editor-btn"></i>
					</StyledListItemBtn>
				</li>;
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
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				{projectListMenu}
				<ul className="list compactBoxList">
					{renderListItems}
	            </ul>
	            <StyledPagination className="pagination">
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}