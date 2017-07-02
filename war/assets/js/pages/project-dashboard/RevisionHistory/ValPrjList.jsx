import React from 'react';

import ProjectEndpoint from '../../../common/endpoints/ProjectEndpoint';

export default class ValPrjList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			validationProjects: this.props.validationProjects,
			// pagination
			currentPage: 1,
			itemsPerPage: 8,
			search: ''
		};

		this.paginationClick = this.paginationClick.bind(this);
		this.updateSearch = this.updateSearch.bind(this);
	}


	getStyles() {
		return {
			search: {
				width: "100%",
				float: "none"
			},
			pagination: {
				listStyle: "none",
				display: "flex"
			},
			paginationItem: {
				color: "black",
				float: "left",
				padding: "8px 16px",
				textDecoration: "none",
				cursor: "pointer"

			},
			listItemBtn: {
				float: "right",
				marginTop: "-15px"
			}
		};
	}


	paginationClick(event) {
		this.setState({
			currentPage: Number(event.target.id)
		});
	}

	updateSearch(e) {
		this.setState({
			search: e.target.value
		});

	}

	isActivePage(page) {
		return ((page == this.state.currentPage) ? 'active' : ' ');
	}

	deleteValPrj(e, valPrjId, index) {
		var _this = this;
		e.stopPropagation();
		ProjectEndpoint.removeValidationProject(valPrjId)
			.then(
				function (val) {
					alertify.success("Revision has been deleted");
					_this.state.validationProjects.splice(index, 1);
					_this.setState({
						validationProjects: _this.state.validationProjects
					})
				})
			.catch(this.handleBadResponse);
	}

	handleBadResponse(reason) {
		alertify.error("There was an error");
		console.log(reason.message);
	}

	renderDeleteBtn(valPrj, index) {
		const styles = this.getStyles();

		if (this.props.isAdmin || this.props.isProjectOwner)
			return <a onClick={(e) => this.deleteValPrj(e,valPrj.id, index)} className="btn  fa-stack fa-lg" style={styles.listItemBtn}>
						<i className="fa fa-circle fa-stack-2x fa-cancel-btn-circle fa-hover"></i>
						<i className="fa fa-trash  fa-stack-1x fa-inverse fa-cancel-btn"></i>
					</a>;
		else return '';
	}

	valPrjLink(valPrjId) {
		if (this.props.isAdmin || this.props.isProjectOwner) location.href = 'coding-editor.html?project=' + valPrjId + '&type=VALIDATION';
	}

	render() {
		var _this = this;

		const styles = this.getStyles();

		//Render Components

		//Render search and newPrjBtn
		const renderSearch = <div>
			<span className="searchfield" id="searchform" style={styles.search}> 
				<input 
					type="text" 
					placeholder="Search" 
					value={this.state.search}
					onChange={this.updateSearch}
				/>
				<button type="button" id="search">Find!</button>
			</span>
		
		</div>

		// Render list items
		var filteredList = this.state.validationProjects.filter(
			(project) => {
				return project.creatorName.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
			}
		);

		const lastItem = this.state.currentPage * this.state.itemsPerPage;
		const firstItem = lastItem - this.state.itemsPerPage;
		const itemsToDisplay = filteredList.slice(firstItem, lastItem);

		function prjClick(prj) {
			console.log('Link');
		}

		const renderListItems = itemsToDisplay.map((valPrj, index) => {

			return <li key={valPrj.id} onClick={() => this.valPrjLink(valPrj.id)}  className="clickable">
					<span> {valPrj.creatorName} </span>
					{this.renderDeleteBtn(valPrj, index)}
				</li>;
		})

		//Render Pagination
		const pageNumbers = [];
		for (let i = 1; i <= Math.ceil(this.state.validationProjects.length / this.state.itemsPerPage); i++) {
			pageNumbers.push(i);
		}
		const renderPagination = pageNumbers.map(pageNo => {
			return (
				<a
	              key={pageNo}
	              id={pageNo}
	              onClick={this.paginationClick}
	              style={styles.paginationItem}
	              className= {this.isActivePage(pageNo)}
	            >
	              {pageNo}
	            </a>
			);
		});

		return (
			<div>
				{renderSearch}
				<ul className="list compactBoxList">
					{renderListItems}
	            </ul>
	            <ul className="pagination" style={styles.pagination}>
					{renderPagination}
            	</ul>
     		</div>
		);
	}


}