'use strict';
var User = require('../app/models/index.model').user;
module.exports = function(io) {
	
	function socketEvent() {

		io.on('connection',(socket) =>{
			/**
			* get the user's Chat list
			*/
			console.log('socket conncetion really ok');

			socket.on('chat-list', (data)=> {
				let chatListResponse = {};
					console.log('chat list res');
						console.log(data);
				if(data.userId == '') {
					chatListResponse.error = true;
					chatListResponse.message = 'User dose not exist';
					this.io.emit('chat-list-response',chatListResponse)
				} else {
					// userModel.getUserInfo(data.userId, (err, UserInfoResponse) =>{

					// 	delete UserInfoResponse.password;
						
					// 	userModel.getChatList(socket.id, (err,response)=> {

					// 		this.io.to(socket.id).emit('chat-list-response', {
					// 			error: false,
					// 			singleUser: false,
					// 			chatList: response
					// 		});

					// 		socket.broadcast.emit('chat-list-response', {
					// 			error: false,
					// 			singleUser: true,
					// 			chatList: UserInfoResponse
					// 		})
					// 	})
					// })
				}
			});

			socket.on('send-message', (data)=> {
				console.log('on server');
				console.log(data);
				io.emit('message-response', data)
			})
			/**
			* send the messages to the user
			*/
			socket.on('add-message', (data)=> {
				if(data.message === "") {
					io.to(socket.id).emit('add-message-response',`Message cant be empty`)
				} else if(data.fromUserId === "") {
					io.to(socket.id).emit('add-message-response',`unExpect error from user id`)
				}else if(data.toUserId === "") {
					io.to(socket.id).emit('add-message-response',`Select a user to chat`)
				} else {
					let toSocketId = data.toSocketId;
					let fromSocketId = data.fromSocketId;
					delete data.toSocketId;
					data.timestamp = Math.floor(new Date() / 1000);

					// userModel.insertMessages(data, (error, response) =>{
					// 	this.io.to(toSocketId).emit('add-message-response',data)
					// })
				}
			});
			/**
			* Logout the user
			*/
				socket.on('logout', (data)=> {

					const userId = data.userId;

					// userModel.logout(userId, false, (err, result) =>{
					// 	this.io.to(socket.id).emit('logout-response',{
					// 		error: false
					// 	});
					// 	socket.broadcast.emit('chat-list-response',{
					// 		error: false,
					// 		userDisconnected: true,
					// 		socketId: socket.id
					// 	});
					// });
				});

				/**
			* sending the disconnected user to all socket users. 
			*/
			socket.on('disconnect', ()=> {
				socket.broadcast.emit('chat-list-response',{
					error: false,
					userDisconnected: true,
					socketId: socket.id
				});
			})
		});
	}
	function initSocket() {
		//console.log('socket conncetion ok');
		io.use(function( socket, next) {
			
			// const userID = socket.handshake.query['userId'];
			// console.log('userid'+userID);
			// const userSocketId = socket.id;
			// const data = {
			
			// 	value: {					
			// 			socketId:userSocketId,
			// 			online : 'Y'
			// 	},
			// 		id: userID,
			// }

			// console.log(socket.handshake);
			// console.log(data);
			// User.addSocketId(data).then(function(res){
			// 	console.log('after data');
			// 	console.log(res);
			// });
			next()
		})
	
		socketEvent()
	}
	return initSocket()
}


