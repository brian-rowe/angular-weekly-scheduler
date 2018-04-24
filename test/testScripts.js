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
            var style = el.querySelector('.schedule-area').style, currentWidth = parseInt(style.width);
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
    el.querySelector('.schedule-area').style.width = scheduleAreaWidthPercent + '%';
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
    };
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$hoverElement = angular.element(this.$element.find('div')[0]);
        this.setHoverElementWidth();
        this.$element.on('mousemove', function (e) {
            var elOffX = _this.getElementOffsetX(_this.$element);
            var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
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
    function ScheduleAreaContainerController($element, $scope) {
        this.$element = $element;
        this.$scope = $scope;
    }
    ScheduleAreaContainerController.prototype.$postLink = function () {
        var _this = this;
        var element = this.$element[0]; // grab plain js, not jqlite
        mouseScroll(element, 20);
        this.$scope.$on("clickOnACell" /* CLICK_ON_A_CELL */, function (e, data) {
            zoomInACell(element, e, data);
            _this.$scope.$broadcast("zoomedIn" /* ZOOMED_IN */);
        });
    };
    ScheduleAreaContainerController.$name = 'scheduleAreaContainerController';
    ScheduleAreaContainerController.$inject = [
        '$element',
        '$scope'
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ludGVydmFsLWdyaWQvaW50ZXJ2YWwtZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2xvY2FsZS9sb2NhbGUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztLQUUvRSxNQUFNLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxVQUFVLHFCQUFxQjtRQUM5RSxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFDOUIsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtZQUNwQixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDdkMscUJBQXFCLEVBQUUsK0JBQStCO1NBQ3ZELENBQUMsQ0FBQztJQUNMLENB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MEJBQUM7Q0FwQkQsQUFvQkMsSUFBQTtBQUVELE9BQU87S0FDSixNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDekIsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztLQUM1RCxTQUFTLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWNsYXJlIHZhciBtb21lbnQ7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnbmdBbmltYXRlJywgJ3dlZWtseVNjaGVkdWxlcicsICd3ZWVrbHlTY2hlZHVsZXJJMThOJ10pXHJcblxyXG4gIC5jb25maWcoWyd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlUHJvdmlkZXInLCBmdW5jdGlvbiAobG9jYWxlU2VydmljZVByb3ZpZGVyKSB7XHJcbiAgICBsb2NhbGVTZXJ2aWNlUHJvdmlkZXIuY29uZmlndXJlKHtcclxuICAgICAgZG95czogeyAnZXMtZXMnOiA0IH0sXHJcbiAgICAgIGxhbmc6IHsgJ2VzLWVzJzogeyBhZGROZXc6ICdBw7FhZGlyJyB9IH0sXHJcbiAgICAgIGxvY2FsZUxvY2F0aW9uUGF0dGVybjogJy9hbmd1bGFyLWxvY2FsZV97e2xvY2FsZX19LmpzJ1xyXG4gICAgfSk7XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgbG9jYWxlU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlU2VydmljZS4kbG9jYWxlLmlkLFxyXG4gICAgICAgIG9wdGlvbnM6IHsvKm1vbm9TY2hlZHVsZTogdHJ1ZSovIH0sXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTdW4nLFxyXG4gICAgICAgICAgICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnTW9uJyxcclxuICAgICAgICAgICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdUdWUnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAwLCBlbmQ6IDI0MCB9LFxyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAzNjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1dlZCcsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDEyMCwgZW5kOiA3MjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1RodXInLFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdGcmknLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiA3MjAsIGVuZDogNzgwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTYXQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZG9Tb21ldGhpbmcgPSBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5vbkxvY2FsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGlzIGNoYW5naW5nIHRvJywgJHNjb3BlLm1vZGVsLmxvY2FsZSk7XHJcbiAgICAgICAgbG9jYWxlU2VydmljZS5zZXQoJHNjb3BlLm1vZGVsLmxvY2FsZSkudGhlbihmdW5jdGlvbiAoJGxvY2FsZSkge1xyXG4gICAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBjaGFuZ2VkIHRvJywgJGxvY2FsZS5pZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG5cclxudmFyIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxudmFyIGlzQ3RybDtcclxuXHJcbmZ1bmN0aW9uIGN0cmxDaGVjayhlKSB7XHJcbiAgaWYgKGUud2hpY2ggPT09IDE3KSB7XHJcbiAgICBpc0N0cmwgPSBlLnR5cGUgPT09ICdrZXlkb3duJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlU2Nyb2xsKGVsLCBkZWx0YSkge1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGN0cmxDaGVjayk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgY3RybENoZWNrKTtcclxuXHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGlmIChpc0N0cmwpIHtcclxuICAgICAgdmFyIHN0eWxlID0gZWwucXVlcnlTZWxlY3RvcignLnNjaGVkdWxlLWFyZWEnKS5zdHlsZSwgY3VycmVudFdpZHRoID0gcGFyc2VJbnQoc3R5bGUud2lkdGgpO1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgoZS53aGVlbERlbHRhIHx8IGUuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gem9vbUluQUNlbGwoZWwsIGV2ZW50LCBkYXRhKSB7XHJcblxyXG4gIHZhciBuYkVsZW1lbnRzID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gIHZhciBpZHggPSBkYXRhLmlkeDtcclxuICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAvLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgdmFyIHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPSBkYXRhLnBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmc7XHJcblxyXG4gIHZhciBjb250YWluZXJXaWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG5cclxuICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gIHZhciBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICB2YXIgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBuYkVsZW1lbnRzICogYm94V2lkdGg7XHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICBlbC5xdWVyeVNlbGVjdG9yKCcuc2NoZWR1bGUtYXJlYScpLnN0eWxlLndpZHRoID0gc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnO1xyXG5cclxuICBpZiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IGlkeCAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gU2l6ZXMgb2YgY2VsbHMgaW4gYSBsaW5lIGNvdWxkIGRpZmZlcmVudCAoZXNwZWNpYWxseSB0aGUgZmlyc3Qgb25lKVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhhbmRsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2hhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcbiAgICBcclxuICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgeCA9IGV2ZW50LnBhZ2VYO1xyXG5cclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnKSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICBsZXQgZGlyZWN0aXZlID0gKCRkb2N1bWVudCkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2hvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykge1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciB0aWNrc2l6ZSA9IDEwMCAvIHRpY2tjb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IEdSSURfVEVNUExBVEUuY3NzKHt3aWR0aDogdGlja3NpemUgKyAnJSd9KTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG4gIFxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwbScgOiAnYW0nO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBJbnRlcnZhbEdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2ludGVydmFsR3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJ2YWwgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5pbnRlcnZhbENvdW50O1xyXG4gICAgICAgIHZhciB0aWNrc2l6ZSA9IDEwMCAvIHRpY2tjb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IEdSSURfVEVNUExBVEUuY3NzKHt3aWR0aDogdGlja3NpemUgKyAnJSd9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBJbnRlcnZhbEdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShJbnRlcnZhbEdyaWREaXJlY3RpdmUuJG5hbWUsIEludGVydmFsR3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicsIFsndG1oLmR5bmFtaWNMb2NhbGUnXSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVySTE4TicpXHJcbiAgLnByb3ZpZGVyKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgWyd0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXInLCBmdW5jdGlvbiAodG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyKSB7XHJcblxyXG4gICAgdmFyIGRlZmF1bHRDb25maWc6IGFueSAvKiBUT0RPIHR5cGUgKi8gPSB7XHJcbiAgICAgIGRveXM6IHsnZGUtZGUnOiA0LCAnZW4tZ2InOiA0LCAnZW4tdXMnOiA2LCAnZnItZnInOiA0fSxcclxuICAgICAgbGFuZzoge1xyXG4gICAgICAgICdkZS1kZSc6IHthZGROZXc6ICdIaW56dWbDvGdlbid9LFxyXG4gICAgICAgICdlbi1nYic6IHthZGROZXc6ICdBZGQnfSxcclxuICAgICAgICAnZW4tdXMnOiB7YWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2ZyLWZyJzoge2FkZE5ldzogJ0Fqb3V0ZXInfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG5cclxuICAgICAgaWYgKGNvbmZpZyAmJiBhbmd1bGFyLmlzT2JqZWN0KGNvbmZpZykpIHtcclxuICAgICAgICBhbmd1bGFyLm1lcmdlKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybikge1xyXG4gICAgICAgICAgdG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyLmxvY2FsZUxvY2F0aW9uUGF0dGVybihkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJHJvb3RTY29wZScsICckbG9jYWxlJywgJ3RtaER5bmFtaWNMb2NhbGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2FsZSwgdG1oRHluYW1pY0xvY2FsZSkge1xyXG5cclxuICAgICAgdmFyIG1vbWVudExvY2FsZUNhY2hlID0ge307XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMYW5nKCkge1xyXG4gICAgICAgIHZhciBrZXkgPSAkbG9jYWxlLmlkO1xyXG4gICAgICAgIGlmICghbW9tZW50TG9jYWxlQ2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgbW9tZW50TG9jYWxlQ2FjaGVba2V5XSA9IGdldE1vbWVudExvY2FsZShrZXkpO1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkLCBtb21lbnRMb2NhbGVDYWNoZVtrZXldLmxvY2FsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UganVzdCBuZWVkIGZldyBtb21lbnQgbG9jYWwgaW5mb3JtYXRpb25cclxuICAgICAgZnVuY3Rpb24gZ2V0TW9tZW50TG9jYWxlKGtleSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5MT0NBTEVfQ0hBTkdFRCwgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnNldEhvdmVyRWxlbWVudFdpZHRoKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICB0aGlzLnNldEhvdmVyRWxlbWVudFdpZHRoKCk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBsZWZ0ID0gZS5wYWdlWCAtIGVsT2ZmWCAtIHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCAvIDI7XHJcbiAgICAgIHZhciBzbmFwcGVkID0gdGhpcy52YWxUb1BpeGVsKHRoaXMucGl4ZWxUb1ZhbChsZWZ0KSk7XHJcblxyXG4gICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiBzbmFwcGVkICsgJ3B4J1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmQgPiB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbTtcclxuXHJcbiAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgaXRlbS5zY2hlZHVsZXMucHVzaCh7XHJcbiAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgZW5kOiBlbmRcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZW1lbnRPZmZzZXRYKGVsZW06IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgcmV0dXJuIGVsZW1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICByZXR1cm4gc2NoZWR1bGUuc3RhcnQgLyB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAqIDEwMCArICclJztcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBnZXRTbG90V2lkdGgoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+KSB7XHJcbiAgICByZXR1cm4gKHNjaGVkdWxlLmVuZCAtIHNjaGVkdWxlLnN0YXJ0KSAvIHRoaXMuY29uZmlnLm1heFZhbHVlICogMTAwICsgJyUnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuYXR0cignbm8tYWRkJykpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHRoaXMuc2l6ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRIb3ZlckVsZW1lbnRXaWR0aCgpIHtcclxuICAgIGxldCB3aWR0aCA9IHRoaXMudmFsVG9QaXhlbCh0aGlzLnNpemUpO1xyXG5cclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICB3aWR0aDogYCR7d2lkdGh9cHhgXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB2YWxUb1BpeGVsKHZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcGVyY2VudCA9IHZhbCAvIHRoaXMuY29uZmlnLmludGVydmFsQ291bnQgLyB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggKyAwLjUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICBtb3VzZVNjcm9sbChlbGVtZW50LCAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB6b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd0aW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBjb25zdCBzdGFuZGFyZEZvcm1hdDogc3RyaW5nID0gJ2g6bW1BJztcclxuICAgICAgICBjb25zdCBtaWxpdGFyeUZvcm1hdDogc3RyaW5nID0gJ0hIOm1tJztcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBtb21lbnQtZHVyYXRpb24tZm9ybWF0IHBhY2thZ2UgYWx3YXlzIG91dHB1dHMgbWlsaXRhcnkgdGltZSwgKGl0IGNvbnZlcnRzIGEgZHVyYXRpb24gdG8gYSB0aW1lIHN0cmluZywgbm90IGEgdGltZSBvZiBkYXkpIHNvIHdlJ2xsIG5lZWQgdG8gZ3JhYiB0aGF0IGFuZCB0aGVuIGNvbnZlcnRcclxuICAgICAgICAgICAgbGV0IG1pbGl0YXJ5VGltZSA9IG1vbWVudC5kdXJhdGlvbihtaW51dGVzLCAnbWludXRlcycpLmZvcm1hdChtaWxpdGFyeUZvcm1hdCwgeyB0cmltOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQobWlsaXRhcnlUaW1lLCBtaWxpdGFyeUZvcm1hdCkuZm9ybWF0KHN0YW5kYXJkRm9ybWF0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBsb2NhbGVTZXJ2aWNlOiBhbnkgIC8qIFRPRE8gdHlwZSAqL1xyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM7XHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPiB9KSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zID0ge1xyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJG1vZGVsQ2hhbmdlTGlzdGVuZXJzOiAoKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykgPT4gdm9pZClbXTtcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuZGVmYXVsdE9wdGlvbnMubGFiZWxzID0gdGhpcy5sb2NhbGVTZXJ2aWNlLmdldExhbmcoKTtcclxuXHJcbiAgICAvLyBXaWxsIGhhbmcgb3VyIG1vZGVsIGNoYW5nZSBsaXN0ZW5lcnNcclxuICAgIHRoaXMuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgbW9kZWwgaXRlbXNcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiB0aGlzLml0ZW1zLCAobmV3SXRlbXMpID0+IHRoaXMub25Nb2RlbENoYW5nZShuZXdJdGVtcykpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTGlzdGVuIHRvICRsb2NhbGUgY2hhbmdlIChicm91Z2h0IGJ5IGV4dGVybmFsIG1vZHVsZSB3ZWVrbHlTY2hlZHVsZXJJMThOKVxyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkxPQ0FMRV9DSEFOR0VELCBmdW5jdGlvbiAoZSwgbGFiZWxzKSB7XHJcbiAgICAgIGlmICh0aGlzLmNvbmZpZykge1xyXG4gICAgICAgIHRoaXMuY29uZmlnLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UoYW5ndWxhci5jb3B5KHRoaXMuaXRlbXMsIFtdKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zKTogSVdlZWtseVNjaGVkdWxlckNvbmZpZyB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHJlc3VsdDogSVdlZWtseVNjaGVkdWxlckNvbmZpZyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHsgaW50ZXJ2YWw6IGludGVydmFsLCBtYXhWYWx1ZTogbWludXRlc0luRGF5LCBob3VyQ291bnQ6IGhvdXJzSW5EYXksIGludGVydmFsQ291bnQ6IGludGVydmFsQ291bnQgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb2RlbENoYW5nZShpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPltdKSB7XHJcbiAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgaWYgKGl0ZW1zKSB7XHJcblxyXG4gICAgICAvLyBDaGVjayBpdGVtcyBhcmUgaW4gYW4gQXJyYXlcclxuICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgdGhyb3cgJ1lvdSBzaG91bGQgdXNlIHdlZWtseS1zY2hlZHVsZXIgZGlyZWN0aXZlIHdpdGggYW4gQXJyYXkgb2YgaXRlbXMnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XHJcblxyXG4gICAgICAvLyBJZiBpbiBtdWx0aVNsaWRlciBtb2RlLCBlbnN1cmUgYSBzY2hlZHVsZSBhcnJheSBpcyBwcmVzZW50IG9uIGVhY2ggaXRlbVxyXG4gICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgIHZhciBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcyAmJiBzY2hlZHVsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtzY2hlZHVsZXNbMF1dO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgY29uZmlndXJhdGlvblxyXG4gICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBGaW5hbGx5LCBydW4gdGhlIHN1YiBkaXJlY3RpdmVzIGxpc3RlbmVyc1xyXG4gICAgICB0aGlzLiRtb2RlbENoYW5nZUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xyXG4gICAgICAgIGxpc3RlbmVyKHRoaXMuY29uZmlnKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGl0ZW1zOiAnPScsXHJcbiAgICBvcHRpb25zOiAnPScsXHJcbiAgICBvbkNoYW5nZTogJyYnXHJcbiAgfTtcclxuICBcclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCJjbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSAkY29udGFpbmVyRWw6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+O1xyXG4gIHByaXZhdGUgaXRlbUluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgcmVzaXplRGlyZWN0aW9uSXNTdGFydDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxudW1iZXI+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGVJbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGVcclxuICApIHtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLnNjaGVkdWxlLmVuZFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuXHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRwYXJzZXJzLnB1c2goKHVpKSA9PiB7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuc3RhcnQgPSB1aS5zdGFydDtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5lbmQgPSB1aS5lbmQ7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5uZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuTE9DQUxFX0NIQU5HRUQsICgpID0+IHtcclxuICAgICAgLy8gU2ltcGxlIGNoYW5nZSBvYmplY3QgcmVmZXJlbmNlIHNvIHRoYXQgbmdNb2RlbCB0cmlnZ2VycyBmb3JtYXR0aW5nICYgcmVuZGVyaW5nXHJcbiAgICAgIHRoaXMuc2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkodGhpcy5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjYW5SZW1vdmUoKSB7XHJcbiAgICByZXR1cm4gIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuaXRlbS5lZGl0YWJsZSkgfHwgdGhpcy5pdGVtLmVkaXRhYmxlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAvLyBhZGRpbmcgbmV3IHNsb3QgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtZXJnZU92ZXJsYXBzKCkge1xyXG4gICAgbGV0IHNjaGVkdWxlID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgLy8gbW9kZWwgaXMgaW5zaWRlIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuZW5kICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLnN0YXJ0KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgZWxzZSBpZiAoc2NoZWR1bGUuZW5kID49IGVsLmVuZCAmJiBzY2hlZHVsZS5zdGFydCA8PSBlbC5zdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgIGVsc2UgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5lbmQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChlbC5zdGFydCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBlbC5lbmRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy4kY29udGFpbmVyRWxbMF0uY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPikge1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZShwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5waXhlbFRvVmFsKHBpeGVsKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgIGVuZDogdWkuZW5kXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG5cclxuICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgIHN0YXJ0OiB1aS5zdGFydCxcclxuICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLmF0dHIoJ25vLWFkZCcsICd0cnVlJyk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5zY2hlZHVsZS5lbmRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8bnVtYmVyPikge1xyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHVwZGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZXJDdHJsLm9uQ2hhbmdlKHtcclxuICAgICAgaXRlbUluZGV4OiB0aGlzLml0ZW1JbmRleCxcclxuICAgICAgc2NoZWR1bGVJbmRleDogdGhpcy5zY2hlZHVsZUluZGV4LFxyXG4gICAgICBzY2hlZHVsZVZhbHVlOiB0aGlzLm5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBpdGVtSW5kZXg6ICc8JyxcclxuICAgIHNjaGVkdWxlSW5kZXg6ICc8JyxcclxuICAgIGl0ZW06ICc9J1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ153ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">{{multiSliderCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule),\r\n                 width: multiSliderCtrl.getSlotWidth(schedule) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow timestamps"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid class="grid-container"></hourly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><interval-grid class="grid-container striped" no-text></interval-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);