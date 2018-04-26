angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])
    .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
        localeServiceProvider.configure({
            doys: { 'es-es': 4 },
            lang: { 'es-es': {} },
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
            console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
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
/** @internal */
var HandleDirective = /** @class */ (function () {
    function HandleDirective($document) {
        var _this = this;
        this.$document = $document;
        this.restrict = 'A';
        this.scope = {
            ondrag: '&',
            ondragstop: '&',
            ondragstart: '&'
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
                if (angular.isFunction(scope.ondragstart)) {
                    scope.ondragstart();
                }
            });
            function mousemove(event) {
                var delta = event.pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.ondrag({ delta: delta });
                }
            }
            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                if (angular.isFunction(scope.ondragstop)) {
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
            scope.$emit("clickOnACell" /* CLICK_ON_A_CELL */, {
                nbElements: hourCount,
                idx: idx
            });
        });
    };
    HourlyGridDirective.prototype.doGrid = function (scope, element, attrs, config) {
        var i;
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = GRID_TEMPLATE.clone();
        // Clean element
        element.empty();
        for (i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                var currentHour = i % 12;
                var meridiem = i >= 12 ? 'p' : 'a';
                child.text("" + (currentHour || '12') + meridiem);
            }
            else {
                // no-text ones will get striped intervals
                child.addClass('striped');
                var numIntervalsInTick = 60 / config.interval;
                var intervalPercentage = 100 / numIntervalsInTick;
                for (var j = 0; j < numIntervalsInTick; j++) {
                    var grandChild = GRID_TEMPLATE.clone();
                    grandChild.attr('rel', ((i * numIntervalsInTick) + j) * config.interval);
                    grandChild.addClass('interval');
                    grandChild.css('width', intervalPercentage + '%');
                    child.append(grandChild);
                }
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
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);
angular.module('weeklySchedulerI18N')
    .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
        var defaultConfig = {
            doys: { 'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4 },
            lang: {
                'de-de': {},
                'en-gb': {},
                'en-us': {
                    meridiem: function (hours) {
                        if (hours > 11) {
                            return 'P';
                        }
                        else {
                            return 'A';
                        }
                    }
                },
                'fr-fr': {}
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
                    var locale = {
                        id: key,
                        locale: {
                            week: {
                                // Angular monday = 0 whereas Moment monday = 1
                                dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
                                doy: defaultConfig.doys[key]
                            }
                        }
                    };
                    var meridiem = defaultConfig.lang[key].meridiem;
                    if (angular.isFunction(meridiem)) {
                        locale.locale.meridiem = meridiem;
                    }
                    return locale;
                }
                $rootScope.$on('$localeChangeSuccess', function () {
                    $rootScope.$broadcast("weeklySchedulerLocaleChanged" /* LOCALE_CHANGED */, getLang());
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
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $scope) {
        this.$element = $element;
        this.$scope = $scope;
        this.size = 60; // minutes
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.$onInit = function () {
        var _this = this;
        this.$scope.$on("resized" /* RESIZED */, function () {
            _this.resize();
        });
        this.$scope.$on("zoomedIn" /* ZOOMED_IN */, function () {
            _this.resize();
        });
        this.$scope.$on("zoomedOut" /* ZOOMED_OUT */, function () {
            _this.resize();
        });
    };
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$hoverElement = angular.element(this.$element.find('div')[0]);
        this.setHoverElementWidth();
        this.$element.on('mousemove', function (e) {
            var elOffX = _this.getElementOffsetX(_this.$element);
            var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
            var val = _this.pixelToVal(left);
            _this.$hoverElement.css({
                left: _this.getUnderlyingIntervalOffsetLeft(val)
            });
        });
    };
    MultiSliderController.prototype.addSlot = function (start, end) {
        if (start < 0) {
            start = 0;
        }
        if (end > this.config.maxValue) {
            end = this.config.maxValue;
        }
        var item = this.item;
        if (!item.schedules) {
            item.schedules = [];
        }
        item.schedules.push({
            start: start,
            end: end
        });
    };
    MultiSliderController.prototype.getElementOffsetX = function (elem) {
        return elem[0].getBoundingClientRect().left;
    };
    MultiSliderController.prototype.getSlotLeft = function (schedule) {
        return this.getUnderlyingIntervalOffsetLeft(schedule.start);
    };
    MultiSliderController.prototype.getSlotRight = function (schedule) {
        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        var underlyingInterval = this.getUnderlyingInterval(schedule.end - this.config.interval);
        var offsetRight = underlyingInterval.offsetLeft + underlyingInterval.offsetWidth;
        var containerLeft = this.getElementOffsetX(this.$element);
        var containerRight = this.$element[0].getBoundingClientRect().right;
        return containerRight - containerLeft - offsetRight + 'px';
    };
    MultiSliderController.prototype.getUnderlyingInterval = function (val) {
        // Slightly hacky but does the job. TODO ?
        if (val < 0) {
            val = 0;
        }
        return this.$element.parent()[0].querySelector("[rel='" + val + "']");
    };
    MultiSliderController.prototype.getUnderlyingIntervalOffsetLeft = function (val) {
        return this.getUnderlyingInterval(val).offsetLeft + 'px';
    };
    MultiSliderController.prototype.onHoverElementClick = function (event) {
        if (!this.$element.attr('no-add')) {
            var elOffX = this.getElementOffsetX(this.$element);
            var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
            var start = this.pixelToVal(hoverElOffX);
            var end = start + this.size;
            this.addSlot(start, end);
        }
    };
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.$element.addClass('slot-hover');
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.$element.removeClass('slot-hover');
    };
    MultiSliderController.prototype.resize = function () {
        this.setHoverElementWidth();
        /* Since we have changed the width of the element via plain js +
         * the ng-styles for the individual slots are computed in this controller,
         * we must call $apply() manually so they will all update their positions to match the zoom level
         */
        this.$scope.$apply();
    };
    MultiSliderController.prototype.setHoverElementWidth = function () {
        var width = this.valToPixel(this.size);
        this.$hoverElement.css({
            width: width + "px"
        });
    };
    MultiSliderController.prototype.valToPixel = function (val) {
        var percent = val / this.config.intervalCount / this.config.interval;
        return Math.floor(percent * this.element.clientWidth + 0.5);
    };
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    MultiSliderController.$name = 'multiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$scope'
    ];
    return MultiSliderController;
}());
/** @internal */
var MultiSliderComponent = /** @class */ (function () {
    function MultiSliderComponent() {
        this.bindings = {
            config: '<',
            item: '=',
            index: '<',
            size: '<?'
        };
        this.controller = MultiSliderController.$name;
        this.controllerAs = MultiSliderController.$controllerAs;
        this.templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
    }
    MultiSliderComponent.$name = 'multiSlider';
    return MultiSliderComponent;
}());
angular.module('weeklyScheduler')
    .controller(MultiSliderController.$name, MultiSliderController)
    .component(MultiSliderComponent.$name, new MultiSliderComponent());
var ResizeService = /** @class */ (function () {
    function ResizeService($rootScope, $window) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.initialized = false;
    }
    ResizeService.prototype.initialize = function () {
        var _this = this;
        if (this.initialized) {
            return;
        }
        this.$window.addEventListener('resize', function () {
            _this.$rootScope.$broadcast("resized" /* RESIZED */);
        });
        this.initialized = true;
    };
    ResizeService.$name = 'resizeService';
    ResizeService.$inject = [
        '$rootScope',
        '$window'
    ];
    return ResizeService;
}());
angular
    .module('weeklyScheduler')
    .service(ResizeService.$name, ResizeService)
    .run([ResizeService.$name, function (resizeService) { return resizeService.initialize(); }]);
