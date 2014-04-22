var uniarray;
var geocoder;
var map;
var marker;
var heatmapselect;
var currentmax=100;
var heatmap=new Array();
var addbutton;

function mapinitialize() {
    var mapOptions = {
        center: new google.maps.LatLng(39.8282,-98.5795),
        zoom: 4
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
}

function putdataonheatmap(number,data){
    console.log("fire"+number)
    console.log(data)
    heatmap[number].setDataSet(data);
}


  function extractLocheatmapjs(rows, selection) {
    var locations = [];
    for (var i = 0; i < rows.length; ++i) {
      var row = rows[i];
      if (row.Latitude) {
        var lat = row.Latitude;
        var lng = row.Longitude;
        if (row[selection]) {
            var weight = row[selection];
        }
        else{
            weight = 0;
        }
        locations.push({ "lat":lat, "lng":lng, "count": parseFloat(weight) });
        }
      }
      //console.log(locations);
      return locations;
    }
    

  function drawHeatmap(locations,index, max) {
      console.log(max);
      heatmap[index] = new google.maps.visualization.HeatmapLayer({
       dissipating: true,
       gradient: [
         'rgba(102,255,0,0)', 
         'rgba(147,255,0,1)', 
         'rgba(193,255,0,1)', 
         'rgba(238,255,0,1)', 
         'rgba(244,227,0,1)', 
         'rgba(244,227,0,1)', 
         'rgba(249,198,0,1)', 
         'rgba(255,170,0,1)', 
         'rgba(255,113,0,1)', 
         'rgba(255,57,0,1)', 
         'rgba(255,0,0,1)'
       ],
       opacity: 0.74,
       radius: 40,
       data: locations,
       maxIntensity: max
    });
    heatmap[index].setMap(map);
  }

  $(document).ready(function () {

      jQuery.get('/College Test Scores and Lat Long.csv', function (data) {
          uniarray = $.csv.toObjects(data);
          var option;
          var count = 1;
          for (key in uniarray[0]) {
              //console.log(key)
              if (count > 9) {
                  $("#selectors").append("<button type='button' class='btn btn-primary' data-toggle='button' id='" + key + "'>" + key + "</button>");
              }
              count++;
          }
              mapinitialize();


          //drawHeatmap(extractLocations(uniarray, $('#heatmapselector').val()));
      });


      $('body').on('click', "#selectors button", function () {
          //console.log($(this).attr('id') + "fired");
          //console.log($(this).attr('id') + $(this).hasClass("active") + $("#selectors button").index($(this)));

          if (!($(this).hasClass("active"))) {

              if ($(this).attr('id').indexOf("SAT") != -1) {
                  currentmax = 800;
              }
              else if ($(this).attr('id').indexOf("ACT") != -1) {
                  currentmax = 36;
              }
              else if ($(this).attr('id').indexOf("enrollment") != -1) {
                  currentmax = 10000;
              }
              else {
                  currentmax = 100;
              }

          }
          else {

          }
      });


  });


