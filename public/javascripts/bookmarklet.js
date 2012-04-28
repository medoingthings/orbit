(function(){

	// inject CSS file
	var s = document.createElement('link');
	s.setAttribute('href','http://localhost/stylesheets/bookmarklet.css');
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

			// Geolocation herausfinden, sofern möglich
			function success(position) {
				var radius = 1; // km
				var lifetime = 60; // minutes


				var mapCanvas = '<iframe src="http://localhost/maps.php?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude + '" style="width:500px; height:500px;" />';
				//var infos     = '<div>Du bist hier: ' + position.coords.latitude + ', ' + position.coords.longitude + ', accuracy=' + position.coords.accuracy + ' dass ist deine URL: ' + window.location + '</div>';
				var infos     = '<div id="orbit-bookmarklet"><div class="orbit-site"><iframe src="http://localhost/maps.php?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude + '"></iframe><h2 class="title">' + document.title + '</h2><p class="label">Whoopie <a href="#edit" class="edit">edit</a></p></div><div class="orbit-message"><h3>This website orbits around your location, now.</h3><p>It can be seen from people within a radius of  <span id="orbit-radius"><b>' + radius + '</b> km</span><br />for the next <span id="orbit-lifetime">' + lifetime + ' minutes</span>.</p></div><a id="orbit-close"><span>Close</span></a></div>';
				$("body").prepend(infos);

				$("#orbit-close").click(function() {
					$("#orbit-bookmarklet").remove();
				});


				var dx = 0;
				var dragStart;
				var dragRadius = $("#orbit-radius");
				var dragging = false;
				var startMove = function() {
					dragStart = event.pageX + dx;
					event.preventDefault();
					dragging = true;
				};

				var whileMove = function () {
					if (dragging === true) {
						dx = (event.pageX - dragStart) / 10;
						dx = Math.round(dx*10)/10;
						if (dx >= 0) {
							dragRadius.children("b").html(dx);
						}
					}
				};

				var endMove = function () {
					dragging = false;
					// Parameter an den Server schicken
				};



				// Bind the drag / touch events
				if (Modernizr.touch) {
					dragRadius
						.bind("touchstart", startMove)
						.bind("touchmove", whileMove)
						.bind("touchend", endMove);
				} else {
					dragRadius
						.bind("mousedown", startMove);
					$("body")
						.bind("mousemove", whileMove)
						.bind("mouseup", endMove);
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

		})();
	}
})();
