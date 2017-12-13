import React from 'react'
import styled from 'styled-components';

//Base Structure

const Overlay1 = styled.div`
	position: fixed;
	display: ${props =>props.tutorial.tutorialState.showOverlay1 ? 'inline' : 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.5);
	z-index: 2000;
`;


const Overlay2 = styled.div`
	position: fixed;
	display: ${props =>props.tutorial.tutorialState.showOverlay2 ? 'inline' : 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${props =>props.tutorial.tutorialState.highlightOverlay2 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.0)'};
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
	color:#543f3f;
	background-color: white;	
	
	font-family: "Helvetica Neue", sans-serif;
	color: rgb(0, 0, 0);
	font-size: 1.1em;
	line-height: 1.5em;
	border-width: 2px;
	border-style: solid;
	border-color: rgb(0, 0, 0);
	border-image: initial;
	padding: 2em;

	display: ${props =>props.tutorial.tutorialState.showMessageBoxContent>0 ? 'inline' : 'none'};
`;

const MBLoading = styled.div`
	display: ${props =>props.tutorial.tutorialState.showMessageBoxContent==1 ? 'inline' : 'none'};
`;


const MBTutorialOverview = styled.div`
	display: ${props =>props.tutorial.tutorialState.showMessageBoxContent==2 ? 'inline' : 'none'};
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

const Pointer = styled.div`
	height:20px; 
	width:20px; 
	position: absolute; 
	z-index:1905; 
	top: ${props =>props.tutorial.tutorialState.pointer.top}px; 
	left: ${props =>props.tutorial.tutorialState.pointer.left}px;
	display: ${props =>props.tutorial.tutorialState.pointer.show ? 'inline' : 'none'};
`;
//Base Structure End

//Detail Structure

const TutorialOverviewTitle = styled.div`
	font-size: 18px,
`;

const TutorialOverviewSubBox = styled.div`
	background:#ececec; 
	padding: 10px; 
	margin: 10px; 
	position:relative; 
	height: 100px;
	opacity:0.6;
	&:hover {
		opacity:1 !important;
	}
`;

const TutorialOverviewSubBoxTitle = styled.div`
	float:left; 
	width:190px; 
	color:#805506; 
	font-size:19px;
`;

const TutorialOverviewSubBoxStatistic1 = styled.div`
	float:left; 
	margin-right:20px;
`;

const TutorialOverviewSubBoxStatistic2 = styled.div`
	float:left; 
`;

const TutorialOverviewSubBoxClearing = styled.div`
	clear: both ;
`;

const TutorialOverviewSubBoxPlaceholder = styled.div`
	height: 15px ;
`;

//Detail Structure End


export default class Tutorial extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		
		
		if(this.props.tutorial.tutorialState.isActive) {
		
		var tutorialOverviewItems = this.props.tutorial.tutorialState.overviewData.map((data) =>
		<TutorialOverviewSubBox>
			<b>
				<TutorialOverviewSubBoxTitle>Test-Tutorial</TutorialOverviewSubBoxTitle>
				<TutorialOverviewSubBoxStatistic1>finished (data.finishRelative%)</TutorialOverviewSubBoxStatistic1>
				<TutorialOverviewSubBoxStatistic2>finished at: finishedAt</TutorialOverviewSubBoxStatistic2>
				<TutorialOverviewSubBoxClearing/>
			</b>
			<TutorialOverviewSubBoxPlaceholder/>
			<ButtonGeneric white={false}>Start Tutorial</ButtonGeneric><ButtonGeneric white>Open Description</ButtonGeneric>
		</TutorialOverviewSubBox>
		);
		
		
			return (
					<div>						
						<Overlay1 {...this.props}/>
						<Overlay2 {...this.props}/>
						<Pointer  {...this.props}><img src={"/assets/img/tutorial/arrow"+this.props.tutorial.tutorialState.pointer.direction+"Directed.png"}/></Pointer>						
						<MessageBox {...this.props}>
							<MBLoading {...this.props}>please wait the content is loaded... </MBLoading>
							<MBTutorialOverview  {...this.props}>
								<center>
									<TutorialOverviewTitle><b>Tutorial Overview</b></TutorialOverviewTitle>
									<br/>
									<div>
										{tutorialOverviewItems}
									</div>
									<br/><br/>									
								</center>
							</MBTutorialOverview>
							<div>
								<ButtonGeneric white onClick={function(){this.props.tutorial.tutorialEngine.hideMessageBoxAndOverlay(true);}.bind(this)}>Close</ButtonGeneric>
							</div>
						</MessageBox>						
					</div>
			);
		}
		
	return null;
	
	}
}

