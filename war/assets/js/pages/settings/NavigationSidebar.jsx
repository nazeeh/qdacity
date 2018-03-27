//@ts-check
import React, {Component} from 'react';
import styled from 'styled-components';

/**
 * This is a presenter component that displays a hierarchical nav sidebar.
 * There are two hierarchical layers possible.
 * 
 * The props.items should look like this:
 * [
 *  {
 *      iconClass: 'fa fa-user',
 *      text: 'SettingsGroup1',
 *      onClick: () => console.log('SettingsGroup1'),
 *      items: [
 *          {....}
 *      ]
 *  },
 *  .....
 * ]
 */

const NavigationWrapper = styled.div`
    & > div {
        margin-left: 7px;
    }
`;

const NavigationHeading = styled.h2`
    color: ${props => props.theme.defaultText};
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
`;

const StyledMenuItem = styled.div`
    color: ${props => props.theme.defaultText};
    padding: 10px;
    font-size: 15px;

    display: grid;
    grid-template-columns: 20px auto;
	grid-template-areas:
        'itemIcon itemText';

    &:hover {
        background-color: ${props => props.theme.darkPaneBg};
        color: ${props => props.theme.bgDefault};
        cursor: pointer
    }

    & > i {
        grid-area: itemIcon;
        text-align: left;
        margin-top: 3px;
    }

    & > p {
        grid-area: itemText;
        display: inline-block;
        margin: 0px;
    }
`;

export default class NavigationSidebar extends Component {
	constructor(props) {
        super(props);
    }
    

    render() {
        const MenuItem = ({ item }) => {
            return (
                <StyledMenuItem onClick={item.onClick}>
                    <i className={item.iconClass}/>
                    <p>{item.text}</p>
                </StyledMenuItem>
            )
        }

        return (
            <NavigationWrapper>
                <NavigationHeading>{this.props.heading}</NavigationHeading>
                <div>
                    {this.props.items.map((item, i) => <MenuItem item={item}/>)}
                </div>
            </NavigationWrapper>
        );
    }
}