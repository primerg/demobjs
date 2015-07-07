workspace.Filter = Backbone.Model.extend({
    defaults: {
        id: 'global',
        scopeType: '',
        scopeID: '',
        dateFrom: '',
        dateTo: '',
        dateType: '',
        link: '',
        title: '',
        contentView: 'tile1',
        tile: {},
        tileUrl: ''
    }
});

var FilterModel = new workspace.Filter();