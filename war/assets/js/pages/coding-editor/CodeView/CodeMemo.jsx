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
		this.changeMemo = this.changeMemo.bind(this);
	}

	changeMemo(event) {
		this.props.code.memo = event.target.value;
		this.forceUpdate();
	}

	render(){
		return(
			<div>
				<StyledMemoField value={this.props.code.memo} onChange={this.changeMemo}>
				</StyledMemoField>
				<StyledSaveBtn >
					<a className="btn btn-default btn-default" onClick={() => this.props.updateCode(this.props.code)} >
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</div>
		);
	}
}