// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery'], function($) {
    var ToolTip;
    return ToolTip = (function(_super) {
      __extends(ToolTip, _super);

      function ToolTip(map) {
        this.map = map;
        this.mapDiv = $(this.map.getDiv());
      }

      ToolTip.prototype.container = $("<div/>", {
        "class": "hood_info_window"
      });

      ToolTip.prototype.addressBar = $('#address_search');

      ToolTip.prototype.listeners = [];

      ToolTip.prototype.offset = {
        x: 20,
        y: 20
      };

      ToolTip.prototype.draw = function() {
        var projection, px;
        projection = this.getProjection();
        if (!projection) {
          return;
        }
        px = projection.fromLatLngToDivPixel(this.position);
        if (!px) {
          return;
        }
        return this.container.css({
          left: this.getLeft(px),
          top: this.getTop(px)
        });
      };

      ToolTip.prototype.destroy = function() {
        this.setMap(null);
        return this.clearListeners();
      };

      ToolTip.prototype.onAdd = function() {
        return this.container.appendTo(this.getPanes().floatPane);
      };

      ToolTip.prototype.onRemove = function() {
        return this.container.hide();
      };

      ToolTip.prototype.setContent = function(html) {
        this.setMap(this.map);
        this.container.html(html);
        return this.show();
      };

      ToolTip.prototype.updatePosition = function(overlay) {
        return this.listeners.push(google.maps.event.addListener(overlay, "mousemove", (function(_this) {
          return function(event) {
            return _this.onMouseMove(event.latLng);
          };
        })(this)));
      };

      ToolTip.prototype.onMouseMove = function(latLng) {
        this.position = latLng;
        return this.draw();
      };

      ToolTip.prototype.hide = function() {
        this.container.hide().empty();
        return this.clearListeners();
      };

      ToolTip.prototype.show = function() {
        return this.container.show();
      };

      ToolTip.prototype.clearListeners = function() {
        var listener, _i, _len, _ref, _results;
        _ref = this.listeners;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          listener = _ref[_i];
          _results.push(google.maps.event.removeListener(listener));
        }
        return _results;
      };

      ToolTip.prototype.getLeft = function(position) {
        var centerOffsetX, pos;
        centerOffsetX = this.mapRealCenter().x - this.mapCenter().x;
        pos = this.mapWidth() - position.x - this.container.outerWidth() - this.offset.x - centerOffsetX;
        if (pos < 0) {
          return this.mapWidth() - this.container.outerWidth() - this.offset.x - centerOffsetX;
        } else {
          return position.x + this.offset.x;
        }
      };

      ToolTip.prototype.getTop = function(position) {
        var addressBarHeight, bottom, centerOffsetY, height, isBottom, top;
        top = this.mapHeight() - position.y;
        height = this.container.outerHeight() + this.offset.y;
        centerOffsetY = Math.abs(this.mapRealCenter().y - this.mapCenter().y);
        addressBarHeight = (this.addressBar.outerHeight() || 0) + this.offset.y;
        bottom = this.mapHeight() - top - height - addressBarHeight - centerOffsetY;
        isBottom = bottom < 0;
        if (isBottom) {
          return centerOffsetY + addressBarHeight;
        } else {
          return this.mapHeight() - top - height;
        }
      };

      ToolTip.prototype.mapWidth = function() {
        return this.mapDiv.outerWidth();
      };

      ToolTip.prototype.mapHeight = function() {
        return this.mapDiv.outerHeight();
      };

      ToolTip.prototype.mapCenter = function() {
        return this.getProjection().fromLatLngToDivPixel(this.map.getCenter());
      };

      ToolTip.prototype.mapRealCenter = function() {
        return new google.maps.Point(this.mapWidth() / 2, this.mapHeight() / 2);
      };

      return ToolTip;

    })(google.maps.OverlayView);
  });

}).call(this);
