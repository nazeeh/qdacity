import React from 'react'

import SigninWithGoogleBtn from './SigninWithGoogleBtn.jsx';

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
			    <div className="intro-header">
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

			    </div>
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
			    <div className="banner">

			        <div className="container">

			            <div className="row">
			                <div className="col-lg-6">
			                    <h2>Contact us directly</h2>
			                </div>
			                <div className="col-lg-6">
			                    <ul className="list-inline banner-social-buttons">
			                        <li>
			                            <a href="https://twitter.com/osrgroup" className="btn btn-default btn-lg"><i className="fa fa-twitter fa-fw"></i> <span className="network-name">Twitter</span></a>
			                        </li>
			                        <li>
			                            <a href="https://www.facebook.com/pages/Open-Source-Research-Group-at-FAU/105099549532308" className="btn btn-default btn-lg"><i className="fa fa-facebook-square fa-fw"></i> <span className="network-name">Facebook</span></a>
			                        </li>
			                        <li>
			                            <a href="mailto:kaufmann@group.riehle.org?Subject=QDAcity%20support" className="btn btn-default btn-lg"><i className="fa fa-envelope-o fa-fw"></i> <span className="network-name">Email</span></a>
			                        </li>
			                    </ul>
			                </div>
			            </div>

			        </div>
			    </div>
			</div>
		);
	}
}