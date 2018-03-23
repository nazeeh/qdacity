import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StepContainer = styled.div`
	background: ${props => (props.finish ? '#91f191' : '#d6d6d6')};
	padding: 10px;
	margin-bottom: 20px;
`;

const StepDescriptionText = styled.div``;

const StepActionContainer = styled.div`
	height: 40px;
	position: relative;
	display: ${props => (props.show ? 'inline' : 'none')};
`;

const ButtonGeneric = styled.button`
	background: ${props => (props.white ? '000' : 'fff')};
	color: background: ${props => (props.white ? 'fff' : '000')};
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

const CloseButtonBox = styled.div`
	padding-top: 30px;
	position: relative;
`;

const ShowOkButton = styled.div`
	display: ${props => (props.show ? 'inline' : 'none')};
`;

export default class Sidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		if (this.props.tutorial.tutorialState.isActive) {
			var steps = this.props.tutorial.tutorialState.currentStepsView.map(
				data => (
					<StepContainer
						key={data.stepNr}
						finish={
							data.stepNr < this.props.tutorial.tutorialState.currentActiveStep
						}
					>
						<StepDescriptionText>{data.text()}</StepDescriptionText>
						<br />

						<StepActionContainer isActive={false}>
							//TODO get active step nr and show or hide
							<ShowOkButton show={false}>
								{' '}
								//TODO get boolean from tutorialEnginge and stepNr
								<ButtonGeneric white={false}>
									<FormattedMessage id="tutorial.ok" defaultMessage="OK" />
								</ButtonGeneric>
							</ShowOkButton>
						</StepActionContainer>
					</StepContainer>
				)
			);

			return (
				<div>
					{steps}
					<CloseButtonBox>
						<ButtonGeneric
							white={false}
							onClick={function() {
								this.props.tutorial.tutorialEngine.closeTutorial();
							}.bind(this)}
						>
							<FormattedMessage
								id="tutorial.closeTutorial"
								defaultMessage="Close Tutorial"
							/>
						</ButtonGeneric>
					</CloseButtonBox>
				</div>
			);
		}

		return null;
	}
}
