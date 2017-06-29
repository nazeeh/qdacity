import React from 'react'

import Tab from '../../../common/Tabs/Tab.jsx';
import Tabs from '../../../common/Tabs/Tabs.jsx';

import CodingsView from './CodingsView.jsx';
import CodeProperties from './CodeProperties.jsx';
import MetaModel from './MetaModel.jsx';
import CodeMemo from './CodeMemo.jsx';


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
		const {updateCode, getSelectedCode, updateSelectedCode, getCodeByCodeID, getCodeSystem} = this.props;
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
						<MetaModel code={this.state.code} getSelectedCode={getSelectedCode} updateSelectedCode={updateSelectedCode}  updateCode={updateCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem}/>
					</Tab>
					<Tab tabTitle="Code Memo">
						<CodeMemo code={this.state.code} updateCode={updateCode} />
					</Tab>
					<Tab tabTitle="Code Book Entry">
						codeBookEntry
					</Tab>
				</Tabs>
			</div>
		);
	}
}