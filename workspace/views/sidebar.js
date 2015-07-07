'use strict';

var SidebarView = Backbone.View.extend({
    el: '#section-sidebar',
    allPanels: '',
    allProjects: '',
    allMenu: false,
    events: {
        'click .menu-tree a': 'updateFilter',
        'click .menu-tree .projects h2': 'toggleProject',
        'click .menu-tree .locations .nav-header': 'toggleLocation'
    },
    initialize: function() {
        Logger.push('INFO: Init sidebar');

        var tile = 'tile1';
        var selectedItem = $(this.el).find('.projects li:first');    

        // check the URL first
        var p = URLHelper.getPath();
        var viewType = URLHelper.getQuery('group');
        if (p[0] == 'workspace' && viewType != false) {
            if (p.length == 2) {
                tile = 'tile8';
            }

            var activeMenu   = URLHelper.getQuery('id');
            var selectedItem = $('[data-viewtype="'+viewType+'"][data-link="'+activeMenu+'"]');
        }

        // Set the default values
        this.setData(selectedItem, selectedItem.find('a').html(), tile);

        // Update sidebar
        if (viewType == 'project' || viewType == false) {
            this.updateProjectSidebar(selectedItem);    
        } else {
            this.updateLocationSidebar(selectedItem);
        }
        
    },
    toggleProject: function(event) {
        var selectedItem = $(event.currentTarget).parent().find('ul').slideToggle();
    },
    toggleLocation: function (event) {
        var selectedItem = $(event.currentTarget).parent().find('ul').slideToggle();  
    },
    updateFilter: function(event) {
        var selectedItem = $(event.currentTarget).parent();
        this.setData(selectedItem, $(event.currentTarget).html());

        var viewType = selectedItem.data('viewtype');

        if (viewType == 'project') {
            this.updateProjectSidebar(selectedItem);
        } else {
            this.updateLocationSidebar(selectedItem)    
        }
    },
    updateProjectSidebar: function(domElement) {
        // var activeMenu  = domElement.data('id');
        var activeMenu  = domElement.data('id');

        // Reset the active links
        this.resetActiveLinks();

        $('[data-id="' + activeMenu + '"]')
            .addClass('active')
            .closest('.projects').find('ul').show();

        breadcrumbsView.render();
    },
    resetActiveLinks: function() {
        this.allPanels = $('.locations ul ul');
        this.allProjects = $('.projects ul');
        this.allPanels.hide();
        this.allProjects.hide();
        this.allPanels.find('.active').removeClass('active');
        this.allPanels.find('li').show();
        this.allProjects.find('.active').removeClass('active');
    },
    updateLocationSidebar: function(domElement) {
        var viewType    = domElement.data('viewtype');
        var activeMenu  = domElement.data('id');

        // Reset the active links
        this.resetActiveLinks();

        // set active link
        var activeMenuObj = $('[data-viewtype="'+viewType+'"][data-id="'+activeMenu+'"]');
        activeMenuObj.addClass('active');
        activeMenuObj.closest('li.title').find('ul').show();

        if ($.isEmptyObject(activeMenu)) {
            return false;
        }

        if (activeMenu == 'Denmark') {
            this.allPanels.find('li').show();
            breadcrumbsView.render();
            return false;
        }

        var self = this;
        var existing = self.allMenu;

        if (existing != false) {
            self.buildLink(this.allMenu, viewType, activeMenu);
        } else {
            Loader.show();
            $.ajax({
                type : 'GET',
                url : public_path + '/sidebarlinks',
                dataType : 'json',
                success : function(data) {
                    self.buildLink(data, viewType, activeMenu);
                    this.allMenu = data;
                    Loader.hide();
                }
            });
        }           

        return;

        // var searchType = [];

        // switch (viewType) {
        //     case 'country':
        //         searchType.push('state');
        //         searchType.push('municipality');
        //         searchType.push('city');
        //         searchType.push('building1');
        //         searchType.push('room');
        //         break;
        //     case 'state':
        //         searchType.push('municipality');
        //         searchType.push('city');
        //         searchType.push('building1');
        //         searchType.push('room');
        //         break;
        //     case 'municipality':
        //         searchType.push('city');
        //         searchType.push('building1');
        //         searchType.push('room');
        //         break;
        //     case 'city':
        //         searchType.push('building1');
        //         searchType.push('room');
        //         break;
        //     case 'building1':
        //         searchType.push('room');
        //         break;
        // }

        // console.log(searchType)
        // $.each(SidebarMenu, function(k, v) {
        //     if($.inArray(v.type, searchType) >= 0) {
                
        //         if(activeMenu != v.constraint[viewType]) {
        //             $('[data-id="' + v.id + '"]').hide();
        //         } else {
        //             console.log(v.constraint[viewType]);    
        //         }
        //     }
        // });

        // $.ajax({
        //     type : 'GET',
        //     url : public_path + '/locationmanager/locations/data/'+viewType+'/'+activeMenu,
        //     dataType : 'json',
        //     success : function(data) {
        //         $.each(data.locations, function(k, v) {
        //             k = k == 'school' ? 'building1' : k;
        //             $('li[data-viewtype="'+k+'"][data-class="location-item"]').hide()
        //             $.each(v, function(key, val) {
        //                 $('li[data-viewtype="'+k+'"][data-class="location-item"][data-id="'+val.id+'"]').show();
        //             });
        //         });
        //     }
        // });
    },
    buildLink: function(data, viewType, activeMenu) {
        var link = data[viewType+':'+activeMenu];
        if (typeof link != 'undefined') {
            $.each(link.constraint, function(constraintId, constraintValue) {
                constraintValue = constraintValue == 'DK' ? 'Denmark' : constraintValue;

                $('[data-id="'+constraintValue+'"]').each(function(idx, val) {
                    if (constraintId == $(val).closest('li.title').data('viewtype')) {
                        $(this).parent().children().hide();
                        $(this).show();
                        $(this).addClass('active');
                    }
                });

                if (constraintId == viewType) {
                    return false;
                }
            });
        }   

        $('li.title li.active').each(function() {
            $(this).closest('ul').show();
        });

        breadcrumbsView.render()
    },
    setData: function (domElement, title, tile) {
        if (typeof tile == 'undefined') {
            tile = 'tile1';
        }

        FilterModel.set({
            'scopeType': domElement.data('viewtype'),
            'scopeID': domElement.data('id'),
            'link': domElement.data('link'),
            'title': title,
            'contentView': tile
        });
    }
});