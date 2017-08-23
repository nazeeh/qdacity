import React from 'react';

import styles from './styles.css'
import CustomForm from '../../common/modals/CustomForm';


export default class UserListCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: this.props.user,
			test: this.props.test
		};
		this.showUserInfo = this.showUserInfo.bind(this);
		this.removeUser = this.removeUser.bind(this);

	}

	showUserInfo() {
		var _this = this;
		var user = _this.props.user;
		var modal = new CustomForm('Edit User Info');
		modal.addTextInput('firstName', "First Name", '', user.givenName);
		modal.addTextInput('lastName', "Last Name", '', user.surName);
		modal.addTextInput('email', "Email", '', user.email);
		modal.addSelect('type', ["USER", "ADMIN"], "Type", user.type);
		modal.showModal().then(function (data) {
			_this.props.updateUser(data)
		});
	}

	setUser(user) {
		this.state.user = user;
	}

	removeUser() {
		this.props.removeUser(this.props.user.id);
	}

	render() {
		var _this = this;
		var classes = 'btnUpdateDoc ' + styles.block;
		return (
			<div className={styles.center}>
	      	<div className={classes}>
				<a id="btnUserInfo" className="btn btn-default" onClick={_this.showUserInfo.bind(null, null)}>
					<i className="fa fa-pencil fa-1x"></i>
				</a>
				<a id="btnRemoveUser" className="btn btn-default" href="#" onClick={this.removeUser}>
					<i className="fa fa-trash fa-1x"></i>
				</a>
			</div>
		  </div>
		);
	}
}