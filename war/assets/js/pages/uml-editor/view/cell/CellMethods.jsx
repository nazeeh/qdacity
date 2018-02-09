import React from "react";

import CellElementList from "./CellElementList.jsx";

export default class CellMethods extends CellElementList {
  constructor(props) {
    super(props);
  }

  getElements() {
    return this.props.cellValue.getMethods();
  }

  getElementName() {
    return "Method";
  }

  addElementClicked() {
    this.props.umlEditor.openClassMethodModal(this.props.cell);
  }

  removeElementClicked(relationId) {
    this.props.umlEditor.deleteClassMethod(this.props.cell, relationId);
  }
}
