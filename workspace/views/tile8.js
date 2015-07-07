'use strict';

var Tile8View = Backbone.View.extend({
    el: '#group-tiles-8',
    events: {
        // Top left side
        'click .tile8 .tile-data a': 'deviceTypeUpdateGraph',
        // Tabs
        'click .tile8 .panel-tabs a.runchart': 'tabUpdateGraph',

        // Other clickables
        'click .nav-left': 'navigateToLeft',
        'click .nav-right': 'navigateToRight',
        'click .panel-search-action': 'showHideFilters',
        'change #alert-tolerance': 'setToleranceDescription',
        'change #datatype': 'setPresetDescription',
        'click .tile8 .panel-search .panel-on-board a': 'underConstruction'
    },
    initialize: function() {
        var tileActive = $('.tile8 .panel-tabs li.active a');
        
        TileModel.set({
            id: tileActive.data('id'),
            name: tileActive.data('title'),
            subname: tileActive.data('subtitle'),
            deviceType: $('.tile8 .tile-data.active a').data('type'),
            device: '',
        });

        this.setTile8Header();
        HighchartsHelper.generateChart($('.panel-tabs li.active a'));

        this.setToleranceDescription();
        this.setPresetDescription();
        this.resetAlert();
        this.setGraphTitle();
        
    },
    deviceTypeUpdateGraph: function(event) {
        Logger.push('tile8 deviceTypeUpdateGraph')
        event.preventDefault();

        var obj = $(event.currentTarget);

        $('.tile8 .tile-data.active').removeClass('active');
        obj.closest('.tile-data').addClass('active');

        TileModel.set({
            id:         $('.tile8 .panel-tabs li.active a').data('id'),
            name:       $('.tile8 .panel-tabs li.active a').data('title'),
            subname:    $('.tile8 .panel-tabs li.active a').data('subtitle'),
            deviceType: obj.data('type'),
            device: '',
        });
        
        this.resetAlert();
        this.updateGraph();
        this.setGraphTitle();
        this.setPresetDescription();
    },
    tabUpdateGraph: function (event) {
        Logger.push('tile8 tabUpdateGraph')
        event.preventDefault();

        var obj = $(event.currentTarget);

        $('.tile8 .panel-tabs li.active').removeClass('active');
        obj.closest('li').addClass('active');

        TileModel.set({
            id:         obj.data('id'),
            name:       obj.data('title'),
            subname:    obj.data('subtitle'),
            deviceType: $('.tile8 .tile-data.active a').data('type'),
            device: '',
        });
        
        this.setTile8Header();
        this.resetAlert();
        this.updateGraph();
    },
    updateGraph: function() {
        HighchartsHelper.generateChart($('.panel-tabs li.active a'));
    },
    underConstruction: function(event) {
        alert('Under Construction');
        return false;
    },
    navigateToLeft: function (event) {
        event.preventDefault();

        var maxLen = $('.tabs-flow').width(),
            click  = false;

        // Get the current left position of the tabs children
        var left = $('.tabs-flow .tabs-child').css('left').replace('px', '');
        if(left == 'auto') {
            left = 0;
        }

        // Get the absolute value and convert into integer
        //left = Math.abs(left);
        maxLen = Math.abs(maxLen);

        var offset = $('ul.tabs-child').offset();
        var right  = offset.right;

        if(click == false) {
            // var diff = left - -maxLen;
            if( left <= 200 || left == -200 ){
                $("ul li.tabs-flow ul").animate({"left": '+=200'});
                click = true;
            }
        }

        setTimeout(function(){ click = false }, 1000);
    },
    navigateToRight: function (event) {
        event.preventDefault();

        var maxLen = $('.tabs-flow').width(),
            click  = false;

        // Get the current left position of the tabs children
        var left = $('.tabs-flow .tabs-child').css('left').replace('px', '');
        if(left == 'auto') {
            left = 0;
        }

        // Get the absolute value and convert into integer
        maxLen = Math.abs(maxLen);

        var offset = $('ul.tabs-child').offset();
        var right  = offset.right;

        if(click == false) {
            var diff = left - -maxLen;
            if(diff > 0) {
                $("ul.tabs-child").animate({"left": '-=200'});
                click = true;
            }
        }

        setTimeout(function(){ click = false }, 1000);
    },
    showHideFilters: function(event) {
        event.preventDefault();

        var obj = $(event.currentTarget);
        var panel = $('.panel-search');
        var arrow = $('.panel-search-action span');

        if (obj.hasClass('action-hide')) {
            obj.addClass('action-show');
            obj.removeClass('action-hide');

            arrow.html('&#9660');
            panel.hide();
        } else {
            obj.addClass('action-hide');
            obj.removeClass('action-show');

            arrow.html('&#9650');
            panel.show();
        }
    },
    setGraphTitle: function() {
        var deviceType = TileModel.get('deviceType');
        var deviceType = TileModel.get('deviceType');
        var symbol = DeviceTypes.climate[deviceType].symbol;
        var name = DeviceTypes.climate[deviceType].html + ' (' + symbol + ')';
        
        $('#container-title').html(name);
    },
    setTile8Header: function() {
        $('.tile-header .title').html(TileModel.get('name'));
        $('.submenu.panel-subtext').html(TileModel.get('subname'));
    },
    setToleranceDescription: function() {
        var val = $('#alert-tolerance').val();
        if (val == '1') {
            $('.percentage').hide();
            $('.consecutive').show();
        } else if (val == '2') {
            $('.consecutive').hide();
            $('.percentage').show();
        } else {
            $('.consecutive').hide();
            $('.percentage').hide();
        }
    },
    setPresetDescription: function() {
        var preset = $('.presets-list').val();
        var deviceType = DeviceTypes.climate[TileModel.get('deviceType')].label;
        $.ajax({
            type: 'GET',
            url: '/toolbox/data/' + preset + '/' + deviceType,
            dataType: 'json',
            beforeSend : function() {   
                
            },
            success: function(data) {
                if (typeof data.id == 'undefined') {
                    $('#below-preset').html('');
                    $('#above-preset').html('');
                    $("#tolerance option[value='0']").attr('selected', 'selected');

                    return;
                }

                $('#above-preset').html(data.above);
                $('#below-preset').html(data.below);

                HighchartsHelper.yPlotLines(data);
            }
        });
    },
    resetAlert: function() {
        alertView.resetDisplay();
        alertView.resetReadyAlertCountDisplay();
    }
});