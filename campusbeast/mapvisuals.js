var uniarray;
var geocoder;
var map;
var marker;
var heatmapselect;
var currentmax = 100;
var heatmap = new Array();
var addbutton;
var lastselectorclicked;
var satlegend = 0;
var actlegend = 0;
var markerarray = new Array();
var pointy = 0;
var legendarray = new Array();
var showmarkers = true;
var showheatmap = true;
var markershowing = 0;
var markerzoomtrigger = false;
var infowindow;
var infowindowarray=[];
var listenerarray=[];

function makeid(original){
  var newid = original.replace(/\s+/g, '');
  newid = newid.replace(/["'()]/g, "");
  newid = newid.replace("%", "");
  newid = newid.replace("#", "");
  newid = newid.replace(".", "");
  return newid
}

function mapinitialize()
{
    var mapOptions = {
        center: new google.maps.LatLng(39.8282, -98.5795),
        zoom: 4
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
}

function extractLocations(rows, selection)
{
    var locations = [];
    var weight = 0;
    var name = ""
    var id=0
    for (var i = 0; i < rows.length; ++i)
    {
        weight=0;
        name = ""
        id=0;
        var row = rows[i];
        if (row.Latitude)
        {
            var lat = row.Latitude;
            var lng = row.Longitude;
            if (lat && lng && !isNaN(lat) && !isNaN(lng))
            {
                var latLng = new google.maps.LatLng(lat, lng);
                if(row[selection]){
                  weight = row[selection];}
                if(row["institution name"]){
                  name = row["institution name"];
                }
                 if(row["unitid"]){
                  id = row["unitid"].toString();
                }
                locations.push(
                {
                    location: latLng,
                    weight: parseFloat(weight),
                    name: name,
                    id: id
                });
            }
        }
    }
    return locations;
}


function drawHeatmap(locations, buttonid)
{
    //    console.log(locations);
    //   console.log(currentmax);
    //   console.log(lastselectorclicked);
    heatmap[buttonid] = new google.maps.visualization.HeatmapLayer(
    {
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
        opacity: 0.5,
        radius: 5,
        data: locations,
        maxIntensity: currentmax
    });
    heatmap[buttonid].setMap(map);
    // console.log(heatmap);
}


function drawMarkers(mapLocations)
{
    var newmarker;
    // console.log(mapLocations);
    for (i in mapLocations)
    {
        if (mapLocations[i].location)
        {
            //console.log("iterating")
            newmarker = new google.maps.Marker(
            {
                position: mapLocations[i].location,
                map: map,
                title: mapLocations[i].name,
                icon:
                {
                    url:"/highschool.png",
                    scaledSize:{"width":20, "height":20},
                },
                id: mapLocations[i].id
            });
            markerarray.push(newmarker);
            google.maps.event.addDomListener(newmarker, 'click', function() {
              infowindowarray[this.id].open(map,this);
            });
            
        }
      }
    }

function initializeinfowindows(){
  for (x in uniarray){
    var row = uniarray[x]
    var id = uniarray[x]["unitid"].toString();
    var name = uniarray[x]["institution name"]
    var content = "Statistics for "+ name +"<br>"
    content += "City: " + uniarray[x]["City"] + "<br>"
   /* for (y in row){
      if(y!="institution name" && y!="City"&& y!="unitid"&& y!="Longitude"&& y!="Latitude"&& y!="Address"&& y!="Zip Code"&& y!="year"){
        var windowid = makeid(y);
        var value = row[y];
        if (value==""){
          value = "Not Reported"
        }
        windowid+="window";
        content+="<div id='"+windowid+"' class='infowindowstats'>"+y+": "+value+"<br>";
      }
    }*/ 

    infowindow = new google.maps.InfoWindow({
      content: content
    });
    infowindowarray[id]=infowindow;
  }
}

function addtoinfowindow(buttonid){
    for (x in uniarray){
    var row = uniarray[x]
    var id = uniarray[x]["unitid"].toString();
    var name = uniarray[x]["institution name"]
    var content = infowindowarray[id].getContent()
    var windowid = makeid(buttonid);
    var value = row[buttonid];
    if (value==""){
          value = "Not Reported"
        }
    windowid+="window";
    content+="<div id='"+windowid+"' class='infowindowstats'>"+buttonid+": "+value+"<br>";
    infowindowarray[id].setContent(content);
  }
}

function removefrominfowindow(buttonid){
  for(x in infowindowarray){
    var content = $(infowindowarray[x].getContent());
    var search = "\<div id= '" + buttonid + "'>.*\</div>"
    var regex = new RegExp(search)
    content = content.replace(regex, "")
  }
}

function updatemarkers(){


  if(showmarkers && markershowing>0 && map.zoom>=7 && !markerzoomtrigger){
    markerzoomtrigger=true;
    var data = extractLocations(uniarray, "test");
    drawMarkers(data); 
  }
  if(showmarkers && markershowing>0 &&map.zoom<7){
    for (x in markerarray)
     {
        google.maps.event.clearInstanceListeners(markerarray[x]);
        markerarray[x].setMap(null);
        markerzoomtrigger=false;
      }
      markerarray = [];
  }
  if(!showmarkers){
    for (x in markerarray)
     {
        google.maps.event.clearInstanceListeners(markerarray[x]);
        markerarray[x].setMap(null);
        markerzoomtrigger=false;
      }
      markerarray=[];
  }
}

function dynamicmaxmin(data, selection)
{
  var maxminarray = [];
  for (var i = 0; i < data.length; ++i)
  {
      var row = data[i]
      if (row[selection] && (row[selection] != undefined))
      {
          var weight = row[selection];
          maxminarray.push(weight);
      }
  }
  maxminarray.sort(function(a, b)
  {
      return a - b
  });
  return [maxminarray[maxminarray.length - 1], maxminarray[0]]
}

function setmax(buttonid){
  if (buttonid.indexOf("SAT") != -1)
  {
      currentmax = 800;}
       else if (buttonid.indexOf("ACT") != -1)
  {
      currentmax = 36;}
      else
  {
      currentmax = dynamicmaxmin(uniarray, buttonid)[0];}
}

function addLegend(buttonid, legendid)
{
  if ((buttonid.indexOf("SAT") != -1) && (buttonid.indexOf("Percent")==-1))
  {

      if (satlegend == 0)
      {
          $("#legend").append("<div id='satlegend'>SAT Legend<br/></div>")
          $("#satlegend").append('<div style="float:left;">0 - Min</div>')
          $("#satlegend").append('<div style="float:right;">Max - 800</div><br/>')
          $("#satlegend").append('<div id="gradient"></div>');
      }
      satlegend++;
  }
  else if ((buttonid.indexOf("ACT") != -1) && (buttonid.indexOf("Percent")==-1) && (buttonid.indexOf("Writing")==-1)&& (buttonid.indexOf("English")==-1)&& (buttonid.indexOf("Math")==-1))
  {
      if (actlegend == 0)
      {
          $("#legend").append("<div id='actlegend'>ACT Legend<br/></div>")
          $("#actlegend").append('<div style="float:left;">0 - Min</div>')
          $("#actlegend").append('<div style="float:right;">Max - 36</div><br/>')
          $("#actlegend").append('<div id="gradient"></div>');
      }
      actlegend++;
  }
  else
  {
      currentmax = dynamicmaxmin(uniarray, buttonid)[0];
      if (legendarray[buttonid] == 0)
      {
          $("#legend").append("<div id='" + legendid + "legend'>" + buttonid + " Legend<br/></div>")
          $("#" + legendid+"legend").append('<div style="float:left;">0 - Min</div>')
          $("#" + legendid+"legend").append('<div style="float:right;">Max - ' + currentmax + '</div><br/>')
          $("#" + legendid+"legend").append('<div id="gradient"></div>');
      }
      legendarray[buttonid]++;
  }
}

function removelegend(buttonid, legendid)
{
  if ((buttonid.indexOf("SAT") != -1) && (buttonid.indexOf("Percent")==-1))
  {
      satlegend--;
      if (satlegend == 0)
      {
          $("#satlegend").remove();
      }
  }
  else if ((buttonid.indexOf("ACT") != -1) && (buttonid.indexOf("Percent")==-1) && (buttonid.indexOf("Writing")==-1)&& (buttonid.indexOf("English")==-1)&& (buttonid.indexOf("Math")==-1))
  {
      actlegend--;
      if (actlegend == 0)
      {
          $("#actlegend").remove();
      }
  }
  //  else if (buttonid.indexOf("enrollment") != -1) {
  //     $("#enrollmentlegend").remove();
  // } else if (buttonid.indexOf("yield") != -1) {
  //     $("#admissionsyieldlegend").remove();}
  else
  {
      legendarray[buttonid]--;
      if (legendarray[buttonid] == 0)
      {
          $("#" + legendid+"legend").remove();
      }
  }
}


        $(document).ready(function()
        {
            jQuery.get('/combinedcollegedata.csv', function(data)
            {
                uniarray = $.csv.toObjects(data);
                var count = 1;
                for (key in uniarray[0])
                {
                    if (count > 8)
                    {
                        var newselector = ($("<li id='" + key + "'><a href='#'>" + (count - 8) + ". " + key + "</a></li>"));
                        newselector.addClass("");
                        $("#selectors").append(newselector);
                        legendarray[key] = 0;
                    }
                    count++;
                }
                mapinitialize();
                initializeinfowindows();
                var legend = $('<div id="legend">Legend for Selected Heatmaps<br/></div>')
                map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend[0]);
                var options = $('<div id="options">Options for the map<br/><div class="btn-group-vertical"><button data-toggle="button" type="button" id="heatmapoption" class="btn btn-success btn-sm active">Heatmaps On</button><button type="button" id="markeroption" data-toggle="button" class="btn btn-success btn-sm active">Markers On when zoomed</button></div></div>');
                map.controls[google.maps.ControlPosition.RIGHT_TOP].push(options[0]);
               


                google.maps.event.addListener(map, 'zoom_changed', function()
                {
                    updatemarkers();
                    //updatemarkerswithlabels()
                });
            });




            $('body').on('click', "#selectors li", function()
            {
                //console.log("fired");
                //console.log($(this));
                lastselectorclicked = $(this).attr('id');
                var buttonid = $(this).attr('id')
                var legendid = $(this).attr('id').replace(/\s+/g, '');
                legendid = legendid.replace(/["'()]/g, "");
                legendid = legendid.replace("%", "");
                legendid = legendid.replace("#", "");
                legendid = legendid.replace(".", "");
                console.log(lastselectorclicked);
                if (!($(this).hasClass("active")))
                {
                  addtoinfowindow(buttonid);
                  markershowing++;
                  $(this).addClass("active");
                  var data = extractLocations(uniarray, buttonid)
                  setmax(buttonid);
                  addLegend(buttonid, legendid);
                  if (showheatmap)
                  {
                    drawHeatmap(data, buttonid);
                  }
                  if(showmarkers&&markershowing==0&&map.zoom>=7){
                    drawMarkers(data);  
                  }
                  //drawMarkersWithLabels(data, ($(this).index()+1));
                }
                else
                {
                    //    console.log(heatmap)
                    //    console.log($("#selectors button").index($(this)))
                    markershowing--;
                    updatemarkers();
                    removelegend(buttonid, legendid);
                    console.log(heatmap);
                    heatmap[buttonid].setMap(null);

                    
                    $(this).removeClass("active");
                    removefrominfowindow(buttonid);

                }
            });

            $('body').on('click', "#heatmapoption", function()
            {
                if ($(this).hasClass('active'))
                {
                    for (x in heatmap)
                    {
                        heatmap[x].setMap(null);
                    }
                    $("#legend").hide();
                    $(this).removeClass("btn-success");
                    $(this).addClass("btn-danger");
                    $(this).text("Heatmaps Off");
                    showheatmap = false;
                }
                else
                {
                    var activedata = new Array();
                    var selectors = $("#selectors li")
                    for (var x = 0; x < selectors.length; x++)
                    {
                        if ($(selectors[x]).hasClass("active"))
                        {
                            activedata.push($(selectors[x]))
                        }
                    }
                    for (var y = 0; y < activedata.length; y++)
                    {
                        var buttonid = activedata[y].attr('id');
                        var legendid = activedata[y].attr('id').replace(/\s+/g, '');
                        legendid = legendid.replace(/["'()]/g, "");
                        legendid = legendid.replace("%", "");
                        legendid = legendid.replace("#", "");
                        legendid = legendid.replace(".", "");
                        var data = extractLocations(uniarray, buttonid);
                        setmax(buttonid);
                        drawHeatmap(data, buttonid);
                    }
                    $("#legend").show();
                    $(this).removeClass("btn-danger");
                    $(this).addClass("btn-success");
                    $(this).text("Heatmaps On");
                    showheatmap = true;
                }


            });

            $('body').on('click', "#markeroption", function()
            {
                if ($(this).hasClass('active'))
                {
                    showmarkers = false;
                    updatemarkers();
                    $(this).removeClass("btn-success");
                    $(this).addClass("btn-danger");
                    $(this).text("Markers Off when zoomed");
                    
                }
                else
                {
                    showmarkers = true;
                    updatemarkers();
                    $(this).removeClass("btn-danger");
                    $(this).addClass("btn-success");
                    $(this).text("Markers On when zoomed");
                    
                }


            });

        });
