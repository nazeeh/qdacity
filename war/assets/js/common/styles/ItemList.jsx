import React from "react";
import styled from "styled-components";

import { BtnSm } from "./Btn.jsx";

import Pagination from "./Pagination.jsx";
import { SearchBox } from "./SearchBox.jsx";

const ListMenu = styled.div`
  padding-bottom: 10px;
  display: flex;
  flex: 1;
  flex-direction: row;
  float: none;

  & > .searchfield {
    height: inherit !important;
    flex: 1;
  }
`;

const StyledItemsContainer = styled.ul`
  width: 100%;
  height: ${props =>
    props.moreThanOnePage && props.containerHeight > 0
      ? props.containerHeight + "px !important"
      : "auto"};
  font-family: sans-serif;
  margin: 0;
  padding: 0px 0 0;
  flex-shrink: 0;
`;

const StyledListItem = styled.li`
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
  &:hover {
    cursor: ${props => (props.clickable ? "pointer" : "initial")};
  }
`;

const StyledListItemPrimary = StyledListItem.extend`
  background-color: ${props => props.theme.bgPrimary};
  border-color: ${props => props.theme.borderPrimary};
  &:hover {
    border-color: ${props => props.theme.borderPrimaryHighlight};
    font-weight: bold;
    & > span > .fa-inverse {
      color: ${props => props.theme.fgPrimary};
    }
  }
  &:focus {
    border-color: ${props => props.theme.borderPrimaryHighlight};
    font-weight: bold;
  }
  &:active {
    border-color: ${props => props.theme.borderPrimaryHighlight};
    font-weight: bold;
  }
`;

const StyledListItemDefault = StyledListItem.extend`
  background-color: ${props => props.theme.bgDefault};
  border-color: ${props => props.theme.borderDefault};
  & > span {
    display: flex;
    flex-direction: row;
  }
  &:hover {
    border-color: ${props => props.theme.borderDefaultHighlight};
    font-weight: bold;
  }
  &:focus {
    border-color: ${props => props.theme.borderDefaultHighlight};
    font-weight: bold;
  }
  &:active {
    border-color: ${props => props.theme.borderDefaultHighlight};
    font-weight: bold;
  }
`;

const StyledListItemBtn = BtnSm.extend`
  background-color: rgba(0, 0, 0, 0);
  color: ${props => props.color};
  border-color: ${props => props.color};
  align-self: center;
  font-size: 19px;
  border: 1px solid;
  margin: 0px 2px 0px 2px;
  padding: 4px 6px;
  &:hover {
    color: ${props => props.colorAccent} !important;
    border-color: ${props => props.colorAccent} !important;
  }
  & > i {
    color: inherit !important;
    border-color: inherit !important;
    &:hover {
      color: ${props => props.colorAccent} !important;
      border-color: ${props => props.colorAccent} !important;
    }
  }
`;

/**
 * The ItemList component renders a list of objects. Example:
 * {@code
 * <ItemList
 *     items={this.props.projects}
 *     renderItem={this.renderProject} />
 * }
 * The props field items is the array of elements that should be rendered in the list.
 * The props field renderItem is a method which defines how each element will be rendered.
 * Example:
 * {@code
 *  renderProject(project, index) {
 *      return (
 *          <StyledListItemDefault key={project.id} onClick={this.projectClick.bind(this, project)} clickable={true}>
 *              { this.renderProjectContent(project, index) }
 *          </StyledListItemDefault>
 *      );
 *  }
 * }
 *
 * The ItemList has a built-in pagination and search-box. To enable them, use the props hasSearch
 * and hasPagination. If you want to render either the pagination or the search-box manually, you
 * can use doNotrenderSearch and doNotrenderPagination:
 * {@code
 *  render() {
 *      return (
 *          <div>
 *              <div>
 *                  { this.itemList ? this.itemList.renderSearchBox() : '' }
 *
 *                  <button ... />
 *              </div>
 *
 *              <ItemList
 *                  ref={(r) => {if (r) this.itemList = r}}
 *                  hasSearch={true}
 *                  hasPagination={true}
 *                  doNotrenderSearch={true}
 *                  itemsPerPage={8}
 *                  items={this.props.projects}
 *                  renderItem={this.renderProject} />
 *          </div>
 *      );
 *  }
 *  }
 *
 * If the ItemList uses the SearchBox, it needs to know where the text ist. By default, it assumes that
 * each object in the list (props.items) has a field "name". If it doesn't, you can use the props element
 * getItemText to pass a function which should return the text of the item.
 * Example:
 * {@code
 * <ItemList
 *     hasSearch={true}
 *     hasPagination={true}
 *     itemsPerPage={8}
 *     items={this.props.projects}
 *     renderItem={this.renderProject}
 *     getItemText={(item) => item.name} />
 * }
 */
