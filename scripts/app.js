var loaded        = false,
    map           = {},
    baseMap       = {},
    GOD           = {},
    analysis      = {},
    timeline      = {},
    torqueLayer   = {},
    drawnItems    = {},
    aggr_data     = null,
    total_data    = 0;

var TORQUE_LAYER_CARTOCSS= [
    '#layer {',
    '  polygon-fill: #FFFF00;',
    '  [value > 10] { polygon-fill: #FFCC00; }',
    '  [value > 100] { polygon-fill: #FF9900; }',
    '  [value > 1000] { polygon-fill: #FF6600; }',
    '  [value > 10000] { polygon-fill: #FF3300; }',
    '  [value > 100000] { polygon-fill: #CC0000; }',
    '}'
].join('\n');

function get_aggregated(callback) {
  torqueLayer.provider.getTile({ x: 0, y: 0 }, 0, function(data) {
    aggr_data = torqueLayer.provider.aggregateByKey(data.rows);

    callback();
  });
}

function loadGBIF(callback) {
  if(loaded) {
    callback && callback();
    return;
  }

  loaded = true;

  GOD = new gbif.ui.view.GOD();
  window.GOD = GOD;

  map = new L.Map('map', {
    center: [36.60670888641815, 38.627929687],
    zoom: 2
  });

  config.LAYER_STYLE = getURLParameter("style") || "dark";

  var layerUrl = layers[config.LAYER_STYLE]['url'];

  var layerOptions = {
    attribution: layers[config.LAYER_STYLE]['attribution']
  }

  baseMap = new L.tileLayer(layerUrl, layerOptions);

  baseMap.addTo(map);

  torqueLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: config.GBIF_URL,
    resolution: 4,
    valueDataType: Float32Array,
    continuousWorld: false,
    subdomains: '1234'
  });

  torqueLayer.addTo(map);
  torqueLayer.setKey([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  torqueLayer.setZIndex(1000);
  torqueLayer.renderer.setCartoCSS(TORQUE_LAYER_CARTOCSS);

  get_aggregated(function() {
    timeline = new gbif.ui.view.Timeline({
      container: $("#wrapper")
    });

    timeline.timeline_tooltip.addHandler(".hamburger a");
  });

  // Analysis
  analysis = new gbif.ui.view.Analysis({ map: map });
  $("#wrapper").append(analysis.render());

  // Layer selector
  layerSelector = new gbif.ui.view.LayerSelector({ map: map });
  $("#wrapper").append(layerSelector.render());
}

function send_profiler_stats() {
  for(var i in Profiler.metrics) {
    var img = new Image();
    var m = Profiler.metrics[i];
    var q = "select profiler_data('" + i + "'," + m.max + "," + m.min + "," + m.avg + "," + m.count + ","+ m.total + ", '"+ navigator.userAgent + "','json')";
    img.src = 'http://javi.cartodb.com/api/v1/sql?q=' + encodeURIComponent(q) + '&c=' + Date.now();
  }
}

$(function() {
  // http://vizzuality.github.io/gbif/index.html
  // http://vizzuality.github.io/gbif/index.html?type=TAXON&key=1
  // http://vizzuality.github.io/gbif/index.html?type=COUNTRY&key=ES
  // http://vizzuality.github.io/gbif/index.html?style=satellite
  if(getURLParameter("type")) {
    //config.GBIF_URL = "http://api{s}.gbif.org/map/density/tile/density/tile.tcjson?key=" + getURLParameter("key") + "&x={x}&y={y}&z={z}&type=" + getURLParameter("type");
    config.GBIF_URL = "http://d30ugvnferw5sg.cloudfront.net/map/density/tile/density/tile.tcjson?key=" + getURLParameter("key") + "&x={x}&y={y}&z={z}&type=" + getURLParameter("type");
    
    
  }

  loadGBIF();
  setTimeout(send_profiler_stats, 12000);
});


