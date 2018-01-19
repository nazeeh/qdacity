import MultipleCondition from "./MultipleCondition.js";

export default class AndCondition extends MultipleCondition {
  constructor(conditions) {
    super(conditions);
  }

  compare(resultA, resultB) {
    return resultA && resultB;
  }
}
