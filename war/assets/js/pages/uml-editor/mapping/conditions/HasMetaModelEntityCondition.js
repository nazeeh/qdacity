import BaseCondition from "./BaseCondition.js";
import IntlProvider from "../../../../common/Localization/LocalizationProvider";
import { Target } from "../Target.js";

import { EvaluationTarget } from "./EvaluationTarget.js";

export default class HasMetaModelEntityCondition extends BaseCondition {
  constructor(metaModelEntityName, evaluationTarget) {
    super();
    this.metaModelEntityName = metaModelEntityName;
    this.evaluationTarget = evaluationTarget;
  }

  evaluate(target) {
    const { formatMessage } = IntlProvider.intl;
    if (this.getRule().getTargetType() == Target.CODE) {
      return this.evaluateCode(target);
    } else if (this.getRule().getTargetType() == Target.RELATION) {
      return this.evaluateRelation(target);
    } else {
      throw new Error(
        formatMessage(
          {
            id: "hasmetamodelentitycondition.unknown_type",
            defaultMessage: "Unknown target type {target}"
          },
          { target: this.getRule().getTarget() }
        )
      );
    }
  }

  evaluateCode(code) {
    let mmElementIds = code.mmElementIDs;

    if (mmElementIds != null) {
      for (let i = 0; i < mmElementIds.length; i++) {
        const mmElementId = mmElementIds[i];

        const entity = this.getMetaModelEntityById(mmElementId);

        if (entity != null && entity.name == this.metaModelEntityName) {
          return true;
        }
      }
    }

    return false;
  }

  evaluateRelation(relation) {
    const { formatMessage } = IntlProvider.intl;
    // Relation has metaModelEntity
    if (
      this.evaluationTarget == null ||
      this.evaluationTarget == EvaluationTarget.THIS
    ) {
      let mmElementId = relation.mmElementId;

      const entity = this.getMetaModelEntityById(mmElementId);

      return entity != null && entity.name == this.metaModelEntityName;
    } else if (this.evaluationTarget == EvaluationTarget.SOURCE) {
      // Relation source code has metaModelEntity
      let sourceCode = this.getRule()
        .getMapper()
        .getCodeById(relation.key.parent.id);
      return this.evaluateCode(sourceCode);
    } else if (this.evaluationTarget == EvaluationTarget.DESTINATION) {
      // Relation destination code has metaModelEntity
      let destinationCode = this.getRule()
        .getMapper()
        .getCodeByCodeId(relation.codeId);
      return this.evaluateCode(destinationCode);
    } else {
      // Error
      throw new Error(
        formatMessage(
          {
            id: "hasmetamodelentitycondition.unknown_type",
            defaultMessage: "Unknown target type {target}"
          },
          { target: this.evaluationTarget() }
        )
      );
    }
  }

  getMetaModelEntityById(metaModelElementId) {
    return this.getRule()
      .getMapper()
      .getMetaModelEntityById(metaModelElementId);
  }
}
