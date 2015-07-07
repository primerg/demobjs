'use strict';

var WorkspaceView = Backbone.View.extend({
    el: '#content-content',
    updateContent: function() {
        this.render()
    },
    initialize: function(){
        FilterModel.on('change', this.updateContent, this);

        var p = URLHelper.getPath();
        if (p[0] == 'workspace' && p.length == 2) {
            var path = URLHelper.fullPath();
            FilterModel.set({
                'contentView': 'tile8',
                'tileUrl': path
            });
        }
    },
    render: function(){
        this.scope = FilterModel.get('scopeType');
        this.scopeID = FilterModel.get('scopeID');
        this.dfrom = FilterModel.get('dateFrom');
        this.dto = FilterModel.get('dateTo');
        this.dtype = FilterModel.get('dateType');
        this.sLink = FilterModel.get('link');
        this.contentView = FilterModel.get('contentView');
        this.tile = FilterModel.get('tile');
        this.tileUrl = FilterModel.get('tileUrl');

        var html = '';
        html += 'Scope: ' + this.scope  + ' - ' + this.scopeID;
        html += "\nDatetype: " + this.dtype + " ~Date: " + this.dfrom + ' - ' + this.dto;
        html += "\View: " + this.contentView;
        Logger.push(html);

        var that = this;

        // console.log(that.tileUrl + '~' + this.scope + '~' + this.scopeID + '~' + this.contentView)
        if (this.scope.length > 0 && this.dfrom) {
            if (this.contentView == 'tile1') {
                this.renderTile1();
            } else {
                this.renderTile8();
            }
        }
    },
    renderTile1: function() {
        var self = this;
        if (this.scopeID.length > 0 && this.dfrom.length > 0 && this.dto.length > 0) {
            var url = '/workspace' + 
                '?id=' + this.sLink + 
                '&group=' + this.scope + 
                '&dfrom=' + this.dfrom +
                '&dto=' + this.dto +
                '&dtype=' + this.dtype;

            URLHelper.push(url);
            Loader.show();

            $.ajax({
                type : 'GET',
                url : public_path + url,
                success : function(data) {
                    Loader.hide();
                    $(self.el).html(data);
                    self.tile1View = new Tile1View({el: "#group-tiles-1", model: this.model});
                    alertView.resetDisplay();
                }
            });
        }
    },
    renderTile8: function() {
        var self = this;
        // var tile = this.tile;
        var url = this.tileUrl; // tile.attr('href');

        var exist = true;
        if ($('#container').length == 0) {
            exist = false;
        }
        $.ajax({
            type : 'GET',
            url : url,
            beforeSend : function() {   
                Loader.show();
            },
            success : function(data) {
                Loader.hide();
                URLHelper.push(url);

                if (exist == false) {
                    $(self.el).html(data);
                } else if (FilterModel.get('contentView') == 'graph') {
                    // $('#container').html(data);    
                }
                
                self.tile8View = new Tile8View({el: "#group-tiles-8", model: this.model});
                alertView.resetDisplay();
            }
        });

    }
});

var alertView = new LoadAlertView();
var breadcrumbsView = new BreadcrumbsView();

var workspaceView = new WorkspaceView();
var sidebarView = new SidebarView();
var periodView = new PeriodView();

var graphXHR;