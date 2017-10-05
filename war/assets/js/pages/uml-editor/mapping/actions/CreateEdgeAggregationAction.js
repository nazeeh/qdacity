import CreateEdgeAction from './CreateEdgeAction.js';

import {
	EdgeType
} from '../../util/EdgeType.js';

export default class CreateEdgeAggregationAction extends CreateEdgeAction {

	getEdgeType() {
		return EdgeType.AGGREGATION;
	}
}