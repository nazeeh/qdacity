import React from 'react'

import Tab from '../../../../common/Tabs/Tab.jsx';
import Tabs from '../../../../common/Tabs/Tabs.jsx';

import DocumentSearchResults from './DocumentSearchResults.jsx';
import MemoSearchResults from './MemoSearchResults.jsx';

export default class SearchResutls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}


	render(){
		return(
			<div>
				<Tabs tabChanged={this.tabChanged}>
                    <Tab tabTitle="Documents">
                        <DocumentSearchResults documentResults = {this.props.searchResults.documentResults}/>
                    </Tab>
					<Tab tabTitle="Memos">
                        <MemoSearchResults memoResults = {this.props.searchResults.memoResults}/>
                    </Tab>
                </Tabs>
			</div>
		);
	}
}