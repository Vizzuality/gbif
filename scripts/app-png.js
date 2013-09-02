/**
 * This uses the PNG server side rendering instead of the torque version.
 */
var loaded        = false,
    map           = {},
    baseMap       = {},
    GOD           = {},
    analysis      = {},
    timeline      = {},
    tileLayer     = {},
    drawnItems    = {},
    svg           = [],
    aggr_data     = null,
    total_data    = 0;

function get_aggregated(callback) {
  statsLayer.provider.getTile({ x: 0, y: 0 }, 0, function(data) {
    aggr_data = statsLayer.provider.aggregateByKey(data.rows);
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
    }, 'http://0.0.0.0:8000');
  });

  // http://vizzuality.github.io/gbif/index.html?style=satellite
  var layer = config.MAP.layer;
  var resolution = config.MAP.resolution;

  if(getURLParameter("style")) {
    layer = getURLParameter("style");
    config.MAP.layer = layer;
  }
  if(getURLParameter("resolution")) {
    resolution = getURLParameter("resolution");
    config.MAP.resolution = resolution;
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
    config.GBIF_STATS_URL = "http://apidev.gbif.org/map/density/tile/density/tile.tcjson?key=" + key + "&x={x}&y={y}&z={z}&type=" + type;
  }

  // we use torque only to read the JSON tile for the histogram metrics
  statsLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: config.GBIF_STATS_URL,
    resolution: 1,
    valueDataType: Float32Array,
    continuousWorld: false
  });

  tileLayer = new L.GBIFLayer(config.GBIF_URL, {});
  tileLayer.addTo(map);

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

  // Feedback on data issues removed for this release
  //analysis = new gbif.ui.view.Analysis({ map: map });
  //$("#wrapper").append(analysis.render());

  // Layer selector
  layerSelector = new gbif.ui.view.LayerSelector({ map: map });
  $("#wrapper").append(layerSelector.render());
  
  resolutionSelector = new gbif.ui.view.ResolutionSelector({ map: map });
  $("#wrapper").append(resolutionSelector.render());
}

$(function() {
  loadGBIF();
});
