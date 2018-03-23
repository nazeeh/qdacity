import Promisizer from '../endpoints/Promisizer';
import DomInteractor from './DomInteractor';
import SystemTutorials from './SystemTutorials';
import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class TutorialEngine {
	constructor(appRoot) {
		this.d = new DomInteractor();
		this.appRoot = appRoot;
		this.tutorialState = {
			isActive: false
		};
		this.clearTutorialState();
	}

	clearTutorialState() {
		var tmpIsActive = this.tutorialState.isActive;
		this.tutorialState = {
			isActive: tmpIsActive,
			showOverlayVisual: false,
			showOverlayBlockInteraction: false,
			highlightOverlayBlockInteraction: false,
			showMessageBoxContent: 0,
			pointer: {
				show: false,
				direction: 'Right',
				top: 0,
				left: 0
			},
			showSidebar: false,
			currentStepsView: [], //step Data
			currentActiveTutorial: [],
			currentActiveStep: -1,
			currentActiveStepAdvancedData: [],
			currentActiveTutorial: null,
			currentShowShortDescriptionId: -1
		};
	}

	appRootDidMount() {
		const { formatMessage } = IntlProvider.intl;
		this.postInit(formatMessage);
	}

	updateReactCb(callbackFunc) {
		let tmp = Object.assign({}, this.tutorialState);
		console.log(this);
		this.appRoot.setState(
			{
				tutorialState: tmp
			},
			callbackFunc
		);
	}

	updateReact() {
		this.updateReactCb(function() {});
	}

	setIsActive(val) {
		this.tutorialState['isActive'] = val;
	}

	getIsActive() {
		return this.tutorialState['isActive'];
	}

	showOverviewWindow() {
		this.setIsActive(true);
		this.clearTutorialState();
		this.showMessageBoxAndOverlay(false);
		this.updateReact();

		this.tutorialState.overviewData = this.systemTutorials.getData();

		this.tutorialState.showMessageBoxContent = 2;
		this.updateReact();
	}

	highlightDomObject(obj) {
		this.setIsActive(true);
		this.tutorialState.showOverlayBlockInteraction = true; //for debugging
		//showOverlayQdq could be active or not, if not, then only the pointer picture is shown
		this.tutorialState.highlightOverlayBlockInteraction = true;
		this.tutorialState.pointer.show = true;
		this.tutorialState.pointer.direction = 'Right'; //TODO parametrisieren

		var rect = obj.getBoundingClientRect();
		console.log(rect);
		this.tutorialState.pointer.left = rect.left + window.scrollX - 120;
		this.tutorialState.pointer.top = rect.top + window.scrollY - 46;

		this.updateReact();
	}

	closeHighlightDomObject() {
		this.tutorialState.highlightOverlayBlockInteraction = false;
		this.tutorialState.pointer.show = false;
		this.updateReact();
	}

	showMessageBoxAndOverlay(update) {
		this.tutorialState.showOverlayVisual = true;
		this.tutorialState.showMessageBoxContent = 1;
		if (update) this.updateReact();
	}

	hideMessageBoxAndOverlay(update) {
		this.tutorialState.showOverlayVisual = false;
		this.tutorialState.showMessageBoxContent = 0;
		if (update) this.updateReact();
	}

	activateTutorial(tutorialId) {
		var tutorialData = this.systemTutorials.getData();
		this.tutorialState.currentActiveTutorial = tutorialData[tutorialId];
		this.showSidebar(true, tutorialId);
		tutorialData[tutorialId].steps[0].constructStep(this);
	}

	showSidebar(show, tutorialId) {
		var tutorialData = this.systemTutorials.getData();
		//alert(tutorialId);
		this.tutorialState.currentStepsView = tutorialData[tutorialId].steps;
		this.tutorialState.showSidebar = show;
		this.updateReact();
	}

	closeTutorial() {
		this.setIsActive(false);
		this.clearTutorialState();
		this.updateReact();
	}

	setCurrentShowShortDescriptionId(id) {
		this.tutorialState.currentShowShortDescriptionId = id;
		this.updateReact();
	}

	finishStep(step) {
		//TODO api call, to save current step.........

		this.tutorialState.currentActiveStep = step + 1;

		//TODO resolve BUG in currentActiveTutorial..... its acutally undefined, but it should contain the active Tutorial
		if (
			this.tutorialState.currentActiveStep >
			99 /*this.currentActiveTutorial.steps.length*/
		) {
			//FINISH
			//show finish dialogBox

			this.updateReact();
			return;
		}

		//prepare next Step:

		this.updateReact();
	}

	activateStep(step) {}

	postInit(formatMessage) {
		this.systemTutorials = new SystemTutorials(formatMessage);
	}
}
