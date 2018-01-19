import Rule from "./mapping/Rule.js";
import { Target } from "./mapping/Target.js";
import { EvaluationTarget } from "./mapping/conditions/EvaluationTarget.js";
import Condition from "./mapping/Condition.js";
import Action from "./mapping/Action.js";

export const DefaultRuleSet = [
  // Code mapping
  Rule.create()
    .expect(Target.CODE)
    .require(
      Condition.or(
        Condition.hasMetaModelEntity("Category"),
        Condition.hasMetaModelEntity("Concept")
      )
    )
    .then(Action.createNode()),

  // Relation generalization
  Rule.create()
    .expect(Target.RELATION)
    .require(
      Condition.and(
        Condition.hasMetaModelEntity("is a"),
        Condition.or(
          Condition.hasMetaModelEntity("Category", EvaluationTarget.SOURCE),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.SOURCE)
        ),
        Condition.or(
          Condition.hasMetaModelEntity(
            "Category",
            EvaluationTarget.DESTINATION
          ),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.DESTINATION)
        )
      )
    )
    .then(Action.createGeneralization()),

  // Relation aggregation
  Rule.create()
    .expect(Target.RELATION)
    .require(
      Condition.and(
        Condition.hasMetaModelEntity("is part of"),
        Condition.or(
          Condition.hasMetaModelEntity("Category", EvaluationTarget.SOURCE),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.SOURCE)
        ),
        Condition.or(
          Condition.hasMetaModelEntity(
            "Category",
            EvaluationTarget.DESTINATION
          ),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.DESTINATION)
        )
      )
    )
    .then(Action.createAggregation()),

  // Relation directed association
  Rule.create()
    .expect(Target.RELATION)
    .require(
      Condition.and(
        Condition.hasMetaModelEntity("is related to"),
        Condition.or(
          Condition.hasMetaModelEntity("Category", EvaluationTarget.SOURCE),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.SOURCE)
        ),
        Condition.or(
          Condition.hasMetaModelEntity(
            "Category",
            EvaluationTarget.DESTINATION
          ),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.DESTINATION)
        )
      )
    )
    .then(Action.createDirectedAssociation()),

  // Relation class field
  Rule.create()
    .expect(Target.RELATION)
    .require(
      Condition.and(
        Condition.hasMetaModelEntity("is related to"),
        Condition.or(
          Condition.hasMetaModelEntity("Category", EvaluationTarget.SOURCE),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.SOURCE)
        ),
        Condition.hasMetaModelEntity("Property", EvaluationTarget.DESTINATION),
        Condition.or(
          Condition.hasMetaModelEntity("Object", EvaluationTarget.DESTINATION),
          Condition.hasMetaModelEntity("Actor", EvaluationTarget.DESTINATION),
          Condition.hasMetaModelEntity("Place", EvaluationTarget.DESTINATION)
        )
      )
    )
    .then(Action.createClassField()),

  // Relation class method
  Rule.create()
    .expect(Target.RELATION)
    .require(
      Condition.and(
        Condition.hasMetaModelEntity("influences"),
        Condition.or(
          Condition.hasMetaModelEntity("Category", EvaluationTarget.SOURCE),
          Condition.hasMetaModelEntity("Concept", EvaluationTarget.SOURCE)
        ),
        Condition.hasMetaModelEntity("Property", EvaluationTarget.DESTINATION)
      )
    )
    .then(Action.createClassMethod())
];
