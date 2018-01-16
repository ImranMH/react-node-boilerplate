import React, { Component } from "react";
import axios from "axios";


const Users = ({list})=>{
  const user = list.map((user)=>{
    return (
      <li key={user._id}>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <div>{user.avater}</div>
      </li>
    )
  })
  return (
   <ul> 
      {user}
    </ul>
  )

} 
class UserList extends Component {
  state = {
    users: []
  };

  handleClick = ()=> {
    console.log('obj');
    axios.get('/user/feed/whotofollow').then((res)=> this.setState({users: res.data}))
        
  }
  componentDidMount() {
    this.handleClick()
  }
  render() {


    return (
      <div className="UserList">
        <div className="ui text container">
           
          <Users list= {this.state.users} />
          <button onClick={this.handleClick}> click me  </button>
        </div>
      </div>
    );
  }
}

export default UserList;