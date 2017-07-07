import React from 'react';

import Toolbar from './toolbar/Toolbar.jsx';
import MetaModelMapper from './MetaModelMapper.js';
import UmlEditorView from './UmlEditorView.js';

export default class UmlEditor extends React.Component {
	constructor(props) {
		super(props);

		this.umlEditorView = null;
		this.toolbar = null;
	}
	
	init(codes, mmEntities, mmRelations, codesystem_id, unmappedCodesView) {
		let container = document.getElementById('umlGraphContainer');
		umlEditorView = new UmlEditorView(codesystem_id, container);

		metaModelMapper = new MetaModelMapper(umlEditorView, mmEntities);

		umlEditorView.initGraph(codes, mmEntities, mmRelations, metaModelMapper, unmappedCodesView);
	}

    getToolbar() {
        return this.toolbar;
    }

	render() {
		return (
			<div id="editor" class="col-sm-8 col-md-9 col-lg-10">
		        <Toolbar ref={(toolbar) => {this.toolbar = toolbar}} umlEditorView={umlEditorView} className="row no-gutters" />
	            <div id="umlGraphContainer" style="overflow: hidden; cursor: default"></div>
	        </div>
		);
	}
}