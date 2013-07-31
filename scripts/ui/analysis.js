gbif.ui.view.AnalysisButton = Backbone.View.extend({
  className: 'analysis_control',

  events: {
    'click a#analysis_control': '_onClickButton'
  },

  initialize: function() {
    var template = $("#analysis_control-template").html();

    this.template = new gbif.core.Template({
      template: template
    });
  },

  enable: function() {
    this.model.set("active", true);
    this.model.set("buttontext", "Cancel");
  },

  disable: function() {
    this.model.set("active", false);
    this.model.set("buttontext", "Report an error");
  },

  _onClickButton: function() {
    var self = this;

    if(!this.model.get("active")) {
      analysis.startAnalysis();

      this.$el.find("i").addClass("active");
      this.$el.find(".analysis span").text(this.model.get("buttontext"));

      setTimeout(function() {
        self.$el.find(".analysis").animate({
          'width': 50
        }, 150);

        self.$el.find(".analysis_explanation p").animate({
          'margin-right': 67
        }, 150);
      }, 150);
    } else {
      analysis.stopAnalysis();

      this.$el.find(".analysis").animate({
        'width': 100
      }, 150, function() {
        self.$el.find(".analysis_explanation p").animate({
          'margin-right': -256
        }, 150, function() {
          self.$el.find("i").removeClass("active");
          self.$el.find(".analysis span").text(self.model.get("buttontext"));
        });
      });
    }
  },

  render: function() {
    this.$el.html(this.template.render( this.model.toJSON() ));

    this.$explanation = this.$el.find(".analysis_explanation");

    return this.$el;
  }
});


gbif.ui.model.Analysis = Backbone.Model.extend({
  defaults: {
    active: false,
    buttontext: "Report an error"
  }
});

gbif.ui.view.Analysis = gbif.core.View.extend({
  initialize: function() {
    this.model = new gbif.ui.model.Analysis();

    _.bindAll(this, "_toggleAnalysis");

    // bindings
    this.model.bind("change:active", this._toggleAnalysis);

    this.map = this.options.map;
    this.analyzing = false;
    this.selectedShapes = [];
    this.selectedShape;
  },

  _clearAnalysis: function() {
    this._clearSelection();
    this._deleteSelectedShape();

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
      this.drawingManager.setOptions({ drawingControl: false });
      this.drawingManager.path = null;
    }

    this.button.disableButton();
  },

  startAnalysis: function() {
    // this._clearAnalysis();
    // this._setupDrawingManager();
    this.model.set("active", true);
  },

  stopAnalysis: function() {
    this.model.set("active", false);
  },

  _toggleAnalysis: function() {
    if(this.model.get("active")) {
      this.button.enable();
    } else {
      this.button.disable();
    }
  },

  render: function() {
    this.button = new gbif.ui.view.AnalysisButton({
      model: this.model
    });

    $("body").append(this.button.render());

    return this.$el;
  }

  // _setupDrawingManager: function() {
  //   var self = this;

  //   var options = {
  //     drawingModes: [ google.maps.drawing.OverlayType.POLYGON ],
  //     drawingControl: false,
  //     markerOptions: {
  //       draggable: false,
  //       icon: new google.maps.MarkerImage(
  //         '/assets/icons/marker_exclamation.png',
  //         new google.maps.Size(45, 45), // desired size
  //         new google.maps.Point(0, 0),  // offset within the scaled sprite
  //         new google.maps.Point(20, 20) // anchor point is half of the desired size
  //       )
  //     },

  //     drawingControlOptions: {
  //       position: google.maps.ControlPosition.RIGHT_TOP,
  //       drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.MARKER]
  //     },

  //     polygonOptions: config.ANALYSIS_OVERLAYS_STYLE,
  //     panControl: false,
  //     map: self.map
  //   };

  //   // Create the drawing manager
  //   this.drawingManager = new google.maps.drawing.DrawingManager(options);

  //   // Start drawing right away
  //   this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

  //   // Event binding
  //   google.maps.event.addListener(this.drawingManager, 'overlaycomplete', this._onOverlayComplete);
  // },

  // _onOverlayComplete: function(e) {
  //   this.drawingManager.setDrawingMode(null);
  //   this.drawingManager.path = e.overlay.getPath().getArray();
  //   this.drawingManager.setOptions({ drawingControl: false });
  //   this._enableDoneButton();

  //   var newShape = e.overlay;
  //   newShape.type = e.type;

  //   this._setSelection(newShape);

  //   polygon = {
  //     "type": "MultiPolygon",
  //     "coordinates": [
  //       [
  //         $.map(this.drawingManager.path, function(latlong, index) {
  //           return [[latlong.lng(), latlong.lat()]];
  //         })
  //       ]
  //     ]
  //   };

  //   var area = this._calcArea(polygon);

  //   analysis.info.model.set("ha", area);
  // },

  // _clearSelection: function() {

  //   if (this.selectedShapes.length > 0) {

  //     for (var i in this.selectedShapes) {
  //       if (this.selectedShapes[i]) {
  //         this.selectedShapes[i].setEditable(true);
  //         this.selectedShapes[i].setMap(null);
  //       }
  //     }

  //     this.selectedShapes = [];
  //     if (this.drawingManager && this.drawingManager.path) this.drawingManager.path = null;
  //   }
  // },

  // _deleteSelectedShape: function() {
  //   if (this.selectedShape) {
  //     this.selectedShape.setMap(null);
  //     this.selectedShape = null;
  //   }
  // },

  // _setSelection: function(shape) {
  //   this._clearSelection();
  //   this.selectedShape = shape;
  // },

  // _onClickCancel: function(e) {
  //   e.preventDefault();

  //   analysis.analyzing = false;
  //   this._clearAnalysis();
  //   this._hideHelper();
  // },

  // // Done button
  // _toggleDoneButton: function() {
  //   if (this.model.get("toggleDoneButton")) {
  //     this.$doneButton.removeClass("disabled");
  //   } else {
  //     this.$doneButton.addClass("disabled");
  //   }
  // },

  // _enableDoneButton: function() {
  //   this.model.set("toggleDoneButton", true);
  // },

  // _disableDoneButton: function() {
  //   this.model.set("toggleDoneButton", false);
  // },

  // _onClickDone: function(e) {
  //   e.preventDefault();

  //   this._done();
  // },

  // _done: function() {
  //   analysis.analyzing = false;
  //   this.button._disableButton();
  //   this._hideHelper();
  //   this.info.show();

  //   if (this.selectedShape) this.selectedShape.setEditable(false);
  // },
});
