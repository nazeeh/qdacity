import React from 'react';
import styled from 'styled-components';

import ProjectDashboardBtn from '../ProjectDashboardBtn.jsx';
import SearchProjectBtn from './SearchProjectBtn.jsx';
import ProjectSearch from './ProjectSearch.jsx';
import PageViewChooser  from './PageViewChooser.jsx';


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

 const StyledTopBtns = styled.div `
	display: grid;
	grid-template-columns:  1fr 1fr;
	grid-column-gap: 5px;

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
			showSearchBar: false,
			isExpanded: true,
		};

		this.showSearchBar = this.showSearchBar.bind(this);
		this.setSearchResults = this.setSearchResults.bind(this);
	}

	toggleIsExpanded() {
		this.setState({
			isExpanded: !this.state.isExpanded
		});
	}

	renderCollapseIcon() {
		if (this.state.isExpanded) return (<i className="fa fa-compress fa-1x"></i>);
		else return (<i className="fa fa-expand fa-1x"></i>);
	}

	showSearchBar(){
		this.setState({
			showSearchBar: true
		});
		this.forceUpdate();
		this.props.resizeElements();
	}

	hideSearchBar(){
		this.setState({
			showSearchBar: false
		});
	}
	setSearchResults(results){
		this.setState({
			showSearchBar: false
		});
		this.props.setSearchResults(results);
	}


	renderPanelContent(){
		if (!this.state.isExpanded) return null;
		return (
			<StyledPanelContent>
				<StyledTopBtns>
					<ProjectDashboardBtn project={this.props.project} history={this.props.history}/>
					<SearchProjectBtn project={this.props.project} showSearchBar={this.showSearchBar} history={this.props.history}/>
				</StyledTopBtns>
				{
					(() =>{
						if (!this.state.showSearchBar) return null;
						return (<ProjectSearch documentsView = {this.props.documentsView} codesystemView={this.props.codesystemView} setSearchResults={this.setSearchResults}/>);
					})()

				}
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