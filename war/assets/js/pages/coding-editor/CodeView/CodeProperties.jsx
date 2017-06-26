import React from 'react'

export default class CodeProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: {}
		};
	}

	updateData(code){
		this.setState({
			code: code
		});
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
							<td><input id="codePropName" type="text" value={this.state.code.name}/></td>
						</tr>
						<tr>
							<td><span>Author: </span></td>
							<td><input id="codePropAuthor" type="text" value={this.state.code.author}/></td>
						</tr>
						<tr>
							<td><span>Color: </span></td>
							<td>
								<div className="evo-cp-wrap">
									<input id="codePropColor" type="text" value="#000000" className="colorPicker evo-cp0"/>
									<div className="evo-pointer evo-colorind">

									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<div >
					<a id="btnCodeSave" className="btn btn-default btn-default">
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</div>
			</div>
		);
	}
}