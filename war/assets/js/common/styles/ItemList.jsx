import React from 'react';
import styled from 'styled-components';

import {
	BtnSm
} from './Btn.jsx';

import Pagination from './Pagination.jsx';
import SearchBox from './SearchBox.jsx';

const ListMenu = styled.div `
    padding-bottom: 10px;
    display:flex;
    flex-direction:row;
    float: none;
    
    & > .searchfield{
        height: inherit !important;
        flex:1;
    }
`;

const StyledItemsContainer = styled.ul `
    width: 100%;
    height: ${props => (props.moreThanOnePage && props.itemsPerPage ? (props.itemsPerPage * 45) + 'px !important' : 'auto')};
    font-family: sans-serif;
    margin: 0;
    padding: 0px 0 0;
    flex-shrink: 0;
`;

const StyledListItem = styled.li `
    height: auto;
    width: 100%;
    display: flex;
    flex: 0 0 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    margin-bottom: 5px;
    border: 1px solid transparent;
    &:hover{
        cursor: ${props => (props.clickable ? 'pointer' : 'initial')};
    }
`;

const ListItemPrimary = StyledListItem.extend `
    background-color: ${props => props.theme.bgPrimary};
    border-color:  ${props => props.theme.borderPrimary};
    &:hover {
        border-color:  ${props => props.theme.borderPrimaryHighlight};
        font-weight: bold;
        & > span > .fa-inverse {
            color: ${props => props.theme.fgPrimary};
        }

    }
    &:focus {
        border-color:  ${props => props.theme.borderPrimaryHighlight};
        font-weight: bold;
    }
    &:active {
        border-color:  ${props => props.theme.borderPrimaryHighlight};
        font-weight: bold;
    }
`;

const ListItemDefault = StyledListItem.extend `
    background-color: ${props => props.theme.bgDefault};
    border-color:  ${props => props.theme.borderDefault};
    &> span {
        display: flex;
        flex-direction: row;
    }
    &:hover {
        border-color:  ${props => props.theme.borderDefaultHighlight};
        font-weight: bold;
    }
    &:focus {
        border-color:  ${props => props.theme.borderDefaultHighlight};
        font-weight: bold;
    }
    &:active {
        border-color:  ${props => props.theme.borderDefaultHighlight};
        font-weight: bold;
    }
`;

const ListItemBtn = BtnSm.extend `
    background-color: rgba(0, 0, 0, 0.0);
    color: ${props => props.color};
    border-color: ${props => props.color};
    align-self:center;
    font-size: 19px;
    border: 1px solid;
    margin: 0px 2px 0px 2px;
    padding: 4px 6px;
    &:hover{
        color: ${props => props.colorAccent} !important;
        border-color: ${props => props.colorAccent} !important;
    }
    & > i {
        color: inherit !important;
        border-color: inherit !important;
        &:hover{
            color: ${props => props.colorAccent} !important;
            border-color: ${props => props.colorAccent} !important;
        }
    }
`;

class ItemList extends React.Component {

	constructor(props) {
		super(props);

		this.searchBox = null;
		this.pagination = null;

		this.pageSelected = this.pageSelected.bind(this);
		this.onSearch = this.onSearch.bind(this);
	}

	onSearch(searchText) {
		this.forceUpdate();

		if (this.props.hasPagination) {
			this.pagination.selectPage(1);
		}
	}

	pageSelected(pageNumber) {
		this.forceUpdate();
	}

	renderSearchBox() {
		return (
			<SearchBox 
                ref={(r) => {if (r) this.searchBox = r}} 
	            onSearch={this.onSearch} />
		);
	}

	renderPagination(items, itemsPerPage) {
		return (
			<Pagination 
                ref={(r) => {if (r) this.pagination = r}} 
                numberOfItems={items.length} 
                itemsPerPage={itemsPerPage} 
                pageSelected={this.pageSelected} />
		);
	}

	renderItems(items) {
		const _this = this;

		if (!items || items.length == 0) {
			return '';
		}

		return items.map((item, index) => {
			return _this.props.renderItem(item, index);
		});
	}

	render() {
		let items = this.props.items;

		let hasSearch = this.props.hasSearch;
		let hasPagination = this.props.hasPagination;

		// Filter search
		if (hasSearch) {
			const searchText = this.searchBox ? this.searchBox.getSearchText() : '';

			const customSearch = this.props.searchFilter;

			const defaultSearch = (item) => {
				return item.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
			}

			items = items.filter(customSearch ? customSearch : defaultSearch);
		}

		// Pagination
		let itemsToDisplay = items;
		let itemsPerPage = 0;
		let moreThanOnePageUnfiltered = false;

		if (hasPagination) {
			itemsPerPage = this.props.itemsPerPage ? this.props.itemsPerPage : Pagination.getDefaultNumberOfItemsPerPage();
			moreThanOnePageUnfiltered = this.props.items.length > itemsPerPage;

			const selectedPageNumber = this.pagination ? this.pagination.getSelectedPageNumber() : 1;
			const lastItem = selectedPageNumber * itemsPerPage;
			const firstItem = lastItem - itemsPerPage;
			itemsToDisplay = items.slice(firstItem, lastItem);
		}

		// Render
		let renderSearch = hasSearch && !this.props.doNotrenderSearch;
		let renderPagination = hasPagination && !this.props.doNotrenderPagination;

		return (
			<div>
                { renderSearch ? this.renderSearch() : '' }
                
                <StyledItemsContainer moreThanOnePage={moreThanOnePageUnfiltered} itemsPerPage={itemsPerPage}>
                    { this.renderItems(itemsToDisplay) }
                </StyledItemsContainer>
                
                { renderPagination ? this.renderPagination(items, itemsPerPage) : '' }
            </div>
		);
	}
}

export {
	ListMenu,
	ItemList,
	ListItemBtn,
	ListItemPrimary,
	ListItemDefault
}