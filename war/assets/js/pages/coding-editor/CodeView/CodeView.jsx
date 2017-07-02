import React from 'react'
import styled from 'styled-components';

import Tab from '../../../common/Tabs/Tab.jsx';
import Tabs from '../../../common/Tabs/Tabs.jsx';

import CodingsView from './CodingsView.jsx';
import CodeProperties from './CodeProperties.jsx';
import MetaModel from './MetaModel.jsx';
import CodeMemo from './CodeMemo.jsx';
import CodeBookEntry from './CodeBookEntry.jsx';

const StyledCloseFooterBtn = styled.a `
    float: right;
	color: black;
`;

export default class CodeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: {},
			documents: this.props.documentsView.getDocuments()
		};
		this.tabChanged = this.tabChanged.bind(this);
	}

	init() {}

	updateCode(code) {
		this.setState({
			code: code
		});
	}

	tabChanged() {}

	render() {
		const {
			editorCtrl,
			documentsView
		} = this.props;
		const {
			updateSelectedCode,
			getCodeByCodeID,
			getCodeSystem
		} = this.props;
		return (
			<div>
				<StyledCloseFooterBtn onClick={this.props.hideCodingView}>
					<i className="fa fa-times-circle fa-2x fa-hover"></i>
				</StyledCloseFooterBtn>
				<Tabs tabChanged={this.tabChanged}>
					<Tab tabTitle="Codings">
						<CodingsView documents={this.state.documents} code={this.state.code} editorCtrl={editorCtrl} documentsView={documentsView}/>
					</Tab>
					<Tab tabTitle="Code Properties">
						<CodeProperties code={this.state.code} editorCtrl={editorCtrl} documentsView={documentsView} updateSelectedCode={updateSelectedCode}/>
					</Tab>
					<Tab tabTitle="Meta Model">
						<MetaModel code={this.state.code} updateSelectedCode={updateSelectedCode} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem}/>
					</Tab>
					<Tab tabTitle="Code Memo">
						<CodeMemo code={this.state.code} updateSelectedCode={updateSelectedCode} />
					</Tab>
					<Tab tabTitle="Code Book Entry">
						<CodeBookEntry code={this.state.code} updateSelectedCode={updateSelectedCode} />
					</Tab>
				</Tabs>
			</div>
		);
	}
}