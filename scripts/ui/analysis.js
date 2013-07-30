gbif.ui.model.AnalysisButton = Backbone.Model.extend({
  defaults: {
    active: false,
    text: "Report an error"
  }
});

gbif.ui.view.AnalysisButton = Backbone.View.extend({
  className: 'analysis_control',

  events: {
    'click a#analysis_control': '_onClickButton'
  },

  initialize: function() {
    this.model = new gbif.ui.model.AnalysisButton();

    var template = $("#analysis_control-template").html();

    this.template = new gbif.core.Template({
      template: template
    });
  },

  render: function() {
    this.$el.html(this.template.render( this.model.toJSON() ));

    return this.$el;
  }
});


gbif.ui.model.Analysis = Backbone.Model.extend();

gbif.ui.view.Analysis = gbif.core.View.extend({

  initialize: function() {
    // _.bindAll(this, "_clearAnalysis", "_onOverlayComplete", "_clearSelection");

    this.map = this.options.map;
    this.analyzing = false;
    this.selectedShapes = [];
    this.selectedShape;

    this.model = new gbif.ui.model.Analysis();
  },

  _clearAnalysis: function() {
    this._clearSelection();
    this._deleteSelectedShape();

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null);
      this.drawingManager.setOptions({ drawingControl: false });
      this.drawingManager.path = null;
    }

    this.button._enableButton();
  },

  startAnalyzing: function() {
    this._clearAnalysis();
    this._setupDrawingManager();
    this.analyzing = true;
  },

  render: function() {
    var that = this;

    var buttonModel = new gbif.ui.model.AnalysisButton();

    this.button = new gbif.ui.view.AnalysisButton({
      model: buttonModel
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
