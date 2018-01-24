import React from 'react'
import styled from 'styled-components';


const StepContainer = styled.div`
	background: #d6d6d6; 
	padding:10px; 
	margin-bottom:20px;
`;

const StepDescriptionText = styled.div`
	
`;

const StepActionContainer = styled.div`
	height:40px; 
	position: relative;
`;


const ButtonGeneric = styled.button`
	background: ${props =>props.white ? '000' : 'fff'};
	color: background: ${props =>props.white ? 'fff' : '000'};
	border: 2px solid #000;	
	float: right;
	margin: 0 0 0 .5em;
	font-family: inherit;
	text-transform: uppercase;
	letter-spacing: .1em;
	font-size: .8em;
	line-height: 1em;
	padding: .75em 2em;	
`;


export default class Sidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		
		
		if(this.props.tutorial.tutorialState.isActive) {
		
			var steps = this.props.tutorial.tutorialState.currentStepsView.map((data) =>
			
			<StepContainer key={data.stepNr}>
				<StepDescriptionText>
					{data.text}
				</StepDescriptionText> 
				<br />
			
				<StepActionContainer>
					<ButtonGeneric white={false}>OK</ButtonGeneric>
				</StepActionContainer>
			</StepContainer>

			);
			
		
		
			return (
					<div>						
						{steps}	
					</div>
			);
		}
		
	return null;
	
	}
}

