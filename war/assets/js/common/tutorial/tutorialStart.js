import Promisizer from '../endpoints/Promisizer'
import DomInteractor from './DomInteractor'

export default class StartTutorial
{
	constructor(appRoot){
		this.d=new DomInteractor();
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

	instrumentDomWithTutorialMainData(){
		
		var dhis=this;
		
		$(document).on( "click", ".box_closer", function(){dhis.close_box_and_overlay();});
		$(document).on( "click", ".button_no_action", function(){alert("Diesem Button ist noch keine Action hinterlegt!")});
		
		$(document).on( "click", ".startTutorial", function(){dhis.show_tutorial_box();});
		$(document).on( "click", ".start_example_tutorial", function(){dhis.show_tutorial_side_box(); dhis.close_box_and_overlay(); dhis.next_tutorial_step(1);});
		$(document).on( "click", ".tutorial_closer", function(){dhis.close_tutorial_side_box();});
		
		$(document).on( "click", ".nnrrxx1", function(){dhis.finish_sub_step(1);});

	}
	
	
	showOverviewWindow(){
		
		this.setIsActive(true);		
		this.appRoot.forceUpdate(function(){		
			this.show_box_and_overlay();
			
			/*var apiMethod = gapi.client.qdacity.tutorial.loadTutorialData({'which':1});
			var back=Promisizer.makePromise(apiMethod);
			back.then(function (resp) {
				
				console.log(resp);
				$(".tutorial_main_box").hide();
				$(".tutorial_main_box").html(resp.htmlContent);
				$(".tutorial_main_box").fadeIn(3000);
				
			});*/			
		}.bind(this));
	}
	
	
	show_box_and_overlay()
	{
		$(".overlayQdq1").stop(true);
		$(".messageBoxQdq").stop(true);
		$(".overlayQdq1").fadeIn(2000);
		$(".messageBoxQdq").show(1000);
	}

	close_box_and_overlay()
	{
		$(".overlayQdq1").stop(true);
		$(".messageBoxQdq").stop(true);	
		$(".overlayQdq1").fadeOut(500);
		$(".messageBoxQdq").hide(1000);
	}

}
