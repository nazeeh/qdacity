import React from 'react'

import Table from '../../../../common/Table/Table.jsx';

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
			<Table columns={"1fr 1fr"} tableHeader={["Document","Excerpt"]}>

			</Table>
			</div>
		);
	}
}