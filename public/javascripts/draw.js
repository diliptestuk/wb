//its a onload event which get triggered at the begining of web page
window.onload=function(){
    // initate the local varibles for the x and y and draw
    let user_marking = false;
    let horizontal = 0;
    let vertical = 0;
    const draw_frame = document.getElementById('sheet');
    var content = draw_frame.getContext('2d');
    /*trigger when there is a mouse movements or events*/
    window.addEventListener('mouseup', e => {
        /* Drawing ends */
        if (user_marking === true) {
            drawLine(content, horizontal, vertical, e.offsetX, e.offsetY);
            horizontal = 0;
            vertical = 0;
            user_marking = false;
        }
    });
    draw_frame.addEventListener('mousemove', e => {
        /* Drawing continues */
        if (user_marking === true) {
            drawLine(content, horizontal, vertical, e.offsetX, e.offsetY);
            horizontal = e.offsetX;
            vertical = e.offsetY;
        }
    });
    draw_frame.addEventListener('mousedown', e => {
        /* Drawing begins */
        horizontal = e.offsetX;
        vertical = e.offsetY;
        user_marking = true;
    });
    
    var socket = io();
    /*This socket receives the response from server and and will update*/
    socket.on('update_canvas',function(data){
        let {horizontal1,vertical1,horizontal2,vertical2,color} = JSON.parse(data);
        drawLine(content,horizontal1,vertical1,horizontal2,vertical2,color,true);
    });

     function getName() {
        var url_string  =  location.href;
        var url = new URL(url_string);   
        var name = url.searchParams.get("user_name");
        if(!name) name = "Unknown";
        console.log(name);
        socket.emit('user_name',name);
     }
    setTimeout(getName(),1000);  
      

    socket.on('listUser',function(data){
        var userlist = "";
       data.forEach(element => {
        userlist +="<li>"+element.name+"</li>";
       });
       console.log("render User List here");

       document.getElementById("userList").innerHTML = "<ul>"+userlist+"</ul>";
    });
    

    /* draws the in theFunction to Draw line from (x1,y1) to (x2,y2) */
    function drawLine(content, horizontal1, vertical1, horizontal2, vertical2,color = selected_color,from_server = false) {

        /* Send updates to server (not re-emiting those received from server) */
        if(!from_server)
            socket.emit('update_canvas',JSON.stringify({horizontal1,vertical1,horizontal2,vertical2,color}));
        
        /* Draw line with color, stroke etc.. */
        content.beginPath();
        content.strokeStyle = color;
        content.lineWidth = 5;
        content.lineCap = 'round'
        content.moveTo(horizontal1, vertical1);
        content.lineTo(horizontal2, vertical2);
        content.stroke();
        content.closePath();
        }

}

/* helper function to change selected_color
   triggered onclick buttons below canvas
   'red','green','blue'
 */
let selected_color = 'red';
function selectColor(color){
    document.getElementsByClassName(selected_color)[0].classList.remove('selected');
    document.getElementsByClassName(color)[0].classList.add('selected');    
    selected_color = color;
}

// Convert canvas to image
document.getElementById('btn-download').addEventListener("click", function(e) {
    var canvas = document.querySelector('#sheet');

    var dataURL = canvas.toDataURL("image/jpeg", 1.0);

    downloadImage(dataURL, 'wb-image.jpeg');
});

// Save | Download image
function downloadImage(data, filename = 'untitled.jpeg') {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}
