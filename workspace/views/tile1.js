'use strict';

var Tile1View = Backbone.View.extend({
    el: '#group-tiles-1',
    events: {
        'click .tile-header a.icon-expand': 'showTile8',
        'click .tile-data a': 'showTile8',
    },
    showTile8: function(event) {
        var tile = $(event.currentTarget);
        var id = tile.data('tild-id');

        // return false;
        FilterModel.set({
            'contentView': 'tile8',
            'tileUrl': tile.attr('href')
        });
        return false;
    },
    initialize: function() {
        Logger.push('initialize tile1');
    }
});