var ScheduleAreaContainerController = /** @class */ (function () {
    function ScheduleAreaContainerController($element, $scope, scrollService, zoomService) {
        this.$element = $element;
        this.$scope = $scope;
        this.scrollService = scrollService;
        this.zoomService = zoomService;
    }
    ScheduleAreaContainerController.prototype.$postLink = function () {
        var _this = this;
        var element = this.$element[0]; // grab plain js, not jqlite
        this.scrollService.hijackScroll(element, 20);
        this.$scope.$on("clickOnACell" /* CLICK_ON_A_CELL */, function (e, data) {
            _this.zoomService.zoomInACell(element, e, data);
        });
    };
    ScheduleAreaContainerController.$name = 'scheduleAreaContainerController';
    ScheduleAreaContainerController.$inject = [
        '$element',
        '$scope',
        'scrollService',
        'zoomService'
    ];
    return ScheduleAreaContainerController;
}());
var ScheduleAreaContainerComponent = /** @class */ (function () {
    function ScheduleAreaContainerComponent() {
        this.controller = ScheduleAreaContainerController.$name;
        this.transclude = true;
        this.template = "<ng-transclude></ng-transclude>";
    }
    ScheduleAreaContainerComponent.$name = 'scheduleAreaContainer';
    return ScheduleAreaContainerComponent;
}());
angular.module('weeklyScheduler')
    .controller(ScheduleAreaContainerController.$name, ScheduleAreaContainerController)
    .component(ScheduleAreaContainerComponent.$name, new ScheduleAreaContainerComponent());
var ScrollService = /** @class */ (function () {
    function ScrollService(zoomService) {
        this.zoomService = zoomService;
    }
    ScrollService.prototype.hijackScroll = function (element, delta) {
        var _this = this;
        element.addEventListener('mousewheel', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.ctrlKey) {
                _this.zoomService.zoomByScroll(element, event, delta);
            }
            else {
                if ((event.wheelDelta || event.detail) > 0) {
                    element.scrollLeft -= delta;
                }
                else {
                    element.scrollLeft += delta;
                }
            }
            return false;
        });
    };
    ScrollService.$name = 'scrollService';
    ScrollService.$inject = [
        'zoomService'
    ];
    return ScrollService;
}());
angular
    .module('weeklyScheduler')
    .service(ScrollService.$name, ScrollService);
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
    function WeeklySchedulerController($scope, localeService /* TODO type */) {
        this.$scope = $scope;
        this.localeService = localeService;
        this.defaultOptions = {
            monoSchedule: false,
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        var _this = this;
        this.defaultOptions.labels = this.localeService.getLang();
        // Will hang our model change listeners
        this.$modelChangeListeners = [];
        /**
         * Watch the model items
         */
        this.$scope.$watchCollection(function () { return _this.items; }, function (newItems) { return _this.onModelChange(newItems); });
        /**
         * Listen to $locale change (brought by external module weeklySchedulerI18N)
         */
        this.$scope.$on("weeklySchedulerLocaleChanged" /* LOCALE_CHANGED */, function (e, labels) {
            if (_this.config) {
                _this.config.labels = labels;
            }
            _this.onModelChange(angular.copy(_this.items, []));
        });
    };
    /**
     * Configure the scheduler.
     */
    WeeklySchedulerController.prototype.configure = function (options) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;
        var result = angular.extend(this.defaultOptions, { interval: interval, maxValue: minutesInDay, hourCount: hoursInDay, intervalCount: intervalCount });
        return result;
    };
    WeeklySchedulerController.prototype.onModelChange = function (items) {
        var _this = this;
        // Check items are present
        if (items) {
            // Check items are in an Array
            if (!angular.isArray(items)) {
                throw 'You should use weekly-scheduler directive with an Array of items';
            }
            // Keep track of our model (use it in template)
            this.items = items;
            // If in multiSlider mode, ensure a schedule array is present on each item
            // Else only use first element of schedule array
            items.forEach(function (item) {
                var schedules = item.schedules;
                if (schedules && schedules.length) {
                    if (_this.options.monoSchedule) {
                        item.schedules = [schedules[0]];
                    }
                }
                else {
                    item.schedules = [];
                }
            });
            // Calculate configuration
            this.config = this.configure(this.options);
            // Finally, run the sub directives listeners
            this.$modelChangeListeners.forEach(function (listener) {
                listener(_this.config);
            });
        }
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'weeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$scope',
        'weeklySchedulerLocaleService'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
            items: '=',
            options: '=',
            onChange: '&'
        };
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.transclude = true;
        this.templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
    }
    WeeklySchedulerComponent.$name = 'weeklyScheduler';
    return WeeklySchedulerComponent;
}());
angular.module('weeklyScheduler')
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
var WeeklySlotController = /** @class */ (function () {
    function WeeklySlotController($element, $scope) {
        this.$element = $element;
        this.$scope = $scope;
        this.resizeDirectionIsStart = true;
        this.$containerEl = this.$element.parent();
    }
    WeeklySlotController.prototype.$onInit = function () {
        var _this = this;
        this.valuesOnDragStart = {
            start: this.schedule.start,
            end: this.schedule.end
        };
        this.mergeOverlaps();
        this.$scope.$on("weeklySchedulerLocaleChanged" /* LOCALE_CHANGED */, function () {
            // Simple change object reference so that ngModel triggers formatting & rendering
            _this.schedule = angular.copy(_this.schedule);
        });
    };
    WeeklySlotController.prototype.canRemove = function () {
        return !angular.isDefined(this.item.editable) || this.item.editable;
    };
    WeeklySlotController.prototype.deleteSelf = function () {
        this.$containerEl.removeClass('dragging');
        this.$containerEl.removeClass('slot-hover');
        this.removeSchedule(this.schedule);
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        var ui = this.schedule;
        var delta = this.pixelToVal(pixel);
        var duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var newEnd = Math.round(newStart + duration);
        if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
            this.updateSelf({
                start: newStart,
                end: newEnd
            });
        }
    };
    WeeklySlotController.prototype.endDrag = function () {
        var _this = this;
        // this prevents user from accidentally
        // adding new slot after resizing or dragging
        setTimeout(function () {
            _this.$containerEl.removeAttr('no-add');
        }, 500);
        this.$element.removeClass('active');
        this.$containerEl.removeClass('dragging');
        this.mergeOverlaps();
    };
    WeeklySlotController.prototype.mergeOverlaps = function () {
        var _this = this;
        var schedule = this.schedule;
        var schedules = this.item.schedules;
        schedules.forEach(function (el) {
            if (el !== schedule) {
                // model is inside another slot
                if (el.end >= schedule.end && el.start <= schedule.start) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: el.end
                    });
                }
                // model completely covers another slot
                else if (schedule.end >= el.end && schedule.start <= el.start) {
                    _this.removeSchedule(el);
                }
                // another slot's end is inside current model
                else if (el.end >= schedule.start && el.end <= schedule.end) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: schedule.end
                    });
                }
                // another slot's start is inside current model
                else if (el.start >= schedule.start && el.start <= schedule.end) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: schedule.start,
                        end: el.end
                    });
                }
            }
        });
    };
    WeeklySlotController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.$containerEl[0].clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    WeeklySlotController.prototype.removeSchedule = function (schedule) {
        var schedules = this.item.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
    };
    WeeklySlotController.prototype.resize = function (pixel) {
        var ui = this.schedule;
        var delta = this.pixelToVal(pixel);
        if (this.resizeDirectionIsStart) {
            var newStart = Math.round(this.valuesOnDragStart.start + delta);
            if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                this.updateSelf({
                    start: newStart,
                    end: ui.end
                });
            }
        }
        else {
            var newEnd = Math.round(this.valuesOnDragStart.end + delta);
            if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= this.config.maxValue) {
                this.updateSelf({
                    start: ui.start,
                    end: newEnd
                });
            }
        }
    };
    WeeklySlotController.prototype.startDrag = function () {
        this.$element.addClass('active');
        this.$containerEl.addClass('dragging');
        this.$containerEl.attr('no-add', 'true');
        this.valuesOnDragStart = {
            start: this.schedule.start,
            end: this.schedule.end
        };
    };
    WeeklySlotController.prototype.startResizeStart = function () {
        this.resizeDirectionIsStart = true;
        this.startDrag();
    };
    WeeklySlotController.prototype.startResizeEnd = function () {
        this.resizeDirectionIsStart = false;
        this.startDrag();
    };
    WeeklySlotController.prototype.updateSelf = function (update) {
        this.schedule.start = update.start;
        this.schedule.end = update.end;
        this.ngModelCtrl.$setViewValue(this.schedule);
        this.schedulerCtrl.onChange({
            itemIndex: this.itemIndex,
            scheduleIndex: this.scheduleIndex,
            scheduleValue: this.schedule
        });
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        '$element',
        '$scope'
    ];
    return WeeklySlotController;
}());
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            schedule: '=ngModel',
            itemIndex: '<',
            scheduleIndex: '<',
            item: '='
        };
        this.controller = WeeklySlotController.$name;
        this.controllerAs = WeeklySlotController.$controllerAs;
        this.require = {
            schedulerCtrl: '^weeklyScheduler',
            ngModelCtrl: 'ngModel'
        };
        this.templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
    }
    WeeklySlotComponent.$name = 'weeklySlot';
    return WeeklySlotComponent;
}());
angular
    .module('weeklyScheduler')
    .controller(WeeklySlotController.$name, WeeklySlotController)
    .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
