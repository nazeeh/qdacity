import React from 'react'
import CodeView from '../CodeView/CodeView.jsx';
import {
	BottomPanelType
} from './BottomPanelType.js';

export default class BottomPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	renderPanel(){
		if (this.props.panelType === BottomPanelType.SEARCHRESULTS) return null;
		if (this.props.panelType === BottomPanelType.CODEVIEW) return (<CodeView ref={(c) => {if (c) this.updateCode = c.updateCode;}} {...this.props}/>);
	}

	render(){
		return(
			<div>
				{this.renderPanel()}
			</div>
		);
	}
}