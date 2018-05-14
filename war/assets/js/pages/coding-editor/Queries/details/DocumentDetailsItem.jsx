import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { Collapsible } from '../../../../common/styles/expander/Collapsible.jsx';

import CodingOverlapText from './CodingOverlapText.jsx';

const StyledContainer = styled.div`
	padding: 4px;
`;

const StyledContentContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

const StyledContainerIndex = styled.div`
	width: 25px;
	min-width: 25px;
	margin-right: 35px;
	text-align: right;
`;

const StyledContainerShowText = styled.div`
	width: 65px;
	min-width: 65px;
	margin-right: 35px;
`;

const StyledContainerOpenCodingEditor = styled.div`
	width: 83px;
	min-width: 83px;
	margin-right: 35px;
`;

const StyledShowText = styled.a`
	&:hover {
		cursor: pointer;
	}
`;

const StyledContainerOverlapPercentage = styled.div`
	overflow: hidden;
`;

const StyledColorMark = styled.div`
	display: inline-block;
	width: 10px;
	height: 10px;
	border: 1px solid;
	border-color: ${props => props.theme.defaultText};
	margin-right: 4px;
	margin-left: 3px;
`;

const StyledColorMarkMainCode = StyledColorMark.extend`
	background-color: #b5d5ff;
`;

const StyledColorMarkOtherCode = StyledColorMark.extend`
	background-color: #a5fee3;
`;

const StyledContainerCollapsible = styled.div``;

const StyledSeparator = styled.div`
	height: 1px;
	background-color: #e3e3e3;
	margin-top: 8px;
`;

export default class DocumentDetailsItem extends React.Component {
	constructor(props) {
		super(props);

		this.textCollapsibleRef = null;
	}

	toggleText() {
		this.textCollapsibleRef.toggle();
	}

	render() {
		return (
			<StyledContainer>
				{this.renderContent()}
				{this.renderText()}
				{this.renderSeparator()}
			</StyledContainer>
		);
	}

	renderContent() {
		const overlapPercentageByMainCode = (
			this.props.codingOverlap.getOverlapPercentageByMainCode() * 100
		).toFixed(2);
		const overlapPercentageByOtherCode = (
			this.props.codingOverlap.getOverlapPercentageByOtherCode() * 100
		).toFixed(2);

		return (
			<StyledContentContainer>
				<StyledContainerIndex>#{this.props.index + 1}</StyledContainerIndex>

				<StyledContainerShowText>
					<StyledShowText onClick={this.toggleText.bind(this)}>
						<FormattedMessage
							id="codeQueriesDetailsItemShowText"
							defaultMessage="Show Text"
						/>
					</StyledShowText>
				</StyledContainerShowText>

				<StyledContainerOpenCodingEditor>
					<StyledShowText
						onClick={() =>
							this.props.openCodingEditor(
								this.props.codingOverlap.getCodingIdMain()
							)
						}
					>
						<FormattedMessage
							id="codeQueriesDetailsItemOpenCoding"
							defaultMessage="Open Coding"
						/>
					</StyledShowText>
				</StyledContainerOpenCodingEditor>

				<StyledContainerOverlapPercentage>
					{overlapPercentageByMainCode} % / {overlapPercentageByOtherCode} % (<StyledColorMarkMainCode />
					{this.props.code.name} / <StyledColorMarkOtherCode />
					{this.props.selectedCode.name})
				</StyledContainerOverlapPercentage>
			</StyledContentContainer>
		);
	}

	renderText() {
		return (
			<StyledContainerCollapsible>
				<Collapsible
					ref={r => {
						if (r) this.textCollapsibleRef = r;
					}}
				>
					<CodingOverlapText
						codingOverlapText={this.props.codingOverlap.getTextContent()}
					/>
				</Collapsible>
			</StyledContainerCollapsible>
		);
	}

	renderSeparator() {
		if (this.props.isLastItem) {
			return '';
		}

		return <StyledSeparator />;
	}
}