var ZoomService = /** @class */ (function () {
    function ZoomService($rootScope) {
        this.$rootScope = $rootScope;
        this.selector = '.schedule-area';
    }
    ZoomService.prototype.broadcastZoomedInEvent = function () {
        this.$rootScope.$broadcast("zoomedIn" /* ZOOMED_IN */);
    };
    ZoomService.prototype.broadcastZoomedOutEvent = function () {
        this.$rootScope.$broadcast("zoomedOut" /* ZOOMED_OUT */);
    };
    ZoomService.prototype.resetZoom = function (element) {
        element.querySelector(this.selector).style.width = '100%';
        this.broadcastZoomedOutEvent();
    };
    ZoomService.prototype.zoomInACell = function (element, event, data) {
        var elementCount = data.nbElements;
        var i = data.idx;
        // percentWidthFromBeginning is used when the first element of the grid is not full
        // For instance, in the example below `feb 17` is not full
        // feb 17          march 17
        //       |    
        var percentWidthFromBeginning = data.percentWidthFromBeginning;
        var containerWidth = element.offsetWidth;
        // leave (1/3) each side
        // 1/3 |    3/3   | 1/3
        var boxWidth = containerWidth / (5 / 3);
        var gutterSize = boxWidth / 3;
        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
        element.querySelector(this.selector).style.width = scheduleAreaWidthPercent + '%';
        if (percentWidthFromBeginning === undefined) {
            // All cells of a line have the same size
            element.scrollLeft = i * boxWidth - gutterSize;
        }
        else {
            // Sizes of cells in a line could different (especially the first one)
            element.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
        }
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomByScroll = function (element, event, delta) {
        var style = element.querySelector('.schedule-area').style;
        var currentWidth = parseInt(style.width, 10);
        if ((event.wheelDelta || event.detail) > 0) {
            style.width = (currentWidth + 2 * delta) + '%';
            this.broadcastZoomedInEvent();
        }
        else {
            var width = currentWidth - 2 * delta;
            style.width = (width > 100 ? width : 100) + '%';
            this.broadcastZoomedOutEvent();
        }
    };
    ZoomService.$name = 'zoomService';
    ZoomService.$inject = ['$rootScope'];
    return ZoomService;
}());
angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2xvY2FsZS9sb2NhbGUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBRS9FLE1BQU0sQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLFVBQVUscUJBQXFCO1FBQzlFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztZQUM5QixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFHLEVBQUU7WUFDdEIscUJBQXFCLEVBQUUsK0JBQStCO1NBQ3ZELENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0tBRUYsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSw4QkFBOEIsRUFBRSxNQUFNO0lBQ3pGLFVBQVUsTUFBTSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSTtRQUU3QyxNQUFNLENBQUMsS0FBSyxHQUFHO1lBQ2IsTUFBTSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNoQyxPQUFPLEVBQUUsRUFBQyxzQkFBc0IsQ0FBRTtZQUNsQyxLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFLEtBQUs7b0JBQ1osa0JBQWtCO29CQUNsQixTQUFTLEVBQUUsRUFDVjtpQkFDRjtnQkFDRDtvQkFDRSxLQUFLLEVBQUUsS0FBSztvQkFDWixrQkFBa0I7b0JBQ2xCLFNBQVMsRUFBRTt3QkFDVCxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtxQkFDMUI7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFO3dCQUNULEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO3dCQUN0QixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtxQkFDekI7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFO3dCQUNULEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO3FCQUN6QjtpQkFDRjtnQkFDRDtvQkFDRSxLQUFLLEVBQUUsTUFBTTtvQkFDYixRQUFRLEVBQUUsS0FBSztvQkFDZixTQUFTLEVBQUU7d0JBQ1QsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU7cUJBQzFCO2lCQUNGO2dCQUNEO29CQUNFLEtBQUssRUFBRSxLQUFLO29CQUNaLFNBQVMsRUFBRTt3QkFDVCxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtxQkFDekI7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFLEVBQ1Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhO1lBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsY0FBYyxHQUFHO1lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsT0FBTztnQkFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0FDNUVSLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7QUFFbEUsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FDRnJFLGdCQUFnQjtBQUNoQjtJQThDRSx5QkFDVSxTQUFtQztRQUQ3QyxpQkFHQztRQUZTLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBN0M3QyxhQUFRLEdBQUcsR0FBRyxDQUFDO1FBRWYsVUFBSyxHQUFHO1lBQ04sTUFBTSxFQUFFLEdBQUc7WUFDWCxVQUFVLEVBQUUsR0FBRztZQUNmLFdBQVcsRUFBRSxHQUFHO1NBQ2pCLENBQUM7UUFFRixTQUFJLEdBQUcsVUFBQyxLQUFLLEVBQUUsT0FBaUM7WUFDOUMsSUFBSSxTQUFTLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQztZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFVixPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLEtBQUs7Z0JBQzVCLCtDQUErQztnQkFDL0MsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUV2QixDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFFaEIsU0FBUyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3JDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVqQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUN6QyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3JCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxtQkFBbUIsS0FBSztnQkFDdEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBRTVCLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3BDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDaEM7WUFDSCxDQUFDO1lBRUQ7Z0JBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVyQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN4QyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7aUJBQ3BCO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUtELENBQUM7SUFFTSx1QkFBTyxHQUFkO1FBQ0UsSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTLElBQUssT0FBQSxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQztRQUU5RCxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbEMsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQXhETSxxQkFBSyxHQUFHLFFBQVEsQ0FBQztJQXlEMUIsc0JBQUM7Q0ExREQsQUEwREMsSUFBQTtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDOUIsU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUM5RC9ELGdCQUFnQjtBQUNoQjtJQUFBO1FBQUEsaUJBcUVDO1FBbEVHLGFBQVEsR0FBRyxHQUFHLENBQUM7UUFDZixZQUFPLEdBQUcsa0JBQWtCLENBQUM7UUFrRDdCLFNBQUksR0FBRyxVQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQXdDO1lBQ25FLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUQ7WUFFRCxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQUMsU0FBUztnQkFDL0MsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQTtJQU9MLENBQUM7SUEvRFcsOENBQWdCLEdBQXhCLFVBQXlCLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEtBQUs7UUFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEIsS0FBSyxDQUFDLEtBQUssdUNBQXdDO2dCQUNqRCxVQUFVLEVBQUUsU0FBUztnQkFDckIsR0FBRyxFQUFFLEdBQUc7YUFDVCxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxvQ0FBTSxHQUFkLFVBQWUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBOEI7UUFDaEUsSUFBSSxDQUFDLENBQUM7UUFDTixvQ0FBb0M7UUFDcEMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdkMsZ0JBQWdCO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVoQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0IsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLFdBQVcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFFbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFHLFdBQVcsSUFBSSxJQUFJLElBQUcsUUFBVSxDQUFDLENBQUM7YUFDakQ7aUJBQU07Z0JBQ0wsMENBQTBDO2dCQUMxQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUUxQixJQUFJLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUM5QyxJQUFJLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQztnQkFFbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN6QyxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pFLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1QjthQUNGO1lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFZTSwyQkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsY0FBTSxPQUFBLElBQUksbUJBQW1CLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQztRQUVoRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBbkVNLHlCQUFLLEdBQUcsWUFBWSxDQUFDO0lBb0VoQywwQkFBQztDQXJFRCxBQXFFQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUN6QixTQUFTLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUMxRXpFLE9BQU8sQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7QUFFN0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztLQUNsQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLHdCQUF3QjtRQUV2RyxJQUFJLGFBQWEsR0FBd0I7WUFDdkMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtZQUN4RCxJQUFJLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLEVBQUc7Z0JBQ1osT0FBTyxFQUFFLEVBQUc7Z0JBQ1osT0FBTyxFQUFFO29CQUNQLFFBQVEsRUFBRSxVQUFDLEtBQUs7d0JBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFOzRCQUNkLE9BQU8sR0FBRyxDQUFDO3lCQUNaOzZCQUFNOzRCQUNMLE9BQU8sR0FBRyxDQUFDO3lCQUNaO29CQUNILENBQUM7aUJBQ0Y7Z0JBQ0QsT0FBTyxFQUFFLEVBQUc7YUFDYjtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsTUFBTTtZQUUvQixJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFckMsSUFBSSxhQUFhLENBQUMscUJBQXFCLEVBQUU7b0JBQ3ZDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUNyRjthQUNGO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxVQUFVLEVBQUUsT0FBTyxFQUFFLGdCQUFnQjtnQkFFdkcsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7Z0JBRTNCO29CQUNFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDM0IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDekU7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDMUM7b0JBQ0QsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2dCQUVELDRDQUE0QztnQkFDNUMseUJBQXlCLEdBQUc7b0JBQzFCLElBQUksTUFBTSxHQUFRO3dCQUNoQixFQUFFLEVBQUUsR0FBRzt3QkFDUCxNQUFNLEVBQUU7NEJBQ04sSUFBSSxFQUFFO2dDQUNKLCtDQUErQztnQ0FDL0MsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO2dDQUN0RCxHQUFHLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7NkJBQzdCO3lCQUNGO3FCQUNGLENBQUM7b0JBRUYsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBRWhELElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO3FCQUNuQztvQkFFRCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQztnQkFFRCxVQUFVLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFO29CQUNyQyxVQUFVLENBQUMsVUFBVSxzREFBdUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDekUsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTztvQkFDTCxPQUFPLEVBQUUsT0FBTztvQkFDaEIsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLEdBQUcsRUFBRSxVQUFVLEdBQUc7d0JBQ2hCLE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNuQyxDQUFDO2lCQUNGLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDLENBQUM7QUNuRk4sZ0JBQWdCO0FBQ2hCO0lBU0UsK0JBQ1UsUUFBa0MsRUFDbEMsTUFBc0I7UUFEdEIsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7UUFDbEMsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFVekIsU0FBSSxHQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVU7UUFSbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFTRCx1Q0FBTyxHQUFQO1FBQUEsaUJBWUM7UUFYQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsMEJBQWdDO1lBQzdDLEtBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyw2QkFBa0M7WUFDL0MsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLCtCQUFtQztZQUNoRCxLQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQseUNBQVMsR0FBVDtRQUFBLGlCQWVDO1FBZEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQztZQUM5QixJQUFJLE1BQU0sR0FBRyxLQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUVwRSxJQUFJLEdBQUcsR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhDLEtBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO2dCQUNyQixJQUFJLEVBQUUsS0FBSSxDQUFDLCtCQUErQixDQUFDLEdBQUcsQ0FBQzthQUNoRCxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSx1Q0FBTyxHQUFkLFVBQWUsS0FBYSxFQUFFLEdBQVc7UUFDdkMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2IsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNYO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQzVCO1FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUVyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2xCLEtBQUssRUFBRSxLQUFLO1lBQ1osR0FBRyxFQUFFLEdBQUc7U0FDVCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0saURBQWlCLEdBQXhCLFVBQXlCLElBQThCO1FBQ3JELE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO0lBQzlDLENBQUM7SUFFTywyQ0FBVyxHQUFuQixVQUFvQixRQUF1QztRQUN6RCxPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLDRDQUFZLEdBQXBCLFVBQXFCLFFBQXVDO1FBQzFELGlIQUFpSDtRQUNqSCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekYsSUFBSSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztRQUNqRixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3pELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFFcEUsT0FBTyxjQUFjLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQUVPLHFEQUFxQixHQUE3QixVQUE4QixHQUFXO1FBQ3ZDLDBDQUEwQztRQUMxQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWCxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ1Q7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVMsR0FBRyxPQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRU8sK0RBQStCLEdBQXZDLFVBQXdDLEdBQVc7UUFDakQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzRCxDQUFDO0lBRU8sbURBQW1CLEdBQTNCLFVBQTRCLEtBQUs7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLENBQUM7WUFFdEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QyxJQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUU1QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFTyxxREFBcUIsR0FBN0I7UUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8sc0RBQXNCLEdBQTlCO1FBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLHNDQUFNLEdBQWQ7UUFDRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUU1Qjs7O1dBR0c7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxvREFBb0IsR0FBNUI7UUFDRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztZQUNyQixLQUFLLEVBQUssS0FBSyxPQUFJO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSwwQ0FBVSxHQUFqQixVQUFrQixHQUFXO1FBQzNCLElBQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTSwwQ0FBVSxHQUFqQixVQUFrQixLQUFhO1FBQzdCLElBQUksT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUMvQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUN4RixDQUFDO0lBeEpNLDJCQUFLLEdBQUcsdUJBQXVCLENBQUM7SUFDaEMsbUNBQWEsR0FBRyxpQkFBaUIsQ0FBQztJQUVsQyw2QkFBTyxHQUFHO1FBQ2YsVUFBVTtRQUNWLFFBQVE7S0FDVCxDQUFDO0lBbUpKLDRCQUFDO0NBMUpELEFBMEpDLElBQUE7QUFFRCxnQkFBZ0I7QUFDaEI7SUFBQTtRQUdFLGFBQVEsR0FBRztZQUNULE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFLEdBQUc7WUFDVCxLQUFLLEVBQUUsR0FBRztZQUNWLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQTtRQUVELGVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7UUFDekMsaUJBQVksR0FBRyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7UUFFbkQsZ0JBQVcsR0FBRyxrREFBa0QsQ0FBQztJQUNuRSxDQUFDO0lBYlEsMEJBQUssR0FBRyxhQUFhLENBQUM7SUFhL0IsMkJBQUM7Q0FkRCxBQWNDLElBQUE7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQzlCLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUM7S0FDOUQsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLG9CQUFvQixFQUFFLENBQUMsQ0FBQztBQ2hMckU7SUFVSSx1QkFDWSxVQUFxQyxFQUNyQyxPQUErQjtRQUQvQixlQUFVLEdBQVYsVUFBVSxDQUEyQjtRQUNyQyxZQUFPLEdBQVAsT0FBTyxDQUF3QjtRQUpuQyxnQkFBVyxHQUFZLEtBQUssQ0FBQztJQU1yQyxDQUFDO0lBRU0sa0NBQVUsR0FBakI7UUFBQSxpQkFVQztRQVRHLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtZQUNwQyxLQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUseUJBQStCLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDO0lBekJNLG1CQUFLLEdBQUcsZUFBZSxDQUFDO0lBRXhCLHFCQUFPLEdBQUc7UUFDYixZQUFZO1FBQ1osU0FBUztLQUNaLENBQUM7SUFxQk4sb0JBQUM7Q0EzQkQsQUEyQkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDekIsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDO0tBQzNDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsVUFBQyxhQUE0QixJQUFLLE9BQUEsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUExQixDQUEwQixDQUFDLENBQUMsQ0FBQztBQ2hDOUY7SUFVSSx5Q0FDWSxRQUFrQyxFQUNsQyxNQUFzQixFQUN0QixhQUE0QixFQUM1QixXQUF3QjtRQUh4QixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUVwQyxDQUFDO0lBRUQsbURBQVMsR0FBVDtRQUFBLGlCQVFDO1FBUEcsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHVDQUF3QyxVQUFDLENBQUMsRUFBRSxJQUFJO1lBQzNELEtBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBekJNLHFDQUFLLEdBQUcsaUNBQWlDLENBQUM7SUFFMUMsdUNBQU8sR0FBRztRQUNiLFVBQVU7UUFDVixRQUFRO1FBQ1IsZUFBZTtRQUNmLGFBQWE7S0FDaEIsQ0FBQztJQW1CTixzQ0FBQztDQTNCRCxBQTJCQyxJQUFBO0FBRUQ7SUFBQTtRQUdJLGVBQVUsR0FBRywrQkFBK0IsQ0FBQyxLQUFLLENBQUM7UUFDbkQsZUFBVSxHQUFHLElBQUksQ0FBQztRQUVsQixhQUFRLEdBQUcsaUNBQWlDLENBQUM7SUFDakQsQ0FBQztJQU5VLG9DQUFLLEdBQUcsdUJBQXVCLENBQUM7SUFNM0MscUNBQUM7Q0FQRCxBQU9DLElBQUE7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQzVCLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLEVBQUUsK0JBQStCLENBQUM7S0FDbEYsU0FBUyxDQUFDLDhCQUE4QixDQUFDLEtBQUssRUFBRSxJQUFJLDhCQUE4QixFQUFFLENBQUMsQ0FBQztBQ3hDM0Y7SUFPSSx1QkFDWSxXQUF3QjtRQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUVwQyxDQUFDO0lBRU0sb0NBQVksR0FBbkIsVUFBb0IsT0FBTyxFQUFFLEtBQUs7UUFBbEMsaUJBaUJDO1FBaEJHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBQyxLQUFpQjtZQUNyRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhCLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDZixLQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNILElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO2lCQUMvQjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztpQkFDL0I7YUFDSjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQTVCTSxtQkFBSyxHQUFHLGVBQWUsQ0FBQztJQUV4QixxQkFBTyxHQUFHO1FBQ2IsYUFBYTtLQUNoQixDQUFDO0lBeUJOLG9CQUFDO0NBOUJELEFBOEJDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FDbENqRCxnQkFBZ0I7QUFDaEI7SUFBQTtJQWNBLENBQUM7SUFYaUIsdUJBQU8sR0FBckI7UUFDSSxJQUFNLGNBQWMsR0FBVyxPQUFPLENBQUM7UUFDdkMsSUFBTSxjQUFjLEdBQVcsT0FBTyxDQUFDO1FBRXZDLE9BQU8sVUFBUyxPQUFlO1lBQzNCLDRLQUE0SztZQUM1SyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFL0YsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUE7SUFDTCxDQUFDO0lBWk0scUJBQUssR0FBRyxXQUFXLENBQUM7SUFhL0Isc0JBQUM7Q0FkRCxBQWNDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUNuQjlELGdCQUFnQjtBQUNoQjtJQVNFLG1DQUNVLE1BQXNCLEVBQ3RCLGFBQWtCLENBQUUsZUFBZTtRQURuQyxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBSztRQVNyQixtQkFBYyxHQUE0QjtZQUMvQyxZQUFZLEVBQUUsS0FBSztTQUNwQixDQUFDO0lBVEYsQ0FBQztJQWFELDJDQUFPLEdBQVA7UUFBQSxpQkFvQkM7UUFuQkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUUxRCx1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztRQUVoQzs7V0FFRztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQVYsQ0FBVSxFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1FBRTNGOztXQUVHO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHNEQUF1QyxVQUFDLENBQUMsRUFBRSxNQUFNO1lBQzlELElBQUksS0FBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7YUFDN0I7WUFDRCxLQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ssNkNBQVMsR0FBakIsVUFBa0IsT0FBZ0M7UUFDaEQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxVQUFVO1FBQ2pELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFlBQVksR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ25DLElBQUksYUFBYSxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUM7UUFFNUMsSUFBSSxNQUFNLEdBQTJCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBRTlLLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxpREFBYSxHQUFyQixVQUFzQixLQUFxQztRQUEzRCxpQkFrQ0M7UUFqQ0MsMEJBQTBCO1FBQzFCLElBQUksS0FBSyxFQUFFO1lBRVQsOEJBQThCO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixNQUFNLGtFQUFrRSxDQUFDO2FBQzFFO1lBRUQsK0NBQStDO1lBQy9DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRW5CLDBFQUEwRTtZQUMxRSxnREFBZ0Q7WUFDaEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7Z0JBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBRS9CLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7b0JBQ2pDLElBQUksS0FBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDakM7aUJBQ0Y7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7aUJBQ3JCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUzQyw0Q0FBNEM7WUFDNUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7Z0JBQzFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUEvRk0sdUNBQWEsR0FBRyxlQUFlLENBQUM7SUFDaEMsK0JBQUssR0FBRywyQkFBMkIsQ0FBQztJQUVwQyxpQ0FBTyxHQUFHO1FBQ2YsUUFBUTtRQUNSLDhCQUE4QjtLQUMvQixDQUFDO0lBMEZKLGdDQUFDO0NBakdELEFBaUdDLElBQUE7QUFFRCxnQkFBZ0I7QUFDaEI7SUFBQTtRQUdFLGFBQVEsR0FBRztZQUNULEtBQUssRUFBRSxHQUFHO1lBQ1YsT0FBTyxFQUFFLEdBQUc7WUFDWixRQUFRLEVBQUUsR0FBRztTQUNkLENBQUM7UUFFRixlQUFVLEdBQUcseUJBQXlCLENBQUMsS0FBSyxDQUFDO1FBQzdDLGlCQUFZLEdBQUcseUJBQXlCLENBQUMsYUFBYSxDQUFDO1FBRXZELGVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEIsZ0JBQVcsR0FBRyw0REFBNEQsQ0FBQztJQUM3RSxDQUFDO0lBYlEsOEJBQUssR0FBRyxpQkFBaUIsQ0FBQztJQWFuQywrQkFBQztDQWRELEFBY0MsSUFBQTtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDOUIsVUFBVSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQztLQUN0RSxTQUFTLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLElBQUksd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO0FDdkg3RTtJQXlCRSw4QkFDVSxRQUFrQyxFQUNsQyxNQUFzQjtRQUR0QixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVR4QiwyQkFBc0IsR0FBWSxJQUFJLENBQUM7UUFXN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFRCxzQ0FBTyxHQUFQO1FBQUEsaUJBWUM7UUFYQyxJQUFJLENBQUMsaUJBQWlCLEdBQUc7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztZQUMxQixHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1NBQ3ZCLENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHNEQUF1QztZQUNwRCxpRkFBaUY7WUFDakYsS0FBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSx3Q0FBUyxHQUFoQjtRQUNFLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEUsQ0FBQztJQUVNLHlDQUFVLEdBQWpCO1FBQ0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLG1DQUFJLEdBQVgsVUFBWSxLQUFhO1FBQ3ZCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFFekUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBRTdDLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDNUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDZCxLQUFLLEVBQUUsUUFBUTtnQkFDZixHQUFHLEVBQUUsTUFBTTthQUNaLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVNLHNDQUFPLEdBQWQ7UUFBQSxpQkFXQztRQVZDLHVDQUF1QztRQUN2Qyw2Q0FBNkM7UUFDN0MsVUFBVSxDQUFDO1lBQ1QsS0FBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSw0Q0FBYSxHQUFwQjtRQUFBLGlCQXVDQztRQXRDQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRXBDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFO1lBQ25CLElBQUksRUFBRSxLQUFLLFFBQVEsRUFBRTtnQkFDbkIsK0JBQStCO2dCQUMvQixJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3hELEtBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXhCLEtBQUksQ0FBQyxVQUFVLENBQUM7d0JBQ2QsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO3dCQUNmLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRztxQkFDWixDQUFDLENBQUM7aUJBQ0o7Z0JBQ0QsdUNBQXVDO3FCQUNsQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7b0JBQzdELEtBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pCO2dCQUNELDZDQUE2QztxQkFDeEMsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFO29CQUMzRCxLQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUV4QixLQUFJLENBQUMsVUFBVSxDQUFDO3dCQUNkLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSzt3QkFDZixHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUc7cUJBQ2xCLENBQUMsQ0FBQztpQkFDSjtnQkFDRCwrQ0FBK0M7cUJBQzFDLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRTtvQkFDL0QsS0FBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFeEIsS0FBSSxDQUFDLFVBQVUsQ0FBQzt3QkFDZCxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7d0JBQ3JCLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRztxQkFDWixDQUFDLENBQUM7aUJBQ0o7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLHlDQUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDN0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3hGLENBQUM7SUFFTSw2Q0FBYyxHQUFyQixVQUFzQixRQUF1QztRQUMzRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUVwQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVNLHFDQUFNLEdBQWIsVUFBYyxLQUFhO1FBQ3pCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUMvQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFFaEUsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxRQUFRLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDcEUsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFDZCxLQUFLLEVBQUUsUUFBUTtvQkFDZixHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUc7aUJBQ1osQ0FBQyxDQUFDO2FBQ0o7U0FDRjthQUFNO1lBQ0wsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBRTVELElBQUksRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLElBQUksTUFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDakYsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFDZCxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUs7b0JBQ2YsR0FBRyxFQUFFLE1BQU07aUJBQ1osQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7SUFFTSx3Q0FBUyxHQUFoQjtRQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsaUJBQWlCLEdBQUc7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztZQUMxQixHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1NBQ3ZCLENBQUM7SUFDSixDQUFDO0lBRU0sK0NBQWdCLEdBQXZCO1FBQ0UsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVNLDZDQUFjLEdBQXJCO1FBQ0UsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVNLHlDQUFVLEdBQWpCLFVBQWtCLE1BQXFDO1FBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUUvQixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7WUFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQWxNTSwwQkFBSyxHQUFHLHNCQUFzQixDQUFDO0lBQy9CLGtDQUFhLEdBQUcsZ0JBQWdCLENBQUM7SUFFakMsNEJBQU8sR0FBRztRQUNmLFVBQVU7UUFDVixRQUFRO0tBQ1QsQ0FBQztJQTZMSiwyQkFBQztDQXBNRCxBQW9NQyxJQUFBO0FBRUQsZ0JBQWdCO0FBQ2hCO0lBQUE7UUFHRSxhQUFRLEdBQUc7WUFDVCxNQUFNLEVBQUUsR0FBRztZQUNYLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFNBQVMsRUFBRSxHQUFHO1lBQ2QsYUFBYSxFQUFFLEdBQUc7WUFDbEIsSUFBSSxFQUFFLEdBQUc7U0FDVixDQUFDO1FBRUYsZUFBVSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQztRQUN4QyxpQkFBWSxHQUFHLG9CQUFvQixDQUFDLGFBQWEsQ0FBQztRQUVsRCxZQUFPLEdBQUc7WUFDUixhQUFhLEVBQUUsa0JBQWtCO1lBQ2pDLFdBQVcsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7UUFFRixnQkFBVyxHQUFHLGtEQUFrRCxDQUFDO0lBQ25FLENBQUM7SUFuQlEseUJBQUssR0FBRyxZQUFZLENBQUM7SUFtQjlCLDBCQUFDO0NBcEJELEFBb0JDLElBQUE7QUFFRCxPQUFPO0tBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7S0FDNUQsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQztBQ2hPbkU7SUFLSSxxQkFDWSxVQUFxQztRQUFyQyxlQUFVLEdBQVYsVUFBVSxDQUEyQjtRQUl6QyxhQUFRLEdBQVcsZ0JBQWdCLENBQUM7SUFGNUMsQ0FBQztJQUlPLDRDQUFzQixHQUE5QjtRQUNJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSw0QkFBaUMsQ0FBQztJQUNoRSxDQUFDO0lBRU8sNkNBQXVCLEdBQS9CO1FBQ0ksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLDhCQUFrQyxDQUFDO0lBQ2pFLENBQUM7SUFFTSwrQkFBUyxHQUFoQixVQUFpQixPQUFZO1FBQ3pCLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQzFELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxpQ0FBVyxHQUFsQixVQUFtQixPQUFZLEVBQUUsS0FBNEIsRUFBRSxJQUFTO1FBQ3BFLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVqQixtRkFBbUY7UUFDbkYsMERBQTBEO1FBQzFELDJCQUEyQjtRQUMzQixjQUFjO1FBQ2QsSUFBSSx5QkFBeUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUM7UUFFL0QsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUV6Qyx3QkFBd0I7UUFDeEIsdUJBQXVCO1FBQ3ZCLElBQUksUUFBUSxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLElBQUksbUJBQW1CLEdBQUcsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUNsRCxJQUFJLHdCQUF3QixHQUFHLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBRTVFLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsd0JBQXdCLEdBQUcsR0FBRyxDQUFDO1FBRWxGLElBQUkseUJBQXlCLEtBQUssU0FBUyxFQUFFO1lBQzNDLHlDQUF5QztZQUN6QyxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO1NBQ2hEO2FBQU07WUFDTCxzRUFBc0U7WUFDdEUsT0FBTyxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsR0FBRyxDQUFDLHlCQUF5QixHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztTQUMzRjtRQUVELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxrQ0FBWSxHQUFuQixVQUFvQixPQUFZLEVBQUUsS0FBaUIsRUFBRSxLQUFhO1FBQzlELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUQsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7WUFFL0MsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7U0FDakM7YUFBTTtZQUNILElBQUksS0FBSyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUVoRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUF2RU0saUJBQUssR0FBRyxhQUFhLENBQUM7SUFFdEIsbUJBQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBc0VwQyxrQkFBQztDQXpFRCxBQXlFQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUN6QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSB2YXIgbW9tZW50O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ25nQW5pbWF0ZScsICd3ZWVrbHlTY2hlZHVsZXInLCAnd2Vla2x5U2NoZWR1bGVySTE4TiddKVxyXG5cclxuICAuY29uZmlnKFsnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZVByb3ZpZGVyJywgZnVuY3Rpb24gKGxvY2FsZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgbG9jYWxlU2VydmljZVByb3ZpZGVyLmNvbmZpZ3VyZSh7XHJcbiAgICAgIGRveXM6IHsgJ2VzLWVzJzogNCB9LFxyXG4gICAgICBsYW5nOiB7ICdlcy1lcyc6IHsgfSB9LFxyXG4gICAgICBsb2NhbGVMb2NhdGlvblBhdHRlcm46ICcvYW5ndWxhci1sb2NhbGVfe3tsb2NhbGV9fS5qcydcclxuICAgIH0pO1xyXG4gIH1dKVxyXG5cclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckdGltZW91dCcsICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsIGxvY2FsZVNlcnZpY2UsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBsb2NhbGU6IGxvY2FsZVNlcnZpY2UuJGxvY2FsZS5pZCxcclxuICAgICAgICBvcHRpb25zOiB7Lyptb25vU2NoZWR1bGU6IHRydWUqLyB9LFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnU3VuJyxcclxuICAgICAgICAgICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ01vbicsXHJcbiAgICAgICAgICAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnVHVlJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMCwgZW5kOiAyNDAgfSxcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMzYwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdXZWQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAxMjAsIGVuZDogNzIwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdUaHVyJyxcclxuICAgICAgICAgICAgZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnRnJpJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogNzIwLCBlbmQ6IDc4MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnU2F0JyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmRvU29tZXRoaW5nID0gZnVuY3Rpb24gKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMub25Mb2NhbGVDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBpcyBjaGFuZ2luZyB0bycsICRzY29wZS5tb2RlbC5sb2NhbGUpO1xyXG4gICAgICAgIGxvY2FsZVNlcnZpY2Uuc2V0KCRzY29wZS5tb2RlbC5sb2NhbGUpLnRoZW4oZnVuY3Rpb24gKCRsb2NhbGUpIHtcclxuICAgICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgY2hhbmdlZCB0bycsICRsb2NhbGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuXHJcbnZhciBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICcmJyxcclxuICAgIG9uZHJhZ3N0b3A6ICcmJyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnJidcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgdmFyIGRlbHRhID0gZXZlbnQucGFnZVggLSB4O1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWcpKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2V1cCgpIHtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdG9wKSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKSB7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSBHUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBuby10ZXh0IG9uZXMgd2lsbCBnZXQgc3RyaXBlZCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgY2hpbGQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBudW1JbnRlcnZhbHNJblRpY2sgPSA2MCAvIGNvbmZpZy5pbnRlcnZhbDtcclxuICAgICAgICAgICAgbGV0IGludGVydmFsUGVyY2VudGFnZSA9IDEwMCAvIG51bUludGVydmFsc0luVGljaztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtSW50ZXJ2YWxzSW5UaWNrOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBncmFuZENoaWxkID0gR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMucHVzaCgobmV3Q29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmV3Q29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicsIFsndG1oLmR5bmFtaWNMb2NhbGUnXSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicpXHJcbiAgLnByb3ZpZGVyKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgWyd0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXInLCBmdW5jdGlvbiAodG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyKSB7XHJcblxyXG4gICAgdmFyIGRlZmF1bHRDb25maWc6IGFueSAvKiBUT0RPIHR5cGUgKi8gPSB7XHJcbiAgICAgIGRveXM6IHsgJ2RlLWRlJzogNCwgJ2VuLWdiJzogNCwgJ2VuLXVzJzogNiwgJ2ZyLWZyJzogNCB9LFxyXG4gICAgICBsYW5nOiB7XHJcbiAgICAgICAgJ2RlLWRlJzogeyB9LFxyXG4gICAgICAgICdlbi1nYic6IHsgfSxcclxuICAgICAgICAnZW4tdXMnOiB7XHJcbiAgICAgICAgICBtZXJpZGllbTogKGhvdXJzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChob3VycyA+IDExKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdQJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ0EnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZnItZnInOiB7IH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuXHJcbiAgICAgIGlmIChjb25maWcgJiYgYW5ndWxhci5pc09iamVjdChjb25maWcpKSB7XHJcbiAgICAgICAgYW5ndWxhci5tZXJnZShkZWZhdWx0Q29uZmlnLCBjb25maWcpO1xyXG5cclxuICAgICAgICBpZiAoZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pIHtcclxuICAgICAgICAgIHRtaER5bmFtaWNMb2NhbGVQcm92aWRlci5sb2NhbGVMb2NhdGlvblBhdHRlcm4oZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRyb290U2NvcGUnLCAnJGxvY2FsZScsICd0bWhEeW5hbWljTG9jYWxlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhbGUsIHRtaER5bmFtaWNMb2NhbGUpIHtcclxuXHJcbiAgICAgIHZhciBtb21lbnRMb2NhbGVDYWNoZSA9IHt9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0TGFuZygpIHtcclxuICAgICAgICB2YXIga2V5ID0gJGxvY2FsZS5pZDtcclxuICAgICAgICBpZiAoIW1vbWVudExvY2FsZUNhY2hlW2tleV0pIHtcclxuICAgICAgICAgIG1vbWVudExvY2FsZUNhY2hlW2tleV0gPSBnZXRNb21lbnRMb2NhbGUoa2V5KTtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCwgbW9tZW50TG9jYWxlQ2FjaGVba2V5XS5sb2NhbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb21lbnQubG9jYWxlKG1vbWVudExvY2FsZUNhY2hlW2tleV0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmYXVsdENvbmZpZy5sYW5nW2tleV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIGp1c3QgbmVlZCBmZXcgbW9tZW50IGxvY2FsIGluZm9ybWF0aW9uXHJcbiAgICAgIGZ1bmN0aW9uIGdldE1vbWVudExvY2FsZShrZXkpIHtcclxuICAgICAgICBsZXQgbG9jYWxlOiBhbnkgPSB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgbWVyaWRpZW0gPSBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XS5tZXJpZGllbTtcclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihtZXJpZGllbSkpIHtcclxuICAgICAgICAgIGxvY2FsZS5sb2NhbGUubWVyaWRpZW0gPSBtZXJpZGllbTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsb2NhbGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRyb290U2NvcGUuJG9uKCckbG9jYWxlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkxPQ0FMRV9DSEFOR0VELCBnZXRMYW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgJGxvY2FsZTogJGxvY2FsZSxcclxuICAgICAgICBnZXRMYW5nOiBnZXRMYW5nLFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRtaER5bmFtaWNMb2NhbGUuc2V0KGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfV07XHJcbiAgfV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdtdWx0aVNsaWRlckNvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ211bHRpU2xpZGVyQ3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGVcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuXHJcbiAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPjtcclxuICBwdWJsaWMgc2l6ZTogbnVtYmVyID0gNjA7IC8vIG1pbnV0ZXNcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4sICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICB0aGlzLnNldEhvdmVyRWxlbWVudFdpZHRoKCk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBsZWZ0ID0gZS5wYWdlWCAtIGVsT2ZmWCAtIHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCAvIDI7XHJcblxyXG4gICAgICB2YXIgdmFsID0gdGhpcy5waXhlbFRvVmFsKGxlZnQpO1xyXG5cclxuICAgICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgbGVmdDogdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWxPZmZzZXRMZWZ0KHZhbCkgXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkU2xvdChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICBzdGFydCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuZCA+IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpdGVtID0gdGhpcy5pdGVtO1xyXG5cclxuICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpdGVtLnNjaGVkdWxlcy5wdXNoKHtcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RWxlbWVudE9mZnNldFgoZWxlbTogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICByZXR1cm4gZWxlbVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90TGVmdChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4pIHtcclxuICAgIHJldHVybiB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbE9mZnNldExlZnQoc2NoZWR1bGUuc3RhcnQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKHNjaGVkdWxlLmVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQgKyAncHgnO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5wYXJlbnQoKVswXS5xdWVyeVNlbGVjdG9yKGBbcmVsPScke3ZhbH0nXWApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWxPZmZzZXRMZWZ0KHZhbDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWwpLm9mZnNldExlZnQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuYXR0cignbm8tYWRkJykpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHRoaXMuc2l6ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNpemUoKSB7XHJcbiAgICB0aGlzLnNldEhvdmVyRWxlbWVudFdpZHRoKCk7XHJcblxyXG4gICAgLyogU2luY2Ugd2UgaGF2ZSBjaGFuZ2VkIHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudCB2aWEgcGxhaW4ganMgK1xyXG4gICAgICogdGhlIG5nLXN0eWxlcyBmb3IgdGhlIGluZGl2aWR1YWwgc2xvdHMgYXJlIGNvbXB1dGVkIGluIHRoaXMgY29udHJvbGxlcixcclxuICAgICAqIHdlIG11c3QgY2FsbCAkYXBwbHkoKSBtYW51YWxseSBzbyB0aGV5IHdpbGwgYWxsIHVwZGF0ZSB0aGVpciBwb3NpdGlvbnMgdG8gbWF0Y2ggdGhlIHpvb20gbGV2ZWxcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldEhvdmVyRWxlbWVudFdpZHRoKCkge1xyXG4gICAgbGV0IHdpZHRoID0gdGhpcy52YWxUb1BpeGVsKHRoaXMuc2l6ZSk7XHJcblxyXG4gICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgIHdpZHRoOiBgJHt3aWR0aH1weGBcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHZhbFRvUGl4ZWwodmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwZXJjZW50ID0gdmFsIC8gdGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCAvIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCArIDAuNSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXInO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBpdGVtOiAnPScsXHJcbiAgICBpbmRleDogJzwnLFxyXG4gICAgc2l6ZTogJzw/J1xyXG4gIH1cclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCJjbGFzcyBSZXNpemVTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdyZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJHJvb3RTY29wZScsXHJcbiAgICAgICAgJyR3aW5kb3cnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShSZXNpemVTZXJ2aWNlLiRuYW1lLCBSZXNpemVTZXJ2aWNlKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZS4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IFJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsImNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdzY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgU2Nyb2xsU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ3pvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd0aW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBjb25zdCBzdGFuZGFyZEZvcm1hdDogc3RyaW5nID0gJ2g6bW1BJztcclxuICAgICAgICBjb25zdCBtaWxpdGFyeUZvcm1hdDogc3RyaW5nID0gJ0hIOm1tJztcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBtb21lbnQtZHVyYXRpb24tZm9ybWF0IHBhY2thZ2UgYWx3YXlzIG91dHB1dHMgbWlsaXRhcnkgdGltZSwgKGl0IGNvbnZlcnRzIGEgZHVyYXRpb24gdG8gYSB0aW1lIHN0cmluZywgbm90IGEgdGltZSBvZiBkYXkpIHNvIHdlJ2xsIG5lZWQgdG8gZ3JhYiB0aGF0IGFuZCB0aGVuIGNvbnZlcnRcclxuICAgICAgICAgICAgbGV0IG1pbGl0YXJ5VGltZSA9IG1vbWVudC5kdXJhdGlvbihtaW51dGVzLCAnbWludXRlcycpLmZvcm1hdChtaWxpdGFyeUZvcm1hdCwgeyB0cmltOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQobWlsaXRhcnlUaW1lLCBtaWxpdGFyeUZvcm1hdCkuZm9ybWF0KHN0YW5kYXJkRm9ybWF0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBsb2NhbGVTZXJ2aWNlOiBhbnkgIC8qIFRPRE8gdHlwZSAqL1xyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM7XHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPiB9KSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zID0ge1xyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJG1vZGVsQ2hhbmdlTGlzdGVuZXJzOiAoKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykgPT4gdm9pZClbXTtcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuZGVmYXVsdE9wdGlvbnMubGFiZWxzID0gdGhpcy5sb2NhbGVTZXJ2aWNlLmdldExhbmcoKTtcclxuXHJcbiAgICAvLyBXaWxsIGhhbmcgb3VyIG1vZGVsIGNoYW5nZSBsaXN0ZW5lcnNcclxuICAgIHRoaXMuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgbW9kZWwgaXRlbXNcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiB0aGlzLml0ZW1zLCAobmV3SXRlbXMpID0+IHRoaXMub25Nb2RlbENoYW5nZShuZXdJdGVtcykpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTGlzdGVuIHRvICRsb2NhbGUgY2hhbmdlIChicm91Z2h0IGJ5IGV4dGVybmFsIG1vZHVsZSB3ZWVrbHlTY2hlZHVsZXJJMThOKVxyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkxPQ0FMRV9DSEFOR0VELCAoZSwgbGFiZWxzKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmNvbmZpZykge1xyXG4gICAgICAgIHRoaXMuY29uZmlnLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UoYW5ndWxhci5jb3B5KHRoaXMuaXRlbXMsIFtdKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zKTogSVdlZWtseVNjaGVkdWxlckNvbmZpZyB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHJlc3VsdDogSVdlZWtseVNjaGVkdWxlckNvbmZpZyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHsgaW50ZXJ2YWw6IGludGVydmFsLCBtYXhWYWx1ZTogbWludXRlc0luRGF5LCBob3VyQ291bnQ6IGhvdXJzSW5EYXksIGludGVydmFsQ291bnQ6IGludGVydmFsQ291bnQgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb2RlbENoYW5nZShpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPltdKSB7XHJcbiAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgaWYgKGl0ZW1zKSB7XHJcblxyXG4gICAgICAvLyBDaGVjayBpdGVtcyBhcmUgaW4gYW4gQXJyYXlcclxuICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgdGhyb3cgJ1lvdSBzaG91bGQgdXNlIHdlZWtseS1zY2hlZHVsZXIgZGlyZWN0aXZlIHdpdGggYW4gQXJyYXkgb2YgaXRlbXMnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XHJcblxyXG4gICAgICAvLyBJZiBpbiBtdWx0aVNsaWRlciBtb2RlLCBlbnN1cmUgYSBzY2hlZHVsZSBhcnJheSBpcyBwcmVzZW50IG9uIGVhY2ggaXRlbVxyXG4gICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgIHZhciBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcyAmJiBzY2hlZHVsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtzY2hlZHVsZXNbMF1dO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgY29uZmlndXJhdGlvblxyXG4gICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBGaW5hbGx5LCBydW4gdGhlIHN1YiBkaXJlY3RpdmVzIGxpc3RlbmVyc1xyXG4gICAgICB0aGlzLiRtb2RlbENoYW5nZUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgIGxpc3RlbmVyKHRoaXMuY29uZmlnKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGl0ZW1zOiAnPScsXHJcbiAgICBvcHRpb25zOiAnPScsXHJcbiAgICBvbkNoYW5nZTogJyYnXHJcbiAgfTtcclxuICBcclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCJjbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSAkY29udGFpbmVyRWw6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+O1xyXG4gIHByaXZhdGUgaXRlbUluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgcmVzaXplRGlyZWN0aW9uSXNTdGFydDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGVJbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGVcclxuICApIHtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLnNjaGVkdWxlLmVuZFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkxPQ0FMRV9DSEFOR0VELCAoKSA9PiB7XHJcbiAgICAgIC8vIFNpbXBsZSBjaGFuZ2Ugb2JqZWN0IHJlZmVyZW5jZSBzbyB0aGF0IG5nTW9kZWwgdHJpZ2dlcnMgZm9ybWF0dGluZyAmIHJlbmRlcmluZ1xyXG4gICAgICB0aGlzLnNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuUmVtb3ZlKCkge1xyXG4gICAgcmV0dXJuICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG4gICAgbGV0IGR1cmF0aW9uID0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgLSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQXR0cignbm8tYWRkJyk7XHJcbiAgICB9LCA1MDApO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2VPdmVybGFwcygpIHtcclxuICAgIGxldCBzY2hlZHVsZSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICBpZiAoZWwuZW5kID49IHNjaGVkdWxlLmVuZCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5zdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGVsLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1vZGVsIGNvbXBsZXRlbHkgY292ZXJzIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGVsc2UgaWYgKHNjaGVkdWxlLmVuZCA+PSBlbC5lbmQgJiYgc2NoZWR1bGUuc3RhcnQgPD0gZWwuc3RhcnQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBlbmQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuZW5kIDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IHNjaGVkdWxlLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIHN0YXJ0IGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgZWxzZSBpZiAoZWwuc3RhcnQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuJGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLCAxKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0IDw9IHVpLmVuZCAtIDEgJiYgbmV3U3RhcnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5lbmQgIT09IG5ld0VuZCAmJiBuZXdFbmQgPj0gdWkuc3RhcnQgKyAxICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgdGhpcy4kY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5hdHRyKCduby1hZGQnLCAndHJ1ZScpO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuc2NoZWR1bGUuZW5kXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICB0aGlzLnNjaGVkdWxlLmVuZCA9IHVwZGF0ZS5lbmQ7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHRoaXMuc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkNoYW5nZSh7XHJcbiAgICAgIGl0ZW1JbmRleDogdGhpcy5pdGVtSW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlSW5kZXg6IHRoaXMuc2NoZWR1bGVJbmRleCxcclxuICAgICAgc2NoZWR1bGVWYWx1ZTogdGhpcy5zY2hlZHVsZVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdCc7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIHNjaGVkdWxlOiAnPW5nTW9kZWwnLFxyXG4gICAgaXRlbUluZGV4OiAnPCcsXHJcbiAgICBzY2hlZHVsZUluZGV4OiAnPCcsXHJcbiAgICBpdGVtOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIHNjaGVkdWxlckN0cmw6ICded2Vla2x5U2NoZWR1bGVyJyxcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgWm9vbVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3pvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gICAgICAgIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAgICAgICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAgICAgICAvLyAgICAgICB8ICAgIFxyXG4gICAgICAgIGxldCBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID0gZGF0YS5wZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nO1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAgICAgICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBlbGVtZW50Q291bnQgKiBib3hXaWR0aDtcclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9IHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJztcclxuXHJcbiAgICAgICAgaWYgKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFNpemVzIG9mIGNlbGxzIGluIGEgbGluZSBjb3VsZCBkaWZmZXJlbnQgKGVzcGVjaWFsbHkgdGhlIGZpcnN0IG9uZSlcclxuICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21CeVNjcm9sbChlbGVtZW50OiBhbnksIGV2ZW50OiBXaGVlbEV2ZW50LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGUtYXJlYScpLnN0eWxlO1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSBwYXJzZUludChzdHlsZS53aWR0aCwgMTApO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">{{multiSliderCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 right: multiSliderCtrl.getSlotRight(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);
angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">{{\'+\'}}</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 right: multiSliderCtrl.getSlotRight(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);
angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">+</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 right: multiSliderCtrl.getSlotRight(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);