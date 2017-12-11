import React from 'react'
import styled from 'styled-components';

//Base Structure
const OverlayQdq1 = styled.div`
	position: fixed;
	display: ${props =>props.tutorial.tutorialState.showOverlayQdq1 ? 'inline' : 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.5);
	z-index: 2000;
`;


const OverlayQdq2 = styled.div`
	position: fixed;
	display: ${props =>props.tutorial.tutorialState.showOverlayQdq2 ? 'inline' : 'none'};
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${props =>props.tutorial.tutorialState.highlightOverlayQdq2 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.0)'};
	z-index: 1900;
`;

const MessageBoxQdq = styled.div`
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

const ButtonQdq = styled.button`
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

const PointerQdq = styled.div`
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

const divStyle1 = {
	background: "#e8e5e5",
	border:"1px solid #cc",
	width: "300px",
	height: "800px",
	position: "fixed",
	right:"0", 
	top:"50px",
	display:"none",
	zIndex:"1910",
};

const divStyle2 = {
		padding:"10px",
	};

const divStyle3 = {
	position: "absolute",
	bottom:"0",
	paddingLeft:"70px",
	paddingBottom:"10px",
};

const divStyle4 = {
	fontSize:"18px",
};
const TutorialOverviewTitle = styled.div`
	font-size: 18px,
`;

//Detail Structure End


export default class Tutorial extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		if(this.props.tutorial.tutorialState.isActive) {
			return (
					<div>						
						<OverlayQdq1 className="overlayQdq1" {...this.props}/>
						<OverlayQdq2 className="overlayQdq2" {...this.props}/>
						<PointerQdq className="pointing" {...this.props}><img src={"/assets/img/tutorial/arrow"+this.props.tutorial.tutorialState.pointer.direction+"Directed.png"}/></PointerQdq>						
						<MessageBoxQdq className="messageBoxQdq" {...this.props}>
							<MBLoading {...this.props}>please wait the content is loaded... </MBLoading>
							<MBTutorialOverview className="tutorial_content" {...this.props}>
								<center>
									<TutorialOverviewTitle><b>Tutorial Overview</b></TutorialOverviewTitle>
									<br/><div className="tutorial_main_box">TODO Struktur kommt</div>
									<br/><br/>									
								</center>
							</MBTutorialOverview>
							<div>
								<ButtonQdq white onClick={function(){this.props.tutorial.tutorialEngine.hideMessageBoxAndOverlay(true);}.bind(this)}>Close</ButtonQdq>
							</div>
						</MessageBoxQdq>
						
						<div style={divStyle1} className="tutorial_html_side_box_content">
							<div className="tutorial_side_box_content" style={divStyle2}></div>
							<div style={divStyle3}>
								<button type="button" className="button_white button_allgemein tutorial_closer">Close Tutorial</button>
							</div>
						</div>
					</div>
			);
		}
	return (<div></div>);
		
	}
}

