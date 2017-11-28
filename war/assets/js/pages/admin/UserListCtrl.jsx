import React from 'react';

import styles from './styles.css'
import CustomForm from '../../common/modals/CustomForm';
import {BtnDefault} from "../../common/styles/Btn.jsx";


export default class UserListCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: this.props.user,
			test: this.props.test
		};
	}

	showUserInfo() {
        const user = this.props.user;
        const modal = new CustomForm('Edit User Info');
        modal.addTextInput('firstName', "First Name", '', user.givenName);
		modal.addTextInput('lastName', "Last Name", '', user.surName);
		modal.addTextInput('email', "Email", '', user.email);
		modal.addSelect('type', ["USER", "ADMIN"], "Type", user.type);
		modal.showModal().then((data) => {
			this.props.updateUser(data)
		});
	}

	setUser(user) {
		this.state.user = user;
	}

	removeUser() {
		this.props.removeUser(this.props.user.id);
	}

	render() {
		return (
			<div className="center">
				<BtnDefault id="btnUserInfo" onClick={() => this.showUserInfo()}>
					<i className="fa fa-pencil fa-1x"/>
				</BtnDefault>
				<BtnDefault id="btnRemoveUser" href="#" onClick={() => this.removeUser()}>
					<i className="fa fa-trash fa-1x"/>
				</BtnDefault>
		  </div>
		);
	}
}