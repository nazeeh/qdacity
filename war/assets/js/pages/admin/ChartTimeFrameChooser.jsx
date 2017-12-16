import React from 'react';
import styled from 'styled-components';
import './styles.css'

import DropDownButton from '../../common/styles/DropDownButton.jsx';
import {BtnDefault} from "../../common/styles/Btn.jsx";

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

		const dateMaxDefault = new Date();
		const dateMinDefault = new Date();
		dateMinDefault.setMonth(dateMinDefault.getMonth() - 1);

		this.state = {
			selection: DEFAULT_SELECTION,
			customDateMin: dateMinDefault,
			customDateMax: dateMaxDefault
		};
	}

	setTimeFrame(selection) {
		this.setState({
			selection: selection
		})
	}

	setCustomDateMin(value) {
		this.setState({
			customDateMin: value
		})
	}

	setCustomDateMax(value) {
		this.setState({
			customDateMax: value
		})
	}

	sendEvent() {

	}

	static toDateString(date) {
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString();
		const day = date.getDate().toString();

		return year + '-' + (month[1] ? month : "0" + month[0]) + '-' + (day[1] ? day : "0" + day[0]);
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

		const StyledApplyButton = BtnDefault.extend `
			margin-left: 10px
		`;

		return (
			<CenteringDiv>
				<DropDownButton
					initText={this.state.selection}
					items={items}
					fixedWidth={'150px'}/>
				{this.state.selection === SELECTION.CUSTOM && <div>
					<StyledDateInput type={"date"} required={"required"} value={UserRegistrationsChart.toDateString(this.state.customDateMin)} onChange={(event) => this.setCustomDateMin(new Date(event.target.value))} max={UserRegistrationsChart.toDateString(this.state.customDateMax)}/>
					<StyledDateInput type={"date"} required={"required"} value={UserRegistrationsChart.toDateString(this.state.customDateMax)} onChange={(event) => this.setCustomDateMax(new Date(event.target.value))} min={UserRegistrationsChart.toDateString(this.state.customDateMin)} max={UserRegistrationsChart.toDateString(new Date())}/>
					<StyledApplyButton onClick={this.sendEvent()}>
						Apply
					</StyledApplyButton>
				</div>}
			</CenteringDiv>
		);
	}
}