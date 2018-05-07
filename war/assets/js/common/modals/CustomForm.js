import ReactDOM from 'react-dom';
import React from 'react';
import styled from 'styled-components';
import VexModal from './VexModal';
import ProjectRevisionSelector from '../../common/styles/ProjectRevisionSelector.jsx';
import ExerciseGroupSelector from '../../common/styles/ExerciseGroupSelector.jsx';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import Theme from '../../common/styles/Theme.js';
import { ThemeProvider } from 'styled-components';
import DateChooser from '../../common/modals/DateChooser.jsx';
import ExtendsExerciseCheckbox from '../../common/styles/ExtendsExerciseCheckbox.jsx';


const EmptyDiv = styled.div`
	display: none;
`;


export default class CustomForm extends VexModal {
	constructor(message) {
		super();
		this.formElements = '';
		this.message = message;
		this.isProjectRevisionSelector = false;
		this.isExerciseSelector = false;

		this.hasDateChooser = false;
		this.disableYesButton = false;
		this.showProjectDropDown = true;
		this.showExerciseGroupDropDown = true;
		this.projects = [];
		this.termCourseID = [];
		this.selectedRevisionID = '';
		this.selectedExerciseID = '';
		this.selectedExerciseGroupID = '';
		this.ExtendsExercise = false;
		this.setSelectedRevisionID = this.setSelectedRevisionID.bind(this);
		this.setSelectedExerciseID = this.setSelectedExerciseID.bind(this);
		this.setSelectedExerciseGroupID = this.setSelectedExerciseGroupID.bind(this);
		this.setExtendsExerciseStatus = this.setExtendsExerciseStatus.bind(this);

		this.setSelectedDate = this.setSelectedDate.bind(this);
	}

	setSelectedRevisionID(revisionID) {
		this.selectedRevisionID = revisionID;
	}

	setSelectedExerciseID(exerciseID) {
		this.selectedExerciseID = exerciseID;
	}
	setSelectedExerciseGroupID (exerciseGroupID) {
		this.selectedExerciseGroupID = exerciseGroupID;
	}

	setSelectedDate(date) {
		this.selectedDate = date;
	}