class ItemList extends React.Component {
  constructor(props) {
    super(props);

    this.searchBox = null;
    this.pagination = null;

    // Holds the container DOM-element which stores the list items
    this.containerElement = null;
    // Saves the max list height
    this.listHeight = 0;

    this.pageSelected = this.pageSelected.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(searchText) {
    if (this.props.hasPagination && this.pagination) {
      this.pagination.selectPage(1);
    }

    this.forceUpdate();
  }

  pageSelected(pageNumber) {
    this.forceUpdate();
  }

  renderSearchBoxWithContainer() {
    return <ListMenu>{this.renderSearchBox()}</ListMenu>;
  }

  renderSearchBox() {
    return (
      <SearchBox
        ref={r => {
          if (r) this.searchBox = r;
        }}
        onSearch={this.onSearch}
      />
    );
  }

  renderPagination(items, itemsPerPage) {
    return (
      <Pagination
        ref={r => {
          if (r) this.pagination = r;
        }}
        numberOfItems={items.length}
        itemsPerPage={itemsPerPage}
        pageSelected={this.pageSelected}
      />
    );
  }

  renderItems(items) {
    const _this = this;

    if (!items || items.length == 0) {
      return "";
    }

    return items.map((item, index) => {
      return _this.props.renderItem(item, index);
    });
  }

  render() {
    const _this = this;

    let items = this.props.items;

    let hasSearch = this.props.hasSearch;
    let hasPagination = this.props.hasPagination;

    // Filter search
    if (hasSearch) {
      const searchText = this.searchBox ? this.searchBox.getSearchText() : "";

      const defaultGetItemText = item => {
        return item.name;
      };

      const getItemText = this.props.getItemText
        ? this.props.getItemText
        : defaultGetItemText;

      const searchFunction = item => {
        let text = getItemText(item);
        return text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
      };

      items = items.filter(searchFunction);
    }

    // Pagination
    let itemsToDisplay = items;
    let itemsPerPage = 0;
    let moreThanOnePageUnfiltered = false;

    if (hasPagination) {
      itemsPerPage = this.props.itemsPerPage
        ? this.props.itemsPerPage
        : Pagination.getDefaultNumberOfItemsPerPage();
      moreThanOnePageUnfiltered = this.props.items.length > itemsPerPage;

      const selectedPageNumber = this.pagination
        ? this.pagination.getSelectedPageNumber()
        : 1;
      const lastItem = selectedPageNumber * itemsPerPage;
      const firstItem = lastItem - itemsPerPage;
      itemsToDisplay = items.slice(firstItem, lastItem);
    }

    // Render
    let renderSearch = hasSearch && !this.props.doNotrenderSearch;
    let renderPagination =
      hasPagination &&
      !this.props.doNotrenderPagination &&
      this.props.items.length > itemsPerPage;

    // Update the height with delay
    if (
      (this.pagination != null &&
        this.pagination.getSelectedPageNumber() > 1) ||
      (this.searchBox != null &&
        this.searchBox.getSearchText() != "" &&
        this.searchBox.getSearchText() != null)
    ) {
      this.listHeight = Math.max(
        this.listHeight,
        this.containerElement ? this.containerElement.offsetHeight : 0
      );
    }

    return (
      <div>
        {renderSearch ? this.renderSearchBoxWithContainer() : ""}

        <StyledItemsContainer
          innerRef={r => {
            if (r) _this.containerElement = r;
          }}
          moreThanOnePage={moreThanOnePageUnfiltered}
          containerHeight={this.listHeight}
        >
          {this.renderItems(itemsToDisplay)}
        </StyledItemsContainer>

        {renderPagination ? this.renderPagination(items, itemsPerPage) : ""}
      </div>
    );
  }
}

export {
  ListMenu,
  ItemList,
  StyledListItemBtn,
  StyledListItemPrimary,
  StyledListItemDefault
};
