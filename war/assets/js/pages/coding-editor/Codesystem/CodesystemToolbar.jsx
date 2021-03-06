import React from 'react';
import styled from 'styled-components';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import Prompt from '../../../common/modals/Prompt';

import { PageView } from '../View/PageView.js';

import CodesEndpoint from '../../../common/endpoints/CodesEndpoint';
import Confirm from '../../../common/modals/Confirm';
import CodingsOverview from '../../../common/modals/CodingsOverview/CodingsOverview';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledToolBar = styled.div`
	padding-bottom: 2px;
`;

const StyledBtnGroup = styled.div`
	padding: 0px 2px 2px 2px;
`;

const StyledBtnStack = styled.div`
	font-size: 8px !important;
`;

export default class CodesystemToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userProfile: {
				name: '',
				email: '',
				picSrc: ''
			}
		};

		this.insertCode = this.insertCode.bind(this);
		this.applyCode = this.applyCode.bind(this);
		this.removeCoding = this.removeCoding.bind(this);
		this.showCodingsOverview = this.showCodingsOverview.bind(this);
		this.toggleSearchBar = this.toggleSearchBar.bind(this);
	}

	// lifecycle hook: update state for rerender
	componentWillReceiveProps(nextProps) {
		this.updateUserProfileStatusFromProps(nextProps);
	}

	updateUserProfileStatusFromProps(targetedProps) {
		this.setState({
			userProfile: targetedProps.userProfile
		});
	}

	removeCode(code) {
		const { formatMessage } = IntlProvider.intl;
		const _this = this;

		// root should not be removed
		if (code.codeID == 1) {
			return;
		}

		new Confirm(
			formatMessage(
				{
					id: 'codesystemtoolbar.confirm_delete',
					defaultMessage: 'Do you want to delete the code {name}?'
				},
				{
					name: code.name
				}
			)
		)
			.showModal()
			.then(() => this.props.removeCode(code));
	}

	insertCode() {
		const { formatMessage } = IntlProvider.intl;

		new Prompt(
			formatMessage({
				id: 'codesystemtoolbar.prompt_name',
				defaultMessage: 'Give your code a name'
			}),
			formatMessage({
				id: 'codesystemtoolbar.prompt_name.sample',
				defaultMessage: 'Code Name'
			})
		)
			.showModal()
			.then(codeName => this.props.createCode(codeName));
	}

	applyCode() {
		const selected = this.props.selected;
		const author = this.props.userProfile.name;

		this.props.documentsView.applyCodeToCurrentDocument(selected, author);
	}

	removeCoding() {
		this.props.documentsView.removeCoding(this.props.selected.codeID);
	}

	showCodingsOverview() {
		const { formatMessage } = IntlProvider.intl;
		var overview = new CodingsOverview(
			formatMessage({
				id: 'codesystemtoolbar.delete_code',
				defaultMessage: 'Do you want to delete the code?'
			})
		);
		overview
			.showModal(this.props.selected.codeID, this.props.documentsView)
			.then(function() {});
	}

	toggleSearchBar() {
		this.props.toggleCodeSearch();
	}

	renderAddRemoveCodeBtn() {
		if (this.props.projectType != 'PROJECT') return '';

		return [
			<BtnDefault
				id="addCodeButtonId"
				key="applyCodeBtn"
				className="btn btn-default"
				onClick={this.insertCode}
			>
				<i className="fa fa-plus fa-1x" />
			</BtnDefault>,
			<BtnDefault
				key="removeCodeBtn"
				className="btn btn-default"
				onClick={this.removeCode.bind(this, this.props.selected)}
			>
				<i className="fa fa-trash fa-1x" />
			</BtnDefault>
		];
	}

	renderAddRemoveCodingBtn() {
		if (this.props.pageView == PageView.UML) {
			return '';
		}
		if (this.props.readOnly == 'true') {
			return '';
		} else {
			return (
				<StyledBtnGroup className="btn-group">
					<BtnDefault className="btn btn-default" onClick={this.applyCode} id="applyCodeBtn">
						<StyledBtnStack className="fa-stack fa-lg">
							<i className="fa fa-tag fa-stack-2x" />
							<i className="fa fa-plus fa-stack-1x fa-inverse" />
						</StyledBtnStack>
					</BtnDefault>
					<BtnDefault className="btn btn-default" onClick={this.removeCoding}>
						<StyledBtnStack className="fa-stack fa-lg">
							<i className="fa fa-tag fa-stack-2x" />
							<i className="fa fa-minus fa-stack-1x fa-inverse" />
						</StyledBtnStack>
					</BtnDefault>
				</StyledBtnGroup>
			);
		}
	}

	renderSearchButton() {
		return (
			<StyledBtnGroup className="btn-group">
				<BtnDefault className="btn btn-default" onClick={this.toggleSearchBar}>
					<i className="fa fa-search fa-1x" />
				</BtnDefault>
			</StyledBtnGroup>
		);
	}

	renderQueriesButton() {
		return (
			<StyledBtnGroup className="btn-group">
				<BtnDefault
					className="btn btn-default"
					onClick={this.props.openCodeQueries}
				>
					<i className="fa fa-database fa-1x" />
				</BtnDefault>
			</StyledBtnGroup>
		);
	}

	render() {
		return (
			<StyledToolBar>
				<StyledBtnGroup className="btn-group">
					{this.renderAddRemoveCodeBtn()}
					<BtnDefault
						className="btn btn-default"
						onClick={this.props.toggleCodingView}
					>
						<i className="fa  fa-list-alt  fa-1x" />
					</BtnDefault>
				</StyledBtnGroup>
				<StyledBtnGroup className="btn-group">
					<BtnDefault
						key="codingsOverview"
						className="btn btn-default"
						onClick={this.showCodingsOverview}
					>
						<i className="fa fa-list fa-1x" />
					</BtnDefault>
				</StyledBtnGroup>
				{this.renderAddRemoveCodingBtn()}
				{this.renderSearchButton()}
				{this.renderQueriesButton()}
			</StyledToolBar>
		);
	}
}
