(function(){

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
				var mapCanvas = '<iframe src="http://localhost/maps.php?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude + '" style="width:500px; height:500px;" />';
				var infos     = '<div>Du bist hier: ' + position.coords.latitude + ', ' + position.coords.longitude + ', accuracy=' + position.coords.accuracy + ' dass ist deine URL: ' + window.location + '</div>';
				$("body").prepend(mapCanvas).prepend(infos);
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
