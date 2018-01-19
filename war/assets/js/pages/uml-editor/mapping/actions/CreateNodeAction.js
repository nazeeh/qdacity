import BaseAction from "./BaseAction.js";

import { Target } from "../Target.js";

export default class CreateNodeAction extends BaseAction {
  getIdentifier() {
    return "CREATE_NODE";
  }

  getRequiredTargetType() {
    return Target.CODE;
  }

  doExecute(code) {
    this.getRule()
      .getMapper()
      .getUmlEditor()
      .addNode(code);
  }

  doUndo(code) {
    this.getRule()
      .getMapper()
      .getUmlEditor()
      .removeNode(code);
  }
}
