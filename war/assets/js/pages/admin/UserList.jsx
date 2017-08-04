import UserListCtrl from './UserListCtrl.jsx';
import UserEndpoint from '../../common/endpoints/UserEndpoint';

export default class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: -1
		};
		this.selectUser = this.selectUser.bind(this);
		this.updateUser = this.updateUser.bind(this);

		$("body").css({
			overflow: "auto"
		});
	}



	updateUser(basicInfo) {
		const _this = this;
		var user = this.getActiveUser();
		user.givenName = basicInfo.firstName;
		user.surName = basicInfo.lastName;
		user.email = basicInfo.email;
		user.type = basicInfo.type;

		UserEndpoint.updateUser(user).then(function (resp) {
			_this.forceUpdate();
		});
	}

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
			<UserListCtrl user={activeUser} updateUser={this.updateUser} removeUser={this.props.removeUser}  test={1}/>


        {
          this.props.users.map(function(user) {
            return <a className= {_this.isActive(user.id)} key={user.id} href={"#"}  onClick={_this.selectUser.bind(null,user.id)}><span>{user.givenName} {user.surName}</span><span className="pull-right"><em>{user.email}</em></span></a>
          })
        }
      </div>
		);
	}


}