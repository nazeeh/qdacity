import React from 'react';

import Toolbar from './toolbar/Toolbar.jsx';
import MetaModelMapper from './MetaModelMapper.js';
import UmlEditorView from './UmlEditorView.jsx';

export default class UmlEditor extends React.Component {
    
	constructor(props) {
		super(props);

		this.umlEditorView = null;
		this.toolbar = null;
		
		this.metaModelMapper = null;
	}
	
	componentDidMount() {
        this.metaModelMapper = new MetaModelMapper(umlEditorView, mmEntities);	   

        umlEditorView.initGraph(this.props.codes, this.props.mmEntities, this.props.mmRelations, this.metaModelMapper, this.props.unmappedCodesView);
	}

    getToolbar() {
        return this.toolbar;
    }
    
    getUmlEditorView() {
        return this.umlEditorView;
    }
    
    getMetaModelMapper() {
        return this.metaModelMapper
    }

	render() {
		return (
			<div className="col-sm-8 col-md-9 col-lg-10">
		        <Toolbar ref={(toolbar) => {this.toolbar = toolbar}} className="row no-gutters" umlEditorView={umlEditorView} />
                <UmlEditorView ref={(toolbar) => {this.umlEditorView = umlEditorView}} codesystemId={this.props.codesystemId} />
	        </div>
		);
	}
}