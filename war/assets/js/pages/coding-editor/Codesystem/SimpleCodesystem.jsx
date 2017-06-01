import React from 'react';
import {Code} from './Code.jsx';

export default class SimpleCodesystem extends React.Component {
		constructor(props) {
			super(props);
			this.codesystem = {};
			this.state = {
				slected: {},
				codesystem: []
			};
	
			this.state.codesystem = this.props.codesystem;
			
			this.setSelected = this.setSelected.bind(this);
		}

		setSelected(code){
			if (!this.props.showSimpleView)this.props.updateCodeView(code);
			this.setState({
				selected: code
			});
		}
		
		getSelected(){
			return this.state.selected;
		}
		
		getCodesystem(){
			return this.state.codesystem;
		}
		
		getCodeByCodeID(codeID){
			return this.getCodeByID(this.state.codesystem, codeID);
		}
		
		getCodeByID(codeArr, codeID){
			var _this = this;
			var found;
			for (var i in codeArr){
				var code = codeArr[i];
				if (code.codeID == codeID){
					return code;
				}
				found = _this.getCodeByID(code.children, codeID);
					if (found) return found;				
			}
		}
		
		renderRoots(codes){
			return codes.map((code, index) => {
					return (
						<Code
							showSimpleView={true}
							level={0} 
							node={code} 
							selected={this.state.selected} 
							setSelected={this.setSelected} 
							key={"CS" + "_" + 0 + "_"  +index}>
						</Code>
					);
				});
		}
		
		renderNodes(codeSiblings, level) {
			return (
				<div>
    				{this.renderRoots(codeSiblings)}
				</div>
			);
		};

		renderCodesystem() {
			return this.renderNodes(this.state.codesystem);
		}

		render() {
			var _this = this;
			return (
				<div className="codesystemView">{this.renderCodesystem()}</div>
			);
		}
}
	