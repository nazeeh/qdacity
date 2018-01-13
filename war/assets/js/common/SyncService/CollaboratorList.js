import React from 'react'
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledCollaboratorCount = styled.div `
	text-align: left;
	font-size: 12px;
	line-height: 2em;
	color: #999;
`;

const StyledCollaboratorBox = styled.ul `
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 100%;
	max-height: 200px;
	margin: 0;
	list-style: none;
	padding: 0 0 4px;
	overflow: auto;
`;

const StyledCollaboratorItem = styled.li `
	ul:hover > & {
		width: 100%;
		margin: 
	}
`;

const StyledCollaborator = styled.div `
	position: relative;
	display: block;
	justify-content: center;
	flex-direction: column;
	width: ${props => props.diameter}px;
	height: ${props => props.diameter}px;
	margin: ${props => props.diameter / 10}px;
	box-shadow: 1px 1px 4px rgba(0,0,0,0.5);
	border-radius: 50%;

	ul:hover > li > &:before {
		content: "${props => props.name}";
		position: absolute;
		top: 0;
		left: 0;
		background: #fefefe;
		box-shadow: 1px 1px 4px rgba(0,0,0,.5);
		border-radius: ${props => props.diameter / 2}px;
		padding-right: ${props => props.diameter / 3}px;
		padding-left: ${props => props.diameter / 3 * 4}px;
		font-size: ${props => props.diameter * .6}px;
		color: #333;
		line-height: ${props => props.diameter}px;
		white-space: nowrap;
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



export default class CollaboratorList extends React.Component {

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
			'userlistUpdated',
			list => this.setState({
				collaborators: list
			})
		);
	}

	componentWillUnmount() {
		const syncService = this.props.syncService;
		syncService && syncService.off('userlistUpdated', this.listenerID);
	}

	render() {

		// Get props
		const diameter = this.props.diameter;

		// Get collaborators from state and filter by docid if set
		const collaborators = this.state.collaborators;

		return (
			<div>
				<StyledCollaboratorCount>
					<FormattedMessage
						id='collaborators.count'
						defaultMessage={`{count, plural,
							=0 {No collaborators}
							one {# collaborator}
							other {# collaborators}
						}`}
						values={{ count: collaborators.length }}
					/>
				</StyledCollaboratorCount>
				<StyledCollaboratorBox diameter={diameter}>
					{ collaborators.map((c, i) => (
						<StyledCollaboratorItem>
							<StyledCollaborator
								picSrc={c.picSrc}
								name={c.name}
								hoverOffset={i * (diameter-2)}
								diameter={diameter}
							/>
						</StyledCollaboratorItem>
					))}
				</StyledCollaboratorBox>
			</div>
		);
	}
};

CollaboratorList.defaultProps = {
	diameter: 20,
};
