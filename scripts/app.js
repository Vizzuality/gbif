var loaded = false,
    map = null;

GOD               = {},
analysis          = {},
timeline          = {},
torqueLayer       = {},
current_cat       = "sp";

function test_get_aggregated() {
  torqueLayer.provider.getTile({ x: 0, y: 0 }, 0, function(data) {
    var keys = torqueLayer.provider.aggregateByKey(data.rows);
    console.log(keys);
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
    zoomControl: true,
    center: [36.60670888641815, 38.627929687],
    zoom: 6
  });

  L.tileLayer('http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/{z}/{x}/{y}.png', {
    attribution: 'Stamen'
  }).addTo(map);

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
    pixel_size: 3
  });

  torqueLayer.addTo(map);
  test_get_aggregated();

  // Analysis
  analysis = new gbif.ui.view.Analysis({ map: map });
  $("body").append(analysis.render());

  // Timeline
  timeline = new gbif.ui.view.Timeline({
    container: $("body")
  });

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
      draw: {
        position: 'topleft',
        polygon: {
          title: 'Draw a sexy polygon!',
          allowIntersection: false,
          drawError: {
            color: '#b00b00',
            timeout: 1000
          },
          shapeOptions: {
            color: '#bada55'
          },
          showArea: true
        },
        circle: {
          shapeOptions: {
            color: '#662d91'
          }
        }
      },
      edit: {
        featureGroup: drawnItems
      }
    });
    map.addControl(drawControl);

    map.on('draw:created', function (e) {
      var type = e.layerType,
        layer = e.layer;

      if (type === 'marker') {
        layer.bindPopup('A popup!');
      }

      drawnItems.addLayer(layer);
    });

}

$(function() {
  loadGBIF();
});
