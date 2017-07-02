import React from 'react';

import MetaModel from '../coding-editor/CodeView/MetaModel.jsx';
import MetaModelView from '../coding-editor/CodeView/MetaModelView.jsx';

export default class MetaModelDialog extends MetaModel {
	constructor(props) {
		super(props);
	}

	getActiveElementIds() {
		return this.state.selected;
	}

	render() {
		this.setActiveIds(this.props.code.mmElementIDs);

		return (
			<MetaModelView filter={"PROPERTY"} code={this.props.code} selected={this.state.selected} elements={this.state.elements} updateActiveElement={this.updateActiveElement} setElements={this.setElements} metaModelEntities={this.props.metaModelEntities} metaModelRelations={this.props.metaModelRelations}/>
		);
	}
}