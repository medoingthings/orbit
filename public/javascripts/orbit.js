var lon;
var lat;

// Geolocation herausfinden, sofern möglich
function success(position) {
	lon = position.coords.longitude;
	lat = position.coords.latitude;

	// =================================================
	var thisLocation = new google.maps.LatLng(lat, lon);
	// Todo, noch weiter nach recht verschieben
	var thisViewport = new google.maps.LatLng(lat, lon);
	var marker;
	var map;

	function initialize() {
		var mapOptions = {
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: thisViewport,
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

		// paint circle around currentLocation
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
	initialize();

	// function that paints marker to the map
	function paintMarker(lat, lon) {
		// paint marker for this item
		new google.maps.Marker({
			position: new google.maps.LatLng(lat, lon),
			map: map,
			title:"Hello World!"
		});
	}

	// pull data from server
	$.ajax({
		headers: {
			Accept : "application/json; charset=utf-8",
					"Content-Type": "application/json; charset=utf-8"
		},
		type: "GET",
		url: "http://orbit2.herokuapp.com/?lat=" + lat + "&lon=" + lon,
		success: function(data){
			$.each (data, function (i, bookmark) {
				if (bookmark.url) {
					$('#bookmarks').append(
						$('<li>').append(
							$('<a class="mapMarker">')
								.attr('href',bookmark.url)
								.attr('data-lat',bookmark.location.lat)
								.attr('data-lon',bookmark.location.lon)
								.append('<abbr title="' + bookmark.created + '">' + bookmark.created + '</abbr> ')
								.mouseover(function() {
									map.setCenter(new google.maps.LatLng(bookmark.location.lat, bookmark.location.lon ) );
								})
						)
					);
					paintMarker(bookmark.location.lat, bookmark.location.lon);
				}
			});
		}
	});

	function toggleBounce() {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	}
}

// Was passiert, wenn fehlgeschlagen
function error() {
	alert("error");
}

// Herausfinden ob Geolocation unterstützt wird
if (navigator.geolocation) {
	// success() aufrufen wenn ja
	navigator.geolocation.getCurrentPosition(success, error);
	} else {
	alert("Not Supported!");
	}
