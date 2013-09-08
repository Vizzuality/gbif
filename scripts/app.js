var loaded        = false,
    map           = {},
    baseMap       = {},
    GOD           = {},
    analysis      = {},
    timeline      = {},
    mainLayer     = {},
    torqueLayer   = {},
    drawnItems    = {},
    svg           = [],
    aggr_data     = null,
    total_data    = 0;

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
      center = new L.LatLng(config.MAP.lat, config.MAP.lng);

  // http://vizzuality.github.io/gbif/index.html?lat=39.407856289405856&lng=-0.361511299999961
  if(lat && lng) {
    center = new L.LatLng(lat, lng);

    config.MAP.lat = lat;
    config.MAP.lng = lng;
  }

  // http://vizzuality.github.io/gbif/index.html?zoom=11
  if(getURLParameter("zoom")) {
    config.MAP.zoom = getURLParameter("zoom");
  }

  map = new L.Map('map', {
    center: center,
    zoom: config.MAP.zoom
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
    }, '*');
  });

  // http://vizzuality.github.io/gbif/index.html?resolution=4
  if(getURLParameter("resolution")) {
    config.MAP.resolution = parseInt(getURLParameter("resolution"), 10);
  }

  // TODO: Remove when resolutions are deployed to CDN
  if(config.MAP.resolution != 4) {
    config.CDN = "apidev.gbif.org";
  }

  // http://vizzuality.github.io/gbif/index.html?style=satellite
  if(getURLParameter("style")) {
    config.MAP.layer = getURLParameter("style");
  }

  var layerUrl = layers[config.MAP.layer]['url'];

  var layerOptions = {
    attribution: layers[config.MAP.layer]['attribution']
  }

  baseMap = new L.tileLayer(layerUrl, layerOptions);

  baseMap.addTo(map);

  // http://vizzuality.github.io/gbif/index.html?type=TAXON&key=1
  // http://vizzuality.github.io/gbif/index.html?type=COUNTRY&key=ES
  if(getURLParameter("type")) {
    config.MAP.type = getURLParameter("type");
    config.MAP.key = getURLParameter("key");
  }

  config.GBIF_URL = "http://" + config.CDN + "/map/density/tile/density/tile.tcjson?key=" + config.MAP.key + "&x={x}&y={y}&z={z}&type=" + config.MAP.type + "&resolution=" + config.MAP.resolution;

  // http://vizzuality.github.io/gbif/index.html?layertype=png
  if(getURLParameter("type")) {
    config.LAYERTYPE = getURLParameter("layertype");
  }

  torqueLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: config.GBIF_URL,
    resolution: config.MAP.resolution,
    valueDataType: Float32Array,
    continuousWorld: false,
    subdomains: '1234'
  });

  if(config.LAYERTYPE === 'png') {
    tileLayer = new L.GBIFLayer("http://apidev.gbif.org/map/density/tile/density/tile.png?key=" + config.MAP.key + "&x={x}&y={y}&z={z}&type=" + config.MAP.type, {});

    tileLayer.setResolution(config.MAP.resolution);
    tileLayer.setStyle(layers[config.MAP.layer]['png-render-style']);

    mainLayer = tileLayer;
  } else {
    torqueLayer.setZIndex(1000);
    torqueLayer.setCartoCSS(config.TORQUE_LAYER_CARTOCSS);

    mainLayer = torqueLayer;
  }

  mainLayer.addTo(map);

  get_aggregated(function() {
    // http://vizzuality.github.io/gbif/index.html?cat=all
    if(getURLParameter("cat")) {
      config.MAP.cat = getURLParameter("cat");
    }

    timeline = new gbif.ui.view.Timeline({
      container: $("#wrapper"),
      cat: config.MAP.cat
    });

    timeline.timeline_tooltip.addHandler(".hamburger a");
  });

  // Analysis (removed for first iteration)
  // analysis = new gbif.ui.view.Analysis({ map: map });
  // $(".selectors").append(analysis.render());

  // Layer selector
  layerSelector = new gbif.ui.view.LayerSelector({ map: map });
  $(".selectors").append(layerSelector.render());

  // Resolution selector (only working for png)
  if(config.LAYERTYPE === 'png') {
    resolutionSelector = new gbif.ui.view.ResolutionSelector();
    $(".selectors").append(resolutionSelector.render());
  }
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
  // uncomment to send back metrics to CDB
  //setTimeout(send_profiler_stats, 12000);
});
