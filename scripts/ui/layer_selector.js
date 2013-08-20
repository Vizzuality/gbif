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
      name: "stamen",
      url: "http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/{z}/{x}/{y}.png",
      attribution: "Stamen",
      selected: true
    }));
    this.layers.add(new gbif.ui.model.Layer({
      name: "gray-blue",
      url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
      attribution: "Nokia"
    }));
    this.layers.add(new gbif.ui.model.Layer({
      name: "satellite",
      url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
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
        height: 0
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
          height: 124
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
