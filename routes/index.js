module.exports = function(io){
  var express = require('express');
  var router = express.Router();
  /* store history of updates to redraw for new users */
  var history = [];
  var userList = [];
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Collaborative Drawing Tool' });
  });

  /* Socket.io listeners */
  io.on('connection', (socket)=>{
    /* New user connected  */
    console.log('A user connected');
    console.log(userList);
    socket.emit('listUser',userList);
    /* draw all old updates to this user's canvas */
    console.log('Syncing new user"s canvas from history')
    for(let item of history)
      socket.emit('reload_changes',item);
    /* Recieving updates from user */
    socket.on('reload_changes',function(data){
      /* store updates */
      history.push(data);
      /* send updates to all sockets except sender */
      socket.broadcast.emit('reload_changes',data);
    });

    socket.on('clear_board',function(){
      console.log("clear_board name called");
      history = [];
      socket.broadcast.emit('clearboard');
    });

    socket.on('user_name',function(name){
      console.log("user_name name called");
      console.log(name);
      const found = userList.find(e=>{
        e.id == socket.id
      })
      if(!found)
        userList.push({id:socket.id, name});
      socket.broadcast.emit('listUser',userList);
    });

    socket.on('disconnect', function(data) {
      console.log(socket.id);    
      userList = userList.filter(function( obj ) {
          return obj.id !== socket.id;
      });
      console.log(userList);
      console.log('Got disconnect!');
   });
  })
  return router;
}