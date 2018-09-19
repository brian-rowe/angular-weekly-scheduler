angular.module('demoApp', ['br.weeklyScheduler'])
    .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {
        $scope.model = {
            options: {
                buttonClasses: ['wow!'],
                createItem: function (day, schedules) {
                    return {
                        day: day,
                        schedules: schedules,
                    };
                },
                defaultValue: false,
                editSlot: function (schedule) {
                    return $q.when(schedule);
                },
                interval: 1,
                onChange: function (isValid) {
                },
                restrictionExplanations: {
                    maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                }
            }
        };
        $scope.model2 = angular.copy($scope.model);
        $scope.model2.options.fillEmptyWithDefault = true;
        $scope.model2.options.interval = 15;
        $scope.model2.options.maxTimeSlot = 900;
        $scope.model2.options.saveScheduler = function () {
            $scope.adapterTwoResult = $scope.adapterTwo.getSnapshot();
            return $q.when();
        };
        $scope.model.options.nullEnds = true;
        $scope.adapter = new DemoAdapter([
            // {
            //   day: Days.Saturday,
            //   start: 1380,
            //   end: null,
            //   value: true
            // },
            {
                day: 6 /* Sunday */,
                start: 600,
                end: null,
                value: true
            },
            {
                day: 0 /* Monday */,
                start: 720,
                end: null,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 60,
                end: null,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 30,
                end: null,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 0,
                end: null,
                value: true
            }
        ]);
        $scope.adapterTwo = new DemoAdapter([
            {
                day: 6 /* Sunday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 6 /* Sunday */,
                start: 720,
                end: 1440,
                value: false
            },
            {
                day: 0 /* Monday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 3 /* Thursday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 5 /* Saturday */,
                start: 0,
                end: 720,
                value: true
            }
        ]);
        $scope.saveAll = function () {
            $scope.result = JSON.stringify($scope.adapter.getSnapshot()) + JSON.stringify($scope.adapterTwo.getSnapshot());
        };
    }]);
/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
var DemoAdapter = /** @class */ (function () {
    function DemoAdapter(initialData) {
        this.initialData = initialData;
        this.items = [];
    }
    DemoAdapter.prototype.getSnapshot = function () {
        return Array.prototype.concat.apply([], this.items.map(function (item) { return item.schedules.map(function (schedule) { return schedule; }); }));
    };
    DemoAdapter.prototype.customModelToWeeklySchedulerRange = function (range) {
        return range;
    };
    return DemoAdapter;
}());
angular.module('br.weeklyScheduler', ['ngWeeklySchedulerTemplates']);
/** @internal */
var AdapterService = /** @class */ (function () {
    function AdapterService(groupService, itemFactory) {
        this.groupService = groupService;
        this.itemFactory = itemFactory;
    }
    AdapterService.prototype.getItemsFromAdapter = function (config, adapter) {
        var result = [];
        if (adapter) {
            var schedules = adapter.initialData.map(function (data) { return adapter.customModelToWeeklySchedulerRange(data); });
            var groupedSchedules = this.groupService.groupSchedules(schedules);
            for (var key in groupedSchedules) {
                var item = this.itemFactory.createItem(config, parseInt(key, 10), groupedSchedules[key]);
                result.push(item);
            }
        }
        return result;
    };
    AdapterService.$name = 'brWeeklySchedulerAdapterService';
    AdapterService.$inject = [
        'brWeeklySchedulerGroupService',
        'brWeeklySchedulerItemFactory'
    ];
    return AdapterService;
}());
angular
    .module('br.weeklyScheduler')
    .service(AdapterService.$name, AdapterService);
/** @internal */
var ConfigurationService = /** @class */ (function () {
    function ConfigurationService() {
    }
    ConfigurationService.prototype.getConfiguration = function (options) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;
        var defaultOptions = this.getDefaultOptions();
        var userOptions = angular.extend(defaultOptions, options);
        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: minutesInDay,
            hourCount: hoursInDay,
            intervalCount: intervalCount,
        });
        return result;
    };
    ConfigurationService.prototype.getDefaultOptions = function () {
        return {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            monoSchedule: false,
            onChange: function () { return angular.noop(); },
            onRemove: function () { return angular.noop(); },
            restrictionExplanations: {
                maxTimeSlot: function (value) { return "Max time slot length: " + value; },
                fullCalendar: 'For this calendar, every day must be completely full of schedules.',
                monoSchedule: 'This calendar may only have one time slot per day',
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.'
            }
        };
    };
    ConfigurationService.$name = 'brWeeklySchedulerConfigurationService';
    return ConfigurationService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ConfigurationService.$name, ConfigurationService);
