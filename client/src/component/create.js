import React, { Component } from 'react';

class Create extends Component {
  render() {
    return (
      <div className="Create">
        <header className="Create-header">
         
          <h1 className="Create-title">Welcome to Create Page</h1>
        </header>
        <div>
          <h2>create new post </h2>
          <form>
            <label>Title <input type = "text" /> </label>
            <label>Url <input type = "text" /> </label>
            <label>Description <input type = "text" /> </label>
            <label>type <input type = "text" /> </label>
            <button type="submit"> Add </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Create;