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
      var w = 900;
      var h = 200;
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
          return d;

        });

      collisionSymbols.enter()
        .append('circle')
        .attr('r', 2)
        .attr('fill', function(d) {
          var injured = d.properties.TOT_INJ_CO;
          if (injured > 0) {
            return 'darkred';
          } else {
            return 'blue';
          }
        })
        .attr('transform', function(d,i) {
          return 'translate(1,' + (h - (i + 1) * 5) + ')';
        })
        .on('click', function(d) {
          alert('Crash Date: ' + d.properties.CRASH_DATE);
        })

        .attr("h", function(d) {
          return yScale(d[1]);

        });
}
