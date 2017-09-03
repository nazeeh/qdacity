import React from 'react';
import styled from 'styled-components';

import ButtonAddClass from './ButtonAddClass.jsx';
import ButtonZoomIn from './ButtonZoomIn.jsx';
import ButtonZoomOut from './ButtonZoomOut.jsx';
import ButtonZoomSelect from './ButtonZoomSelect.jsx';
import ButtonApplyLayout from './ButtonApplyLayout.jsx';

const StyledToolbar = styled.div `
    padding: 8px 20px 8px 20px;
    border-bottom: 1px solid #c0c0c0;
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
                <ButtonAddClass umlEditor={_this.umlEditor} />
		        
    	        <ButtonZoomIn umlEditor={_this.umlEditor} />
                <ButtonZoomOut umlEditor={_this.umlEditor} />
                <ButtonZoomSelect ref={(zoomSelectRef) => {if (zoomSelectRef) this.zoomSelectRef = zoomSelectRef}} umlEditor={_this.umlEditor} />
            
                <ButtonApplyLayout umlEditor={_this.umlEditor} />
            </StyledToolbar>
		);
	}

}