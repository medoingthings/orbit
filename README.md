# Orbit #

Orbit is a tool to store and share URI based on your current location

## Development ##

	brew install mongodb
	git clone git://github.com/zix2c/orbit.git
	npm install vows -g
	cd orbit
	npm install

Involved projects

- [mongoose](https://github.com/LearnBoost/mongoose)
- [express](https://github.com/visionmedia/express)
- [jade](http://jade-lang.com/)
- [MongoDB](http://www.mongodb.org/)

**Heroku**

Install the toolbelt utilities

	brew install git
	sudo gem install foreman
	sudo gem install heroku

Create the instance

	$ heroku login
	Enter your Heroku credentials.
	Email: adam@example.com
	Password:
	heroku create --stack cedar
	Creating stark-fog-398... done, stack is cedar
	http://stark-fog-398.herokuapp.com/ | git@heroku.com:stark-fog-398.git
	Git remote heroku added

Create database

	heroku addons:add mongolab:starter

Deploy and run

	git push heroku master
	heroku ps:scale web=1

Check the process

	heroku ps
	heroku logs

### Layout ###

The database layout is very simple. (For now) we only need one collection. Examplary `save()`

	db.bookmarks.save(
		{
			url: "http://hackathon.advance-conference.com/",
			title: "Advance Hackathon",
			label: "/",
			location : { lon : 6.98668, lat: 50.94926 },
			created: "2012-04-29T14:15Z",
			expires: "2012-04-29T16:15Z"
		}
	);

- `url` the url we want to share
- `title` title of the homepage
- `label` for categorizing and searching/sorting
- `location` where do we share the bookmark
- `created` [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) encoded timestamp when bookmark was created
- `expires` ISO 8601 encoded timestamp when the entry is purged from database

### Indices ###

Speedup searching for a `label`

	db.orbit.ensureIndex({ label : 1 })

MongoDB supports spatial Indexing

**Caveats**

1. MongoDB 1.8+ supports spherical geometries.
2. MongoDB assumes that you are using decimal degrees in (longitude, latitude) order. This is the same order used for the [GeoJSON](http://geojson.org/geojson-spec.html#positions) spec.
3. All distances use [radians](http://en.wikipedia.org/wiki/Radians).
4.MongoDB doesn't handle wrapping at the poles or at the transition from -180° to +180° longitude but raises an error.
5.Earth-like bounds are `[-180, 180)`, valid values for latitude are between `-90° and 90°`.

Creating the spatial index

	db.orbit.ensureIndex({ location : "2d" })
	var earthRadius = 6378 // km
	var range = 3000 // km

Searching for a bookmark near a location

	distances = db.runCommand({ geoNear : "points", near : [0, 0], spherical : true, maxDistance : range / earthRadius /* to radians */ }).results

### Scaffolding ###

Start mongodb daemon

	$ mongod run --config /usr/local/Cellar/mongodb/2.0.4-x86_64/mongod.conf

Start mongoDB shell and store an exampe bookmark

	$ mongo
	> db.bookmarks.save(
		{
			url: "http://hackathon.advance-conference.com/",
			title: "Advance Hackathon",
			label: "/",
			location : { lon : 6.98668, lat: 50.94926 },
			created: "2012-04-29T14:15Z",
			expires: "2012-04-29T16:15Z"
		}
	);

### Mongoose ###

Search for *label only*

	ItemModel.find( {label: 'global'} , function(err, docs){ /* code */ });

Search for a *location*

	ItemModel.find({location : { $near : [23, 56], $maxDistance: 30 }} , function(err, docs){ /* code */ });

Seach for a *label and location*

	ItemModel.find({label: 'global', location : { $near : [23, 56], $maxDistance: 30 }} , function(err, docs){ /* code */ });

## API ##

Get bookmarklet and store the location

	GET http://orbit2.herokuapp.com/?bookmarklet=true&lat=x&lon=y&title=...&url=...
	Accept: text/html
	=> html, 200

Show index (user types orbit domain in address bar)

	GET http://orbit2.herokuapp.com/
	Accept: text/html
	=> html, 200

Get bookmarks at given lat,lon in circle of radius r

	GET http://orbit2.herokuapp.com/?lat=x&lon=y&radius=r
	Accept: application/json
	=> json, 200