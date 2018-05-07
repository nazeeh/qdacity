import React from 'react';
import styled from 'styled-components';

const CheckboxAndLabelContainer = styled.div`
	display: flex;
	z-index: 10000 !important;
`;

const labelContainer = styled.div`
	display: inline-block;
	margin-left: 5px !important;
`;

export default class ExtendsExerciseCheckbox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isChecked: false
		};
		this.toggleChange = this.toggleChange.bind(this);
	}

	toggleChange() {
		this.setState({
			isChecked: !this.state.isChecked
		});
		this.props.setExtendsExerciseStatus(!this.state.isChecked);
	}

	render() {
		var _this = this;
		return (
			<div>
				<CheckboxAndLabelContainer>
					<input
						type="checkbox"
						defaultChecked={_this.state.isChecked}
						onChange={_this.toggleChange}
					/>
					<labelContainer>
						<label>Extends existing exercise</label>
					</labelContainer>
				</CheckboxAndLabelContainer>
			</div>
		);
	}
}
