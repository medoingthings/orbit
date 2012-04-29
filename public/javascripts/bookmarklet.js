(function(){

	// inject CSS file
	var s = document.createElement('link');
	s.setAttribute('href','http://orbit2.herokuapp.com/stylesheets/bookmarklet.css');
	s.setAttribute('rel','stylesheet');
	s.setAttribute('type','text/css');
	document.getElementsByTagName('head')[0].appendChild(s);

	// the minimum version of jQuery we want
	var v = "1.3.2";

	// check prior inclusion and version
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false;
		var script = document.createElement("script");
		script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				orbitThisPage();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		orbitThisPage();
	}

	function orbitThisPage() {
		(window.myBookmarklet = function() {

			// we have a location, let's do something with it
			function success(position) {

				// variables for drag events
				var dx = 0;
				var dragStart;
				var dragRadius = $("#orbit-radius");
				var radius = 1000; // meter
				var dragLifetime = $("#orbit-lifetime");
				var lifetime = 60; // minutes

				// location variables
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;
				//document variable
				var documentTitle = document.title;
				var documentUrl = document.location;


				// send data to the server
				$.ajax({
					type: "POST",
					url: "http://orbit2.herokuapp.com/?lat=" + lat + "&lon=" + lon + "&title=" + documentTitle + "&url=" + documentUrl,
					success: function(data, textStatus){

					}
				});


				// add location infos to the layer
				var locationInfos = '<div class="orbit-site"><iframe src="http://orbit2.herokuapp.com/?bookmarklet=true&lat=' + lat + '&lon=' + lon + '"></iframe><h2 class="title">' + documentTitle + '</h2><p class="label">Whoopie <a href="#edit" class="edit">edit</a></p></div><div class="orbit-message"><h3>This website orbits around your location, now.</h3><p>It can be seen from people within a radius of  <span id="orbit-radius"><b>' + radius + '</b> m</span><br />for the next <span id="orbit-lifetime"><b>' + lifetime + '</b> minutes</span>.</p></div><a id="orbit-close"><span>Close</span></a>';
				$("#orbit-bookmarklet").html(locationInfos);

				// close on click
				$("#orbit-close").click(function() {
					$("#orbit-bookmarklet").remove();
				});


				// drag to change values
				var startMove = function() {
					dragStart = event.pageX;
					event.preventDefault();
					$("body").bind("mousemove", whileMove);
				};

				var whileMove = function () {
						dx = ((event.pageX - dragStart) + radius);

						if (dx >= 0) {
							dragRadius.children("b").html(dx);
						}
				};

				var endMove = function () {
					radius = dx;
					$("body").unbind("mousemove");
					// Parameter an den Server schicken
				};



				// Bind the drag / touch events
				if (Modernizr.touch) {
					dragRadius
						.bind("touchstart", startMove)
						.bind("touchmove", whileMove)
						.bind("touchend", endMove);
				} else {
					dragRadius.bind("mousedown", startMove);
					dragLifetime.bind("mousedown", startMove);
					$("body").bind("mouseup", endMove);
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

				var bookmarkletWrapper     = '<div id="orbit-bookmarklet"><h2>Receiving your location...</h2></div>';

				$("body").prepend(bookmarkletWrapper);

		})();
	}
})();
