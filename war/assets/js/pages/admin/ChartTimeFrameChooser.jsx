import React from 'react';
import styled from 'styled-components';
import './styles.css'

import DropDownButton from '../../common/styles/DropDownButton.jsx';

const SELECTION = {
	WEEK: "Week",
	MONTH: "Month",
	QUARTER: "Quarter",
	YEAR: "Year",
	CUSTOM: "Custom"

};

const DEFAULT_SELECTION = SELECTION.MONTH;

export default class UserRegistrationsChart extends React.Component {


	constructor(props) {
		super(props);

		this.state = {
			selection: DEFAULT_SELECTION
		};
	}

	setTimeFrame(selection) {
		this.setState ({
			selection: selection
		})
	}

	render() {
		const items = [
			{text: SELECTION.WEEK, onClick: () => this.setTimeFrame(SELECTION.WEEK)},
			{text: SELECTION.MONTH, onClick: () => this.setTimeFrame(SELECTION.MONTH)},
			{text: SELECTION.QUARTER, onClick: () => this.setTimeFrame(SELECTION.QUARTER)},
			{text: SELECTION.YEAR, onClick: () => this.setTimeFrame(SELECTION.YEAR)},
			{text: SELECTION.CUSTOM, onClick: () => this.setTimeFrame(SELECTION.CUSTOM)}
		];

		const CenteringDiv = styled.div `
			display: flex
		`;

		const StyledDateInput = styled.input `
			margin-left: 10px
		`;

		return (
			<CenteringDiv>
				<DropDownButton
					initText={this.state.selection}
					items={items}
					fixedWidth={'150px'}/>
				{this.state.selection === SELECTION.CUSTOM && <div>
					<StyledDateInput type={"date"} required={"required"}/>
					<StyledDateInput type={"date"} required={"required"}/>
				</div>}
			</CenteringDiv>
		);
	}
}