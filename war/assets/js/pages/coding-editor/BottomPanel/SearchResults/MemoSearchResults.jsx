import React from 'react'
import IntlProvider from '../../../../common/Localization/LocalizationProvider';

import Table from '../../../../common/Table/Table.jsx';

export default class MemoSearchResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {formatMessage} = IntlProvider.intl;
		let tableContent = [];
		let results = this.props.memoResults;
		for (var i = 0; i < results.length; i++) {
			let result = results[i];
			tableContent.push({
				row: [result.name, result.memo],
				onClick: result.onClick
			});
		}
		const tableHeader = [
			formatMessage({ id: 'memosearchresults.code', defaultMessage: 'Code' }),
			formatMessage({ id: 'memosearchresults.memo', defaultMessage: 'Memo' })
		];

		return (
			<div>
			<Table columns={"1fr 1fr"} tableHeader={tableHeader} tableContent={tableContent}>

			</Table>
			</div>
		);
	}
}