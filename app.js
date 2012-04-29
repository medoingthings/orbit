// node.js
var fs = require('fs');
var http = require('http');

// npm modules
var express = require('express');
var mongoose = require('mongoose');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// TODO unit
const DEFAULT_DISTANCE = 3000;
const DEFAULT_LIFETIME = HOUR;

const HTTP_OK = 200;
const HTTP_FAIL = 404;

/**************************************
 * Mongoose Schema Definition 
**************************************/

var Schema = mongoose.Schema;
var ItemSchema = new Schema();

ItemSchema.add({
	url			: { type: String, trim: true },
	title		: { type: String, trim: true },
	label		: { type: String, index: true, trim: true, default: '/' },
	timestamp	: { type: Date, default: new Date(new Date().getTime() + 60 * 60 * 1000) },
	/* ! mongoDB demands that location is always {lon, lat} never {lat, lon}*/
	location: {
		lon : Number,
		lat : Number
	}
});
ItemSchema.index({
	location : "2d"
});

var mongoURL = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/orbit';
mongoose.connect(mongoURL, function (err) {
	if (err) {console.log("error in mongo connection"); throw err; }
	console.log("connected to mongo");
});

//save to collection "items"
var Item = mongoose.model('items', ItemSchema);

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

// POST http://orb.it/?lat=x&lon=y&url=...&title=... => 200, 404
app.post('/', function(req, res){
	var item = new Item();
	item.location.lon = parseFloat(req.query["lon"]);
	item.location.lat = parseFloat(req.query["lat"]);
	item.url = req.query["url"];
	item.title = req.query["title"] || '';

	item.save(function(err){
		if(!err){
			console.log('Item saved');
			res.send(HTTP_OK);
		} else {
			res.send(HTTP_FAIL);
		}
    });
});

// GET / 
app.get('/', function(req, res){
	
	// get bookmarklets as json
	// GET http://orbit2.herokuapp.com/?lat=x&lon=y&radius=r
	// Accept: application/json
	// => json, 200
	if (req.accepts("application/json")) {
		
		console.log(req);
		if (req.query["lon"] !== null && req.query["lat"] !== null) {
			var label = req.route.path || '/';
			var lon = parseFloat(req.query["lon"]) || 0;
			var lat = parseFloat(req.query["lat"]) || 0;
			var maxDistance = parseFloat(req.query["radius"]) || DEFAULT_DISTANCE;

			Item.find({label: label, location : { $near : [lon, lat], $maxDistance: maxDistance }} , function(err, items){
		        if (err) { 
					console.log("ERR" + err);
					throw err 
				} else {		
					// TODO strip object ids
					res.json(items, 200);
				}
		    });
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

			var item = new Item();
			item.location.lon = parseFloat(req.query["lon"]);
			item.location.lat = parseFloat(req.query["lat"]);
			item.url = req.query["url"];
			item.title = req.query["title"] || '';
			
			item.save(function(err){
				if(!err){
					console.log('Item saved');

					res.render('bookmarklet-success', {
						title: 'Orbit',
						item: item,
						layout: 'layout-bookmarklet'
					});
				} else {
					res.render('bookmarklet-fail', {
						title: 'Orbit',
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