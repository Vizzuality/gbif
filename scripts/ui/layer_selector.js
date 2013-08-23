gbif.ui.model.Layer = Backbone.Model.extend({
  defaults: {
    selected: false
  }
});

gbif.ui.collection.Layers = Backbone.Collection.extend({
  model: gbif.ui.model.Layer
});

gbif.ui.model.LayerSelector = Backbone.Model.extend({
  defaults: {
    closed: true
  }
});

gbif.ui.view.LayerSelector = Backbone.View.extend({
  className: 'layer_selector',

  events: {
    "click li a": "_onLayerClick",
  },

  initialize: function() {
    _.bindAll( this, "_toggleOpen");

    this.options = _.extend(this.options, this.defaults);

    this.layers = new gbif.ui.collection.Layers();

    this.layers.add(new gbif.ui.model.Layer({
      name: "dark",
      url: "http://{s}.tiles.mapbox.com/v3/timrobertson100.map-c9rscfra/{z}/{x}/{y}.png",
      attribution: 'Mapbox, <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap and its contributors</a>',
    }));

    this.layers.add(new gbif.ui.model.Layer({
      name: "ocean",
      url: "http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}.png",
      attribution: "Esri, DeLorme, FAO, USGS, NOAA, GEBCO, IHO-IOC GEBCO, NGS, NIWA",
      selected: true
    }));

    this.layers.add(new gbif.ui.model.Layer({
      name: "satellite",
      url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
      attribution: "Esri, DeLorme, FAO, NOAA, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community",
    }));

    this.layers.add(new gbif.ui.model.Layer({
      name: "light",
      url: "http://{s}.tiles.mapbox.com/v3/timrobertson100.map-s9fg80cf/{z}/{x}/{y}.png",
      attribution: 'Mapbox, <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap and its contributors</a>',
    }));

    this.layers.add(new gbif.ui.model.Layer({
      name: "grey-blue",
      url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
      attribution: "Nokia"
    }));

    // this.layers.bind("change", function() { debugger; });

    this.selectedLayer = this.layers.find(function(layer) { return layer.get("selected"); });

    this.model = new gbif.ui.model.LayerSelector();

    this.model.bind("change:closed", this._toggleOpen);

    var template = $("#layer_selector-template").html();

    this.template = new gbif.core.Template({
      template: template
    });
  },

  _addLayers: function() {
    var self = this;

    var template = new gbif.core.Template({
      template: $("#layer-template").html()
    });

    this.$layers.empty();
    this.layers.each(function(layer) {
      self.$layers.append(template.render( layer.toJSON() ));
    });
  },

  _addSelectedLayer: function() {
    var template = new gbif.core.Template({
      template: $("#layer-template").html()
    });

    this.$selected_layer.empty();
    this.$selected_layer.append(template.render( this.selectedLayer.toJSON() ));
  },

  _toggleOpen: function() {
    var self = this;

    if(this.model.get("closed")) {
      this.$el.addClass("closed");

      this.$layers.animate({
        opacity: 0,
        width: 0
      }, 150, function() {
        self.$layers.hide();
        self.$selected_layer.fadeIn(150);
      });
    } else {
      this.$el.removeClass("closed");

      this.$selected_layer.fadeOut(150, function() {
        self.$layers.show();
        self.$layers.animate({
          opacity: 1,
          width: 32 * self.layers.length + 5 * (self.layers.length - 2) + 8
        }, 150);
      });
    }
  },

  _onLayerClick: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    var map = this.options.map;
    var $li  = $(e.target).closest("li");
    var name = $li.attr("id");

    if(this.selectedLayer.get("name") === name) {
      if($li.parent().hasClass("selected_layer")) {
        this.open();
      } else {
        this.close();
      }

      return;
    }

    map.attributionControl.removeAttribution(this.selectedLayer.get("attribution"));

    var layer = this.layers.find(function(layer) { return name === layer.get("name"); });
    this.selectedLayer.set("selected", false);
    layer.set("selected", true);
    this.selectedLayer = layer;

    baseMap.setUrl(this.selectedLayer.get("url"));
    map.attributionControl.addAttribution(this.selectedLayer.get("attribution"));

    this._addLayers();
    this._addSelectedLayer();

    this.close();
  },

  open: function() {
    this.model.set("closed", false);
  },

  close: function() {
    this.model.set("closed", true);
  },

  render: function() {
    this.$el.append(this.template.render( this.model.toJSON() ));

    this.$layers         = this.$el.find(".layers");
    this.$selected_layer = this.$el.find(".selected_layer");

    this._addSelectedLayer();
    this._addLayers();
    this._toggleOpen();

    return this.$el;
  }
});
