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
            "circle-color": "teal"
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
            "circle-color": "orange"
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
map.on('style.load', function () {
    map.addSource('route', routeSource);
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": "route",
        "paint": {
            "line-opacity": 0.5,
            "line-color": "magenta",
            "line-width": 3
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
