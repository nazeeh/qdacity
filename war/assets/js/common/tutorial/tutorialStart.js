import Promisizer from '../endpoints/Promisizer'
import DomInteractor from './DomInteractor'

export default class StartTutorial {
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
				showOverlayQdq1:false,
				showOverlayQdq2:false,
				highlightOverlayQdq2:false,
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
		var dhis=this;
		$(document).on( "click", ".button_no_action", function(){alert("Diesem Button ist noch keine Action hinterlegt!")});
	}	
	
	showOverviewWindow() {		
		this.setIsActive(true);
		this.clearTutorialState();
		this.showMessageBoxAndOverlay(false);		
		this.updateReact();
		
		//TODO in the next version, the following lines are important
		/*
		var apiMethod = gapi.client.qdacity.tutorial.loadTutorialData({'which':1});
		var back=Promisizer.makePromise(apiMethod);
		
		back.then(function (resp) {
			
			//this.tutorialState.TutorialOverviewData=.... //kommt vom server
			
			this.tutorialState.showMessageBoxContent=2;
			this.updateReact();
			
		}.bind(this));	*/	
	}
	

	
	highlightDomObject(obj)
	{		
		this.setIsActive(true);
		this.tutorialState.showOverlayQdq2=true;//for debugging
		//showOverlayQdq could be active or not, if not, then only the pointer picture is shown
		this.tutorialState.highlightOverlayQdq2=true;
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
		this.tutorialState.highlightOverlayQdq2=false;
		this.tutorialState.pointer.show=false;
		this.updateReact();
	}
	

	showMessageBoxAndOverlay(update)
	{
		this.tutorialState.showOverlayQdq1=true;
		this.tutorialState.showMessageBoxContent=1;
		if(update)this.updateReact();
	}

	hideMessageBoxAndOverlay(update)
	{
		this.tutorialState.showOverlayQdq1=false;
		this.tutorialState.showMessageBoxContent=0;
		if(update)this.updateReact();
	} 

}