/** @internal */
var ConflictingOptionsService = /** @class */ (function () {
    function ConflictingOptionsService() {
    }
    ConflictingOptionsService.prototype.getConflictingOptions = function (options) {
        if (options.fullCalendar && options.fillEmptyWithDefault) {
            return "Options 'fullCalendar' & 'fillEmptyWithDefault' are mutually exclusive.";
        }
        if (options.fillEmptyWithDefault && !angular.isDefined(options.defaultValue)) {
            return "If using option 'fillEmptyWithDefault', you must also provide 'defaultValue.'";
        }
        return '';
    };
    ConflictingOptionsService.$name = 'brWeeklySchedulerConflictingOptionsService';
    return ConflictingOptionsService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ConflictingOptionsService.$name, ConflictingOptionsService);
/** @internal */
var DragService = /** @class */ (function () {
    function DragService(endAdjusterService, nullEndWidth, rangeFactory) {
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
        this.rangeFactory = rangeFactory;
    }
    DragService.prototype.getDragRangeFromSchedule = function (config, schedule) {
        return this.rangeFactory.createRange(config, {
            day: schedule.day,
            start: schedule.start,
            end: config.nullEnds ?
                this.endAdjusterService.adjustEndForView(config, schedule.start + this.nullEndWidth) :
                this.endAdjusterService.adjustEndForView(config, schedule.end),
            value: schedule.value
        });
    };
    DragService.$name = 'brWeeklySchedulerDragService';
    DragService.$inject = [
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory'
    ];
    return DragService;
}());
angular
    .module('br.weeklyScheduler')
    .service(DragService.$name, DragService);
/**
 * This helps reduce code duplication
 * This is used as a substitute for jQuery to keep dependencies minimal
 */
/** @internal */
var ElementOffsetService = /** @class */ (function () {
    function ElementOffsetService() {
    }
    ElementOffsetService.prototype.left = function ($element) {
        return $element[0].getBoundingClientRect().left;
    };
    ElementOffsetService.prototype.right = function ($element) {
        return $element[0].getBoundingClientRect().right;
    };
    ElementOffsetService.$name = 'brWeeklySchedulerElementOffsetService';
    return ElementOffsetService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ElementOffsetService.$name, ElementOffsetService);
/** @internal */
var EndAdjusterService = /** @class */ (function () {
    function EndAdjusterService() {
    }
    EndAdjusterService.prototype.adjustEndForModel = function (config, end) {
        if (end === config.maxValue) {
            return 0;
        }
        return end;
    };
    EndAdjusterService.prototype.adjustEndForView = function (config, end) {
        if (end === 0) {
            return config.maxValue;
        }
        return end;
    };
    EndAdjusterService.$name = 'brWeeklySchedulerEndAdjusterService';
    return EndAdjusterService;
}());
angular
    .module('br.weeklyScheduler')
    .service(EndAdjusterService.$name, EndAdjusterService);
/** When using the 'fillEmptyWithDefault' option, this service will be used to construct the correct calendar for server submission */
/** @internal */
var FillEmptyWithDefaultService = /** @class */ (function () {
    function FillEmptyWithDefaultService(endAdjusterService, rangeFactory) {
        this.endAdjusterService = endAdjusterService;
        this.rangeFactory = rangeFactory;
    }
    FillEmptyWithDefaultService.prototype.fill = function (item, config) {
        var schedules = item.schedules;
        if (!schedules.length) {
            return [this.getEmptySchedule(item, config)];
        }
        return this.getFilledSchedules(schedules, config);
    };
    FillEmptyWithDefaultService.prototype.getEmptySchedule = function (item, config) {
        return this.rangeFactory.createRange(config, {
            day: item.day,
            start: 0,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getEndSchedule = function (lastSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: lastSchedule.day,
            start: lastSchedule.end,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getStartSchedule = function (firstSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: firstSchedule.day,
            start: 0,
            end: firstSchedule.start,
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getFilledSchedulesForSingleSchedule = function (schedule, config) {
        var schedules = [schedule];
        if (!this.scheduleTouchesStart(schedule, config)) {
            schedules.push(this.getStartSchedule(schedule, config));
        }
        if (!this.scheduleTouchesEnd(schedule, config)) {
            schedules.push(this.getEndSchedule(schedule, config));
        }
        return this.getSortedSchedules(schedules);
    };
    FillEmptyWithDefaultService.prototype.getFilledSchedules = function (schedules, config) {
        schedules = this.getSortedSchedules(schedules);
        if (schedules.length === 1) {
            return this.getFilledSchedulesForSingleSchedule(schedules[0], config);
        }
        var len = schedules.length - 1;
        // 2 at a time
        for (var i = 0; i < len; i++) {
            var currentSchedule = schedules[i];
            var nextSchedule = schedules[i + 1];
            var isFirstLoop = i == 0;
            if (isFirstLoop && !this.scheduleTouchesStart(currentSchedule, config)) {
                var startSchedule = this.getStartSchedule(currentSchedule, config);
                schedules.push(startSchedule);
            }
            if (!this.schedulesTouch(currentSchedule, nextSchedule)) {
                var newSchedule = this.getNewSchedule(currentSchedule, nextSchedule, config);
                schedules.push(newSchedule);
            }
            var isLastLoop = i == len - 1;
            if (isLastLoop && !this.scheduleTouchesEnd(nextSchedule, config)) {
                var endSchedule = this.getEndSchedule(nextSchedule, config);
                schedules.push(endSchedule);
                break;
            }
        }
        return this.getSortedSchedules(schedules);
    };
    FillEmptyWithDefaultService.prototype.getNewSchedule = function (currentSchedule, nextSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: currentSchedule.day,
            start: currentSchedule.end,
            end: nextSchedule.start,
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getSortedSchedules = function (schedules) {
        return schedules.sort(function (a, b) { return a.start - b.start; });
    };
    FillEmptyWithDefaultService.prototype.schedulesTouch = function (earlierSchedule, laterSchedule) {
        return earlierSchedule.end === laterSchedule.start;
    };
    FillEmptyWithDefaultService.prototype.scheduleTouchesStart = function (schedule, config) {
        return schedule.start === 0;
    };
    FillEmptyWithDefaultService.prototype.scheduleTouchesEnd = function (schedule, config) {
        return schedule.end === this.endAdjusterService.adjustEndForModel(config, config.maxValue);
    };
    FillEmptyWithDefaultService.$name = 'brWeeklySchedulerFillEmptyWithDefaultService';
    FillEmptyWithDefaultService.$inject = [
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerRangeFactory'
    ];
    return FillEmptyWithDefaultService;
}());
angular
    .module('br.weeklyScheduler')
    .service(FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService);
/** @internal */
var FullCalendarDirective = /** @class */ (function () {
    function FullCalendarDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brFullCalendar) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    FullCalendarDirective.Factory = function () {
        var directive = function (validator) {
            return new FullCalendarDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerFullCalendarValidatorService'];
        return directive;
    };
    FullCalendarDirective.$name = 'brFullCalendar';
    return FullCalendarDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(FullCalendarDirective.$name, FullCalendarDirective.Factory());
/** @internal */
var GhostSlotController = /** @class */ (function () {
    function GhostSlotController($element) {
        this.$element = $element;
    }
    GhostSlotController.prototype.$postLink = function () {
        this.multiSliderCtrl.$hoverElement = this.$element;
    };
    GhostSlotController.$name = 'brGhostSlotController';
    GhostSlotController.$controllerAs = 'ghostSlotCtrl';
    GhostSlotController.$inject = [
        '$element'
    ];
    return GhostSlotController;
}());
/** @internal */
var GhostSlotComponent = /** @class */ (function () {
    function GhostSlotComponent() {
        this.controller = GhostSlotController.$name;
        this.controllerAs = GhostSlotController.$controllerAs;
        this.require = {
            multiSliderCtrl: '^brMultiSlider'
        };
        this.template = "\n        <ng-transclude class=\"fullWidth\"></ng-transclude>\n    ";
        this.transclude = true;
    }
    GhostSlotComponent.$name = 'brGhostSlot';
    return GhostSlotComponent;
}());
angular.module('br.weeklyScheduler')
    .controller(GhostSlotController.$name, GhostSlotController)
    .component(GhostSlotComponent.$name, new GhostSlotComponent());
/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small
 */
/** @internal */
var GroupService = /** @class */ (function () {
    function GroupService() {
    }
    GroupService.prototype.groupSchedules = function (schedules) {
        var seed = {};
        var result = schedules.reduce(function (reducer, currentSchedule, index, array) {
            var key = currentSchedule.day;
            if (!reducer[key]) {
                reducer[key] = [];
            }
            reducer[key].push(currentSchedule);
            return reducer;
        }, seed);
        return result;
    };
    GroupService.$name = 'brWeeklySchedulerGroupService';
    return GroupService;
}());
angular
    .module('br.weeklyScheduler')
    .service(GroupService.$name, GroupService);
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
            var mousedownEvent = 'mousedown touchstart';
            var mousemoveEvent = 'mousemove touchmove';
            var mouseupEvent = 'mouseup touchend';
            element.on(mousedownEvent, function (event) {
                x = getPageX(event);
                // Prevent default dragging of selected content
                event.preventDefault();
                // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
                event.stopPropagation();
                $document.on(mousemoveEvent, mousemove);
                $document.on(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$apply(scope.ondragstart({ event: event }));
                }
            });
            function getPageX(event) {
                return event.pageX || getTouches(event)[0].pageX;
            }
            function getTouches(event) {
                if (event.originalEvent) {
                    if (event.originalEvent.touches && event.originalEvent.touches.length) {
                        return event.originalEvent.touches;
                    }
                    else if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
                        return event.originalEvent.changedTouches;
                    }
                }
                if (!event.touches) {
                    event.touches = [event.originalEvent];
                }
                return event.touches;
            }
            function mousemove(event) {
                var pageX = getPageX(event);
                var delta = pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.$apply(scope.ondrag({ delta: delta, event: event }));
                }
            }
            function mouseup() {
                $document.unbind(mousemoveEvent, mousemove);
                $document.unbind(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstop)) {
                    scope.$apply(scope.ondragstop());
                }
            }
        };
    }
    HandleDirective.Factory = function () {
        var directive = function ($document) { return new HandleDirective($document); };
        directive.$inject = ['$document'];
        return directive;
    };
    HandleDirective.$name = 'brHandle';
    return HandleDirective;
}());
angular.module('br.weeklyScheduler')
    .directive(HandleDirective.$name, HandleDirective.Factory());
/** @internal */
var HourlyGridDirective = /** @class */ (function () {
    function HourlyGridDirective() {
        var _this = this;
        this.restrict = 'E';
        this.require = '^brWeeklyScheduler';
        this.GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
        };
    }
    HourlyGridDirective.prototype.handleClickEvent = function (child, hourCount, idx, scope) {
        child.bind('click', function () {
            scope.$apply(function () {
                scope.$emit("clickOnACell" /* CLICK_ON_A_CELL */, {
                    nbElements: hourCount,
                    idx: idx
                });
            });
        });
    };
    HourlyGridDirective.prototype.doGrid = function (scope, element, attrs, config) {
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = this.GRID_TEMPLATE.clone();
        // Clean element
        element.empty();
        // Stripe it by hour
        element.addClass('striped');
        for (var i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                var currentHour = i % 12;
                var meridiem = i >= 12 ? 'p' : 'a';
                child.text("" + (currentHour || '12') + meridiem);
            }
            else {
                var numIntervalsInTick = 60 / config.interval;
                var intervalPercentage = 100 / numIntervalsInTick;
                for (var j = 0; j < numIntervalsInTick; j++) {
                    var grandChild = this.GRID_TEMPLATE.clone();
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
    HourlyGridDirective.$name = 'brHourlyGrid';
    return HourlyGridDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
/** @internal */
var MaxTimeSlotDirective = /** @class */ (function () {
    function MaxTimeSlotDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMaxTimeSlot) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MaxTimeSlotDirective.Factory = function () {
        var directive = function (validator) {
            return new MaxTimeSlotDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMaxTimeSlotValidatorService'];
        return directive;
    };
    MaxTimeSlotDirective.$name = 'brMaxTimeSlot';
    return MaxTimeSlotDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(MaxTimeSlotDirective.$name, MaxTimeSlotDirective.Factory());
/** @internal */
var MissingDaysService = /** @class */ (function () {
    function MissingDaysService(dayMap, itemFactory) {
        this.dayMap = dayMap;
        this.itemFactory = itemFactory;
    }
    /**
     * The scheduler should always show all days, even if it was not passed any schedules for that day
     */
    MissingDaysService.prototype.fillItems = function (config, items) {
        var _this = this;
        var result = [];
        angular.forEach(this.dayMap, function (day, stringKey) {
            var key = parseInt(stringKey, 10);
            var filteredItems = items.filter(function (item) { return item.day === key; });
            var item = filteredItems.length ? filteredItems[0] : null;
            if (!item) {
                result.push(_this.itemFactory.createItem(config, key, []));
            }
            else {
                // If the item DID exist just set the label
                item.label = day;
                result.push(item);
            }
        });
        return angular.copy(result).sort(function (a, b) { return a.day > b.day ? 1 : -1; });
    };
    MissingDaysService.$name = 'brWeeklySchedulerMissingDaysService';
    MissingDaysService.$inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerItemFactory'
    ];
    return MissingDaysService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MissingDaysService.$name, MissingDaysService);
/** @internal */
var MonoScheduleDirective = /** @class */ (function () {
    function MonoScheduleDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMonoSchedule) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MonoScheduleDirective.Factory = function () {
        var directive = function (validator) {
            return new MonoScheduleDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMonoScheduleValidatorService'];
        return directive;
    };
    MonoScheduleDirective.$name = 'brMonoSchedule';
    return MonoScheduleDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(MonoScheduleDirective.$name, MonoScheduleDirective.Factory());
/** @internal */
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $q, elementOffsetService, endAdjusterService, nullEndWidth, rangeFactory) {
        this.$element = $element;
        this.$q = $q;
        this.elementOffsetService = elementOffsetService;
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
        this.rangeFactory = rangeFactory;
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.addSlot = function (start, end) {
        var _this = this;
        start = this.normalizeValue(start, 0, end);
        end = this.normalizeValue(end, start, this.config.maxValue);
        // Sanity check -- don't add a slot with an end before the start
        // caveat: ok to continue if nullEnds is true and end is null
        if (end && !this.config.nullEnds && end <= start) {
            return this.$q.when();
        }
        if (this.config.nullEnds) {
            end = null;
        }
        var schedule = {
            day: this.item.day,
            start: start,
            end: end,
            value: this.config.defaultValue
        };
        if (angular.isFunction(this.config.editSlot)) {
            return this.config.editSlot(schedule).then(function (editedSchedule) {
                _this.addScheduleToItem(editedSchedule);
            });
        }
        else {
            return this.$q.when(this.addScheduleToItem(schedule));
        }
    };
    /** Expand ghost while dragging in it */
    MultiSliderController.prototype.adjustGhost = function (event) {
        var mouseValue = this.getValAtMousePosition(event);
        var existingLeftValue = this.startingGhostValues.left;
        var updatedLeftValue;
        var updatedRightValue;
        if (mouseValue < existingLeftValue) { // user is dragging left
            updatedLeftValue = mouseValue;
            updatedRightValue = existingLeftValue;
        }
        else { // user is dragging right
            updatedLeftValue = existingLeftValue;
            updatedRightValue = mouseValue;
        }
        this.ghostValues = {
            left: this.normalizeGhostValue(updatedLeftValue),
            right: this.normalizeGhostValue(updatedRightValue)
        };
    };
    /** Move ghost around while not dragging */
    MultiSliderController.prototype.positionGhost = function (e) {
        var val = this.getValAtMousePosition(e);
        this.startingGhostValues = {
            left: val,
            right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
        };
        this.ghostValues = angular.copy(this.startingGhostValues);
    };
    MultiSliderController.prototype.addScheduleToItem = function (schedule) {
        var range = this.rangeFactory.createRange(this.config, schedule);
        this.item.addSchedule(range);
        this.merge(range);
    };
    MultiSliderController.prototype.onGhostWrapperMouseDown = function (event) {
        this.renderGhost = true;
        this.positionGhost(event);
    };
    MultiSliderController.prototype.onGhostWrapperMouseMove = function (event) {
        // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
        if (this.config.nullEnds) {
            return;
        }
        if (this.renderGhost) {
            this.adjustGhost(event);
        }
    };
    MultiSliderController.prototype.onGhostWrapperMouseUp = function () {
        var _this = this;
        this.renderGhost = false;
        if (this.item.canAddSchedule()) {
            this.addSlot(this.ghostValues.left, this.ghostValues.right).then(function () {
                _this.ngModelCtrl.$setDirty();
                _this.config.onChange();
            });
        }
    };
    /**
     * Determine if the schedule is able to be edited
     */
    MultiSliderController.prototype.canEdit = function (schedule) {
        var isEditable = this.item.isEditable();
        var hasEditFunction = angular.isFunction(this.config.editSlot);
        return isEditable && hasEditFunction;
    };
    /**
     * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
     * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
     */
    MultiSliderController.prototype.canRenderGhost = function () {
        // This one needs to come first, otherwise renderGhost being set to true would override the protection against addt'l slots in nullEnd calendars
        if (this.config.nullEnds) {
            return this.renderGhost && this.item.hasNoSchedules();
        }
        // If you're already dragging the ghost it should never disappear
        if (this.renderGhost) {
            return true;
        }
        if (!this.item.isEditable()) {
            return false;
        }
        return this.renderGhost;
    };
    MultiSliderController.prototype.getMousePosition = function (event) {
        var elementOffsetX = this.elementOffsetService.left(this.$element);
        var left = event.pageX - elementOffsetX;
        return left;
    };
    MultiSliderController.prototype.getValAtMousePosition = function (event) {
        return this.pixelToVal(this.getMousePosition(event));
    };
    /**
     * Perform an external action to bring up an editor for a schedule
     */
    MultiSliderController.prototype.editSchedule = function (schedule) {
        var _this = this;
        if (this.canEdit(schedule)) {
            schedule.$isEditing = true;
            this.config.editSlot(schedule).then(function (newSchedule) {
                var range = _this.rangeFactory.createRange(_this.config, newSchedule);
                if (_this.shouldDelete(range)) {
                    _this.item.removeSchedule(schedule);
                }
                else {
                    var premergeSchedule = angular.copy(range);
                    _this.merge(range);
                    // If merging mutated the schedule further, then updateSchedule would have already been called
                    // This is so that edits that don't trigger merges still trigger onChange,
                    // but edits that do trigger merges don't trigger it twice
                    if (angular.equals(premergeSchedule, range)) {
                        schedule.update(range);
                    }
                }
                _this.ngModelCtrl.$setDirty();
            }).catch(function () {
                // do nothing except eat the unhandled rejection error
            }).finally(function () {
                schedule.$isEditing = false;
            });
        }
    };
    MultiSliderController.prototype.getSlotLeft = function (start) {
        var underlyingInterval = this.getUnderlyingInterval(start);
        return underlyingInterval.offsetLeft + 'px';
    };
    MultiSliderController.prototype.getSlotRight = function (start, end) {
        // If there is a null end, place the end of the slot two hours away from the beginning.
        if (this.config.nullEnds && end === null) {
            end = start + this.nullEndWidth;
        }
        // An end of 0 should display allll the way to the right, up to the edge
        end = this.endAdjusterService.adjustEndForView(this.config, end);
        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        var underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);
        var offsetRight = underlyingInterval.offsetLeft + underlyingInterval.offsetWidth;
        var containerLeft = this.elementOffsetService.left(this.$element);
        var containerRight = this.elementOffsetService.right(this.$element);
        var result = containerRight - containerLeft - offsetRight;
        return result + 'px';
    };
    MultiSliderController.prototype.getUnderlyingInterval = function (val) {
        // Slightly hacky but does the job. TODO ?
        val = this.normalizeIntervalValue(val);
        return this.element.parentElement.querySelector("[rel='" + val + "']");
    };
    MultiSliderController.prototype.shouldDelete = function (schedule) {
        if (schedule.$isDeleting) {
            return true;
        }
        if (this.config.fillEmptyWithDefault && schedule.value === this.config.defaultValue) {
            return true;
        }
        return false;
    };
    MultiSliderController.prototype.merge = function (schedule) {
        this.item.mergeSchedule(schedule);
    };
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    MultiSliderController.prototype.normalizeIntervalValue = function (value) {
        // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
        var rightmost = this.config.maxValue - this.config.interval;
        return this.normalizeValue(value, 0, rightmost);
    };
    MultiSliderController.prototype.normalizeGhostValue = function (value) {
        return this.normalizeValue(value, 0, this.config.maxValue);
    };
    MultiSliderController.prototype.normalizeValue = function (value, minValue, maxValue) {
        if (value < minValue) {
            return minValue;
        }
        if (value > maxValue) {
            return maxValue;
        }
        return value;
    };
    MultiSliderController.$name = 'brMultiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$q',
        'brWeeklySchedulerElementOffsetService',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory'
    ];
    return MultiSliderController;
}());
/** @internal */
var MultiSliderComponent = /** @class */ (function () {
    function MultiSliderComponent() {
        this.bindings = {
            config: '<',
            item: '=ngModel'
        };
        this.controller = MultiSliderController.$name;
        this.controllerAs = MultiSliderController.$controllerAs;
        this.require = {
            ngModelCtrl: 'ngModel'
        };
        this.templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
    }
    MultiSliderComponent.$name = 'brMultiSlider';
    return MultiSliderComponent;
}());
angular.module('br.weeklyScheduler')
    .controller(MultiSliderController.$name, MultiSliderController)
    .component(MultiSliderComponent.$name, new MultiSliderComponent());
/** @internal */
var NullEndDirective = /** @class */ (function () {
    function NullEndDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                return _this.validator.validate(modelValue.schedules, modelValue.config);
            };
        };
        this.require = 'ngModel';
    }
    NullEndDirective.Factory = function () {
        var directive = function (validator) {
            return new NullEndDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerNullEndValidatorService'];
        return directive;
    };
    NullEndDirective.$name = 'brNullEnd';
    return NullEndDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(NullEndDirective.$name, NullEndDirective.Factory());
/** @internal */
var OverlapDirective = /** @class */ (function () {
    function OverlapDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                return _this.validator.validate(modelValue.schedules, modelValue.config);
            };
        };
        this.require = 'ngModel';
    }
    OverlapDirective.Factory = function () {
        var directive = function (validator) {
            return new OverlapDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerOverlapValidatorService'];
        return directive;
    };
    OverlapDirective.$name = 'brOverlap';
    return OverlapDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(OverlapDirective.$name, OverlapDirective.Factory());
/** @internal */
var OverlapService = /** @class */ (function () {
    function OverlapService(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    OverlapService.prototype.getOverlapState = function (config, current, other) {
        var currentStart = current.start;
        var currentEnd = this.endAdjusterService.adjustEndForView(config, current.end);
        var otherStart = other.start;
        var otherEnd = this.endAdjusterService.adjustEndForView(config, other.end);
        if (otherEnd >= currentEnd && otherStart <= currentStart) {
            return 1 /* CurrentIsInsideOther */;
        }
        if (currentEnd >= otherEnd && currentStart <= otherStart) {
            return 2 /* CurrentCoversOther */;
        }
        if (otherEnd > currentStart && otherEnd <= currentEnd) {
            return 3 /* OtherEndIsInsideCurrent */;
        }
        if (otherStart >= currentStart && otherStart < currentEnd) {
            return 4 /* OtherStartIsInsideCurrent */;
        }
        if (otherEnd === currentStart && otherEnd <= currentEnd) {
            return 5 /* OtherEndIsCurrentStart */;
        }
        if (otherStart === currentEnd && otherStart <= currentEnd) {
            return 6 /* OtherStartIsCurrentEnd */;
        }
        return 0 /* NoOverlap */;
    };
    OverlapService.$name = 'brWeeklySchedulerOverlapService';
    OverlapService.$inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];
    return OverlapService;
}());
angular
    .module('br.weeklyScheduler')
    .service(OverlapService.$name, OverlapService);
/** When using the 'fillEmptyWithDefault' option, this service will be used to delete the default schedules for correct display on the calendar */
/** @internal */
var PurgeDefaultService = /** @class */ (function () {
    function PurgeDefaultService() {
    }
    PurgeDefaultService.prototype.purge = function (schedules, config) {
        var lastIndex = schedules.length - 1;
        // loop in reverse to avoid messing up indices as we go
        for (var i = lastIndex; i >= 0; i--) {
            if (schedules[i].value === config.defaultValue) {
                schedules.splice(i, 1);
            }
        }
        return schedules;
    };
    PurgeDefaultService.$name = 'brWeeklySchedulerPurgeDefaultService';
    return PurgeDefaultService;
}());
angular
    .module('br.weeklyScheduler')
    .service(PurgeDefaultService.$name, PurgeDefaultService);
/** @internal */
var ResizeServiceProvider = /** @class */ (function () {
    function ResizeServiceProvider() {
        this.customResizeEvents = [];
        this.serviceInitialized = false;
        this.$get.$inject = [
            '$rootScope',
            '$window'
        ];
    }
    ResizeServiceProvider.prototype.setCustomResizeEvents = function (events) {
        this.customResizeEvents = events;
    };
    ResizeServiceProvider.prototype.$get = function ($rootScope, $window) {
        var _this = this;
        return {
            initialize: function () {
                if (_this.serviceInitialized) {
                    return;
                }
                $window.addEventListener('resize', function () {
                    // addEventListener exists outside of angular so we have to $apply the change
                    $rootScope.$apply(function () {
                        $rootScope.$broadcast("resized" /* RESIZED */);
                    });
                });
                if (_this.customResizeEvents) {
                    _this.customResizeEvents.forEach(function (event) {
                        $rootScope.$on(event, function () {
                            $rootScope.$broadcast("resized" /* RESIZED */);
                        });
                    });
                }
                _this.serviceInitialized = true;
            }
        };
    };
    ResizeServiceProvider.$name = 'br.weeklyScheduler.resizeService';
    return ResizeServiceProvider;
}());
angular
    .module('br.weeklyScheduler')
    .provider(ResizeServiceProvider.$name, ResizeServiceProvider)
    .run([ResizeServiceProvider.$name, function (resizeService) { return resizeService.initialize(); }]);
/** @internal */
var RestrictionExplanationsController = /** @class */ (function () {
    function RestrictionExplanationsController($filter) {
        this.$filter = $filter;
        this.explanations = {};
    }
    RestrictionExplanationsController.prototype.$onInit = function () {
        var config = this.schedulerCtrl.config;
        if (config.maxTimeSlot) {
            var maxTimeSlot = this.$filter('brWeeklySchedulerMinutesAsText')(config.maxTimeSlot);
            this.explanations["maxTimeSlot" /* MaxTimeSlot */] = config.restrictionExplanations.maxTimeSlot(maxTimeSlot);
        }
        if (config.fullCalendar) {
            this.explanations["fullCalendar" /* FullCalendar */] = config.restrictionExplanations.fullCalendar;
        }
        if (config.monoSchedule) {
            this.explanations["monoSchedule" /* MonoSchedule */] = config.restrictionExplanations.monoSchedule;
        }
        if (config.nullEnds) {
            this.explanations["nullEnd" /* NullEnd */] = config.restrictionExplanations.nullEnds;
        }
    };
    RestrictionExplanationsController.$controllerAs = 'restrictionExplanationsCtrl';
    RestrictionExplanationsController.$name = 'brWeeklySchedulerRestrictionExplanationsController';
    RestrictionExplanationsController.$inject = ['$filter'];
    return RestrictionExplanationsController;
}());
/** @internal */
var RestrictionExplanationsComponent = /** @class */ (function () {
    function RestrictionExplanationsComponent() {
        this.controller = RestrictionExplanationsController.$name;
        this.controllerAs = RestrictionExplanationsController.$controllerAs;
        this.require = {
            schedulerCtrl: '^brWeeklyScheduler'
        };
        this.template = "\n        <div class=\"srow explanations\" ng-class=\"{ violation: restrictionExplanationsCtrl.schedulerCtrl.formController.$error[key] }\" ng-repeat=\"(key, explanation) in restrictionExplanationsCtrl.explanations\">\n            {{ explanation }}\n        </div>\n    ";
    }
    RestrictionExplanationsComponent.$name = 'brRestrictionExplanations';
    return RestrictionExplanationsComponent;
}());
angular
    .module('br.weeklyScheduler')
    .component(RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsController.$name, RestrictionExplanationsController);
/**
 * Runs custom validators whenever the model changes
 */
/** @internal */
var RevalidateDirective = /** @class */ (function () {
    function RevalidateDirective() {
        this.link = function (scope, element, attrs, ngModelCtrl) {
            scope.$watch(attrs.ngModel, function () {
                ngModelCtrl.$validate();
            }, true);
        };
        this.require = 'ngModel';
    }
    RevalidateDirective.Factory = function () {
        var directive = function () {
            return new RevalidateDirective();
        };
        return directive;
    };
    RevalidateDirective.$name = 'brRevalidate';
    return RevalidateDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(RevalidateDirective.$name, RevalidateDirective.Factory());
/** @internal */
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
        this.zoomService.resetZoom(element);
        this.$scope.$on("clickOnACell" /* CLICK_ON_A_CELL */, function (e, data) {
            _this.zoomService.zoomInACell(element, e, data);
        });
        this.$scope.$on("resetZoom" /* RESET_ZOOM */, function (e) {
            _this.zoomService.resetZoom(element);
        });
        this.$scope.$on("zoomIn" /* ZOOM_IN */, function (e) {
            _this.zoomService.zoomIn(element);
        });
    };
    ScheduleAreaContainerController.$name = 'brWeeklySchedulerScheduleAreaContainerController';
    ScheduleAreaContainerController.$inject = [
        '$element',
        '$scope',
        'brWeeklySchedulerScrollService',
        'brWeeklySchedulerZoomService'
    ];
    return ScheduleAreaContainerController;
}());
/** @internal */
var ScheduleAreaContainerComponent = /** @class */ (function () {
    function ScheduleAreaContainerComponent() {
        this.controller = ScheduleAreaContainerController.$name;
        this.transclude = true;
        this.template = "<ng-transclude></ng-transclude>";
    }
    ScheduleAreaContainerComponent.$name = 'brScheduleAreaContainer';
    return ScheduleAreaContainerComponent;
}());
angular.module('br.weeklyScheduler')
    .controller(ScheduleAreaContainerController.$name, ScheduleAreaContainerController)
    .component(ScheduleAreaContainerComponent.$name, new ScheduleAreaContainerComponent());
/** @internal */
var FullCalendarValidatorService = /** @class */ (function () {
    function FullCalendarValidatorService() {
    }
    Object.defineProperty(FullCalendarValidatorService.prototype, "error", {
        get: function () {
            return "fullCalendar" /* FullCalendar */;
        },
        enumerable: true,
        configurable: true
    });
    FullCalendarValidatorService.prototype.validate = function (schedules, config) {
        if (!config.fullCalendar) {
            return true;
        }
        // When this option is true we should enforce that there are no gaps in the schedules
        var len = schedules.length;
        // If there are no schedules, it automatically fails.
        if (!len) {
            return false;
        }
        // If there was only one item we should check that it spans the whole range
        if (len === 1) {
            var schedule = schedules[0];
            return this.validateStartAtMinValue(schedule.start) && this.validateEndAtMaxValue(schedule.end, config);
        }
        // If more, compare two at a time until the end
        var loopLen = len - 1;
        var result = true;
        // Sort by start time first
        var sortedSchedules = schedules.sort(function (a, b) { return a.start > b.start ? 1 : -1; });
        for (var i = 0; i < loopLen; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            // Validate that the first item lands at 0
            if (i === 0 && !this.validateStartAtMinValue(current.start)) {
                return false;
            }
            // Validate that the last item lands at maxValue
            if (i === loopLen - 1 && !this.validateEndAtMaxValue(next.end, config)) {
                return false;
            }
            result = result && current.end === next.start;
        }
        return result;
    };
    FullCalendarValidatorService.prototype.validateStartAtMinValue = function (start) {
        return start === 0;
    };
    FullCalendarValidatorService.prototype.validateEndAtMaxValue = function (end, config) {
        return (end || config.maxValue) === config.maxValue;
    };
    FullCalendarValidatorService.$name = 'brWeeklySchedulerFullCalendarValidatorService';
    return FullCalendarValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(FullCalendarValidatorService.$name, FullCalendarValidatorService);
/** @internal */
var MaxTimeSlotValidatorService = /** @class */ (function () {
    function MaxTimeSlotValidatorService(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    Object.defineProperty(MaxTimeSlotValidatorService.prototype, "error", {
        get: function () {
            return "maxTimeSlot" /* MaxTimeSlot */;
        },
        enumerable: true,
        configurable: true
    });
    MaxTimeSlotValidatorService.prototype.validate = function (schedules, config) {
        var _this = this;
        var maxTimeSlot = config.maxTimeSlot;
        if (!maxTimeSlot) {
            return true;
        }
        return !schedules.some(function (s) { return s.value !== config.defaultValue && _this.endAdjusterService.adjustEndForView(config, s.end) - s.start > maxTimeSlot; });
    };
    MaxTimeSlotValidatorService.$name = 'brWeeklySchedulerMaxTimeSlotValidatorService';
    MaxTimeSlotValidatorService.$inject = ['brWeeklySchedulerEndAdjusterService'];
    return MaxTimeSlotValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
/** @internal */
var MonoScheduleValidatorService = /** @class */ (function () {
    function MonoScheduleValidatorService() {
    }
    Object.defineProperty(MonoScheduleValidatorService.prototype, "error", {
        get: function () {
            return "monoSchedule" /* MonoSchedule */;
        },
        enumerable: true,
        configurable: true
    });
    /** Important note -- this does not validate that only one schedule exists per item, but rather that only one NON-DEFAULT schedule exists per item. */
    MonoScheduleValidatorService.prototype.validate = function (schedules, config) {
        if (!config.monoSchedule) {
            return true;
        }
        // If a default value is defined, schedules with default values don't count -- one non-default schedule per item.
        var schedulesToValidate;
        if (angular.isDefined(config.defaultValue)) {
            schedulesToValidate = schedules.filter(function (schedule) { return schedule.value !== config.defaultValue; });
        }
        else {
            schedulesToValidate = schedules;
        }
        // only allowed empty or 1 schedule per item
        return !schedulesToValidate.length || schedulesToValidate.length === 1;
    };
    MonoScheduleValidatorService.$name = 'brWeeklySchedulerMonoScheduleValidatorService';
    return MonoScheduleValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MonoScheduleValidatorService.$name, MonoScheduleValidatorService);
/** @internal */
var NullEndScheduleValidatorService = /** @class */ (function () {
    function NullEndScheduleValidatorService() {
    }
    Object.defineProperty(NullEndScheduleValidatorService.prototype, "error", {
        get: function () {
            return "nullEnd" /* NullEnd */;
        },
        enumerable: true,
        configurable: true
    });
    NullEndScheduleValidatorService.prototype.validate = function (schedules, config) {
        if (config.nullEnds) {
            return schedules.length <= 1 && schedules.every(function (schedule) { return schedule.end === null; });
        }
        else {
            return schedules.every(function (schedule) { return schedule.end !== null; });
        }
    };
    NullEndScheduleValidatorService.$name = 'brWeeklySchedulerNullEndValidatorService';
    return NullEndScheduleValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(NullEndScheduleValidatorService.$name, NullEndScheduleValidatorService);
/** @internal */
var OverlapValidatorService = /** @class */ (function () {
    function OverlapValidatorService(overlapService) {
        this.overlapService = overlapService;
    }
    Object.defineProperty(OverlapValidatorService.prototype, "error", {
        get: function () {
            return "overlap" /* Overlap */;
        },
        enumerable: true,
        configurable: true
    });
    OverlapValidatorService.prototype.validate = function (schedules, config) {
        // Compare two at a time until the end
        var len = schedules.length;
        var result = true;
        for (var i = 0; i < len - 1; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            var valuesMatch = current.value === next.value;
            if (!valuesMatch) {
                var overlapState = this.overlapService.getOverlapState(config, current, next);
                result = result && [0 /* NoOverlap */, 6 /* OtherStartIsCurrentEnd */, 5 /* OtherEndIsCurrentStart */].indexOf(overlapState) > -1;
            }
        }
        return result;
    };
    OverlapValidatorService.$name = 'brWeeklySchedulerOverlapValidatorService';
    OverlapValidatorService.$inject = [
        'brWeeklySchedulerOverlapService'
    ];
    return OverlapValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(OverlapValidatorService.$name, OverlapValidatorService);
/** @internal */
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
    ScrollService.$name = 'brWeeklySchedulerScrollService';
    ScrollService.$inject = [
        'brWeeklySchedulerZoomService'
    ];
    return ScrollService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ScrollService.$name, ScrollService);
/** @internal */
var MinutesAsTextFilter = /** @class */ (function () {
    function MinutesAsTextFilter() {
    }
    MinutesAsTextFilter.Factory = function () {
        return function (minutes) {
            var result = "";
            var hours = Math.floor(minutes / 60);
            var hasHours = hours > 0;
            if (hasHours) {
                result += hours + " hours";
            }
            var min = minutes % 60;
            var hasMinutes = min > 0;
            if (hasMinutes) {
                if (hasHours) {
                    result += ' ';
                }
                result += min + " minute" + (min > 1 ? 's' : '');
            }
            if (!result) {
                result = 'none';
            }
            return result;
        };
    };
    MinutesAsTextFilter.$name = 'brWeeklySchedulerMinutesAsText';
    return MinutesAsTextFilter;
}());
angular
    .module('br.weeklyScheduler')
    .filter(MinutesAsTextFilter.$name, [MinutesAsTextFilter.Factory]);
/** @internal */
var TimeOfDayFilter = /** @class */ (function () {
    function TimeOfDayFilter() {
    }
    TimeOfDayFilter.Factory = function () {
        return function (minutes) {
            var hours = Math.floor(minutes / 60);
            var remainingMinutes = (minutes - (hours * 60)).toString();
            var meridiem = hours > 11 && hours < 24 ? 'P' : 'A';
            if (remainingMinutes.length == 1) {
                remainingMinutes = '0' + remainingMinutes;
            }
            var displayHours = hours % 12 || 12;
            return displayHours + ":" + remainingMinutes + meridiem;
        };
    };
    TimeOfDayFilter.$name = 'brWeeklySchedulerTimeOfDay';
    return TimeOfDayFilter;
}());
angular
    .module('br.weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
/** @internal */
var TimeRangeComponent = /** @class */ (function () {
    function TimeRangeComponent() {
        this.bindings = {
            schedule: '<'
        };
        this.controller = TimeRangeController.$name;
        this.controllerAs = TimeRangeController.$controllerAs;
        this.template = "\n        <span ng-if=\"timeRangeCtrl.hasStart && timeRangeCtrl.hasEnd\">{{ timeRangeCtrl.schedule.start | brWeeklySchedulerTimeOfDay }}-{{ timeRangeCtrl.schedule.end | brWeeklySchedulerTimeOfDay }}</span>\n        <span ng-if=\"timeRangeCtrl.hasStart && !timeRangeCtrl.hasEnd\">{{ timeRangeCtrl.schedule.start | brWeeklySchedulerTimeOfDay }} until</span>\n    ";
    }
    TimeRangeComponent.$name = 'brTimeRange';
    return TimeRangeComponent;
}());
/** @internal */
var TimeRangeController = /** @class */ (function () {
    function TimeRangeController() {
    }
    TimeRangeController.prototype.$onInit = function () {
        this.hasStart = angular.isDefined(this.schedule.start);
        this.hasEnd = angular.isDefined(this.schedule.end) && this.schedule.end !== null;
    };
    TimeRangeController.$controllerAs = 'timeRangeCtrl';
    TimeRangeController.$name = 'brTimeRangeController';
    return TimeRangeController;
}());
angular
    .module('br.weeklyScheduler')
    .component(TimeRangeComponent.$name, new TimeRangeComponent())
    .controller(TimeRangeController.$name, TimeRangeController);
/** @internal */
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($element, $scope, $timeout, adapterService, configurationService, conflictingOptionsService, missingDaysService) {
        this.$element = $element;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.adapterService = adapterService;
        this.configurationService = configurationService;
        this.conflictingOptionsService = conflictingOptionsService;
        this.missingDaysService = missingDaysService;
        this.invalidMessage = '';
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        this.config = this.configurationService.getConfiguration(this.options);
        this.buildItemsFromAdapter();
        this.watchAdapter();
        this.watchHoverClass();
    };
    WeeklySchedulerController.prototype.$postLink = function () {
        var _this = this;
        this.$timeout(function () {
            _this.invalidMessage = _this.getInvalidMessage();
        });
    };
    WeeklySchedulerController.prototype.getInvalidMessage = function () {
        var conflictingOptions = this.conflictingOptionsService.getConflictingOptions(this.options);
        if (conflictingOptions) {
            return conflictingOptions;
        }
        if (this.hasInvalidSchedule()) {
            return 'One or more of the schedules is invalid! Please contact service.';
        }
    };
    WeeklySchedulerController.prototype.hasInvalidSchedule = function () {
        return this.formController.$invalid;
    };
    WeeklySchedulerController.prototype.buildItems = function (items) {
        this.items = this.missingDaysService.fillItems(this.config, items);
        this.items.forEach(function (item) { return item.mergeOverlaps(); });
        this.items = this.purgeItems(this.items);
        // keep a reference on the adapter so we can pull it out later
        this.adapter.items = this.items;
        // keep a copy of the items in case we need to rollback
        this._originalItems = angular.copy(this.items);
    };
    WeeklySchedulerController.prototype.buildItemsFromAdapter = function () {
        var items = this.adapterService.getItemsFromAdapter(this.config, this.adapter);
        return this.buildItems(items);
    };
    WeeklySchedulerController.prototype.purgeItems = function (items) {
        if (this.config.fillEmptyWithDefault) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                item.purgeDefaultSchedules();
            }
        }
        return items;
    };
    WeeklySchedulerController.prototype.prepareItems = function (items) {
        if (this.config.fillEmptyWithDefault) {
            for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                var item = items_2[_i];
                item.fillEmptySlotsWithDefaultSchedules();
            }
        }
        return items;
    };
    WeeklySchedulerController.prototype.resetZoom = function () {
        this.$scope.$broadcast("resetZoom" /* RESET_ZOOM */);
    };
    WeeklySchedulerController.prototype.zoomIn = function () {
        this.$scope.$broadcast("zoomIn" /* ZOOM_IN */);
    };
    WeeklySchedulerController.prototype.rollback = function () {
        this.buildItems(this._originalItems);
        this.formController.$setPristine();
    };
    WeeklySchedulerController.prototype.save = function () {
        var _this = this;
        this.items = this.prepareItems(this.items);
        return this.config.saveScheduler().then(function () {
            _this.items = _this.purgeItems(_this.items);
            _this.formController.$setPristine();
        });
    };
    WeeklySchedulerController.prototype.watchAdapter = function () {
        var _this = this;
        this.$scope.$watch(function () {
            return _this.adapter;
        }, function () {
            _this.buildItemsFromAdapter();
        });
    };
    WeeklySchedulerController.prototype.watchHoverClass = function () {
        var _this = this;
        var pulseClass = 'pulse';
        var pulseSelector = "." + pulseClass;
        this.$scope.$watch(function () { return _this.hoverClass; }, function () {
            _this.$element.find(pulseSelector).removeClass(pulseClass);
            if (_this.hoverClass) {
                _this.$element.find("." + _this.hoverClass).addClass(pulseClass);
            }
        });
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'brWeeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$element',
        '$scope',
        '$timeout',
        'brWeeklySchedulerAdapterService',
        'brWeeklySchedulerConfigurationService',
        'brWeeklySchedulerConflictingOptionsService',
        'brWeeklySchedulerMissingDaysService'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
            adapter: '<',
            hoverClass: '<',
            options: '='
        };
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.require = {
            formController: 'form'
        };
        this.templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
    }
    WeeklySchedulerComponent.$name = 'brWeeklyScheduler';
    return WeeklySchedulerComponent;
}());
angular.module('br.weeklyScheduler')
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
var DayMap = /** @class */ (function () {
    function DayMap() {
    }
    DayMap.$name = 'brWeeklySchedulerDayMap';
    DayMap.value = {
        0: 'Mon',
        1: 'Tue',
        2: 'Wed',
        3: 'Thur',
        4: 'Fri',
        5: 'Sat',
        6: 'Sun'
    };
    return DayMap;
}());
angular
    .module('br.weeklyScheduler')
    .constant(DayMap.$name, DayMap.value);
/** @internal */
var NullEndWidth = /** @class */ (function () {
    function NullEndWidth() {
    }
    NullEndWidth.$name = 'brWeeklySchedulerNullEndWidth';
    NullEndWidth.value = 120;
    return NullEndWidth;
}());
angular
    .module('br.weeklyScheduler')
    .constant(NullEndWidth.$name, NullEndWidth.value);
/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
var WeeklySchedulerItem = /** @class */ (function () {
    function WeeklySchedulerItem(config, item, endAdjusterService, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.config = config;
        this.item = item;
        this.endAdjusterService = endAdjusterService;
        this.fillEmptyWithDefaultService = fillEmptyWithDefaultService;
        this.overlapService = overlapService;
        this.purgeDefaultService = purgeDefaultService;
        this.rangeFactory = rangeFactory;
        this.day = item.day;
        this.editable = item.editable;
        this.label = item.label;
        this.schedules = item.schedules.map(function (schedule) { return rangeFactory.createRange(config, schedule); });
    }
    WeeklySchedulerItem.prototype.addSchedule = function (schedule) {
        this.schedules.push(schedule);
    };
    WeeklySchedulerItem.prototype.canAddSchedule = function () {
        if (this.config.nullEnds) {
            return this.hasNoSchedules();
        }
        else {
            return true;
        }
    };
    WeeklySchedulerItem.prototype.hasNoSchedules = function () {
        return this.schedules.length === 0;
    };
    WeeklySchedulerItem.prototype.isEditable = function () {
        return !angular.isDefined(this.editable) || this.editable;
    };
    WeeklySchedulerItem.prototype.fillEmptySlotsWithDefaultSchedules = function () {
        this.schedules = this.fillEmptyWithDefaultService.fill(this, this.config);
    };
    WeeklySchedulerItem.prototype.mergeOverlaps = function () {
        var _this = this;
        do {
            this.schedules.forEach(function (schedule) { return _this.mergeOverlapsForSchedule(schedule); });
        } while (this.needsOverlapsMerged());
    };
    WeeklySchedulerItem.prototype.mergeSchedule = function (schedule) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlapsForSchedule(schedule);
        this.mergeOverlaps();
    };
    WeeklySchedulerItem.prototype.purgeDefaultSchedules = function () {
        this.schedules = this.purgeDefaultService.purge(this.schedules, this.config);
    };
    WeeklySchedulerItem.prototype.removeSchedule = function (schedule) {
        var schedules = this.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
        this.config.onRemove();
    };
    // Overlap handlers
    WeeklySchedulerItem.prototype.getOverlapHandler = function (overlapState) {
        var _this = this;
        var overlapHandlers = (_a = {},
            _a[0 /* NoOverlap */] = function (current, other) { return _this.handleNoOverlap(current, other); },
            _a[1 /* CurrentIsInsideOther */] = function (current, other) { return _this.handleCurrentIsInsideOther(current, other); },
            _a[2 /* CurrentCoversOther */] = function (current, other) { return _this.handleCurrentCoversOther(current, other); },
            _a[3 /* OtherEndIsInsideCurrent */] = function (current, other) { return _this.handleOtherEndIsInsideCurrent(current, other); },
            _a[4 /* OtherStartIsInsideCurrent */] = function (current, other) { return _this.handleOtherStartIsInsideCurrent(current, other); },
            _a[5 /* OtherEndIsCurrentStart */] = function (current, other) { return _this.handleOtherEndIsCurrentStart(current, other); },
            _a[6 /* OtherStartIsCurrentEnd */] = function (current, other) { return _this.handleOtherStartIsCurrentEnd(current, other); },
            _a);
        return overlapHandlers[overlapState];
        var _a;
    };
    WeeklySchedulerItem.prototype.handleCurrentCoversOther = function (current, other) {
        this.removeSchedule(other);
    };
    WeeklySchedulerItem.prototype.handleCurrentIsInsideOther = function (current, other) {
        if (current.hasSameValueAs(other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeSchedule(other);
            current.update({
                day: other.day,
                start: other.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            // Just remove 'current'
            this.removeSchedule(current);
        }
    };
    WeeklySchedulerItem.prototype.handleNoOverlap = function (current, other) {
        // Do nothing
    };
    WeeklySchedulerItem.prototype.handleOtherEndIsInsideCurrent = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);
            current.update({
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        }
        else {
            other.update({
                day: other.day,
                start: other.start,
                end: current.start,
                value: current.value
            });
        }
    };
    WeeklySchedulerItem.prototype.handleOtherStartIsInsideCurrent = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);
            current.update({
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            other.update({
                day: other.day,
                start: current.end,
                end: other.end,
                value: other.value
            });
        }
    };
    WeeklySchedulerItem.prototype.handleOtherEndIsCurrentStart = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.handleOtherEndIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    WeeklySchedulerItem.prototype.handleOtherStartIsCurrentEnd = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.handleOtherStartIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    // End overlap handlers
    WeeklySchedulerItem.prototype.mergeOverlapsForSchedule = function (schedule) {
        var _this = this;
        var schedules = this.schedules;
        schedules.forEach(function (el) {
            if (!el.equals(schedule)) {
                var overlapState = _this.overlapService.getOverlapState(_this.config, schedule, el);
                var overlapHandler = _this.getOverlapHandler(overlapState);
                overlapHandler(schedule, el);
            }
        });
    };
    WeeklySchedulerItem.prototype.needsOverlapsMerged = function () {
        var len = this.schedules.length;
        // Compare two at a time
        for (var i = 0; i < len - 1; i += 1) {
            var current = this.schedules[i];
            var next = this.schedules[i + 1];
            if (current.hasSameValueAs(next)) {
                var overlapState = this.overlapService.getOverlapState(this.config, current, next);
                return [5 /* OtherEndIsCurrentStart */, 6 /* OtherStartIsCurrentEnd */].indexOf(overlapState) > -1;
            }
        }
    };
    return WeeklySchedulerItem;
}());
/** @internal */
var WeeklySchedulerItemFactory = /** @class */ (function () {
    function WeeklySchedulerItemFactory(dayMap, endAdjusterService, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.dayMap = dayMap;
        this.endAdjusterService = endAdjusterService;
        this.fillEmptyWithDefaultService = fillEmptyWithDefaultService;
        this.overlapService = overlapService;
        this.purgeDefaultService = purgeDefaultService;
        this.rangeFactory = rangeFactory;
    }
    WeeklySchedulerItemFactory.prototype.createItem = function (config, day, schedules) {
        var result;
        var builder = config.createItem(day, schedules);
        result = angular.extend(builder, { label: this.dayMap[day] });
        return new WeeklySchedulerItem(config, result, this.endAdjusterService, this.fillEmptyWithDefaultService, this.overlapService, this.purgeDefaultService, this.rangeFactory);
    };
    WeeklySchedulerItemFactory.$name = 'brWeeklySchedulerItemFactory';
    WeeklySchedulerItemFactory.$inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerFillEmptyWithDefaultService',
        'brWeeklySchedulerOverlapService',
        'brWeeklySchedulerPurgeDefaultService',
        'brWeeklySchedulerRangeFactory'
    ];
    return WeeklySchedulerItemFactory;
}());
angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory);
/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
var WeeklySchedulerRange = /** @class */ (function () {
    function WeeklySchedulerRange(config, schedule, endAdjusterService) {
        this.config = config;
        this.endAdjusterService = endAdjusterService;
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
    }
    Object.defineProperty(WeeklySchedulerRange.prototype, "duration", {
        get: function () {
            return this.end - this.start;
        },
        enumerable: true,
        configurable: true
    });
    WeeklySchedulerRange.prototype.equals = function (other) {
        return angular.equals(this, other);
    };
    WeeklySchedulerRange.prototype.hasSameValueAs = function (other) {
        return this.value === other.value;
    };
    WeeklySchedulerRange.prototype.update = function (updatedSchedule) {
        var updatedStart = this.updateStart(updatedSchedule.start);
        var updatedEnd = this.updateEnd(updatedSchedule.end);
        if (updatedStart || updatedEnd) {
            this.config.onChange();
        }
    };
    WeeklySchedulerRange.prototype.updateEnd = function (updatedEnd) {
        if (this.canUpdateEnd(updatedEnd)) {
            this.end = this.endAdjusterService.adjustEndForModel(this.config, updatedEnd);
            return true;
        }
        return false;
    };
    WeeklySchedulerRange.prototype.updateStart = function (updatedStart) {
        if (this.canUpdateStart(updatedStart)) {
            this.start = updatedStart;
            return true;
        }
        return false;
    };
    WeeklySchedulerRange.prototype.canUpdateEnd = function (updatedEnd) {
        var changed = this.end !== updatedEnd;
        var newEndBeforeOrAtMax = updatedEnd <= this.config.maxValue;
        var newEndAfterOrAtExistingStart = updatedEnd >= this.start + 1;
        return changed && newEndBeforeOrAtMax && newEndAfterOrAtExistingStart;
    };
    WeeklySchedulerRange.prototype.canUpdateStart = function (updatedStart) {
        var changed = this.start !== updatedStart;
        var newStartBeforeOrAtExistingEnd = updatedStart <= this.endAdjusterService.adjustEndForView(this.config, this.end) - 1;
        var newStartAfterOrAtMin = updatedStart >= 0;
        return changed && newStartBeforeOrAtExistingEnd && newStartAfterOrAtMin;
    };
    return WeeklySchedulerRange;
}());
/** @internal */
var WeeklySchedulerRangeFactory = /** @class */ (function () {
    function WeeklySchedulerRangeFactory(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    WeeklySchedulerRangeFactory.prototype.createRange = function (config, schedule) {
        return new WeeklySchedulerRange(config, schedule, this.endAdjusterService);
    };
    WeeklySchedulerRangeFactory.$name = 'brWeeklySchedulerRangeFactory';
    WeeklySchedulerRangeFactory.$inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];
    return WeeklySchedulerRangeFactory;
}());
angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerRangeFactory.$name, WeeklySchedulerRangeFactory);
/** @internal */
var WeeklySlotController = /** @class */ (function () {
    function WeeklySlotController(dragService) {
        this.dragService = dragService;
    }
    WeeklySlotController.prototype.getDragStartValues = function () {
        return this.dragService.getDragRangeFromSchedule(this.config, this.schedule);
    };
    WeeklySlotController.prototype.editSelf = function () {
        this.editSchedule({ schedule: this.schedule });
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        var ui = this.schedule;
        var delta = this.getDelta({ pixel: pixel });
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var newEnd = this.config.nullEnds ? null : Math.round(newStart + this.valuesOnDragStart.duration);
        this.schedule.update({
            day: ui.day,
            start: newStart,
            end: newEnd,
            value: ui.value
        });
    };
    WeeklySlotController.prototype.endDrag = function () {
        // Did the user actually move or resize the slot??
        var changed = !this.valuesOnDragStart.equals(this.getDragStartValues());
        this.schedule.$isActive = false;
        if (changed) {
            this.ngModelCtrl.$setDirty();
            this.item.mergeSchedule(this.schedule);
        }
        else {
            this.editSelf();
        }
    };
    WeeklySlotController.prototype.resizeStart = function (pixel) {
        var delta = this.getDelta({ pixel: pixel });
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        if (this.schedule.updateStart(newStart)) {
            this.config.onChange();
        }
    };
    WeeklySlotController.prototype.resizeEnd = function (pixel) {
        var delta = this.getDelta({ pixel: pixel });
        var newEnd = Math.round(this.valuesOnDragStart.end + delta);
        if (this.schedule.updateEnd(newEnd)) {
            this.config.onChange();
        }
    };
    WeeklySlotController.prototype.startDrag = function () {
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        'brWeeklySchedulerDragService',
    ];
    return WeeklySlotController;
}());
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            item: '<',
            schedule: '=ngModel',
            editSchedule: '&',
            getDelta: '&'
        };
        this.controller = WeeklySlotController.$name;
        this.controllerAs = WeeklySlotController.$controllerAs;
        this.require = {
            ngModelCtrl: 'ngModel'
        };
        this.templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
    }
    WeeklySlotComponent.$name = 'brWeeklySlot';
    return WeeklySlotComponent;
}());
angular
    .module('br.weeklyScheduler')
    .controller(WeeklySlotController.$name, WeeklySlotController)
    .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
/** @internal */
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
    ZoomService.prototype.getCurrentZoomWidth = function (element) {
        return parseInt(element.querySelector(this.selector).style.width, 10);
    };
    ZoomService.prototype.getZoomElement = function (container) {
        return container.querySelector(this.selector);
    };
    ZoomService.prototype.setZoomWidth = function (element, width) {
        this.getZoomElement(element).style.width = width;
    };
    ZoomService.prototype.resetZoom = function (element) {
        this.setZoomWidth(element, '100%');
        this.broadcastZoomedOutEvent();
    };
    ZoomService.prototype.zoomIn = function (element) {
        // get current zoom level from zoomed element as a percentage
        var zoom = this.getZoomElement(element).style.width;
        // parse to integer & double
        var level = parseInt(zoom, 10) * 2;
        // Convert back to percentage
        this.setZoomWidth(element, level + '%');
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomInACell = function (element, event, data) {
        var elementCount = data.nbElements;
        var i = data.idx;
        var containerWidth = element.offsetWidth;
        var boxesToDisplay = 5;
        var boxWidth = containerWidth / boxesToDisplay;
        var boxesToSkip = 2;
        var gutterSize = boxWidth * boxesToSkip;
        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
        this.setZoomWidth(element, scheduleAreaWidthPercent + '%');
        // All cells of a line have the same size
        element.scrollLeft = i * boxWidth - gutterSize;
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomByScroll = function (element, event, delta) {
        var currentWidth = this.getCurrentZoomWidth(element);
        if ((event.wheelDelta || event.detail) > 0) {
            this.setZoomWidth(element, (currentWidth + 2 * delta) + '%');
            this.broadcastZoomedInEvent();
        }
        else {
            var width = currentWidth - 2 * delta;
            this.setZoomWidth(element, (width > 100 ? width : 100) + '%');
            this.broadcastZoomedOutEvent();
        }
    };
    ZoomService.$name = 'brWeeklySchedulerZoomService';
    ZoomService.$inject = ['$rootScope'];
    return ZoomService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ZoomService.$name, ZoomService);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvQWRhcHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9jb25maWd1cmF0aW9uL0NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvY29uZmxpY3Rpbmctb3B0aW9ucy9Db25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy9EcmFnU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L0VsZW1lbnRPZmZzZXRTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZW5kLWFkanVzdGVyL0VuZEFkanVzdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ZpbGwtZW1wdHktd2l0aC1kZWZhdWx0L0ZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2Z1bGwtY2FsZW5kYXIvRnVsbENhbGVuZGFyRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ2hvc3Qtc2xvdC9naG9zdC1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ3JvdXAtYnkvR3JvdXBTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL0hhbmRsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL0hvdXJseUdyaWREaXJlY3RpdmUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tYXgtdGltZS1zbG90L01heFRpbWVTbG90RGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbWlzc2luZy1kYXlzL01pc3NpbmdEYXlzU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vbm8tc2NoZWR1bGUvTW9ub1NjaGVkdWxlRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9udWxsLWVuZC9OdWxsRW5kRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvb3ZlcmxhcC9PdmVybGFwRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvb3ZlcmxhcC9PdmVybGFwU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3B1cmdlLWRlZmF1bHQvUHVyZ2VEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9SZXNpemVTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL1Jlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmV2YWxpZGF0ZS9SZXZhbGlkYXRlRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9NYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9OdWxsRW5kVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9PdmVybGFwVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9TY3JvbGxTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9NaW51dGVzQXNUZXh0RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9UaW1lT2ZEYXlGaWx0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lLXJhbmdlL1RpbWVSYW5nZUNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL051bGxFbmRXaWR0aC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9XZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL1dlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1yYW5nZS9XZWVrbHlTY2hlZHVsZXJSYW5nZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItcmFuZ2UvV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL1pvb21TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvYWRhcHRlci9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ludmFsaWQtbWVzc2FnZS9JbnZhbGlkTWVzc2FnZXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2VQcm92aWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJPcHRpb25zLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL0lJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vSVdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDOUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLFFB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QUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0gsSUFBSSxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQW5GTSxpQkFBSyxHQUFHLDhCQUE4QixDQUFDO0lBRXZDLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQWtGcEMsa0JBQUM7Q0FyRkQsQUFxRkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWydici53ZWVrbHlTY2hlZHVsZXInXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRxJywgJyRzY29wZScsICckdGltZW91dCcsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkcTogYW5ndWxhci5JUVNlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBidXR0b25DbGFzc2VzOiBbJ3dvdyEnXSxcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGRheTogZGF5LFxyXG4gICAgICAgICAgICAgIHNjaGVkdWxlczogc2NoZWR1bGVzLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgIGVkaXRTbG90OiBmdW5jdGlvbiAoc2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oc2NoZWR1bGUpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGludGVydmFsOiAxLFxyXG4gICAgICAgICAgb25DaGFuZ2U6IChpc1ZhbGlkKSA9PiB7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgbWF4VGltZVNsb3Q6ICh2YWx1ZSkgPT4gYFNsb3RzIGNhbm5vdCBiZSBsb25nZXIgdGhhbiAke3ZhbHVlfSFgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PlxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyID0gYW5ndWxhci5jb3B5KCRzY29wZS5tb2RlbCk7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5pbnRlcnZhbCA9IDE1O1xyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMubWF4VGltZVNsb3QgPSA5MDA7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMuc2F2ZVNjaGVkdWxlciA9ICgpID0+IHtcclxuICAgICAgICAkc2NvcGUuYWRhcHRlclR3b1Jlc3VsdCA9ICRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCk7XHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsLm9wdGlvbnMubnVsbEVuZHMgPSB0cnVlO1xyXG5cclxuICAgICAgJHNjb3BlLmFkYXB0ZXIgPSBuZXcgRGVtb0FkYXB0ZXIoW1xyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAxMzgwLFxyXG4gICAgICAgIC8vICAgZW5kOiBudWxsLFxyXG4gICAgICAgIC8vICAgdmFsdWU6IHRydWVcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA3MjAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuV2VkbmVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDMwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgXSk7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlclR3byA9IG5ldyBEZW1vQWRhcHRlcihbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDcyMCxcclxuICAgICAgICAgIGVuZDogMTQ0MCxcclxuICAgICAgICAgIHZhbHVlOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5Nb25kYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVHVlc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVGh1cnNkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDcyMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDcyMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuICAgICAgXHJcbiAgICAgICRzY29wZS5zYXZlQWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRzY29wZS5yZXN1bHQgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUuYWRhcHRlci5nZXRTbmFwc2hvdCgpKSArIEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCkpO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4vKiogVGhlIGRhdGEgaXMgYWxyZWFkeSBpbiBhbiBhY2NlcHRhYmxlIGZvcm1hdCBmb3IgdGhlIGRlbW8gc28ganVzdCBwYXNzIGl0IHRocm91Z2ggKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vQWRhcHRlciBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+LCBib29sZWFuPiB7XHJcbiAgcHVibGljIGl0ZW1zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08Ym9vbGVhbj5bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyBpbml0aWFsRGF0YTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPltdLFxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNuYXBzaG90KCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMuaXRlbXMubWFwKGl0ZW0gPT4gaXRlbS5zY2hlZHVsZXMubWFwKHNjaGVkdWxlID0+IHNjaGVkdWxlKSkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShyYW5nZSkge1xyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG4gIH1cclxufVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBBZGFwdGVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJBZGFwdGVyU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyR3JvdXBTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGdyb3VwU2VydmljZTogR3JvdXBTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgaXRlbUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJdGVtc0Zyb21BZGFwdGVyKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBhZGFwdGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8YW55LCBhbnk+KSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoYWRhcHRlcikge1xyXG4gICAgICAgICAgbGV0IHNjaGVkdWxlcyA9IGFkYXB0ZXIuaW5pdGlhbERhdGEubWFwKGRhdGEgPT4gYWRhcHRlci5jdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UoZGF0YSkpO1xyXG4gICAgICAgICAgbGV0IGdyb3VwZWRTY2hlZHVsZXMgPSB0aGlzLmdyb3VwU2VydmljZS5ncm91cFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgXHJcbiAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gZ3JvdXBlZFNjaGVkdWxlcykge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbUZhY3RvcnkuY3JlYXRlSXRlbShjb25maWcsIHBhcnNlSW50KGtleSwgMTApLCBncm91cGVkU2NoZWR1bGVzW2tleV0pO1xyXG4gICAgXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShBZGFwdGVyU2VydmljZS4kbmFtZSwgQWRhcHRlclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIENvbmZpZ3VyYXRpb25TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckNvbmZpZ3VyYXRpb25TZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29uZmlndXJhdGlvbihvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55Pikge1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgMTU7IC8vIG1pbnV0ZXNcclxuICAgICAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICAgICAgdmFyIGludGVydmFsQ291bnQgPSBtaW51dGVzSW5EYXkgLyBpbnRlcnZhbDtcclxuXHJcbiAgICAgICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLmdldERlZmF1bHRPcHRpb25zKCk7XHJcblxyXG4gICAgICAgIHZhciB1c2VyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKHVzZXJPcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICAgICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdE9wdGlvbnMoKTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgICAgICAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBvbkNoYW5nZTogKCkgPT4gYW5ndWxhci5ub29wKCksXHJcbiAgICAgICAgICAgIG9uUmVtb3ZlOiAoKSA9PiBhbmd1bGFyLm5vb3AoKSxcclxuICAgICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHt2YWx1ZX1gLFxyXG4gICAgICAgICAgICAgICAgZnVsbENhbGVuZGFyOiAnRm9yIHRoaXMgY2FsZW5kYXIsIGV2ZXJ5IGRheSBtdXN0IGJlIGNvbXBsZXRlbHkgZnVsbCBvZiBzY2hlZHVsZXMuJyxcclxuICAgICAgICAgICAgICAgIG1vbm9TY2hlZHVsZTogJ1RoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBvbmUgdGltZSBzbG90IHBlciBkYXknLFxyXG4gICAgICAgICAgICAgICAgbnVsbEVuZHM6ICdJdGVtcyBpbiB0aGlzIGNhbGVuZGFyIGRvIG5vdCBoYXZlIGVuZCB0aW1lcy4gU2NoZWR1bGVkIGV2ZW50cyBiZWdpbiBhdCB0aGUgc3RhcnQgdGltZSBhbmQgZW5kIHdoZW4gdGhleSBhcmUgZmluaXNoZWQuJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKENvbmZpZ3VyYXRpb25TZXJ2aWNlLiRuYW1lLCBDb25maWd1cmF0aW9uU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29uZmxpY3RpbmdPcHRpb25zKG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+KSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZnVsbENhbGVuZGFyICYmIG9wdGlvbnMuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBPcHRpb25zICdmdWxsQ2FsZW5kYXInICYgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLmA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCAmJiAhYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgSWYgdXNpbmcgb3B0aW9uICdmaWxsRW1wdHlXaXRoRGVmYXVsdCcsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSAnZGVmYXVsdFZhbHVlLidgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZS4kbmFtZSwgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRHJhZ1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREcmFnUmFuZ2VGcm9tU2NoZWR1bGUoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGNvbmZpZy5udWxsRW5kcyA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHNjaGVkdWxlLmVuZCksXHJcbiAgICAgICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRHJhZ1NlcnZpY2UuJG5hbWUsIERyYWdTZXJ2aWNlKTtcclxuIiwiLyoqXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb25cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgalF1ZXJ5IHRvIGtlZXAgZGVwZW5kZW5jaWVzIG1pbmltYWxcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEVsZW1lbnRPZmZzZXRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgbGVmdCgkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJpZ2h0KCRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbGVtZW50T2Zmc2V0U2VydmljZS4kbmFtZSwgRWxlbWVudE9mZnNldFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEVuZEFkanVzdGVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JNb2RlbChjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSBjb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbmRBZGp1c3RlclNlcnZpY2UuJG5hbWUsIEVuZEFkanVzdGVyU2VydmljZSk7XHJcbiIsIi8qKiBXaGVuIHVzaW5nIHRoZSAnZmlsbEVtcHR5V2l0aERlZmF1bHQnIG9wdGlvbiwgdGhpcyBzZXJ2aWNlIHdpbGwgYmUgdXNlZCB0byBjb25zdHJ1Y3QgdGhlIGNvcnJlY3QgY2FsZW5kYXIgZm9yIHNlcnZlciBzdWJtaXNzaW9uICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBmaWxsKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10ge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgaWYgKCFzY2hlZHVsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbdGhpcy5nZXRFbXB0eVNjaGVkdWxlKGl0ZW0sIGNvbmZpZyldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzKHNjaGVkdWxlcywgY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEVtcHR5U2NoZWR1bGUoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBpdGVtLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RW5kU2NoZWR1bGUobGFzdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBsYXN0U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogbGFzdFNjaGVkdWxlLmVuZCxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbChjb25maWcsIGNvbmZpZy5tYXhWYWx1ZSksXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0YXJ0U2NoZWR1bGUoZmlyc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogZmlyc3RTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgICBlbmQ6IGZpcnN0U2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXNGb3JTaW5nbGVTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gW3NjaGVkdWxlXTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlVG91Y2hlc1N0YXJ0KHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0U3RhcnRTY2hlZHVsZShzY2hlZHVsZSwgY29uZmlnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0RW5kU2NoZWR1bGUoc2NoZWR1bGUsIGNvbmZpZykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXMoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgc2NoZWR1bGVzID0gdGhpcy5nZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGVzWzBdLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIgYXQgYSB0aW1lXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNjaGVkdWxlID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dFNjaGVkdWxlID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc0ZpcnN0TG9vcCA9IGkgPT0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0ZpcnN0TG9vcCAmJiAhdGhpcy5zY2hlZHVsZVRvdWNoZXNTdGFydChjdXJyZW50U2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydFNjaGVkdWxlID0gdGhpcy5nZXRTdGFydFNjaGVkdWxlKGN1cnJlbnRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChzdGFydFNjaGVkdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlc1RvdWNoKGN1cnJlbnRTY2hlZHVsZSwgbmV4dFNjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1NjaGVkdWxlID0gdGhpcy5nZXROZXdTY2hlZHVsZShjdXJyZW50U2NoZWR1bGUsIG5leHRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0xhc3RMb29wID0gaSA9PSBsZW4gLSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTGFzdExvb3AgJiYgIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKG5leHRTY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZFNjaGVkdWxlID0gdGhpcy5nZXRFbmRTY2hlZHVsZShuZXh0U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2goZW5kU2NoZWR1bGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV3U2NoZWR1bGUoY3VycmVudFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBuZXh0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGN1cnJlbnRTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50U2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgICBlbmQ6IG5leHRTY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydCAtIGIuc3RhcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVzVG91Y2goZWFybGllclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBsYXRlclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIGVhcmxpZXJTY2hlZHVsZS5lbmQgPT09IGxhdGVyU2NoZWR1bGUuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVRvdWNoZXNTdGFydChzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUuc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZS5lbmQgPT09IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKGNvbmZpZywgY29uZmlnLm1heFZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS4kbmFtZSwgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyRnVsbENhbGVuZGFyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ickZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bGxDYWxlbmRhckRpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoRnVsbENhbGVuZGFyRGlyZWN0aXZlLiRuYW1lLCBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3RDb250cm9sbGVyJztcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ2dob3N0U2xvdEN0cmwnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG11bHRpU2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG5cclxuICAgIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgdGhpcy5tdWx0aVNsaWRlckN0cmwuJGhvdmVyRWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR2hvc3RTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3QnO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBHaG9zdFNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gR2hvc3RTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHJlcXVpcmUgPSB7XHJcbiAgICAgICAgbXVsdGlTbGlkZXJDdHJsOiAnXmJyTXVsdGlTbGlkZXInXHJcbiAgICB9O1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxuZy10cmFuc2NsdWRlIGNsYXNzPVwiZnVsbFdpZHRoXCI+PC9uZy10cmFuc2NsdWRlPlxyXG4gICAgYDtcclxuXHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxufVxyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoR2hvc3RTbG90Q29udHJvbGxlci4kbmFtZSwgR2hvc3RTbG90Q29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoR2hvc3RTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgR2hvc3RTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKipcclxuICogV2Ugc2hvdWxkIGJlIGFibGUgdG8gY29udmVydCB0aGUgc2NoZWR1bGVzIGJlZm9yZWhhbmQsIHBhc3MganVzdCB0aGUgc2NoZWR1bGVzIGluIGFuZCBoYXZlIHRoaXMgcGFja2FnZSBidWlsZCB0aGUgaXRlbXNcclxuICogVGhpcyBoZWxwcyByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbiBpbiBjbGllbnRzLlxyXG4gKiBUaGlzIGlzIHVzZWQgYXMgYSBzdWJzdGl0dXRlIGZvciBsb2Rhc2guZ3JvdXBCeSB0byBrZWVwIHRoZSBmb290cHJpbnQgc21hbGwgXHJcbiAqL1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHcm91cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyR3JvdXBTZXJ2aWNlJztcclxuXHJcbiAgICBncm91cFNjaGVkdWxlcyhzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKTogeyBba2V5OiBudW1iZXJdOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSB9IHtcclxuICAgICAgICBsZXQgc2VlZDogeyBba2V5OiBudW1iZXJdOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSB9ID0ge307XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSBzY2hlZHVsZXMucmVkdWNlKChyZWR1Y2VyLCBjdXJyZW50U2NoZWR1bGUsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gY3VycmVudFNjaGVkdWxlLmRheTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmVkdWNlcltrZXldKSB7XHJcbiAgICAgICAgICAgICAgICByZWR1Y2VyW2tleV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVkdWNlcltrZXldLnB1c2goY3VycmVudFNjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZWR1Y2VyO1xyXG4gICAgICAgIH0sIHNlZWQpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoR3JvdXBTZXJ2aWNlLiRuYW1lLCBHcm91cFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhhbmRsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JySGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICcmJyxcclxuICAgIG9uZHJhZ3N0b3A6ICcmJyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnJidcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuXHJcbiAgICBsZXQgbW91c2Vkb3duRXZlbnQ6IHN0cmluZyA9ICdtb3VzZWRvd24gdG91Y2hzdGFydCc7XHJcbiAgICBsZXQgbW91c2Vtb3ZlRXZlbnQ6IHN0cmluZyA9ICdtb3VzZW1vdmUgdG91Y2htb3ZlJztcclxuICAgIGxldCBtb3VzZXVwRXZlbnQ6IHN0cmluZyA9ICdtb3VzZXVwIHRvdWNoZW5kJztcclxuXHJcbiAgICBlbGVtZW50Lm9uKG1vdXNlZG93bkV2ZW50LCAoZXZlbnQpID0+IHtcclxuICAgICAgeCA9IGdldFBhZ2VYKGV2ZW50KTtcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIGhhbmRsZXJzIGZyb20gYmVpbmcgZmlyZWQgaWYgdGhleSBhcmUgbmVzdGVkIChvbmx5IHRoZSBvbmUgeW91IGRpcmVjdGx5IGludGVyYWN0ZWQgd2l0aCBzaG91bGQgZmlyZSlcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24obW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZXVwRXZlbnQsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RhcnQoeyBldmVudDogZXZlbnQgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYWdlWChldmVudCkge1xyXG4gICAgICByZXR1cm4gZXZlbnQucGFnZVggfHwgZ2V0VG91Y2hlcyhldmVudClbMF0ucGFnZVg7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VG91Y2hlcyhldmVudDogYW55KTogYW55IHsgLy8gdG9kb1xyXG4gICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmV0dXJuIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcztcclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gIFxyXG4gICAgICBpZiAoIWV2ZW50LnRvdWNoZXMpIHtcclxuICAgICAgICBldmVudC50b3VjaGVzID0gW2V2ZW50Lm9yaWdpbmFsRXZlbnRdO1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIHJldHVybiBldmVudC50b3VjaGVzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlbW92ZShldmVudCkge1xyXG4gICAgICBsZXQgcGFnZVggPSBnZXRQYWdlWChldmVudCk7XHJcbiAgICAgIHZhciBkZWx0YSA9IHBhZ2VYIC0geDtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnKSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWcoeyBkZWx0YTogZGVsdGEsIGV2ZW50OiBldmVudCB9KSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKG1vdXNlbW92ZUV2ZW50LCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0b3ApKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLm9uZHJhZ3N0b3AoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICBsZXQgZGlyZWN0aXZlID0gKCRkb2N1bWVudCkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JySG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ15icldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBTdHJpcGUgaXQgYnkgaG91clxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IDYwIC8gY29uZmlnLmludGVydmFsO1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWxQZXJjZW50YWdlID0gMTAwIC8gbnVtSW50ZXJ2YWxzSW5UaWNrO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1JbnRlcnZhbHNJblRpY2s7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyYW5kQ2hpbGQgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJNYXhUaW1lU2xvdCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ick1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF4VGltZVNsb3REaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoTWF4VGltZVNsb3REaXJlY3RpdmUuJG5hbWUsIE1heFRpbWVTbG90RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1pc3NpbmdEYXlzU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaXNzaW5nRGF5c1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBkYXlNYXA6IERheU1hcCxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2NoZWR1bGVyIHNob3VsZCBhbHdheXMgc2hvdyBhbGwgZGF5cywgZXZlbiBpZiBpdCB3YXMgbm90IHBhc3NlZCBhbnkgc2NoZWR1bGVzIGZvciB0aGF0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmlsbEl0ZW1zKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSA9IFtdO1xyXG5cclxuICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5kYXlNYXAsIChkYXk6IHN0cmluZywgc3RyaW5nS2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5kYXkgPT09IGtleSk7XHJcbiAgICAgICAgICBsZXQgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gZmlsdGVyZWRJdGVtcy5sZW5ndGggPyBmaWx0ZXJlZEl0ZW1zWzBdIDogbnVsbDtcclxuICAgIFxyXG4gICAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuaXRlbUZhY3RvcnkuY3JlYXRlSXRlbShjb25maWcsIGtleSwgW10pKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGRheTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkocmVzdWx0KS5zb3J0KChhLCBiKSA9PiBhLmRheSA+IGIuZGF5ID8gMSA6IC0xKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1pc3NpbmdEYXlzU2VydmljZS4kbmFtZSwgTWlzc2luZ0RheXNTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTW9ub1NjaGVkdWxlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ick1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbm9TY2hlZHVsZURpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoTW9ub1NjaGVkdWxlRGlyZWN0aXZlLiRuYW1lLCBNb25vU2NoZWR1bGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHEnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRWxlbWVudE9mZnNldFNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgZWxlbWVudE9mZnNldFNlcnZpY2U6IEVsZW1lbnRPZmZzZXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGFydGluZ0dob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG4gIHByaXZhdGUgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH07XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIFxyXG4gIHB1YmxpYyAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSByZW5kZXJHaG9zdDogYm9vbGVhbjtcclxuICBwcml2YXRlIGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBhbmd1bGFyLklQcm9taXNlPHZvaWQ+IHtcclxuICAgIHN0YXJ0ID0gdGhpcy5ub3JtYWxpemVWYWx1ZShzdGFydCwgMCwgZW5kKTtcclxuICAgIGVuZCA9IHRoaXMubm9ybWFsaXplVmFsdWUoZW5kLCBzdGFydCwgdGhpcy5jb25maWcubWF4VmFsdWUpO1xyXG5cclxuICAgIC8vIFNhbml0eSBjaGVjayAtLSBkb24ndCBhZGQgYSBzbG90IHdpdGggYW4gZW5kIGJlZm9yZSB0aGUgc3RhcnRcclxuICAgIC8vIGNhdmVhdDogb2sgdG8gY29udGludWUgaWYgbnVsbEVuZHMgaXMgdHJ1ZSBhbmQgZW5kIGlzIG51bGxcclxuICAgIGlmIChlbmQgJiYgIXRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA8PSBzdGFydCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcS53aGVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIGVuZCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlID0ge1xyXG4gICAgICBkYXk6IHRoaXMuaXRlbS5kYXksXHJcbiAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgZW5kOiBlbmQsXHJcbiAgICAgIHZhbHVlOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLmNvbmZpZy5lZGl0U2xvdCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChlZGl0ZWRTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWRkU2NoZWR1bGVUb0l0ZW0oZWRpdGVkU2NoZWR1bGUpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiRxLndoZW4odGhpcy5hZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEV4cGFuZCBnaG9zdCB3aGlsZSBkcmFnZ2luZyBpbiBpdCAqL1xyXG4gIHB1YmxpYyBhZGp1c3RHaG9zdChldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgbGV0IG1vdXNlVmFsdWU6IG51bWJlciA9IHRoaXMuZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKGV2ZW50KTtcclxuXHJcbiAgICBsZXQgZXhpc3RpbmdMZWZ0VmFsdWU6IG51bWJlciA9IHRoaXMuc3RhcnRpbmdHaG9zdFZhbHVlcy5sZWZ0O1xyXG5cclxuICAgIGxldCB1cGRhdGVkTGVmdFZhbHVlOiBudW1iZXI7XHJcbiAgICBsZXQgdXBkYXRlZFJpZ2h0VmFsdWU6IG51bWJlcjtcclxuICAgIFxyXG4gICAgaWYgKG1vdXNlVmFsdWUgPCBleGlzdGluZ0xlZnRWYWx1ZSkgeyAvLyB1c2VyIGlzIGRyYWdnaW5nIGxlZnRcclxuICAgICAgdXBkYXRlZExlZnRWYWx1ZSA9IG1vdXNlVmFsdWU7XHJcbiAgICAgIHVwZGF0ZWRSaWdodFZhbHVlID0gZXhpc3RpbmdMZWZ0VmFsdWU7XHJcbiAgICB9IGVsc2UgeyAvLyB1c2VyIGlzIGRyYWdnaW5nIHJpZ2h0XHJcbiAgICAgIHVwZGF0ZWRMZWZ0VmFsdWUgPSBleGlzdGluZ0xlZnRWYWx1ZTtcclxuICAgICAgdXBkYXRlZFJpZ2h0VmFsdWUgPSBtb3VzZVZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2hvc3RWYWx1ZXMgPSB7XHJcbiAgICAgIGxlZnQ6IHRoaXMubm9ybWFsaXplR2hvc3RWYWx1ZSh1cGRhdGVkTGVmdFZhbHVlKSxcclxuICAgICAgcmlnaHQ6IHRoaXMubm9ybWFsaXplR2hvc3RWYWx1ZSh1cGRhdGVkUmlnaHRWYWx1ZSlcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLyoqIE1vdmUgZ2hvc3QgYXJvdW5kIHdoaWxlIG5vdCBkcmFnZ2luZyAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvbkdob3N0KGU6IE1vdXNlRXZlbnQpIHtcclxuICAgIGxldCB2YWwgPSB0aGlzLmdldFZhbEF0TW91c2VQb3NpdGlvbihlKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMgPSB7XHJcbiAgICAgIGxlZnQ6IHZhbCxcclxuICAgICAgcmlnaHQ6IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdmFsICsgdGhpcy5udWxsRW5kV2lkdGggOiB2YWwgKyB0aGlzLmNvbmZpZy5pbnRlcnZhbFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmdob3N0VmFsdWVzID0gYW5ndWxhci5jb3B5KHRoaXMuc3RhcnRpbmdHaG9zdFZhbHVlcyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UodGhpcy5jb25maWcsIHNjaGVkdWxlKTtcclxuICAgIHRoaXMuaXRlbS5hZGRTY2hlZHVsZShyYW5nZSk7XHJcbiAgICB0aGlzLm1lcmdlKHJhbmdlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgdGhpcy5yZW5kZXJHaG9zdCA9IHRydWU7XHJcbiAgICB0aGlzLnBvc2l0aW9uR2hvc3QoZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICAvLyBudWxsRW5kcyBjYWxlbmRhcnMgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBiZWNhdXNlIHRoZSBzaXplIG9mIHRoZSBzbG90IGRvZXNuJ3QgcmVhbGx5IG1hdHRlclxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5yZW5kZXJHaG9zdCkge1xyXG4gICAgICB0aGlzLmFkanVzdEdob3N0KGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlVXAoKSB7XHJcbiAgICB0aGlzLnJlbmRlckdob3N0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHRoaXMuaXRlbS5jYW5BZGRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHRoaXMuYWRkU2xvdCh0aGlzLmdob3N0VmFsdWVzLmxlZnQsIHRoaXMuZ2hvc3RWYWx1ZXMucmlnaHQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIHNjaGVkdWxlIGlzIGFibGUgdG8gYmUgZWRpdGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5FZGl0KHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBpc0VkaXRhYmxlID0gdGhpcy5pdGVtLmlzRWRpdGFibGUoKTtcclxuICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5jb25maWcuZWRpdFNsb3QpO1xyXG5cclxuICAgIHJldHVybiBpc0VkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJhdGhlciB0aGFuIGhhdmluZyB0byBkZWFsIHdpdGggbW9kaWZ5aW5nIG1lcmdlT3ZlcmxhcHMgdG8gaGFuZGxlIG51bGxFbmRzIGNhbGVuZGFycyxcclxuICAgKiBqdXN0IHByZXZlbnQgdGhlIHVzZXIgZnJvbSBjcmVhdGluZyBhZGRpdGlvbmFsIHNsb3RzIGluIG51bGxFbmRzIGNhbGVuZGFycyB1bmxlc3MgdGhlcmUgYXJlIG5vIHNsb3RzIHRoZXJlIGFscmVhZHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5SZW5kZXJHaG9zdCgpIHtcclxuICAgIC8vIFRoaXMgb25lIG5lZWRzIHRvIGNvbWUgZmlyc3QsIG90aGVyd2lzZSByZW5kZXJHaG9zdCBiZWluZyBzZXQgdG8gdHJ1ZSB3b3VsZCBvdmVycmlkZSB0aGUgcHJvdGVjdGlvbiBhZ2FpbnN0IGFkZHQnbCBzbG90cyBpbiBudWxsRW5kIGNhbGVuZGFyc1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlckdob3N0ICYmIHRoaXMuaXRlbS5oYXNOb1NjaGVkdWxlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHlvdSdyZSBhbHJlYWR5IGRyYWdnaW5nIHRoZSBnaG9zdCBpdCBzaG91bGQgbmV2ZXIgZGlzYXBwZWFyXHJcbiAgICBpZiAodGhpcy5yZW5kZXJHaG9zdCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuaXRlbS5pc0VkaXRhYmxlKCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJlbmRlckdob3N0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICBsZXQgZWxlbWVudE9mZnNldFggPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLmxlZnQodGhpcy4kZWxlbWVudCk7XHJcbiAgICBsZXQgbGVmdCA9IGV2ZW50LnBhZ2VYIC0gZWxlbWVudE9mZnNldFg7XHJcblxyXG4gICAgcmV0dXJuIGxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZhbEF0TW91c2VQb3NpdGlvbihldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGl4ZWxUb1ZhbCh0aGlzLmdldE1vdXNlUG9zaXRpb24oZXZlbnQpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm0gYW4gZXh0ZXJuYWwgYWN0aW9uIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgYSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5jYW5FZGl0KHNjaGVkdWxlKSkge1xyXG4gICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChuZXdTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIGxldCByYW5nZSA9IHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKHRoaXMuY29uZmlnLCBuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZERlbGV0ZShyYW5nZSkpIHtcclxuICAgICAgICAgIHRoaXMuaXRlbS5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHJhbmdlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1lcmdlKHJhbmdlKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiBtZXJnaW5nIG11dGF0ZWQgdGhlIHNjaGVkdWxlIGZ1cnRoZXIsIHRoZW4gdXBkYXRlU2NoZWR1bGUgd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHNvIHRoYXQgZWRpdHMgdGhhdCBkb24ndCB0cmlnZ2VyIG1lcmdlcyBzdGlsbCB0cmlnZ2VyIG9uQ2hhbmdlLFxyXG4gICAgICAgICAgLy8gYnV0IGVkaXRzIHRoYXQgZG8gdHJpZ2dlciBtZXJnZXMgZG9uJ3QgdHJpZ2dlciBpdCB0d2ljZVxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHByZW1lcmdlU2NoZWR1bGUsIHJhbmdlKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZS51cGRhdGUocmFuZ2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgZXhjZXB0IGVhdCB0aGUgdW5oYW5kbGVkIHJlamVjdGlvbiBlcnJvclxyXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90TGVmdChzdGFydDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsOiBIVE1MRWxlbWVudCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKHN0YXJ0KTtcclxuXHJcbiAgICByZXR1cm4gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIElmIHRoZXJlIGlzIGEgbnVsbCBlbmQsIHBsYWNlIHRoZSBlbmQgb2YgdGhlIHNsb3QgdHdvIGhvdXJzIGF3YXkgZnJvbSB0aGUgYmVnaW5uaW5nLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA9PT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBzdGFydCArIHRoaXMubnVsbEVuZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLnJpZ2h0KHRoaXMuJGVsZW1lbnQpO1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodDtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHZhbDogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xyXG4gICAgLy8gU2xpZ2h0bHkgaGFja3kgYnV0IGRvZXMgdGhlIGpvYi4gVE9ETyA/XHJcbiAgICB2YWwgPSB0aGlzLm5vcm1hbGl6ZUludGVydmFsVmFsdWUodmFsKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvdWxkRGVsZXRlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmIChzY2hlZHVsZS4kaXNEZWxldGluZykge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQgJiYgc2NoZWR1bGUudmFsdWUgPT09IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2Uoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBub3JtYWxpemVJbnRlcnZhbFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSByaWdodCBvZiB0aGUgcmlnaHRtb3N0IGludGVydmFsIC0tIHRoZSBsYXN0IGludGVydmFsIHdpbGwgbm90IGFjdHVhbGx5IHJlbmRlciB3aXRoIGEgXCJyZWxcIiB2YWx1ZVxyXG4gICAgbGV0IHJpZ2h0bW9zdCA9IHRoaXMuY29uZmlnLm1heFZhbHVlIC0gdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplVmFsdWUodmFsdWUsIDAsIHJpZ2h0bW9zdCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG5vcm1hbGl6ZUdob3N0VmFsdWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplVmFsdWUodmFsdWUsIDAsIHRoaXMuY29uZmlnLm1heFZhbHVlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbm9ybWFsaXplVmFsdWUodmFsdWU6IG51bWJlciwgbWluVmFsdWU6IG51bWJlciwgbWF4VmFsdWU6IG51bWJlcikge1xyXG4gICAgaWYgKHZhbHVlIDwgbWluVmFsdWUpIHtcclxuICAgICAgcmV0dXJuIG1pblZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZSA+IG1heFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBtYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz1uZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE51bGxFbmREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTnVsbEVuZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bGxFbmREaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShOdWxsRW5kRGlyZWN0aXZlLiRuYW1lLCBOdWxsRW5kRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyT3ZlcmxhcCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBPdmVybGFwRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoT3ZlcmxhcERpcmVjdGl2ZS4kbmFtZSwgT3ZlcmxhcERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBsZXQgY3VycmVudFN0YXJ0ID0gY3VycmVudC5zdGFydDtcclxuICAgICAgICBsZXQgY3VycmVudEVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBjdXJyZW50LmVuZCk7XHJcblxyXG4gICAgICAgIGxldCBvdGhlclN0YXJ0ID0gb3RoZXIuc3RhcnQ7XHJcbiAgICAgICAgbGV0IG90aGVyRW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIG90aGVyLmVuZCk7XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA+PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJTdGFydCA8IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID09PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA9PT0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5Ob092ZXJsYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwU2VydmljZS4kbmFtZSwgT3ZlcmxhcFNlcnZpY2UpO1xyXG4iLCIvKiogV2hlbiB1c2luZyB0aGUgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBvcHRpb24sIHRoaXMgc2VydmljZSB3aWxsIGJlIHVzZWQgdG8gZGVsZXRlIHRoZSBkZWZhdWx0IHNjaGVkdWxlcyBmb3IgY29ycmVjdCBkaXNwbGF5IG9uIHRoZSBjYWxlbmRhciAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFB1cmdlRGVmYXVsdFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgcHVyZ2Uoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIHtcclxuICAgICAgICBsZXQgbGFzdEluZGV4ID0gc2NoZWR1bGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIC8vIGxvb3AgaW4gcmV2ZXJzZSB0byBhdm9pZCBtZXNzaW5nIHVwIGluZGljZXMgYXMgd2UgZ29cclxuICAgICAgICBmb3IgKGxldCBpID0gbGFzdEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAoc2NoZWR1bGVzW2ldLnZhbHVlID09PSBjb25maWcuZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUHVyZ2VEZWZhdWx0U2VydmljZS4kbmFtZSwgUHVyZ2VEZWZhdWx0U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZVByb3ZpZGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklSZXNpemVTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyAkbmFtZSA9ICdici53ZWVrbHlTY2hlZHVsZXIucmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy4kZ2V0LiRpbmplY3QgPSBbXHJcbiAgICAgICAgICAgICckcm9vdFNjb3BlJyxcclxuICAgICAgICAgICAgJyR3aW5kb3cnXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tUmVzaXplRXZlbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgc2VydmljZUluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMgPSBldmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljICRnZXQoXHJcbiAgICAgICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApOiBJUmVzaXplU2VydmljZSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VydmljZUluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleGlzdHMgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIHdlIGhhdmUgdG8gJGFwcGx5IHRoZSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKGV2ZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VJbml0aWFsaXplZCA9IHRydWU7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5wcm92aWRlcihSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIFJlc2l6ZVNlcnZpY2VQcm92aWRlcilcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IElSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAncmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRmaWx0ZXInXTtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBleHBsYW5hdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogc3RyaW5nIH0gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRmaWx0ZXI6IElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JykoY29uZmlnLm1heFRpbWVTbG90KTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90XSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tYXhUaW1lU2xvdChtYXhUaW1lU2xvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5mdWxsQ2FsZW5kYXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tb25vU2NoZWR1bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5OdWxsRW5kXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5udWxsRW5kcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBzY2hlZHVsZXJDdHJsOiAnXmJyV2Vla2x5U2NoZWR1bGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3JvdyBleHBsYW5hdGlvbnNcIiBuZy1jbGFzcz1cInsgdmlvbGF0aW9uOiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuc2NoZWR1bGVyQ3RybC5mb3JtQ29udHJvbGxlci4kZXJyb3Jba2V5XSB9XCIgbmctcmVwZWF0PVwiKGtleSwgZXhwbGFuYXRpb24pIGluIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC5leHBsYW5hdGlvbnNcIj5cclxuICAgICAgICAgICAge3sgZXhwbGFuYXRpb24gfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LiRuYW1lLCBuZXcgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZSwgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyKTtcclxuIiwiLyoqXHJcbiAqIFJ1bnMgY3VzdG9tIHZhbGlkYXRvcnMgd2hlbmV2ZXIgdGhlIG1vZGVsIGNoYW5nZXNcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJldmFsaWRhdGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyUmV2YWxpZGF0ZSc7XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5uZ01vZGVsLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXZhbGlkYXRlRGlyZWN0aXZlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoUmV2YWxpZGF0ZURpcmVjdGl2ZS4kbmFtZSwgUmV2YWxpZGF0ZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG4gICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTRVRfWk9PTSwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW4oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJTY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyBXaGVuIHRoaXMgb3B0aW9uIGlzIHRydWUgd2Ugc2hvdWxkIGVuZm9yY2UgdGhhdCB0aGVyZSBhcmUgbm8gZ2FwcyBpbiB0aGUgc2NoZWR1bGVzXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzY2hlZHVsZXMsIGl0IGF1dG9tYXRpY2FsbHkgZmFpbHMuXHJcbiAgICAgICAgaWYgKCFsZW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgb25seSBvbmUgaXRlbSB3ZSBzaG91bGQgY2hlY2sgdGhhdCBpdCBzcGFucyB0aGUgd2hvbGUgcmFuZ2VcclxuICAgICAgICBpZiAobGVuID09PSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsZSA9IHNjaGVkdWxlc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc2NoZWR1bGUuc3RhcnQpICYmIHRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKHNjaGVkdWxlLmVuZCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG1vcmUsIGNvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxvb3BMZW4gPSBsZW4gLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTb3J0IGJ5IHN0YXJ0IHRpbWUgZmlyc3RcclxuICAgICAgICBsZXQgc29ydGVkU2NoZWR1bGVzID0gc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgPiBiLnN0YXJ0ID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiAhdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShjdXJyZW50LnN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBsYXN0IGl0ZW0gbGFuZHMgYXQgbWF4VmFsdWVcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxvb3BMZW4gLSAxICYmICF0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShuZXh0LmVuZCwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgY3VycmVudC5lbmQgPT09IG5leHQuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBzdGFydCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRW5kQXRNYXhWYWx1ZShlbmQ6IG51bWJlciwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gKGVuZCB8fCBjb25maWcubWF4VmFsdWUpID09PSBjb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSBjb25maWcubWF4VGltZVNsb3Q7XHJcblxyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSAmJiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgcy5lbmQpIC0gcy5zdGFydCA+IG1heFRpbWVTbG90KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEltcG9ydGFudCBub3RlIC0tIHRoaXMgZG9lcyBub3QgdmFsaWRhdGUgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0sIGJ1dCByYXRoZXIgdGhhdCBvbmx5IG9uZSBOT04tREVGQVVMVCBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0uICovXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhIGRlZmF1bHQgdmFsdWUgaXMgZGVmaW5lZCwgc2NoZWR1bGVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgZG9uJ3QgY291bnQgLS0gb25lIG5vbi1kZWZhdWx0IHNjaGVkdWxlIHBlciBpdGVtLlxyXG4gICAgICAgIGxldCBzY2hlZHVsZXNUb1ZhbGlkYXRlO1xyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnLmRlZmF1bHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcy5maWx0ZXIoc2NoZWR1bGUgPT4gc2NoZWR1bGUudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGFsbG93ZWQgZW1wdHkgb3IgMSBzY2hlZHVsZSBwZXIgaXRlbVxyXG4gICAgICAgIHJldHVybiAhc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggfHwgc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggPT09IDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZDtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gMSAmJiBzY2hlZHVsZXMuZXZlcnkoc2NoZWR1bGUgPT4gc2NoZWR1bGUuZW5kID09PSBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCAhPT0gbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5PdmVybGFwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW51dGVzQXNUZXh0RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGBgO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgaGFzSG91cnMgPSBob3VycyA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzSG91cnMpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgJHtob3Vyc30gaG91cnNgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbWluID0gbWludXRlcyAlIDYwO1xyXG4gICAgICAgICAgICBsZXQgaGFzTWludXRlcyA9IG1pbiA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzTWludXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7bWlufSBtaW51dGUke21pbiA+IDEgPyAncycgOiAnJ31gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoTWludXRlc0FzVGV4dEZpbHRlci4kbmFtZSwgW01pbnV0ZXNBc1RleHRGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nTWludXRlcyA9IChtaW51dGVzIC0gKGhvdXJzICogNjApKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBob3VycyA+IDExICYmIGhvdXJzIDwgMjQgPyAnUCcgOiAnQSc7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVtYWluaW5nTWludXRlcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nTWludXRlcyA9ICcwJyArIHJlbWFpbmluZ01pbnV0ZXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkaXNwbGF5SG91cnMgPSBob3VycyAlIDEyIHx8IDEyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke2Rpc3BsYXlIb3Vyc306JHtyZW1haW5pbmdNaW51dGVzfSR7bWVyaWRpZW19YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2UnO1xyXG5cclxuICAgIGJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNjaGVkdWxlOiAnPCdcclxuICAgIH1cclxuXHJcbiAgICBjb250cm9sbGVyID0gVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0te3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5lbmQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgIXRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19IHVudGlsPC9zcGFuPlxyXG4gICAgYFxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3RpbWVSYW5nZUN0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlQ29udHJvbGxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTdGFydDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgaGFzRW5kOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIHRoaXMuaGFzU3RhcnQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICB0aGlzLmhhc0VuZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuZW5kKSAmJiB0aGlzLnNjaGVkdWxlLmVuZCAhPT0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoVGltZVJhbmdlQ29tcG9uZW50LiRuYW1lLCBuZXcgVGltZVJhbmdlQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lLCBUaW1lUmFuZ2VDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR0aW1lb3V0JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckFkYXB0ZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckNvbmZpZ3VyYXRpb25TZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWlzc2luZ0RheXNTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGFkYXB0ZXJTZXJ2aWNlOiBBZGFwdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblNlcnZpY2U6IENvbmZpZ3VyYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlOiBDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtaXNzaW5nRGF5c1NlcnZpY2U6IE1pc3NpbmdEYXlzU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29yaWdpbmFsSXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcblxyXG4gIHB1YmxpYyBpbnZhbGlkTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gIC8qKiB0aGlzIGlzIHJlcXVpcmVkIHRvIGJlIHBhcnQgb2YgYSBmb3JtIGZvciBkaXJ0eS92YWxpZCBjaGVja3MgKi9cclxuICBwdWJsaWMgZm9ybUNvbnRyb2xsZXI6IGFuZ3VsYXIuSUZvcm1Db250cm9sbGVyO1xyXG5cclxuICBwdWJsaWMgaG92ZXJDbGFzczogc3RyaW5nO1xyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHVibGljIGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT47XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJhdGlvblNlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbih0aGlzLm9wdGlvbnMpO1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKTtcclxuICAgIHRoaXMud2F0Y2hBZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoSG92ZXJDbGFzcygpO1xyXG4gIH1cclxuXHJcbiAgJHBvc3RMaW5rKCkge1xyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZE1lc3NhZ2UgPSB0aGlzLmdldEludmFsaWRNZXNzYWdlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRJbnZhbGlkTWVzc2FnZSgpIHtcclxuICAgIGxldCBjb25mbGljdGluZ09wdGlvbnMgPSB0aGlzLmNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuZ2V0Q29uZmxpY3RpbmdPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKGNvbmZsaWN0aW5nT3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gY29uZmxpY3RpbmdPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHJldHVybiAnT25lIG9yIG1vcmUgb2YgdGhlIHNjaGVkdWxlcyBpcyBpbnZhbGlkISBQbGVhc2UgY29udGFjdCBzZXJ2aWNlLic7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9ybUNvbnRyb2xsZXIuJGludmFsaWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5taXNzaW5nRGF5c1NlcnZpY2UuZmlsbEl0ZW1zKHRoaXMuY29uZmlnLCBpdGVtcyk7XHJcblxyXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5tZXJnZU92ZXJsYXBzKCkpO1xyXG5cclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnB1cmdlSXRlbXModGhpcy5pdGVtcyk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IGl0ZW1zID0gdGhpcy5hZGFwdGVyU2VydmljZS5nZXRJdGVtc0Zyb21BZGFwdGVyKHRoaXMuY29uZmlnLCB0aGlzLmFkYXB0ZXIpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmJ1aWxkSXRlbXMoaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXJnZUl0ZW1zKGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICBpdGVtLnB1cmdlRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcmVwYXJlSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGl0ZW0uZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5mb3JtQ29udHJvbGxlci4kc2V0UHJpc3RpbmUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2F2ZSgpIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnByZXBhcmVJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2F2ZVNjaGVkdWxlcigpLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW1zID0gdGhpcy5wdXJnZUl0ZW1zKHRoaXMuaXRlbXMpO1xyXG4gICAgICB0aGlzLmZvcm1Db250cm9sbGVyLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgZm9ybUNvbnRyb2xsZXI6ICdmb3JtJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJztcclxuICAgIFxyXG4gICAgc3RhdGljIHZhbHVlID0ge1xyXG4gICAgICAgIDA6ICdNb24nLFxyXG4gICAgICAgIDE6ICdUdWUnLFxyXG4gICAgICAgIDI6ICdXZWQnLFxyXG4gICAgICAgIDM6ICdUaHVyJyxcclxuICAgICAgICA0OiAnRnJpJyxcclxuICAgICAgICA1OiAnU2F0JyxcclxuICAgICAgICA2OiAnU3VuJyBcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChEYXlNYXAuJG5hbWUsIERheU1hcC52YWx1ZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gMTIwO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KE51bGxFbmRXaWR0aC4kbmFtZSwgTnVsbEVuZFdpZHRoLnZhbHVlKTtcclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhbiBpdGVtIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGltcGxlbWVudHMgSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgZWRpdGFibGU6IGJvb2xlYW47XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8VD4sXHJcbiAgICAgICAgcHJpdmF0ZSBpdGVtOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBmaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2U6IEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHB1cmdlRGVmYXVsdFNlcnZpY2U6IFB1cmdlRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBpdGVtLmRheTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gaXRlbS5lZGl0YWJsZTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gaXRlbS5sYWJlbDtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzLm1hcChzY2hlZHVsZSA9PiByYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCBzY2hlZHVsZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcy5wdXNoKHNjaGVkdWxlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FuQWRkU2NoZWR1bGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNOb1NjaGVkdWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0VkaXRhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5lZGl0YWJsZSkgfHwgdGhpcy5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IHRoaXMuZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLmZpbGwodGhpcywgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZXJnZU92ZXJsYXBzKCkge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXMuZm9yRWFjaChzY2hlZHVsZSA9PiB0aGlzLm1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZSkpO1xyXG4gICAgICAgIH0gd2hpbGUgKHRoaXMubmVlZHNPdmVybGFwc01lcmdlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVyZ2VTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzY2hlZHVsZSB3ZSB3ZXJlIHdvcmtpbmcgd2l0aCB0byBiZSB0aGUgbW9zdCBpbXBvcnRhbnQsIHNvIGhhbmRsZSBpdHMgb3ZlcmxhcHMgZmlyc3QuXHJcbiAgICAgICAgdGhpcy5tZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwdXJnZURlZmF1bHRTY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSB0aGlzLnB1cmdlRGVmYXVsdFNlcnZpY2UucHVyZ2UodGhpcy5zY2hlZHVsZXMsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnLm9uUmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3ZlcmxhcCBoYW5kbGVyc1xyXG5cclxuICAgIHByaXZhdGUgZ2V0T3ZlcmxhcEhhbmRsZXIob3ZlcmxhcFN0YXRlOiBPdmVybGFwU3RhdGUpIHtcclxuICAgICAgICBjb25zdCBvdmVybGFwSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gb3ZlcmxhcEhhbmRsZXJzW292ZXJsYXBTdGF0ZV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEp1c3QgcmVtb3ZlICdjdXJyZW50J1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGN1cnJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG90aGVyLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogY3VycmVudC5zdGFydCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdGhlci51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuZCBvdmVybGFwIGhhbmRsZXJzXHJcblxyXG4gICAgcHJpdmF0ZSBtZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIHNjaGVkdWxlcy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgaWYgKCFlbC5lcXVhbHMoc2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUodGhpcy5jb25maWcsIHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLmdldE92ZXJsYXBIYW5kbGVyKG92ZXJsYXBTdGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgb3ZlcmxhcEhhbmRsZXIoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbmVlZHNPdmVybGFwc01lcmdlZCgpIHtcclxuICAgICAgICBsZXQgbGVuID0gdGhpcy5zY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG5leHQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUodGhpcy5jb25maWcsIGN1cnJlbnQsIG5leHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXS5pbmRleE9mKG92ZXJsYXBTdGF0ZSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5IHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5JztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZGF5TWFwOiBEYXlNYXAsXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZTogRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcHVyZ2VEZWZhdWx0U2VydmljZTogUHVyZ2VEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlSXRlbShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZGF5OiBudW1iZXIsIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gICAgICAgIGxldCBidWlsZGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGNvbmZpZy5jcmVhdGVJdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuICAgIFxyXG4gICAgICAgIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKGJ1aWxkZXIsIHsgbGFiZWw6IHRoaXMuZGF5TWFwW2RheV0gfSk7XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gbmV3IFdlZWtseVNjaGVkdWxlckl0ZW0oY29uZmlnLCByZXN1bHQsIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLCB0aGlzLmZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSwgdGhpcy5vdmVybGFwU2VydmljZSwgdGhpcy5wdXJnZURlZmF1bHRTZXJ2aWNlLCB0aGlzLnJhbmdlRmFjdG9yeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnkpO1xyXG5cclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhIHNjaGVkdWxlIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgJGNsYXNzOiBzdHJpbmc7XHJcbiAgICAkaXNBY3RpdmU6IGJvb2xlYW47XHJcbiAgICAkaXNEZWxldGluZzogYm9vbGVhbjtcclxuICAgICRpc0VkaXRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxuICAgIHZhbHVlOiBUO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuZGF5ID0gc2NoZWR1bGUuZGF5O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzY2hlZHVsZS5zdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IHNjaGVkdWxlLmVuZDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gc2NoZWR1bGUudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGR1cmF0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5lcXVhbHModGhpcywgb3RoZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNTYW1lVmFsdWVBcyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSh1cGRhdGVkU2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgdXBkYXRlZFN0YXJ0ID0gdGhpcy51cGRhdGVTdGFydCh1cGRhdGVkU2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIGxldCB1cGRhdGVkRW5kID0gdGhpcy51cGRhdGVFbmQodXBkYXRlZFNjaGVkdWxlLmVuZCk7XHJcblxyXG4gICAgICAgIGlmICh1cGRhdGVkU3RhcnQgfHwgdXBkYXRlZEVuZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRW5kKHVwZGF0ZWRFbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKHRoaXMuY29uZmlnLCB1cGRhdGVkRW5kKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuVXBkYXRlU3RhcnQodXBkYXRlZFN0YXJ0KSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gdXBkYXRlZFN0YXJ0O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuZW5kICE9PSB1cGRhdGVkRW5kO1xyXG4gICAgICAgIGxldCBuZXdFbmRCZWZvcmVPckF0TWF4ID0gdXBkYXRlZEVuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICBsZXQgbmV3RW5kQWZ0ZXJPckF0RXhpc3RpbmdTdGFydCA9IHVwZGF0ZWRFbmQgPj0gdGhpcy5zdGFydCArIDE7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkICYmIG5ld0VuZEJlZm9yZU9yQXRNYXggJiYgbmV3RW5kQWZ0ZXJPckF0RXhpc3RpbmdTdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhblVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLnN0YXJ0ICE9PSB1cGRhdGVkU3RhcnQ7XHJcbiAgICAgICAgbGV0IG5ld1N0YXJ0QmVmb3JlT3JBdEV4aXN0aW5nRW5kID0gdXBkYXRlZFN0YXJ0IDw9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIHRoaXMuZW5kKSAtIDE7XHJcbiAgICAgICAgbGV0IG5ld1N0YXJ0QWZ0ZXJPckF0TWluID0gdXBkYXRlZFN0YXJ0ID49IDA7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEV4aXN0aW5nRW5kICYmIG5ld1N0YXJ0QWZ0ZXJPckF0TWluO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5IHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVSYW5nZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Piwgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVyUmFuZ2UoY29uZmlnLCBzY2hlZHVsZSwgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnLFxyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBnZXREZWx0YTogKG9wdGlvbnM6IHsgcGl4ZWw6IG51bWJlciB9KSA9PiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzT25EcmFnU3RhcnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBkcmFnU2VydmljZTogRHJhZ1NlcnZpY2UsXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERyYWdTdGFydFZhbHVlcygpIHtcclxuICAgIHJldHVybiB0aGlzLmRyYWdTZXJ2aWNlLmdldERyYWdSYW5nZUZyb21TY2hlZHVsZSh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmR1cmF0aW9uKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLnVwZGF0ZSh7XHJcbiAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZERyYWcoKSB7XHJcbiAgICAvLyBEaWQgdGhlIHVzZXIgYWN0dWFsbHkgbW92ZSBvciByZXNpemUgdGhlIHNsb3Q/P1xyXG4gICAgdmFyIGNoYW5nZWQ6IGJvb2xlYW4gPSAhdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lcXVhbHModGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVTdGFydChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgIGlmICh0aGlzLnNjaGVkdWxlLnVwZGF0ZVN0YXJ0KG5ld1N0YXJ0KSkge1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZUVuZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NoZWR1bGUudXBkYXRlRW5kKG5ld0VuZCkpIHtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBpdGVtOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGVkaXRTY2hlZHVsZTogJyYnLFxyXG4gICAgZ2V0RGVsdGE6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudDogYW55KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRab29tRWxlbWVudChjb250YWluZXI6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBjb250YWluZXIucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFpvb21XaWR0aChlbGVtZW50OiBhbnksIHdpZHRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgIHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGggPSB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICcxMDAlJyk7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgem9vbUluKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIC8vIGdldCBjdXJyZW50IHpvb20gbGV2ZWwgZnJvbSB6b29tZWQgZWxlbWVudCBhcyBhIHBlcmNlbnRhZ2VcclxuICAgICAgICBsZXQgem9vbSA9IHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gcGFyc2UgdG8gaW50ZWdlciAmIGRvdWJsZVxyXG4gICAgICAgIGxldCBsZXZlbCA9IHBhcnNlSW50KHpvb20sIDEwKSAqIDI7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgYmFjayB0byBwZXJjZW50YWdlXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgbGV2ZWwgKyAnJScpO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUluQUNlbGwoZWxlbWVudDogYW55LCBldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgZWxlbWVudENvdW50ID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gICAgICAgIGxldCBpID0gZGF0YS5pZHg7XHJcblxyXG4gICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvRGlzcGxheSA9IDU7XHJcbiAgICAgICAgbGV0IGJveFdpZHRoID0gY29udGFpbmVyV2lkdGggLyBib3hlc1RvRGlzcGxheTtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9Ta2lwID0gMjtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoICogYm94ZXNUb1NraXA7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJScpO1xyXG5cclxuICAgICAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tQnlTY3JvbGwoZWxlbWVudDogYW55LCBldmVudDogV2hlZWxFdmVudCwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSB0aGlzLmdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFpvb21TZXJ2aWNlLiRuYW1lLCBab29tU2VydmljZSk7XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBsZW1lbnQgdGhpcyBvbiBhIGNsaWVudCBhbmQgdGhlbiBwYXNzIGl0IGluIHRvIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8VEN1c3RvbSwgVFZhbHVlPiB7XHJcbiAgICAgICAgY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGN1c3RvbTogVEN1c3RvbSk6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VFZhbHVlPjtcclxuXHJcbiAgICAgICAgLyoqIFRyYW5zZm9ybSB0aGUgZGF0YSBoZWxkIHdpdGhpbiB0aGUgY29tcG9uZW50IHRvIHRoZSBmb3JtYXQgeW91IG5lZWQgaXQgb3V0c2lkZSBvZiB0aGUgY29tcG9uZW50LiAqL1xyXG4gICAgICAgIGdldFNuYXBzaG90KCk6IFRDdXN0b21bXTtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMganVzdCBuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBjbGFzcywgd2UnbGwgc2V0IGl0IGludGVybmFsbHkgKi9cclxuICAgICAgICBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08VFZhbHVlPltdO1xyXG5cclxuICAgICAgICBpbml0aWFsRGF0YTogVEN1c3RvbVtdO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnZhbGlkTWVzc2FnZXMge1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhckZpbGxFbXB0eVdpdGhEZWZhdWx0OiBzdHJpbmc7XHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aGRlZmF1bHREZWZhdWx0VmFsdWU6IHN0cmluZztcclxuICAgICAgICBnZW5lcmljOiBzdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSVJlc2l6ZVNlcnZpY2Uge1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkO1xyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUmVzaXplU2VydmljZVByb3ZpZGVyIGV4dGVuZHMgYW5ndWxhci5JU2VydmljZVByb3ZpZGVyIHtcclxuICAgICAgICBzZXRDdXN0b21SZXNpemVFdmVudHMoZXZlbnRzOiBzdHJpbmdbXSk7XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICAvKiogRGVmYXVsdHMgd2lsbCBiZSBwcm92aWRlZCwgYnV0IHlvdSBjYW4gb3ZlcnJpZGUgdGhlc2Ugb24gYSBwZXItY2FsZW5kYXIgYmFzaXMgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zIHtcclxuICAgICAgICBmdWxsQ2FsZW5kYXI6IHN0cmluZztcclxuICAgICAgICBtYXhUaW1lU2xvdDogKHZhbHVlOiBzdHJpbmcpID0+IHN0cmluZztcclxuICAgICAgICBtb25vU2NoZWR1bGU6IHN0cmluZztcclxuICAgICAgICBudWxsRW5kczogc3RyaW5nO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRGF5cyB7XHJcbiAgICAgICAgTW9uZGF5ID0gMCxcclxuICAgICAgICBUdWVzZGF5ID0gMSxcclxuICAgICAgICBXZWRuZXNkYXksXHJcbiAgICAgICAgVGh1cnNkYXksXHJcbiAgICAgICAgRnJpZGF5LFxyXG4gICAgICAgIFNhdHVyZGF5LFxyXG4gICAgICAgIFN1bmRheVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlIGV4dGVuZHMgYW5ndWxhci5JRmlsdGVyU2VydmljZSB7XHJcbiAgICAobmFtZTogJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpOiAobWludXRlczogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8VD4ge1xyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUgc2NoZWR1bGVzIHdpbGwgYmUgYWxsb3dlZCAmIHJlcXVpcmVkIHRvIGhhdmUgbm8gc2V0IGVuZCB0aW1lICovXHJcbiAgICAgICAgbnVsbEVuZHM/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhlc2UgY2xhc3NlcyB3aWxsIGJlIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIGJ1dHRvbnMgKi9cclxuICAgICAgICBidXR0b25DbGFzc2VzPzogc3RyaW5nW107XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHJldHVybiBhbiBpdGVtIC0tIHRoaXMgaXMgUkVRVUlSRUQgc28gdGhhdCBhZGFwdGVycyB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBuZXcgaXRlbXMsIGV2ZW4gaWYgdGhleSB3ZXJlbid0IHBhc3NlZCBpbiAqL1xyXG4gICAgICAgIGNyZWF0ZUl0ZW06IChkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLCBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdKSA9PiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD47XHJcblxyXG4gICAgICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBEbyBub3QgYXNzaWduIGZvciBubyBkZWZhdWx0ICovXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlPzogVDtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZCBpbiBvcmRlciB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGl0ICovXHJcbiAgICAgICAgZWRpdFNsb3Q/OiAoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikgPT4gYW5ndWxhci5JUHJvbWlzZTxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4+O1xyXG5cclxuICAgICAgICAvKiogV2hldGhlciB0byBmaWxsIGVtcHR5IHNwYWNlcyB3aXRoIHRoZSBkZWZhdWx0IHZhbHVlICovXHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aERlZmF1bHQ/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcj86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgICAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSwgdGhlIGNhbGVuZGFyIHdpbGwgZW5mb3JjZSB0aGF0IG9ubHkgb25lIHNjaGVkdWxlIHBlciBpdGVtIGlzIGFsbG93ZWQgKi9cclxuICAgICAgICBtb25vU2NoZWR1bGU/OiBib29sZWFuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gdGhlIHNjaGVkdWxlciBjaGFuZ2VzLiAqL1xyXG4gICAgICAgIG9uQ2hhbmdlPzogKCkgPT4gdm9pZDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBhbGxvd3MgYWNjZXNzIGJhY2sgdG8gdGhlIGNsaWVudCBzY29wZSB3aGVuIGEgc2NoZWR1bGVyIGlzIHJlbW92ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25SZW1vdmU/OiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgICAgICBpbnRlcnZhbD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIE92ZXJyaWRlcyBmb3IgcmVzdHJpY3Rpb24gZXhwbGFuYXRpb25zLCBpZiBuZWNlc3NhcnkgKi9cclxuICAgICAgICByZXN0cmljdGlvbkV4cGxhbmF0aW9ucz86IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHNhdmUgYnV0dG9uIGlzIGNsaWNrZWQuIElmIHRoaXMgaXMgbm90IHBhc3NlZCwgbm8gc2F2ZSBidXR0b24gd2lsbCBiZSBwcmVzZW50LiAqL1xyXG4gICAgICAgIHNhdmVTY2hlZHVsZXI/OiAoKSA9PiBhbmd1bGFyLklQcm9taXNlPGFueT47XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIFVzZSB0aGlzIGZvciBwcm9wZXJ0aWVzIHlvdSBuZWVkIGFjY2VzcyB0byBidXQgZG9uJ3Qgd2FudCBleHBvc2VkIHRvIGNsaWVudHMgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBleHRlbmRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgICAgICBlZGl0YWJsZT86IGJvb2xlYW47XHJcbiAgICAgICAgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgICAgICAvKiogQSBjc3MgY2xhc3MgdG8gYXBwbHkgKi9cclxuICAgICAgICAkY2xhc3M/OiBzdHJpbmc7XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgY29uc2lkZXJlZCBhY3RpdmUgdG8gdGhlIFVJICovXHJcbiAgICAgICAgJGlzQWN0aXZlPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUgd2hpbGUgdGhlIHVzZXIgaXMgZWRpdGluZyBhbiBleGlzdGluZyBpdGVtLCBpdCB3aWxsIGJlIHJlbW92ZWQgd2hlbiB0aGUgZWRpdCBwcm9taXNlIGlzIHJlc29sdmVkICovXHJcbiAgICAgICAgJGlzRGVsZXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGJlaW5nIGVkaXRlZCBieSB0aGUgdXNlciAqL1xyXG4gICAgICAgICRpc0VkaXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogTm90IHN0cmljdGx5IG5lY2Vzc2FyeSBidXQgbWFrZXMgdGhpbmdzIGEgd2hvb29sZSBsb3QgZWFzaWVyICovXHJcbiAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuXHJcbiAgICAgICAgc3RhcnQ6IG51bWJlcjtcclxuICAgICAgICBlbmQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgdmFsdWU6IFQ7XHJcbiAgICB9XHJcbn1cclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()" ng-disabled="!testWrapper.$dirty || !testWrapper.$valid">Save</button><br-weekly-scheduler adapter="adapter" ng-form="test" options="model.options"></br-weekly-scheduler><code>Valid: {{ test.$valid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" ng-form="test2" options="model2.options"></br-weekly-scheduler><code>Result: {{ adapterTwoResult }}</code> <code>Valid: {{ test2.$valid }}</code><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown(event)" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove(event)"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" get-delta="multiSliderCtrl.pixelToVal(pixel)" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: multiSliderCtrl.item.editable === false,\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.invalidMessage"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" ng-model="item" ng-model-options="{allowInvalid: true}" br-full-calendar="{{ schedulerCtrl.config.fullCalendar }}" br-max-time-slot="{{ schedulerCtrl.config.maxTimeSlot }}" br-mono-schedule="{{ schedulerCtrl.config.monoSchedule }}" br-null-end="{{ schedulerCtrl.config.nullEnds }}" br-overlap br-revalidate></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.invalidMessage">{{ schedulerCtrl.invalidMessage }}</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resizeStart(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resizeEnd(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);