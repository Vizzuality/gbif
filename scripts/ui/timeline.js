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
    current_cat: "sp",
    current_title: "Preserved Specimens",
    left_year: 1900,
    right_year: 2020,
    records: 0
  }
});

gbif.ui.view.Timeline = Backbone.View.extend({
  className: "timeline",

  events: {
    "click .action":      "_onClickAction",
    "click .year":        "_onClickYear",
    "click .hamburger a": "_onClickHamburger"
  },

  initialize: function() {
    _.bindAll(this, "_onStartDrag", "_onDrag", "_onStopDrag", "_onChangeCollapsed", "_onChangeCurrentCat", "_onHandleAdjusted");

    this.model = new gbif.ui.model.Timeline();

    // bindings
    this.model.bind("change:collapsed", this._onChangeCollapsed);
    this.model.bind("change:current_cat", this._onChangeCurrentCat);    

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

    this.timeline_tooltip = new gbif.ui.view.TimelineTooltip();

    $("body").append(this.button.render());
    $("body").append(this.timeline_tooltip.render());

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
      $("body").addClass("collapsed");

      $(this.$el).animate({
        'bottom': '20px',
        'left': '20px',
        'height': '44px'
      }, 150).addClass("collapsed");

      $(this.$zoom_control).animate({
        'margin': '20px 0 0 20px'
      }, 150);

      $(this.$timeline_control).animate({
        'top': '20px',
        'left': '100px'
      }, 150);

      $(this.$analysis_control).animate({
        'top': '20px',
        'right': '20px'
      }, 150);
    } else {
      $("body").removeClass("collapsed");

      if(typeof cats[this.model.get("current_cat")]['years'] !== 'undefined') {
        $(this.$el).animate({
          'bottom': '40px',
          'left': '40px',
          'height': '150px'
        }, 150).removeClass("collapsed");
      } else {
        $(this.$el).animate({
          'bottom': '40px',
          'left': '40px',
        }, 150);
      }

      $(this.$zoom_control).animate({
        'margin': '40px 0 0 40px'
      }, 150);

      $(this.$timeline_control).animate({
        'top': '40px',
        'left': '120px',
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

    if(!this.model.get("collapsed")) this.$current_drag.find(".tipsy").fadeIn(50);
  },

  _onDrag: function() {
    this.dragging = true;

    this.model.set("left_handle",  this.$left_handle.position().left,  { silent: true });
    this.model.set("right_handle", this.$right_handle.position().left, { silent: true });

    var current_handle_pos = this.$current_drag.position().left;

    this._updateDate(current_handle_pos);

    this.$range.find("div").css({ left: this.model.get("left_handle"), width: this.model.get("right_handle") - this.model.get("left_handle") });

    if ( this.current_drag_side === 'left' && current_handle_pos > this.model.get("right_handle") - this.grid_x) {
      this.fixPosition = "left";
      return false;
    } else if ( this.current_drag_side === 'right' && current_handle_pos < this.model.get("left_handle") + this.grid_x) {
      this.fixPosition = "right";
      return false;
    }
  },

  _updateDate: function(x, current) {
    var date = 1900;

    if(x === 0) { // hardcode no-date
      date = "NO DATE";
    } else if(x === 42) { // hardcode pre-date
      date = "PRE";
    } else if(x === 588) { // hardcode last year :(
      date = 2020;
    } else {
      _.find(this.years, function(y) {
        if(x >= y[0]) {
          date = y[1];
          return;
        }
      });
    }

    if(current && current === "left") {
      this.$left_handle && this.$left_handle.find(".tipsy span").html(date);
    } else if(current && current === "right") {
      this.$right_handle && this.$right_handle.find(".tipsy span").html(date);
    } else {
      this.$current_drag && this.$current_drag.find(".tipsy span").html(date);
      if(!this.model.get("collapsed")) this.$current_drag.find(".tipsy").show();
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

    setTimeout(function(){ self.$current_drag.find(".tipsy").fadeOut(150); }, 2000)

    this._adjustHandlePosition();
  },

  _adjustHandlePosition: function() {
    var self = this;

    if(this.current_drag_side === 'left') {
      this.$left_handle.animate({ left: this.model.get("left_handle") }, 150, self._onHandleAdjusted);
    } else {
      this.$right_handle.animate({ left: this.model.get("right_handle") }, 150, self._onHandleAdjusted);
    }
  },

  _adjustBothHandles: function() {
    this.$left_handle.animate({ left: this.model.get("left_handle") }, 150);
    this.$right_handle.animate({ left: this.model.get("right_handle") }, 150);

    this._onHandleAdjusted();
  },

  _onHandleAdjusted: function() {
    var self = this;

    svg.selectAll(".bar")
      .data(this.data)
      .style("fill", function(d) {
        var x = parseInt($(this).attr("x"), 10) + 84;

        if(x >= self.model.get("left_handle") && x < self.model.get("right_handle")) {
          return "#85C1F9";
        } else {
          return "#e5e5e5";
        }
      });

    var l = this.model.get("left_handle");
    var r = this.model.get("right_handle");

    this._updateDate(l, "left");
    this._updateDate(r, "right");

    var cat_array = [],
        key_array = [],
        nums_array = 0;

    this.$range.find("div").css({ left: l, width: r - l });

    _.find(this.years, function(y) {
      if(l <= y[0] && r > y[0]) {
        cat_array.push(y[1]);
      }

      if(l === 0) {
        self.model.set("left_year", "no date"); // hardcode no-date
      } else if(l === 42) {
        self.model.set("left_year", "pre-1990"); // hardcode pre-date
      } else if(l === y[0]) {
        self.model.set("left_year", y[1]);
      }

      if(r === y[0]) {
        self.model.set("right_year", y[1]);
      } else if(r === 588) {
        self.model.set("right_year", 2020); // hardcode last year :(
      }
    });

    if(l === 0) {
      cat_array.push("no");
    } else if(l === 42) {
      cat_array.push("pre");
    }

    for(var i = 0; i < cat_array.length; i++) {
      if(Array.isArray(cats[this.model.get("current_cat")]['years'][cat_array[i]])) {
        var _num = 0;

        for(var j = 0; j < cats[this.model.get("current_cat")]['years'][cat_array[i]].length; j++) {
          var key = cats[this.model.get("current_cat")]['years'][cat_array[i]][j];

          key_array.push(key);

          nums_array = nums_array + aggr_data[key];
        }
      } else {
        var key = cats[this.model.get("current_cat")]['years'][cat_array[i]];

        key_array.push(key);
      }

      nums_array = nums_array + aggr_data[key];
    }

    this.model.set("records", nums_array);

    this._updateLegendDesc();
    torqueLayer.setKey(key_array);
  },

  _updateLegendTitle: function() {
    $(this.$legend_title).text(this.model.get("current_title"));
  },

  _updateLegendDesc: function() {
    $(this.$legend_desc).text("Showing data from " + this.model.get("left_year") + " to " + this.model.get("right_year") + " (" + this.model.get("records") + " records)");
  },

  _enableDrag: function() {
    this.$el.find(".handle").draggable({
      containment: "parent",
      grid:  [this.grid_x, 0],
      axis:  "x",
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
      year = parseInt($(y).attr("data-year"), 10);
      self.years[i] = [$(y).position().left, year];
    });
  },

  _drawGraph: function() {
    var self = this;

    this.data = [];
    this.nums = [];

    for(var i = 0; i < this.years.length; i++) {
      item = {};

      item['year'] = this.years[i][1];
      item['num'] = aggr_data[cats[this.model.get("current_cat")]['years'][this.years[i][1]]];
      this.nums[i] = item['num'];

      this.data.push(item);
    }

    var x_extent = [1900, 2020],
        x_scale = d3.scale.linear()
                    .range([0,config.GRAPH_W])
                    .domain(x_extent);

    var y_extent = [d3.min(this.nums), d3.max(this.nums)],
        y_scale = d3.scale.linear()
                    .range([config.GRAPH_H, config.GRAPH_MARGIN])
                    .domain(y_extent);

    svg = d3.select(".legend")
      .append("svg")
      .attr("width", config.GRAPH_W)
      .attr("height", config.GRAPH_H+2*config.GRAPH_MARGIN);

    svg.selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("width", 42)
      .attr("height", 4)
      .attr("class", "bar")
      .attr("x", function(d) {
        return x_scale(d['year'])
      })
      .attr("y", function(d) {
        return y_scale(d['num'])
      });
  },

  _updateGraph: function() {
    var self = this;

    this.data = [];
    this.nums = [];

    for(var i = 0; i < this.years.length; i++) {
      item = {};

      item['year'] = this.years[i][1];
      if(Array.isArray(cats[this.model.get("current_cat")]['years'][this.years[i][1]])) {
        var _num = 0;

        for(var j = 0; j < cats[this.model.get("current_cat")]['years'][this.years[i][1]].length; j++) {
          _num = _num + aggr_data[cats[this.model.get("current_cat")]['years'][this.years[i][1]][j]];
        }

        item['num'] = _num;
      } else {
        item['num'] = aggr_data[cats[this.model.get("current_cat")]['years'][this.years[i][1]]];
      }

      this.nums[i] = item['num'];

      this.data.push(item);
    }

    var x_extent = [1900, 2020],
        x_scale = d3.scale.linear()
                    .range([0,config.GRAPH_W])
                    .domain(x_extent);

    var y_extent = [d3.min(this.nums), d3.max(this.nums)],
        y_scale = d3.scale.linear()
                    .range([config.GRAPH_H, config.GRAPH_MARGIN])
                    .domain(y_extent);

    svg.selectAll(".bar")
      .data(this.data)
      .attr("x", function(d) {
        return x_scale(d['year'])
      })
      .attr("y", function(d) {
        return y_scale(d['num'])
      });
  },

  _init: function() {
    var self = this;

    if (this.initialized) return;

    this.initialized = true;

    this.$left_handle  = this.$el.find(".handle.left");
    this.$right_handle = this.$el.find(".handle.right");

    this.$left_tipsy   = this.$left_handle.find(".tipsy");
    this.$right_tipsy  = this.$right_handle.find(".tipsy");

    this.$years        = this.$el.find(".years");
    this.$months       = this.$el.find(".visible_months");
    this.$trail        = this.$el.find(".trail");
    this.$range        = this.$el.find(".range");

    this.$analysis_control = $(".analysis_control");
    this.$timeline_control = $(this.button.$el);
    this.$zoom_control = $(".leaflet-control-zoom");

    this.$legend_title = this.$el.find(".legend .title");
    this.$legend_desc = this.$el.find(".legend .desc");

    this.options.container.append(this.$el);

    var svg = [];

    this._storeDatePositions();
    this._drawGraph();
    this._enableDrag();

    var left_handle_x  = parseInt(_.keys(this.years)[0], 10);
    var right_handle_x = parseInt(_.keys(this.years)[_.size(this.years)-1], 10) + 3;

    this.model.set("left_handle",  left_handle_x+84);
    this.model.set("right_handle", right_handle_x*42);

    setTimeout(function() { self._adjustHandlePosition(); }, 250);
  },

  _onClickHamburger: function(e) {
    e.preventDefault();

    this.timeline_tooltip.toggle();
  },

  _onChangeCurrentCat: function() {
    var self = this;

    if(typeof cats[this.model.get("current_cat")]['years'] !== 'undefined') {
      this.$el.find(".legend svg").show();
      this.$el.find(".slider").show();

      $(this.$el).animate({
        "height": 150
      }, 150).removeClass("collapsed");

      var left_handle_x  = parseInt(_.keys(this.years)[0], 10);
      var right_handle_x = parseInt(_.keys(this.years)[_.size(this.years)-1], 10) + 3;

      this.model.set("left_handle",  left_handle_x+84);
      this.model.set("right_handle", right_handle_x*42);

      setTimeout(function() { self._adjustBothHandles(); }, 250);

      this._updateLegendTitle();
      this._updateGraph();
    } else {
      this.$el.find(".legend svg").hide();
      this.$el.find(".slider").hide();

      $(this.$el).animate({
        "height": 44
      }, 150).addClass("collapsed");

      this._updateLegendTitle();

      var key = cats[this.model.get("current_cat")]['key'];

      this.model.set("records", aggr_data[key]);

      $(this.$legend_desc).text("Showing all records (" + this.model.get("records") + ")");

      torqueLayer.setKey(key);
    }
  },

  updateCat: function(key, title) {
    this.model.set("current_title", title);
    this.model.set("current_cat", key);
  },

  render: function() {
    this.$el.append(this.template.render( this.model.toJSON() ));
    return this.$el;
  }
});
