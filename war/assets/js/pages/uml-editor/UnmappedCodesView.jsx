import React from 'react';

export default class UnmappedCodeView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			codes: this.props.umlEditorView.getUnmappedCodes()
		};
	}

	componentDidMount() {
		
	}

	getStyles() {
		return {
			box: {
				margin: "10px 15px"
			},
			item: {

			},
			icon: {

			}
		};
	}

	render() {
		const styles = this.getStyles();

		return (
			<ul className="list-group" style={styles.box}>
                {this.state.codes.map(function(code, i){
                    return ( 
                    <li key={code.codeID} style={styles.item} className="list-group-item">
                        {code.name}
                    </li>);
                })}
            </ul>
		);
	}

}