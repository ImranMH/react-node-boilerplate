import React, { Component } from 'react';
import  { Link,Route } from 'react-router-dom';

import './App.css';
import Create from './component/create.js';
import UserList from './component/userlist.js';
import Post from './component/post.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src= "logo.png" className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React nodejs startup</h1>
          <nav>
            <ul className="mainnav">
              <li>
                <Link exact="true" to = "user" > User </Link>
              </li>
              <li>
                <Link to = "post" >  Post </Link>
              </li>
              <li>
                <Link to = "new"> New Post </Link>
              </li>
            </ul>
          </nav>
        </header>
        <div>
          <Route path="/user" component={UserList}/>
          <Route path="/post" component={Post}/>
          <Route path="/new" component={Create}/>
        </div>
        <footer>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </footer>
        
      </div>
    );
  }
}

export default App;
