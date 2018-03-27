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
    max-width: 200px;
    & > div {
        margin-left: 0px;
    }
`;

const StyledNavigationHeading = styled.h2`
    color: ${props => props.theme.defaultText};
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
`;

const StyledMenuItem = styled.div`
    background-color: ${props => props.theme.defaultPaneBg};
    color: ${props => props.theme.defaultText};
    font-size: 15px;
    padding: 10px;
    padding-left: 45px !important;
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

const StyledMenuItemList = styled.div`
    & > div {
        padding-left: 10px;
    }
`;

const StyledSubMenuItemList = styled.div`
    & > div {
        padding: 5px;
    }
`;

export default class NavigationSidebar extends Component {
	constructor(props) {
        super(props);
    }
    

    render() {
        const NavigationHeading = ({ heading }) => {
            return !! heading ? <StyledNavigationHeading>{heading}</StyledNavigationHeading> : null;
        }

        const MenuItemList = ({ items }) => {
            return !! items ? <div>
                {items.map((item, i) => {
                    return (
                        <StyledMenuItemList>
                            <MenuItem item={item}/>
                            <SubMenuItemList items={item.items}/>
                        </StyledMenuItemList>
                    );
                })}
            </div> : null;
        }

        const MenuItem = ({ item }) => {
            return (
                <StyledMenuItem onClick={item.onClick}>
                    <i className={item.iconClass}/>
                    <p>{item.text}</p>
                </StyledMenuItem>
            )
        }

        const SubMenuItemList = ({ items }) => {
            return !! items ? <div>
                {items.map((item, i) => {
                    return (
                        <StyledSubMenuItemList>
                            <MenuItem item={item}/>
                        </StyledSubMenuItemList>
                    );
                })}
            </div> : null;
        }


        return (
            <NavigationWrapper>
                <NavigationHeading heading={this.props.heading}></NavigationHeading>
                <MenuItemList items={this.props.items}/>
            </NavigationWrapper>
        );
    }
}