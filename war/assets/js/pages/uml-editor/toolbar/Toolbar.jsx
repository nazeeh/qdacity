import React from 'react';

import ButtonZoomIn from './ButtonZoomIn.jsx';
import ButtonZoomOut from './ButtonZoomOut.jsx';
import ButtonZoomSelect from './ButtonZoomSelect.jsx';

export default class Toolbar extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;
	}

	getStyle() {
		return {
			padding: '8px 20px 8px 20px',
			borderBottom: '1px solid #c0c0c0'
		};
	}

	render() {
		const _this = this;

		const style = this.getStyle();

		return (
			<div style={style}>
    	        <ButtonZoomIn umlEditorView={_this.umlEditorView} />
                <ButtonZoomOut umlEditorView={_this.umlEditorView} />
                <ButtonZoomSelect umlEditorView={_this.umlEditorView} />
            </div>
		);
	}

}