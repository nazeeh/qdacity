import Promisizer from '../endpoints/Promisizer'
import DomInteractor from './DomInteractor'

export default class TutorialEngine {
	constructor(appRoot) {
		this.d=new DomInteractor();
		this.appRoot=appRoot;		
		this.tutorialState={
			isActive: false,		
		};
		this.clearTutorialState();
	}
	
	clearTutorialState()
	{
		var tmpIsActive=this.tutorialState.isActive;
		this.tutorialState={
				isActive: tmpIsActive,
				showOverlay1:false,
				showOverlay2:false,
				highlightOverlay2:false,
				showMessageBoxContent: 0,
				pointer:{
					show:false,
					direction:"Right",
					top:0,
					left:0,
				}		
			}			
	}
	
	appRootDidMount()
	{
		this.instrumentDomWithTutorialMainData();
	}
	
	updateReactCb(callbackFunc) {
		let tmp = Object.assign({}, this.tutorialState);
		console.log(this);
		this.appRoot.setState({ tutorialState: tmp },callbackFunc);
	}
	
	updateReact() {
		this.updateReactCb(function(){});
	}
	
	
	setIsActive(val){
		this.tutorialState["isActive"]=true;
	}
	
	
	getIsActive() {
		return this.tutorialState["isActive"];
	}
			
	
	instrumentDomWithTutorialMainData() {		
		
	}	
	
	showOverviewWindow() {		
		this.setIsActive(true);
		this.clearTutorialState();
		this.showMessageBoxAndOverlay(false);		
		this.updateReact();		
	
	}
	
	highlightDomObject(obj)
	{		
		this.setIsActive(true);
		this.tutorialState.showOverlay2=true;//for debugging
		//showOverlayQdq could be active or not, if not, then only the pointer picture is shown
		this.tutorialState.highlightOverlay2=true;
		this.tutorialState.pointer.show=true;
		this.tutorialState.pointer.direction="Right";//TODO parametrisieren
		
		
		var rect = obj.getBoundingClientRect();
		console.log(rect);
		this.tutorialState.pointer.left=rect.left+window.scrollX-120;
		this.tutorialState.pointer.top=rect.top+window.scrollY-46;
		
		
		this.updateReact();
	}
	
	
	closeHighlightDomObject()
	{		
		this.tutorialState.highlightOverlay2=false;
		this.tutorialState.pointer.show=false;
		this.updateReact();
	}
	

	showMessageBoxAndOverlay(update)
	{
		this.tutorialState.showOverlay1=true;
		this.tutorialState.showMessageBoxContent=1;
		if(update)this.updateReact();
	}

	hideMessageBoxAndOverlay(update)
	{
		this.tutorialState.showOverlay1=false;
		this.tutorialState.showMessageBoxContent=0;
		if(update)this.updateReact();
	} 

}
