import React from 'react';

export default class Toolbar extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;
	}

	getStyles() {
		return {
			container: {
				padding: '8px 20px 8px 20px',
				borderBottom: '1px solid #c0c0c0'
			},
			buttonZoomOut: {
				marginLeft: '10px'
			}
		};
	}

	zoomIn() {
		this.umlEditorView.zoomIn();
	}

	zoomOut() {
		this.umlEditorView.zoomOut();
	}

	render() {
		const _this = this;

		const styles = this.getStyles();

		return (
			<div style={styles.container}>
                <button onClick={_this.zoomIn.bind(_this)} type="button" className="btn btn-default"><i className="fa fa-search-plus"></i></button>
                <button style={styles.buttonZoomOut}  onClick={_this.zoomOut.bind(_this)} type="button" className="btn btn-default"><i className="fa fa-search-minus"></i></button>
            </div>
		);
	}

}