import React from 'react';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import CodesystemEndpoint from '../../../common/endpoints/CodesystemEndpoint';
import Code from './Code.jsx';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';


class Codesystem extends React.Component {
		constructor(props) {
			super(props);
			this.codesystem = {};
			this.state = {
				slected: {},
				codesystem: []
			};
			this.init();
			this.setSelected = this.setSelected.bind(this);
			this.relocateCode = this.relocateCode.bind(this);
			this.removeCode = this.removeCode.bind(this);
		}

		getStyles() {
			return {
				lightButton: {
					backgroundColor: "#FAFAFA",
					borderLeftStyle: "solid",
					borderLeftWidth: "thick",
					borderLeftColor: "#337ab7",
					marginBottom: "3px"
				}
			}
		}
		
		init() {
			var _this = this;
			CodesystemEndpoint.getCodeSystem(this.props.codesystemId).then(function (resp) {
					
				var codes = resp.items || [];
				
				var rootCodes = codes.filter(function(code){
				  return !code.parentID;
				});
		
				for (var i = 0; i < rootCodes.length; i++) {
					rootCodes[i].collapsed = false;
					_this.buildTree(rootCodes[i], codes, false)
				}
				var selected = {}
				if (rootCodes.length > 0 ) selected = rootCodes[0];
				_this.setState({ 
					codesystem : rootCodes,
					selected: selected
				});
			});
		}
		
		buildTree(currentCode, allCodes, currentNodeCollapsed){
			var _this = this;
			currentCode.collapsed = currentNodeCollapsed;
			
			if (currentCode.subCodesIDs){
				var subCodes = allCodes.filter(function(code){
					  return currentCode.subCodesIDs.indexOf(code.codeID) != -1;
				});
				currentCode.children = subCodes;
				
				subCodes.forEach((subCode) => {
					_this.buildTree(subCode, allCodes, true)
				});
			} else {
				currentCode.children = [];
			}
		}
		
		setSelected(code){
			this.setState({
				selected: code
			});
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
		
		removeCode(){
			var code = this.state.selected; 
			if (code.codeID == 1) return; //root should not be removed
			 
			var _this = this;
			CodesEndpoint.removeCode(code).then(function (resp) {
				_this.props.removeAllCodings(code.codeID);
				var parent = _this.getCodeByID(_this.state.codesystem, code.parentID)
				var index = parent.children.indexOf(code);
				parent.children.splice(index, 1);
				_this.forceUpdate();
			});
		}
		
		
		
		updateSubCodeIDs(code){
			code.subCodesIDs = [];
			code.children.forEach((childCode) =>{
				code.subCodesIDs.push(childCode.codeID);
			})
		}
		
		relocateCode(movingNode, targetID){
			var relocationPromise = CodesEndpoint.relocateCode(movingNode.id, targetID);
			var targetNode = this.getCodeByID(this.state.codesystem, targetID);
			var sourceNode = this.getCodeByID(this.state.codesystem, movingNode.parentID);
			var indexSrc = sourceNode.children.indexOf(movingNode);
			
			var _this = this;
			relocationPromise.then(function (resp) {
			
				sourceNode.children.splice(indexSrc, 1);
				_this.updateSubCodeIDs(sourceNode);
				
				movingNode.parentID = targetID;
				
				targetNode.children.push(movingNode);
				_this.updateSubCodeIDs(targetNode);
				
				_this.forceUpdate();
				console.log("Updated logation of code:" + resp.id + " |  " + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			});
			 
			
		}

		renderNodes(codeSiblings, level) {
			const _this = this;

			const renderRoots = codeSiblings.map((code, index) => {
					return (
						<Code level={level} node={code} selected={this.state.selected} setSelected={this.setSelected} relocateCode={this.relocateCode} key={"CS" + "_" + level + "_"  +index}></Code>
					);
				});
			return (
				<div>
    				{renderRoots}
				</div>
			);
		};

		renderCodesystem() {
			return this.renderNodes(this.state.codesystem, 0);
		}

		render() {
			const styles = this.getStyles();
			var _this = this;
			return (
				<div className="codesystemView">{this.renderCodesystem()}</div>
			);
		}
}

export default DragDropContext(HTML5Backend)(Codesystem);