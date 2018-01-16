import React, { Component } from 'react';
import axios from "axios";

const PostList = ({list})=>{
  const posts = list.map((post)=>{
    return (
      <li key={post._id}>
        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <div>{post.type}</div>
      </li>
    )
  })
  return (
   <ul> 
      {posts}
    </ul>
  )

} 
class Post extends Component {
  state = {
    posts: []
  };

  handleClick = ()=> {
    
    axios.get('/weblink/all').then((res)=> this.setState({posts: res.data.weblink}))
        
  }
  componentDidMount() {
    //this.handleClick()
    axios.get('/weblink/all').then((res)=>{ 
      const data =res.data.weblink
      this.setState({posts:data})
      console.log(this.posts);
     })
    
  }
  render() {
    return (
      <div className="Post">
        <header className="Post-header">
         
          <h1 className="Post-title">Welcome to Post Page</h1>
          <PostList list={this.state.posts} />
        </header>
        
      </div>
    );
  }
}

export default Post;