	setExtendsExerciseStatus(isChecked) {
		this.ExtendsExercise = isChecked;
		console.log(this.ExtendsExercise);
		if (this.ExtendsExercise == true) {
			this.hideElement('ProjectRevisionSelector');
			this.renderExerciseGroupSelector();
		}
		else {
			this.renderProjectRevisionSelector();
			this.hideElement('ExerciseGroupSelector');
		}
	}
	addTextInput(name, label, placeholder, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';
		this.formElements += '<label for="' + name + '">' + label + '</label>';
		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements +=
			'<input placeholder="' +
			placeholder +
			'" name="' +
			name +
			'" type="text" value="' +
			value +
			'" ></input>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addDatePicker() {
		this.hasDateChooser = true;
		const { formatMessage } = IntlProvider.intl;
		var deadlineMessage = formatMessage({
			id: 'modal.deadline',
			defaultMessage: 'Deadline: '
		});

		this.formElements += '<div class="vex-custom-field-wrapper">';
		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += deadlineMessage;
		this.formElements += '<div id="DateChooser">';
		this.formElements += '</div>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}
	addTextField(name, label, placeholder, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';
		this.formElements += '<label for="' + name + '">' + label + '</label>';
		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements +=
			'<textarea placeholder="' +
			placeholder +
			'" rows="15" cols="200" name="' +
			name +
			'" type="text" value="' +
			value +
			'" ></textarea>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addDropDown(projects) {
		this.isProjectRevisionSelector = true;
		this.projects = projects;

		this.formElements += '<div id="ProjectRevisionSelector">';
		this.formElements += '</div>';

		if (typeof projects.items == 'undefined' || projects.items.length < 0) {
			this.disableYesButton = true;
			this.showProjectDropDown = false;
			const { formatMessage } = IntlProvider.intl;
			var warningMessage = formatMessage({
				id: 'modal.warningMessage',
				defaultMessage:
					'Data from an existing project is required for this type of exercise, please create a project with a project revision and try again'
			});
			this.formElements += '<div class="vex-custom-input-wrapper">';
			this.formElements += '<p>' + warningMessage + '</p>';
			this.formElements += '</div>';
		}
	}

	addExerciseGroupDropDown(termCourseID) {
		this.isExerciseSelector = true;
		this.termCourseID = termCourseID;

		this.formElements += '<div id="ExerciseGroupSelector">';
		this.formElements += '</div>';
	}

	addSelect(name, options, label, initialValue) {
		var _this = this;
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += label + ': ';
		this.formElements += '<select name="' + name + '">';

		var isDefault = function(el) {
			return el == initialValue ? 'selected="selected"' : '';
		};

		options.forEach(function(el) {
			_this.formElements +=
				'<option value="' + el + '" ' + isDefault(el) + '>' + el + '</option>';
		});
		this.formElements += '</select>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	/**
	 * Options has fields id and name.
	 * The name is shown, the id is returned
	 */
	addSelectComplexOptions(name, options, label, initialValueId) {
		var _this = this;
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements += label + ': ';
		this.formElements += '<select name="' + name + '">';

		var isDefault = function(el) {
			return el.id == initialValueId ? 'selected="selected"' : '';
		};

		options.forEach(function(el) {
			_this.formElements +=
				'<option value="' +
				el.id +
				'" ' +
				isDefault(el) +
				'>' +
				el.name +
				'</option>';
		});
		this.formElements += '</select>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addCheckBox(name, label, checked, value) {
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		this.formElements +=
			'<input type="checkbox" name="' + name + '" value="' + value + '"';
		if (checked) this.formElements += ' checked';
		this.formElements += '>' + value + '<br>';
		this.formElements += '</div>';
		this.formElements += '</div>';
	}

	addCheckBoxExtendsExercise(name, value, title) {
		this.formElements += '<div id="ExtendsExerciseCheckbox">';
		this.formElements += '</div>';
	}

	addCheckBoxes(name, itemList) {
		var _this = this;
		this.formElements += '<div class="vex-custom-field-wrapper">';

		this.formElements += '<div class="vex-custom-input-wrapper">';
		itemList.forEach(function(el) {
			_this.formElements +=
				'<input type="checkbox" name="' +
				name +
				'" value="' +
				el.id +
				'">' +
				el.title +
				'<br>';
		});
		this.formElements += '</div>';
		this.formElements += '</div>';
	}
	hideElement(elementID) {
		ReactDOM.render(
			<EmptyDiv></EmptyDiv>,
			document.getElementById(elementID)
		);
	}

	renderExerciseGroupSelector() {
		ReactDOM.render(
			<ThemeProvider theme={Theme}>
				<ExerciseGroupSelector
					setSelectedExerciseID={this.setSelectedExerciseID}
					setSelectedExerciseGroupID={this.setSelectedExerciseGroupID}
					termCourseID={this.termCourseID}
				/>
			</ThemeProvider>,
			document.getElementById('ExerciseGroupSelector')
		);
	}

	renderProjectRevisionSelector() {
		ReactDOM.render(
			<ThemeProvider theme={Theme}>
				<ProjectRevisionSelector
					setSelectedRevisionID={this.setSelectedRevisionID}
					projects={this.projects}
				/>
			</ThemeProvider>,
			document.getElementById('ProjectRevisionSelector')
		);
	}

	showModal() {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			var formElements = _this.formElements;
			const { formatMessage } = IntlProvider.intl;

			vex.dialog.open({
				message: _this.message,
				contentCSS: {
					width: '600px'
				},
				input: formElements,
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, {
						text: formatMessage({ id: 'modal.ok', defaultMessage: 'OK' })
					}),
					$.extend({}, vex.dialog.buttons.NO, {
						text: formatMessage({
							id: 'modal.cancel',
							defaultMessage: 'Cancel'
						})
					})
				],
				callback: function(data) {
					if (data != false) {
						data.SelectedRevisionID = _this.selectedRevisionID;
						data.SelectedDate = _this.selectedDate;
						resolve(data);
					} else reject(data);
				},
				afterOpen: function($vexContent) {
					if (!_this.showProjectDropDown) {
						var submit = $vexContent.find('button[type="submit"]');
						submit.attr('disabled', true);
					}
				}
			});
			if (_this.hasDateChooser) {
				ReactDOM.render(
					<ThemeProvider theme={Theme}>
						<DateChooser setSelectedDate={_this.setSelectedDate} />
					</ThemeProvider>,
					document.getElementById('DateChooser')
				);
			}
			if (_this.isProjectRevisionSelector && _this.showProjectDropDown) {
				ReactDOM.render(
					<ThemeProvider theme={Theme}>
						<ProjectRevisionSelector
							setSelectedRevisionID={_this.setSelectedRevisionID}
							projects={_this.projects}
						/>
					</ThemeProvider>,
					document.getElementById('ProjectRevisionSelector')
				);
			}
			if (_this.isExerciseSelector && _this.showExerciseGroupDropDown) {
				ReactDOM.render(
					<ThemeProvider theme={Theme}>
						<ExtendsExerciseCheckbox
						setExtendsExerciseStatus={_this.setExtendsExerciseStatus}
						/>
					</ThemeProvider>,
					document.getElementById('ExtendsExerciseCheckbox')
				);
			}
		});

		return promise;
	}
}
