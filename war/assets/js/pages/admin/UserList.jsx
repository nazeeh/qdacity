import UserListCtrl from './UserListCtrl.jsx';

export default class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: -1
		};
		this.selectUser = this.selectUser.bind(this);
	}

	// removeUser(pId) {
	// 	var index = this.state.users.findIndex(function (user, index, array) {
	// 		return user.id == pId;
	// 	});
	// 	this.state.users.splice(index, 1);
	// 	this.setState({
	// 		users: this.state.users
	// 	});
	// 	this.render();
	// }

	selectUser(selectedID) {
		this.setState({
			selected: selectedID
		});
	}

	getActiveDocumentId(selectedID) {
		return this.state.selected;
	}

	getActiveUser() {
		return this.getUser(this.state.selected);
	}

	getUser(userId) {
		var _this = this;
		var selectedUser = this.props.users.find(function (user) {
			return user.id == userId;
		});
		return selectedUser;
	}

	isActive(value) {
		return 'list-group-item ' + ((value == this.state.selected) ? 'active' : 'default');
	}


	render() {
		var _this = this;
		var activeUser = this.getActiveUser();
		return (


			<div className="list-group">
			<UserListCtrl user={activeUser}  test={1}/>


        {
          this.props.users.map(function(user) {
            return <a className= {_this.isActive(user.id)} key={user.id} href={"#"}  onClick={_this.selectUser.bind(null,user.id)}><span>{user.givenName} {user.surName}</span><span className="pull-right"><em>{user.email}</em></span></a>
          })
        }
      </div>
		);
	}


}