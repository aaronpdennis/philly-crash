'use strict';

var turf = require('turf'),
    cover = require('tile-cover'),
    vtGeoJson = require('vt-geojson');

module.exports = TrafficRoute;

function TrafficRoute(directionsObject, routeChoice) {

  this.summary = directionsObject.routes[routeChoice].summary;
  this.distance = directionsObject.routes[routeChoice].distance; // length of route in meters

  var progress = 0,
      status = 'empty',
      collisions = {
        'type': 'FeatureCollection',
        'features': []
      };

  this.progress = progress;
  this.status = status;
  this.collisions = collisions;

  this.getCollisions = function(cb) {

    status = 'processing';

    var route = turf.linestring(directionsObject.routes[routeChoice].geometry.coordinates);

    var startPoint = turf.point(route.geometry.coordinates[0]);

    var routeBuffer = turf.buffer(route, 8, 'meters');

    var limits = { min_zoom: 16, max_zoom: 17 };

    var tiles = cover.tiles(routeBuffer.features[0].geometry, limits);

    var source = 'tilejson+http://api.tiles.mapbox.com/v4/aarondennis.7i147a82.json?access_token=pk.eyJ1IjoiYWFyb25kZW5uaXMiLCJhIjoiem5LLURoYyJ9.T3tswGTI5ve8_wE-a02cMw'

    vtGeoJson(source, { tiles: tiles })
      .on('data', function(collision) {

        if (turf.inside(collision, routeBuffer.features[0])) {

          var collisionPointOnRoute = turf.pointOnLine(route, collision);
          var routeToCollision = turf.lineSlice(startPoint, collisionPointOnRoute, route);
          var distanceToCollision = turf.lineDistance(routeToCollision, 'kilometers') * 1000;

          collision.properties.distanceFromRouteOrigin = distanceToCollision;

          collisions.features.push(collision);
          progress++;
        };

      })
      .on('end', function () {

        status = 'finished';
        cb();

      });

  }

}
