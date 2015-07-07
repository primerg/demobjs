'use strict';

var LoadAlertView = Backbone.View.extend({
    el: '.alert-wrapper',
    events: {
        'click .btn': 'render'
    },
    initialize: function() {
        this.resetDisplay();
    },
    resetDisplay: function() {
        $('.tile-data-info.alertwrap').each(function() {
            $(this)
                .removeClass('red')
                .removeClass('yellow')
                .removeClass('green')
                .removeClass('pill')
                .find('.alertnum').html('-')
                // .removeClass('reading')
                ;
            $(this).find('.alertnum2').remove();
            
        });
    },
    resetReadyAlertCountDisplay: function() {
        $('.alert-logs .alerts-red').html('');
        $('.alert-logs .alerts-yellow').html('');
        $('.alert-logs .alerts-yellow').html('');
        $('.tile-data-info.log').children('.alertnum').each(function() {
            $(this).html('-');
        });
    },
    render: function(){
        Logger.push('render alert');
        this.scope = FilterModel.get('scopeType');
        this.scopeID = FilterModel.get('scopeID');
        this.dfrom = FilterModel.get('dateFrom');
        this.dto = FilterModel.get('dateTo');
        this.dcurrent = FilterModel.get('dateCurrent');
        this.dtype = FilterModel.get('dateType');
        this.sLink = FilterModel.get('link');
        this.contentView = FilterModel.get('contentView');
        this.tile = FilterModel.get('tile');
        this.tileUrl = FilterModel.get('tileUrl');

        if (this.contentView == 'tile1') {
            this.renderTile1Alerts();
        } else {
            this.renderTile8Alerts();
        }
    },
    renderTile1Alerts: function() {
        Logger.push('Alert count tile 1 start');
        this.loadTile1Alerts('project');
    },
    renderTile8Alerts: function() {
        Logger.push('Alert count tile 8 start');
        this.loadTile8Alerts();
    },
    loadTile1Alerts: function(projectid) {
        var data = {
            project : projectid, 
            viewtype: this.scope,
            from    : this.dfrom, 
            to      : this.dto, 
            current : this.dcurrent,
            alert   : true
        };
        
        var url = public_path + '/alertcount/tile1';
        var self = this;

        $.ajax({
            type : 'GET' , 
            url  : url,
            data : data, 
            cache : true ,
            dataType : 'json' , 
            beforeSend : function() {   
                Loader.show();
                self.resetDisplay();
            }
        }).done(function( data ) {
            Loader.hide();
            var alert   = data.alert;
            var current = data.current;

            $.each(alert, function (i , v) {
                if (v.setup == 'all') {
                    return;
                }

                var id = v.setup;
                var tile = $('.tile-data[data-id="'+id+'"]');

                console.log(id)
                if (tile.length == 0) {
                    return;
                }

                $.each(v.alerts, function (type, values) {
                    var color = '';
                    var pill1 = '0';
                    var pill2 = '';

                    tile = $('.'+type+'[data-id="'+id+'"]');

                    if (values[0] > 0 && values[1] > 0 && tile.find('.reading').length == 0) {
                        color = 'pill';
                        pill1 = values[0];
                        pill2 = values[1];
                    } else if (values[0] > 0) {
                        color = 'red';
                        pill1 = values[0];
                    } else if (values[1] > 0) {
                        color = 'yellow';
                        pill1 = values[1];
                    } else {
                        color = 'green';
                    }

                    tile.find('.alertwrap')
                        .addClass(color)
                        .find('.alertnum').html(pill1);
                    if (pill2 != '') {
                        tile.find('.alertnum2').remove();
                        tile.find('.alertnum')
                            .html(pill1)
                            .after('<span class="alertnum2">'+pill2+'</span>');
                    }
                });
                
            });

        }).fail(function(jqXHR, textStatus, errorThrown) {
           var code = jqXHR.status;
        });
    },
    loadTile8Alerts: function() {
        var url = public_path + '/alertcount/tile8';

        var data = {
            device  : TileModel.get('id'),
            from    : this.dfrom, 
            to      : this.dto,
            deviceType: TileModel.get('deviceType'),
            tolerance: $('#alert-tolerance').val(),
            preset: $('.presets-list').val()
        };

        var self = this;
        var showAlertClick = true;

        var deviceType = TileModel.get('deviceType');

        $.ajax({
            type : 'GET' , 
            url  : url,
            data : data, 
            cache : true ,
            dataType : 'json' , 
            beforeSend : function() {   
                Loader.show();
                self.resetDisplay();
                self.resetReadyAlertCountDisplay();
            }
        }).done(function( data ) {
            Loader.hide();

            // Plot the alerts
            if(typeof(data.alerts) === "undefined" || typeof(data.alerts.items) === "undefined") {
                return false;
            }

            var alerts = data.alerts;
            var showAlertClick = true;

            if (alerts.items.length > 0) {
                // display the count
                var color = 'green';
                var pill1 = alerts.countred;
                var pill2 = '';
                if (pill1 > 0 && alerts.countyellow > 0) {
                    pill2 = alerts.countyellow;
                    color = 'pill';
                } else if (pill1 > 0) {
                    color = 'red';
                } else if (alerts.countyellow > 0) {
                    pill1 = alerts.countyellow;
                    color = 'yellow';
                }

                var tile = $('.tile-content .tile-data.'+deviceType+' .alertwrap');
                tile.addClass(color)
                    .find('.alertnum').html(pill1);

                if (pill2 != '') {
                    tile.find('.alertnum2').remove();
                    tile.find('.alertnum').after('<span class="alertnum2">'+pill2+'</span>')
                }

                // Section where we display the alert messages
                var ctrr = 0,
                    ctry = 0;

                var ctrred    = 0 ,
                    ctryellow = 0;

                var logsred    = '' ,
                    logsyellow = '';

                $.each(alerts.items , function(index , value){
                    if( value.color === "Red") {
                        ctrr = ctrr + 1;
                        logsred += '<p>'+value.message+'</p>';
                    } else {
                        ctry = ctry + 1;
                        logsyellow += '<p>'+value.message+'</p>';
                    }
                });

                $('.tile-alerts').show();
                $('.tile-alerts-green').hide();

                $('.alerts-red').html(logsred);
                $('.alerts-red-count').text(alerts.countred);

                $('.alerts-yellow').html(logsyellow);
                $('.alerts-yellow-count').text(alerts.countyellow);

                if ( ctrr > 7) {
                    $('.alerts-red').css({
                        'height' : '450px' ,
                        'float' : 'left' ,
                        'overflow-y' : 'auto'
                    });
                }

                if ( ctry > 7) {
                    $('.alerts-yellow').css({
                        'height' : '450px' ,
                        'float' : 'left' ,
                        'overflow-y' : 'auto'
                    });
                }


                return;
            }
        });

    }
});
