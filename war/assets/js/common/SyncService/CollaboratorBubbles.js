import React from 'react'
import styled from 'styled-components';

const StyledCollaboratorBox = styled.ul `
	position: relative;
	margin: 0;
	list-style: none;
	padding: 0;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	width: ${props => props.width}px;
	height: ${props => props.diameter}px;
`;

const StyledMoreCount = styled.li `
	position: relative;
	line-height: ${props => props.diameter}px;
	height: ${props => props.diameter}px;
	width: ${props => props.diameter}px;
	margin-left: -${props => props.diameter / 2}px;
	border-radius: 50%;
	background: white;
	box-shadow: 1px 1px 4px rgba(0,0,0,0.5);
	font-size: ${props => props.diameter * .6}px;
	color: #333;

	&:before {
		content: "+";
	}

	ul:hover > & {
		display: none;
	}
`;

const StyledCollaborator = styled.li `
	position: relative;
	display: flex;
	justify-content: center;
	flex-direction: column;
	width: ${props => props.diameter}px;
	height: ${props => props.diameter}px;
	margin-left: -${props => props.diameter / 2}px;
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
		border-radius: ${props => props.diameter / 2}px;
		padding-right: ${props => props.diameter / 3 * 2}px;
		padding-left: ${props => props.diameter / 3}px;
		font-size: ${props => props.diameter * .6}px;
		color: #333;
		line-height: ${props => props.diameter}px;
		white-space: nowrap;
		max-width: 0;
		transition: max-width 250ms cubic-bezier(0.55, 0.055, 0.675, 0.19),
					padding-right 250ms cubic-bezier(0.55, 0.055, 0.675, 0.19);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&:hover:before {
		max-width: ${props => props.diameter * 10}px;
		padding-right: ${props => props.diameter / 3 * 4}px;
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
		width: ${props => props.diameter}px;
		height: ${props => props.diameter}px;
	}
`;

export default class CollaboratorBubbles extends React.Component {

	constructor(props) {
		super(props);

		this.listenerID = '';

		this.state = {
			collaborators: [],
		};
	}

	componentDidMount() {
		const syncService = this.props.syncService;
		this.listenerID = syncService && syncService.on(
			'changeUserList',
			list => this.setState({ collaborators: list })
		);
	}

	componentWillUnmount() {
		const syncService = this.props.syncService;
		syncService && syncService.off('changeUserList', this.listenerID);
	}

	render() {

		// Get props
		const {
			diameter,
			displayCount,
			docid,
		} = this.props;

		// Get collaborators from state and filter by docid if set
		const collaborators = this.state.collaborators.filter(
			c => docid === null || c.document === docid
		);

		// Calculate number of collaborators in Dropdown
		const moreCount = Math.max(collaborators.length - displayCount + 1, 0);

		return (
			<StyledCollaboratorBox
				width={(Math.min(displayCount, collaborators.length) + 1) * diameter * 0.5}
				diameter={diameter}
			>
				{ collaborators.map((c, i) => (
					<StyledCollaborator
						picSrc={c.picSrc}
						name={c.name}
						displayCount={displayCount}
						hoverOffset={i * (diameter-2)}
						diameter={diameter}
					/>
				))}
				{ moreCount > 0
					? <StyledMoreCount diameter={diameter}>
						{moreCount}
					</StyledMoreCount>
					: null }
			</StyledCollaboratorBox>
		);
	}
};

CollaboratorBubbles.defaultProps = {
	diameter: 20,
	syncService: null,
	displayCount: 3,
	docid: null,
};
