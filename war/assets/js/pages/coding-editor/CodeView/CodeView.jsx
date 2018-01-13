import React from 'react'
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import Tab from '../../../common/Tabs/Tab.jsx';
import Tabs from '../../../common/Tabs/Tabs.jsx';

import CodingsView from './CodingsView.jsx';
import CodeProperties from './CodeProperties.jsx';
import MetaModel from './MetaModel.jsx';
import CodeMemo from './CodeMemo.jsx';
import CodeBookEntry from './CodeBookEntry.jsx';

export default class CodeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			documents: []
		};
		this.tabChanged = this.tabChanged.bind(this);
	}

	init() {}

	tabChanged() {}

	render() {
		const {
			formatMessage
		} = IntlProvider.intl;
		const {
			editorCtrl,
			documentsView
		} = this.props;
		const {
			updateSelectedCode,
			getCodeById,
			getCodeByCodeID,
			getCodeSystem,
			createCode,
			selectCode,
			deleteRelationship
		} = this.props;
		const tabTitle = {
			codings: formatMessage({
				id: 'codeview.codings',
				defaultMessage: 'Codings'
			}),
			codeProperties: formatMessage({
				id: 'codeview.code_properties',
				defaultMessage: 'Code Properties'
			}),
			metaModel: formatMessage({
				id: 'codeview.meta_model',
				defaultMessage: 'Meta Model'
			}),
			codeMemo: formatMessage({
				id: 'codeview.code_memo',
				defaultMessage: 'Code Memo'
			}),
			codeBookEntry: formatMessage({
				id: 'codeview.code_book_entry',
				defaultMessage: 'Code Book Entry'
			}),
		};
		return (
			<div>
                <Tabs tabChanged={this.tabChanged}>
                    <Tab tabTitle={tabTitle.codings}>
                        <CodingsView documents={this.state.documents} code={this.props.code} editorCtrl={editorCtrl} documentsView={documentsView} codingEditor={this.props.codingEditor}/>
                    </Tab>
                    <Tab tabTitle={tabTitle.codeProperties}>
                        <CodeProperties code={this.props.code} editorCtrl={editorCtrl} documentsView={documentsView} updateSelectedCode={updateSelectedCode}/>
                    </Tab>
                    <Tab tabTitle={tabTitle.metaModel}>
                        <MetaModel code={this.props.code} updateSelectedCode={updateSelectedCode} getCodeById={getCodeById} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem} createCode={createCode} selectCode={selectCode} deleteRelationship={deleteRelationship}/>
                    </Tab>
                    <Tab tabTitle={tabTitle.codeMemo}>
                        <CodeMemo code={this.props.code} updateSelectedCode={updateSelectedCode} />
                    </Tab>
                    <Tab tabTitle={tabTitle.codeBookEntry}>
                        <CodeBookEntry code={this.props.code} updateSelectedCode={updateSelectedCode} />
                    </Tab>
                </Tabs>
            </div>
		);
	}
}