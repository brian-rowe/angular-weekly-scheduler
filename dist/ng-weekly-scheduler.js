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
                var meridiem = i >= 12 ? 'pm' : 'am';
                child.text("" + (currentHour || '12') + meridiem);
            }
            else {
                // no-text ones will get striped intervals
                child.addClass('striped');
                var numIntervalsInTick = 60 / config.interval;
                var intervalPercentage = 100 / numIntervalsInTick;
                for (var j = 0; j < numIntervalsInTick; j++) {
                    var grandChild = GRID_TEMPLATE.clone();
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
        var gridItemEl = GRID_TEMPLATE.clone();
        // Clean element
        element.empty();
        for (var i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (this.shouldAddBorder(i, tickcount, config)) {
                child.addClass('weekly-schedule-border');
            }
            // necessary so the table styles calculate a width
            child.html('&nbsp;');
            element.append(child);
        }
    };
    IntervalGridDirective.prototype.shouldAddBorder = function (index, tickcount, config) {
        var position = index + 1;
        if (position === tickcount) {
            return false;
        }
        if ((position * config.interval) % 60 === 0) {
            return true;
        }
        return false;
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
                'de-de': { addNew: 'Hinzufügen' },
                'en-gb': { addNew: 'Add' },
                'en-us': { addNew: 'Add' },
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
        this.$scope.$on("zoomedIn" /* ZOOMED_IN */, function () {
            _this.setHoverElementWidth();
        });
        this.$scope.$on("zoomedOut" /* ZOOMED_OUT */, function () {
            _this.setHoverElementWidth();
        });
    };
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$hoverElement = angular.element(this.$element.find('div')[0]);
        this.setHoverElementWidth();
        this.$element.on('mousemove', function (e) {
            var elOffX = _this.getElementOffsetX(_this.$element);
            var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
            var element = _this.getUnderlyingInterval(e.pageY, left);
            console.log(element);
            var snapped = _this.valToPixel(_this.pixelToVal(left));
            _this.$hoverElement.css({
                left: snapped + 'px'
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
        return schedule.start / this.config.maxValue * 100 + '%';
    };
    MultiSliderController.prototype.getSlotWidth = function (schedule) {
        return (schedule.end - schedule.start) / this.config.maxValue * 100 + '%';
    };
    MultiSliderController.prototype.getUnderlyingInterval = function (top, left) {
        var intervals = this.$element.find('.interval');
        var result = angular.isArray(intervals) && intervals.filter(function (i) {
            var boundingRect = i[0].getBoundingClientRect();
            return top >= boundingRect.top
                && top <= boundingRect.bottom
                && left >= boundingRect.left
                && left <= boundingRect.right;
        });
        return;
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
    function ScrollService() {
    }
    ScrollService.prototype.hijackScroll = function (element, delta) {
        element.addEventListener('mousewheel', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.ctrlKey) {
                var style = element.querySelector('.schedule-area').style;
                var currentWidth = parseInt(style.width, 10);
                if ((event.wheelDelta || event.detail) > 0) {
                    style.width = (currentWidth + 2 * delta) + '%';
                }
                else {
                    var width = currentWidth - 2 * delta;
                    style.width = (width > 100 ? width : 100) + '%';
                }
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
            if (this.config) {
                this.config.labels = labels;
            }
            this.onModelChange(angular.copy(this.items, []));
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
        this.ngModelCtrl.$setViewValue(update);
        this.schedulerCtrl.onChange({
            itemIndex: this.itemIndex,
            scheduleIndex: this.scheduleIndex,
            scheduleValue: this.ngModelCtrl.$modelValue
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
    ZoomService.$name = 'zoomService';
    ZoomService.$inject = ['$rootScope'];
    return ZoomService;
}());
angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ludGVydmFsLWdyaWQvaW50ZXJ2YWwtZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2xvY2FsZS9sb2NhbGUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBRS9FLE1BQU0sQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLFVBQVUscUJBQXFCO1FBQzlFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztZQUM5QixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLElBQUks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QztRQUU1RSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztRQUVsRixJQUFJLHlCQUF5QixLQUFLLFNBQVMsRUFBRTtZQUMzQyx5Q0FBeUM7WUFDekMsT0FBTyxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQztTQUNoRDthQUFNO1lBQ0wsc0VBQXNFO1lBQ3RFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDM0Y7UUFFRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBdkRNLGlCQUFLLEdBQUcsYUFBYSxDQUFDO0lBRXRCLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQXNEcEMsa0JBQUM7Q0F6REQsQUF5REMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlY2xhcmUgdmFyIG1vbWVudDtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWyduZ0FuaW1hdGUnLCAnd2Vla2x5U2NoZWR1bGVyJywgJ3dlZWtseVNjaGVkdWxlckkxOE4nXSlcclxuXHJcbiAgLmNvbmZpZyhbJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2VQcm92aWRlcicsIGZ1bmN0aW9uIChsb2NhbGVTZXJ2aWNlUHJvdmlkZXIpIHtcclxuICAgIGxvY2FsZVNlcnZpY2VQcm92aWRlci5jb25maWd1cmUoe1xyXG4gICAgICBkb3lzOiB7ICdlcy1lcyc6IDQgfSxcclxuICAgICAgbGFuZzogeyAnZXMtZXMnOiB7IGFkZE5ldzogJ0HDsWFkaXInIH0gfSxcclxuICAgICAgbG9jYWxlTG9jYXRpb25QYXR0ZXJuOiAnL2FuZ3VsYXItbG9jYWxlX3t7bG9jYWxlfX0uanMnXHJcbiAgICB9KTtcclxuICB9XSlcclxuXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZScsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCBsb2NhbGVTZXJ2aWNlLCAkbG9nKSB7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgbG9jYWxlOiBsb2NhbGVTZXJ2aWNlLiRsb2NhbGUuaWQsXHJcbiAgICAgICAgb3B0aW9uczogey8qbW9ub1NjaGVkdWxlOiB0cnVlKi8gfSxcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1N1bicsXHJcbiAgICAgICAgICAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdNb24nLFxyXG4gICAgICAgICAgICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDExNDAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1R1ZScsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDAsIGVuZDogMjQwIH0sXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDM2MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnV2VkJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMTIwLCBlbmQ6IDcyMCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnVGh1cicsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDExNDAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ0ZyaScsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDcyMCwgZW5kOiA3ODAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1NhdCcsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnVGhlIG1vZGVsIGhhcyBjaGFuZ2VkIScsIGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLm9uTG9jYWxlQ2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgaXMgY2hhbmdpbmcgdG8nLCAkc2NvcGUubW9kZWwubG9jYWxlKTtcclxuICAgICAgICBsb2NhbGVTZXJ2aWNlLnNldCgkc2NvcGUubW9kZWwubG9jYWxlKS50aGVuKGZ1bmN0aW9uICgkbG9jYWxlKSB7XHJcbiAgICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGNoYW5nZWQgdG8nLCAkbG9jYWxlLmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcblxyXG52YXIgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhhbmRsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2hhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcbiAgICBcclxuICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgeCA9IGV2ZW50LnBhZ2VYO1xyXG5cclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnKSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICBsZXQgZGlyZWN0aXZlID0gKCRkb2N1bWVudCkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2hvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwbScgOiAnYW0nO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBuby10ZXh0IG9uZXMgd2lsbCBnZXQgc3RyaXBlZCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgY2hpbGQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBudW1JbnRlcnZhbHNJblRpY2sgPSA2MCAvIGNvbmZpZy5pbnRlcnZhbDtcclxuICAgICAgICAgICAgbGV0IGludGVydmFsUGVyY2VudGFnZSA9IDEwMCAvIG51bUludGVydmFsc0luVGljaztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtSW50ZXJ2YWxzSW5UaWNrOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBncmFuZENoaWxkID0gR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMucHVzaCgobmV3Q29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmV3Q29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEludGVydmFsR3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaW50ZXJ2YWxHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXndlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnZhbCB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmludGVydmFsQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSBHUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcbiAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLnNob3VsZEFkZEJvcmRlcihpLCB0aWNrY291bnQsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICBjaGlsZC5hZGRDbGFzcygnd2Vla2x5LXNjaGVkdWxlLWJvcmRlcicpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG5lY2Vzc2FyeSBzbyB0aGUgdGFibGUgc3R5bGVzIGNhbGN1bGF0ZSBhIHdpZHRoXHJcbiAgICAgICAgICBjaGlsZC5odG1sKCcmbmJzcDsnKTtcclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvdWxkQWRkQm9yZGVyKGluZGV4OiBudW1iZXIsIHRpY2tjb3VudDogbnVtYmVyLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpIHtcclxuICAgICAgICBsZXQgcG9zaXRpb24gPSBpbmRleCArIDE7XHJcblxyXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gdGlja2NvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgocG9zaXRpb24gKiBjb25maWcuaW50ZXJ2YWwpICUgNjAgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLiRtb2RlbENoYW5nZUxpc3RlbmVycy5wdXNoKChuZXdDb25maWcpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZXdDb25maWcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSW50ZXJ2YWxHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSW50ZXJ2YWxHcmlkRGlyZWN0aXZlLiRuYW1lLCBJbnRlcnZhbEdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nLCBbJ3RtaC5keW5hbWljTG9jYWxlJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nKVxyXG4gIC5wcm92aWRlcignd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZScsIFsndG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyJywgZnVuY3Rpb24gKHRtaER5bmFtaWNMb2NhbGVQcm92aWRlcikge1xyXG5cclxuICAgIHZhciBkZWZhdWx0Q29uZmlnOiBhbnkgLyogVE9ETyB0eXBlICovID0ge1xyXG4gICAgICBkb3lzOiB7J2RlLWRlJzogNCwgJ2VuLWdiJzogNCwgJ2VuLXVzJzogNiwgJ2ZyLWZyJzogNH0sXHJcbiAgICAgIGxhbmc6IHtcclxuICAgICAgICAnZGUtZGUnOiB7YWRkTmV3OiAnSGluenVmw7xnZW4nfSxcclxuICAgICAgICAnZW4tZ2InOiB7YWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2VuLXVzJzoge2FkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdmci1mcic6IHthZGROZXc6ICdBam91dGVyJ31cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuXHJcbiAgICAgIGlmIChjb25maWcgJiYgYW5ndWxhci5pc09iamVjdChjb25maWcpKSB7XHJcbiAgICAgICAgYW5ndWxhci5tZXJnZShkZWZhdWx0Q29uZmlnLCBjb25maWcpO1xyXG5cclxuICAgICAgICBpZiAoZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pIHtcclxuICAgICAgICAgIHRtaER5bmFtaWNMb2NhbGVQcm92aWRlci5sb2NhbGVMb2NhdGlvblBhdHRlcm4oZGVmYXVsdENvbmZpZy5sb2NhbGVMb2NhdGlvblBhdHRlcm4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRyb290U2NvcGUnLCAnJGxvY2FsZScsICd0bWhEeW5hbWljTG9jYWxlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhbGUsIHRtaER5bmFtaWNMb2NhbGUpIHtcclxuXHJcbiAgICAgIHZhciBtb21lbnRMb2NhbGVDYWNoZSA9IHt9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0TGFuZygpIHtcclxuICAgICAgICB2YXIga2V5ID0gJGxvY2FsZS5pZDtcclxuICAgICAgICBpZiAoIW1vbWVudExvY2FsZUNhY2hlW2tleV0pIHtcclxuICAgICAgICAgIG1vbWVudExvY2FsZUNhY2hlW2tleV0gPSBnZXRNb21lbnRMb2NhbGUoa2V5KTtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCwgbW9tZW50TG9jYWxlQ2FjaGVba2V5XS5sb2NhbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb21lbnQubG9jYWxlKG1vbWVudExvY2FsZUNhY2hlW2tleV0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmYXVsdENvbmZpZy5sYW5nW2tleV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIGp1c3QgbmVlZCBmZXcgbW9tZW50IGxvY2FsIGluZm9ybWF0aW9uXHJcbiAgICAgIGZ1bmN0aW9uIGdldE1vbWVudExvY2FsZShrZXkpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgIGxvY2FsZToge1xyXG4gICAgICAgICAgICB3ZWVrOiB7XHJcbiAgICAgICAgICAgICAgLy8gQW5ndWxhciBtb25kYXkgPSAwIHdoZXJlYXMgTW9tZW50IG1vbmRheSA9IDFcclxuICAgICAgICAgICAgICBkb3c6ICgkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRklSU1REQVlPRldFRUsgKyAxKSAlIDcsXHJcbiAgICAgICAgICAgICAgZG95OiBkZWZhdWx0Q29uZmlnLmRveXNba2V5XVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhbGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuTE9DQUxFX0NIQU5HRUQsIGdldExhbmcoKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAkbG9jYWxlOiAkbG9jYWxlLFxyXG4gICAgICAgIGdldExhbmc6IGdldExhbmcsXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICByZXR1cm4gdG1oRHluYW1pY0xvY2FsZS5zZXQoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XTtcclxuICB9XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRzY29wZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZVxyXG4gICkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgJGhvdmVyRWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xyXG5cclxuICBwdWJsaWMgZWxlbWVudDogRWxlbWVudDtcclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG4gIHB1YmxpYyBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+O1xyXG4gIHB1YmxpYyBzaXplOiBudW1iZXIgPSA2MDsgLy8gbWludXRlc1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4sICgpID0+IHtcclxuICAgICAgdGhpcy5zZXRIb3ZlckVsZW1lbnRXaWR0aCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VULCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc2V0SG92ZXJFbGVtZW50V2lkdGgoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcblxyXG4gICAgdGhpcy5zZXRIb3ZlckVsZW1lbnRXaWR0aCgpO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICB2YXIgbGVmdCA9IGUucGFnZVggLSBlbE9mZlggLSB0aGlzLiRob3ZlckVsZW1lbnRbMF0uY2xpZW50V2lkdGggLyAyO1xyXG5cclxuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlLnBhZ2VZLCBsZWZ0KTtcclxuICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XHJcblxyXG4gICAgICB2YXIgc25hcHBlZCA9IHRoaXMudmFsVG9QaXhlbCh0aGlzLnBpeGVsVG9WYWwobGVmdCkpO1xyXG5cclxuICAgICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgbGVmdDogc25hcHBlZCArICdweCdcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRTbG90KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgIHN0YXJ0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5kID4gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW07XHJcblxyXG4gICAgaWYgKCFpdGVtLnNjaGVkdWxlcykge1xyXG4gICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe1xyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtZW50T2Zmc2V0WChlbGVtOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgIHJldHVybiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPikge1xyXG4gICAgcmV0dXJuIHNjaGVkdWxlLnN0YXJ0IC8gdGhpcy5jb25maWcubWF4VmFsdWUgKiAxMDAgKyAnJSc7XHJcbiAgfVxyXG4gIFxyXG4gIHByaXZhdGUgZ2V0U2xvdFdpZHRoKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPikge1xyXG4gICAgcmV0dXJuIChzY2hlZHVsZS5lbmQgLSBzY2hlZHVsZS5zdGFydCkgLyB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAqIDEwMCArICclJztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHRvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIpIHtcclxuICAgIGxldCBpbnRlcnZhbHM6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmludGVydmFsJyk7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IGFuZ3VsYXIuaXNBcnJheShpbnRlcnZhbHMpICYmIGludGVydmFscy5maWx0ZXIoKGkpID0+IHtcclxuICAgICAgbGV0IGJvdW5kaW5nUmVjdCA9IGlbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICByZXR1cm4gdG9wID49IGJvdW5kaW5nUmVjdC50b3BcclxuICAgICAgICAgICYmIHRvcCA8PSBib3VuZGluZ1JlY3QuYm90dG9tXHJcbiAgICAgICAgICAmJiBsZWZ0ID49IGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgICAgICAmJiBsZWZ0IDw9IGJvdW5kaW5nUmVjdC5yaWdodDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuYXR0cignbm8tYWRkJykpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHRoaXMuc2l6ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRIb3ZlckVsZW1lbnRXaWR0aCgpIHtcclxuICAgIGxldCB3aWR0aCA9IHRoaXMudmFsVG9QaXhlbCh0aGlzLnNpemUpO1xyXG5cclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICB3aWR0aDogYCR7d2lkdGh9cHhgXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxUb1BpeGVsKHZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcGVyY2VudCA9IHZhbCAvIHRoaXMuY29uZmlnLmludGVydmFsQ291bnQgLyB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyAwLjUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ3Njcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgICBwcml2YXRlIHNjcm9sbFNlcnZpY2U6IFNjcm9sbFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRwb3N0TGluaygpIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07IC8vIGdyYWIgcGxhaW4ganMsIG5vdCBqcWxpdGVcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxTZXJ2aWNlLmhpamFja1Njcm9sbChlbGVtZW50LCAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCJjbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY3JvbGxTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlLWFyZWEnKS5zdHlsZTtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50V2lkdGggPSBwYXJzZUludChzdHlsZS53aWR0aCwgMTApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLndpZHRoID0gKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZS53aWR0aCA9ICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3RpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGNvbnN0IHN0YW5kYXJkRm9ybWF0OiBzdHJpbmcgPSAnaDptbUEnO1xyXG4gICAgICAgIGNvbnN0IG1pbGl0YXJ5Rm9ybWF0OiBzdHJpbmcgPSAnSEg6bW0nO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gVGhlIG1vbWVudC1kdXJhdGlvbi1mb3JtYXQgcGFja2FnZSBhbHdheXMgb3V0cHV0cyBtaWxpdGFyeSB0aW1lLCAoaXQgY29udmVydHMgYSBkdXJhdGlvbiB0byBhIHRpbWUgc3RyaW5nLCBub3QgYSB0aW1lIG9mIGRheSkgc28gd2UnbGwgbmVlZCB0byBncmFiIHRoYXQgYW5kIHRoZW4gY29udmVydFxyXG4gICAgICAgICAgICBsZXQgbWlsaXRhcnlUaW1lID0gbW9tZW50LmR1cmF0aW9uKG1pbnV0ZXMsICdtaW51dGVzJykuZm9ybWF0KG1pbGl0YXJ5Rm9ybWF0LCB7IHRyaW06IGZhbHNlIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vbWVudChtaWxpdGFyeVRpbWUsIG1pbGl0YXJ5Rm9ybWF0KS5mb3JtYXQoc3RhbmRhcmRGb3JtYXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIGxvY2FsZVNlcnZpY2U6IGFueSAgLyogVE9ETyB0eXBlICovXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG4gIHB1YmxpYyBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucztcclxuICBwdWJsaWMgb25DaGFuZ2U6IChvcHRpb25zOiB7IGl0ZW1JbmRleDogbnVtYmVyLCBzY2hlZHVsZUluZGV4OiBudW1iZXIsIHNjaGVkdWxlVmFsdWU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+IH0pID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBkZWZhdWx0T3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnMgPSB7XHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyAkbW9kZWxDaGFuZ2VMaXN0ZW5lcnM6ICgoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKSA9PiB2b2lkKVtdO1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5kZWZhdWx0T3B0aW9ucy5sYWJlbHMgPSB0aGlzLmxvY2FsZVNlcnZpY2UuZ2V0TGFuZygpO1xyXG5cclxuICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCgpID0+IHRoaXMuaXRlbXMsIChuZXdJdGVtcykgPT4gdGhpcy5vbk1vZGVsQ2hhbmdlKG5ld0l0ZW1zKSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMaXN0ZW4gdG8gJGxvY2FsZSBjaGFuZ2UgKGJyb3VnaHQgYnkgZXh0ZXJuYWwgbW9kdWxlIHdlZWtseVNjaGVkdWxlckkxOE4pXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuTE9DQUxFX0NIQU5HRUQsIGZ1bmN0aW9uIChlLCBsYWJlbHMpIHtcclxuICAgICAgaWYgKHRoaXMuY29uZmlnKSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMub25Nb2RlbENoYW5nZShhbmd1bGFyLmNvcHkodGhpcy5pdGVtcywgW10pKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWd1cmUob3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnMpOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnIHtcclxuICAgIHZhciBpbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgMTU7IC8vIG1pbnV0ZXNcclxuICAgIHZhciBob3Vyc0luRGF5ID0gMjQ7XHJcbiAgICB2YXIgbWludXRlc0luRGF5ID0gaG91cnNJbkRheSAqIDYwO1xyXG4gICAgdmFyIGludGVydmFsQ291bnQgPSBtaW51dGVzSW5EYXkgLyBpbnRlcnZhbDtcclxuXHJcbiAgICB2YXIgcmVzdWx0OiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnID0gYW5ndWxhci5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywgeyBpbnRlcnZhbDogaW50ZXJ2YWwsIG1heFZhbHVlOiBtaW51dGVzSW5EYXksIGhvdXJDb3VudDogaG91cnNJbkRheSwgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudCB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vZGVsQ2hhbmdlKGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+W10pIHtcclxuICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBwcmVzZW50XHJcbiAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBpbiBhbiBBcnJheVxyXG4gICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShpdGVtcykpIHtcclxuICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygb3VyIG1vZGVsICh1c2UgaXQgaW4gdGVtcGxhdGUpXHJcbiAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAgIC8vIElmIGluIG11bHRpU2xpZGVyIG1vZGUsIGVuc3VyZSBhIHNjaGVkdWxlIGFycmF5IGlzIHByZXNlbnQgb24gZWFjaCBpdGVtXHJcbiAgICAgIC8vIEVsc2Ugb25seSB1c2UgZmlyc3QgZWxlbWVudCBvZiBzY2hlZHVsZSBhcnJheVxyXG4gICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBpZiAoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW3NjaGVkdWxlc1swXV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5jb25maWd1cmUodGhpcy5vcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgIHRoaXMuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XHJcbiAgICAgICAgbGlzdGVuZXIodGhpcy5jb25maWcpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgaXRlbXM6ICc9JyxcclxuICAgIG9wdGlvbnM6ICc9JyxcclxuICAgIG9uQ2hhbmdlOiAnJidcclxuICB9O1xyXG4gIFxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsImNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG5cclxuICBwcml2YXRlICRjb250YWluZXJFbDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG5cclxuICBwcml2YXRlIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj47XHJcbiAgcHJpdmF0ZSBpdGVtSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPG51bWJlcj47XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZUluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzT25EcmFnU3RhcnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+O1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZVxyXG4gICkge1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwgPSB0aGlzLiRlbGVtZW50LnBhcmVudCgpO1xyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuc2NoZWR1bGUuZW5kXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG5cclxuICAgIHRoaXMubmdNb2RlbEN0cmwuJHBhcnNlcnMucHVzaCgodWkpID0+IHtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5zdGFydCA9IHVpLnN0YXJ0O1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLmVuZCA9IHVpLmVuZDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLm5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5MT0NBTEVfQ0hBTkdFRCwgKCkgPT4ge1xyXG4gICAgICAvLyBTaW1wbGUgY2hhbmdlIG9iamVjdCByZWZlcmVuY2Ugc28gdGhhdCBuZ01vZGVsIHRyaWdnZXJzIGZvcm1hdHRpbmcgJiByZW5kZXJpbmdcclxuICAgICAgdGhpcy5zY2hlZHVsZSA9IGFuZ3VsYXIuY29weSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhblJlbW92ZSgpIHtcclxuICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5pdGVtLmVkaXRhYmxlKSB8fCB0aGlzLml0ZW0uZWRpdGFibGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVsZXRlU2VsZigpIHtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUodGhpcy5zY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZHJhZyhwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5waXhlbFRvVmFsKHBpeGVsKTtcclxuICAgIGxldCBkdXJhdGlvbiA9IHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZERyYWcoKSB7XHJcbiAgICAvLyB0aGlzIHByZXZlbnRzIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcclxuICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGNvbnRhaW5lckVsLnJlbW92ZUF0dHIoJ25vLWFkZCcpO1xyXG4gICAgfSwgNTAwKTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xyXG5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlT3ZlcmxhcHMoKSB7XHJcbiAgICBsZXQgc2NoZWR1bGUgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICAvLyBtb2RlbCBpcyBpbnNpZGUgYW5vdGhlciBzbG90XHJcbiAgICAgICAgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5lbmQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuc3RhcnQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBlbC5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBlbC5lbmRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBtb2RlbCBjb21wbGV0ZWx5IGNvdmVycyBhbm90aGVyIHNsb3RcclxuICAgICAgICBlbHNlIGlmIChzY2hlZHVsZS5lbmQgPj0gZWwuZW5kICYmIHNjaGVkdWxlLnN0YXJ0IDw9IGVsLnN0YXJ0KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5vdGhlciBzbG90J3MgZW5kIGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgZWxzZSBpZiAoZWwuZW5kID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLmVuZCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBlbC5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBzY2hlZHVsZS5lbmRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBzdGFydCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgIGVsc2UgaWYgKGVsLnN0YXJ0ID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGVsLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLiRjb250YWluZXJFbFswXS5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG5cclxuICAgIGlmICh0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQpIHtcclxuICAgICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA8PSB1aS5lbmQgLSAxICYmIG5ld1N0YXJ0ID49IDApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgICAgZW5kOiB1aS5lbmRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgICBpZiAodWkuZW5kICE9PSBuZXdFbmQgJiYgbmV3RW5kID49IHVpLnN0YXJ0ICsgMSAmJiBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgc3RhcnQ6IHVpLnN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLmFkZENsYXNzKCdkcmFnZ2luZycpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwuYXR0cignbm8tYWRkJywgJ3RydWUnKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLnNjaGVkdWxlLmVuZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVFbmQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlU2VsZih1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUodXBkYXRlKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2Uoe1xyXG4gICAgICBpdGVtSW5kZXg6IHRoaXMuaXRlbUluZGV4LFxyXG4gICAgICBzY2hlZHVsZUluZGV4OiB0aGlzLnNjaGVkdWxlSW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlVmFsdWU6IHRoaXMubmdNb2RlbEN0cmwuJG1vZGVsVmFsdWVcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGl0ZW1JbmRleDogJzwnLFxyXG4gICAgc2NoZWR1bGVJbmRleDogJzwnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBzY2hlZHVsZXJDdHJsOiAnXndlZWtseVNjaGVkdWxlcicsXHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC5odG1sJztcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNsb3RDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNsb3RDb21wb25lbnQoKSk7XHJcbiIsImNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd6b29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tSW5BQ2VsbChlbGVtZW50OiBhbnksIGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgICAgICAgbGV0IGkgPSBkYXRhLmlkeDtcclxuXHJcbiAgICAgICAgLy8gcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyBpcyB1c2VkIHdoZW4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGdyaWQgaXMgbm90IGZ1bGxcclxuICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGluIHRoZSBleGFtcGxlIGJlbG93IGBmZWIgMTdgIGlzIG5vdCBmdWxsXHJcbiAgICAgICAgLy8gZmViIDE3ICAgICAgICAgIG1hcmNoIDE3XHJcbiAgICAgICAgLy8gICAgICAgfCAgICBcclxuICAgICAgICBsZXQgcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9IGRhdGEucGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZztcclxuXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgLy8gbGVhdmUgKDEvMykgZWFjaCBzaWRlXHJcbiAgICAgICAgLy8gMS8zIHwgICAgMy8zICAgfCAxLzNcclxuICAgICAgICBsZXQgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvICg1IC8gMyk7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAvIDM7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJSc7XHJcblxyXG4gICAgICAgIGlmIChwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBTaXplcyBvZiBjZWxscyBpbiBhIGxpbmUgY291bGQgZGlmZmVyZW50IChlc3BlY2lhbGx5IHRoZSBmaXJzdCBvbmUpXHJcbiAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBzY2hlZHVsZUFyZWFXaWR0aFB4ICogKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgLyAxMDApIC0gZ3V0dGVyU2l6ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">{{multiSliderCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 width: multiSliderCtrl.getSlotWidth(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);