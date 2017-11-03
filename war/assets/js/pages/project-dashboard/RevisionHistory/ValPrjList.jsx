import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';
import Theme from '../../../common/styles/Theme.js';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

import {
	StyledPagination,
	StyledPaginationItem,
	StyledListItemBtn,
	StyledBoxList,
	StyledListItemDefault
} from '../../../common/styles/List';

import StyledSearchField from '../../../common/styles/SearchField.jsx';
import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';


export default class ValPrjList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			validationProjects: this.props.validationProjects,
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.paginationClick = this.paginationClick.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
	}

	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});

	}

	isActivePage(page) {
		return (page == this.state.currentPage);
	}

	deleteValPrj(e, valPrjId, index) {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;
		e.stopPropagation();
		ProjectEndpoint.removeValidationProject(valPrjId)
			.then(
				function (val) {
					alertify.success(
						formatMessage({ id: 'valprjlist.revision_deleted', defaultMessage: "Revision has been deleted" })
					);
					_this.state.validationProjects.splice(index, 1);
					_this.setState({
						validationProjects: _this.state.validationProjects
					})
				})
			.catch(this.handleBadResponse);
	}

	handleBadResponse(reason) {
		const {formatMessage} = IntlProvider.intl;
		alertify.error(
			formatMessage({ id: 'valprjlist.error', defaultMessage: "There was an error" })
		);
		console.log(reason.message);
	}

	renderDeleteBtn(valPrj, index) {
		if (this.props.isAdmin || this.props.isProjectOwner)
			return <StyledListItemBtn onClick={(e) => this.deleteValPrj(e,valPrj.id, index)} className="btn fa-lg"  color={Theme.rubyRed} colorAccent={Theme.rubyRedAccent}>
						<i className="fa fa-trash"></i>
					</StyledListItemBtn>;
		else return '';
	}

	valPrjLink(valPrjId) {
		if (this.props.isAdmin || this.props.isProjectOwner) this.props.history.push('/CodingEditor?project=' + valPrjId + '&type=VALIDATION');
	}

	render() {
		const {formatMessage} = IntlProvider.intl;
		var _this = this;

		//Render Components
		const searchFieldPlaceholder = formatMessage({ id: 'valprjlist.search', defaultMessage: 'Search' });

		//Render search and newPrjBtn
		const renderSearch = <div>
			<StyledSearchField className="searchfield" id="searchform">
				<input
					type="text"
					placeholder={searchFieldPlaceholder}
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<BtnDefault type="button">
					<i className="fa fa-search  fa-lg"></i>
				</BtnDefault>
			</StyledSearchField>

		</div>

		// Render list items
		var filteredList = this.state.validationProjects.filter(
			(project) => {
				return project.creatorName.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
			}
		);

		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = filteredList.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
		}

		const renderListItems = itemsToDisplay.map((valPrj, index) => {

			return <StyledListItemDefault key={valPrj.id} onClick={() => this.valPrjLink(valPrj.id)} clickable={true}>
					<span> {valPrj.creatorName} </span>
					{this.renderDeleteBtn(valPrj, index)}
				</StyledListItemDefault>;
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.validationProjects.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<StyledPaginationItem
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              active= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
			  </StyledPaginationItem>
			);
		});

		return (
			<div>
				{renderSearch}
				<StyledBoxList>
					{renderListItems}
	            </StyledBoxList>
	            <StyledPagination>
					{renderPagination}
            	</StyledPagination>
     		</div>
		);
	}


}