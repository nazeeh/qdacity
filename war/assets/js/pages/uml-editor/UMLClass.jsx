
export default class UMLClass extends React.Component {
constructor(props) {
    super(props);
	this.state = {pos: {x: 0, y: 0}, name: this.props.name, codeID: this.props.codeID};

	this.setPosition = this.setPosition.bind(this); 
	this.svgContainer = this.props.svgContainer;
	this.width = 250;
	this.height = 100;

  }

  setPosition(posX, posY){
	var position = {};
	position.x = posX;
	position.y = posY;
	this.setState({pos: position});
  }
  
  move(dx, dy){
	var position = this.state.pos;

	position.x += dx;
	position.y += dy;
	d3.select(this.svgContainer).attr("transform", "translate(" + position.x + "," + position.y + ")");
	this.setState({pos: position});
  }
  
  getPosition(){
	return this.state.pos;
  }
  
  getCodeID(){
	return this.state.codeID;
  }
  
  getHeight(){
	return this.height;
  }
  
  getWidth(){
	return this.width;
  }
  
  getConnector(otherClass){
		var otherPos = otherClass.getPosition();
		var deltaY = this.calculateDeltaY(otherClass);
		var deltaX = this.calculateDeltaX(otherClass);
		if (deltaY < 0 ){
			return this.getTopConnector();
		}
		else if (deltaY > 0 ) {
			return this.getBottomConnector();
		}
		if (deltaX > 0 ){
			return this.getLeftConnector();
		}
		else if (deltaX < 0 ) {
			return this.getRightConnector();
		}
		return this.getTopConnector();
  }
  
  calculateDeltaY(otherClass){
	var thisTop = this.state.pos.y;
	var thisBottom = this.state.pos.y + this.height;
	
	var otherTop = otherClass.getPosition().y;
	var otherBottom = otherClass.getPosition().y + otherClass.getHeight();
	
	var bottomToTop = otherTop - thisBottom;
	var topToBottom =  thisTop - otherBottom;
	
	if (bottomToTop < 0 && topToBottom < 0 ){
		return 0;
	}
	if (bottomToTop > 0 ) return bottomToTop;
	if (topToBottom > 0) return -topToBottom;
  }
  
  calculateDeltaX(otherClass){
	var thisLeft = this.state.pos.x;
	var thisRight = this.state.pos.x + this.width;
	
	var otherLeft = otherClass.getPosition().x;
	var otherRight = otherClass.getPosition().x + otherClass.getWidth();
	
	var leftToRight = thisLeft - otherRight; 
	var rightToLeft =  otherLeft - thisRight;
	
	if (leftToRight < 0.1 && rightToLeft < 0.1 ){
		return 0;
	}
	if (leftToRight > 0 ) return leftToRight;
	if (rightToLeft > 0) return -rightToLeft;

  }
  
  getTopConnector(){
	var position = {};
	position.x = this.state.pos.x + this.width/2;
	position.y = this.state.pos.y;
	return position;
  }
  
  getBottomConnector(){
	var position = {};
	position.x = this.state.pos.x + this.width/2;
	position.y = this.state.pos.y + this.height;
	return position;
  }
  
  getLeftConnector(){
	var position = {};
	position.x = this.state.pos.x;
	position.y = this.state.pos.y + this.height/2;
	return position;
  }
  
  getRightConnector(){
	var position = {};
	position.x = this.state.pos.x + this.width;
	position.y = this.state.pos.y + this.height/2;
	return position;
  }
  
  getCodeID(){
	return this.state.codeID;
  }
  
   render() {
	   var _this = this; 
      return (
      <g>
	  <rect x="0" y="0" width="250" height="100" stroke="#555" fill="#BBB"></rect><foreignObject width="250" height="50" ><body className="className" >{this.state.name}</body></foreignObject><rect x="0" y="50" width={this.width} height="50" stroke="#555" fill="#FFF"></rect>
	</g>
    );
   }
   
   
}