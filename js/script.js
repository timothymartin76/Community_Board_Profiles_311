var map;
  var baseAPI = 'https://timothymartin76.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM CMBD_Inter_Merge WHERE cartodb_id = '

  var layerGroup = new L.LayerGroup();

  var TopComplaintsChartData = [];
  TopComplaintsChartData[0]={};


  var TopComplaintsChart;


  function init(){
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [40.7,-73.96],
      zoom: 12
    })
   var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'




    }).addTo(map);
    var layerUrl = 'https://timothymartin76.cartodb.com/api/v2/viz/7d3d7b6c-062f-11e5-bbd0-0e018d66dc29/viz.json';
    var sublayers = [];




    var currentHover, newFeature = null;
    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        
        console.log("done");

        layer.getSubLayer(0).setInteraction(true);
        layer.on('featureOver', function(ev, pos, latlng, data){
          console.log("featureover");
          //check to see if it's the same feature so we don't waste an API call
          if(data.cartodb_id != currentHover) {
            layerGroup.clearLayers();
          
            $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
              newFeature = L.geoJson(res,{
                style: {
                  "color": "#DCFF2E",
                  "weight": 3,
                  "opacity": 1
                }
              });
              layerGroup.addLayer(newFeature);
              layerGroup.addTo(map);
              updateSidebar(res.features[0].properties);
              updateChart(res.features[0].properties)

            })
            currentHover = data.cartodb_id;
          }
        })
        .on('featureOut', function(){
          layerGroup.clearLayers();
        })

        // // change the query for the first layer
        // var subLayerOptions = {
        //   sql: "SELECT * FROM ne_10m_populated_places_simple",
        //   cartocss: "#ne_10m_populated_places_simple{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;}"
        // }
        // var sublayer = layer.getSubLayer(0);
        // sublayer.set(subLayerOptions);
        // sublayers.push(sublayer);

        $('#311ComplaintsButton').click(function(){
          layer.getSubLayer(0).show();
          layer.getSubLayer(1).hide();
          $('.button').removeClass('selected');
          $(this).addClass('selected');
        });


      })
      .on('error', function() {
        //log the error
      });
      }

      //from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
      // String.prototype.toProperCase = function () {
      //   return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      // };

      function updateSidebar(f) {

        //first check if there is data
        if (f.community_board == null) {
          $('.noData').show();
          $('.mainSidebar').hide();
        } else { 
          $('.noData').hide();
          $('.mainSidebar').show();
        }


        $('.community_board').text(function(){
          return "Community Board:  " + f.community_board;
        });

       $('.borough').text(function(){
          return "Borough:  " + f.borough;
        });

       $('.population').text(function(){
          return "Population:  " + f.population;
        });

       $('.total_complaints').text(function(){
          return "Total Complaints:  " + f.total_complaints;
        });



       
        TopComplaintsChartData[0].key = "test";
        TopComplaintsChartData[0].values = 
          [
            { 
              "label" : "Heat" ,
              "value" : f.heat_hot_water
            } , 
            { 
              "label" : "Parking" , 
              "value" : f.illegal_parking
            } , 
            { 
              "label" : "Noise" , 
              "value" : f.noise_residential
            } , 
            { 
              "label" : "Street" , 
              "value" : f.street_condition
            } 
          ]
        
       

       d3.select('#TopComplaintsChart svg')
      .datum(TopComplaintsChartData)
      .transition().duration(300)
      .call(TopComplaintsChart);

    

      }

//chart stuff
nv.addGraph(function() {
  TopComplaintsChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      //.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(false)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      .valueFormat(d3.format(".0f"))
      .width(222)
      .showYAxis(false)
      .margin({left:0,right:0})
      .color(['rgb(0,0,0)','rgb(38,50,72)','rgb(126,138,162)','rgb(255,152,0)']);
      ;

      TopComplaintsChart.xAxis
      .axisLabel('Top Complaint Types')

     

  // d3.select('#chart svg')
  //     .datum(exampleData)
  //     .transition().duration(500)
  //     .call(chart);

  nv.utils.windowResize( TopComplaintsChart.update);

  return TopComplaintsChart;
});


