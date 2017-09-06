import React from 'react'
import CodeView from '../CodeView/CodeView.jsx';

export default class BottomPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	renderPanel(){
		return (<CodeView ref={(c) => {if (c) this.updateCode = c.updateCode;}} {...this.props}/>);
	}

	render(){
		return(
			<div>
				{this.renderPanel()}
			</div>
		);
	}
}