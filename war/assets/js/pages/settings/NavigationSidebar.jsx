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
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
`;

const StyledMenuItem = styled.div`

`;

export default class NavigationSidebar extends Component {
	constructor(props) {
        super(props);
    }
    

    render() {
        const MenuItem = ({ item }) => {
            return (
                <StyledMenuItem onClick={item.onClick}>{item.text}</StyledMenuItem>
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