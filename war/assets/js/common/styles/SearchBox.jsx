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

export default class SearchBox extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search: ''
        };
        
        this.updateSearch = this.updateSearch.bind(this);
    }

    updateSearch(e) {
        this.setState({
            search: e.target.value
        });
    }

    render() {
        let placeholer = 'Search'; // TODO
        
        return (
            <StyledSearchField className="searchfield" type="text" placeholder={placeholer} value={this.state.search} onChange={this.updateSearch} />   
        );
    }
}
