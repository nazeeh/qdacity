import React from 'react'
import styled from 'styled-components';


const StyledColorPicker = styled.input `
    width: 80px;
`;

const StyledSaveBtn = styled.div `
    width: 8em;
	text-align: center;
	margin: 0 auto;
`;

export default class CodeProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: {name:"",author:""}
		};
		this.changeName = this.changeName.bind(this);
		this.changeAuthor = this.changeAuthor.bind(this);

	}

	updateData(code){
		this.setState({
			code: code
		});
	}

	changeName(event) {
		this.state.code.name = event.target.value;
		this.setState({code: this.state.code});
	}

	changeAuthor(event) {
		this.state.code.author = event.target.value;
		this.setState({code: this.state.code});
	}

	componentDidUpdate() {
		$("#codePropColor").colorpicker({
			color: this.state.code.color
		});
	}

	render(){
		return(
			<div className="active-content-div">
					<table>
						<tbody>
						<tr>
							<td><span>Name: </span></td>
							<td><input id="codePropName" type="text" value={this.state.code.name} onChange={this.changeName}/></td>
						</tr>
						<tr>
							<td><span>Author: </span></td>
							<td><input id="codePropAuthor" type="text" value={this.state.code.author} onChange={this.changeAuthor}/></td>
						</tr>
						<tr>
							<td><span>Color: </span></td>
							<td>
								<div className="evo-cp-wrap">
									<StyledColorPicker id="codePropColor" type="text" className="colorPicker evo-cp0"/>

								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<StyledSaveBtn onClick={() => this.props.updateCode(this.state.code)}>
					<a id="btnCodeSave" className="btn btn-default btn-default">
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</div>
		);
	}
}