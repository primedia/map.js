// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  define(['jquery', 'flight/lib/component', '../utils/map_utils'], function($, defineComponent, map_utils) {
    var searchMapByAddress;
    searchMapByAddress = function() {
      this.defaultAttrs({
        icon: map_utils.assetURL() + "/images/nonsprite/map/map_pin_custom.png",
        addressContainer: '#address_search_container',
        addressSearchInputSel: '#searchTextField',
        addressSearchErrorSel: '#address_search_error',
        addressSearchBar: '#address_search',
        autocomplete: void 0
      });
      this.initSearchMarker = function(ev, data) {
        var input;
        this.map = data.gMap;
        input = this.$node.find(this.attr.addressSearchInputSel)[0];
        this.attr.autocomplete = new google.maps.places.Autocomplete(input);
        this.attr.autocomplete.bindTo('bounds', this.map);
        this.attr.autocomplete.setTypes([]);
        this.handleAddressTextChange();
        this.toggleAddressFieldDisplay();
        this.setPlaceListener();
        this.positionControl();
      };
      this.positionControl = function() {
        var control;
        control = $('<div/>');
        control.append($(this.attr.addressContainer));
        control.index = 2;
        return this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control[0]);
      };
      this.handleAddressTextChange = function() {
        var searchError, searchInput;
        searchInput = this.$node.find(this.attr.addressSearchInputSel);
        searchError = this.$node.find(this.attr.addressSearchErrorSel);
        return searchInput.keyup((function(_this) {
          return function(e) {
            if (searchError.is(':visible') && e.keyCode !== 13) {
              return searchError.slideUp();
            }
          };
        })(this));
      };
      this.toggleAddressFieldDisplay = function() {
        var searchBar;
        searchBar = this.$node;
        searchBar.show(100);
        return this.$node.select(this.attr.addressSearchInputSel).focus();
      };
      this.setPlaceListener = function() {
        var autocomplete;
        autocomplete = this.attr.autocomplete;
        this.currentSearchPin = this.setSearchPinOptions();
        return google.maps.event.addListener(autocomplete, "place_changed", (function(_this) {
          return function() {
            var place;
            place = autocomplete.getPlace();
            if (place && place.geometry) {
              _this.location = place.geometry.location;
              _this.setAddressPin();
              return _this.searchPinAutoTag();
            } else {
              return _this.addError("Please Select An Address From the List");
            }
          };
        })(this));
      };
      this.addError = function(errorText) {
        $(this.attr.addressSearchErrorSel).html(errorText);
        return $(this.attr.addressSearchErrorSel).slideDown();
      };
      this.setAddressPin = function() {
        this.currentSearchPin.setPosition(this.location);
        this.map.setCenter(this.location);
        this.map.setZoom(13);
        return this.currentSearchPin.setVisible;
      };
      this.setSearchPinOptions = function() {
        return new google.maps.Marker({
          position: this.location,
          map: this.map,
          icon: this.attr.icon,
          draggable: true
        });
      };
      this.searchPinAutoTag = function() {
        var obj;
        obj = {
          cg: 'map',
          sg: 'pinDrop',
          item: 'geoCode',
          value: this.currentSearchPin.position.lng() + ',' + this.currentSearchPin.position.lat(),
          radius: null,
          listingCount: null,
          ltc: null
        };
        return WH.fire(obj);
      };
      return this.after('initialize', function() {
        return this.on(document, 'mapRenderedFirst', this.initSearchMarker);
      });
    };
    return defineComponent(searchMapByAddress);
  });

}).call(this);
