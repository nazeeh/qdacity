import React from 'react';

export default class ParentProject extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render(){
		if (this.props.project.getType() == 'PROJECT') return null;
		return (
			<div className=" box box-default">
				<div className="box-header with-border">
					<h3 className="box-title">Parent Project</h3>
				</div>
				<div className="box-body">
					This is an validation project belonging to <a href={'project-dashboard.html?project=' + this.props.project.getParentID() + '&type=PROJECT' }>this parent project</a> 
				</div>
			</div>
		);
	}
	
}