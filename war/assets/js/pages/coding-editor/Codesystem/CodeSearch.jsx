import React from 'react';
import styled from 'styled-components';
import IntlProvider from '../../../common/Localization/LocalizationProvider';

import {
	SearchBox,
	StyledSearchFieldContainer
} from '../../../common/styles/SearchBox.jsx';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const SearchContainer = styled.div`
	display: ${props => (props.visible ? 'block' : 'none')};
	padding: 5px;
`;

export default class CodeSearch extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: false
		};

		this.searchBox = {};
		this.updateSearch = this.updateSearch.bind(this);
	}

	getSearchText() {
		if (this.searchBox == null) {
			return '';
		}

		return this.searchBox.getSearchText();
	}

	setSearchText(text) {
		this.searchBox.setSearchText(text);
	}

	toggleVisibility() {
		this.setState(
			{
				visible: !this.state.visible
			},
			() => {
				if (this.state.visible) {
					this.searchBox.focus();
				} else {
					this.setSearchText('');
				}
			}
		);
	}

	updateSearch() {
		this.props.searchTextUpdated(this.getSearchText());
	}

	render() {
		const { formatMessage } = IntlProvider.intl;

		const searchFieldPlaceholder = formatMessage({
			id: 'codesearch.search_field',
			defaultMessage: 'Search for anything'
		});

		return (
			<SearchContainer visible={this.state.visible}>
				<StyledSearchFieldContainer className="searchfield" id="searchform">
					<SearchBox
						ref={c => {
							if (c != null) this.searchBox = c;
						}}
						placeholder={searchFieldPlaceholder}
						onSearch={this.updateSearch}
					/>
				</StyledSearchFieldContainer>
			</SearchContainer>
		);
	}
}
