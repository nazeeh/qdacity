import BaseAction from "./BaseAction.js";

import { Target } from "../Target.js";

export default class CreateRelationAction extends BaseAction {
  getRequiredTargetType() {
    return Target.RELATION;
  }

  doExecute(relation) {
    const mapper = this.getRule().getMapper();

    const sourceCode = mapper.getCodeById(relation.key.parent.id);
    const destinationCode = mapper.getCodeByCodeId(relation.codeId);

    this.addRelation(sourceCode, destinationCode, relation);
  }

  addRelation(sourceCode, destinationCode, relation) {
    // Override
  }

  doUndo(relation) {
    const mapper = this.getRule().getMapper();

    const sourceCode = mapper.getCodeById(relation.key.parent.id);
    const destinationCode = mapper.getCodeByCodeId(relation.codeId);

    this.removeRelation(sourceCode, destinationCode, relation);
  }

  removeRelation(sourceCode, destinationCode, relation) {
    // Override
  }
}
