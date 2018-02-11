import CreateEdgeAction from './CreateEdgeAction.js';

import { EdgeType } from '../../util/EdgeType.js';

export default class CreateEdgeDirectedAssociationAction extends CreateEdgeAction {
	getEdgeType() {
		return EdgeType.DIRECTED_ASSOCIATION;
	}
}
