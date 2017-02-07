import styles from './styles.css'
import CustomForm from '../../common/modals/CustomForm';
import UserEndpoint from '../../common/endpoints/UserEndpoint';

export default class UserListCtrl extends React.Component {
constructor(props) {
    super(props);
    this.state = {user: this.props.user, test:this.props.test};
    this.showUserInfo = this.showUserInfo.bind(this); 
    this.updateUser = this.updateUser.bind(this); 
  }
   
   showUserInfo(){
   	var _this = this;
   	var user = _this.props.user;
   	var modal = new CustomForm('Edit User Info');
	modal.addTextInput('firstName', "First Name",'', user.givenName);
	modal.addTextInput('lastName', "Last Name",'', user.surName);
	modal.addTextInput('email', "Email",'', user.email);
	modal.showModal().then(function(data) {
		_this.updateUser(data)
	});
   }
   
   setUser(user){
   		this.state.user = user;
   }
   
   updateUser(basicInfo){
   		var user = this.props.user;
   		user.givenName = basicInfo.firstName;
   		user.surName = basicInfo.lastName;
   		user.email = basicInfo.email;
   		
	   UserEndpoint.updateUser(user).then(function (resp) {});
   }
   
   
   render() {
	   var _this = this; 
	   var classes = 'btnUpdateDoc ' +styles.block;
      return (
	      <div className={styles.center}> 
	      	<div className={classes}>
				<a id="btnUserInfo" className="btn btn-default" onClick={_this.showUserInfo.bind(null, null)}>
					<i className="fa fa-pencil fa-1x"></i>
				</a>
				<a id="btnRemoveUser" className="btn btn-default" href="#">
					<i className="fa fa-trash fa-1x"></i>
				</a>
			</div>
		  </div>
    );
   }
}
