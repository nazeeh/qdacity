import Loading from 'react-loading';

export default class ReactLoading extends React.Component  {
  
	
  constructor(props) {
  	super(props);
  	this.state = {show: false};
  }

	show(){
		this.setState({show: true});
	}
	
  render() {

    	//if(this.state.show) {
    	if(true){
           return <Loading type='bars' color='#e3e3e3' />;
        } else {
            return null;
        }
      

  }
  
}  