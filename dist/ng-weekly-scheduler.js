angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])
    .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
        localeServiceProvider.configure({
            doys: { 'es-es': 4 },
            lang: { 'es-es': { weekNb: 'número de la semana', addNew: 'Añadir' } },
            localeLocationPattern: '/angular-locale_{{locale}}.js'
        });
    }])
    .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {
        $scope.model = {
            locale: localeService.$locale.id,
            options: { /*monoSchedule: true*/},
            items: [
                {
                    label: 'Sun',
                    //editable: false,
                    schedules: []
                },
                {
                    label: 'Mon',
                    //editable: false,
                    schedules: [
                        { start: 300, end: 1140 }
                    ]
                },
                {
                    label: 'Tue',
                    schedules: [
                        { start: 0, end: 240 },
                        { start: 300, end: 360 }
                    ]
                },
                {
                    label: 'Wed',
                    schedules: [
                        { start: 120, end: 720 }
                    ]
                },
                {
                    label: 'Thur',
                    editable: false,
                    schedules: [
                        { start: 300, end: 1140 }
                    ]
                },
                {
                    label: 'Fri',
                    schedules: [
                        { start: 720, end: 780 }
                    ]
                },
                {
                    label: 'Sat',
                    schedules: []
                }
            ]
        };
        this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
            $log.debug('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
        };
        this.onLocaleChange = function () {
            $log.debug('The locale is changing to', $scope.model.locale);
            localeService.set($scope.model.locale).then(function ($locale) {
                $log.debug('The locale changed to', $locale.id);
            });
        };
    }]);
angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);
var GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
var CLICK_ON_A_CELL = 'clickOnACell';
var isCtrl;
function ctrlCheck(e) {
    if (e.which === 17) {
        isCtrl = e.type === 'keydown';
    }
}
function mouseScroll(el, delta) {
    window.addEventListener('keydown', ctrlCheck);
    window.addEventListener('keyup', ctrlCheck);
    el.addEventListener('mousewheel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isCtrl) {
            var style = el.firstChild.style, currentWidth = parseInt(style.width);
            if ((e.wheelDelta || e.detail) > 0) {
                style.width = (currentWidth + 2 * delta) + '%';
            }
            else {
                var width = currentWidth - 2 * delta;
                style.width = (width > 100 ? width : 100) + '%';
            }
        }
        else {
            if ((e.wheelDelta || e.detail) > 0) {
                el.scrollLeft -= delta;
            }
            else {
                el.scrollLeft += delta;
            }
        }
        return false;
    });
}
function zoomInACell(el, event, data) {
    var nbElements = data.nbElements;
    var idx = data.idx;
    // percentWidthFromBeginning is used when the first element of the grid is not full
    // For instance, in the example below `feb 17` is not full
    // feb 17          march 17
    //       |                          |
    var percentWidthFromBeginning = data.percentWidthFromBeginning;
    var containerWidth = el.offsetWidth;
    // leave (1/3) each side
    // 1/3 |    3/3   | 1/3
    var boxWidth = containerWidth / (5 / 3);
    var gutterSize = boxWidth / 3;
    var scheduleAreaWidthPx = nbElements * boxWidth;
    var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
    el.firstChild.style.width = scheduleAreaWidthPercent + '%';
    if (percentWidthFromBeginning === undefined) {
        // All cells of a line have the same size
        el.scrollLeft = idx * boxWidth - gutterSize;
    }
    else {
        // Sizes of cells in a line could different (especially the first one)
        el.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
    }
}
/** @internal */
var HandleDirective = /** @class */ (function () {
    function HandleDirective($document) {
        var _this = this;
        this.$document = $document;
        this.restrict = 'A';
        this.scope = {
            ondrag: '=',
            ondragstop: '=',
            ondragstart: '='
        };
        this.link = function (scope, element) {
            var $document = _this.$document;
            var x = 0;
            element.on('mousedown', function (event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                x = event.pageX;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
                if (scope.ondragstart) {
                    scope.ondragstart();
                }
            });
            function mousemove(event) {
                var delta = event.pageX - x;
                if (scope.ondrag) {
                    scope.ondrag(delta);
                }
            }
            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                if (scope.ondragstop) {
                    scope.ondragstop();
                }
            }
        };
    }
    HandleDirective.Factory = function () {
        var directive = function ($document) { return new HandleDirective($document); };
        directive.$inject = ['$document'];
        return directive;
    };
    HandleDirective.$name = 'handle';
    return HandleDirective;
}());
angular.module('weeklyScheduler')
    .directive(HandleDirective.$name, HandleDirective.Factory());
/** @internal */
var HourlyGridDirective = /** @class */ (function () {
    function HourlyGridDirective() {
        var _this = this;
        this.restrict = 'E';
        this.require = '^weeklyScheduler';
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
            schedulerCtrl.$modelChangeListeners.push(function (newConfig) {
                _this.doGrid(scope, element, attrs, newConfig);
            });
        };
    }
    HourlyGridDirective.prototype.handleClickEvent = function (child, hourCount, idx, scope) {
        child.bind('click', function () {
            scope.$broadcast(CLICK_ON_A_CELL, {
                nbElements: hourCount,
                idx: idx
            });
        });
    };
    HourlyGridDirective.prototype.doGrid = function (scope, element, attrs, config) {
        var i;
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({ width: ticksize + '%' });
        // Clean element
        element.empty();
        for (i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                var currentHour = i % 12;
                var meridiem = i >= 12 ? 'pm' : 'am';
                child.text("" + (currentHour || '12') + meridiem);
            }
            element.append(child);
        }
    };
    HourlyGridDirective.Factory = function () {
        var directive = function () { return new HourlyGridDirective(); };
        return directive;
    };
    HourlyGridDirective.$name = 'hourlyGrid';
    return HourlyGridDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
