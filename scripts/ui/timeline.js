gbif.ui.view.TimelineButton = Backbone.View.extend({
  className: 'timeline_control',

  events: {
    'click a#fullscreen': '_onClickButton'
  },

  initialize: function() {
    var template = $("#timeline_control-template").html();

    this.template = new gbif.core.Template({
      template: template
    });
  },

  _onClickButton: function(e) {
    e.preventDefault();

    timeline.toggle();
  },

  render: function() {
    this.$el.html(this.template.render( this.model.toJSON() ));
    return this.$el;
  }
});

gbif.ui.model.Timeline = Backbone.Model.extend({
  defaults: {
    collapsed: false,
    playing: false,
    startYear: 2006,
    endYear:   2014,
    animationSpeed: 200,
    animationDelay: 100
  }
});

gbif.ui.view.Timeline = gbif.ui.view.Widget.extend({
  className: "timeline",

  events: {
    "click .action":  "_onClickAction",
    "click .year":    "_onClickYear"
  },

  initialize: function() {
    _.bindAll(this, "_onStartDrag", "_onDrag", "_onStopDrag", "_onChangeCollapsed", "_onHandleAdjusted");

    this.model = new gbif.ui.model.Timeline();

    // bindings
    this.model.bind("change:collapsed", this._onChangeCollapsed);

    // defaults
    this.grid_x = 42;

    var template = $("#timeline-template").html();

    this.template = new gbif.core.Template({
      template: template
    });

    this.render();

    this.button = new gbif.ui.view.TimelineButton({
      model: this.model
    });

    $("body").append(this.button.render());

    this._init();
  },

  expand: function() {
    this.model.set("collapsed", false);
  },

  collapse: function() {
    this.model.set("collapsed", true);
  },

  toggle: function() {
    if(this.model.get("collapsed")) {
      this.model.set("collapsed", false);
    } else {
      this.model.set("collapsed", true);
    }
  },

  _onChangeCollapsed: function() {
    if(this.model.get("collapsed")) {
      $(this.$el).animate({
        'bottom': '20px',
        'left': '20px',
        'height': '44px'
      }, 150).addClass("collapsed");

      $(this.$timeline_control).animate({
        'top': '20px',
        'left': '20px'
      }, 150);

      $(this.$analysis_control).animate({
        'top': '20px',
        'right': '20px'
      }, 150);
    } else {
      $(this.$el).animate({
        'bottom': '40px',
        'left': '40px',
        'height': '150px'
      }, 150).removeClass("collapsed");

      $(this.$timeline_control).animate({
        'top': '40px',
        'left': '40px',
      }, 150);

      $(this.$analysis_control).animate({
        'top': '40px',
        'right': '40px',
      }, 150);
    }
  },

  _onStartDrag: function(e) {
    this.dragging = true;

    this.$current_drag = $(e.target);
    this.current_drag_side = this.$current_drag.hasClass("left") ? "left" : "right";

    if (this.playing) {
      this.$line.fadeOut(150);
      this._stopAnimation();
      this.model.set("playing", false);

      return;
    }
  },

  _onDrag: function() {
    this.dragging = true;

    if(this.playing) {
      this.$line.fadeOut(150);
      this._stopAnimation();
      this.model.set("playing", false);

      return false;
    }

    this.model.set("left_handle",  this.$left_handle.position().left,  { silent: true });
    this.model.set("right_handle", this.$right_handle.position().left, { silent: true });

    var current_handle_pos = this.$current_drag.position().left;

    this.$range.find("div").css({ left: this.model.get("left_handle"), width: this.model.get("right_handle") - this.model.get("left_handle") });

    if ( this.current_drag_side === 'left' && current_handle_pos > this.model.get("right_handle") - this.grid_x) {
      this.fixPosition = "left";
      return false;
    } else if ( this.current_drag_side == 'right' && current_handle_pos < this.model.get("left_handle") + this.grid_x) {
      this.fixPosition = "right";
      return false;
    }
  },

  _onStopDrag: function() {
    var self = this;

    this.dragging = false;

    if (this.fixPosition) {
      if      (this.fixPosition === 'left')  this.model.set("left_handle",  this.model.get("right_handle") - this.grid_x);
      else if (this.fixPosition === 'right') this.model.set("right_handle", this.model.get("left_handle")  + this.grid_x);

      this.fixPosition = null;
    }

    this._adjustHandlePosition();

    svg.selectAll(".bar")
      .data(_data)
      .style("fill", function(d) {
        var x = $(this).attr("x");

        if(x >= self.model.get("left_handle") && x < self.model.get("right_handle")) {
          return "#85C1F9";
        } else {
          return "#e5e5e5";
        }
      });
  },

  _adjustHandlePosition: function() {
    var self = this;

    if(this.current_drag_side === 'left') {
      this.$left_handle.animate({ left: this.model.get("left_handle") }, 150, self._onHandleAdjusted);
    } else {
      this.$right_handle.animate({ left: this.model.get("right_handle") }, 150, self._onHandleAdjusted);
    }
  },

  _onHandleAdjusted: function() {
    var l = this.$left_handle.position().left;
    var r = this.$right_handle.position().left;

    var cat_array = [],
        key_array = [];

    this.$range.find("div").css({ left: this.model.get("left_handle"), width: this.model.get("right_handle") - this.model.get("left_handle") });

    _.find(this.years, function(y) {
      if(l <= y[0] && r > y[0]) {
        cat_array.push(y[1]);
      }
    });

    for(var i = 0; i < cat_array.length; i++) {
      key_array.push(cat_keys[current_cat][cat_array[i]]);
    }

    torqueLayer.setKey(key_array);
  },

  _enableDrag: function() {
    this.$el.find(".handle").draggable({
      containment: "parent",
      grid: [this.grid_x, 0],
      axis: "x",
      start: this._onStartDrag,
      drag:  this._onDrag,
      stop:  this._onStopDrag
    });
  },

  _storeDatePositions: function() {
    var self = this;

    this.years  = [];

    var j    = 0;
    var year = 0;

    _.each(this.$years.find(".year a"), function(y, i) {
      // Store year positions
      year = parseInt($(y).attr("data-year"), 10);
      self.years[i] = [$(y).position().left, year];
    });
  },

  _drawGraph: function() {
    var x_extent = [1900, 2020],
        x_scale = d3.scale.linear()
                    .range([0,config.GRAPH_W])
                    .domain(x_extent);

    var y_extent = [0, 100],
        y_scale = d3.scale.linear()
                    .range([config.GRAPH_H, config.GRAPH_MARGIN])
                    .domain(y_extent);

    d3.json(config.CARTODB_URL+'?q=SELECT years, num FROM untitled_table', function(data) {
      _data = data.rows;

      svg = d3.select(".legend")
        .append("svg")
        .attr("width", config.GRAPH_W)
        .attr("height", config.GRAPH_H+2*config.GRAPH_MARGIN);

      svg.selectAll("rect")
        .data(_data)
        .enter()
        .append("rect")
        .attr("width", 42)
        .attr("height", 4)
        .attr("class", "bar")
        .attr("x", function(d) {
          return x_scale(d['years'])
        })
        .attr("y", function(d) {
          return y_scale(d['num'])
        });
    });
  },

  _init: function() {
    var self = this;

    if (this.initialized) return;

    this.initialized = true;

    this.$left_handle  = this.$el.find(".handle.left");
    this.$right_handle = this.$el.find(".handle.right");

    this.$line         = this.$el.find(".line");

    this.$left_tipsy   = this.$left_handle.find(".tipsy");
    this.$right_tipsy  = this.$right_handle.find(".tipsy");

    this.$play         = this.$el.find(".play");

    this.$years        = this.$el.find(".years");
    this.$months       = this.$el.find(".visible_months");
    this.$trail        = this.$el.find(".trail");
    this.$range        = this.$el.find(".range");

    this.$analysis_control = $(".analysis_control");
    this.$timeline_control = $(this.button.$el);

    this.options.container.append(this.$el);

    var svg = [];
    var _data = [];

    this._storeDatePositions();
    this._drawGraph();
    this._enableDrag();

    var left_handle_x  = parseInt(_.keys(this.years)[0], 10);
    var right_handle_x = parseInt(_.keys(this.years)[_.size(this.years)-1], 10) + 1;

    this.model.set("left_handle",  left_handle_x);
    this.model.set("right_handle", right_handle_x*42);
    this.model.set("player", left_handle_x);

    setTimeout(function() { self._adjustHandlePosition(); }, 250);
  },

  render: function() {
    this.$el.append(this.template.render( this.model.toJSON() ));
    return this.$el;
  }
});
