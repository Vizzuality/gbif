/**
 * This uses the PNG server side rendering instead of the torque version.
 */
var loaded        = false,
    map           = {},
    baseMap       = {},
    GOD           = {},
    analysis      = {},
    timeline      = {},
    //torqueLayer   = {}, // we will actually use a GBIFLayer
    tileLayer     = {},
    drawnItems    = {},
    svg           = [],
    aggr_data     = null,
    total_data    = 0;

function get_aggregated(callback) {
	// TODO  
	aggr_data = {0: 3340202, 1: 407366, 2: 305994, 3: 423038, 4: 500602, 5: 786371, 6: 609446, 7: 1168363, 8: 2174726, 9: 2463996, 10: 2657818, 11: 4290073, 12: 3796801, 13: 401111, 14: 4853059, 15: 21310, 16: 50638, 17: 19001, 18: 26742, 19: 68990, 20: 88266, 21: 541867, 22: 1704210, 23: 3090049, 24: 11088561, 25: 21305561, 26: 71482676, 27: 36807058, 28: 86355, 29: 710645, 30: 1683648, 31: 139465, 32: 123957, 33: 154907, 34: 240863, 35: 318072, 36: 275817, 37: 455973, 38: 1206157, 39: 4004142, 40: 5745649, 41: 9113038, 42: 27537493, 43: 13559603};
	callback();
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
    }, 'http://0.0.0.0:8000');
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
      key = config.MAP.key;

  if(getURLParameter("type")) {
    type = getURLParameter("type");
    key = getURLParameter("key");

    config.MAP.type = type;
    config.MAP.key = key;
    config.GBIF_URL = "http://apidev.gbif.org/map/density/tile/density/tile.png?key=" + key + "&x={x}&y={y}&z={z}&type=" + type;
  }

	// TODO other stuff
  tileLayer = new L.GBIFLayer(config.GBIF_URL, {});
  tileLayer.addTo(map);
  //overlayLayer.setZIndex(1000);

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

$(function() {
  loadGBIF();
});
