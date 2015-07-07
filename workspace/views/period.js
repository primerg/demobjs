'use strict';

var PeriodView = Backbone.View.extend({
    el: '.interval-filter',
    dateFrom: '',
    dateTo: '',
    dateType: '',
    events: {
        'click .day-interval': function(){ this.clickCurrent('day'); },
        'click .week-interval': function(){ this.clickCurrent('week'); },
        'click .month-interval': function(){ this.clickCurrent('month'); },
        'changeDate .day': function(event){ this.clickDate(event, 'day'); },
        'changeDate .week': function(event){ this.clickDate(event, 'week'); },
        'changeDate .month': function(event){ this.clickDate(event, 'month'); },
    },
    initialize: function() {
        $(this.el).find('.week').datepicker({
            calendarWeeks: true,
            autoclose: true,
            weekStart: 1
        });

        $(this.el).find('.month').datepicker({
            minViewMode: 1,
            calendarWeeks: true,
            autoclose: true
        });

        $(this.el).find('.day').datepicker({
            autoclose: true,
            weekStart: 1
        });

        // We save the date in cookie rather than set it in the URL
        var savedDate = $.cookie('workspace_date');

        var dateDefault = false;
        if (typeof savedDate != 'undefined') {
            var date = JSON.parse(savedDate);
            var from = date.from;
            var to = date.to;
            var dtype = date.type;

            if (from.length > 0 && to.length > 0 && dtype.length > 0) {
                dateDefault = true;
            }
        }

        if (dateDefault == false) {
            this.clickCurrent('week');
            $(this.el).find('.day').datepicker('setDate', '');
            $(this.el).find('.month').datepicker('setDate', '');
        } else {
            Logger.push('INFO: Init period');

            // Set the date of the datepicker
            var d = DateHelper.transformDate(from);
            switch(dtype) {
                case 'day': 
                    this.setDay(d);
                    $(this.el).find('.day').datepicker('setDate', d);
                    break;
                case 'week': 
                    this.setWeek(d);
                    $(this.el).find('.week').datepicker('setDate', d);
                    break;
                case 'month': 
                    this.setMonth(d);
                    $(this.el).find('.month').datepicker('setDate', d);
                    break;
                default:
                    //
            }

            // Save to model
            this.save(from, to, dtype);
        }
    },
    clickCurrent: function(type) {
        var today = DateHelper.getToday();
        switch(type) {
            case 'day': 
                this.setDay(today);
                break;
            case 'week': 
                this.setWeek(today);
                break;
            case 'month': 
                this.setMonth(today);
                break;
            default:
                //
        }
    },

    clickDate: function (event, type) {
        var today = event.date;
        switch(type) {
            case 'day': 
                this.setDay(today);
                break;
            case 'week': 
                this.setWeek(today);
                break;
            case 'month': 
                this.setMonth(today);
                break;
            default:
                //
        }
    },

    setMonth: function (date) {
        var strDate = '';

        if (typeof date == 'string') {
            strDate = date;
        } else {
            if (!date) {
                return false;
            }

            strDate = DateHelper.format(date);
        }
        
        var dateFrom = DateHelper.getFirstDateMonth(strDate);
        var dateTo = DateHelper.getLastDateMonth(strDate);

        this.save(dateFrom, dateTo, 'month');

        $(this.el).find('.day').datepicker('setDate', '');
        $(this.el).find('.week').datepicker('setDate', '');
    },

    setWeek: function (date) {
        var strDate = '';

        if (typeof date == 'string') {
            strDate = date;
        } else {
            if (!date) {
                return false;
            }

            strDate = DateHelper.format(date);
        }

        var dateFrom = DateHelper.getFirstDayOfWeek(strDate);
        var dateTo = DateHelper.getTheSunday(strDate);

        this.save(dateFrom, dateTo, 'week');

        $(this.el).find('.day').datepicker('setDate', '');
        $(this.el).find('.month').datepicker('setDate', '');
    },

    setDay: function (date) {
        var strDate = '';

        if (typeof date == 'string') {
            strDate = date;
        } else {
            if (!date) {
                return false;
            }

            strDate = DateHelper.format(date);
        }

        this.save(strDate, strDate, 'day');

        $(this.el).find('.month').datepicker('setDate', '');
        $(this.el).find('.week').datepicker('setDate', '');
    },
    

    save: function(from, to, type) {
        var today = DateHelper.getToday();

        FilterModel.set({
            'dateFrom': from,
            'dateTo': to,
            'dateType': type,
            'dateCurrent': today
        });

        this.render(from, to, type);

        var savedDate = {
            from: from,
            to: to,
            type: type,
            current: today
        }
        $.cookie('workspace_date', JSON.stringify(savedDate), { path : '/' });
    },

    render: function(from, to, type) {
        var defaultWeek = 'Week', defaultMonth = 'Month', defaultDay = 'Day';

        var dayBtn = $('.day-interval'),
            weekBtn = $('.week-interval'),
            monthBtn = $('.month-interval');

        $(this.el).find('.btn.active').removeClass('active');
        
        switch (type) {
            case 'day':
                dayBtn.addClass('active');
                defaultDay = DateHelper.getCurrentDay(from);
                break;
            case 'week':
                weekBtn.addClass('active');
                defaultWeek = DateHelper.getCurrentWeek(from);
                break;
            case 'month':
                monthBtn.addClass('active');
                defaultMonth = DateHelper.getCurrentMonth(from);
                break;

        }

        dayBtn.html(defaultDay);
        weekBtn.html(defaultWeek);
        monthBtn.html(defaultMonth);
    }
});

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);

    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);

    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
};

