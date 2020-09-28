document.addEventListener("backbutton", function(e){
  navigator.notification.confirm(
   'Do you really want to quit application!',  // message
   onConfirm,              // callback to invoke with index of button pressed
   'Exit',            // title
   'Yes,No'          // buttonLabels
 );
 function onConfirm(index){

   if(index==1)
   {
     navigator.app.exitApp();
   }
 }
}, false);

$('#wallet').on("click",function(){
  window.location="doctor_wallet.html"
})
$('#doctopad').on("click",function(){
  window.location="docktopad.html"
})
$('#counselling').on("click",function(){
  window.location="counselling_history_doctor.html"
})
$('#upload').on("click",function(){
  window.location="upload.html"
})
$('#profile_doctor').on("click",function(){
  window.location="profile_doctor.html"
})
$('#patient_wallet').on("click",function(){
  if(getCookie("phone_no")=="")
  {
    alert("Please Sign up first");
    window.location="patient_login.html"
  }
  else
    window.location="patient_wallet.html"
})
$('#library').on("click",function(){
  window.location="library.html"
})
$('#dashboard').on("click",function(){
  window.location="dashboard.html"
})
$('#history').on("click",function(){
  if(getCookie("phone_no")=="")
  {
    alert("Please Sign up first");
    window.location="patient_login.html"
  }
  else
  window.location="history.html"
})
$('#patient_profile').on("click",function(){
  window.location="patient_profile.html"
})
