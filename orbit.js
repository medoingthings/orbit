var http = require('http');
var express = require('express');
var mongoose = require('mongoose');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// TODO unit
const DEFAULT_DISTANCE = 30;
const DEFAULT_LIFETIME = HOUR

/**************************************
 * Mongoose Schema Definition 
**************************************/

var Schema = mongoose.Schema;
var ItemSchema = new Schema();

ItemSchema.add({
	url			: { type: String, trim: true },
	title		: { type: String, trim: true },
	label		: { type: String, index: true, trim: true },
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

// POST
app.post('/', function(req, res){ 
	
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
});


// GET
app.get('/', function(req, res){
	
	var label = req.route.path || '/';
	var lon = parseFloat(req.query["lon"]);
	var lat = parseFloat(req.query["lat"]);
	var maxDistance = parseFloat(req.query["distance"]) || DEFAULT_DISTANCE;

	var items = [];
	Item.find({label: label, location : { $near : [lon, lat], $maxDistance: maxDistance }} , function(err, items){
        if (err) { throw err };
		
		if (req.is("application/json")) {
			// TODO strip object ids
			res.json(items, 200);
		} 
		
		else if (req.accepts("text/html")) {
			res.render('index', {
				title: 'Orbit',
				items: items,
				layout: 'layout-default'
			});
		}
    });
	
});

var port = process.env.PORT || 3000;
app.listen(port);