import Promisizer from '../endpoints/Promisizer'

export default class StartTutorial
{
	constructor(appRoot){
		this.isActive=false;
		this.appRoot=appRoot;
		this.showTutorialOverview=true;
	}
	
	
	setIsActive(val){
		if(val && this.isActive==false) {
			this.isActive=true;
		}
		else {
			this.isActive=false;
		}
		
	}	
	
	getIsActive(){
		return this.isActive;
	}	


	
	showOverviewWindow(){

	}
	

}
