/**
* logging
*/

(function() {

  // Error management
  gbif.core.Error = Backbone.Model.extend({
    url: gbif.config.REPORT_ERROR_URL,
    initialize: function() {
      this.set({browser: JSON.stringify($.browser) });
    }
  });

  gbif.core.ErrorList = Backbone.Collection.extend({
    model: gbif.core.Error
  });

  /** contains all of the app errors */
  gbif.errors = new gbif.core.ErrorList();

  // error tracking!
  if(gbif.config.ERROR_TRACK_ENABLED) {
    window.onerror = function(msg, url, line) {
      gbif.errors.create({
        msg: msg,
        url: url,
        line: line
      });
    };
  }


  // logging
  var _fake_console = function() {};
  _fake_console.prototype.error = function(){};
  _fake_console.prototype.log= function(){};

  //IE7 love
  if(typeof console !== "undefined") {
    _console = console;
  } else {
    _console = new _fake_console();
  }

  gbif.core.Log = Backbone.Model.extend({

    error: function() {
      //_console.error.apply(_console, arguments);
      gbif.errors.create({
        msg: Array.prototype.slice.call(arguments).join('')
      });
    },

    log: function() {
      _console.log.apply(_console, arguments);
    },

    info: function() {
      _console.log.apply(_console, arguments);
    },

    debug: function() {
      _console.log.apply(_console, arguments);
    }
  });

})();

gbif.log = new gbif.core.Log({tag: 'gbif'});
