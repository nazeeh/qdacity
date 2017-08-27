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
			documents: []
		};
		this.tabChanged = this.tabChanged.bind(this);
	}

	init() {}

	tabChanged() {}

	render() {
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
			selectCode
		} = this.props;
		return (
			<div>
                <StyledCloseFooterBtn onClick={this.props.hideCodingView}>
                    <i className="fa fa-times-circle fa-2x fa-hover"></i>
                </StyledCloseFooterBtn>
                <Tabs tabChanged={this.tabChanged}>
                    <Tab tabTitle="Codings">
                        <CodingsView documents={this.state.documents} code={this.props.code} editorCtrl={editorCtrl} documentsView={documentsView}/>
                    </Tab>
                    <Tab tabTitle="Code Properties">
                        <CodeProperties code={this.props.code} editorCtrl={editorCtrl} documentsView={documentsView} updateSelectedCode={updateSelectedCode}/>
                    </Tab>
                    <Tab tabTitle="Meta Model">
                        <MetaModel code={this.props.code} updateSelectedCode={updateSelectedCode} getCodeById={getCodeById} getCodeByCodeID={getCodeByCodeID} getCodeSystem={getCodeSystem} createCode={createCode} selectCode={selectCode} />
                    </Tab>
                    <Tab tabTitle="Code Memo">
                        <CodeMemo code={this.props.code} updateSelectedCode={updateSelectedCode} />
                    </Tab>
                    <Tab tabTitle="Code Book Entry">
                        <CodeBookEntry code={this.props.code} updateSelectedCode={updateSelectedCode} />
                    </Tab>
                </Tabs>
            </div>
		);
	}
}