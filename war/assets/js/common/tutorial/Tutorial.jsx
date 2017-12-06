import React from 'react'
import styled from 'styled-components';

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


export default class Tutorial extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		if(this.props.tutorialEngine.controller.getIsActive()) {

			return (
					<div>
						<div className="overlayQdq1"></div>
						<div className="overlayQdq2"></div>
						<div className="messageBoxQdq">
						{this.props.tutorialEngine.controller.showTutorialOverview &&
							<div class="tutorial_content">
								<center>
									<div style={divStyle4}><b>Tutorial Overview</b></div>
									<br/><div className="tutorial_main_box">please wait the content is loaded... (Coming soon...)</div>
									<br/><br/>
									<div className="vex-dialog-buttons">
									<button type="button" className="button_white button_allgemein box_closer">Close</button></div>
								</center>
							</div>
						}
						</div>
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
