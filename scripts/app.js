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

  baseMap = new L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/{z}/{x}/{y}.png', {
    attribution: 'Stamen'
  });

  baseMap.addTo(map);

  torqueLayer = new L.TiledTorqueLayer({
    provider: 'url_template',
    url: config.GBIF_URL,
    resolution: 4,
    cummulative: true,
    start_date: 0,
    end_date: 220,
    step: 1,
    table: 'importing_1369045322_helsinki_manydays_live',
    column: 'ac',
    countby: 'count(mm)',
    pixel_size: 3,
    valueDataType: Float32Array
  });

  torqueLayer.addTo(map);
  torqueLayer.setKey([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  torqueLayer.setZIndex(1000);
  torqueLayer.renderer.setCartoCSS(TORQUE_LAYER_CARTOCSS);

  get_aggregated(function() {
    timeline = new gbif.ui.view.Timeline({
      container: $("body")
    });

    timeline.timeline_tooltip.addHandler(".hamburger a");
  });

  // Analysis
  analysis = new gbif.ui.view.Analysis({ map: map });
  $("body").append(analysis.render());

  // Layer selector
  layerSelector = new gbif.ui.view.LayerSelector({ map: map });
  $("body").append(layerSelector.render());
}

$(function() {
  loadGBIF();
});
