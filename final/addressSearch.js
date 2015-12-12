function createAddressSearch(elementID, cb) {

  $('<div id="' + elementID.substring(1, elementID.length) + 'SearchContainer"><input type="text" placeholder="Search for an address..." id="' + elementID.substring(1, elementID.length) + 'AddressSearch" class="geocode"></input><div id="' + elementID.substring(1, elementID.length) + 'Suggestions"></div></div>').appendTo(elementID);

  d3.select(elementID + 'Suggestions').style('max-height', '15em').style('overflow-y', 'scroll');

  $(elementID + 'AddressSearch').on('input', function() {

    var query = $(elementID + 'AddressSearch').val();

    d3.selectAll('.suggestion').remove();

    if (query.length > 2) {

      var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?proximity=-75.163,39.952&access_token=' + 'pk.eyJ1IjoiYWFyb25kZW5uaXMiLCJhIjoiem5LLURoYyJ9.T3tswGTI5ve8_wE-a02cMw';

      $.getJSON(url, function(data) {

        data.features.map(function(d,i) {
          if (d.context[1].text === 'Philadelphia') {
            d3.select(elementID + 'Suggestions').append('div')
              .attr('class', 'geocode suggestion')
              .on('click', function() {
                $(elementID + 'AddressSearch').val(d.place_name.substring(0, (d.place_name.length - 49)));
                d3.selectAll('.suggestion').remove();
                cb({ address: d.place_name.substring(0, (d.place_name.length - 49)), geometry: d.geometry });
              })
              .text(d.place_name.substring(0, (d.place_name.length - 49)));
          }
        });

        // $(elementID + 'AddressSearch').off('keydown').on('keydown', function(e) {
        //   switch(e.which) {
        //
        //     case 13:
        //       console.log('enter');
        //     break;
        //
        //     case 27: //escape
        //       console.log('escape');
        //     break;
        //
        //     case 38: // up
        //       console.log('up');
        //     break;
        //
        //     case 40: // down
        //       console.log('down');
        //     break;
        //
        //     default: return; // exit this handler for other keys
        //   }
        //   e.preventDefault(); // prevent the default action (scroll / move caret)
        // });

      });

    }

  })

}
