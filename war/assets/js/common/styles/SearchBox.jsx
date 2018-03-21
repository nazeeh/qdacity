import React from 'react';
import styled from 'styled-components';

import IntlProvider from '../../common/Localization/LocalizationProvider';

const StyledSearchField = styled.input`
	padding: 0.3em;
	border: 1px solid;
	border-color: ${props => props.theme.borderDefault};
	&:hover {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
	&:focus {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
	&:active {
		border-color: ${props => props.theme.borderDefaultHighlight};
	}
`;

const StyledSearchFieldContainer = styled.div`
	float: none;
	width: 100%;
	display: flex;
	flex-direction: row;
	padding-bottom: 5px;

	& > .searchfield {
		flex: 1;
	}
`;

class SearchBox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			search: ''
		};

		this.inputElement = null;

		this.updateSearch = this.updateSearch.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
	}

	getSearchText() {
		return this.state.search;
	}

	setSearchText(searchText) {
		this.setState(
			{
				search: searchText
			},
			() => {
				if (this.props.onSearch) {
					this.props.onSearch(searchText);
				}
			}
		);
	}

	updateSearch(e) {
		const searchText = e.target.value;

		this.setSearchText(searchText);
	}

	onKeyPress(e) {
		if (this.props.onKeyPress) {
			this.props.onKeyPress(e);
		}
	}

	focus() {
		if (this.inputElement) {
			this.inputElement.focus();
		}
	}

	render() {
		const _this = this;

		const { formatMessage } = IntlProvider.intl;

		const defaultPlaceHolder = formatMessage({
			id: 'searchbox.search',
			defaultMessage: 'Search'
		});

		let placeholer = this.props.placeholder
			? this.props.placeholder
			: defaultPlaceHolder;

		return (
			<StyledSearchField
				innerRef={r => {
					if (r) _this.inputElement = r;
				}}
				className="searchfield"
				type="text"
				placeholder={placeholer}
				value={this.state.search}
				onChange={this.updateSearch}
				onKeyPress={this.onKeyPress}
			/>
		);
	}
}

export { StyledSearchField, StyledSearchFieldContainer, SearchBox };
