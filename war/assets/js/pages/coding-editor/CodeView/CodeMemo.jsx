import React from 'react'
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

const StyledCodeviewComponent = styled.div `
    padding: 8px 8px 0px 8px;
`;

const StyledMemoField = styled.textarea `
    height:200px;
	width:100%;
	background-color: #FFF;
	resize: none;
`;

const StyledSaveBtn = styled.div `
	text-align: center;
`;

export default class ClassName extends React.Component {
	constructor(props) {
		super(props);
		this.changeMemo = this.changeMemo.bind(this);
	}

	changeMemo(event) {
		this.props.code.memo = event.target.value;
		this.forceUpdate();
	}

	render() {
		return (
			<StyledCodeviewComponent>
				<StyledMemoField value={this.props.code.memo} onChange={this.changeMemo}>
				</StyledMemoField>
				<StyledSaveBtn>
					<BtnDefault onClick={() => this.props.updateSelectedCode(this.props.code, true)}>
							<i className="fa fa-floppy-o "></i>
							<span>Save</span>
					</BtnDefault>
				</StyledSaveBtn>
			</StyledCodeviewComponent>
		);
	}
}