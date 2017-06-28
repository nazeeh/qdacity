import React from 'react'

import Tab from '../../../common/Tabs/Tab.jsx';
import Tabs from '../../../common/Tabs/Tabs.jsx';

import CodingsView from './CodingsView.jsx';

export default class CodeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: {},
			documents:  this.props.documentsView.getDocuments()
		};
this.tabChanged = this.tabChanged.bind(this);
	}

	init(){
	}

	updateCode(code){
		this.setState({
			code: code
		});
	}

	tabChanged(){
		this.state.code.memo = "";
		this.setState({
			code: this.state.code
		});
		this.forceUpdate()
		this.forceUpdate()
	}

	render(){
		const {editorCtrl, documentsView} = this.props;
		return(
			<div>
				<Tabs tabChanged={this.tabChanged}>
					<Tab tabTitle="Codings">
						<CodingsView documents={this.state.documents} code={this.state.code} editorCtrl={editorCtrl} documentsView={documentsView}/>
					</Tab>
					<Tab tabTitle="Code Properties">
						codeProperties
					</Tab>
					<Tab tabTitle="Meta Model">
						metaModel
					</Tab>
					<Tab tabTitle="Code Memo">
						codeMemo
					</Tab>
					<Tab tabTitle="Code Book Entry">
						codeBookEntry
					</Tab>
				</Tabs>
			</div>
		);
	}
}