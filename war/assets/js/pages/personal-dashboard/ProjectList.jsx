import React from 'react';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';
import CodesystemEndpoint from '../../common/endpoints/CodesystemEndpoint';

import BinaryDecider from '../../common/modals/BinaryDecider.js';
import CustomForm from '../../common/modals/CustomForm';

export default class ProjectList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};
		this.paginationClick = this.paginationClick.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
		this.showNewProjectModal = this.showNewProjectModal.bind(this);
		this.createNewProject = this.createNewProject.bind(this);
		this.addProject = this.addProject.bind(this);
	}

	init() {
		var _this = this;
		_this.state.projects = [];
		var validationPrjPromise = ProjectEndpoint.listValidationProject();
		ProjectEndpoint.listProject().then(function (resp) {
			resp.items = resp.items || [];
			resp.items.forEach(function (prj) {
				prj.type = "PROJECT";
			});
			var projects = _this.state.projects.concat(resp.items)

			validationPrjPromise.then(function (resp2) {
				resp2.items = resp2.items || [];
				resp2.items.forEach(function (prj) {
					prj.type = "VALIDATION";
				});
				projects = projects.concat(resp2.items)
				projects = _this.sortProjects(projects);
				_this.setState({
					projects: projects
				});
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

	addProject(project) {
		this.state.projects.push(project);
		this.setState({
			projects: this.state.projects
		});
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

					_this.state.projects.splice(index, 1);
					_this.setState({
						projects: _this.state.projects
					});
				});
			}
		});
	}

	deleteProject(e, project, index) {
		var _this = this;
		e.stopPropagation();
		ProjectEndpoint.removeProject(project.id).then(function (resp) {
			// remove project from state
			_this.state.projects.splice(index, 1);
			_this.setState({
				projects: _this.state.projects
			});
		});
	}


	getStyles() {
		return {
			pagination: {
				listStyle: "none",
				display: "flex"
			},
			paginationItem: {
				color: "black",
				float: "left",
				padding: "8px 16px",
				textDecoration: "none",
				cursor: "pointer"

			},
			listItemBtn: {
				float: "right",
				marginTop: "-15px"
			},
			newPrjBtn: {
				paddingLeft: "5px"
			}
		};
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
					_this.state.projects.push(insertedProject);
					_this.setState({
						projects: _this.state.projects
					});
				});
			});
		});
	}

	renderDeleteBtn(project, index) {
		const styles = this.getStyles();
		if (typeof project.revisionID == "undefined") {
			return <a onClick={(e) => this.deleteProject(e, project, index)} className=" btn  fa-stack fa-lg" style={styles.listItemBtn} > 
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-trash fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</a>
		} else {
			return "";
		}
	}

	render() {
		var _this = this;

		const styles = this.getStyles();

		//Render Components

		//Render search and newPrjBtn
		const projectListMenu = <div className="projectlist-menu">
			<span className="searchfield" id="searchform"> 
				<input 
					type="text" 
					class="search" 
					placeholder="Search" 
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<button type="button" id="search">Find!</button>
				<div id="newProject" style={styles.newPrjBtn}>
					<button 
						id="newPrjBtn" 
						className="btn btn-primary" href="#"
						onClick={this.showNewProjectModal}
						 
					>
					<i className="fa fa-plus fa-fw"></i>
					New
					</button>
				</div>

			</span>
		
		</div>

		//Rebder List Items
		var filteredList = this.state.projects.filter(
			(project) => {
				return project.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
			}
		);
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = filteredList.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
			location.href = 'project-dashboard.html?project=' + prj.id + '&type='+ prj.type;
		}

		const renderListItems = itemsToDisplay.map((project, index) => {
			return <li 
					key={project.id} 
					className={this.isValidationProject(project)}
					onClick={() => prjClick(project)}
					href={'project-dashboard.html?project=' + project.id + "&type=PROJECT"}
					
				>
					<span>{project.name}</span>
					{this.renderDeleteBtn(project, index)}
					<a onClick={(e) => this.leaveProject(e, project, index)} className=" btn  fa-stack fa-lg" style={styles.listItemBtn} > 
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-sign-out fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</a>
					<a href={"coding-editor.html?project="+project.id} className=" btn  fa-stack fa-lg" style={styles.listItemBtn} > 
						<i className="fa fa-circle fa-stack-2x fa-editor-btn-circle fa-hover"></i>
						<i className="fa fa-pencil fa-stack-1x fa-inverse fa-editor-btn"></i>
					</a>
				</li>;
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.projects.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<a
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              style={styles.paginationItem}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
	            </a>
			);
		});

		return (
			<div>
				{projectListMenu}
				<ul className="list compactBoxList">
					{renderListItems}
	            </ul>
	            <ul className="pagination" style={styles.pagination}>
					{renderPagination}
            	</ul>
     		</div>
		);
	}


}