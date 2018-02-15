import ReactDOM from 'react-dom';
import React from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';

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
					descriptionTextShort: formatMessage({id: 'tutorial.tut0.descriptionText', defaultMessage: 'Example Tutorial. You have only click the New Project Button'}),
					finishedAt:"-1",
					finishedRelative:0,
					maxSteps:9,
					title:formatMessage({id: 'tutorial.tut0.title', defaultMessage: 'Example Tutorial. '}),
					tutorialUnitId:"0",
					steps:[
						       	{
							    	stepNr:1,
							    	text:formatMessage({id: 'tutorial.tut0.step0.text', defaultMessage: 'Click the New Project Button'}),
							    	stepType: 3,
										constructStep: function(tutorialEngine) {
							
												//tutorialEngine.tutorialState.showOverlayBlockInteraction=true;
												tutorialEngine.updateReact();
												//$(".overlayQdq2").show();


												//$("#newProject").addClass("actionx_object");
												//$("#newProject").css( "z-index", "1905" );


													$(document).on( "click", "#newProject", function(){alert("finish!");});

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
