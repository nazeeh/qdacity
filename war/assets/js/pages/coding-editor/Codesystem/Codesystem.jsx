import React from 'react';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import CodesystemEndpoint from '../../../common/endpoints/CodesystemEndpoint';
import {DragAndDropCode} from './Code.jsx';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import CodesystemToolbar from "./CodesystemToolbar.jsx"

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import SimpleCodesystem from './SimpleCodesystem.jsx';

/*
** Intended as primary codesystem component
** Extende SimpleCodesystem by 
** (1) adding a Toolbar for adding and removing codes.
** (2) connecting the component to the code view and the text editor
** (3) wrapping the component in a drag and drop context
**
*/
class Codesystem extends SimpleCodesystem {
		constructor(props) {
			super(props);
			this.state = {
				slected: {},
				codesystem: []
			};

			this.relocateCode = this.relocateCode.bind(this);
			this.removeCode = this.removeCode.bind(this);
			this.insertCode = this.insertCode.bind(this);
			this.updateCodingCount = this.updateCodingCount.bind(this);
			this.initCodingCount = this.initCodingCount.bind(this);
			this.init = this.init.bind(this);
		}

		getStyles() {
			return {
				toolBar: {
					textAlign: "center",
					position: "relative",
					backgroundColor: "#e7e7e7"
				}
			}
		}
		
		init() {
			var _this = this;
			var promise = new Promise(
				function (resolve, reject) {
					CodesystemEndpoint.getCodeSystem(_this.props.codesystemId).then(function (resp) {
							
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
						$("#codesystemLoadingDiv").addClass("hidden");
						resolve();
					});
				}
			);
			return promise;
			
		}
		
		// Overriding super method
		notifyOnSelection(newCode){
			this.props.updateCodeView(newCode);
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

		
		updateSelected(code){
			Object.assign(this.state.selected, code);
			this.forceUpdate();
		}

		
		
		removeCode(){
			var code = this.state.selected; 

			this.props.removeAllCodings(code.codeID);
			var parent = this.getCodeByID(this.state.codesystem, code.parentID)
			var index = parent.children.indexOf(code);
			parent.children.splice(index, 1);
			this.setState({
				selected: parent
			})
		}
		
		insertCode(code){
			code.children = [];
			this.state.selected.children.push(code);
			this.updateSubCodeIDs(this.state.selected);
			var _this = this;
			CodesEndpoint.updateCode(this.state.selected).then(function (resp2) {
				_this.forceUpdate();
			});
			
		}
		
		initCodingCount(){
			initCodingCountRecurive(this.state.codesystem);
			setState({
				codesystem: this.state.codesystem
			});
			
		}
		
		initCodingCountRecurive(codeSiblings){
			var _this = this;
			codeSiblings.forEach((code)=>{
				code.codingCount = this.props.documentsView.calculateCodingCount(code.codeID);
				if (code.children) _this.initCodingCount(code.children); // recursion
			});			
		}
		updateCodingCount(){
			this.state.selected.codingCount = this.props.documentsView.calculateCodingCount(this.state.selected.codeID);
			this.setState({
					selected: this.state.selected,
					codesystem: this.state.codesystem
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
				
				_this.setState({
					codesystem: _this.state.codesystem
				})
				console.log("Updated logation of code:" + resp.id + " |  " + resp.author + ":" + resp.name + ":" + resp.subCodesIDs);
			});
			 
			
		}
		
		renderRoots(codes){
			return codes.map((code, index) => {
					return (
						<DragAndDropCode
							showSimpleView={false}
							documentsView={this.props.documentsView}
							level={0} 
							node={code} 
							selected={this.state.selected} 
							setSelected={this.setSelected} 
							relocateCode={this.relocateCode} 
							showFooter={this.props.showFooter}
							key={"CS" + "_" + 0 + "_"  +index}>
						</DragAndDropCode>
					);
				});
		}

		render() {
			const styles = this.getStyles();
			var _this = this;
			return (
				<div>
					<div style={styles.toolBar}>
						<CodesystemToolbar 
							projectID={this.props.projectID} 
							projectType={this.props.projectType}
							selected={this.state.selected} 
							account={this.props.account} 
							removeCode={this.removeCode} 
							insertCode={this.insertCode} 
							updateCodingCount={this.updateCodingCount}
							toggleCodingView={this.props.toggleCodingView}
							editorCtrl={this.props.editorCtrl}
							documentsView={this.props.documentsView}
							umlEditorEnabled={this.props.umlEditorEnabled}>
						</CodesystemToolbar>
					</div>
					<div className="codesystemView">{this.renderCodesystem()}</div>
				</div>
			);
		}
}

export default DragDropContext(HTML5Backend)(Codesystem);