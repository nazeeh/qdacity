import React from 'react';
import styled from 'styled-components';

import ButtonAddClass from './ButtonAddClass.jsx';
import ButtonZoomIn from './ButtonZoomIn.jsx';
import ButtonZoomOut from './ButtonZoomOut.jsx';
import ButtonZoomSelect from './ButtonZoomSelect.jsx';
import ButtonShowAll from './ButtonShowAll.jsx';
import ButtonApplyLayout from './ButtonApplyLayout.jsx';
import ButtonExpandAll from './ButtonExpandAll.jsx';
import ButtonCollapseAll from './ButtonCollapseAll.jsx';
import CollaboratorList from '../../../common/SyncService/CollaboratorList';

const StyledToolbar = styled.div `
    display: flex;
    padding: 5px;
    border-bottom: 1px solid #c0c0c0;
`;

const StyledPlaceholder = styled.div `
    flex-grow: 1;
`;

const StyledButtonContainer = styled.div `
`;

export default class Toolbar extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;

		this.zoomSelectRef = null;
	}

	onZoom(percentage) {
		this.zoomSelectRef.onZoom(percentage);
	}

	render() {
		const _this = this;

		return (
			<StyledToolbar>
				<StyledButtonContainer>
					<ButtonAddClass umlEditor={_this.umlEditor} createCode={_this.props.createCode}/>
					
					<ButtonZoomIn umlEditor={_this.umlEditor} />
					<ButtonZoomOut umlEditor={_this.umlEditor} />
					<ButtonZoomSelect ref={(zoomSelectRef) => {if (zoomSelectRef) this.zoomSelectRef = zoomSelectRef}} umlEditor={_this.umlEditor} />
					<ButtonShowAll umlEditor={_this.umlEditor} />
				
					<ButtonApplyLayout umlEditor={_this.umlEditor} />

					<ButtonExpandAll umlEditor={_this.umlEditor} />
					<ButtonCollapseAll umlEditor={_this.umlEditor} />
				</StyledButtonContainer>
				<StyledPlaceholder />
				<CollaboratorList
                    syncService={this.props.syncService} />
            </StyledToolbar>
		);
	}

}
