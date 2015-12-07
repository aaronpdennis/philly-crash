// initialize map
mapboxgl.accessToken = 'pk.eyJ1IjoiYmlsbHBsaW0iLCJhIjoiODdkOGZiZGMzODBjNDBmNjBiNjY2Zjg0MTMxMGQ4M2EifQ.ZXZ1yRhsfkieGyK2G2JkpQ';

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/billplim/cigwyr9tx002p9om38c3wnly5', //stylesheet location
  center: [-75.163736, 39.952648],
  zoom: 11.5,
});

// setup some dummy layers
var startSource = new mapboxgl.GeoJSONSource({
    data: {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [
          0,
          0
        ]
      }
    }
});
var endSource = new mapboxgl.GeoJSONSource({
    data: {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [
          0,
          0
        ]
      }
    }
});

map.on('style.load', function () {
    map.addSource('start', startSource);
    map.addLayer({
        "id": "start",
        "type": "circle",
        "source": "start",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#41EAD4"
        }
    });
});

map.on('style.load', function () {
    map.addSource('end', endSource);
    map.addLayer({
        "id": "end",
        "type": "circle",
        "source": "end",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#FF9F1C"
        }
    });
});

var routeSource = new mapboxgl.GeoJSONSource({
    data: {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            0,
            0
          ],
          [
            1,
            1
          ]
        ]
      }
    }
});

var collisionsSource = new mapboxgl.GeoJSONSource({
    data: {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [0, 0]
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [0, 0]
                }
            }]
        }
});

var highlightSource = new mapboxgl.GeoJSONSource({
    data: {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            }
        }
});

map.on('style.load', function () {
    map.addSource('route', routeSource);
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": "route",
        "paint": {
            "line-opacity": 1,
            "line-color": "#fff",
            "line-width": 4
        }
    });
});

var collisionPointLayer = {
  "id": "collisions",
  "type": "circle",
  "source": "collisions",
  "paint": {
    "circle-color": undefined,
    "circle-radius": 4,
    "circle-opacity": 0.85
  },
  "filter": ["==", "MAX_SEVERI", undefined]
}

var color = d3.scale.linear()
      .domain([10,2,1,0])
      .range(['#9ECAE1', '#08519C', '#F71735', '#FFFFFF'])
      .interpolate(d3.interpolateHcl);

map.on('style.load', function() {
  map.addSource('collisions', collisionsSource);
  for (var i = 0; i <= 10; i++) {
    collisionPointLayer["id"] = "severity" + i;
    collisionPointLayer.paint["circle-color"] = color(i);
    collisionPointLayer.filter[2] = i;
    console.log(JSON.parse(JSON.stringify(collisionPointLayer)));
    map.addLayer(JSON.parse(JSON.stringify(collisionPointLayer)));
  }
});

map.on('style.load', function() {
  map.addSource('highlight', highlightSource);
  map.addLayer({
    "id": "highlight",
    "type": "circle",
    "source": "highlight",
    "paint": {
      "circle-color": "yellow",
      "circle-radius": 8
    }
  });
});


// geocoding search fields
createAddressSearch('#routeStartSelection', function(point) {
  changeStartPoint(point);
});

createAddressSearch('#routeEndSelection', function(point) {
  changeEndPoint(point);
});

$('.dropdown').on('change', function() {
  changeFilters();
  phillyCrash.filterCollisions();
})
