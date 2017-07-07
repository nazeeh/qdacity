import React from 'react';

export default class ButtonZoomOut extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked() {
	    this.umlEditor.getUmlEditorView().zoomOut();
	}

	getStyle() {
		return {
			marginLeft: '10px'
		};
	}

	render() {
		const _this = this;

		const style = this.getStyle();

		return (
			<button style={style} onClick={_this.buttonClicked.bind(_this)} type="button" className="btn btn-default">
		        <i className="fa fa-search-minus"></i>
	        </button>
		);
	}

}