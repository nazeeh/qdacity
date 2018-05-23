import React from 'react';
import styled from 'styled-components';
import '../../pages/admin/styles.css';

import DropDownButton from '../../common/styles/DropDownButton.jsx';
import { BtnDefault } from '../../common/styles/Btn.jsx';
import StyledInput from '../../common/styles/Input.jsx';

export default class DateChooser extends React.Component {
	constructor(props) {
		super(props);

		const dateDefault = this.props.dateDefault;

		this.props.setSelectedDate(DateChooser.toDateString(dateDefault));
		this.state = {
			customDate: dateDefault
		};
	}

	setcustomDate(value) {
		this.setState({
			customDate: value
		});
		this.props.setSelectedDate(DateChooser.toDateString(value));
	}

	static toDateString(date) {
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString();
		const day = date.getDate().toString();

		return (
			year +
			'-' +
			(month[1] ? month : '0' + month[0]) +
			'-' +
			(day[1] ? day : '0' + day[0])
		);
	}

	render() {
		const CenteringDiv = styled.div`
			display: flex;
		`;

		const CustomStyledInput = StyledInput.extend`
			margin-left: 10px;
			::-webkit-inner-spin-button {
				-webkit-appearance: none;
				display: none;
			}
		`;

		const StyledApplyButton = BtnDefault.extend`
			margin-left: 10px;
			vertical-align: top;
		`;
		const dateMinDefault = new Date();

		return (
			<CenteringDiv>
				<div>
					<CustomStyledInput
						type={'date'}
						required={'required'}
						value={DateChooser.toDateString(this.state.customDate)}
						onChange={event => this.setcustomDate(new Date(event.target.value))}
						min={DateChooser.toDateString(dateMinDefault)}
					/>
				</div>
			</CenteringDiv>
		);
	}
}
