import React from 'react';
import styled from 'styled-components';

import ProjectDashboardBtn from '../ProjectDashboardBtn.jsx';
import PageViewChooser  from './PageViewChooser.jsx';
import StyledSearchField from '../../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';


const StyledSettingsPanel = styled.div `
	display: ${props => (props.showPanel) ? 'block' : 'none'} !important;
	background-color: #f8f8f8;
`;

const StyledPanelContent = styled.div `
	margin:5px 5px 0px 5px;
`;

const StyledPanelHeader = styled.div `
	text-align: center;
	position:relative;
	background-color: #e7e7e7;
	padding-bottom: 5px;
 `;

 const StyledPanelTitle = styled.b `
 	padding-left: 17.14px;
 `;

const StyledExpanderToggle = styled.a `
	margin-right: 2px;
	margin-top: 0px;
	font-size: 20px;
	color: grey;
	cursor: pointer;
	&:hover{
		color:black;
	}
`

export default class ProjectPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isExpanded: true,
			search: "",
		};

		this.updateSearch = this.updateSearch.bind(this);
		this.searchProject = this.searchProject.bind(this);
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});
	}

	toggleIsExpanded() {
		this.setState({
			isExpanded: !this.state.isExpanded
		});
	}

	searchProject(){
		if (!this.props.documentsView.getDocuments) return;
		const docs =this.props.documentsView.getDocuments()
		for (var i in docs) {
			var doc = docs[i];
			if (doc.text.toLowerCase().indexOf(this.state.search.toLowerCase()) != -1){
			    alert(doc.text);
			}
		}
	}

	renderCollapseIcon() {
		if (this.state.isExpanded) return (<i className="fa fa-compress fa-1x"></i>);
		else return (<i className="fa fa-expand fa-1x"></i>);
	}

	renderPanelContent(){
		if (!this.state.isExpanded) return null;
		return (
			<StyledPanelContent>
				<ProjectDashboardBtn project={this.props.project} history={this.props.history}/>
				<StyledSearchField className="searchfield" id="searchform">
					<input
						type="text"
						placeholder="Search for anything"
						value={this.state.search}
						onChange={this.updateSearch}
					/>
					<BtnDefault type="button" onClick={() => this.searchProject()}>
						<i className="fa fa-search  fa-lg"></i>
					</BtnDefault>
				</StyledSearchField>
				<PageViewChooser umlEditorEnabled={this.props.umlEditorEnabled} viewChanged={this.props.viewChanged}/>
			</StyledPanelContent>
		);
	}

	render(){
		return(
			<StyledSettingsPanel showPanel={this.props.project.getType() === "PROJECT"}>
				<StyledPanelHeader>
					<StyledPanelTitle>Project</StyledPanelTitle>

					<StyledExpanderToggle className="pull-right" onClick={() => this.toggleIsExpanded()}>
						{this.renderCollapseIcon()}
					</StyledExpanderToggle>
				</StyledPanelHeader>
				{this.renderPanelContent()}
			</StyledSettingsPanel>

		);
	}
}