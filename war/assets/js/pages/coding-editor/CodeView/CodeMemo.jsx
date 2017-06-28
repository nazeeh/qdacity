import React from 'react'
import styled from 'styled-components';

const StyledMemoField = styled.textarea `
    height:200px;
	width:99%;
	margin:10px 10px 5px 10px;
	background-color: #FFF;
	resize: none;
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
			code: {memo: ""}
		};
		this.changeMemo = this.changeMemo.bind(this);
	}

	changeMemo(event) {
		this.state.code.memo = event.target.value;
		this.forceUpdate();
	}

	updateData(code){
		if (!code.memo) code.memo = "";
		this.setState({
			code: code
		});
	}

	render(){
		return(
			<div>
				<StyledMemoField value={this.state.code.memo} onChange={this.changeMemo}>
				</StyledMemoField>
				<StyledSaveBtn >
					<a className="btn btn-default btn-default" onClick={() => this.props.updateCode(this.state.code)} >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</div>
		);
	}
}