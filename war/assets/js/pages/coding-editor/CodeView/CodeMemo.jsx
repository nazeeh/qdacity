import React from 'react'
import styled from 'styled-components';

const StyledMemoField = styled.textarea `
    height:200px;
	width:99%;
	margin:10px 10px 5px 10px;
	background-color: #FFF;
`;

const StyledSaveBtn = styled.div `
    width: 8em;
	text-align: center;
	margin: 0 auto;
`;

export default class ClassName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			memo: ""
		};
	}

	changeMemo(event) {
		this.state.memo = event.target.value;
		this.forceUpdate();
	}

	updateData(memo){
		if (!memo) memo = "";
		this.setState({
			memo: memo
		});
	}

	render(){
		return(
			<div>
				<StyledMemoField value={this.state.memo} onChange={this.changeMemo}>
				</StyledMemoField>
				<StyledSaveBtn>
					<a id="btnSaveMetaModelAttr" className="btn btn-default btn-default" onClick={() => this.saveSettings()} >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</div>
		);
	}
}