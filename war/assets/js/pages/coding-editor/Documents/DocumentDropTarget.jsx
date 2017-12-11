import React from 'react';
import styled from 'styled-components';

import {
	DropTarget
} from 'react-dnd';

const StyledDocumentDrop = styled.div `
    background-color: ${props => props.active ? props.theme.bgDefaultHighlight : 'transparent'};
    height: 3px;
    margin-top: 3px;
    margin-bottom: 2px;
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
			canDrop,
			isOver,
			connectDropTarget
		} = this.props;

		const active = canDrop && isOver;

		return connectDropTarget(
			<div>
	            <StyledDocumentDrop active={active} />
	        </div>);
	}
}

const DropDocument = DropTarget("document", documentTarget, collectTarget)(DocumentDropTarget)

export {
	DropDocument
};