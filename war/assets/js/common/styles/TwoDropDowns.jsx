import React from 'react';
import styled from 'styled-components';
import DropDownButton from './DropDownButton.jsx';

export default class TwoDropDowns extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			projects: this.props.projects,
			projectNameList: []
		}
		this.init();
	}

	init() {
		var _this = this;
		var projectNameList = [];
		var projects = this.props.projects;
		projects.items.forEach(function (project) {
			projectNameList.push({
				text: project.name
			});
		});
		console.log(projectNameList);
		_this.setState({
			projectNameList: projectNameList
		});
	}

	defineInitText() {
		var text = "";
		var _this = this;
		var projectNameList = this.state.projectNameList;
		if (!(typeof projectNameList == 'undefined') && (projectNameList.length > 0)) {
				text = projectNameList[0].text;
		}
		return text;
	}


	render() {
		console.log(this.state.projectNameList)
		return (
				<DropDownButton items={this.state.projectNameList} initText = {this.defineInitText()}></DropDownButton>
		)
	}

}
