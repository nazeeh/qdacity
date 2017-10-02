import BaseCondition from './BaseCondition.js';

import {
	Target
} from '../Target.js';

import {
	EvaluationTarget
} from './EvaluationTarget.js';

export default class HasMetaModelEntityCondition extends BaseCondition {

	constructor(metaModelEntityName, evaluationTarget) {
		super();
		this.metaModelEntityName = metaModelEntityName;
		this.evaluationTarget = evaluationTarget;
	}

	evaluate(target) {
		if (this.getRule().getTargetType() == Target.CODE) {
			return this.evaluateCode(target);
		} else if (this.getRule.getTargetType() == Target.RELATION) {
			return this.evaluateRelation(target);
		} else {
			throw new Error('Unknown target type ' + this.getRule.getTarget());
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
		// Relation has metaModelEntity
		if (this.evaluationTarget == null || this.evaluationTarget == EvaluationTarget.THIS) {
			let mmElementId = relation.mmElementId;

			const entity = this.getMetaModelEntityById(mmElementId);

			return entity != null && entity.name == this.metaModelEntityName;
		}
		// Relation source code has metaModelEntity
		else if (this.evaluationTarget == EvaluationTarget.SOURCE) {
			let sourceCode = this.getRule().getMapper().getCodeById(relation.key.parent.id);
			return this.evaluateCode(sourceCode);
		}
		// Relation destination code has metaModelEntity
		else if (this.evaluationTarget == EvaluationTarget.DESTINATION) {
			let destinationCode = this.getRule().getMapper().getCodeByCodeId(relation.codeId);
			return this.evaluateCode(destinationCode);
		}
		// Error
		else {
			throw new Error('Unknown target type ' + this.evaluationTarget);
		}
	}

	getMetaModelEntityById(metaModelElementId) {
		return this.getRule().getMapper().getMetaModelEntityById(metaModelElementId);
	}
}