<?
  $lat  = $_GET['latitude'];
  $long = $_GET['longitude'];
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
<title>Show Google Maps</title>
<style type="text/css">
  * {
    margin: 0;
    padding: 0;
    border: none;
  }
</style>
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
<script type="text/javascript">
          var thisLocation  = new google.maps.LatLng(<? echo $lat; ?>, <? echo $long; ?>);
          var marker;
          var map;

          function initialize() {
            var mapOptions = {
              zoom: 13,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              center: thisLocation,
              disableDefaultUI: true
            };

            map = new google.maps.Map(document.getElementById("map_canvas"),
              mapOptions);
              
            marker = new google.maps.Marker({
              map:map,
              draggable:true,
              animation: google.maps.Animation.DROP,
              position: thisLocation
            });
            google.maps.event.addListener(marker, 'click', toggleBounce);


            // Kreis malen
            var cityCircle;
            var populationOptions = {
              strokeColor: "#20b4c5",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#20b4c5",
              fillOpacity: 0.35,
              map: map,
              center: thisLocation,
              radius: 1000
            };
            cityCircle = new google.maps.Circle(populationOptions);
          }

          function toggleBounce() {

            if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
            }
          }
</script>
</head>
<body onload="initialize()">
<div id="map_canvas" style="width: 500px; height: 500px;">map div</div>
</body>
</html>
