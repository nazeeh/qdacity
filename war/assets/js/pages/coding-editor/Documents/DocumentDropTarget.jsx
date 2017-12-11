import React from 'react';
import styled from 'styled-components';

import {
	DropTarget
} from 'react-dnd';

const StyledDocumentDrop = styled.div `
    height: 5px;
`;

const documentTarget = {
	drop(props, monitor, component) {
		const hasDroppedOnChild = monitor.didDrop();

		if (!hasDroppedOnChild) {
			return {
				dropTargetId: 0
			};
		}
	}
};

function collectTarget(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop()
	};
}

class DocumentDropTarget extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const {
			connectDropTarget
		} = this.props;

		return connectDropTarget(
			<div>
	            <StyledDocumentDrop />
	        </div>);
	}
}

const DropDocument = DropTarget("document", documentTarget, collectTarget)(DocumentDropTarget)

export {
	DropDocument
};