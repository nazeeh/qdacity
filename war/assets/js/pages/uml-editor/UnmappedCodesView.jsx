import React from 'react';

import UnmappedCodeElement from './UnmappedCodeElement.jsx';

export default class UnmappedCodeView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			codes: this.props.umlEditorView.getUnmappedCodes()
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
		const styles = this.getStyles();

		return (
			<ul className="list-group" style={styles.box}>
                {this.state.codes.map(function(code, i){
                    return <UnmappedCodeElement key={code.codeID} code={code} />;
                })}
            </ul>
		);
	}

}