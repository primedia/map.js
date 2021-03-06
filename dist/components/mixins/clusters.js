'use strict';
define(['flight/lib/compose', 'marker-clusterer', 'map/components/mixins/mobile_detection', 'map/components/mixins/cluster_opts'], function(compose, markerClusterer, mobileDetection, clusterOpts) {
  var markerClusters;
  markerClusters = function() {
    compose.mixin(this, [mobileDetection, clusterOpts]);
    this.defaultAttrs({
      markerClusterer: void 0
    });
    this.mapClusterOptions = function() {
      return {
        averageCenter: true,
        styles: this.clusterStyleArray(),
        minimumClusterSize: this.clusterSize(),
        batchSize: this.isMobile() ? 200 : null,
        declusterAnimationDuration: this.attr.declusterAnimationDuration,
        declusterAnimationMarkerThreshold: this.attr.declusterAnimationMarkerThreshold,
        declusterAnimationEasing: this.attr.declusterAnimationEasing
      };
    };
    this.initClusterer = function(gMap) {
      if (this.attr.markerClusterer) {
        return;
      }
      this.attr.markerClusterer = new MarkerClusterer(gMap, [], this.mapClusterOptions());
      google.maps.event.addListener(this.attr.markerClusterer, 'mouseover', function(cluster) {
        return $(document).trigger('markerClusterMouseOver', {
          cluster: cluster
        });
      });
      google.maps.event.addListener(this.attr.markerClusterer, 'mouseout', function(cluster) {
        return $(document).trigger('markerClusterMouseOut', {
          cluster: cluster
        });
      });
      return google.maps.event.addListener(this.attr.markerClusterer, 'click', function(cluster) {
        return $(document).trigger('markerClusterClick', {
          cluster: cluster
        });
      });
    };
    this.setClusterImage = function(ev, data) {
      this.attr.mapPinCluster = data.pinsClusterImage;
      return this.off(document, 'clusterImageChange');
    };
    return this.after('initialize', function() {
      return this.on(document, 'clusterImageChange', this.setClusterImage);
    });
  };
  return markerClusters;
});
