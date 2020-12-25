//its a onload event which get triggered at the begining of web page
window.onload=function(){
    // initate the local varibles for the x and y and draw
    let user_marking = false;
    let horizontal = 0;
    let vertical = 0;
    const draw_frame = document.getElementById('white_board');
    var content = draw_frame.getContext('2d');
    /*trigger when there is a mouse movements or events*/
    window.addEventListener('mouseup', e => {
        /* Drawing ends */
        if (user_marking === true) {
            getsketch(content, horizontal, vertical, e.offsetX, e.offsetY);
            horizontal = 0;
            vertical = 0;
            user_marking = false;
        }
    });
    draw_frame.addEventListener('mousemove', e => {
        /* Drawing continues */
        if (user_marking === true) {
            getsketch(content, horizontal, vertical, e.offsetX, e.offsetY);
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
    socket.on('reload_changes',function(data){
        let {horizontal1,vertical1,horizontal2,vertical2,color} = JSON.parse(data);
        getsketch(content,horizontal1,vertical1,horizontal2,vertical2,color,true);
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
    
    document.getElementById("clearboard").addEventListener("click", function() {
        clearboard();
        socket.emit('clear_board','name');
    });
    socket.on('clearboard',function(){
        console.log("Called clear_board");  
        clearboard();
    });
    function clearboard(){
        content.clearRect(0, 0, draw_frame.width, draw_frame.height);
        console.log("Called clear text");      
    }
    socket.on('listUser',function(data){
        var userlist = "";
       data.forEach(element => {
        userlist +="<li>"+element.name+"</li>";
       });
       console.log("render User List here");

       document.getElementById("userList").innerHTML = "<ul>"+userlist+"</ul>";
    });
    /* draws the in theFunction to Draw line from (x1,y1) to (x2,y2) */
    function getsketch(content, horizontal1, vertical1, horizontal2, vertical2,color = defualt_color,from_server = false) {
    /* Send updates to server (not re-emiting those received from server) */
    if(!from_server)
        socket.emit('reload_changes',JSON.stringify({horizontal1,vertical1,horizontal2,vertical2,color}));
        /* Draw line with color, stroke etc.. */
        content.beginPath();
        content.strokeStyle = color;
        content.lineWidth = 2;
        content.lineCap = 'round'
        content.moveTo(horizontal1, vertical1);
        content.lineTo(horizontal2, vertical2);
        content.stroke();
        content.closePath();
    }
}
let defualt_color = 'red';
function pick_color(color){
    document.getElementsByClassName(defualt_color)[0].classList.remove('selected');
    document.getElementsByClassName(color)[0].classList.add('selected');    
    defualt_color = color;
}
document.getElementById('btn-download').addEventListener("click", function(e) {
    var white_board_canvas = document.querySelector('#white_board');
    var canvasdata_image = white_board_canvas.toDataURL("image/jpeg", 1.0);
    get_canvas_downloadImage(canvasdata_image, 'wb-image.jpeg');
});
function get_canvas_downloadImage(data, filename = 'wb-image.jpeg') {
    var download_image = document.createElement('a');
    download_image.href = data;
    download_image.download = filename;
    document.body.appendChild(download_image);
    download_image.click();
}






