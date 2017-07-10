import React from 'react';
import UserEndpoint from '../../../common/endpoints/UserEndpoint';

const StyledPagination = styled.ul `
	list-style: none;
	display: flex;
`;

const StyledPaginationItem = styled.a `
	color: black;
	float: left;
	padding: 8px 16px;
	text-decoration: none;
	cursor: pointer;
`;

export default class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			// pagination
			currentPage: 1,
			itemsPerPage: 5
		};

		this.init();

		this.paginationClick = this.paginationClick.bind(this);
	}

	init() {

		switch (this.props.project.getType()) {
		case "VALIDATION":
			this.addValidationCoders();
			break;
		case "PROJECT":
			this.addOwners();
			break;
		default:
			break;

		}
	}

	addOwners() {
		var _this = this;
		UserEndpoint.listUser(this.props.project.getId()).then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				users: resp.items
			});
		});
	}

	addValidationCoders() {
		var _this = this;
		UserEndpoint.listValidationCoders(this.props.project.getId()).then(function (resp) {
			resp.items = resp.items || [];
			_this.setState({
				users: resp.items
			});
		});
	}


	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}


	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}

	renderPaginationIfNeccessary() {
		if (this.state.users.length <= this.state.itemsPerPage) {
			return '';
		} else {
			//Render Pagination
			const pageNumbers = [];
			for (let i = 1; i <= Math.ceil(this.state.users.length / this.state.itemsPerPage); i++) {
				pageNumbers.push(i);
			}
			const renderPaginationItems = pageNumbers.map(pageNo => {
				return (
					<StyledPaginationItem
		              key={pageNo}
		              id={pageNo}
		              onClick={this.paginationClick}
		              className= {this.isActivePage(pageNo)}
		            >
		              {pageNo}
				  </StyledPaginationItem>
				);
			});
			return <StyledPagination className="pagination" key={"pagination"}>
					{renderPaginationItems}
            	</StyledPagination>
		}

	}

	render() {
		var _this = this;

		//Render Components
		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = this.state.users.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
		}

		const renderListItems = itemsToDisplay.map((user, index) => {
			return <li key={index} className="clickable">
					<span className="userName"> {user.givenName + " " + user.surName} </span>
				</li>;
		})



		return (
			<div>
				<ul className="list compactBoxList" key={"itemList"}>
					{renderListItems}
	            </ul>
				{this.renderPaginationIfNeccessary()}
     		</div>
		);
	}


}