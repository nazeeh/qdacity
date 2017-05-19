import React from 'react';

import Prompt from '../../../common/modals/Prompt';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';

export default class CodesystemToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		
		this.removeCode = this.removeCode.bind(this);
		this.insertCode = this.insertCode.bind(this);
	}
	
	getStyles() {
		return {
			settingsBtn: {
				marginLeft: "5px"
			}
			
		};
	}
	
	removeCode(){
		var code = this.props.selected; 
		if (code.codeID == 1) return; //root should not be removed
		 
		var _this = this;
		CodesEndpoint.removeCode(code).then(function (resp) {
			_this.props.removeCode(code.codeID);
		});
	}
	
	insertCode(){
		var _this = this;
		var prompt = new Prompt('Give your code a name', 'Code Name');
		prompt.showModal().then(function (codeName) {
		
			// Build the Request Object
			var code = {
				author: _this.props.account.getProfile().getName(),
				name: codeName,
				subCodesIDs: new Array(),
				parentID: _this.props.selected.id,
				codesystemID: _this.props.selected.codesystemID,
				color: "#000000"
			};
			
			CodesEndpoint.insertCode(code).then(function (resp) {
				_this.props.insertCode(resp);
			});
		});
	}
	
	
	render() {
		const styles = this.getStyles();
		
		return ( 
			<div>
				<div className="btn-group">
					<a className="btn btn-default" onClick={this.insertCode}>
						<i className="fa fa-plus fa-1x"></i>
					</a>
					<a className="btn btn-default" onClick={this.removeCode}>
						<i className="fa fa-trash fa-1x"></i>
					</a>
					<a className="btn btn-default" onClick={this.removeDocumentFromProject}>
						<i className="fa  fa-list-alt  fa-1x"></i>
					</a>
				</div>
				<div className="btn-group">
					<a className="btn btn-default" onClick={this.changeTitle}>
						<span className="fa-stack fa-lg" style={{fontSize: "8px"}}>
							<i className="fa fa-tag fa-stack-2x"></i>
							<i className="fa fa-plus fa-stack-1x fa-inverse"></i>
						</span>
					</a>
					<a className="btn btn-default" onClick={this.changeTitle}>
						<span className="fa-stack fa-lg" style={{fontSize: "8px"}}>
							<i className="fa fa-tag fa-stack-2x"></i>
							<i className="fa fa-minus fa-stack-1x fa-inverse"></i>
						</span>
					</a>
				</div>
				<div className="btn-group">
					<a className="btn btn-default" onClick={this.changeTitle}>
						<i className="fa fa-external-link fa-1x"></i>
					</a>
				</div>
			</div>
		);
	}


}