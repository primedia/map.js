// Generated by CoffeeScript 1.7.0
(function() {
  'use strict';
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(['jquery', 'map/ui/base_map'], function($, BaseMap) {
    var MapCanvas, MapUi;
    MapCanvas = (function() {
      function MapCanvas(canvas) {
        this.canvas = canvas;
        this.triggerContainerSizeChange = __bind(this.triggerContainerSizeChange, this);
        this.listenForCanvasChanges();
        this.resetPosition();
      }

      MapCanvas.prototype.listenForCanvasChanges = function() {
        return $(window).bind("resize", (function(_this) {
          return function() {
            return _this.triggerContainerSizeChange();
          };
        })(this));
      };

      MapCanvas.prototype.resetPosition = function() {
        return $(this.canvas).css({
          height: this.containerHeight,
          width: this.containerWidth
        });
      };

      MapCanvas.prototype.triggerContainerSizeChange = function() {
        return $(document).trigger('mapCanvasResized', {
          height: this.containerHeight(),
          width: this.containerWidth()
        });
      };

      MapCanvas.prototype.containerHeight = function() {
        var canvasHeight;
        return canvasHeight = $("body").height() - $('#header').height();
      };

      MapCanvas.prototype.containerWidth = function() {
        var mapWindowWidth;
        return mapWindowWidth = $(window).width() - $('#hybrid_list').width();
      };

      return MapCanvas;

    })();
    MapUi = (function() {
      function MapUi() {}

      MapUi.initialize = function() {
        var mapCanvas;
        mapCanvas = new MapCanvas("#map_canvas");
        return BaseMap.attachTo(mapCanvas.canvas);
      };

      return MapUi;

    })();
    return MapUi.initialize;
  });

}).call(this);