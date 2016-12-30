
export default class UMLClass extends React.Component {
constructor(props) {
    super(props);
	this.state = {pos: {x: 0, y: 0}, name: this.props.name};

	this.setPosition = this.setPosition.bind(this); 
	
	this.width = 250;

  }

  setPosition(posX, posY){
	var position = {};
	position.x = posX;
	position.y = posY;
	this.setState({pos: position});
  }
  
  getTopConnector(){
	var position = {};
	position.x = this.state.pos.x + this.width/2;
	position.y = this.state.pos.y;
	return position;
  }
  
   render() {
	   var _this = this; 
      return (
      <g>
	  <rect x="0" y="0" width="250" height="50" stroke="#555" fill="#BBB"></rect><foreignObject width="250" height="50" ><body className="className" >{this.state.name}</body></foreignObject><rect x="0" y="50" width={this.width} height="50" stroke="#555" fill="#FFF"></rect>
	</g>
    );
   }
   
   
}