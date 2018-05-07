import React from 'react';
import ReactDOM from 'react-dom';

import 'script-loader!../../../../components/jQuery/jquery.js';

//tutorial styles
import '../../../css/tutorial.css';

// Personal Dasboard Styles
import '../../../css/project-list.css';
import '../../../../components/AdminLTE/css/AdminLTE.min.css';
import '../../../css/dashboard.css';
import '../../../css/IntercoderAgreement.css';

// Project Dashboard Styles
import '../../../../components/DataTables-1.10.7/media/css/jquery.dataTables.css';
import '../../../../components/slick/slick.min.css';
import '../../../css/customTimeline.css';
import '../../../css/agreementStats.css';
import '../../../../components/Alertify/css/alertify.core.css';
import '../../../../components/Alertify/css/alertify.default.css';

// Coding Editor
import '../../../css/coding-editor.css';
import '../../../css/uml-editor.css';
import '../../../css/footer.css';
import '../../../css/CodesystemView.css';
import '../../../../components/tooltipster/css/tooltipster.css';
import '../../../css/agreementMap.css';
import '../../../../components/filer/css/jquery.filer.css';
import '../../../../components/filer/css/themes/jquery.filer-dragdropbox-theme.css';
import '../../../../components/colorpicker/evol.colorpicker.css';
import '../../../../components/mxGraph/javascript/src/css/common.css';

// Common Styles
import '../../../css/common.css';
import '../../../css/navbar-account.css';
import '../../../css/landing-page.css';
import '../../../../components/Vex/css/vex.css';
import '../../../../components/Vex/css/vex-theme-wireframe.css';
import '../../../../components/bootstrap/dist/bootstrap.min.css';

import Dropdown from '../../common/dropdown.js';
Dropdown.initDropDown();

import App from '../App.jsx';
import Account from '../../common/Account.jsx';

import BinaryDecider from '../../common/modals/BinaryDecider.js';

import loadGAPIs from '../../common/GAPI';

import $script from 'scriptjs';

var chartScriptPromise = new Promise(function(resolve, reject) {
	$script('https://www.gstatic.com/charts/loader.js', () => {
		resolve();
	});
});

var mxGraphPromise = new Promise(function(resolve, reject) {
	$script('../../components/mxGraph/javascript/mxClient.min.js', () => {
		resolve();
	});
});

var account = {
	isSignedIn: () => {
		return false;
	}
};

window.onload = function() {
	googleClientPromise.then(() => {
		googlePlatformPromise.then(() => {
			init();
		});
	});
	initServiceWorker();
};

const init = function() {
	loadGAPIs(() => {}).then(apiCfg => {
		var account = {
			isSignedIn: () => {
				return false;
			}
		};
		ReactDOM.render(
			<App
				apiCfg={apiCfg}
				chartScriptPromise={chartScriptPromise}
				mxGraphPromise={mxGraphPromise}
			/>,
			document.getElementById('indexContent')
		);
	});
};

function initServiceWorker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('sw.dist.js', { scope: '/' })
			.then(function() {
				console.log('Service worker registered');
			})
			.catch(function(err) {
				console.log(err);
			});
	} else {
		console.log('Browser does not support service worker');
	}
}
