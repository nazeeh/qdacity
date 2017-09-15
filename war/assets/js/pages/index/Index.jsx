import React from 'react'
import styled from 'styled-components';

import SigninWithGoogleBtn from './SigninWithGoogleBtn.jsx';
import {BtnLg} from '../../common/styles/Btn.jsx';

const StyledIntroBanner = styled.div `
	background: url(../assets/img/index-top-man-writing.cache.jpg)  no-repeat center center;
	background-size: cover;
`;

const StyledFooterBanner = styled.div `
	background-color: ${props => props.theme.darkPaneBg };
	background-size: cover;
	color: #f8f8f8;
	padding: 30px 0;
`;

const StyledFooterText = styled.span`
	text-shadow: 2px 2px 3px rgba(0,0,0,0.6);
	font-size: 3em;
`;


export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		$("body").css({
			overflow: "auto"
		});
	}


	render() {
		return (
			<div>
				<a name="about"></a>
			    <StyledIntroBanner className="intro-header">
			        <div className="container">

			            <div className="row">
			                <div className="col-lg-12">
			                    <div className="intro-message">
			                        <h1>QDAcity</h1>
			                        <h3>QDA on steroids</h3>
			                        <hr className="intro-divider"/>
										<div>
											<SigninWithGoogleBtn account={this.props.account} history={this.props.history} />
										</div>
			                    </div>
			                </div>
			            </div>
			        </div>
			    </StyledIntroBanner>
				<a  name="services"></a>
			    <div className="content-section-a">

			        <div className="container">
			            <div className="row">
			                <div className="col-lg-5 col-sm-6">
			                    <hr className="section-heading-spacer"/>
			                    <div className="clearfix"></div>
			                    <h2 className="section-heading">Organize your thoughts</h2>
			                    <p className="lead">QDAcity helps you structure, store and version all your analysis artifacts</p>

			                </div>
			                <div className="col-lg-5 col-lg-offset-2 col-sm-6">
			                    <img className="img-responsive" src="assets/img/notes.jpg" alt=""/>
			                </div>
			            </div>

			        </div>

			    </div>

			    <div className="content-section-b">

			        <div className="container">

			            <div className="row">
			                <div className="col-lg-5 col-lg-offset-1 col-sm-push-6  col-sm-6">
			                    <hr className="section-heading-spacer"/>
			                    <div className="clearfix"></div>
			                    <h2 className="section-heading">Document your process</h2>
			                    <p className="lead">You analyze, we document.</p>
			                </div>
			                <div className="col-lg-5 col-sm-pull-6  col-sm-6">
			                    <img className="img-responsive" src="assets/img/process.jpg" alt=""/>
			                </div>
			            </div>

			        </div>

			    </div>

			    <div className="content-section-a">

			        <div className="container">

			            <div className="row">
			                <div className="col-lg-5 col-sm-6">
			                    <hr className="section-heading-spacer"/>
			                    <div className="clearfix"></div>
			                    <h2 className="section-heading">Cloud goodness</h2>
			                    <p className="lead">QDAcity runs completely in the cloud, which means you don't need to install anything. All you need is your webbrowser and an internet connection, to work on your project from anywhere at anytime.</p>
			                </div>
			                <div className="col-lg-5 col-lg-offset-2 col-sm-6">
			                    <img className="img-responsive" src="assets/img/cloud.png" alt=""/>
			                </div>
			            </div>

			        </div>
			    </div>
				<a  name="contact"></a>
			    <StyledFooterBanner>

			        <div className="container">

			            <div className="row">
			                <div className="col-lg-6">
			                    <StyledFooterText>Contact us directly</StyledFooterText>
			                </div>
			                <div className="col-lg-6">
			                    <ul className="list-inline banner-social-buttons">
			                        <li>
										<BtnLg>
											<span>
												<a href="https://twitter.com/osrgroup">
													<i className="fa fa-twitter fa-2x"></i>
												</a>
												 <span>Twitter</span>
											</span>
										</BtnLg>
			                        </li>
			                        <li>
										<BtnLg>
											<span>
												<a href="https://www.facebook.com/pages/Open-Source-Research-Group-at-FAU/105099549532308">
													<i className="fa fa-facebook-square fa-2x"></i>
												</a>
												 <span>Facebook</span>
											</span>
										</BtnLg>
			                        </li>
			                        <li>
										<BtnLg>
											<span>
												<a href="mailto:kaufmann@group.riehle.org?Subject=QDAcity%20support">
													<i className="fa fa-envelope-o fa-2x"></i>
												</a>
												 <span>Email</span>
											</span>
										</BtnLg>
			                        </li>
			                    </ul>
			                </div>
			            </div>

			        </div>
			    </StyledFooterBanner>
			</div>
		);
	}
}