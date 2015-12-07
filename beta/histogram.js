var createHistogram = function(routeCollisions, routeLength) {

    //set bin number as variable
    var numberOfBins = 120;

    //setting up length of histogram and empty bins

    var histogramData = [];

    for (var i = 0; i < numberOfBins; i++) {
      histogramData.push([])
    }

    //connecting the selected data to their bins
    var binSize =  (routeLength * 0.00062137) / numberOfBins;

    for (var i = 0; i < routeCollisions.features.length; i++){

      var binIndex = Math.floor((routeCollisions.features[i].properties.distanceFromRouteOrigin * 0.00062137) / binSize);

      histogramData[binIndex].push(routeCollisions.features[i]);

    }

    // DRAWING WITH SVG

    //Width and height
    var w = 800;
    var h = 160;
    var barPadding = 1;

    //for loop for creating the dataset
    var dataset = histogramData

    // Max Collisions
    var longestbin = d3.max(dataset, function(d) {
      return d.length;
    });

    //Dynamic Scale
    var yScale = d3.scale.linear()
        .domain([0, longestbin])
        .range([0, h]);

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
      .attr('r', 2)
      // adding color to circles based on severity    ////
      .attr('fill', function(d) {
        console.log(d.properties.MAX_SEVERI, d.properties.FATAL);
        return color(d.properties.MAX_SEVERI);
      })
      ////    Code for gathering summary information from features    ////
      .attr('transform', function(d,i) {
        return 'translate(1,' + (h - (i + 1) * 5) + ')';
      })
      .attr("h", function(d) {
        return yScale(d[1]);
    })
    .on('mouseover', function(d) {
      var yearDiv = document.getElementById("year");
      var monthDiv = document.getElementById("month");
      var dayDiv = document.getElementById("day");
      var timeDiv = document.getElementById("time");
      var severityDiv = document.getElementById("severity");
      var peopleCountDiv = document.getElementById("peopleCount");

      yearDiv.innerHTML = d.properties.CRASH_YEAR;
      monthDiv.innerHTML = d.properties.CRASH_MONT;
      dayDiv.innerHTML = d.properties.DATE_OF_MO;
      timeDiv.innerHTML = d.properties.TIME_OF_DA;
      severityDiv.innerHTML = d.properties.MAX_SEVERI;
      peopleCountDiv.innerHTML = d.properties.PERSON_COU;

      console.log(d);

      highlightSource.setData(d);
    });
}
