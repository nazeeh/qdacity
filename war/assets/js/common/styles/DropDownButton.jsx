import React from 'react';
import styled from 'styled-components';

import {
	BtnDefault
} from './Btn.jsx';

const StyledButtonContainer = styled.div `
    display: inline-block;
    position: relative;
    font-style: normal;
`;

const StyledCaret = styled.i `
    margin-left: 5px !important;
`;

const StyledListContainer = styled.ul `
    display: block;
    position: absolute;
    top: 100%;
    left: 0px;
    z-index: 100;
    padding: 0px;
    margin: 0px;
    min-width: 100%;
    border: 1px solid;
    border-color: ${props => props.theme.borderDefault};
    background-color: ${props => props.theme.bgPrimary};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
`;

const StyledListItem = styled.li `
    list-style: none;
    text-align: left;
    white-space: nowrap;
    font-size: 12px;
    cursor: pointer;
    margin: 4px 0px;
    padding: 3px 10px;

    &:hover {
        background-color: ${props => props.theme.bgHover};
    }
`;

export default class DropDownButton extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			text: this.props.initText,
			expanded: false
		}

		this.eventListenerDomNodeRef = null;

		this.toggleDropDown = this.toggleDropDown.bind(this);
		this.hideDropDown = this.hideDropDown.bind(this);
	}

	componentDidMount() {
		this.eventListenerDomNodeRef.addEventListener('hideDropDown', this.hideDropDown);
	}

	componentDidUnmount() {
		this.eventListenerDomNodeRef.removeEventListener('hideDropDown', this.hideDropDown);
	}

	setText(text) {
		this.setState({
			text: text
		});
	}

	toggleDropDown(e) {
		e.stopPropagation()
		this.setState({
			expanded: !this.state.expanded
		});
	}

	hideDropDown() {
		this.setState({
			expanded: false
		});
	}

	showDropDown() {
		this.setState({
			expanded: true
		});
	}

	itemClicked(item) {
		this.setState({
			text: item.text,
			expanded: false
		});

		item.onClick();
	}

	render() {
		const _this = this;

		return (
			<StyledButtonContainer className="customDropDownParent">
			    <p ref={(r) => {if (r != null) _this.eventListenerDomNodeRef = r}} className="customDropDownEventNode"></p>
                <BtnDefault onClick={(e) => this.toggleDropDown(e)}>
                    {this.state.text}
                    <StyledCaret className='fa fa-caret-down' aria-hidden='true'></StyledCaret>
                </BtnDefault>
                {this.state.expanded ? (
                    <StyledListContainer>
                        {this.props.items.map((item) =>
                            <StyledListItem onClick={_this.itemClicked.bind(this, item)}>{item.text}</StyledListItem>
                        )}
                    </StyledListContainer>
                ) : ( '' )}
            </StyledButtonContainer>
		);
	}

}
