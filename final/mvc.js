var phillyCrash = {

  // MODEL
  startPoint: undefined,
  endPoint: undefined,
  route: undefined,
  collisions: undefined,
  filters: ['all','all','all'],
  filteredCollisions: undefined,
  locationFocus: {
    coordinates: [],
    address: []
  },
  collisionFocus: undefined,
  state: 'empty',

  filterCollisions: function() {
    var filters = this.filters;
    this.filteredCollisions = {
      "type": "FeatureCollection",
      features: this.collisions.features.filter(function(d) {
        return includes[filters[0]](d) && includes[filters[1]](d) && includes[filters[2]](d);
      })
    }
    createHistogram(this.filteredCollisions, this.route.routes[0].distance);
    collisionsSource.setData(this.filteredCollisions);

  }

}

var includes = {

  all: function() {
    return true;
  },

  // timeOfDay
  morning: function(feature) {
    if ( feature.properties.TIME_OF_DA >= 500 && feature.properties.TIME_OF_DA < 1100 )
    { return true } else { return false }
  },
  afternoon: function(feature) {
    if ( feature.properties.TIME_OF_DA >= 1100 && feature.properties.TIME_OF_DA < 1500 )
    { return true } else { return false }
  },
  evening: function(feature) {
    if ( feature.properties.TIME_OF_DA >= 1500 && feature.properties.TIME_OF_DA < 2300 )
    { return true } else { return false }
  },
  night: function(feature) {
    if ( ( feature.properties.TIME_OF_DA >= 2300 && feature.properties.TIME_OF_DA < 2400 ) || ( feature.properties.TIME_OF_DA >= 0 && feature.properties.TIME_OF_DA < 500 ) )
    { return true } else { return false }
  },

  // vechicleType
  trucks: function(feature) {
    if ( feature.properties.SMALL_TRUC > 0 || feature.properties.HEAVY_TRUC > 0 || feature.properties.SUV_COUNT > 0 )
    { return true } else { return false }
  },
  cars: function(feature) {
    if ( feature.properties.AUTOMOBILE > 0 || feature.properties.VAN_COUNT > 0 )
    { return true } else { return false }
  },
  bicycles: function(feature) {
    if ( feature.properties.BICYCLE_CO > 0 )
    { return true } else { return false }
  },

  weather: function(feature) {
    if ( feature.properties.WET_ROADS === 1 || feature.properties.SNOW_SLUSH == 1 || feature.properties.ICY_ROAD == 1 )
    { return true } else { return false }
  },

  // collisionCause
  aggressive: function(feature) {
    if ( feature.properties.RUNNING_RE === 1 || feature.properties.TAILGATING == 1 )
    { return true } else { return false }
  },
  alcohol: function(feature) {
    if ( feature.properties.ALCOHOL_RE === 1 || feature.properties.DRINKING_D === 1 || feature.properties.UNDERAGE_D === 1 )
    { return true } else { return false }
  },
  speeding: function(feature) {
    if (feature.properties.SPEEDING === 1 || feature.properties.SPEEDING_R === 1 )
    { return true } else { return false }
  },
  cellPhone: function(feature){
    if (feature.properties.Cell_Phone ===1)
    { return true} else { return false }
  },

}
// CONTROLLER
var changeRoute = function(cb) {

  collisionsSource.setData(turf.point([0,0]));

  var profile = 'mapbox.driving',
      startWaypoint = phillyCrash.startPoint.geometry.coordinates[0] + ',' + phillyCrash.startPoint.geometry.coordinates[1],
      endWaypoint = phillyCrash.endPoint.geometry.coordinates[0] + ',' + phillyCrash.endPoint.geometry.coordinates[1],
      alternatives = 'false',
      instructions = 'text';

  var url = 'https://api.mapbox.com/v4/directions/' +
            profile + '/' + startWaypoint + ';' + endWaypoint +
            '.json?alternatives=' + alternatives + '&instructions=' +
            instructions + '&access_token=' + 'pk.eyJ1IjoiYWFyb25kZW5uaXMiLCJhIjoiem5LLURoYyJ9.T3tswGTI5ve8_wE-a02cMw';

  d3.json(url, function(data) {

    phillyCrash.route = data;

    var trafficRoute = new TrafficRoute(phillyCrash.route, 0);

    routeSource.setData(phillyCrash.route.routes[0].geometry);
    var bbox = turf.extent(phillyCrash.route.routes[0].geometry);
    map.fitBounds([[bbox[0],bbox[1]],[bbox[2],bbox[3]]], {
      padding: 80 * (Math.sqrt(turf.distance(turf.point([bbox[0],bbox[1]]), turf.point([bbox[2],bbox[3]]), 'miles') * 0.4) + 1)
    });

    function progress() {
      d3.select('#progress').attr('class', 'progressing').text('selecting ' + trafficRoute.collisions.features.length + ' collisons...');

      //phillyCrash.collisions = trafficRoute.collisions;
      //phillyCrash.filterCollisions();

    }

    trafficRoute.getCollisions(progress, function() {

      d3.select('#progress').attr('class', 'ready')

      phillyCrash.collisions = trafficRoute.collisions;

      phillyCrash.filterCollisions();
      d3.select('#progress').text(phillyCrash.filteredCollisions.features.length + '/' + phillyCrash.collisions.features.length + ' collisons selected!');

    });

  });

}
var changeStartPoint = function(newStartPoint) {
  destinationFocus = !destinationFocus;
  phillyCrash.startPoint = newStartPoint;

  startSource.setData(phillyCrash.startPoint.geometry);
  map.panTo({ center: phillyCrash.startPoint.geometry.coordinates, zoom: 12 })

  if (phillyCrash.startPoint && phillyCrash.endPoint) changeRoute(phillyCrash.filterCollisions);
}
var changeEndPoint = function(newEndPoint) {
  phillyCrash.endPoint = newEndPoint;

  endSource.setData(phillyCrash.endPoint.geometry);
  map.panTo({ center: phillyCrash.endPoint.geometry.coordinates, zoom: 12 })

  if (phillyCrash.startPoint && phillyCrash.endPoint) changeRoute();
}
var changeFilters = function() {
  var categories = ['timeOfDay', 'vechicleType', 'collisionCause'];

  var newFilters = phillyCrash.filters.map(function(d,i) {
    return document.getElementById(categories[i]).value;
  });
  phillyCrash.filters = newFilters;

  phillyCrash.filterCollisions();

  d3.select('#progress').text(phillyCrash.filteredCollisions.features.length + '/' + phillyCrash.collisions.features.length + ' collisons selected!');
}
// changeLocationFocus: function() {}
// changeLocationFocus: function() {}
