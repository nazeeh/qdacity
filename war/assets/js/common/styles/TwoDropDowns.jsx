import React from 'react';
import styled from 'styled-components';
import DropDownButton from './DropDownButton.jsx';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';

export default class TwoDropDowns extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			projects: this.props.projects,
			projectNameList: [],
			projectInitText: this.defineInitTextProjects(),
			revisions: [],
			revisionNameList:[]
		}
	}

	componentDidMount() {
		this.init();
	}

	init() {
		var _this = this;
		var projectNameList = [];
		var revisionNameList = [];
		var projects = this.props.projects;
		projects.items.forEach(function (project) {
			projectNameList.push({
				text: project.name,
				onClick: _this.projectClicked.bind(_this, project.id)
			});
		});

		ProjectEndpoint.listRevisions(this.props.projects.items[0].id).then(function (revisions) {
			revisions.items.forEach(function (revision) {
				revisionNameList.push({
					text: revision.name
					});
				});
					_this.setState({
						revisions: revisions,
						projectNameList: projectNameList,
						revisionNameList: revisionNameList
						});
		});
	}

	projectClicked(projectID) {
	var _this = this;
	var revisionNameList = [];
	ProjectEndpoint.listRevisions(projectID).then(function (revisions) {
	revisions.items = revisions.items || [];
		revisions.items.forEach(function (revision) {
			revisionNameList.push({
				text: revision.name
				});
			});
				_this.setState({
					revisions: revisions,
					revisionNameList: revisionNameList
					});
	});
	}

	defineInitTextProjects() {
		var text = "";
		var _this = this;
		if (!(typeof this.props.projects == 'undefined') && (this.props.projects.items.length > 0)) {
			text = this.props.projects.items[0].name;
			_this.setState({
				projectInitText: text
				});
		}
		return text;
	}

	defineInitTextRevisions() {
		var text = "";
		var _this = this;
		var revisionNameList = this.state.revisionNameList;
		if (!(typeof revisionNameList == 'undefined') && (revisionNameList.length > 0)) {
				text = revisionNameList[0].text;
		}
		return text;
	}

	render() {
		console.log(this.state);

		return (
			<div>
				<DropDownButton items={this.state.projectNameList} initText = {this.state.projectInitText}></DropDownButton>
				<DropDownButton items={this.state.revisionNameList} initText = {this.defineInitTextRevisions()}></DropDownButton>
			</div>
		)
	}

}
