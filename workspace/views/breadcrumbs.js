'use strict';

var BreadcrumbsView = Backbone.View.extend({
    el: '.breadcrumbs',
    render: function(){
        var scope = FilterModel.get('scopeType');
        var id = FilterModel.get('scopeID');
        var title = FilterModel.get('title');

        // Set the header information
        $('#page-title').html(title);

        var breadcrumbs = [];
        if (scope == 'project') {
            breadcrumbs.push('Projects');
            breadcrumbs.push(title);
            // $('[data-id="' + id + '"]').addClass('active');
        } else if (scope != '') {
            var allowed = [];

            var view = 'normal';
            if (scope == 'building1' || scope == 'room') {
                allowed = ['municipality', 'city', 'building1', 'room'];
                view = 'shortcut';
                breadcrumbs.push('...');
            } else {
                allowed = ['country', 'state', 'municipality', 'city'];
            }

            $('.locations li.title li.active').each(function(x, y) {
                var obj = $(y);
                var key = obj.attr('data-viewtype');
                var text = obj.find('a').html();
                if (text == 'Denmark') {
                    text = 'DK';
                }
                if ($.inArray(key, allowed) !==-1) {
                    breadcrumbs.push(text);
                }
            });
        }

        var breadcrumbsHtml = '';
        var breadcrumbsCount = breadcrumbs.length - 1;
        $.each(breadcrumbs, function(x, y) {
            breadcrumbsHtml += y;
            if (x < breadcrumbsCount) {
                breadcrumbsHtml += ' > ';
            }
        })

        this.$el.html(breadcrumbsHtml);
    }
});