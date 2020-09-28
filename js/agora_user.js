/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
var not_accepting = true;
var stopInterval;

let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");
let canvasContainer =document.getElementById("canvas-container");

var delta=0;
var price=0;
/**

 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){

    $.post(start_call_url,
    {
        "call_id" : getCookie("call_id")
    },
    function(data, status){
        alert("Call Started");
        var doctorRate=parseFloat(getCookie("doctor_rate"));
        var wallet=parseFloat(getCookie("wallet"))
        var allowedSeconds= Math.floor(wallet/doctorRate)*60
        console.log(allowedSeconds);
        var start = Date.now();
        stopInterval=setInterval(function() {
            delta = Date.now() - start; // milliseconds elapsed since start
            delta=(Math.floor(delta / 1000)); // in seconds
            // alternatively just show wall clock time:
            console.log(delta)
            if(allowedSeconds<=delta)
            {
              price=delta*getCookie("doctor_rate")
              end_call();
              //stop here
            }

        }, 1000);

    });
    not_accepting = false;
    document.getElementById("calling_audio").pause();
    document.getElementById("calling_line").style.display = "none";
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}

function end_call (){

    clearInterval(stopInterval)
    let rate=(getCookie("doctor_rate")/60.0)
    price=rate*delta
    price=Math.floor(price);
    $.post(deduct_add_money,{
      "user_phone":getCookie("user_phone_call"),
      "doctor_phone":getCookie("doctor_phone_call"),
      "price":price,
    },function(data,status){
      alert(data["message"])
    })
    $.post(end_call_url,
    {
        "call_id" : getCookie("call_id")
    },
    function(data, status){
        alert("Call Ended.");
    });
}

/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {

    end_call();

    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
    document.getElementById("ending_audio").play();
    alert("Hope it did help. Please fill the feedback.");
    window.location = "counsellor_feedback.html";
}

function addCanvas(streamId){
    let canvas=document.createElement("canvas");
    canvas.id='canvas'+streamId;
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    let video=document.getElementById(`video${streamId}`);

    video.addEventListener('loadedmetadata', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    video.addEventListener('play', function() {
        var $this = this; //cache
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        })();
    }, 0);
}

// Client Setup
// Defines a client for RTC
let client = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});

// Client Setup
// Defines a client for Real Time Communication
client.init("91c83a27c5a041f39ae242a3041f9e7e",() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
channel_name = "call_"+getCookie("user_phone_call")+"_"+getCookie("doctor_phone_call")+"_"+getCookie("call_id");

client.join(null,channel_name,null, (uid)=>{

    // Stream object associated with your web cam is initialized
    var localStream;
    if(getCookie("call_type") == "audio") {
        localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: false,
            screen: false
        });
    } else {
        localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false
        });
    }

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);
//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});
//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    addVideoStream(stream.getId());
    stream.play(stream.getId());
    addCanvas(stream.getId());
});
//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);

var delay = 180000;
setTimeout(function(){
    if(not_accepting == true){
        console.log("Ending");
        document.getElementById("calling_audio").pause();
        document.getElementById("ending_audio").play();

        $.post(missed_call_url,
        {
            "call_id" : getCookie("call_id")
        },
        function(data, status){
            alert("We apologize for that. Please try another counsellor.");
            window.location = "counsellor.html";
        });
    }
 }, delay);


function removeVideoStream_my () {

    end_call();

    document.getElementById("ending_audio").play();
    alert("Hope it did help. Please fill the feedback.");
    window.location = "counsellor_feedback.html";
}


$("#end_call_btn").click(function(){
    // removeVideoStream_my();
    console.log("Ending");
    document.getElementById("calling_audio").pause();
    document.getElementById("ending_audio").play();

    $.post(missed_call_url,
    {
        "call_id" : getCookie("call_id")
    },
    function(data, status){
      if(delta==0)
      {
        alert("We apologize for that. Please try another counsellor.");
        window.location = "dashboard.html";
      }
      else
      {
        end_call();
        window.location="counsellor_feedback.html"
      }

    });
});
