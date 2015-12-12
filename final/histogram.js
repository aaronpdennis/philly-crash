var createHistogram = function(routeCollisions, routeLength) {


  //set bin number as variable
  var numberOfBins = 100;

  //connecting the selected data to their bins
  var binSize =  ( routeLength * 0.00062137) / numberOfBins;

    //setting up length of histogram and empty bins

    var histogramData = [];

    for (var i = 0; i < numberOfBins; i++) {
      histogramData.push([])
    }

    for (var i = 0; i < routeCollisions.features.length; i++){
      var binIndex = Math.floor((routeCollisions.features[i].properties.distanceFromRouteOrigin * 0.00062137) / binSize);
      histogramData[binIndex].push(routeCollisions.features[i]);
    }

    // DRAWING WITH SVG

    //for loop for creating the dataset
    var dataset = histogramData

    // Max Collisions
    var longestbin = d3.max(dataset, function(d) {
      return d.length;
    });

    //Width and height
    var w = $('#routeHistogram').width();
    var h = $('#routeHistogram').height();
    var barPadding = 1;

    //Dynamic Scale
    var yScale = d3.scale.linear()
        .domain([0, longestbin > 30 ? longestbin : 30])
        .range([40, h - 10]);

    var xScale = d3.scale.linear()
        .domain([0, numberOfBins - 1])
        .range([10, w - 10])

    // Color Scale
    var color = d3.scale.linear()
          .domain([10,2,1,0])
          .range(['#9ECAE1', '#08519C', '#F71735', '#FFFFFF'])
          .interpolate(d3.interpolateHcl);

    //Create SVG element
    d3.select('#routeHistogram').selectAll('svg').remove();
    var svg = d3.select("#routeHistogram")
                .append("svg")
                .attr("width", w)
                .attr("height", h)


    var labelScale = d3.scale.linear()
          .domain([0, phillyCrash.route.routes[0].distance])
          .range([10, w - 10]);

    var traveled = 0;
    var labelData = [];
    labelData = phillyCrash.route.routes[0].steps.map(function(d,i) {
      if (i > 0) { traveled += phillyCrash.route.routes[0].steps[i - 1].distance; }
      return { way: d.way_name, distance: traveled, length: d.distance }
    });

    console.log(labelData);

    var labels = svg.append('g').selectAll('.label')
          .data(labelData);

    labels.enter()
      .append('text')
      .attr('fill', 'white')
      .attr('opacity', 0)
      .attr('x', function(d) {
        return labelScale(d.distance);
      })
      .attr('y', function(d,i) {
        return h - (15 * (i % 2) + 8);
      })
      .text(function(d) {
        return d.way;
      })
      .on('mouseover', function() {
        svg.selectAll('text').attr('opacity', 0);
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function() {
        svg.selectAll('text').attr('opacity', 0);
      });

    labels.enter()
      .append('circle')
      .attr('r', 2)
      .attr('fill', 'white')
      .attr('opacity', 0.5)
      .attr('transform', function(d,i) {
        return 'translate(' + (labelScale(d.distance) - 3) + ',' + (h - ((15 * (i % 2) + 8) + 3)) + ')';
      });

    // adding bin containers
    var svgBins = svg.selectAll(".svgBin")
         .data(dataset);

      svgBins.enter()
        .append('g')
        .attr('class', 'svgBin')
        .attr('transform', function(d,i) {
          return 'translate(' + (i * (w / dataset.length)) + ')';
        });

    // adding collision symbols within bin containers
    var collisionSymbols = svgBins.selectAll('.collisionSymbol')
      .data(function(d) {

        //new code for sorting data (max severity at bottom, low severity at top)
        var sortedBySeverity = d.slice();

        sortedBySeverity.sort(function(collision1, collision2){


          //changing severity of 0 to 10 so that the sorting operation works properly
          if (collision1.properties.MAX_SEVERI === 0){
            collision1.properties.MAX_SEVERI = 10
          }
          if (collision2.properties.MAX_SEVERI === 0){
            collision2.properties.MAX_SEVERI = 10
          }

          var returnValue = parseInt(collision1.properties.MAX_SEVERI) - parseInt(collision2.properties.MAX_SEVERI);

          return returnValue;
        });

        return sortedBySeverity;

        return d;

      });


    collisionSymbols.enter()
      .append('circle')
      .attr('class', 'crashPoint')
      .attr('r', 5)
      // adding color to circles based on severity
      .style('fill', function(d) {
        return color(d.properties.MAX_SEVERI);
      })
      .attr('transform', function(d,i) {
        return 'translate(5,' + (h - yScale(i)) + ')';
      })
      .style('opacity', 0.6)
      .on('click', function(d) {
        console.log(d);
        map.flyTo({center: [d.properties.long_final,d.properties.lat_final], zoom: [17]});
      })
      .on('mouseout', function() {
        highlightSource.setData(turf.point([0,0]));
        d3.select('#summary').style('visibility', 'hidden');
      })
      .on('mouseover', function(d) {

        highlightSource.setData(d);
        map.panTo([d.properties.long_final,d.properties.lat_final]);

        d3.select('#summary').style('visibility', 'visible');
        var yearDiv = document.getElementById("year");
        var monthDiv = document.getElementById("month");
        var dayDiv = document.getElementById("day");
        var timeDiv = document.getElementById("time");
        var severityDiv = document.getElementById("severity");
        var fatalCountDiv = document.getElementById("fatalCount");
        var peopleCountDiv = document.getElementById("peopleCount");
        var vehicleCountDiv = document.getElementById("vehicleCount");
        var arriveTimeDiv = document.getElementById("arriveTime");
        var dispatchTimeDiv = document.getElementById("dispatchTime");


        ////    Code for translating Severities into text    ////
        if (d.properties.MAX_SEVERI === 1){
        d.properties.MAX_SEVERI = "Fatal";
        };
        if (d.properties.MAX_SEVERI >=2 && d.properties.MAX_SEVERI <=4){
        d.properties.MAX_SEVERI = "High";
        };
        if (d.properties.MAX_SEVERI >=5 && d.properties.MAX_SEVERI <=7){
        d.properties.MAX_SEVERI = "Moderate";
        };
        if (d.properties.MAX_SEVERI >=8 && d.properties.MAX_SEVERI <=10){
        d.properties.MAX_SEVERI = "Minimal";
        };
        ////    Code for translating Severities into text    ////

        ////    Code for translating numbers into text    ////
        if (d.properties.CRASH_MONT === 1){
        d.properties.CRASH_MONT = "January";
        };
        if (d.properties.CRASH_MONT === 2){
        d.properties.CRASH_MONT = "February";
        };
        if (d.properties.CRASH_MONT === 3){
        d.properties.CRASH_MONT = "March";
        };
        if (d.properties.CRASH_MONT === 4){
        d.properties.CRASH_MONT = "April";
        };
        if (d.properties.CRASH_MONT === 5){
        d.properties.CRASH_MONT = "May";
        };
        if (d.properties.CRASH_MONT === 6){
        d.properties.CRASH_MONT = "June";
        };
        if (d.properties.CRASH_MONT === 7){
        d.properties.CRASH_MONT = "July";
        };
        if (d.properties.CRASH_MONT === 8){
        d.properties.CRASH_MONT = "August";
        };
        if (d.properties.CRASH_MONT === 9){
        d.properties.CRASH_MONT = "September";
        };
        if (d.properties.CRASH_MONT === 10){
        d.properties.CRASH_MONT = "October";
        };
        if (d.properties.CRASH_MONT === 11){
        d.properties.CRASH_MONT = "November";
        };
        if (d.properties.CRASH_MONT === 12){
        d.properties.CRASH_MONT = "December";
        };
        ////    Code for translating numbers into text    ////

        ////    Code for translating 24 hr into 12 hr    ////
        if (d.properties.HOUR_OF_DA === 0 ){
        d.properties.HOUR_OF_DA = (d.properties.HOUR_OF_DA + 12 + " AM")
        };

        if (d.properties.HOUR_OF_DA >=1 && d.properties.HOUR_OF_DA <=12){
        d.properties.HOUR_OF_DA = (d.properties.HOUR_OF_DA + " AM")
        };

        if (d.properties.HOUR_OF_DA >=13 && d.properties.HOUR_OF_DA <=24){
        d.properties.HOUR_OF_DA = (d.properties.HOUR_OF_DA - 12 + " PM")
        };

        if (d.properties.HOUR_OF_DA === 99 ){
        d.properties.HOUR_OF_DA = "N/A"
        };
        ////    Code for translating 24 hr into 12 hr    ////

        yearDiv.innerHTML = d.properties.CRASH_YEAR;
        monthDiv.innerHTML = d.properties.CRASH_MONT;
        dayDiv.innerHTML = d.properties.DATE_OF_MO;
        timeDiv.innerHTML = d.properties.HOUR_OF_DA;
        severityDiv.innerHTML = d.properties.MAX_SEVERI;
        fatalCountDiv.innerHTML = d.properties.FATAL_COUN;
        peopleCountDiv.innerHTML = d.properties.PERSON_COU;
        vehicleCountDiv.innerHTML = d.properties.VEHICLE_CO;
        arriveTimeDiv.innerHTML = d.properties.ARRIVAL_TM.toString().substring(0,2) + ':' + d.properties.ARRIVAL_TM.toString().substring(2,5);

      });
}
