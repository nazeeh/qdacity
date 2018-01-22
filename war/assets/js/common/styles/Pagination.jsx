import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.ul`
	list-style: none;
	display: flex;
	padding-left: 0;
	margin: 15px 0;
	border-radius: 4px;
`;

const StyledBaseItem = styled.a`
	width: 45px;
	text-align: center;
	float: left;
	padding: 8px 0px;
	text-decoration: none;
	user-select: none;
`;

const StyledItem = StyledBaseItem.extend`
	cursor: pointer;
	background-color: ${props =>
		props.active ? props.theme.bgPrimaryHighlight : ''};
	color: ${props =>
		props.active ? props.theme.fgPrimaryHighlight : props.theme.fgDefault};

	&:hover {
		background-color: ${props =>
		props.active
			? props.theme.bgPrimaryHighlight
			: props.theme.defaultPaneBg};
		color: ${props =>
		props.active ? props.theme.fgPrimaryHighlight : props.theme.fgDefault};
		text-decoration: none;
	}
`;

const StyledSeparator = StyledBaseItem.extend`
	cursor: default;
	background-color: ${props => props.theme.bgDefault};
	color: ${props => props.theme.fgDefault};
	font-weight: bold;

	&:hover {
		text-decoration: none;
	}
`;

export default class Pagination extends React.Component {
	static getDefaultNumberOfItemsPerPage() {
		return 10;
	}

	constructor(props) {
		super(props);

		this.maxPageItems = 7;

		this.state = {
			selectedPageNumber: 1
		};
	}

	getSelectedPageNumber() {
		return this.state.selectedPageNumber;
	}

	getNumberOfPages() {
		const numberOfItems = this.props.numberOfItems
			? this.props.numberOfItems
			: 1;
		const itemsPerPage = this.props.itemsPerPage
			? this.props.itemsPerPage
			: this.getDefaultNumberOfItemsPerPage();

		return Math.ceil(numberOfItems / itemsPerPage);
	}

	isItemActive(pageNumber) {
		return pageNumber == this.state.selectedPageNumber;
	}

	selectPage(pageNumber) {
		if (pageNumber <= 0 || pageNumber > this.getNumberOfPages()) {
			return;
		}

		this.setState(
			{
				selectedPageNumber: pageNumber
			},
			() => {
				if (this.props.pageSelected != null) {
					this.props.pageSelected(pageNumber);
				}
			}
		);
	}

	clickItem(pageNumber) {
		this.selectPage(pageNumber);
	}

	renderSeparator() {
		return <StyledSeparator>...</StyledSeparator>;
	}

	renderPage(pageNumber) {
		return (
			<StyledItem
				key={pageNumber}
				id={pageNumber}
				onClick={this.clickItem.bind(this, pageNumber)}
				active={this.isItemActive(pageNumber)}
			>
				{pageNumber}
			</StyledItem>
		);
	}

	renderAllPages(numberOfPages) {
		const content = [];

		for (let i = 0; i < numberOfPages; i++) {
			content.push(this.renderPage(i + 1));
		}

		return content;
	}

	renderPagesWithFirstAndLastPage(numberOfPages) {
		return [
			this.renderPage(1),
			this.renderSeparator(),
			this.renderPage(this.state.selectedPageNumber - 1),
			this.renderPage(this.state.selectedPageNumber),
			this.renderPage(this.state.selectedPageNumber + 1),
			this.renderSeparator(),
			this.renderPage(numberOfPages)
		];
	}

	renderPagesStartAndEnd(numberOfPages) {
		if (this.state.selectedPageNumber < 5) {
			return [
				this.renderPage(1),
				this.renderPage(2),
				this.renderPage(3),
				this.renderPage(4),
				this.renderPage(5),
				this.renderSeparator(),
				this.renderPage(numberOfPages)
			];
		} else if (this.state.selectedPageNumber > numberOfPages - 4) {
			return [
				this.renderPage(1),
				this.renderSeparator(),
				this.renderPage(numberOfPages - 4),
				this.renderPage(numberOfPages - 3),
				this.renderPage(numberOfPages - 2),
				this.renderPage(numberOfPages - 1),
				this.renderPage(numberOfPages)
			];
		}
	}

	render() {
		let numberOfPages = this.getNumberOfPages();

		let shouldRenderAllPages = numberOfPages <= this.maxPageItems;
		let shouldRenderPagesWithFirstAndLastPage =
			this.state.selectedPageNumber >= 5 &&
			this.state.selectedPageNumber <= numberOfPages - 4;

		return (
			<StyledContainer>
				{shouldRenderAllPages
					? this.renderAllPages(numberOfPages)
					: shouldRenderPagesWithFirstAndLastPage
						? this.renderPagesWithFirstAndLastPage(numberOfPages)
						: this.renderPagesStartAndEnd(numberOfPages)}
			</StyledContainer>
		);
	}
}
