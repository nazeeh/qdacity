import React from 'react';
import styled from 'styled-components';

const StyledSearchField = styled.input `
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

class SearchBox extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			search: ''
		};

		this.updateSearch = this.updateSearch.bind(this);
	}

	getSearchText() {
		return this.state.search;
	}

	updateSearch(e) {
		const searchText = e.target.value;

		this.setState({
			search: searchText
		}, () => {
			if (this.props.onSearch) {
				this.props.onSearch(searchText);
			}
		});
	}

	render() {
		let placeholer = this.props.placeholder ? this.props.placeholder : 'Search'; // TODO

		return (
			<StyledSearchField className="searchfield" type="text" placeholder={placeholer} value={this.state.search} onChange={this.updateSearch} />
		);
	}
}

export {
	StyledSearchField,
	SearchBox
}