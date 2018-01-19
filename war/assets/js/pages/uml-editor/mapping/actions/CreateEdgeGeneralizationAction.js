import CreateEdgeAction from "./CreateEdgeAction.js";

import { EdgeType } from "../../util/EdgeType.js";

export default class CreateEdgeGeneralizationAction extends CreateEdgeAction {
  getEdgeType() {
    return EdgeType.GENERALIZATION;
  }
}
