import ReactDOM from 'react-dom';
import React from 'react';

export default class SystemTutorials {
	constructor(formatMessage) {
		/**
		 * stepTypes:
		 *  1 => a simple notice  => OK //TODO now
		 *  2 => notice in a dialog Box => Dialog-Box-Closing + OK //implementation later
		 *  3 => Quiz //implementation later
		 *  4 => simple Action, press some object on the site //TODO now
		 *  5 => go to a certain URL //Todo now
		 *  6 => Advanced Action //implementation later
		 */
		this.stepType = {
			SimpleNotice: 1,
			DialogBoxNotice: 2,
			Quiz: 3,
			SimplePressAction: 4,
			GoToUrlAction: 5,
			AdvancedAction: 6
		};
		Object.freeze(this.stepType);

		this.data = [
			{
				descriptionTextShort: function() {
					return formatMessage({
						id: 'tutorial.tut0.descriptionText',
						defaultMessage:
							'Example Tutorial. You have only click the New Project Button'
					});
				},
				/**
				 * finishedAt and finishedRelative are placeHolder for statistic-data, which come from the server backend next merge-request
				 * finished at is the time stamp when the tutorial was completed. finishedRelative is the percentage of steps completed
				 */
				finishedAt: '-1',
				finishedRelative: 0,
				title: function() {
					return formatMessage({
						id: 'tutorial.tut0.title',
						defaultMessage: 'Example Tutorial. '
					});
				},
				tutorialUnitId: '0',
				steps: [
					{
						stepNr: 0,
						text: function() {
							return formatMessage({
								id: 'tutorial.tut0.step0.text',
								defaultMessage: 'Click the New Project Button'
							});
						},
						stepType: this.stepType.SimplePressAction,
						constructStep: function(tutorialEngine) {
							var newProjectDom = tutorialEngine.d.getElementById('newProject');
							if (newProjectDom != null) {
								newProjectDom.addEventListener('click', function() {
									tutorialEngine.finishStep(0);
								});
							}
						},
						destructStep: function(tutorialEngine) {}
					}
				]
			}
		];
	}

	getData() {
		return this.data;
	}
}
