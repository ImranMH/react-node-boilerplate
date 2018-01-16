import React, { Component } from "react";
import axios from "axios";



class UserList extends Component {
  state = {
    users: []
  };

  handleClick = ()=> {
    console.log('obj');
    axios.get('/user/feed/whotofollow').then((res)=> console.log(res))
        
  }
  componentDidMount() {
  	
  }
  render() {


    return (
      <div className="UserList">
        <div className="ui text container">
  				this is userlist
          <button onClick={this.handleClick}> click me  </button>
        </div>
      </div>
    );
  }
}

export default UserList;