import React from 'react'

import Tab from '../../../common/Tabs/Tab.jsx';
import Tabs from '../../../common/Tabs/Tabs.jsx';

import CodingsView from './CodingsView.jsx';
import CodeProperties from './CodeProperties.jsx';

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
	}

	render(){
		const {editorCtrl, documentsView} = this.props;
		const {updateCode} = this.props;
		return(
			<div>
				<Tabs tabChanged={this.tabChanged}>
					<Tab tabTitle="Codings">
						<CodingsView documents={this.state.documents} code={this.state.code} editorCtrl={editorCtrl} documentsView={documentsView}/>
					</Tab>
					<Tab tabTitle="Code Properties">
						<CodeProperties code={this.state.code} editorCtrl={editorCtrl} documentsView={documentsView} updateCode={updateCode}/>
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