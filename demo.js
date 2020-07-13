import React from 'react';

function Test() {

  return (<span>test</span>);
}

function buttonClicked() {
    alert('clicked');
    this.setState({
        name:'vamsi'
    })
}

class DemoComponent extends React.Component{
    constructor(props){
        super(props);
        this.state={name:'hari',griddata:[]};
        //super();
    }

    componentDidMount(){
        axios.get('url').then(x=>{
  this.setState({
      giddata:x
  })
        }
    }
    render(){
        return(
            <div className="test">
                <span>{this.props.name}</span>
<span>test component</span>
<button type="submit" onClick={buttonClicked.bind(this)}>click</button>
<span>{this.state.name}</span>
<Test/>
            </div>
            
        )
    }
}

export default DemoComponent;