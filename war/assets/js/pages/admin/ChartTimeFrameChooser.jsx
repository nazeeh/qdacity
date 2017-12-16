import React from 'react';

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

	}

	render() {
		const items = [
			{text: SELECTION.WEEK, onClick: () => this.setTimeFrame(SELECTION.WEEK)},
			{text: SELECTION.MONTH, onClick: () => this.setTimeFrame(SELECTION.MONTH)},
			{text: SELECTION.QUARTER, onClick: () => this.setTimeFrame(SELECTION.QUARTER)},
			{text: SELECTION.YEAR, onClick: () => this.setTimeFrame(SELECTION.YEAR)},
			{text: SELECTION.CUSTOM, onClick: () => this.setTimeFrame(SELECTION.CUSTOM)}
		];

		return (
			<div>
				<DropDownButton
					initText={DEFAULT_SELECTION}
					items={items}
					fixedWidth={'150px'}/>
			</div>
		);
	}
}