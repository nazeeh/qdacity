import ReactDOM from 'react-dom';
import React from 'react';

/**
 * stepTypes:
 *  0 => a simple notice  => OK //TODO now
 *  1 => notice in a dialog Box => Dialog-Box-Closing + OK //implementation later
 *  2 => Quiz //implementation later
 *  3 => simple Action, press some object on the site //TODO now
 *  4 => go to a certain URL //Todo now
 *  5 => Advanced Action //implementation later
 *
 *
 *
 */

//




export default class SystemTutorials {
	constructor(formatMessage) {

			this.data=
			[
				{
					descriptionTextShort: function(){return formatMessage({id: 'tutorial.tut0.descriptionText', defaultMessage: 'Example Tutorial. You have only click the New Project Button'})},
					/**
					 * finishedAt and finishedRelative are placeHolder for statistic-data, which come from the server backend next merge-request
					 */
					finishedAt:"-1",
					finishedRelative:0,
					title:function(){return formatMessage({id: 'tutorial.tut0.title', defaultMessage: 'Example Tutorial. '})},
					tutorialUnitId:"0",
					steps:[
						       	{
							    	stepNr:0,
							    	text:function(){return formatMessage({id: 'tutorial.tut0.step0.text', defaultMessage: 'Click the New Project Button'})},
							    	stepType: 3,
										constructStep: function(tutorialEngine) {
											var newProjectDom=tutorialEngine.d.getElementById("newProject");
											if(newProjectDom !=null) {
												newProjectDom.addEventListener("click", function(){tutorialEngine.finishStep(0);});
											}

										},
										destructStep: function(tutorialEngine) {}
						       	},


					      ]
				},

	         ];
	}

	getData() {
		return this.data;
	}


}
