import React from 'react';

export default class ButtonZoomIn extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;
	}

	buttonClicked() {
		this.umlEditorView.zoomIn();
	}

	render() {
		const _this = this;

		return (
			<button onClick={_this.buttonClicked.bind(_this)} type="button" className="btn btn-default">
		        <i className="fa fa-search-plus"></i>
	        </button>
		);
	}

}