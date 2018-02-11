import React from 'react';
import IntlProvider from '../../../../common/Localization/LocalizationProvider';

import Tab from '../../../../common/Tabs/Tab.jsx';
import Tabs from '../../../../common/Tabs/Tabs.jsx';

import DocumentSearchResults from './DocumentSearchResults.jsx';
import MemoSearchResults from './MemoSearchResults.jsx';

export default class SearchResutls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { formatMessage } = IntlProvider.intl;
		const tabTitle = {
			documents: formatMessage({
				id: 'search.results.documents',
				defaultMessage: 'Documents'
			}),
			memo: formatMessage({
				id: 'search.results.memo',
				defaultMessage: 'Memo'
			})
		};

		return (
			<div>
				<Tabs tabChanged={() => {}}>
					<Tab tabTitle={tabTitle.documents}>
						<DocumentSearchResults
							documentResults={
								this.props.searchResults
									? this.props.searchResults.documentResults
									: []
							}
						/>
					</Tab>
					<Tab tabTitle={tabTitle.memo}>
						<MemoSearchResults
							memoResults={
								this.props.searchResults
									? this.props.searchResults.memoResults
									: []
							}
						/>
					</Tab>
				</Tabs>
			</div>
		);
	}
}