/** @internal */
var IntervalGridDirective = /** @class */ (function () {
    function IntervalGridDirective() {
        var _this = this;
        this.restrict = 'E';
        this.require = '^weeklyScheduler';
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
            schedulerCtrl.$modelChangeListeners.push(function (newConfig) {
                _this.doGrid(scope, element, attrs, newConfig);
            });
        };
    }
    IntervalGridDirective.prototype.doGrid = function (scope, element, attrs, config) {
        // Calculate interval width distribution
        var tickcount = config.intervalCount;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({ width: ticksize + '%' });
        // Clean element
        element.empty();
        for (var i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            element.append(child);
        }
    };
    IntervalGridDirective.Factory = function () {
        var directive = function () { return new IntervalGridDirective(); };
        return directive;
    };
    IntervalGridDirective.$name = 'intervalGrid';
    return IntervalGridDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(IntervalGridDirective.$name, IntervalGridDirective.Factory());
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);
angular.module('weeklySchedulerI18N')
    .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
        var defaultConfig = {
            doys: { 'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4 },
            lang: {
                'de-de': { weekNb: 'Wochenummer', addNew: 'Hinzufügen' },
                'en-gb': { weekNb: 'Week #', addNew: 'Add' },
                'en-us': { weekNb: 'Week #', addNew: 'Add' },
                'fr-fr': { weekNb: 'N° de semaine', addNew: 'Ajouter' }
            }
        };
        this.configure = function (config) {
            if (config && angular.isObject(config)) {
                angular.merge(defaultConfig, config);
                if (defaultConfig.localeLocationPattern) {
                    tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
                }
            }
        };
        this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {
                var momentLocaleCache = {};
                function getLang() {
                    var key = $locale.id;
                    if (!momentLocaleCache[key]) {
                        momentLocaleCache[key] = getMomentLocale(key);
                        moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
                    }
                    else {
                        moment.locale(momentLocaleCache[key].id);
                    }
                    return defaultConfig.lang[key];
                }
                // We just need few moment local information
                function getMomentLocale(key) {
                    return {
                        id: key,
                        locale: {
                            week: {
                                // Angular monday = 0 whereas Moment monday = 1
                                dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
                                doy: defaultConfig.doys[key]
                            }
                        }
                    };
                }
                $rootScope.$on('$localeChangeSuccess', function () {
                    $rootScope.$broadcast('weeklySchedulerLocaleChanged', getLang());
                });
                return {
                    $locale: $locale,
                    getLang: getLang,
                    set: function (key) {
                        return tmhDynamicLocale.set(key);
                    }
                };
            }];
    }]);
/** @internal */
var MultiSliderDirective = /** @class */ (function () {
    function MultiSliderDirective() {
        this.restrict = 'E';
        this.require = '^weeklyScheduler';
        this.templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
        this.link = function (scope, element, attrs, schedulerCtrl) {
            var conf = schedulerCtrl.config;
            // The default scheduler block size when adding a new item (in minutes)
            var defaultNewScheduleSize = (parseInt(attrs.size, 10) || 60);
            var valToPixel = function (val) {
                var percent = val / conf.intervalCount / conf.interval;
                return Math.floor(percent * element[0].clientWidth + 0.5);
                ;
            };
            var pixelToVal = function (pixel) {
                var percent = pixel / element[0].clientWidth;
                return Math.floor(percent * (conf.intervalCount) + 0.5) * conf.interval;
            };
            var addSlot = function (start, end) {
                start = start >= 0 ? start : 0;
                end = end <= conf.maxValue ? end : conf.maxValue;
                scope.$apply(function () {
                    var item = scope.item;
                    if (!item.schedules) {
                        item.schedules = [];
                    }
                    item.schedules.push({ start: start, end: end });
                });
            };
            var getElementOffsetX = function (elem) { return elem[0].getBoundingClientRect().left; };
            var hoverElement = angular.element(element.find('div')[0]);
            var hoverElementWidth = valToPixel(defaultNewScheduleSize);
            hoverElement.css({
                width: hoverElementWidth + 'px'
            });
            element.on('mousemove', function (e) {
                var elOffX = getElementOffsetX(element);
                var left = e.pageX - elOffX - hoverElementWidth / 2;
                var snapped = valToPixel(pixelToVal(left));
                hoverElement.css({
                    left: snapped + 'px'
                });
            });
            hoverElement.on('click', function (event) {
                if (!element.attr('no-add')) {
                    var elOffX = getElementOffsetX(element);
                    var hoverElOffX = getElementOffsetX(hoverElement) - elOffX;
                    var start = pixelToVal(hoverElOffX);
                    var end = start + defaultNewScheduleSize;
                    addSlot(start, end);
                }
            });
        };
    }
    MultiSliderDirective.Factory = function () {
        var directive = function () { return new MultiSliderDirective(); };
        return directive;
    };
    MultiSliderDirective.$name = 'multiSlider';
    return MultiSliderDirective;
}());
angular.module('weeklyScheduler')
    .directive(MultiSliderDirective.$name, MultiSliderDirective.Factory());
