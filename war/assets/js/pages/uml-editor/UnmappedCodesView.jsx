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
			box: {
				margin: "10px 15px"
			}
		};
	}

	render() {
		const _this = this;

		const styles = this.getStyles();

		return (
			<ul className="list-group" style={styles.box}>
                {this.state.codes.sort((code1, code2) => {
                    if (code1.name < code2.name) return -1;
                    if (code1.name > code2.name) return 1;
                    return 0;
                }).map((code, i) => 
                    <UnmappedCodeElement key={code.codeID} umlEditorView={_this.umlEditorView} code={code} />
                )}
            </ul>
		);
	}

}