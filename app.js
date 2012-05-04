// node.js
var fs = require('fs');
var http = require('http');

// npm modules
var express = require('express');
var mongoose = require('mongoose');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const EARTH_RADIUS = 6378000; 	// in m
const DEFAULT_DISTANCE = 1000; 	// in m
const DEFAULT_UNIT = "m"
const DEFAULT_LIFETIME = HOUR;

const HTTP_OK = 200;
const HTTP_FAIL = 404;

/**************************************
 * Mongoose Schema Definition 
**************************************/

var Schema = mongoose.Schema;
var BookmarkSchema = new Schema();

BookmarkSchema.add({
	url			: { type: String, trim: true },
	title		: { type: String, trim: true },
	label		: { type: String, index: true, trim: true, default: '/' },
	created		: { type: Date, default: Date.now() },
	expires		: { type: Date, default: new Date(new Date().getTime() + 60 * 60 * 1000) },
	/* ! mongoDB demands that location is always {lon, lat} never {lat, lon}*/
	location: {
		lon : Number,
		lat : Number
	}
});
BookmarkSchema.index({
	location : "2d"
});

var mongoURL = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/orbit';
mongoose.connect(mongoURL, function (err) {
	if (err) {console.log("error in mongo connection"); throw err; }
	console.log("connected to mongo");
});

//save to collection "bookmarks"
var Bookmark = mongoose.model('bookmarks', BookmarkSchema);

/*************************************/
/* Express
/*************************************/

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// GET / 
app.get('/', function(req, res){
	
	// get bookmarklets as json
	// GET http://orbit2.herokuapp.com/?lat=x&lon=y&radius=r
	// Accept: application/json
	// => json, 200
	if (req.accepts("application/json")) {

		if (req.query["lon"] !== null && req.query["lat"] !== null) {
			var label = req.route.path || '/';
			var lon = parseFloat(req.query["lon"]) || 0;
			var lat = parseFloat(req.query["lat"]) || 0;
			var maxDistance = parseFloat(req.query["radius"]) || DEFAULT_DISTANCE;

			// http://betterexplained.com/articles/intuitive-guide-to-angles-degrees-and-radians
			// Radian = (distance traveled) / (radius)
			var radiansDistance = maxDistance / EARTH_RADIUS;

			//MongoDB needs to use decimal degrees in order of (longitude, latitude)
			mongoose.connection.db.executeDbCommand(
				{
					geoNear	 : "bookmarks", 
					near : [lon,lat], 
					spherical : true,
					distanceMultiplier: EARTH_RADIUS,
					maxDistance :  radiansDistance
				}, function(err, result) { 
					var rawResults = result.documents[0].results;
					var results = [];
					for (var i = 0; i < rawResults.length; i++) {
						results[i] = rawResults[i].obj;
						results[i].distance = rawResults[i].dis.toPrecision(2);
						results[i].unit = DEFAULT_UNIT;
					}
					res.json(results, 200);
				}
			);

		} else {
			res.json([], 404);
		}
	}
	
	else if (req.accepts("text/html")) {
		
		// render bookmarklet
		// GET http://orbit2.herokuapp.com/?bookmarklet=true&lat=x&lon=y&radius=r
		// Accept: text/html
		// => HTML, 200
		if (req.query["bookmarklet"]) {

			var bookmark = new Bookmark();
			bookmark.location.lon = parseFloat(req.query["lon"]);
			bookmark.location.lat = parseFloat(req.query["lat"]);
			bookmark.url = req.query["url"];
			bookmark.title = req.query["title"] || '';
			
			bookmark.save(function(err){
				if(!err){
					console.log('Bookmark saved');

					res.render('bookmarklet-success', {
						title: 'Orbit',
						bookmark: bookmark,
						layout: 'layout-bookmarklet'
					});
				}
		    });
		} 
		
		else {
			// render index
			// GET http://orbit2.herokuapp.com/
			// Accept: text/html
			// => HTML, 200
			console.log('render index');
			var indexTemplate = fs.readFileSync(__dirname + '/public/index.html', 'utf8');
			res.send(indexTemplate);
		}
	}
	
});

var port = process.env.PORT || 3000;
app.listen(port);