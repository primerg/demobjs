workspace.Tile = Backbone.Model.extend({
    defaults: {
        id: '',
        name: '',
        subname: '',
        deviceType: '',
        device: '',
    }
});

var TileModel = new workspace.Tile();
