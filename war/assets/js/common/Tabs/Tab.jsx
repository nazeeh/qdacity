import React from 'react'

export default class Tab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div>
				{this.props.tabTitle}
			</div>
		);
	}
}