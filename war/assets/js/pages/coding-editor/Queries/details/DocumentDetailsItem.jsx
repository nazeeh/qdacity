import React from 'react';
import styled from 'styled-components';

import CodingOverlapText from './CodingOverlapText.jsx';

export default class DocumentDetailsItem extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>	
				<tr>
					<td>{this.props.index + 1}</td>
					<td>{this.props.codingOverlap.getOverlapPercentageByMainCode().toFixed(2)}</td>
					<td>{this.props.codingOverlap.getOverlapPercentageByOtherCode().toFixed(2)}</td>
					<td>{this.props.codingOverlap.getTextContent().getTextLengthMainCode()}</td>
					<td>{this.props.codingOverlap.getTextContent().getTextLengthOtherCode()}</td>
					<td>{this.props.codingOverlap.getTextContent().getTextLengthOverlap()}</td>
				</tr>	
				<tr>
					<td colSpan="6">
						<CodingOverlapText
							codingOverlapText={this.props.codingOverlap.getTextContent()}
						/>
					</td>
				</tr>	
			</div>
		);
	}
}