var DateHelper = new function() {
    var that = this;

    that.transformDate = function (dt) {
        var d = dt.replace(/(^\d{4})-(\d{2})-(\d{2}$)/,'$1/$2/$3');
        d = new Date(d);

        return d;
    };

    that.format = function (d, template) {
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.lastSevenDays = function (dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() - 7);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.lastFourWeeks = function (dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() - 28);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.lastFourMonths = function (dt) {
        var d = that.transformDate(dt);

        d.setMonth(d.getMonth() - 3);
        d.setDate(1);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.lastDate = function (dt) {
        var d = that.transformDate(dt);

        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.getTheSunday = function (dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() - d.getDay() + 7);

        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.lastDateMonth = function (dt) {
        var  d = that.transformDate(dt);

        var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return lastDay.getFullYear() + '-' + ("0" + (lastDay.getMonth() + 1)).slice(-2) + '-' + ("0" + lastDay.getDate()).slice(-2);
    };

    that.getToday = function() {
        var d = new Date();

        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.getCurrentWeek = function(dt) {
        var d = that.transformDate(dt);

        return 'Week ' + d.getWeek();
    };

    var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    that.getCurrentMonth = function(dt) {
        var d = that.transformDate(dt);

        return monthNames[d.getMonth()] + ' ' + d.getFullYear();
    };

    that.getCurrentDay = function(dt) {
        var d = that.transformDate(dt);

        return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    };

    that.getNextDay = function(dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() + 1);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.getYesterday = function(dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() - 1);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };

    that.getMonday = function(dt) {
        var d = that.transformDate(dt);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    that.getFirstDayOfWeek = function(dt) {
        var d = that.getMonday(dt);

        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    }


    that.getSunday = function(dt) {
        var d = that.transformDate(dt);

        d.setDate(d.getDate() + 6);
        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    }

    that.getFirstDateMonth = function(dt) {
        var d = that.transformDate(dt);
        d.setDate(1);

        return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    }


    that.getLastDateMonth = function(dt) {
        var d = that.transformDate(dt);
        var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        return lastDay.getFullYear() + '-' + ("0" + (lastDay.getMonth() + 1)).slice(-2) + '-' + ("0" + lastDay.getDate()).slice(-2);
    }
}