import React from 'react';
import styled from 'styled-components';

import ProjectDashboardBtn from '../ProjectDashboardBtn.jsx';
import PageViewChooser  from './PageViewChooser.jsx';
import StyledSearchField from '../../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledPanelContent = styled.div `

	margin:5px 5px 0px 5px;
`;

export default class ProjectPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div>
				<StyledPanelContent>
					<ProjectDashboardBtn project={this.props.project} history={this.props.history}/>
					<StyledSearchField className="searchfield" id="searchform">
						<input
							type="text"
							placeholder="Search for anything"
							value={this.state.search}
							onChange={this.updateSearch}
						/>
						<BtnDefault type="button">
							<i className="fa fa-search  fa-lg"></i>
						</BtnDefault>
					</StyledSearchField>
					<PageViewChooser umlEditorEnabled={this.props.umlEditorEnabled} viewChanged={this.props.viewChanged}/>
				</StyledPanelContent>
			</div>
		);
	}
}