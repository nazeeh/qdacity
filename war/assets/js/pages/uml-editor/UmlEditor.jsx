import React from 'react';

import Toolbar from './toolbar/Toolbar.jsx';
import MetaModelMapper from './MetaModelMapper.js';
import UmlGraphView from './UmlGraphView.jsx';

export default class UmlEditor extends React.Component {
    
	constructor(props) {
		super(props);

		this.umlGraphView = null;
		this.toolbar = null;
		
		this.metaModelMapper = null;
	}
	
	componentDidMount() {
        this.metaModelMapper = new MetaModelMapper(umlGraphView, mmEntities);	   

        umlGraphView.initGraph(this.props.codes, this.props.mmEntities, this.props.mmRelations, this.metaModelMapper, this.props.unmappedCodesView);
	}

    getToolbar() {
        return this.toolbar;
    }
    
    getUmlGraphView() {
        return this.umlGraphView;
    }
    
    getMetaModelMapper() {
        return this.metaModelMapper
    }

	render() {
		return (
			<div className="col-sm-8 col-md-9 col-lg-10">
		        <Toolbar ref={(toolbar) => {this.toolbar = toolbar}} className="row no-gutters" umlEditor={this} />
                <UmlGraphView ref={(toolbar) => {this.umlGraphView = umlGraphView}} codesystemId={this.props.codesystemId} />
	        </div>
		);
	}
}