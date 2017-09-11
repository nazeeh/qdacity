import React from 'react'

import Table from '../../../../common/Table/Table.jsx';

export default class MemoSearchResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		let tableContent = [];
		let results = this.props.memoResults;
		for (var i = 0; i < results.length; i++) {
			let result = results[i];
			tableContent.push([result.name, result.memo]);
		}

		return (
			<div>
			<Table columns={"1fr 1fr"} tableHeader={["Code","Memo"]} tableContent={tableContent}>

			</Table>
			</div>
		);
	}
}