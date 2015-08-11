var geocoder = new google.maps.Geocoder();
var heatmap, map;
var liveTweets = new google.maps.MVCArray();
 
function updateTerm(q) {

  if ($("#q").val() === ""){
    return false;
  }
  $.ajax({
      url : "/query",
      type: "POST",
      data: JSON.stringify({q: $("#q").val()}),
      contentType: "application/json; charset=utf-8",
      dataType   : "json",
      success    : function(){
          console.log("Pure jQuery Pure JS object");
      }
  });
    $("#q").attr("disabled", true);
	setTimeout(function(){
		$("#q").attr("disabled", false);
	}, 10000)
 
}
function codeAddress(data) {
  var res, address = data["user"].location;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //Add tweet to the heat map array.
      console.log("info window")

      var tweetLocation = new google.maps.LatLng(results[0].geometry.location.G,results[0].geometry.location.K);
      liveTweets.push(tweetLocation);
      var contentString = '<div id="content">'+
      '<img src="'+data['user']['profile_image_url']+'">' + 
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">' + data['user']['name'] + '</h1>'+
      '<div id="bodyContent">'+
      '<p>' +  data["text"] + '</p>'+
      '</div>'+
      '</div>';
     var infowindow = new google.maps.InfoWindow({
          content: contentString
      });

      //Flash a dot onto the map quickly
      var image = "css/small-dot-icon.png";
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });
      setTimeout(function(){
        //marker.setMap(null);
      },600); 
    }
    return address; 
  });
}

function initialize() {
  //Setup Google Map
  var myLatlng = new google.maps.LatLng(17.7850,-12.4183);
  var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
  var myOptions = {
    zoom: 2,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    }
 };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  //Setup heat map and link to Twitter array we will append data to
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });
  heatmap.setMap(map);
  if(io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect('/');

    socket.on('twitter-place', function (data) {


      //Add tweet to the heat map array.
      codeAddress(data);

    });

    // This listens on the "twitter-steam" channel and data is 
    // received everytime a new tweet is receieved.
    socket.on('twitter-stream', function (data) {

      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lng,data.lat);
      liveTweets.push(tweetLocation);

      //Flash a dot onto the map quickly
      var image = "css/small-dot-icon.png";
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image
      });

    });

    // Listens for a success response from the server to 
    // say the connection was successful.
    socket.on("connected", function(r) {

      //Now that we are connected to the server let's tell 
      //the server we are ready to start receiving tweets.
      socket.emit("start tweets");
    });
  }
}