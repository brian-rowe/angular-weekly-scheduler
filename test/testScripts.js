angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])
    .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
        localeServiceProvider.configure({
            doys: { 'es-es': 4 },
            lang: { 'es-es': { addNew: 'Añadir' } },
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
                'de-de': { addNew: 'Hinzufügen' },
                'en-gb': { addNew: 'Add' },
                'en-us': {
                    addNew: 'Add', meridiem: function (hours) {
                        if (hours > 11) {
                            return 'P';
                        }
                        else {
                            return 'A';
                        }
                    }
                },
                'fr-fr': { addNew: 'Ajouter' }
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
        this.ngModelCtrl.$parsers.push(function (ui) {
            _this.ngModelCtrl.$modelValue.start = ui.start;
            _this.ngModelCtrl.$modelValue.end = ui.end;
            return _this.ngModelCtrl.$modelValue;
        });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2xvY2FsZS9sb2NhbGUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBRS9FLE1BQU0sQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLFVBQVUscUJBQXFCO1FBQzlFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztZQUM5QixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLElBQUksRUFBRSxF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YSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFELElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBRS9DLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDSCxJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7WUFFaEQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBdkVNLGlCQUFLLEdBQUcsYUFBYSxDQUFDO0lBRXRCLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQXNFcEMsa0JBQUM7Q0F6RUQsQUF5RUMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlY2xhcmUgdmFyIG1vbWVudDtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWyduZ0FuaW1hdGUnLCAnd2Vla2x5U2NoZWR1bGVyJywgJ3dlZWtseVNjaGVkdWxlckkxOE4nXSlcclxuXHJcbiAgLmNvbmZpZyhbJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2VQcm92aWRlcicsIGZ1bmN0aW9uIChsb2NhbGVTZXJ2aWNlUHJvdmlkZXIpIHtcclxuICAgIGxvY2FsZVNlcnZpY2VQcm92aWRlci5jb25maWd1cmUoe1xyXG4gICAgICBkb3lzOiB7ICdlcy1lcyc6IDQgfSxcclxuICAgICAgbGFuZzogeyAnZXMtZXMnOiB7IGFkZE5ldzogJ0HDsWFkaXInIH0gfSxcclxuICAgICAgbG9jYWxlTG9jYXRpb25QYXR0ZXJuOiAnL2FuZ3VsYXItbG9jYWxlX3t7bG9jYWxlfX0uanMnXHJcbiAgICB9KTtcclxuICB9XSlcclxuXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZScsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCBsb2NhbGVTZXJ2aWNlLCAkbG9nKSB7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgbG9jYWxlOiBsb2NhbGVTZXJ2aWNlLiRsb2NhbGUuaWQsXHJcbiAgICAgICAgb3B0aW9uczogey8qbW9ub1NjaGVkdWxlOiB0cnVlKi8gfSxcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1N1bicsXHJcbiAgICAgICAgICAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdNb24nLFxyXG4gICAgICAgICAgICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDExNDAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1R1ZScsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDAsIGVuZDogMjQwIH0sXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDM2MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnV2VkJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMTIwLCBlbmQ6IDcyMCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnVGh1cicsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDExNDAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ0ZyaScsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDcyMCwgZW5kOiA3ODAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1NhdCcsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnVGhlIG1vZGVsIGhhcyBjaGFuZ2VkIScsIGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLm9uTG9jYWxlQ2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgaXMgY2hhbmdpbmcgdG8nLCAkc2NvcGUubW9kZWwubG9jYWxlKTtcclxuICAgICAgICBsb2NhbGVTZXJ2aWNlLnNldCgkc2NvcGUubW9kZWwubG9jYWxlKS50aGVuKGZ1bmN0aW9uICgkbG9jYWxlKSB7XHJcbiAgICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGNoYW5nZWQgdG8nLCAkbG9jYWxlLmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcblxyXG52YXIgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhhbmRsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2hhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcbiAgICBcclxuICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgeCA9IGV2ZW50LnBhZ2VYO1xyXG5cclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnKSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICBsZXQgZGlyZWN0aXZlID0gKCRkb2N1bWVudCkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2hvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbm8tdGV4dCBvbmVzIHdpbGwgZ2V0IHN0cmlwZWQgaW50ZXJ2YWxzXHJcbiAgICAgICAgICAgIGNoaWxkLmFkZENsYXNzKCdzdHJpcGVkJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IEdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nLCBbJ3RtaC5keW5hbWljTG9jYWxlJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nKVxyXG4gIC5wcm92aWRlcignd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZScsIFsndG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyJywgZnVuY3Rpb24gKHRtaER5bmFtaWNMb2NhbGVQcm92aWRlcikge1xyXG5cclxuICAgIHZhciBkZWZhdWx0Q29uZmlnOiBhbnkgLyogVE9ETyB0eXBlICovID0ge1xyXG4gICAgICBkb3lzOiB7ICdkZS1kZSc6IDQsICdlbi1nYic6IDQsICdlbi11cyc6IDYsICdmci1mcic6IDQgfSxcclxuICAgICAgbGFuZzoge1xyXG4gICAgICAgICdkZS1kZSc6IHsgYWRkTmV3OiAnSGluenVmw7xnZW4nIH0sXHJcbiAgICAgICAgJ2VuLWdiJzogeyBhZGROZXc6ICdBZGQnIH0sXHJcbiAgICAgICAgJ2VuLXVzJzoge1xyXG4gICAgICAgICAgYWRkTmV3OiAnQWRkJywgbWVyaWRpZW06IChob3VycykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaG91cnMgPiAxMSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnUCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdBJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2ZyLWZyJzogeyBhZGROZXc6ICdBam91dGVyJyB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jb25maWd1cmUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XHJcblxyXG4gICAgICBpZiAoY29uZmlnICYmIGFuZ3VsYXIuaXNPYmplY3QoY29uZmlnKSkge1xyXG4gICAgICAgIGFuZ3VsYXIubWVyZ2UoZGVmYXVsdENvbmZpZywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgaWYgKGRlZmF1bHRDb25maWcubG9jYWxlTG9jYXRpb25QYXR0ZXJuKSB7XHJcbiAgICAgICAgICB0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIubG9jYWxlTG9jYXRpb25QYXR0ZXJuKGRlZmF1bHRDb25maWcubG9jYWxlTG9jYXRpb25QYXR0ZXJuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy4kZ2V0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhbGUnLCAndG1oRHluYW1pY0xvY2FsZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYWxlLCB0bWhEeW5hbWljTG9jYWxlKSB7XHJcblxyXG4gICAgICB2YXIgbW9tZW50TG9jYWxlQ2FjaGUgPSB7fTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldExhbmcoKSB7XHJcbiAgICAgICAgdmFyIGtleSA9ICRsb2NhbGUuaWQ7XHJcbiAgICAgICAgaWYgKCFtb21lbnRMb2NhbGVDYWNoZVtrZXldKSB7XHJcbiAgICAgICAgICBtb21lbnRMb2NhbGVDYWNoZVtrZXldID0gZ2V0TW9tZW50TG9jYWxlKGtleSk7XHJcbiAgICAgICAgICBtb21lbnQubG9jYWxlKG1vbWVudExvY2FsZUNhY2hlW2tleV0uaWQsIG1vbWVudExvY2FsZUNhY2hlW2tleV0ubG9jYWxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRDb25maWcubGFuZ1trZXldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXZSBqdXN0IG5lZWQgZmV3IG1vbWVudCBsb2NhbCBpbmZvcm1hdGlvblxyXG4gICAgICBmdW5jdGlvbiBnZXRNb21lbnRMb2NhbGUoa2V5KSB7XHJcbiAgICAgICAgbGV0IGxvY2FsZTogYW55ID0ge1xyXG4gICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgIGxvY2FsZToge1xyXG4gICAgICAgICAgICB3ZWVrOiB7XHJcbiAgICAgICAgICAgICAgLy8gQW5ndWxhciBtb25kYXkgPSAwIHdoZXJlYXMgTW9tZW50IG1vbmRheSA9IDFcclxuICAgICAgICAgICAgICBkb3c6ICgkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRklSU1REQVlPRldFRUsgKyAxKSAlIDcsXHJcbiAgICAgICAgICAgICAgZG95OiBkZWZhdWx0Q29uZmlnLmRveXNba2V5XVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG1lcmlkaWVtID0gZGVmYXVsdENvbmZpZy5sYW5nW2tleV0ubWVyaWRpZW07XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24obWVyaWRpZW0pKSB7XHJcbiAgICAgICAgICBsb2NhbGUubG9jYWxlLm1lcmlkaWVtID0gbWVyaWRpZW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbG9jYWxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5MT0NBTEVfQ0hBTkdFRCwgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcblxyXG4gICAgdGhpcy5zZXRIb3ZlckVsZW1lbnRXaWR0aCgpO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICB2YXIgbGVmdCA9IGUucGFnZVggLSBlbE9mZlggLSB0aGlzLiRob3ZlckVsZW1lbnRbMF0uY2xpZW50V2lkdGggLyAyO1xyXG5cclxuICAgICAgdmFyIHZhbCA9IHRoaXMucGl4ZWxUb1ZhbChsZWZ0KTtcclxuXHJcbiAgICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgIGxlZnQ6IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsT2Zmc2V0TGVmdCh2YWwpIFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmQgPiB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbTtcclxuXHJcbiAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgaXRlbS5zY2hlZHVsZXMucHVzaCh7XHJcbiAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgZW5kOiBlbmRcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZW1lbnRPZmZzZXRYKGVsZW06IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgcmV0dXJuIGVsZW1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWxPZmZzZXRMZWZ0KHNjaGVkdWxlLnN0YXJ0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdFJpZ2h0KHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPikge1xyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzY2hlZHVsZS5lbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0V2lkdGg7XHJcbiAgICBsZXQgY29udGFpbmVyTGVmdCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudClcclxuICAgIGxldCBjb250YWluZXJSaWdodCA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lclJpZ2h0IC0gY29udGFpbmVyTGVmdCAtIG9mZnNldFJpZ2h0ICsgJ3B4JztcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAvLyBTbGlnaHRseSBoYWNreSBidXQgZG9lcyB0aGUgam9iLiBUT0RPID9cclxuICAgIGlmICh2YWwgPCAwKSB7XHJcbiAgICAgIHZhbCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQucGFyZW50KClbMF0ucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsT2Zmc2V0TGVmdCh2YWw6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsKS5vZmZzZXRMZWZ0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Ib3ZlckVsZW1lbnRDbGljayhldmVudCkge1xyXG4gICAgaWYgKCF0aGlzLiRlbGVtZW50LmF0dHIoJ25vLWFkZCcpKSB7XHJcbiAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICB2YXIgaG92ZXJFbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGhvdmVyRWxlbWVudCkgLSBlbE9mZlg7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnBpeGVsVG9WYWwoaG92ZXJFbE9mZlgpO1xyXG4gICAgICB2YXIgZW5kID0gc3RhcnQgKyB0aGlzLnNpemU7XHJcblxyXG4gICAgICB0aGlzLmFkZFNsb3Qoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlT3ZlcigpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VMZWF2ZSgpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzaXplKCkge1xyXG4gICAgdGhpcy5zZXRIb3ZlckVsZW1lbnRXaWR0aCgpO1xyXG5cclxuICAgIC8qIFNpbmNlIHdlIGhhdmUgY2hhbmdlZCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgdmlhIHBsYWluIGpzICtcclxuICAgICAqIHRoZSBuZy1zdHlsZXMgZm9yIHRoZSBpbmRpdmlkdWFsIHNsb3RzIGFyZSBjb21wdXRlZCBpbiB0aGlzIGNvbnRyb2xsZXIsXHJcbiAgICAgKiB3ZSBtdXN0IGNhbGwgJGFwcGx5KCkgbWFudWFsbHkgc28gdGhleSB3aWxsIGFsbCB1cGRhdGUgdGhlaXIgcG9zaXRpb25zIHRvIG1hdGNoIHRoZSB6b29tIGxldmVsXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRIb3ZlckVsZW1lbnRXaWR0aCgpIHtcclxuICAgIGxldCB3aWR0aCA9IHRoaXMudmFsVG9QaXhlbCh0aGlzLnNpemUpO1xyXG5cclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICB3aWR0aDogYCR7d2lkdGh9cHhgXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxUb1BpeGVsKHZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcGVyY2VudCA9IHZhbCAvIHRoaXMuY29uZmlnLmludGVydmFsQ291bnQgLyB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyAwLjUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgUmVzaXplU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAncmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICckd2luZG93J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUmVzaXplU2VydmljZS4kbmFtZSwgUmVzaXplU2VydmljZSlcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2UuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCJjbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50JyxcclxuICAgICAgICAnJHNjb3BlJyxcclxuICAgICAgICAnc2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ3pvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsImNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3Njcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAndGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgY29uc3Qgc3RhbmRhcmRGb3JtYXQ6IHN0cmluZyA9ICdoOm1tQSc7XHJcbiAgICAgICAgY29uc3QgbWlsaXRhcnlGb3JtYXQ6IHN0cmluZyA9ICdISDptbSc7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBUaGUgbW9tZW50LWR1cmF0aW9uLWZvcm1hdCBwYWNrYWdlIGFsd2F5cyBvdXRwdXRzIG1pbGl0YXJ5IHRpbWUsIChpdCBjb252ZXJ0cyBhIGR1cmF0aW9uIHRvIGEgdGltZSBzdHJpbmcsIG5vdCBhIHRpbWUgb2YgZGF5KSBzbyB3ZSdsbCBuZWVkIHRvIGdyYWIgdGhhdCBhbmQgdGhlbiBjb252ZXJ0XHJcbiAgICAgICAgICAgIGxldCBtaWxpdGFyeVRpbWUgPSBtb21lbnQuZHVyYXRpb24obWludXRlcywgJ21pbnV0ZXMnKS5mb3JtYXQobWlsaXRhcnlGb3JtYXQsIHsgdHJpbTogZmFsc2UgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbW9tZW50KG1pbGl0YXJ5VGltZSwgbWlsaXRhcnlGb3JtYXQpLmZvcm1hdChzdGFuZGFyZEZvcm1hdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgbG9jYWxlU2VydmljZTogYW55ICAvKiBUT0RPIHR5cGUgKi9cclxuICApIHtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zO1xyXG4gIHB1YmxpYyBvbkNoYW5nZTogKG9wdGlvbnM6IHsgaXRlbUluZGV4OiBudW1iZXIsIHNjaGVkdWxlSW5kZXg6IG51bWJlciwgc2NoZWR1bGVWYWx1ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucyA9IHtcclxuICAgIG1vbm9TY2hlZHVsZTogZmFsc2UsXHJcbiAgfTtcclxuXHJcbiAgcHVibGljICRtb2RlbENoYW5nZUxpc3RlbmVyczogKChjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpID0+IHZvaWQpW107XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmRlZmF1bHRPcHRpb25zLmxhYmVscyA9IHRoaXMubG9jYWxlU2VydmljZS5nZXRMYW5nKCk7XHJcblxyXG4gICAgLy8gV2lsbCBoYW5nIG91ciBtb2RlbCBjaGFuZ2UgbGlzdGVuZXJzXHJcbiAgICB0aGlzLiRtb2RlbENoYW5nZUxpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIG1vZGVsIGl0ZW1zXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oKCkgPT4gdGhpcy5pdGVtcywgKG5ld0l0ZW1zKSA9PiB0aGlzLm9uTW9kZWxDaGFuZ2UobmV3SXRlbXMpKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIExpc3RlbiB0byAkbG9jYWxlIGNoYW5nZSAoYnJvdWdodCBieSBleHRlcm5hbCBtb2R1bGUgd2Vla2x5U2NoZWR1bGVySTE4TilcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5MT0NBTEVfQ0hBTkdFRCwgKGUsIGxhYmVscykgPT4ge1xyXG4gICAgICBpZiAodGhpcy5jb25maWcpIHtcclxuICAgICAgICB0aGlzLmNvbmZpZy5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zLCBbXSkpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmUgdGhlIHNjaGVkdWxlci5cclxuICAgKi9cclxuICBwcml2YXRlIGNvbmZpZ3VyZShvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucyk6IElXZWVrbHlTY2hlZHVsZXJDb25maWcge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciByZXN1bHQ6IElXZWVrbHlTY2hlZHVsZXJDb25maWcgPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCB7IGludGVydmFsOiBpbnRlcnZhbCwgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSwgaG91ckNvdW50OiBob3Vyc0luRGF5LCBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50IH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW9kZWxDaGFuZ2UoaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXSkge1xyXG4gICAgLy8gQ2hlY2sgaXRlbXMgYXJlIHByZXNlbnRcclxuICAgIGlmIChpdGVtcykge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xyXG4gICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHVzZSB3ZWVrbHktc2NoZWR1bGVyIGRpcmVjdGl2ZSB3aXRoIGFuIEFycmF5IG9mIGl0ZW1zJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgbW9kZWwgKHVzZSBpdCBpbiB0ZW1wbGF0ZSlcclxuICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgICAgLy8gSWYgaW4gbXVsdGlTbGlkZXIgbW9kZSwgZW5zdXJlIGEgc2NoZWR1bGUgYXJyYXkgaXMgcHJlc2VudCBvbiBlYWNoIGl0ZW1cclxuICAgICAgLy8gRWxzZSBvbmx5IHVzZSBmaXJzdCBlbGVtZW50IG9mIHNjaGVkdWxlIGFycmF5XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIGlmIChzY2hlZHVsZXMgJiYgc2NoZWR1bGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyZSh0aGlzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gRmluYWxseSwgcnVuIHRoZSBzdWIgZGlyZWN0aXZlcyBsaXN0ZW5lcnNcclxuICAgICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcclxuICAgICAgICBsaXN0ZW5lcih0aGlzLmNvbmZpZyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBpdGVtczogJz0nLFxyXG4gICAgb3B0aW9uczogJz0nLFxyXG4gICAgb25DaGFuZ2U6ICcmJ1xyXG4gIH07XHJcbiAgXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNjaGVkdWxlckNvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgV2Vla2x5U2xvdENvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdENvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3dlZWtseVNsb3RDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRzY29wZSdcclxuICBdO1xyXG5cclxuICBwcml2YXRlIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcjtcclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgJGNvbnRhaW5lckVsOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPjtcclxuICBwcml2YXRlIGl0ZW1JbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPjtcclxuICBwcml2YXRlIHNjaGVkdWxlSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlXHJcbiAgKSB7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5zY2hlZHVsZS5lbmRcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kcGFyc2Vycy5wdXNoKCh1aSkgPT4ge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLnN0YXJ0ID0gdWkuc3RhcnQ7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuZW5kID0gdWkuZW5kO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMubmdNb2RlbEN0cmwuJG1vZGVsVmFsdWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkxPQ0FMRV9DSEFOR0VELCAoKSA9PiB7XHJcbiAgICAgIC8vIFNpbXBsZSBjaGFuZ2Ugb2JqZWN0IHJlZmVyZW5jZSBzbyB0aGF0IG5nTW9kZWwgdHJpZ2dlcnMgZm9ybWF0dGluZyAmIHJlbmRlcmluZ1xyXG4gICAgICB0aGlzLnNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuUmVtb3ZlKCkge1xyXG4gICAgcmV0dXJuICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG4gICAgbGV0IGR1cmF0aW9uID0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgLSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQXR0cignbm8tYWRkJyk7XHJcbiAgICB9LCA1MDApO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2VPdmVybGFwcygpIHtcclxuICAgIGxldCBzY2hlZHVsZSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICBpZiAoZWwuZW5kID49IHNjaGVkdWxlLmVuZCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5zdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGVsLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1vZGVsIGNvbXBsZXRlbHkgY292ZXJzIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGVsc2UgaWYgKHNjaGVkdWxlLmVuZCA+PSBlbC5lbmQgJiYgc2NoZWR1bGUuc3RhcnQgPD0gZWwuc3RhcnQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBlbmQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuZW5kIDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IHNjaGVkdWxlLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIHN0YXJ0IGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgZWxzZSBpZiAoZWwuc3RhcnQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuJGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLCAxKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0IDw9IHVpLmVuZCAtIDEgJiYgbmV3U3RhcnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5lbmQgIT09IG5ld0VuZCAmJiBuZXdFbmQgPj0gdWkuc3RhcnQgKyAxICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgdGhpcy4kY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5hdHRyKCduby1hZGQnLCAndHJ1ZScpO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuc2NoZWR1bGUuZW5kXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICB0aGlzLnNjaGVkdWxlLmVuZCA9IHVwZGF0ZS5lbmQ7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHRoaXMuc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkNoYW5nZSh7XHJcbiAgICAgIGl0ZW1JbmRleDogdGhpcy5pdGVtSW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlSW5kZXg6IHRoaXMuc2NoZWR1bGVJbmRleCxcclxuICAgICAgc2NoZWR1bGVWYWx1ZTogdGhpcy5zY2hlZHVsZVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdCc7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIHNjaGVkdWxlOiAnPW5nTW9kZWwnLFxyXG4gICAgaXRlbUluZGV4OiAnPCcsXHJcbiAgICBzY2hlZHVsZUluZGV4OiAnPCcsXHJcbiAgICBpdGVtOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIHNjaGVkdWxlckN0cmw6ICded2Vla2x5U2NoZWR1bGVyJyxcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgWm9vbVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3pvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gICAgICAgIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAgICAgICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAgICAgICAvLyAgICAgICB8ICAgIFxyXG4gICAgICAgIGxldCBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID0gZGF0YS5wZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nO1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAgICAgICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBlbGVtZW50Q291bnQgKiBib3hXaWR0aDtcclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9IHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJztcclxuXHJcbiAgICAgICAgaWYgKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFNpemVzIG9mIGNlbGxzIGluIGEgbGluZSBjb3VsZCBkaWZmZXJlbnQgKGVzcGVjaWFsbHkgdGhlIGZpcnN0IG9uZSlcclxuICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21CeVNjcm9sbChlbGVtZW50OiBhbnksIGV2ZW50OiBXaGVlbEV2ZW50LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGUtYXJlYScpLnN0eWxlO1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSBwYXJzZUludChzdHlsZS53aWR0aCwgMTApO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">{{multiSliderCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 right: multiSliderCtrl.getSlotRight(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);