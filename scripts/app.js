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

  var lat = getURLParameter("lat"),
      lng = getURLParameter("lng"),
      center = new L.LatLng(config.MAP.lat, config.MAP.lng),
      zoom = config.MAP.zoom;

  // http://vizzuality.github.io/gbif/index.html?lat=39.407856289405856&lng=-0.361511299999961
  if(lat && lng) {
    center = new L.LatLng(lat, lng);

    config.MAP.lat = lat;
    config.MAP.lng = lng;
  }

  // http://vizzuality.github.io/gbif/index.html?zoom=11
  if(getURLParameter("zoom")) {
    zoom = getURLParameter("zoom");

    config.MAP.zoom = zoom;
  }

  map = new L.Map('map', {
    center: center,
    zoom: zoom
  });

  map.on('moveend', function(e) {
    var iframeUrl = $.param(
      _.extend(config.MAP, {
        zoom: map.getZoom(),
        lat: map.getCenter().lat,
        lng: map.getCenter().lng,
      })
    );

    parent.postMessage({
      origin: window.name,
      url: iframeUrl
    }, 'http://vizzuality.github.io');
  });

  // http://vizzuality.github.io/gbif/index.html?style=satellite
  var layer = config.MAP.layer;

  if(getURLParameter("style")) {
    layer = getURLParameter("style");

    config.MAP.layer = layer;
  }

  var layerUrl = layers[layer]['url'];

  var layerOptions = {
    attribution: layers[layer]['attribution']
  }

  baseMap = new L.tileLayer(layerUrl, layerOptions);

  baseMap.addTo(map);

  // http://vizzuality.github.io/gbif/index.html?type=TAXON&key=1
  // http://vizzuality.github.io/gbif/index.html?type=COUNTRY&key=ES
  var type = config.MAP.type,
      type_key = config.MAP.type_key;

  if(getURLParameter("type")) {
    type = getURLParameter("type");
    type_key = getURLParameter("key");

    config.MAP.type = type;
    config.MAP.type_key = type_key;
    config.GBIF_URL = "http://d30ugvnferw5sg.cloudfront.net/map/density/tile/density/tile.tcjson?key=" + type_key + "&x={x}&y={y}&z={z}&type=" + type;
  }

  torqueLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: config.GBIF_URL,
    resolution: 4,
    valueDataType: Float32Array,
    continuousWorld: false,
    subdomains: '1234'
  });

  torqueLayer.addTo(map);
  torqueLayer.setZIndex(1000);
  torqueLayer.renderer.setCartoCSS(TORQUE_LAYER_CARTOCSS);

  get_aggregated(function() {
    // http://vizzuality.github.io/gbif/index.html?cat=all
    var cat = config.MAP.cat;

    if(getURLParameter("cat")) {
      cat = getURLParameter("cat");
    }

    timeline = new gbif.ui.view.Timeline({
      container: $("#wrapper"),
      cat: cat
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
  loadGBIF();

  setTimeout(send_profiler_stats, 12000);
});
