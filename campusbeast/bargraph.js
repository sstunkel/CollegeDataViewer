var uniarray;
var geocoder;
var map;
var marker;
var heatmapselect;
var currentmax=100;
var heatmap = new Array();
var addbutton;


  $(document).ready(function () {

      jQuery.get('http://campusbeast.azurewebsites.net/College Test Scores and Lat Long.csv', function (data) {
          uniarray = $.csv.toArrays(data);
          d3.select("#bargraphcontainer")
  .selectAll("div")
    .data(uniarray)
  .enter().append("div")
    .style("width", function(d) { return d * 10 + "px"; })
    .text(function(d) { return d; });
   
      });


      $('body').on('click', "#selectors button", function () {
      
      
      
         
      });


  });


