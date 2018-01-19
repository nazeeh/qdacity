import React from 'react';
import styled from 'styled-components';

import SyncService from '../../common/SyncService';

const StyledCollaboratorBox = styled.ul`
	position: relative;
	margin: 0;
	list-style: none;
	padding: 0;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	width: ${props => props.width}px;
	height: 30px;
`;
const StyledPlaceholder = styled.li`
	line-height: 30px;
	font-size: 12px;
	white-space: pre;
`;

const StyledMoreCount = styled.li`
	position: relative;
	line-height: 30px;
	height: 30px;
	width: 30px;
	margin-left: -15px;
	border-radius: 50%;
	background: white;
	box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);

	&:before {
		content: '+';
	}

	ul:hover > & {
		display: none;
	}
`;

const StyledCollaborator = styled.li`
	position: relative;
	display: flex;
	justify-content: center;
	flex-direction: column;
	width: 30px;
	height: 30px;
	margin: 0 5px 0 -15px;
	box-shadow: 1px 1px 4px rgba(0,0,0,0.5);
	border-radius: 50%;

	&:nth-child(1n+3) {
		display: none;
	}
	ul:hover > &:nth-child(1n+${props => props.displayCount}) {
		display: flex;
	}

	ul:hover & {
		position: absolute;
		right: 0;
		top: ${props => props.hoverOffset}px;
		z-index: 1;
	}

	&:before {
		content: "${props => props.name}";
		position: absolute;
		top: 0;
		right: 0;
		background: #fefefe;
		box-shadow: 1px 1px 4px rgba(0,0,0,.5);
		border-radius: 25px;
		padding-right: 20px;
		padding-left: 10px;
		line-height: 30px;
		white-space: pre;
		max-width: 0;
		transition: max-width 250ms cubic-bezier(0.55, 0.055, 0.675, 0.19),
					padding-right 250ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&:hover:before {
		max-width: 300px;
		padding-right: 35px;
		transition: max-width 300ms cubic-bezier(0.215, 0.61, 0.355, 1),
					padding-right 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
	}

	&:after {
		position: absolute;
		top: 0;
		right: 0;
		content: "";
		background: url(${props => props.picSrc}) no-repeat;
		background-size: cover;
		border-radius: 50%;
		width: 30px;
		height: 30px;
	}
`;

export default class CollaboratorList extends React.Component {
	constructor(props) {
		super(props);

		this.listenerID = '';

		this.state = {
			collaborators: []
		};
	}

	componentDidMount() {
		this.listenerID = this.props.syncService.on('changeUserList', list =>
			this.setState({
				collaborators: list
			})
		);
	}

	componentWillUnmount() {
		this.props.syncService.off('changeUserList', this.listenerID);
	}

	render() {
		// Get a copy of the collaborators and reverse it
		const collaborators = this.state.collaborators;

		// Get displayCount prop or fallback to default value
		const displayCount = this.props.displayCount || 3;

		// Calculate number of collaborators in Dropdown
		const moreCount = Math.max(collaborators.length - displayCount + 1, 0);

		return (
			<StyledCollaboratorBox width={displayCount * 30 - 15}>
				{collaborators.length == 0 ? (
					<StyledPlaceholder>No collaborators</StyledPlaceholder>
				) : null}
				{collaborators.map((c, i) => (
					<StyledCollaborator
						picSrc={c.picSrc}
						name={c.name}
						displayCount={displayCount}
						hoverOffset={i * 28}
					/>
				))}
				{moreCount > 0 ? <StyledMoreCount>{moreCount}</StyledMoreCount> : null}
			</StyledCollaboratorBox>
		);
	}
}
