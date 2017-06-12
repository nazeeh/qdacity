import React from 'react';

import UnmappedCodeElement from './UnmappedCodeElement.jsx';

export default class UnmappedCodeView extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;

		this.state = {
			codes: this.umlEditorView.getUnmappedCodes()
		};
	}

	getStyles() {
		return {
			container: {
				width: '250px'
			},
			header: {
				display: 'flex',
				backgroundColor: '#e7e7e7',
				textAlign: 'center'
			},
			headerText: {
				height: '35px',
				lineHeight: '35px',
				marginLeft: 'auto',
				marginRight: 'auto',
				fontWeight: 'bold'
			},
			box: {
				display: 'flex',
				flexDirection: 'column',
				overflowY: 'auto',
				height: '200px'
			}
		};
	}

	render() {
		const _this = this;

		const styles = this.getStyles();

		return (
			<div style={styles.container}>
                <div style={styles.header}>
                    <span  style={styles.headerText}>Unmapped codes</span>
                </div>
                <div style={styles.box}>
                    {this.state.codes.sort((code1, code2) => {
                        if (code1.name < code2.name) return -1;
                        if (code1.name > code2.name) return 1;
                        return 0;
                    }).map((code, i) => 
                        <UnmappedCodeElement key={code.codeID} umlEditorView={_this.umlEditorView} codeId={code.codeID} />
                    )}
                </div>
            </div>
		);
	}

}