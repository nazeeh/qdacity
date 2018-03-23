import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import IntlProvider from '../../common/Localization/LocalizationProvider';

//Base Structure

//Overlay, which appears if for example a MessageBox appears
const OverlayVisual = styled.div`
	position: fixed;
	display: ${props =>
		props.tutorial.tutorialState.showOverlayVisual ? 'inline' : 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 2000;
`;

//Overlay, which appears for blocking most of the visible dom-objects to be clicked or interacted
//(if i want steer a user in a certain direction)
const OverlayBlockInteraction = styled.div`
	position: fixed;
	display: ${props =>
		props.tutorial.tutorialState.showOverlayBlockInteraction
			? 'inline'
			: 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${props =>
		props.tutorial.tutorialState.highlightOverlayBlockInteraction
			? 'rgba(0,0,0,0.4)'
			: 'rgba(0,0,0,0.0)'};
	z-index: 1900;
`;

const MessageBox = styled.div`
	position: fixed;
	top: -20%;
	bottom: 0;
	left: 0;
	right: 0;
	width: 700px;
	height: 400px;
	margin: auto;
	z-index: 2010;
	color: #543f3f;
	background-color: white;

	font-family: 'Helvetica Neue', sans-serif;
	color: rgb(0, 0, 0);
	font-size: 1.1em;
	line-height: 1.5em;
	border-width: 2px;
	border-style: solid;
	border-color: rgb(0, 0, 0);
	border-image: initial;
	padding: 2em;

	display: ${props =>
		props.tutorial.tutorialState.showMessageBoxContent > 0 ? 'inline' : 'none'};
`;

const MBLoading = styled.div`
	display: ${props =>
		props.tutorial.tutorialState.showMessageBoxContent == 1
			? 'inline'
			: 'none'};
`;

const MBTutorialOverview = styled.div`
	display: ${props =>
		props.tutorial.tutorialState.showMessageBoxContent == 2
			? 'inline'
			: 'none'};
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

const Pointer = styled.div`
	height: 20px;
	width: 20px;
	position: absolute;
	z-index: 1905;
	top: ${props => props.tutorial.tutorialState.pointer.top}px;
	left: ${props => props.tutorial.tutorialState.pointer.left}px;
	display: ${props =>
		props.tutorial.tutorialState.pointer.show ? 'inline' : 'none'};
`;
//Base Structure End

//Detail Structure

const TutorialOverviewTitle = styled.div`
	font-size: 18px;
`;

const TutorialOverviewSubBox = styled.div`
	background: #ececec;
	padding: 10px;
	margin: 10px;
	position: relative;
	min-height: 150px;
	opacity: 0.6;
	&:hover {
		opacity: 1 !important;
	}
`;

const TutorialOverviewSubBoxTitle = styled.div`
	float: left;
	width: 190px;
	color: #805506;
	font-size: 19px;
`;

const TutorialOverviewSubBoxStatistic1 = styled.div`
	float: left;
	margin-right: 20px;
`;

const TutorialOverviewSubBoxStatistic2 = styled.div`
	float: left;
`;

const TutorialOverviewSubBoxClearing = styled.div`
	clear: both;
`;

const TutorialOverviewSubBoxPlaceholder = styled.div`
	height: 15px;
`;

const TutorialOverviewContainer = styled.div`
	max-height: 240px;
	overflow-y: scroll;
`;

const TutorialOverviewSubBoxShortDescription = styled.div`
	margin-top: 40px;
	margin-bottom: 20px;
	background: #d6d6d6;
	text-align: left !important;
	display: ${props => (props.show ? 'block' : 'none')};
