import React from 'react'

export default class DocumentSearchResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div>
				{
					this.props.documentResults.map(function(doc) {
					  return doc.title;
					})
				}
			</div>
		);
	}
}