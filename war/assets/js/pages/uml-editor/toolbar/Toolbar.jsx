import React from 'react';

import ButtonZoomIn from './ButtonZoomIn.jsx';
import ButtonZoomOut from './ButtonZoomOut.jsx';
import ButtonZoomSelect from './ButtonZoomSelect.jsx';

export default class Toolbar extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
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
    	        <ButtonZoomIn umlEditor={_this.umlEditor} />
                <ButtonZoomOut umlEditor={_this.umlEditor} />
                <ButtonZoomSelect umlEditor={_this.umlEditor} />
            </div>
		);
	}

}