`;

//Detail Structure End

export default class Tutorial extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	renderDescriptionButton(openDescription, tutorialUnitId) {
		if (openDescription) {
			return (
				<ButtonGeneric
					white
					onClick={function() {
						this.props.tutorial.tutorialEngine.setCurrentShowShortDescriptionId(
							tutorialUnitId
						);
					}.bind(this)}
				>
					<FormattedMessage
						id="tutorial.openDescription"
						defaultMessage="Open Description"
					/>
				</ButtonGeneric>
			);
		} else {
			return (
				<ButtonGeneric
					white
					onClick={function() {
						this.props.tutorial.tutorialEngine.setCurrentShowShortDescriptionId(
							-1
						);
					}.bind(this)}
				>
					<FormattedMessage
						id="tutorial.closeDescription"
						defaultMessage="Close Description"
					/>
				</ButtonGeneric>
			);
		}
	}

	render() {
		if (this.props.tutorial.tutorialState.isActive) {
			var tutorialOverviewItems = this.props.tutorial.tutorialState.overviewData.map(
				data => (
					<TutorialOverviewSubBox key={data.tutorialUnitId}>
						<b>
							<TutorialOverviewSubBoxTitle>
								{data.title()}
							</TutorialOverviewSubBoxTitle>
							<TutorialOverviewSubBoxStatistic1>
								<FormattedMessage
									id="tutorial.finished"
									defaultMessage="finished"
								/>{' '}
								{data.finishedRelative}%
							</TutorialOverviewSubBoxStatistic1>
							<TutorialOverviewSubBoxStatistic2>
								<FormattedMessage
									id="tutorial.finishedAt"
									defaultMessage="finished at"
								/>: {data.finishedAt}
							</TutorialOverviewSubBoxStatistic2>
							<TutorialOverviewSubBoxClearing />
						</b>
						<TutorialOverviewSubBoxPlaceholder />
						<div>
							<ButtonGeneric
								white={false}
								onClick={function() {
									this.props.tutorial.tutorialEngine.activateTutorial(
										data.tutorialUnitId
									);
									this.props.tutorial.tutorialEngine.hideMessageBoxAndOverlay(
										true
									);
								}.bind(this)}
							>
								<FormattedMessage
									id="tutorial.startTutorial"
									defaultMessage="Start Tutorial"
								/>
							</ButtonGeneric>
							{this.renderDescriptionButton(
								data.tutorialUnitId !=
									this.props.tutorial.tutorialState
										.currentShowShortDescriptionId,
								data.tutorialUnitId
							)}
						</div>
						<TutorialOverviewSubBoxShortDescription
							show={
								data.tutorialUnitId ==
								this.props.tutorial.tutorialState.currentShowShortDescriptionId
							}
						>
							{data.descriptionTextShort()}
						</TutorialOverviewSubBoxShortDescription>
					</TutorialOverviewSubBox>
				)
			);

			return (
				<div>
					<OverlayVisual {...this.props} />
					<OverlayBlockInteraction {...this.props} />
					<Pointer {...this.props}>
						<img
							src={
								'/assets/img/tutorial/arrow' +
								this.props.tutorial.tutorialState.pointer.direction +
								'Directed.png'
							}
						/>
					</Pointer>
					<MessageBox {...this.props}>
						<MBLoading {...this.props}>
							<FormattedMessage
								id="tutorial.loading"
								defaultMessage="please wait until the content is loaded..."
							/>
						</MBLoading>
						<MBTutorialOverview {...this.props}>
							<center>
								<TutorialOverviewTitle>
									<b>
										<FormattedMessage
											id="tutorial.overview"
											defaultMessage="Tutorial Overview"
										/>
									</b>
								</TutorialOverviewTitle>
								<br />
								<TutorialOverviewContainer>
									{tutorialOverviewItems}
								</TutorialOverviewContainer>
								<br />
							</center>
						</MBTutorialOverview>
						<div>
							<ButtonGeneric
								white
								onClick={function() {
									this.props.tutorial.tutorialEngine.hideMessageBoxAndOverlay(
										true
									);
								}.bind(this)}
							>
								<FormattedMessage id="modal.close" defaultMessage="Close" />
							</ButtonGeneric>
						</div>
					</MessageBox>
				</div>
			);
		}

		return null;
	}
}
