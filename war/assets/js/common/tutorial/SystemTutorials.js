import Promisizer from '../endpoints/Promisizer'




export default class SystemTutorials {
	constructor(appRoot) {
	
		this.data= 
		[
			{
				descriptionTextShort:"Testtutorial",
				finishedAt:"-1",
				finishedRelative:0,
				maxSteps:9,
				title:"Basic Tutorial",
				tutorialUnitId:"0",
				steps:[
					       	{
						    	stepNr:1,
						    	text:"ein bsp. step"
					       	},
					       	
					       	
					    	{
						    	stepNr:2,
						    	text:"ein weiteres bspw"
					       	}
				       
				      ]
			}, 
			
			{
				descriptionTextShort:"Create new Project Tutorial",
				finishedAt:"-1",
				finishedRelative:0,
				maxSteps:12,
				title:"CreateNewProject",
				tutorialUnitId:"1",
				steps:[
					       	{
						    	stepNr:1,
						    	text:"ein bsp. stepxxxxxxxxxxx"
					       	},
					       	
					       	
					    	{
						    	stepNr:2,
						    	text:"ein weiteres bspwxxxxxxxx"
					       	}
				       
				      ]
			},
         ];	
	}	
	
	getData() {
		return this.data;
	}
	

}