/** @internal */
var TimeOfDayFilter = /** @class */ (function () {
    function TimeOfDayFilter() {
    }
    TimeOfDayFilter.Factory = function () {
        var standardFormat = 'h:mmA';
        var militaryFormat = 'HH:mm';
        return function (minutes) {
            // The moment-duration-format package always outputs military time, (it converts a duration to a time string, not a time of day) so we'll need to grab that and then convert
            var militaryTime = moment.duration(minutes, 'minutes').format(militaryFormat, { trim: false });
            return moment(militaryTime, militaryFormat).format(standardFormat);
        };
    };
    TimeOfDayFilter.$name = 'timeOfDay';
    return TimeOfDayFilter;
}());
angular
    .module('weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
/** @internal */
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($injector, $log) {
        this.$injector = $injector;
        this.$log = $log;
        this.defaultOptions = {
            monoSchedule: false,
            selector: '.schedule-area-container'
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        // Try to get the i18n service
        var name = 'weeklySchedulerLocaleService';
        if (this.$injector.has(name)) {
            this.$log.info('The I18N service has successfully been initialized!');
            var localeService = this.$injector.get(name); /* TODO type */
            this.defaultOptions.labels = localeService.getLang();
        }
        else {
            this.$log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
        }
        // Will hang our model change listeners
        this.$modelChangeListeners = [];
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'weeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$injector',
        '$log'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerDirective = /** @class */ (function () {
    function WeeklySchedulerDirective($log, $parse) {
        var _this = this;
        this.$log = $log;
        this.$parse = $parse;
        this.restrict = 'E';
        this.require = 'weeklyScheduler';
        this.transclude = true;
        this.templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.link = function (scope, element, attrs, schedulerCtrl) {
            var optionsFn = _this.$parse(attrs.options), options = angular.extend(schedulerCtrl.defaultOptions, optionsFn(scope) || {});
            // Get the schedule container element
            var el = element[0].querySelector(schedulerCtrl.defaultOptions.selector);
            var self = _this;
            function onModelChange(items) {
                // Check items are present
                if (items) {
                    // Check items are in an Array
                    if (!angular.isArray(items)) {
                        throw 'You should use weekly-scheduler directive with an Array of items';
                    }
                    // Keep track of our model (use it in template)
                    schedulerCtrl.items = items;
                    // If in multiSlider mode, ensure a schedule array is present on each item
                    // Else only use first element of schedule array
                    items.forEach(function (item) {
                        var schedules = item.schedules;
                        if (schedules && schedules.length) {
                            if (options.monoSchedule) {
                                item.schedules = [schedules[0]];
                            }
                        }
                        else {
                            item.schedules = [];
                        }
                    });
                    // Calculate configuration
                    schedulerCtrl.config = self.config(options);
                    // Finally, run the sub directives listeners
                    schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
                        listener(schedulerCtrl.config);
                    });
                }
            }
            if (el) {
                // Install mouse scrolling event listener for H scrolling
                mouseScroll(el, 20);
                scope.$on(CLICK_ON_A_CELL, function (e, data) {
                    zoomInACell(el, e, data);
                });
                schedulerCtrl.on = {
                    change: function (itemIndex, scheduleIndex, scheduleValue) {
                        var onChangeFunction = _this.$parse(attrs.onChange)(scope);
                        if (angular.isFunction(onChangeFunction)) {
                            return onChangeFunction(itemIndex, scheduleIndex, scheduleValue);
                        }
                    }
                };
                /**
                 * Watch the model items
                 */
                scope.$watchCollection(attrs.items, onModelChange);
                /**
                 * Listen to $locale change (brought by external module weeklySchedulerI18N)
                 */
                scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
                    if (schedulerCtrl.config) {
                        schedulerCtrl.config.labels = labels;
                    }
                    onModelChange(angular.copy(this.$parse(attrs.items)(scope), []));
                });
            }
        };
    }
    /**
     * Configure the scheduler.
     */
    WeeklySchedulerDirective.prototype.config = function (options) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;
        var result = angular.extend(options, { interval: interval, maxValue: minutesInDay, hourCount: hoursInDay, intervalCount: intervalCount });
        // Log configuration
        this.$log.debug('Weekly Scheduler configuration:', result);
        return result;
    };
    WeeklySchedulerDirective.Factory = function () {
        var directive = function ($log, $parse) { return new WeeklySchedulerDirective($log, $parse); };
        directive.$inject = [
            '$log',
            '$parse'
        ];
        return directive;
    };
    WeeklySchedulerDirective.$name = 'weeklyScheduler';
    return WeeklySchedulerDirective;
}());
/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .directive(WeeklySchedulerDirective.$name, WeeklySchedulerDirective.Factory());
/** @internal */
var WeeklySlotDirective = /** @class */ (function () {
    function WeeklySlotDirective() {
        this.restrict = 'E';
        this.require = ['^weeklyScheduler', 'ngModel'];
        this.templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
        this.link = function (scope, element, attrs, ctrls) {
            var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
            var conf = schedulerCtrl.config;
            var index = scope.$parent.$index;
            var containerEl = element.parent();
            var resizeDirectionIsStart = true;
            var valuesOnDragStart = { start: scope.schedule.start, end: scope.schedule.end };
            var pixelToVal = function (pixel) {
                var percent = pixel / containerEl[0].clientWidth;
                return Math.floor(percent * (conf.intervalCount) + 0.5) * conf.interval;
            };
            var removeSchedule = function (schedule) {
                var schedules = scope.item.schedules;
                schedules.splice(schedules.indexOf(schedule), 1);
            };
            var mergeOverlaps = function () {
                var schedule = scope.schedule;
                var schedules = scope.item.schedules;
                schedules.forEach(function (el) {
                    if (el !== schedule) {
                        // model is inside another slot
                        if (el.end >= schedule.end && el.start <= schedule.start) {
                            removeSchedule(el);
                            schedule.end = el.end;
                            schedule.start = el.start;
                        }
                        // model completely covers another slot
                        else if (schedule.end >= el.end && schedule.start <= el.start) {
                            removeSchedule(el);
                        }
                        // another slot's end is inside current model
                        else if (el.end >= schedule.start && el.end <= schedule.end) {
                            removeSchedule(el);
                            schedule.start = el.start;
                        }
                        // another slot's start is inside current model
                        else if (el.start >= schedule.start && el.start <= schedule.end) {
                            removeSchedule(el);
                            schedule.end = el.end;
                        }
                    }
                });
            };
            element.on('mouseover', function () {
                containerEl.addClass('slot-hover');
            });
            element.on('mouseleave', function () {
                containerEl.removeClass('slot-hover');
            });
            if (scope.item.editable !== false) {
                /**
                 * Delete on right click on slot
                 */
                scope.deleteSelf = function () {
                    containerEl.removeClass('dragging');
                    containerEl.removeClass('slot-hover');
                    removeSchedule(scope.schedule);
                };
                scope.startResizeStart = function () {
                    resizeDirectionIsStart = true;
                    scope.startDrag();
                };
                scope.startResizeEnd = function () {
                    resizeDirectionIsStart = false;
                    scope.startDrag();
                };
                scope.startDrag = function () {
                    element.addClass('active');
                    containerEl.addClass('dragging');
                    containerEl.attr('no-add', 'true');
                    valuesOnDragStart = { start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end };
                };
                scope.endDrag = function () {
                    // this prevents user from accidentally
                    // adding new slot after resizing or dragging
                    setTimeout(function () {
                        containerEl.removeAttr('no-add');
                    }, 500);
                    element.removeClass('active');
                    containerEl.removeClass('dragging');
                    mergeOverlaps();
                    scope.$apply();
                };
                scope.resize = function (d) {
                    var ui = ngModelCtrl.$viewValue;
                    var delta = pixelToVal(d);
                    if (resizeDirectionIsStart) {
                        var newStart = Math.round(valuesOnDragStart.start + delta);
                        if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                            ngModelCtrl.$setViewValue({
                                start: newStart,
                                end: ui.end
                            });
                            ngModelCtrl.$render();
                        }
                    }
                    else {
                        var newEnd = Math.round(valuesOnDragStart.end + delta);
                        if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= conf.maxValue) {
                            ngModelCtrl.$setViewValue({
                                start: ui.start,
                                end: newEnd
                            });
                            ngModelCtrl.$render();
                        }
                    }
                };
                scope.drag = function (d) {
                    var ui = ngModelCtrl.$viewValue;
                    var delta = pixelToVal(d);
                    var duration = valuesOnDragStart.end - valuesOnDragStart.start;
                    var newStart = Math.round(valuesOnDragStart.start + delta);
                    var newEnd = Math.round(newStart + duration);
                    if (ui.start !== newStart && newStart >= 0 && newEnd <= conf.maxValue) {
                        ngModelCtrl.$setViewValue({
                            start: newStart,
                            end: newEnd
                        });
                        ngModelCtrl.$render();
                    }
                };
            }
            // on init, merge overlaps
            mergeOverlaps();
            //// UI -> model ////////////////////////////////////
            ngModelCtrl.$parsers.push(function (ui) {
                ngModelCtrl.$modelValue.start = ui.start;
                ngModelCtrl.$modelValue.end = ui.end;
                //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
                schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
                return ngModelCtrl.$modelValue;
            });
            ngModelCtrl.$render = function () {
                var ui = ngModelCtrl.$viewValue;
                var minutes = conf.maxValue;
                var css = {
                    left: ui.start / minutes * 100 + '%',
                    width: (ui.end - ui.start) / minutes * 100 + '%'
                };
                //$log.debug('RENDER :', index, scope.$index, css);
                element.css(css);
            };
            scope.$on('weeklySchedulerLocaleChanged', function () {
                // Simple change object reference so that ngModel triggers formatting & rendering
                scope.schedule = angular.copy(scope.schedule);
            });
        };
    }
    WeeklySlotDirective.Factory = function () {
        var directive = function () { return new WeeklySlotDirective(); };
        return directive;
    };
    WeeklySlotDirective.$name = 'weeklySlot';
    return WeeklySlotDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(WeeklySlotDirective.$name, WeeklySlotDirective.Factory());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ludGVydmFsLWdyaWQvaW50ZXJ2YWwtZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2xvY2FsZS9sb2NhbGUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS90aW1lLW9mLWRheS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FFL0UsTUFBTSxDQUFDLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxxQkFBcUI7UUFDOUUscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBQzlCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDcEIsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUN0RSxxQkFBcUIsRUFBRSwrQkFBK0I7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7S0FFRixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUs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QUMsUUFBUSxDQUFDO2dCQUU1QixJQUFJLEdBQUcsR0FBRztvQkFDUixJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUc7b0JBQ3BDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRztpQkFDakQsQ0FBQztnQkFFRixtREFBbUQ7Z0JBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDO1lBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRTtnQkFDeEMsaUZBQWlGO2dCQUNqRixLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFBO0lBT0gsQ0FBQztJQUxRLDJCQUFPLEdBQWQ7UUFDRSxJQUFJLFNBQVMsR0FBRyxjQUFNLE9BQUEsSUFBSSxtQkFBbUIsRUFBRSxFQUF6QixDQUF5QixDQUFDO1FBRWhELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUE3TE0seUJBQUssR0FBRyxZQUFZLENBQUM7SUE4TDlCLDBCQUFDO0NBL0xELEFBK0xDLElBQUE7QUFFRCxPQUFPO0tBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSB2YXIgbW9tZW50O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ25nQW5pbWF0ZScsICd3ZWVrbHlTY2hlZHVsZXInLCAnd2Vla2x5U2NoZWR1bGVySTE4TiddKVxyXG5cclxuICAuY29uZmlnKFsnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZVByb3ZpZGVyJywgZnVuY3Rpb24gKGxvY2FsZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgbG9jYWxlU2VydmljZVByb3ZpZGVyLmNvbmZpZ3VyZSh7XHJcbiAgICAgIGRveXM6IHsgJ2VzLWVzJzogNCB9LFxyXG4gICAgICBsYW5nOiB7ICdlcy1lcyc6IHsgd2Vla05iOiAnbsO6bWVybyBkZSBsYSBzZW1hbmEnLCBhZGROZXc6ICdBw7FhZGlyJyB9IH0sXHJcbiAgICAgIGxvY2FsZUxvY2F0aW9uUGF0dGVybjogJy9hbmd1bGFyLWxvY2FsZV97e2xvY2FsZX19LmpzJ1xyXG4gICAgfSk7XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgbG9jYWxlU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlU2VydmljZS4kbG9jYWxlLmlkLFxyXG4gICAgICAgIG9wdGlvbnM6IHsvKm1vbm9TY2hlZHVsZTogdHJ1ZSovIH0sXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTdW4nLFxyXG4gICAgICAgICAgICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnTW9uJyxcclxuICAgICAgICAgICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdUdWUnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAwLCBlbmQ6IDI0MCB9LFxyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAzNjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1dlZCcsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDEyMCwgZW5kOiA3MjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1RodXInLFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdGcmknLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiA3MjAsIGVuZDogNzgwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTYXQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZG9Tb21ldGhpbmcgPSBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIG1vZGVsIGhhcyBjaGFuZ2VkIScsIGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLm9uTG9jYWxlQ2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgaXMgY2hhbmdpbmcgdG8nLCAkc2NvcGUubW9kZWwubG9jYWxlKTtcclxuICAgICAgICBsb2NhbGVTZXJ2aWNlLnNldCgkc2NvcGUubW9kZWwubG9jYWxlKS50aGVuKGZ1bmN0aW9uICgkbG9jYWxlKSB7XHJcbiAgICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGNoYW5nZWQgdG8nLCAkbG9jYWxlLmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcblxyXG52YXIgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG52YXIgQ0xJQ0tfT05fQV9DRUxMID0gJ2NsaWNrT25BQ2VsbCc7XHJcblxyXG52YXIgaXNDdHJsO1xyXG5cclxuZnVuY3Rpb24gY3RybENoZWNrKGUpIHtcclxuICBpZiAoZS53aGljaCA9PT0gMTcpIHtcclxuICAgIGlzQ3RybCA9IGUudHlwZSA9PT0gJ2tleWRvd24nO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gbW91c2VTY3JvbGwoZWwsIGRlbHRhKSB7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY3RybENoZWNrKTtcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBjdHJsQ2hlY2spO1xyXG5cclxuICBlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgaWYgKGlzQ3RybCkge1xyXG4gICAgICB2YXIgc3R5bGUgPSBlbC5maXJzdENoaWxkLnN0eWxlLCBjdXJyZW50V2lkdGggPSBwYXJzZUludChzdHlsZS53aWR0aCk7XHJcbiAgICAgIGlmICgoZS53aGVlbERlbHRhIHx8IGUuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICBzdHlsZS53aWR0aCA9IChjdXJyZW50V2lkdGggKyAyICogZGVsdGEpICsgJyUnO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICBzdHlsZS53aWR0aCA9ICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJztcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKChlLndoZWVsRGVsdGEgfHwgZS5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWwuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB6b29tSW5BQ2VsbChlbCwgZXZlbnQsIGRhdGEpIHtcclxuXHJcbiAgdmFyIG5iRWxlbWVudHMgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgdmFyIGlkeCA9IGRhdGEuaWR4O1xyXG4gIC8vIHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgaXMgdXNlZCB3aGVuIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBncmlkIGlzIG5vdCBmdWxsXHJcbiAgLy8gRm9yIGluc3RhbmNlLCBpbiB0aGUgZXhhbXBsZSBiZWxvdyBgZmViIDE3YCBpcyBub3QgZnVsbFxyXG4gIC8vIGZlYiAxNyAgICAgICAgICBtYXJjaCAxN1xyXG4gIC8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICB2YXIgcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9IGRhdGEucGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZztcclxuXHJcbiAgdmFyIGNvbnRhaW5lcldpZHRoID0gZWwub2Zmc2V0V2lkdGg7XHJcblxyXG4gIC8vIGxlYXZlICgxLzMpIGVhY2ggc2lkZVxyXG4gIC8vIDEvMyB8ICAgIDMvMyAgIHwgMS8zXHJcbiAgdmFyIGJveFdpZHRoID0gY29udGFpbmVyV2lkdGggLyAoNSAvIDMpO1xyXG4gIHZhciBndXR0ZXJTaXplID0gYm94V2lkdGggLyAzO1xyXG5cclxuICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IG5iRWxlbWVudHMgKiBib3hXaWR0aDtcclxuICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gIGVsLmZpcnN0Q2hpbGQuc3R5bGUud2lkdGggPSBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJSc7XHJcblxyXG4gIGlmIChwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID09PSB1bmRlZmluZWQpIHtcclxuICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICBlbC5zY3JvbGxMZWZ0ID0gaWR4ICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBTaXplcyBvZiBjZWxscyBpbiBhIGxpbmUgY291bGQgZGlmZmVyZW50IChlc3BlY2lhbGx5IHRoZSBmaXJzdCBvbmUpXHJcbiAgICBlbC5zY3JvbGxMZWZ0ID0gc2NoZWR1bGVBcmVhV2lkdGhQeCAqIChwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIC8gMTAwKSAtIGd1dHRlclNpemU7XHJcbiAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICc9JyxcclxuICAgIG9uZHJhZ3N0b3A6ICc9JyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnPSdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZ3N0YXJ0KSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZykge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyhkZWx0YSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RvcCkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KENMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciB0aWNrc2l6ZSA9IDEwMCAvIHRpY2tjb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IEdSSURfVEVNUExBVEUuY3NzKHt3aWR0aDogdGlja3NpemUgKyAnJSd9KTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG4gIFxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwbScgOiAnYW0nO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBJbnRlcnZhbEdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2ludGVydmFsR3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJ2YWwgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5pbnRlcnZhbENvdW50O1xyXG4gICAgICAgIHZhciB0aWNrc2l6ZSA9IDEwMCAvIHRpY2tjb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IEdSSURfVEVNUExBVEUuY3NzKHt3aWR0aDogdGlja3NpemUgKyAnJSd9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBJbnRlcnZhbEdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShJbnRlcnZhbEdyaWREaXJlY3RpdmUuJG5hbWUsIEludGVydmFsR3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicsIFsndG1oLmR5bmFtaWNMb2NhbGUnXSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicpXHJcbiAgLnByb3ZpZGVyKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgWyd0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXInLCBmdW5jdGlvbiAodG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyKSB7XHJcblxyXG4gICAgdmFyIGRlZmF1bHRDb25maWc6IGFueSAvKiBUT0RPIHR5cGUgKi8gPSB7XHJcbiAgICAgIGRveXM6IHsnZGUtZGUnOiA0LCAnZW4tZ2InOiA0LCAnZW4tdXMnOiA2LCAnZnItZnInOiA0fSxcclxuICAgICAgbGFuZzoge1xyXG4gICAgICAgICdkZS1kZSc6IHt3ZWVrTmI6ICdXb2NoZW51bW1lcicsIGFkZE5ldzogJ0hpbnp1ZsO8Z2VuJ30sXHJcbiAgICAgICAgJ2VuLWdiJzoge3dlZWtOYjogJ1dlZWsgIycsIGFkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdlbi11cyc6IHt3ZWVrTmI6ICdXZWVrICMnLCBhZGROZXc6ICdBZGQnfSxcclxuICAgICAgICAnZnItZnInOiB7d2Vla05iOiAnTsKwIGRlIHNlbWFpbmUnLCBhZGROZXc6ICdBam91dGVyJ31cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuXHJcbiAgICAgIGlmIChjb25maWcgJiYgYW5ndWxhci5pc09iamVjdChjb25maWcpKSB7XHJcbiAgICAgICAgYW5ndWxhci5tZXJnZShkZWZhdWx0Q29uZmlnLCBjb25maWcpO1xyXG5cclxuICAgICAgICBpZiAoZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pIHtcclxuICAgICAgICAgIHRtaER5bmFtaWNMb2NhbGVQcm92aWRlci5sb2NhbGVMb2NhdGlvblBhdHRlcm4oZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRyb290U2NvcGUnLCAnJGxvY2FsZScsICd0bWhEeW5hbWljTG9jYWxlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhbGUsIHRtaER5bmFtaWNMb2NhbGUpIHtcclxuXHJcbiAgICAgIHZhciBtb21lbnRMb2NhbGVDYWNoZSA9IHt9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0TGFuZygpIHtcclxuICAgICAgICB2YXIga2V5ID0gJGxvY2FsZS5pZDtcclxuICAgICAgICBpZiAoIW1vbWVudExvY2FsZUNhY2hlW2tleV0pIHtcclxuICAgICAgICAgIG1vbWVudExvY2FsZUNhY2hlW2tleV0gPSBnZXRNb21lbnRMb2NhbGUoa2V5KTtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCwgbW9tZW50TG9jYWxlQ2FjaGVba2V5XS5sb2NhbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb21lbnQubG9jYWxlKG1vbWVudExvY2FsZUNhY2hlW2tleV0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmYXVsdENvbmZpZy5sYW5nW2tleV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIGp1c3QgbmVlZCBmZXcgbW9tZW50IGxvY2FsIGluZm9ybWF0aW9uXHJcbiAgICAgIGZ1bmN0aW9uIGdldE1vbWVudExvY2FsZShrZXkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgIGxvY2FsZToge1xyXG4gICAgICAgICAgICB3ZWVrOiB7XHJcbiAgICAgICAgICAgICAgLy8gQW5ndWxhciBtb25kYXkgPSAwIHdoZXJlYXMgTW9tZW50IG1vbmRheSA9IDFcclxuICAgICAgICAgICAgICBkb3c6ICgkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRklSU1REQVlPRldFRUsgKyAxKSAlIDcsXHJcbiAgICAgICAgICAgICAgZG95OiBkZWZhdWx0Q29uZmlnLmRveXNba2V5XVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhbGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnd2Vla2x5U2NoZWR1bGVyTG9jYWxlQ2hhbmdlZCcsIGdldExhbmcoKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAkbG9jYWxlOiAkbG9jYWxlLFxyXG4gICAgICAgIGdldExhbmc6IGdldExhbmcsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICByZXR1cm4gdG1oRHluYW1pY0xvY2FsZS5zZXQoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XTtcclxuICB9XSk7IiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuXHJcbiAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICB2YXIgY29uZiA9IHNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHNjaGVkdWxlciBibG9jayBzaXplIHdoZW4gYWRkaW5nIGEgbmV3IGl0ZW0gKGluIG1pbnV0ZXMpXHJcbiAgICB2YXIgZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSA9IChwYXJzZUludChhdHRycy5zaXplLCAxMCkgfHwgNjApO1xyXG5cclxuICAgIHZhciB2YWxUb1BpeGVsID0gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICB2YXIgcGVyY2VudCA9IHZhbCAvIGNvbmYuaW50ZXJ2YWxDb3VudCAvIGNvbmYuaW50ZXJ2YWw7XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiBlbGVtZW50WzBdLmNsaWVudFdpZHRoICsgMC41KTs7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBwaXhlbFRvVmFsID0gZnVuY3Rpb24gKHBpeGVsKSB7XHJcbiAgICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyBlbGVtZW50WzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKGNvbmYuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogY29uZi5pbnRlcnZhbDtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGFkZFNsb3QgPSAoc3RhcnQsIGVuZCkgPT4ge1xyXG4gICAgICBzdGFydCA9IHN0YXJ0ID49IDAgPyBzdGFydCA6IDA7XHJcbiAgICAgIGVuZCA9IGVuZCA8PSBjb25mLm1heFZhbHVlID8gZW5kIDogY29uZi5tYXhWYWx1ZTtcclxuXHJcbiAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe3N0YXJ0OiBzdGFydCwgZW5kOiBlbmR9KTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRFbGVtZW50T2Zmc2V0WCA9IChlbGVtKSA9PiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcblxyXG4gICAgdmFyIGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuICAgIHZhciBob3ZlckVsZW1lbnRXaWR0aCA9IHZhbFRvUGl4ZWwoZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSk7XHJcblxyXG4gICAgaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgIHdpZHRoOiBob3ZlckVsZW1lbnRXaWR0aCArICdweCdcclxuICAgIH0pO1xyXG5cclxuICAgIGVsZW1lbnQub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBlbE9mZlggPSBnZXRFbGVtZW50T2Zmc2V0WChlbGVtZW50KTtcclxuICAgICAgdmFyIGxlZnQgPSBlLnBhZ2VYIC0gZWxPZmZYIC0gaG92ZXJFbGVtZW50V2lkdGggLyAyO1xyXG4gICAgICB2YXIgc25hcHBlZCA9IHZhbFRvUGl4ZWwocGl4ZWxUb1ZhbChsZWZ0KSk7XHJcblxyXG4gICAgICBob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiBzbmFwcGVkICsgJ3B4J1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGhvdmVyRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKCFlbGVtZW50LmF0dHIoJ25vLWFkZCcpKSB7XHJcbiAgICAgICAgdmFyIGVsT2ZmWCA9IGdldEVsZW1lbnRPZmZzZXRYKGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBob3ZlckVsT2ZmWCA9IGdldEVsZW1lbnRPZmZzZXRYKGhvdmVyRWxlbWVudCkgLSBlbE9mZlg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gcGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZTtcclxuXHJcbiAgICAgICAgYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgTXVsdGlTbGlkZXJEaXJlY3RpdmUoKTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShNdWx0aVNsaWRlckRpcmVjdGl2ZS4kbmFtZSwgTXVsdGlTbGlkZXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3RpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGNvbnN0IHN0YW5kYXJkRm9ybWF0OiBzdHJpbmcgPSAnaDptbUEnO1xyXG4gICAgICAgIGNvbnN0IG1pbGl0YXJ5Rm9ybWF0OiBzdHJpbmcgPSAnSEg6bW0nO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gVGhlIG1vbWVudC1kdXJhdGlvbi1mb3JtYXQgcGFja2FnZSBhbHdheXMgb3V0cHV0cyBtaWxpdGFyeSB0aW1lLCAoaXQgY29udmVydHMgYSBkdXJhdGlvbiB0byBhIHRpbWUgc3RyaW5nLCBub3QgYSB0aW1lIG9mIGRheSkgc28gd2UnbGwgbmVlZCB0byBncmFiIHRoYXQgYW5kIHRoZW4gY29udmVydFxyXG4gICAgICAgICAgICBsZXQgbWlsaXRhcnlUaW1lID0gbW9tZW50LmR1cmF0aW9uKG1pbnV0ZXMsICdtaW51dGVzJykuZm9ybWF0KG1pbGl0YXJ5Rm9ybWF0LCB7IHRyaW06IGZhbHNlIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vbWVudChtaWxpdGFyeVRpbWUsIG1pbGl0YXJ5Rm9ybWF0KS5mb3JtYXQoc3RhbmRhcmRGb3JtYXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckaW5qZWN0b3InLFxyXG4gICAgJyRsb2cnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRpbmplY3RvcjogYW5ndWxhci5hdXRvLklJbmplY3RvclNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRsb2c6IGFuZ3VsYXIuSUxvZ1NlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW1zOiBhbnlbXTsgLyogVE9ETyB0eXBlICovXHJcblxyXG4gIHB1YmxpYyBkZWZhdWx0T3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnMgPSB7XHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgc2VsZWN0b3I6ICcuc2NoZWR1bGUtYXJlYS1jb250YWluZXInXHJcbiAgfTtcclxuXHJcbiAgcHVibGljIG9uOiB7XHJcbiAgICBjaGFuZ2U6IChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpID0+IEZ1bmN0aW9uO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyAkbW9kZWxDaGFuZ2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW107IC8qIFRPRE8gdHlwZSAqL1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgaTE4biBzZXJ2aWNlXHJcbiAgICB2YXIgbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJztcclxuXHJcbiAgICBpZiAodGhpcy4kaW5qZWN0b3IuaGFzKG5hbWUpKSB7XHJcbiAgICAgIHRoaXMuJGxvZy5pbmZvKCdUaGUgSTE4TiBzZXJ2aWNlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBpbml0aWFsaXplZCEnKTtcclxuXHJcbiAgICAgIHZhciBsb2NhbGVTZXJ2aWNlOiBhbnkgPSB0aGlzLiRpbmplY3Rvci5nZXQobmFtZSk7IC8qIFRPRE8gdHlwZSAqL1xyXG4gICAgICB0aGlzLmRlZmF1bHRPcHRpb25zLmxhYmVscyA9IGxvY2FsZVNlcnZpY2UuZ2V0TGFuZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kbG9nLmluZm8oJ05vIEkxOE4gZm91bmQgZm9yIHRoaXMgbW9kdWxlLCBjaGVjayB0aGUgbmcgbW9kdWxlIFt3ZWVrbHlTY2hlZHVsZXJJMThOXSBpZiB5b3UgbmVlZCBpMThuLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRsb2c6IGFuZ3VsYXIuSUxvZ1NlcnZpY2UsXHJcbiAgICBwcml2YXRlICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICByZXN0cmljdCA9ICdFJztcclxuICByZXF1aXJlID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgdmFyIG9wdGlvbnNGbiA9IHRoaXMuJHBhcnNlKGF0dHJzLm9wdGlvbnMpLFxyXG4gICAgICBvcHRpb25zID0gYW5ndWxhci5leHRlbmQoc2NoZWR1bGVyQ3RybC5kZWZhdWx0T3B0aW9ucywgb3B0aW9uc0ZuKHNjb3BlKSB8fCB7fSk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBzY2hlZHVsZSBjb250YWluZXIgZWxlbWVudFxyXG4gICAgdmFyIGVsID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKHNjaGVkdWxlckN0cmwuZGVmYXVsdE9wdGlvbnMuc2VsZWN0b3IpO1xyXG4gICAgdmFyIHNlbGY6IFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSA9IHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gb25Nb2RlbENoYW5nZShpdGVtcykge1xyXG4gICAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiBpbiBtdWx0aVNsaWRlciBtb2RlLCBlbnN1cmUgYSBzY2hlZHVsZSBhcnJheSBpcyBwcmVzZW50IG9uIGVhY2ggaXRlbVxyXG4gICAgICAgIC8vIEVsc2Ugb25seSB1c2UgZmlyc3QgZWxlbWVudCBvZiBzY2hlZHVsZSBhcnJheVxyXG4gICAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgIHZhciBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgICBpZiAoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZyA9IHNlbGYuY29uZmlnKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBGaW5hbGx5LCBydW4gdGhlIHN1YiBkaXJlY3RpdmVzIGxpc3RlbmVyc1xyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICBsaXN0ZW5lcihzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWwpIHtcclxuICAgICAgLy8gSW5zdGFsbCBtb3VzZSBzY3JvbGxpbmcgZXZlbnQgbGlzdGVuZXIgZm9yIEggc2Nyb2xsaW5nXHJcbiAgICAgIG1vdXNlU2Nyb2xsKGVsLCAyMCk7XHJcblxyXG4gICAgICBzY29wZS4kb24oQ0xJQ0tfT05fQV9DRUxMLCBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgIHpvb21JbkFDZWxsKGVsLCBlLCBkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY2hlZHVsZXJDdHJsLm9uID0ge1xyXG4gICAgICAgIGNoYW5nZTogKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgdmFyIG9uQ2hhbmdlRnVuY3Rpb24gPSB0aGlzLiRwYXJzZShhdHRycy5vbkNoYW5nZSkoc2NvcGUpO1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihvbkNoYW5nZUZ1bmN0aW9uKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb25DaGFuZ2VGdW5jdGlvbihpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBXYXRjaCB0aGUgbW9kZWwgaXRlbXNcclxuICAgICAgICovXHJcbiAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oYXR0cnMuaXRlbXMsIG9uTW9kZWxDaGFuZ2UpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIExpc3RlbiB0byAkbG9jYWxlIGNoYW5nZSAoYnJvdWdodCBieSBleHRlcm5hbCBtb2R1bGUgd2Vla2x5U2NoZWR1bGVySTE4TilcclxuICAgICAgICovXHJcbiAgICAgIHNjb3BlLiRvbignd2Vla2x5U2NoZWR1bGVyTG9jYWxlQ2hhbmdlZCcsIGZ1bmN0aW9uIChlLCBsYWJlbHMpIHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgIHNjaGVkdWxlckN0cmwuY29uZmlnLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgICB9XHJcbiAgICAgICAgb25Nb2RlbENoYW5nZShhbmd1bGFyLmNvcHkodGhpcy4kcGFyc2UoYXR0cnMuaXRlbXMpKHNjb3BlKSwgW10pKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmUgdGhlIHNjaGVkdWxlci5cclxuICAgKi9cclxuICBwcml2YXRlIGNvbmZpZyhvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucyk6IElXZWVrbHlTY2hlZHVsZXJDb25maWcge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciByZXN1bHQ6IElXZWVrbHlTY2hlZHVsZXJDb25maWcgPSBhbmd1bGFyLmV4dGVuZChvcHRpb25zLCB7IGludGVydmFsOiBpbnRlcnZhbCwgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSwgaG91ckNvdW50OiBob3Vyc0luRGF5LCBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50IH0pO1xyXG5cclxuICAgIC8vIExvZyBjb25maWd1cmF0aW9uXHJcbiAgICB0aGlzLiRsb2cuZGVidWcoJ1dlZWtseSBTY2hlZHVsZXIgY29uZmlndXJhdGlvbjonLCByZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGxvZywgJHBhcnNlKSA9PiBuZXcgV2Vla2x5U2NoZWR1bGVyRGlyZWN0aXZlKCRsb2csICRwYXJzZSk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbXHJcbiAgICAgICckbG9nJyxcclxuICAgICAgJyRwYXJzZSdcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbi8qIGdsb2JhbCBtb3VzZVNjcm9sbCwgQ0xJQ0tfT05fQV9DRUxMLCB6b29tSW5BQ2VsbCAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5kaXJlY3RpdmUoV2Vla2x5U2NoZWR1bGVyRGlyZWN0aXZlLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdCc7XHJcblxyXG4gIHJlc3RyaWN0ID0gJ0UnO1xyXG4gIHJlcXVpcmUgPSBbJ153ZWVrbHlTY2hlZHVsZXInLCAnbmdNb2RlbCddO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGN0cmxzKSA9PiB7XHJcbiAgICB2YXIgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciA9IGN0cmxzWzBdLFxyXG4gICAgICAgIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IGN0cmxzWzFdO1xyXG5cclxuICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcbiAgICB2YXIgaW5kZXggPSBzY29wZS4kcGFyZW50LiRpbmRleDtcclxuICAgIHZhciBjb250YWluZXJFbCA9IGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICB2YXIgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB2YXIgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IHNjb3BlLnNjaGVkdWxlLnN0YXJ0LCBlbmQ6IHNjb3BlLnNjaGVkdWxlLmVuZH07XHJcblxyXG4gICAgdmFyIHBpeGVsVG9WYWwgPSBmdW5jdGlvbiAocGl4ZWwpIHtcclxuICAgICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKGNvbmYuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogY29uZi5pbnRlcnZhbDtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJlbW92ZVNjaGVkdWxlID0gZnVuY3Rpb24oc2NoZWR1bGUpIHtcclxuICAgICAgdmFyIHNjaGVkdWxlcyA9IHNjb3BlLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtZXJnZU92ZXJsYXBzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgc2NoZWR1bGUgPSBzY29wZS5zY2hlZHVsZTtcclxuICAgICAgdmFyIHNjaGVkdWxlcyA9IHNjb3BlLml0ZW0uc2NoZWR1bGVzO1xyXG4gICAgICBzY2hlZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAvLyBtb2RlbCBpcyBpbnNpZGUgYW5vdGhlciBzbG90XHJcbiAgICAgICAgICBpZiAoZWwuZW5kID49IHNjaGVkdWxlLmVuZCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5zdGFydCkge1xyXG4gICAgICAgICAgICByZW1vdmVTY2hlZHVsZShlbCk7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLmVuZCA9IGVsLmVuZDtcclxuICAgICAgICAgICAgc2NoZWR1bGUuc3RhcnQgPSBlbC5zdGFydDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIG1vZGVsIGNvbXBsZXRlbHkgY292ZXJzIGFub3RoZXIgc2xvdFxyXG4gICAgICAgICAgZWxzZSBpZiAoc2NoZWR1bGUuZW5kID49IGVsLmVuZCAmJiBzY2hlZHVsZS5zdGFydCA8PSBlbC5zdGFydCkge1xyXG4gICAgICAgICAgICByZW1vdmVTY2hlZHVsZShlbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBlbmQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICAgIGVsc2UgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5lbmQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZVNjaGVkdWxlKGVsKTtcclxuICAgICAgICAgICAgc2NoZWR1bGUuc3RhcnQgPSBlbC5zdGFydDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIHN0YXJ0IGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgICBlbHNlIGlmIChlbC5zdGFydCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgICAgcmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG4gICAgICAgICAgICBzY2hlZHVsZS5lbmQgPSBlbC5lbmQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb250YWluZXJFbC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBpZiAoc2NvcGUuaXRlbS5lZGl0YWJsZSAhPT0gZmFsc2UpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIERlbGV0ZSBvbiByaWdodCBjbGljayBvbiBzbG90XHJcbiAgICAgICAqL1xyXG4gICAgICBzY29wZS5kZWxldGVTZWxmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xyXG4gICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICAgICAgcmVtb3ZlU2NoZWR1bGUoc2NvcGUuc2NoZWR1bGUpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuc3RhcnRSZXNpemVTdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0UmVzaXplRW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgY29udGFpbmVyRWwuYXR0cignbm8tYWRkJywgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUuc3RhcnQsIGVuZDogbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZS5lbmR9O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuZW5kRHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICAgICAgbWVyZ2VPdmVybGFwcygpO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUucmVzaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcblxyXG4gICAgICAgIGlmIChyZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgbmV3RW5kID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IGNvbmYubWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgc3RhcnQ6IHVpLnN0YXJ0LFxyXG4gICAgICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuZHJhZyA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgdmFyIHVpID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICAgICB2YXIgZGVsdGEgPSBwaXhlbFRvVmFsKGQpO1xyXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IHZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgICAgIHZhciBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IGNvbmYubWF4VmFsdWUpIHtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb24gaW5pdCwgbWVyZ2Ugb3ZlcmxhcHNcclxuICAgIG1lcmdlT3ZlcmxhcHMoKTtcclxuXHJcbiAgICAvLy8vIFVJIC0+IG1vZGVsIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgbmdNb2RlbEN0cmwuJHBhcnNlcnMucHVzaCgodWkpID0+IHtcclxuICAgICAgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuc3RhcnQgPSB1aS5zdGFydDtcclxuICAgICAgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuZW5kID0gdWkuZW5kO1xyXG4gICAgICAvLyRsb2cuZGVidWcoJ1BBUlNFUiA6JywgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuJCRoYXNoS2V5LCBpbmRleCwgc2NvcGUuJGluZGV4LCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSk7XHJcbiAgICAgIHNjaGVkdWxlckN0cmwub24uY2hhbmdlKGluZGV4LCBzY29wZS4kaW5kZXgsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKTtcclxuICAgICAgcmV0dXJuIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHVpID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICAgdmFyIG1pbnV0ZXMgPSBjb25mLm1heFZhbHVlO1xyXG5cclxuICAgICAgdmFyIGNzcyA9IHtcclxuICAgICAgICBsZWZ0OiB1aS5zdGFydCAvIG1pbnV0ZXMgKiAxMDAgKyAnJScsXHJcbiAgICAgICAgd2lkdGg6ICh1aS5lbmQgLSB1aS5zdGFydCkgLyBtaW51dGVzICogMTAwICsgJyUnXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyRsb2cuZGVidWcoJ1JFTkRFUiA6JywgaW5kZXgsIHNjb3BlLiRpbmRleCwgY3NzKTtcclxuICAgICAgZWxlbWVudC5jc3MoY3NzKTtcclxuICAgIH07XHJcblxyXG4gICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBTaW1wbGUgY2hhbmdlIG9iamVjdCByZWZlcmVuY2Ugc28gdGhhdCBuZ01vZGVsIHRyaWdnZXJzIGZvcm1hdHRpbmcgJiByZW5kZXJpbmdcclxuICAgICAgc2NvcGUuc2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkoc2NvcGUuc2NoZWR1bGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgV2Vla2x5U2xvdERpcmVjdGl2ZSgpO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKFdlZWtseVNsb3REaXJlY3RpdmUuJG5hbWUsIFdlZWtseVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><hourly-grid class="grid-container"></hourly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><interval-grid class="grid-container striped" no-text></interval-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | timeOfDay}} - {{schedule.end | timeOfDay}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | timeOfDay}} - {{schedule.end | timeOfDay}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove" ng-click="deleteSelf()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);