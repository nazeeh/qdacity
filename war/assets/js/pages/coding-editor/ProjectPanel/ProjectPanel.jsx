import React from 'react';
import PageViewChooser  from './PageViewChooser.jsx';

export default class ProjectPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div>
				<PageViewChooser umlEditorEnabled={this.props.umlEditorEnabled} viewChanged={this.props.viewChanged}/>
			</div>
		);
	}
}