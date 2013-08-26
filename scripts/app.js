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
      center = new L.LatLng(config.map.lat, config.map.lng),
      zoom = config.map.zoom;

  // http://vizzuality.github.io/gbif/index.html?lat=39.407856289405856&lng=-0.361511299999961
  if(lat && lng) {
    center = new L.LatLng(getURLParameter("lat"), getURLParameter("lng"));
  }

  // http://vizzuality.github.io/gbif/index.html?zoom=11
  if(getURLParameter("zoom")) {
    zoom = getURLParameter("zoom");
  }

  map = new L.Map('map', {
    center: center,
    zoom: zoom
  });

  // http://vizzuality.github.io/gbif/index.html?style=satellite
  var layer = getURLParameter("style") || config.map.layer;

  var layerUrl = layers[layer]['url'];

  var layerOptions = {
    attribution: layers[layer]['attribution']
  }

  baseMap = new L.tileLayer(layerUrl, layerOptions);

  baseMap.addTo(map);

  // http://vizzuality.github.io/gbif/index.html
  // http://vizzuality.github.io/gbif/index.html?type=TAXON&key=1
  // http://vizzuality.github.io/gbif/index.html?type=COUNTRY&key=ES
  var gbif_url = config.map.gbif_url;

  if(getURLParameter("type")) {
    gbif_url = "http://apidev{s}.gbif.org/map/density/tile/density/tile.tcjson?key=" + getURLParameter("key") + "&x={x}&y={y}&z={z}&type=" + getURLParameter("type");
  }

  torqueLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: gbif_url,
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
    var cat = config.map.cat;

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

$(function() {
  loadGBIF();
});
