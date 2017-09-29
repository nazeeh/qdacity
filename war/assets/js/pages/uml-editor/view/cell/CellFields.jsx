import React from 'react';

import CellElementList from './CellElementList.jsx';

export default class CellFields extends CellElementList {

	constructor(props) {
		super(props);
	}

	getElements() {
		return this.props.cellValue.getFields();
	}

	getElementName() {
		return 'Field';
	}

	addElementClicked() {
		this.props.umlEditor.openClassFieldModal(this.props.cell);
	}

	removeElementClicked(relationId) {
		this.props.umlEditor.deleteClassField(this.props.cell, relationId);
	}
}