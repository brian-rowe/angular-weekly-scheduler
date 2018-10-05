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
                    schedule.value = true;
                    return $q.when(schedule);
                },
                interval: 1,
                onChange: function (isValid) {
                },
                restrictionExplanations: {
                    maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                },
                scheduleCountOptions: {
                    count: 2,
                    exact: false
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
        return Array.prototype.concat.apply([], this.items.map(function (item) {
            return item.schedules.map(function (schedule) {
                return {
                    day: schedule.day,
                    start: schedule.start,
                    end: schedule.end,
                    value: schedule.value
                };
            });
        }));
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
        var userOptions = angular.merge(defaultOptions, options);
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
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.',
                scheduleCount: function (options) {
                    if (options.exact) {
                        return "This calendar must have exactly " + options.count + " slots per day";
                    }
                    else {
                        return "This calendar may only have a maximum of " + options.count + " slots per day";
                    }
                }
            },
            scheduleCountOptions: {
                count: null,
                exact: false
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
    function HandleDirective($document, mouseTrackerService, touchService) {
        var _this = this;
        this.$document = $document;
        this.mouseTrackerService = mouseTrackerService;
        this.touchService = touchService;
        this.restrict = 'A';
        this.scope = {
            ondrag: '&',
            ondragstop: '&',
            ondragstart: '&',
            immediate: '<'
        };
        this.link = function (scope, element) {
            var $document = _this.$document;
            var mouseTrackerService = _this.mouseTrackerService;
            var touchService = _this.touchService;
            var x = 0;
            var mousedownEvent = 'mousedown touchstart';
            var mousemoveEvent = 'mousemove touchmove';
            var mouseupEvent = 'mouseup touchend';
            element.on(mousedownEvent, mousedown);
            function mousedown(event) {
                x = getPageX(event);
                // Prevent default dragging of selected content
                event.preventDefault();
                // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
                event.stopPropagation();
                startDrag();
            }
            function fakeMousedown() {
                x = mouseTrackerService.getMousePosition().x;
                startDrag();
            }
            function getPageX(event) {
                return event.pageX || touchService.getPageX(event);
            }
            function mousemove(event) {
                var pageX = getPageX(event);
                var delta = pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.$apply(scope.ondrag({ delta: delta }));
                }
            }
            function mouseup() {
                $document.unbind(mousemoveEvent, mousemove);
                $document.unbind(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstop)) {
                    scope.$apply(scope.ondragstop());
                }
            }
            function startDrag() {
                $document.on(mousemoveEvent, mousemove);
                $document.on(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$applyAsync(scope.ondragstart());
                }
            }
            if (scope.immediate) {
                fakeMousedown();
            }
        };
    }
    HandleDirective.Factory = function () {
        var directive = function ($document, mouseTrackerService, touchService) { return new HandleDirective($document, mouseTrackerService, touchService); };
        directive.$inject = ['$document', 'brWeeklySchedulerMouseTrackerService', 'brWeeklySchedulerTouchService'];
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
                scope.$emit("brWeeklyScheduler.clickOnACell" /* CLICK_ON_A_CELL */, {
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
var LastGhostDayService = /** @class */ (function () {
    function LastGhostDayService() {
    }
    /**
     * When dragging ghosts across multiple days, if the user moves the mouse pointer out of one extreme and back into the last slot that rendered a ghost,
     * We should remove the ghost from that extreme. This will help grab the correct day
     */
    LastGhostDayService.prototype.getLastGhostDay = function (items) {
        var originIndex = this.getOriginIndex(items);
        var renderedGhostIndices = this.getRenderedGhostIndices(items);
        // determine if the other $renderGhost items are above or below the $isGhostOrigin item
        var above = renderedGhostIndices.every(function (i) { return i <= originIndex; });
        // take first item for above or last item for below
        var lastGhostDayIndex = above ? 0 : renderedGhostIndices.length - 1;
        return renderedGhostIndices[lastGhostDayIndex];
    };
    /** Get the index of the $isGhostOrigin item */
    LastGhostDayService.prototype.getOriginIndex = function (items) {
        var originIndex;
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var currentItem = items[i];
            if (currentItem.$isGhostOrigin) {
                originIndex = i;
                break;
            }
        }
        return originIndex;
    };
    /** Get all of the item indices that currently have ghosts rendered */
    LastGhostDayService.prototype.getRenderedGhostIndices = function (items) {
        var renderedGhostIndices = [];
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var currentItem = items[i];
            if (currentItem.$renderGhost) {
                renderedGhostIndices.push(i);
            }
        }
        return renderedGhostIndices;
    };
    LastGhostDayService.$name = 'brWeeklySchedulerLastGhostDayService';
    return LastGhostDayService;
}());
angular
    .module('br.weeklyScheduler')
    .service(LastGhostDayService.$name, LastGhostDayService);
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
var MouseTrackerService = /** @class */ (function () {
    function MouseTrackerService($document) {
        this.$document = $document;
    }
    MouseTrackerService.prototype.initialize = function () {
        var eventName = 'mousemove touchmove';
        var event = this.setMousePosition.bind(this);
        this.$document.unbind(eventName, event);
        this.$document.on(eventName, event);
    };
    MouseTrackerService.prototype.getMousePosition = function () {
        return this.mousePosition;
    };
    MouseTrackerService.prototype.setMousePosition = function (event) {
        this.mousePosition = { x: event.pageX, y: event.pageY };
    };
    MouseTrackerService.$name = 'brWeeklySchedulerMouseTrackerService';
    MouseTrackerService.$inject = ['$document'];
    return MouseTrackerService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MouseTrackerService.$name, MouseTrackerService)
    .run([MouseTrackerService.$name, function (mouseTrackerService) {
        mouseTrackerService.initialize();
    }]);
/** @internal */
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $q, $scope, elementOffsetService, endAdjusterService, mouseTrackerService, nullEndWidth, rangeFactory, valueNormalizationService) {
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.elementOffsetService = elementOffsetService;
        this.endAdjusterService = endAdjusterService;
        this.mouseTrackerService = mouseTrackerService;
        this.nullEndWidth = nullEndWidth;
        this.rangeFactory = rangeFactory;
        this.valueNormalizationService = valueNormalizationService;
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$element.on('mouseenter', function () {
            _this.onMouseEnter();
        });
        this.$element.on('mouseleave', function () {
            _this.onMouseLeave();
        });
        this.$element.on('mouseup', function () {
            _this.onMouseUp();
        });
        this.$scope.$on("brWeeklyScheduler.commitGhost" /* COMMIT_GHOST */, function (event, ghostSchedule) {
            if (_this.item.$renderGhost) {
                _this.commitGhost(ghostSchedule);
            }
        });
        this.$scope.$on("brWeeklyScheduler.removeGhost" /* REMOVE_GHOST */, function (event, day) {
            if (!_this.item.$isGhostOrigin && _this.item.day === day) {
                _this.item.$renderGhost = false;
            }
        });
        this.$scope.$on("brWeeklyScheduler.removeAllGhosts" /* REMOVE_ALL_GHOSTS */, function () {
            _this.item.$renderGhost = false;
        });
    };
    MultiSliderController.prototype.onMouseEnter = function () {
        // If the cursor is moving BACK into an item that ALREADY has a ghost rendered, we'll want to remove the ghost from the item that was left
        if (this.item.$renderGhost) {
            this.$scope.$emit("brWeeklyScheduler.removeLastGhost" /* REMOVE_LAST_GHOST */);
        }
        if (this.dragSchedule) {
            this.addDragSchedule();
        }
        if (this.ghostValues && !this.item.$renderGhost) {
            this.createGhost();
        }
    };
    MultiSliderController.prototype.onMouseLeave = function () {
        if (this.dragSchedule) {
            this.removeDragSchedule();
        }
    };
    MultiSliderController.prototype.onMouseUp = function () {
        if (this.pendingSchedule) {
            this.commitDragSchedule();
        }
    };
    MultiSliderController.prototype.addDragSchedule = function () {
        this.dragSchedule.day = this.item.day;
        this.pendingSchedule = this.item.addSchedule(this.dragSchedule);
        this.pendingSchedule.$isActive = true;
    };
    MultiSliderController.prototype.removeDragSchedule = function () {
        this.item.removeSchedule(this.dragSchedule);
        this.pendingSchedule = null;
    };
    MultiSliderController.prototype.commitDragSchedule = function () {
        this.pendingSchedule.$isActive = false;
        this.ngModelCtrl.$setDirty();
        this.item.mergeSchedule(this.pendingSchedule);
        this.pendingSchedule = null;
    };
    MultiSliderController.prototype.getScheduleForAdd = function (start, end) {
        start = this.valueNormalizationService.normalizeValue(start, 0, end);
        end = this.valueNormalizationService.normalizeValue(end, start, this.config.maxValue);
        if (this.config.nullEnds) {
            end = null;
        }
        var schedule = {
            day: this.item.day,
            start: start,
            end: end,
            value: this.config.defaultValue
        };
        return schedule;
    };
    MultiSliderController.prototype.openEditorForAdd = function (schedule) {
        if (this.item.canEdit()) {
            return this.config.editSlot(schedule);
        }
        else {
            return this.$q.when(schedule);
        }
    };
    /** Expand ghost while dragging in it */
    MultiSliderController.prototype.adjustGhost = function () {
        var point = this.mouseTrackerService.getMousePosition();
        var mouseValue = this.getValAtMousePosition(point.x);
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
        var ghostValues = {
            left: this.normalizeGhostValue(updatedLeftValue),
            right: this.normalizeGhostValue(updatedRightValue)
        };
        this.setGhostValues({
            ghostValues: ghostValues
        });
    };
    /** Move ghost around while not dragging */
    MultiSliderController.prototype.positionGhost = function () {
        var point = this.mouseTrackerService.getMousePosition();
        var val = this.getValAtMousePosition(point.x);
        this.startingGhostValues = {
            left: val,
            right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
        };
        this.setGhostValues({
            ghostValues: angular.copy(this.startingGhostValues)
        });
    };
    MultiSliderController.prototype.onGhostWrapperMouseDown = function () {
        this.item.$isGhostOrigin = true;
        this.createGhost();
    };
    MultiSliderController.prototype.onGhostWrapperMouseMove = function () {
        // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
        if (this.config.nullEnds) {
            this.positionGhost();
            return;
        }
        if (this.item.$renderGhost) {
            this.adjustGhost();
        }
    };
    MultiSliderController.prototype.onGhostWrapperMouseUp = function () {
        var _this = this;
        var ghostSchedule = this.getScheduleForAdd(this.ghostValues.left, this.ghostValues.right);
        this.openEditorForAdd(ghostSchedule).then(function (editedGhostSchedule) {
            _this.$scope.$emit("brWeeklyScheduler.ghostDragEnded" /* GHOST_DRAG_ENDED */, editedGhostSchedule);
        }).catch(function () {
            _this.$scope.$emit("brWeeklyScheduler.cancelGhost" /* CANCEL_GHOST */);
        });
    };
    MultiSliderController.prototype.createGhost = function () {
        this.item.$renderGhost = true;
        this.positionGhost();
    };
    MultiSliderController.prototype.commitGhost = function (ghostSchedule) {
        this.item.$renderGhost = false;
        this.item.$isGhostOrigin = false;
        if (this.item.canAddSchedule()) {
            this.item.addScheduleAndMerge(ghostSchedule);
            this.ngModelCtrl.$setDirty();
            this.config.onChange();
            this.setGhostValues(null);
        }
    };
    MultiSliderController.prototype.getMousePosition = function (pageX) {
        var elementOffsetX = this.elementOffsetService.left(this.$element);
        var left = pageX - elementOffsetX;
        return left;
    };
    MultiSliderController.prototype.getValAtMousePosition = function (pageX) {
        return this.pixelToVal(this.getMousePosition(pageX));
    };
    /**
     * Perform an external action to bring up an editor for a schedule
     */
    MultiSliderController.prototype.editSchedule = function (schedule) {
        var _this = this;
        if (this.item.canEdit()) {
            schedule.$isEditing = true;
            this.config.editSlot(schedule).then(function (newSchedule) {
                var range = _this.rangeFactory.createRange(_this.config, newSchedule);
                if (_this.shouldDelete(range)) {
                    _this.item.removeSchedule(schedule);
                }
                else {
                    var premergeSchedule = angular.copy(range);
                    _this.item.mergeSchedule(range);
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
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    MultiSliderController.prototype.normalizeIntervalValue = function (value) {
        // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
        var rightmost = this.config.maxValue - this.config.interval;
        return this.valueNormalizationService.normalizeValue(value, 0, rightmost);
    };
    MultiSliderController.prototype.normalizeGhostValue = function (value) {
        return this.valueNormalizationService.normalizeValue(value, 0, this.config.maxValue);
    };
    MultiSliderController.$name = 'brMultiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$q',
        '$scope',
        'brWeeklySchedulerElementOffsetService',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerMouseTrackerService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory',
        'brWeeklySchedulerValueNormalizationService'
    ];
    return MultiSliderController;
}());
/** @internal */
var MultiSliderComponent = /** @class */ (function () {
    function MultiSliderComponent() {
        this.bindings = {
            config: '<',
            dragSchedule: '<',
            ghostValues: '<',
            item: '=ngModel',
            setGhostValues: '&'
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
                        $rootScope.$broadcast("brWeeklyScheduler.resized" /* RESIZED */);
                    });
                });
                if (_this.customResizeEvents) {
                    _this.customResizeEvents.forEach(function (event) {
                        $rootScope.$on(event, function () {
                            $rootScope.$broadcast("brWeeklyScheduler.resized" /* RESIZED */);
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
        if (config.scheduleCountOptions && config.scheduleCountOptions.count) {
            this.explanations["scheduleCount" /* ScheduleCount */] = config.restrictionExplanations.scheduleCount(config.scheduleCountOptions);
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
        this.$scope.$on("brWeeklyScheduler.clickOnACell" /* CLICK_ON_A_CELL */, function (e, data) {
            _this.zoomService.zoomInACell(element, e, data);
        });
        this.$scope.$on("brWeeklyScheduler.resetZoom" /* RESET_ZOOM */, function (e) {
            _this.zoomService.resetZoom(element);
        });
        this.$scope.$on("brWeeklyScheduler.zoomIn" /* ZOOM_IN */, function (e) {
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
var ScheduleCountDirective = /** @class */ (function () {
    function ScheduleCountDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brScheduleCount) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    ScheduleCountDirective.Factory = function () {
        var directive = function (validator) {
            return new ScheduleCountDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerScheduleCountValidatorService'];
        return directive;
    };
    ScheduleCountDirective.$name = 'brScheduleCount';
    return ScheduleCountDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(ScheduleCountDirective.$name, ScheduleCountDirective.Factory());
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
var ScheduleCountValidatorService = /** @class */ (function () {
    function ScheduleCountValidatorService() {
    }
    Object.defineProperty(ScheduleCountValidatorService.prototype, "error", {
        get: function () {
            return "scheduleCount" /* ScheduleCount */;
        },
        enumerable: true,
        configurable: true
    });
    ScheduleCountValidatorService.prototype.validate = function (schedules, config) {
        if (!config.scheduleCountOptions.count) {
            return true;
        }
        if (config.scheduleCountOptions.exact) {
            return this.validateExactCount(schedules, config);
        }
        else {
            return this.validateMaxCount(schedules, config);
        }
    };
    ScheduleCountValidatorService.prototype.validateExactCount = function (schedules, config) {
        return schedules.length === config.scheduleCountOptions.count;
    };
    ScheduleCountValidatorService.prototype.validateMaxCount = function (schedules, config) {
        return schedules.length <= config.scheduleCountOptions.count;
    };
    ScheduleCountValidatorService.$name = 'brWeeklySchedulerScheduleCountValidatorService';
    return ScheduleCountValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ScheduleCountValidatorService.$name, ScheduleCountValidatorService);
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
var TouchService = /** @class */ (function () {
    function TouchService() {
    }
    TouchService.prototype.getTouches = function (event) {
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
    };
    TouchService.prototype.getPageX = function (event) {
        var touches = this.getTouches(event);
        if (touches && touches.length && touches[0]) {
            return touches[0].pageX;
        }
        return null;
    };
    TouchService.$name = 'brWeeklySchedulerTouchService';
    return TouchService;
}());
angular
    .module('br.weeklyScheduler')
    .service(TouchService.$name, TouchService);
var ValueNormalizationService = /** @class */ (function () {
    function ValueNormalizationService() {
    }
    ValueNormalizationService.prototype.normalizeValue = function (value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };
    ValueNormalizationService.$name = 'brWeeklySchedulerValueNormalizationService';
    return ValueNormalizationService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ValueNormalizationService.$name, ValueNormalizationService);
/** @internal */
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($element, $scope, $timeout, adapterService, configurationService, conflictingOptionsService, lastGhostDayService, missingDaysService) {
        this.$element = $element;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.adapterService = adapterService;
        this.configurationService = configurationService;
        this.conflictingOptionsService = conflictingOptionsService;
        this.lastGhostDayService = lastGhostDayService;
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
        this.$scope.$on("brWeeklyScheduler.slotDragged" /* SLOT_DRAGGED */, function (event, schedule) {
            _this.dragSchedule = schedule;
        });
        this.$scope.$on("brWeeklyScheduler.dragEnded" /* DRAG_ENDED */, function () {
            _this.dragSchedule = null;
        });
        this.$scope.$on("brWeeklyScheduler.ghostDragEnded" /* GHOST_DRAG_ENDED */, function (event, ghostSchedule) {
            _this.$scope.$broadcast("brWeeklyScheduler.commitGhost" /* COMMIT_GHOST */, ghostSchedule);
        });
        this.$scope.$on("brWeeklyScheduler.removeLastGhost" /* REMOVE_LAST_GHOST */, function () {
            var lastGhostDay = _this.lastGhostDayService.getLastGhostDay(_this.items);
            _this.$scope.$broadcast("brWeeklyScheduler.removeGhost" /* REMOVE_GHOST */, lastGhostDay);
        });
        this.$scope.$on("brWeeklyScheduler.cancelGhost" /* CANCEL_GHOST */, function () {
            _this.$scope.$broadcast("brWeeklyScheduler.removeAllGhosts" /* REMOVE_ALL_GHOSTS */);
        });
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
    WeeklySchedulerController.prototype.setGhostValues = function (ghostValues) {
        this.ghostValues = ghostValues;
    };
    WeeklySchedulerController.prototype.resetZoom = function () {
        this.$scope.$broadcast("brWeeklyScheduler.resetZoom" /* RESET_ZOOM */);
    };
    WeeklySchedulerController.prototype.zoomIn = function () {
        this.$scope.$broadcast("brWeeklyScheduler.zoomIn" /* ZOOM_IN */);
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
        'brWeeklySchedulerLastGhostDayService',
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
    function WeeklySchedulerItem(config, item, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.config = config;
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
        var range = this.rangeFactory.createRange(this.config, schedule);
        this.schedules.push(range);
        return range;
    };
    WeeklySchedulerItem.prototype.addScheduleAndMerge = function (schedule) {
        var range = this.addSchedule(schedule);
        this.mergeSchedule(range);
        return range;
    };
    WeeklySchedulerItem.prototype.canAddSchedule = function () {
        if (this.config.nullEnds) {
            return this.hasNoSchedules();
        }
        else {
            return true;
        }
    };
    /** Determine if the conditions allow for a pop-up editor */
    WeeklySchedulerItem.prototype.canEdit = function () {
        var isEditable = this.isEditable();
        var hasEditFunction = angular.isFunction(this.config.editSlot);
        return isEditable && hasEditFunction;
    };
    /**
     * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
     * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
     */
    WeeklySchedulerItem.prototype.canRenderGhost = function () {
        // This one needs to come first, otherwise renderGhost being set to true would override the protection against addt'l slots in nullEnd calendars
        if (this.config.nullEnds) {
            return this.$renderGhost && this.hasNoSchedules();
        }
        // If you're already dragging the ghost it should never disappear
        if (this.$renderGhost) {
            return true;
        }
        if (!this.isEditable()) {
            return false;
        }
        return this.$renderGhost;
    };
    WeeklySchedulerItem.prototype.hasSchedule = function (schedule) {
        return this.schedules.indexOf(schedule) > -1;
    };
    WeeklySchedulerItem.prototype.hasNoSchedules = function () {
        return this.schedules.length === 0;
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
    WeeklySchedulerItem.prototype.isEditable = function () {
        return !angular.isDefined(this.editable) || this.editable;
    };
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
    function WeeklySchedulerItemFactory(dayMap, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.dayMap = dayMap;
        this.fillEmptyWithDefaultService = fillEmptyWithDefaultService;
        this.overlapService = overlapService;
        this.purgeDefaultService = purgeDefaultService;
        this.rangeFactory = rangeFactory;
    }
    WeeklySchedulerItemFactory.prototype.createItem = function (config, day, schedules) {
        var result;
        var builder = config.createItem(day, schedules);
        result = angular.extend(builder, { label: this.dayMap[day] });
        return new WeeklySchedulerItem(config, result, this.fillEmptyWithDefaultService, this.overlapService, this.purgeDefaultService, this.rangeFactory);
    };
    WeeklySchedulerItemFactory.$name = 'brWeeklySchedulerItemFactory';
    WeeklySchedulerItemFactory.$inject = [
        'brWeeklySchedulerDayMap',
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
    function WeeklySlotController($element, $rootScope, $scope, dragService) {
        this.$element = $element;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.dragService = dragService;
    }
    Object.defineProperty(WeeklySlotController.prototype, "hasDragSchedule", {
        get: function () {
            return angular.isDefined(this.dragSchedule) && this.dragSchedule != null;
        },
        enumerable: true,
        configurable: true
    });
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
        // If the schedule was moved to another item, the $scope hierarchy will have been broken, so we need to broadcast this to the whole app
        this.$rootScope.$broadcast("brWeeklyScheduler.dragEnded" /* DRAG_ENDED */);
        // Was the schedule moved to another item??
        if (!this.item.hasSchedule(this.schedule)) {
            return;
        }
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
    WeeklySlotController.prototype.endResize = function () {
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
        this.$scope.$emit("brWeeklyScheduler.slotDragged" /* SLOT_DRAGGED */, this.schedule);
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.prototype.startResize = function () {
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        '$element',
        '$rootScope',
        '$scope',
        'brWeeklySchedulerDragService'
    ];
    return WeeklySlotController;
}());
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            dragSchedule: '<',
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
        this.$rootScope.$broadcast("brWeeklyScheduler.zoomedIn" /* ZOOMED_IN */);
    };
    ZoomService.prototype.broadcastZoomedOutEvent = function () {
        this.$rootScope.$broadcast("brWeeklyScheduler.zoomedOut" /* ZOOMED_OUT */);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvQWRhcHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9jb25maWd1cmF0aW9uL0NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvY29uZmxpY3Rpbmctb3B0aW9ucy9Db25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy9EcmFnU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L0VsZW1lbnRPZmZzZXRTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZW5kLWFkanVzdGVyL0VuZEFkanVzdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ZpbGwtZW1wdHktd2l0aC1kZWZhdWx0L0ZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2Z1bGwtY2FsZW5kYXIvRnVsbENhbGVuZGFyRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ2hvc3Qtc2xvdC9naG9zdC1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ3JvdXAtYnkvR3JvdXBTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL0hhbmRsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL0hvdXJseUdyaWREaXJlY3RpdmUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sYXN0LWdob3N0LWRheS9MYXN0R2hvc3REYXlTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbWF4LXRpbWUtc2xvdC9NYXhUaW1lU2xvdERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pc3NpbmctZGF5cy9NaXNzaW5nRGF5c1NlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tb25vLXNjaGVkdWxlL01vbm9TY2hlZHVsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vdXNlLXRyYWNrZXIvTW91c2VUcmFja2VyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbnVsbC1lbmQvTnVsbEVuZERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9wdXJnZS1kZWZhdWx0L1B1cmdlRGVmYXVsdFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3JldmFsaWRhdGUvUmV2YWxpZGF0ZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtY291bnQvU2NoZWR1bGVDb3VudERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9GdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL01heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9Nb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL051bGxFbmRWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL092ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL1NjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2Nyb2xsL1Njcm9sbFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL01pbnV0ZXNBc1RleHRGaWx0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL1RpbWVPZkRheUZpbHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUtcmFuZ2UvVGltZVJhbmdlQ29tcG9uZW50LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdG91Y2gvVG91Y2hTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdmFsdWUtbm9ybWFsaXphdGlvbi9WYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5TWFwLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvTnVsbEVuZFdpZHRoLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL1dlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnkudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL1dlZWtseVNjaGVkdWxlclJhbmdlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1yYW5nZS9XZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnkudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3pvb20vWm9vbVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9hZGFwdGVyL0lXZWVrbHlTY2hlZHVsZXJBZGFwdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy1tb2RlL0RyYWdNb2RlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaW52YWxpZC1tZXNzYWdlL0ludmFsaWRNZXNzYWdlcy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3BvaW50L0lQb2ludC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZVByb3ZpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL1Jlc3RyaWN0aW9uRXhwbGFuYXRpb25zLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtY291bnQvU2NoZWR1bGVDb3VudE9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9EYXlzLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyT3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9JSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1yYW5nZS9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzlDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDL0QsVUFBVSxFQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSTtRQUVyRCxNQUFNLENBQUMsS0FBSyxHQUFHO1lBQ2IsT0FBTyxFQUFFO2dCQUNQLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDdkIsVUFBVSxFQUFFLFVBQUMsR0FBRyxFQUFFLFNBQVM7b0JBQ3pCLE9BQU87d0JBQ0wsR0FBRyxFQUFFLEdBQUc7d0JBQ1IsU0FBUyxFQUFFLFNBQVM7cUJBQ3JCLENBQUE7Z0JBQ0gsQ0FBQztnQkFDRCxZQUFZLEVBQUUsS0FBSztnQkFDbkIsUUFBUSxFQUFFLFVBQVUsUUFBUTtvQkFDMUIsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQ3RCLE9B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RSxLQUFpQixFQUFFLEtBQWE7UUFDOUQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDSCxJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBbkZNLGlCQUFLLEdBQUcsOEJBQThCLENBQUM7SUFFdkMsbUJBQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBa0ZwQyxrQkFBQztDQXJGRCxBQXFGQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ2JyLndlZWtseVNjaGVkdWxlciddKVxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHEnLCAnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRxOiBhbmd1bGFyLklRU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGJ1dHRvbkNsYXNzZXM6IFsnd293ISddLFxyXG4gICAgICAgICAgY3JlYXRlSXRlbTogKGRheSwgc2NoZWR1bGVzKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgZGF5OiBkYXksXHJcbiAgICAgICAgICAgICAgc2NoZWR1bGVzOiBzY2hlZHVsZXMsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uIChzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiAkcS53aGVuKHNjaGVkdWxlKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBpbnRlcnZhbDogMSxcclxuICAgICAgICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4ge1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zOiB7XHJcbiAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBTbG90cyBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gJHt2YWx1ZX0hYFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjaGVkdWxlQ291bnRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvdW50OiAyLFxyXG4gICAgICAgICAgICBleGFjdDogZmFsc2VcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGFzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5tb2RlbDIgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLm1vZGVsKTtcclxuICAgICAgJHNjb3BlLm1vZGVsMi5vcHRpb25zLmZpbGxFbXB0eVdpdGhEZWZhdWx0ID0gdHJ1ZTtcclxuICAgICAgJHNjb3BlLm1vZGVsMi5vcHRpb25zLmludGVydmFsID0gMTU7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5tYXhUaW1lU2xvdCA9IDkwMDtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5zYXZlU2NoZWR1bGVyID0gKCkgPT4ge1xyXG4gICAgICAgICRzY29wZS5hZGFwdGVyVHdvUmVzdWx0ID0gJHNjb3BlLmFkYXB0ZXJUd28uZ2V0U25hcHNob3QoKTtcclxuICAgICAgICByZXR1cm4gJHEud2hlbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwub3B0aW9ucy5udWxsRW5kcyA9IHRydWU7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlciA9IG5ldyBEZW1vQWRhcHRlcihbXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBEYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDEzODAsXHJcbiAgICAgICAgLy8gICBlbmQ6IG51bGwsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogNjAwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuTW9uZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDcyMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlR1ZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogNjAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMzAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5GcmlkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyVHdvID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogNzIwLFxyXG4gICAgICAgICAgZW5kOiAxNDQwLFxyXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDcyMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UaHVyc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5GcmlkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU2F0dXJkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIF0pO1xyXG4gICAgICBcclxuICAgICAgJHNjb3BlLnNhdmVBbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHNjb3BlLnJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyLmdldFNuYXBzaG90KCkpICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmFkYXB0ZXJUd28uZ2V0U25hcHNob3QoKSk7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbi8qKiBUaGUgZGF0YSBpcyBhbHJlYWR5IGluIGFuIGFjY2VwdGFibGUgZm9ybWF0IGZvciB0aGUgZGVtbyBzbyBqdXN0IHBhc3MgaXQgdGhyb3VnaCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9BZGFwdGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj4sIGJvb2xlYW4+IHtcclxuICBwdWJsaWMgaXRlbXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxib29sZWFuPltdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGluaXRpYWxEYXRhOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+W10sXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U25hcHNob3QoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgIHJldHVybiBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UocmFuZ2UpIHtcclxuICAgIHJldHVybiByYW5nZTtcclxuICB9XHJcbn1cclxuIiwiYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQWRhcHRlclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQWRhcHRlclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBncm91cFNlcnZpY2U6IEdyb3VwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SXRlbXNGcm9tQWRhcHRlcihjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgYWRhcHRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55Pikge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKGFkYXB0ZXIpIHtcclxuICAgICAgICAgIGxldCBzY2hlZHVsZXMgPSBhZGFwdGVyLmluaXRpYWxEYXRhLm1hcChkYXRhID0+IGFkYXB0ZXIuY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGRhdGEpKTtcclxuICAgICAgICAgIGxldCBncm91cGVkU2NoZWR1bGVzID0gdGhpcy5ncm91cFNlcnZpY2UuZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuICAgIFxyXG4gICAgICAgICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWRTY2hlZHVsZXMpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1GYWN0b3J5LmNyZWF0ZUl0ZW0oY29uZmlnLCBwYXJzZUludChrZXksIDEwKSwgZ3JvdXBlZFNjaGVkdWxlc1trZXldKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQWRhcHRlclNlcnZpY2UuJG5hbWUsIEFkYXB0ZXJTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBDb25maWd1cmF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGdldENvbmZpZ3VyYXRpb24ob3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICAgICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgICAgICB2YXIgbWludXRlc0luRGF5ID0gaG91cnNJbkRheSAqIDYwO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0gdGhpcy5nZXREZWZhdWx0T3B0aW9ucygpO1xyXG5cclxuICAgICAgICB2YXIgdXNlck9wdGlvbnMgPSBhbmd1bGFyLm1lcmdlKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKHVzZXJPcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICAgICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdE9wdGlvbnMoKTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgICAgICAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBvbkNoYW5nZTogKCkgPT4gYW5ndWxhci5ub29wKCksXHJcbiAgICAgICAgICAgIG9uUmVtb3ZlOiAoKSA9PiBhbmd1bGFyLm5vb3AoKSxcclxuICAgICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHt2YWx1ZX1gLFxyXG4gICAgICAgICAgICAgICAgZnVsbENhbGVuZGFyOiAnRm9yIHRoaXMgY2FsZW5kYXIsIGV2ZXJ5IGRheSBtdXN0IGJlIGNvbXBsZXRlbHkgZnVsbCBvZiBzY2hlZHVsZXMuJyxcclxuICAgICAgICAgICAgICAgIG1vbm9TY2hlZHVsZTogJ1RoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBvbmUgdGltZSBzbG90IHBlciBkYXknLFxyXG4gICAgICAgICAgICAgICAgbnVsbEVuZHM6ICdJdGVtcyBpbiB0aGlzIGNhbGVuZGFyIGRvIG5vdCBoYXZlIGVuZCB0aW1lcy4gU2NoZWR1bGVkIGV2ZW50cyBiZWdpbiBhdCB0aGUgc3RhcnQgdGltZSBhbmQgZW5kIHdoZW4gdGhleSBhcmUgZmluaXNoZWQuJyxcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlQ291bnQ6IChvcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhhY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBUaGlzIGNhbGVuZGFyIG11c3QgaGF2ZSBleGFjdGx5ICR7b3B0aW9ucy5jb3VudH0gc2xvdHMgcGVyIGRheWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgYSBtYXhpbXVtIG9mICR7b3B0aW9ucy5jb3VudH0gc2xvdHMgcGVyIGRheWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2hlZHVsZUNvdW50T3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShDb25maWd1cmF0aW9uU2VydmljZS4kbmFtZSwgQ29uZmlndXJhdGlvblNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGdldENvbmZsaWN0aW5nT3B0aW9ucyhvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55Pikge1xyXG4gICAgICAgIGlmIChvcHRpb25zLmZ1bGxDYWxlbmRhciAmJiBvcHRpb25zLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgT3B0aW9ucyAnZnVsbENhbGVuZGFyJyAmICdmaWxsRW1wdHlXaXRoRGVmYXVsdCcgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS5gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsbEVtcHR5V2l0aERlZmF1bHQgJiYgIWFuZ3VsYXIuaXNEZWZpbmVkKG9wdGlvbnMuZGVmYXVsdFZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYElmIHVzaW5nIG9wdGlvbiAnZmlsbEVtcHR5V2l0aERlZmF1bHQnLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgJ2RlZmF1bHRWYWx1ZS4nYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuJG5hbWUsIENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIERyYWdTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckRyYWdTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlcixcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RHJhZ1JhbmdlRnJvbVNjaGVkdWxlKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBjb25maWcubnVsbEVuZHMgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHNjaGVkdWxlLnN0YXJ0ICsgdGhpcy5udWxsRW5kV2lkdGgpIDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBzY2hlZHVsZS5lbmQpLFxyXG4gICAgICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKERyYWdTZXJ2aWNlLiRuYW1lLCBEcmFnU2VydmljZSk7XHJcbiIsIi8qKlxyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGpRdWVyeSB0byBrZWVwIGRlcGVuZGVuY2llcyBtaW5pbWFsXHJcbiAqL1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBFbGVtZW50T2Zmc2V0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbGVtZW50T2Zmc2V0U2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGxlZnQoJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByaWdodCgkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRWxlbWVudE9mZnNldFNlcnZpY2UuJG5hbWUsIEVsZW1lbnRPZmZzZXRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBFbmRBZGp1c3RlclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGVuZCA9PT0gY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVuZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRqdXN0RW5kRm9yVmlldyhjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubWF4VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRW5kQWRqdXN0ZXJTZXJ2aWNlLiRuYW1lLCBFbmRBZGp1c3RlclNlcnZpY2UpO1xyXG4iLCIvKiogV2hlbiB1c2luZyB0aGUgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBvcHRpb24sIHRoaXMgc2VydmljZSB3aWxsIGJlIHVzZWQgdG8gY29uc3RydWN0IHRoZSBjb3JyZWN0IGNhbGVuZGFyIGZvciBzZXJ2ZXIgc3VibWlzc2lvbiAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZmlsbChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIGlmICghc2NoZWR1bGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW3RoaXMuZ2V0RW1wdHlTY2hlZHVsZShpdGVtLCBjb25maWcpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpbGxlZFNjaGVkdWxlcyhzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRFbXB0eVNjaGVkdWxlKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogaXRlbS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKGNvbmZpZywgY29uZmlnLm1heFZhbHVlKSxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEVuZFNjaGVkdWxlKGxhc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogbGFzdFNjaGVkdWxlLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IGxhc3RTY2hlZHVsZS5lbmQsXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTdGFydFNjaGVkdWxlKGZpcnN0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGZpcnN0U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgICAgZW5kOiBmaXJzdFNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IFtzY2hlZHVsZV07XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5zY2hlZHVsZVRvdWNoZXNTdGFydChzY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXMucHVzaCh0aGlzLmdldFN0YXJ0U2NoZWR1bGUoc2NoZWR1bGUsIGNvbmZpZykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlVG91Y2hlc0VuZChzY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXMucHVzaCh0aGlzLmdldEVuZFNjaGVkdWxlKHNjaGVkdWxlLCBjb25maWcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RmlsbGVkU2NoZWR1bGVzKHNjaGVkdWxlczogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHNjaGVkdWxlcyA9IHRoaXMuZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcblxyXG4gICAgICAgIGlmIChzY2hlZHVsZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbGxlZFNjaGVkdWxlc0ZvclNpbmdsZVNjaGVkdWxlKHNjaGVkdWxlc1swXSwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICBcclxuICAgICAgICAvLyAyIGF0IGEgdGltZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgaXNGaXJzdExvb3AgPSBpID09IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNGaXJzdExvb3AgJiYgIXRoaXMuc2NoZWR1bGVUb3VjaGVzU3RhcnQoY3VycmVudFNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnRTY2hlZHVsZSA9IHRoaXMuZ2V0U3RhcnRTY2hlZHVsZShjdXJyZW50U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2goc3RhcnRTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zY2hlZHVsZXNUb3VjaChjdXJyZW50U2NoZWR1bGUsIG5leHRTY2hlZHVsZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdTY2hlZHVsZSA9IHRoaXMuZ2V0TmV3U2NoZWR1bGUoY3VycmVudFNjaGVkdWxlLCBuZXh0U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2gobmV3U2NoZWR1bGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaXNMYXN0TG9vcCA9IGkgPT0gbGVuIC0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0xhc3RMb29wICYmICF0aGlzLnNjaGVkdWxlVG91Y2hlc0VuZChuZXh0U2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlbmRTY2hlZHVsZSA9IHRoaXMuZ2V0RW5kU2NoZWR1bGUobmV4dFNjaGVkdWxlLCBjb25maWcpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKGVuZFNjaGVkdWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5ld1NjaGVkdWxlKGN1cnJlbnRTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgbmV4dFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBjdXJyZW50U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogY3VycmVudFNjaGVkdWxlLmVuZCxcclxuICAgICAgICAgICAgZW5kOiBuZXh0U2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgLSBiLnN0YXJ0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlc1RvdWNoKGVhcmxpZXJTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgbGF0ZXJTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBlYXJsaWVyU2NoZWR1bGUuZW5kID09PSBsYXRlclNjaGVkdWxlLnN0YXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVUb3VjaGVzU3RhcnQoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlLnN0YXJ0ID09PSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVG91Y2hlc0VuZChzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUuZW5kID09PSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbChjb25maWcsIGNvbmZpZy5tYXhWYWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UuJG5hbWUsIEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRnVsbENhbGVuZGFyRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickZ1bGxDYWxlbmRhcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoYXR0cnMuYnJGdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEZ1bGxDYWxlbmRhckRpcmVjdGl2ZS4kbmFtZSwgRnVsbENhbGVuZGFyRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR2hvc3RTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyR2hvc3RTbG90Q29udHJvbGxlcic7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdnaG9zdFNsb3RDdHJsJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtdWx0aVNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickdob3N0U2xvdCc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBHaG9zdFNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBtdWx0aVNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPG5nLXRyYW5zY2x1ZGUgY2xhc3M9XCJmdWxsV2lkdGhcIj48L25nLXRyYW5zY2x1ZGU+XHJcbiAgICBgO1xyXG5cclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG59XHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihHaG9zdFNsb3RDb250cm9sbGVyLiRuYW1lLCBHaG9zdFNsb3RDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChHaG9zdFNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBHaG9zdFNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKlxyXG4gKiBXZSBzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IHRoZSBzY2hlZHVsZXMgYmVmb3JlaGFuZCwgcGFzcyBqdXN0IHRoZSBzY2hlZHVsZXMgaW4gYW5kIGhhdmUgdGhpcyBwYWNrYWdlIGJ1aWxkIHRoZSBpdGVtc1xyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGluIGNsaWVudHMuXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGxvZGFzaC5ncm91cEJ5IHRvIGtlZXAgdGhlIGZvb3RwcmludCBzbWFsbCBcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdyb3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJHcm91cFNlcnZpY2UnO1xyXG5cclxuICAgIGdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0ge1xyXG4gICAgICAgIGxldCBzZWVkOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHNjaGVkdWxlcy5yZWR1Y2UoKHJlZHVjZXIsIGN1cnJlbnRTY2hlZHVsZSwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBjdXJyZW50U2NoZWR1bGUuZGF5O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZWR1Y2VyW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHJlZHVjZXJba2V5XSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZWR1Y2VyW2tleV0ucHVzaChjdXJyZW50U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlZHVjZXI7XHJcbiAgICAgICAgfSwgc2VlZCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShHcm91cFNlcnZpY2UuJG5hbWUsIEdyb3VwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJIYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJyxcclxuICAgIGltbWVkaWF0ZTogJzwnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgbW91c2VUcmFja2VyU2VydmljZSA9IHRoaXMubW91c2VUcmFja2VyU2VydmljZTtcclxuICAgIHZhciB0b3VjaFNlcnZpY2UgPSB0aGlzLnRvdWNoU2VydmljZTtcclxuICAgIHZhciB4ID0gMDtcclxuXHJcbiAgICBsZXQgbW91c2Vkb3duRXZlbnQ6IHN0cmluZyA9ICdtb3VzZWRvd24gdG91Y2hzdGFydCc7XHJcbiAgICBsZXQgbW91c2Vtb3ZlRXZlbnQ6IHN0cmluZyA9ICdtb3VzZW1vdmUgdG91Y2htb3ZlJztcclxuICAgIGxldCBtb3VzZXVwRXZlbnQ6IHN0cmluZyA9ICdtb3VzZXVwIHRvdWNoZW5kJztcclxuXHJcbiAgICBlbGVtZW50Lm9uKG1vdXNlZG93bkV2ZW50LCBtb3VzZWRvd24pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlZG93bihldmVudCkge1xyXG4gICAgICB4ID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgaGFuZGxlcnMgZnJvbSBiZWluZyBmaXJlZCBpZiB0aGV5IGFyZSBuZXN0ZWQgKG9ubHkgdGhlIG9uZSB5b3UgZGlyZWN0bHkgaW50ZXJhY3RlZCB3aXRoIHNob3VsZCBmaXJlKVxyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgIHN0YXJ0RHJhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZha2VNb3VzZWRvd24oKSB7XHJcbiAgICAgIHggPSBtb3VzZVRyYWNrZXJTZXJ2aWNlLmdldE1vdXNlUG9zaXRpb24oKS54O1xyXG5cclxuICAgICAgc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFnZVgoZXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGV2ZW50LnBhZ2VYIHx8IHRvdWNoU2VydmljZS5nZXRQYWdlWChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIGxldCBwYWdlWCA9IGdldFBhZ2VYKGV2ZW50KTtcclxuICAgICAgdmFyIGRlbHRhID0gcGFnZVggLSB4O1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWcpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSB9KSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKG1vdXNlbW92ZUV2ZW50LCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0b3ApKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLm9uZHJhZ3N0b3AoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydERyYWcoKSB7XHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseUFzeW5jKHNjb3BlLm9uZHJhZ3N0YXJ0KCkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNjb3BlLmltbWVkaWF0ZSkge1xyXG4gICAgICBmYWtlTW91c2Vkb3duKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG1vdXNlVHJhY2tlclNlcnZpY2U6IE1vdXNlVHJhY2tlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHRvdWNoU2VydmljZTogVG91Y2hTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50LCBtb3VzZVRyYWNrZXJTZXJ2aWNlLCB0b3VjaFNlcnZpY2UpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50LCBtb3VzZVRyYWNrZXJTZXJ2aWNlLCB0b3VjaFNlcnZpY2UpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckZG9jdW1lbnQnLCAnYnJXZWVrbHlTY2hlZHVsZXJNb3VzZVRyYWNrZXJTZXJ2aWNlJywgJ2JyV2Vla2x5U2NoZWR1bGVyVG91Y2hTZXJ2aWNlJ107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIb3VybHlHcmlkRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickhvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICdeYnJXZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmJFbGVtZW50czogaG91ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gU3RyaXBlIGl0IGJ5IGhvdXJcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdzdHJpcGVkJyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudEhvdXIgPSBpICUgMTI7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGkgPj0gMTIgPyAncCcgOiAnYSc7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC50ZXh0KGAke2N1cnJlbnRIb3VyIHx8ICcxMid9JHttZXJpZGllbX1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBudW1JbnRlcnZhbHNJblRpY2sgPSA2MCAvIGNvbmZpZy5pbnRlcnZhbDtcclxuICAgICAgICAgICAgbGV0IGludGVydmFsUGVyY2VudGFnZSA9IDEwMCAvIG51bUludGVydmFsc0luVGljaztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtSW50ZXJ2YWxzSW5UaWNrOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBncmFuZENoaWxkID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmF0dHIoJ3JlbCcsICgoaSAqIG51bUludGVydmFsc0luVGljaykgKyBqKSAqIGNvbmZpZy5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmFkZENsYXNzKCdpbnRlcnZhbCcpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5jc3MoJ3dpZHRoJywgaW50ZXJ2YWxQZXJjZW50YWdlICsgJyUnKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFwcGVuZChncmFuZENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSG91cmx5R3JpZERpcmVjdGl2ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShIb3VybHlHcmlkRGlyZWN0aXZlLiRuYW1lLCBIb3VybHlHcmlkRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTGFzdEdob3N0RGF5U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJMYXN0R2hvc3REYXlTZXJ2aWNlJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gZHJhZ2dpbmcgZ2hvc3RzIGFjcm9zcyBtdWx0aXBsZSBkYXlzLCBpZiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgcG9pbnRlciBvdXQgb2Ygb25lIGV4dHJlbWUgYW5kIGJhY2sgaW50byB0aGUgbGFzdCBzbG90IHRoYXQgcmVuZGVyZWQgYSBnaG9zdCxcclxuICAgICAqIFdlIHNob3VsZCByZW1vdmUgdGhlIGdob3N0IGZyb20gdGhhdCBleHRyZW1lLiBUaGlzIHdpbGwgaGVscCBncmFiIHRoZSBjb3JyZWN0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TGFzdEdob3N0RGF5KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleCA9IHRoaXMuZ2V0T3JpZ2luSW5kZXgoaXRlbXMpO1xyXG4gICAgICAgIGxldCByZW5kZXJlZEdob3N0SW5kaWNlcyA9IHRoaXMuZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXMpO1xyXG5cclxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIG90aGVyICRyZW5kZXJHaG9zdCBpdGVtcyBhcmUgYWJvdmUgb3IgYmVsb3cgdGhlICRpc0dob3N0T3JpZ2luIGl0ZW1cclxuICAgICAgICBsZXQgYWJvdmUgPSByZW5kZXJlZEdob3N0SW5kaWNlcy5ldmVyeShpID0+IGkgPD0gb3JpZ2luSW5kZXgpO1xyXG5cclxuICAgICAgICAvLyB0YWtlIGZpcnN0IGl0ZW0gZm9yIGFib3ZlIG9yIGxhc3QgaXRlbSBmb3IgYmVsb3dcclxuICAgICAgICBsZXQgbGFzdEdob3N0RGF5SW5kZXggPSBhYm92ZSA/IDAgOiByZW5kZXJlZEdob3N0SW5kaWNlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVuZGVyZWRHaG9zdEluZGljZXNbbGFzdEdob3N0RGF5SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgdGhlIGluZGV4IG9mIHRoZSAkaXNHaG9zdE9yaWdpbiBpdGVtICovXHJcbiAgICBwcml2YXRlIGdldE9yaWdpbkluZGV4KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleDtcclxuICAgICAgICBsZXQgbGVuID0gaXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLiRpc0dob3N0T3JpZ2luKSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5JbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbkluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgYWxsIG9mIHRoZSBpdGVtIGluZGljZXMgdGhhdCBjdXJyZW50bHkgaGF2ZSBnaG9zdHMgcmVuZGVyZWQgKi9cclxuICAgIHByaXZhdGUgZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICAgICAgbGV0IHJlbmRlcmVkR2hvc3RJbmRpY2VzID0gW107XHJcbiAgICAgICAgbGV0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSBpdGVtc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlcmVkR2hvc3RJbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZW5kZXJlZEdob3N0SW5kaWNlcztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKExhc3RHaG9zdERheVNlcnZpY2UuJG5hbWUsIExhc3RHaG9zdERheVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1heFRpbWVTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdick1heFRpbWVTbG90JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyTWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXhUaW1lU2xvdERpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShNYXhUaW1lU2xvdERpcmVjdGl2ZS4kbmFtZSwgTWF4VGltZVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWlzc2luZ0RheXNTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pc3NpbmdEYXlzU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGRheU1hcDogRGF5TWFwLFxyXG4gICAgICAgIHByaXZhdGUgaXRlbUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzY2hlZHVsZXIgc2hvdWxkIGFsd2F5cyBzaG93IGFsbCBkYXlzLCBldmVuIGlmIGl0IHdhcyBub3QgcGFzc2VkIGFueSBzY2hlZHVsZXMgZm9yIHRoYXQgZGF5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaWxsSXRlbXMoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmRheU1hcCwgKGRheTogc3RyaW5nLCBzdHJpbmdLZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgbGV0IGtleSA9IHBhcnNlSW50KHN0cmluZ0tleSwgMTApO1xyXG4gICAgICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgICAgIGxldCBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCA/IGZpbHRlcmVkSXRlbXNbMF0gOiBudWxsO1xyXG4gICAgXHJcbiAgICAgICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5pdGVtRmFjdG9yeS5jcmVhdGVJdGVtKGNvbmZpZywga2V5LCBbXSkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZW0gRElEIGV4aXN0IGp1c3Qgc2V0IHRoZSBsYWJlbFxyXG4gICAgICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG4gICAgXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWlzc2luZ0RheXNTZXJ2aWNlLiRuYW1lLCBNaXNzaW5nRGF5c1NlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1vbm9TY2hlZHVsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJNb25vU2NoZWR1bGUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyTW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTW9ub1NjaGVkdWxlRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShNb25vU2NoZWR1bGVEaXJlY3RpdmUuJG5hbWUsIE1vbm9TY2hlZHVsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb3VzZVRyYWNrZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1vdXNlVHJhY2tlclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW91c2VQb3NpdGlvbjogSVBvaW50O1xyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9ICdtb3VzZW1vdmUgdG91Y2htb3ZlJztcclxuXHJcbiAgICAgICAgbGV0IGV2ZW50ID0gdGhpcy5zZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuJGRvY3VtZW50LnVuYmluZChldmVudE5hbWUsIGV2ZW50KTtcclxuICAgICAgICB0aGlzLiRkb2N1bWVudC5vbihldmVudE5hbWUsIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TW91c2VQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0TW91c2VQb3NpdGlvbihldmVudCkge1xyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IHsgeDogZXZlbnQucGFnZVgsIHk6IGV2ZW50LnBhZ2VZIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb3VzZVRyYWNrZXJTZXJ2aWNlLiRuYW1lLCBNb3VzZVRyYWNrZXJTZXJ2aWNlKVxyXG4gICAgLnJ1bihbTW91c2VUcmFja2VyU2VydmljZS4kbmFtZSwgKG1vdXNlVHJhY2tlclNlcnZpY2U6IE1vdXNlVHJhY2tlclNlcnZpY2UpID0+IHtcclxuICAgICAgICBtb3VzZVRyYWNrZXJTZXJ2aWNlLmluaXRpYWxpemUoKTtcclxuICAgIH1dKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlckNvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ211bHRpU2xpZGVyQ3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJNb3VzZVRyYWNrZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBlbGVtZW50T2Zmc2V0U2VydmljZTogRWxlbWVudE9mZnNldFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtb3VzZVRyYWNrZXJTZXJ2aWNlOiBNb3VzZVRyYWNrZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlcixcclxuICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnksXHJcbiAgICBwcml2YXRlIHZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2U6IFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYWdTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuICBwcml2YXRlIHBlbmRpbmdTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBzdGFydGluZ0dob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH07XHJcbiAgcHJpdmF0ZSBzZXRHaG9zdFZhbHVlczogKG9wdGlvbnM6IHsgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH0gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcbiAgXHJcbiAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG5cclxuICBwcml2YXRlIGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMub25Nb3VzZUVudGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9uTW91c2VMZWF2ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgIHRoaXMub25Nb3VzZVVwKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNPTU1JVF9HSE9TVCwgKGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgaWYgKHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgICB0aGlzLmNvbW1pdEdob3N0KGdob3N0U2NoZWR1bGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9HSE9TVCwgKGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRheTogbnVtYmVyKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pdGVtLiRpc0dob3N0T3JpZ2luICYmIHRoaXMuaXRlbS5kYXkgPT09IGRheSkge1xyXG4gICAgICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfQUxMX0dIT1NUUywgKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW0uJHJlbmRlckdob3N0ID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZUVudGVyKCkge1xyXG4gICAgLy8gSWYgdGhlIGN1cnNvciBpcyBtb3ZpbmcgQkFDSyBpbnRvIGFuIGl0ZW0gdGhhdCBBTFJFQURZIGhhcyBhIGdob3N0IHJlbmRlcmVkLCB3ZSdsbCB3YW50IHRvIHJlbW92ZSB0aGUgZ2hvc3QgZnJvbSB0aGUgaXRlbSB0aGF0IHdhcyBsZWZ0XHJcbiAgICBpZiAodGhpcy5pdGVtLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0xBU1RfR0hPU1QpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmRyYWdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLmFkZERyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdob3N0VmFsdWVzICYmICF0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlR2hvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZUxlYXZlKCkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ1NjaGVkdWxlKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlRHJhZ1NjaGVkdWxlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VVcCgpIHtcclxuICAgIGlmICh0aGlzLnBlbmRpbmdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLmNvbW1pdERyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGREcmFnU2NoZWR1bGUoKSB7XHJcbiAgICB0aGlzLmRyYWdTY2hlZHVsZS5kYXkgPSB0aGlzLml0ZW0uZGF5O1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSB0aGlzLml0ZW0uYWRkU2NoZWR1bGUodGhpcy5kcmFnU2NoZWR1bGUpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgdGhpcy5pdGVtLnJlbW92ZVNjaGVkdWxlKHRoaXMuZHJhZ1NjaGVkdWxlKTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tbWl0RHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUuJGlzQWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHRoaXMucGVuZGluZ1NjaGVkdWxlKTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2NoZWR1bGVGb3JBZGQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIHN0YXJ0ID0gdGhpcy52YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLm5vcm1hbGl6ZVZhbHVlKHN0YXJ0LCAwLCBlbmQpO1xyXG4gICAgZW5kID0gdGhpcy52YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLm5vcm1hbGl6ZVZhbHVlKGVuZCwgc3RhcnQsIHRoaXMuY29uZmlnLm1heFZhbHVlKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgZW5kID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2NoZWR1bGUgPSB7XHJcbiAgICAgIGRheTogdGhpcy5pdGVtLmRheSxcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZCxcclxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gc2NoZWR1bGU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5FZGl0b3JGb3JBZGQoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IGFuZ3VsYXIuSVByb21pc2U8YnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+PiB7XHJcbiAgICBpZiAodGhpcy5pdGVtLmNhbkVkaXQoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHEud2hlbihzY2hlZHVsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogRXhwYW5kIGdob3N0IHdoaWxlIGRyYWdnaW5nIGluIGl0ICovXHJcbiAgcHVibGljIGFkanVzdEdob3N0KCkge1xyXG4gICAgbGV0IHBvaW50ID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlLmdldE1vdXNlUG9zaXRpb24oKTtcclxuICAgIGxldCBtb3VzZVZhbHVlOiBudW1iZXIgPSB0aGlzLmdldFZhbEF0TW91c2VQb3NpdGlvbihwb2ludC54KTtcclxuXHJcbiAgICBsZXQgZXhpc3RpbmdMZWZ0VmFsdWU6IG51bWJlciA9IHRoaXMuc3RhcnRpbmdHaG9zdFZhbHVlcy5sZWZ0O1xyXG5cclxuICAgIGxldCB1cGRhdGVkTGVmdFZhbHVlOiBudW1iZXI7XHJcbiAgICBsZXQgdXBkYXRlZFJpZ2h0VmFsdWU6IG51bWJlcjtcclxuICAgIFxyXG4gICAgaWYgKG1vdXNlVmFsdWUgPCBleGlzdGluZ0xlZnRWYWx1ZSkgeyAvLyB1c2VyIGlzIGRyYWdnaW5nIGxlZnRcclxuICAgICAgdXBkYXRlZExlZnRWYWx1ZSA9IG1vdXNlVmFsdWU7XHJcbiAgICAgIHVwZGF0ZWRSaWdodFZhbHVlID0gZXhpc3RpbmdMZWZ0VmFsdWU7XHJcbiAgICB9IGVsc2UgeyAvLyB1c2VyIGlzIGRyYWdnaW5nIHJpZ2h0XHJcbiAgICAgIHVwZGF0ZWRMZWZ0VmFsdWUgPSBleGlzdGluZ0xlZnRWYWx1ZTtcclxuICAgICAgdXBkYXRlZFJpZ2h0VmFsdWUgPSBtb3VzZVZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBnaG9zdFZhbHVlcyA9IHtcclxuICAgICAgbGVmdDogdGhpcy5ub3JtYWxpemVHaG9zdFZhbHVlKHVwZGF0ZWRMZWZ0VmFsdWUpLFxyXG4gICAgICByaWdodDogdGhpcy5ub3JtYWxpemVHaG9zdFZhbHVlKHVwZGF0ZWRSaWdodFZhbHVlKVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNldEdob3N0VmFsdWVzKHsgXHJcbiAgICAgIGdob3N0VmFsdWVzOiBnaG9zdFZhbHVlc1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKiBNb3ZlIGdob3N0IGFyb3VuZCB3aGlsZSBub3QgZHJhZ2dpbmcgKi9cclxuICBwdWJsaWMgcG9zaXRpb25HaG9zdCgpIHtcclxuICAgIGxldCBwb2ludCA9IHRoaXMubW91c2VUcmFja2VyU2VydmljZS5nZXRNb3VzZVBvc2l0aW9uKCk7XHJcbiAgICBsZXQgdmFsID0gdGhpcy5nZXRWYWxBdE1vdXNlUG9zaXRpb24ocG9pbnQueCk7XHJcblxyXG4gICAgdGhpcy5zdGFydGluZ0dob3N0VmFsdWVzID0ge1xyXG4gICAgICBsZWZ0OiB2YWwsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IHZhbCArIHRoaXMubnVsbEVuZFdpZHRoIDogdmFsICsgdGhpcy5jb25maWcuaW50ZXJ2YWxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZXRHaG9zdFZhbHVlcyh7XHJcbiAgICAgIGdob3N0VmFsdWVzOiBhbmd1bGFyLmNvcHkodGhpcy5zdGFydGluZ0dob3N0VmFsdWVzKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25HaG9zdFdyYXBwZXJNb3VzZURvd24oKSB7XHJcbiAgICB0aGlzLml0ZW0uJGlzR2hvc3RPcmlnaW4gPSB0cnVlO1xyXG4gICAgdGhpcy5jcmVhdGVHaG9zdCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VNb3ZlKCkge1xyXG4gICAgLy8gbnVsbEVuZHMgY2FsZW5kYXJzIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgYmVjYXVzZSB0aGUgc2l6ZSBvZiB0aGUgc2xvdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXJcclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uR2hvc3QoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgIHRoaXMuYWRqdXN0R2hvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlVXAoKSB7XHJcbiAgICBsZXQgZ2hvc3RTY2hlZHVsZSA9IHRoaXMuZ2V0U2NoZWR1bGVGb3JBZGQodGhpcy5naG9zdFZhbHVlcy5sZWZ0LCB0aGlzLmdob3N0VmFsdWVzLnJpZ2h0KTtcclxuXHJcbiAgICB0aGlzLm9wZW5FZGl0b3JGb3JBZGQoZ2hvc3RTY2hlZHVsZSkudGhlbihlZGl0ZWRHaG9zdFNjaGVkdWxlID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIGVkaXRlZEdob3N0U2NoZWR1bGUpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0FOQ0VMX0dIT1NUKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVHaG9zdCgpIHtcclxuICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSB0cnVlO1xyXG4gICAgdGhpcy5wb3NpdGlvbkdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbW1pdEdob3N0KGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSBmYWxzZTtcclxuICAgIHRoaXMuaXRlbS4kaXNHaG9zdE9yaWdpbiA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0aGlzLml0ZW0uY2FuQWRkU2NoZWR1bGUoKSkge1xyXG4gICAgICB0aGlzLml0ZW0uYWRkU2NoZWR1bGVBbmRNZXJnZShnaG9zdFNjaGVkdWxlKTtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgICAgdGhpcy5zZXRHaG9zdFZhbHVlcyhudWxsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TW91c2VQb3NpdGlvbihwYWdlWDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZWxlbWVudE9mZnNldFggPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLmxlZnQodGhpcy4kZWxlbWVudCk7XHJcbiAgICBsZXQgbGVmdCA9IHBhZ2VYIC0gZWxlbWVudE9mZnNldFg7XHJcblxyXG4gICAgcmV0dXJuIGxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZhbEF0TW91c2VQb3NpdGlvbihwYWdlWDogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5waXhlbFRvVmFsKHRoaXMuZ2V0TW91c2VQb3NpdGlvbihwYWdlWCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybSBhbiBleHRlcm5hbCBhY3Rpb24gdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBhIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLml0ZW0uY2FuRWRpdCgpKSB7XHJcbiAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKG5ld1NjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgbGV0IHJhbmdlID0gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UodGhpcy5jb25maWcsIG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkRGVsZXRlKHJhbmdlKSkge1xyXG4gICAgICAgICAgdGhpcy5pdGVtLnJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGV0IHByZW1lcmdlU2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkocmFuZ2UpO1xyXG5cclxuICAgICAgICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHJhbmdlKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiBtZXJnaW5nIG11dGF0ZWQgdGhlIHNjaGVkdWxlIGZ1cnRoZXIsIHRoZW4gdXBkYXRlU2NoZWR1bGUgd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHNvIHRoYXQgZWRpdHMgdGhhdCBkb24ndCB0cmlnZ2VyIG1lcmdlcyBzdGlsbCB0cmlnZ2VyIG9uQ2hhbmdlLFxyXG4gICAgICAgICAgLy8gYnV0IGVkaXRzIHRoYXQgZG8gdHJpZ2dlciBtZXJnZXMgZG9uJ3QgdHJpZ2dlciBpdCB0d2ljZVxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHByZW1lcmdlU2NoZWR1bGUsIHJhbmdlKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZS51cGRhdGUocmFuZ2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgZXhjZXB0IGVhdCB0aGUgdW5oYW5kbGVkIHJlamVjdGlvbiBlcnJvclxyXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90TGVmdChzdGFydDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsOiBIVE1MRWxlbWVudCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKHN0YXJ0KTtcclxuXHJcbiAgICByZXR1cm4gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIElmIHRoZXJlIGlzIGEgbnVsbCBlbmQsIHBsYWNlIHRoZSBlbmQgb2YgdGhlIHNsb3QgdHdvIGhvdXJzIGF3YXkgZnJvbSB0aGUgYmVnaW5uaW5nLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA9PT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBzdGFydCArIHRoaXMubnVsbEVuZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLnJpZ2h0KHRoaXMuJGVsZW1lbnQpO1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodDtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHZhbDogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xyXG4gICAgdmFsID0gdGhpcy5ub3JtYWxpemVJbnRlcnZhbFZhbHVlKHZhbCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3VsZERlbGV0ZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAoc2NoZWR1bGUuJGlzRGVsZXRpbmcpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZpbGxFbXB0eVdpdGhEZWZhdWx0ICYmIHNjaGVkdWxlLnZhbHVlID09PSB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG5vcm1hbGl6ZUludGVydmFsVmFsdWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIHJpZ2h0IG9mIHRoZSByaWdodG1vc3QgaW50ZXJ2YWwgLS0gdGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBub3QgYWN0dWFsbHkgcmVuZGVyIHdpdGggYSBcInJlbFwiIHZhbHVlXHJcbiAgICBsZXQgcmlnaHRtb3N0ID0gdGhpcy5jb25maWcubWF4VmFsdWUgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuXHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLm5vcm1hbGl6ZVZhbHVlKHZhbHVlLCAwLCByaWdodG1vc3QpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBub3JtYWxpemVHaG9zdFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUodmFsdWUsIDAsIHRoaXMuY29uZmlnLm1heFZhbHVlKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBkcmFnU2NoZWR1bGU6ICc8JyxcclxuICAgIGdob3N0VmFsdWVzOiAnPCcsXHJcbiAgICBpdGVtOiAnPW5nTW9kZWwnLFxyXG4gICAgc2V0R2hvc3RWYWx1ZXM6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE51bGxFbmREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTnVsbEVuZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bGxFbmREaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShOdWxsRW5kRGlyZWN0aXZlLiRuYW1lLCBOdWxsRW5kRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyT3ZlcmxhcCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBPdmVybGFwRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoT3ZlcmxhcERpcmVjdGl2ZS4kbmFtZSwgT3ZlcmxhcERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBsZXQgY3VycmVudFN0YXJ0ID0gY3VycmVudC5zdGFydDtcclxuICAgICAgICBsZXQgY3VycmVudEVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBjdXJyZW50LmVuZCk7XHJcblxyXG4gICAgICAgIGxldCBvdGhlclN0YXJ0ID0gb3RoZXIuc3RhcnQ7XHJcbiAgICAgICAgbGV0IG90aGVyRW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIG90aGVyLmVuZCk7XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA+PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJTdGFydCA8IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID09PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA9PT0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5Ob092ZXJsYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwU2VydmljZS4kbmFtZSwgT3ZlcmxhcFNlcnZpY2UpO1xyXG4iLCIvKiogV2hlbiB1c2luZyB0aGUgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBvcHRpb24sIHRoaXMgc2VydmljZSB3aWxsIGJlIHVzZWQgdG8gZGVsZXRlIHRoZSBkZWZhdWx0IHNjaGVkdWxlcyBmb3IgY29ycmVjdCBkaXNwbGF5IG9uIHRoZSBjYWxlbmRhciAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFB1cmdlRGVmYXVsdFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgcHVyZ2Uoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIHtcclxuICAgICAgICBsZXQgbGFzdEluZGV4ID0gc2NoZWR1bGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIC8vIGxvb3AgaW4gcmV2ZXJzZSB0byBhdm9pZCBtZXNzaW5nIHVwIGluZGljZXMgYXMgd2UgZ29cclxuICAgICAgICBmb3IgKGxldCBpID0gbGFzdEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAoc2NoZWR1bGVzW2ldLnZhbHVlID09PSBjb25maWcuZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUHVyZ2VEZWZhdWx0U2VydmljZS4kbmFtZSwgUHVyZ2VEZWZhdWx0U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZVByb3ZpZGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklSZXNpemVTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyAkbmFtZSA9ICdici53ZWVrbHlTY2hlZHVsZXIucmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy4kZ2V0LiRpbmplY3QgPSBbXHJcbiAgICAgICAgICAgICckcm9vdFNjb3BlJyxcclxuICAgICAgICAgICAgJyR3aW5kb3cnXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tUmVzaXplRXZlbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgc2VydmljZUluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMgPSBldmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljICRnZXQoXHJcbiAgICAgICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApOiBJUmVzaXplU2VydmljZSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VydmljZUluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleGlzdHMgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIHdlIGhhdmUgdG8gJGFwcGx5IHRoZSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKGV2ZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VJbml0aWFsaXplZCA9IHRydWU7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5wcm92aWRlcihSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIFJlc2l6ZVNlcnZpY2VQcm92aWRlcilcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IElSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAncmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRmaWx0ZXInXTtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBleHBsYW5hdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogc3RyaW5nIH0gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRmaWx0ZXI6IElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JykoY29uZmlnLm1heFRpbWVTbG90KTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90XSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tYXhUaW1lU2xvdChtYXhUaW1lU2xvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5mdWxsQ2FsZW5kYXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tb25vU2NoZWR1bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5OdWxsRW5kXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5udWxsRW5kcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMgJiYgY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmNvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5TY2hlZHVsZUNvdW50XSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5zY2hlZHVsZUNvdW50KGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHJlcXVpcmUgPSB7XHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNyb3cgZXhwbGFuYXRpb25zXCIgbmctY2xhc3M9XCJ7IHZpb2xhdGlvbjogcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsLnNjaGVkdWxlckN0cmwuZm9ybUNvbnRyb2xsZXIuJGVycm9yW2tleV0gfVwiIG5nLXJlcGVhdD1cIihrZXksIGV4cGxhbmF0aW9uKSBpbiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuZXhwbGFuYXRpb25zXCI+XHJcbiAgICAgICAgICAgIHt7IGV4cGxhbmF0aW9uIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC4kbmFtZSwgbmV3IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWUsIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcik7XHJcbiIsIi8qKlxyXG4gKiBSdW5zIGN1c3RvbSB2YWxpZGF0b3JzIHdoZW5ldmVyIHRoZSBtb2RlbCBjaGFuZ2VzXHJcbiAqL1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXZhbGlkYXRlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJldmFsaWRhdGUnO1xyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMubmdNb2RlbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdGUoKTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmV2YWxpZGF0ZURpcmVjdGl2ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKFJldmFsaWRhdGVEaXJlY3RpdmUuJG5hbWUsIFJldmFsaWRhdGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0VUX1pPT00sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01fSU4sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUNvdW50RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclNjaGVkdWxlQ291bnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5iclNjaGVkdWxlQ291bnQpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTY2hlZHVsZUNvdW50RGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoU2NoZWR1bGVDb3VudERpcmVjdGl2ZS4kbmFtZSwgU2NoZWR1bGVDb3VudERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc2NoZWR1bGVzLCBpdCBhdXRvbWF0aWNhbGx5IGZhaWxzLlxyXG4gICAgICAgIGlmICghbGVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG9ubHkgb25lIGl0ZW0gd2Ugc2hvdWxkIGNoZWNrIHRoYXQgaXQgc3BhbnMgdGhlIHdob2xlIHJhbmdlXHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICBsZXQgc2NoZWR1bGUgPSBzY2hlZHVsZXNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHNjaGVkdWxlLnN0YXJ0KSAmJiB0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShzY2hlZHVsZS5lbmQsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBtb3JlLCBjb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsb29wTGVuID0gbGVuIC0gMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gU29ydCBieSBzdGFydCB0aW1lIGZpcnN0XHJcbiAgICAgICAgbGV0IHNvcnRlZFNjaGVkdWxlcyA9IHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0ID4gYi5zdGFydCA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcExlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBmaXJzdCBpdGVtIGxhbmRzIGF0IDBcclxuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgIXRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoY3VycmVudC5zdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgbGFzdCBpdGVtIGxhbmRzIGF0IG1heFZhbHVlXHJcbiAgICAgICAgICAgIGlmIChpID09PSBsb29wTGVuIC0gMSAmJiAhdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUobmV4dC5lbmQsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIGN1cnJlbnQuZW5kID09PSBuZXh0LnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZUVuZEF0TWF4VmFsdWUoZW5kOiBudW1iZXIsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIChlbmQgfHwgY29uZmlnLm1heFZhbHVlKSA9PT0gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gY29uZmlnLm1heFRpbWVTbG90O1xyXG5cclxuICAgICAgICBpZiAoIW1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXMuc29tZShzID0+IHMudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUgJiYgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHMuZW5kKSAtIHMuc3RhcnQgPiBtYXhUaW1lU2xvdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbXBvcnRhbnQgbm90ZSAtLSB0aGlzIGRvZXMgbm90IHZhbGlkYXRlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLCBidXQgcmF0aGVyIHRoYXQgb25seSBvbmUgTk9OLURFRkFVTFQgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLiAqL1xyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYSBkZWZhdWx0IHZhbHVlIGlzIGRlZmluZWQsIHNjaGVkdWxlcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGRvbid0IGNvdW50IC0tIG9uZSBub24tZGVmYXVsdCBzY2hlZHVsZSBwZXIgaXRlbS5cclxuICAgICAgICBsZXQgc2NoZWR1bGVzVG9WYWxpZGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXMuZmlsdGVyKHNjaGVkdWxlID0+IHNjaGVkdWxlLnZhbHVlICE9PSBjb25maWcuZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBhbGxvd2VkIGVtcHR5IG9yIDEgc2NoZWR1bGUgcGVyIGl0ZW1cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoIHx8IHNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoID09PSAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk51bGxFbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoIDw9IDEgJiYgc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCA9PT0gbnVsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgIT09IG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuT3ZlcmxhcDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZhbHVlc01hdGNoID0gY3VycmVudC52YWx1ZSA9PT0gbmV4dC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjb25maWcsIGN1cnJlbnQsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwLCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZCwgT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLlNjaGVkdWxlQ291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5leGFjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUV4YWN0Q291bnQoc2NoZWR1bGVzLCBjb25maWcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlTWF4Q291bnQoc2NoZWR1bGVzLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRXhhY3RDb3VudChzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoID09PSBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZU1heENvdW50KHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmNvdW50O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWludXRlc0FzVGV4dEZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IGhhc0hvdXJzID0gaG91cnMgPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7aG91cnN9IGhvdXJzYDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1pbiA9IG1pbnV0ZXMgJSA2MDtcclxuICAgICAgICAgICAgbGV0IGhhc01pbnV0ZXMgPSBtaW4gPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc01pbnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAke21pbn0gbWludXRlJHttaW4gPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKE1pbnV0ZXNBc1RleHRGaWx0ZXIuJG5hbWUsIFtNaW51dGVzQXNUZXh0RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSAmJiBob3VycyA8IDI0ID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlJztcclxuXHJcbiAgICBiaW5kaW5ncyA9IHtcclxuICAgICAgICBzY2hlZHVsZTogJzwnXHJcbiAgICB9XHJcblxyXG4gICAgY29udHJvbGxlciA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmIHRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19LXt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuZW5kIHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX08L3NwYW4+XHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmICF0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fSB1bnRpbDwvc3Bhbj5cclxuICAgIGBcclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd0aW1lUmFuZ2VDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZUNvbnRyb2xsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFzU3RhcnQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGhhc0VuZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gICAgJG9uSW5pdCgpIHtcclxuICAgICAgICB0aGlzLmhhc1N0YXJ0ID0gYW5ndWxhci5pc0RlZmluZWQodGhpcy5zY2hlZHVsZS5zdGFydCk7XHJcbiAgICAgICAgdGhpcy5oYXNFbmQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLmVuZCkgJiYgdGhpcy5zY2hlZHVsZS5lbmQgIT09IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFRpbWVSYW5nZUNvbXBvbmVudC4kbmFtZSwgbmV3IFRpbWVSYW5nZUNvbXBvbmVudCgpKVxyXG4gICAgLmNvbnRyb2xsZXIoVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZSwgVGltZVJhbmdlQ29udHJvbGxlcik7XHJcbiIsImNsYXNzIFRvdWNoU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUb3VjaFNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBnZXRUb3VjaGVzKGV2ZW50OiBhbnkpOiBhbnkgeyAvLyB0b2RvXHJcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWV2ZW50LnRvdWNoZXMpIHtcclxuICAgICAgICAgICAgZXZlbnQudG91Y2hlcyA9IFtldmVudC5vcmlnaW5hbEV2ZW50XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBldmVudC50b3VjaGVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0UGFnZVgoZXZlbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHRvdWNoZXMgPSB0aGlzLmdldFRvdWNoZXMoZXZlbnQpO1xyXG5cclxuICAgICAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCAmJiB0b3VjaGVzWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3VjaGVzWzBdLnBhZ2VYO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShUb3VjaFNlcnZpY2UuJG5hbWUsIFRvdWNoU2VydmljZSk7XHJcbiIsImNsYXNzIFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIG5vcm1hbGl6ZVZhbHVlKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh2YWx1ZSA8IG1pbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlID4gbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLiRuYW1lLCBWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckdGltZW91dCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJBZGFwdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckxhc3RHaG9zdERheVNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWlzc2luZ0RheXNTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGFkYXB0ZXJTZXJ2aWNlOiBBZGFwdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblNlcnZpY2U6IENvbmZpZ3VyYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlOiBDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsYXN0R2hvc3REYXlTZXJ2aWNlOiBMYXN0R2hvc3REYXlTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtaXNzaW5nRGF5c1NlcnZpY2U6IE1pc3NpbmdEYXlzU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29yaWdpbmFsSXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcblxyXG4gIHB1YmxpYyBpbnZhbGlkTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gIHByaXZhdGUgZHJhZ1NjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG5cclxuICAvKiogdGhpcyBpcyByZXF1aXJlZCB0byBiZSBwYXJ0IG9mIGEgZm9ybSBmb3IgZGlydHkvdmFsaWQgY2hlY2tzICovXHJcbiAgcHVibGljIGZvcm1Db250cm9sbGVyOiBhbmd1bGFyLklGb3JtQ29udHJvbGxlcjtcclxuXHJcbiAgcHVibGljIGhvdmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHB1YmxpYyBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+O1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25TZXJ2aWNlLmdldENvbmZpZ3VyYXRpb24odGhpcy5vcHRpb25zKTtcclxuICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoQWRhcHRlcigpO1xyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuU0xPVF9EUkFHR0VELCAoZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgdGhpcy5kcmFnU2NoZWR1bGUgPSBzY2hlZHVsZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuRFJBR19FTkRFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWdTY2hlZHVsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBnaG9zdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB7XHJcbiAgICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNPTU1JVF9HSE9TVCwgZ2hvc3RTY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9MQVNUX0dIT1NULCAoKSA9PiB7XHJcbiAgICAgIGxldCBsYXN0R2hvc3REYXkgPSB0aGlzLmxhc3RHaG9zdERheVNlcnZpY2UuZ2V0TGFzdEdob3N0RGF5KHRoaXMuaXRlbXMpO1xyXG5cclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0dIT1NULCBsYXN0R2hvc3REYXkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DQU5DRUxfR0hPU1QsICgpID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0FMTF9HSE9TVFMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZE1lc3NhZ2UgPSB0aGlzLmdldEludmFsaWRNZXNzYWdlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRJbnZhbGlkTWVzc2FnZSgpIHtcclxuICAgIGxldCBjb25mbGljdGluZ09wdGlvbnMgPSB0aGlzLmNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuZ2V0Q29uZmxpY3RpbmdPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKGNvbmZsaWN0aW5nT3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gY29uZmxpY3RpbmdPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHJldHVybiAnT25lIG9yIG1vcmUgb2YgdGhlIHNjaGVkdWxlcyBpcyBpbnZhbGlkISBQbGVhc2UgY29udGFjdCBzZXJ2aWNlLic7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9ybUNvbnRyb2xsZXIuJGludmFsaWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5taXNzaW5nRGF5c1NlcnZpY2UuZmlsbEl0ZW1zKHRoaXMuY29uZmlnLCBpdGVtcyk7XHJcblxyXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5tZXJnZU92ZXJsYXBzKCkpO1xyXG5cclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnB1cmdlSXRlbXModGhpcy5pdGVtcyk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IGl0ZW1zID0gdGhpcy5hZGFwdGVyU2VydmljZS5nZXRJdGVtc0Zyb21BZGFwdGVyKHRoaXMuY29uZmlnLCB0aGlzLmFkYXB0ZXIpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmJ1aWxkSXRlbXMoaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXJnZUl0ZW1zKGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICBpdGVtLnB1cmdlRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcmVwYXJlSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGl0ZW0uZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRHaG9zdFZhbHVlcyhnaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfSkge1xyXG4gICAgdGhpcy5naG9zdFZhbHVlcyA9IGdob3N0VmFsdWVzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5mb3JtQ29udHJvbGxlci4kc2V0UHJpc3RpbmUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2F2ZSgpIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnByZXBhcmVJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2F2ZVNjaGVkdWxlcigpLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW1zID0gdGhpcy5wdXJnZUl0ZW1zKHRoaXMuaXRlbXMpO1xyXG4gICAgICB0aGlzLmZvcm1Db250cm9sbGVyLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgZm9ybUNvbnRyb2xsZXI6ICdmb3JtJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJztcclxuICAgIFxyXG4gICAgc3RhdGljIHZhbHVlID0ge1xyXG4gICAgICAgIDA6ICdNb24nLFxyXG4gICAgICAgIDE6ICdUdWUnLFxyXG4gICAgICAgIDI6ICdXZWQnLFxyXG4gICAgICAgIDM6ICdUaHVyJyxcclxuICAgICAgICA0OiAnRnJpJyxcclxuICAgICAgICA1OiAnU2F0JyxcclxuICAgICAgICA2OiAnU3VuJyBcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChEYXlNYXAuJG5hbWUsIERheU1hcC52YWx1ZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gMTIwO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KE51bGxFbmRXaWR0aC4kbmFtZSwgTnVsbEVuZFdpZHRoLnZhbHVlKTtcclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhbiBpdGVtIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGltcGxlbWVudHMgSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICAkaXNHaG9zdE9yaWdpbjogYm9vbGVhbjtcclxuICAgICRyZW5kZXJHaG9zdDogYm9vbGVhbjtcclxuICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcbiAgICBlZGl0YWJsZTogYm9vbGVhbjtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxUPixcclxuICAgICAgICBpdGVtOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlOiBGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBwdXJnZURlZmF1bHRTZXJ2aWNlOiBQdXJnZURlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuZGF5ID0gaXRlbS5kYXk7XHJcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IGl0ZW0uZWRpdGFibGU7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGl0ZW0ubGFiZWw7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4gcmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywgc2NoZWR1bGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKHRoaXMuY29uZmlnLCBzY2hlZHVsZSk7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMucHVzaChyYW5nZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2NoZWR1bGVBbmRNZXJnZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCByYW5nZSA9IHRoaXMuYWRkU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMubWVyZ2VTY2hlZHVsZShyYW5nZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FuQWRkU2NoZWR1bGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZXRlcm1pbmUgaWYgdGhlIGNvbmRpdGlvbnMgYWxsb3cgZm9yIGEgcG9wLXVwIGVkaXRvciAqL1xyXG4gICAgcHVibGljIGNhbkVkaXQoKSB7XHJcbiAgICAgICAgbGV0IGlzRWRpdGFibGUgPSB0aGlzLmlzRWRpdGFibGUoKTtcclxuICAgICAgICBsZXQgaGFzRWRpdEZ1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuY29uZmlnLmVkaXRTbG90KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlzRWRpdGFibGUgJiYgaGFzRWRpdEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmF0aGVyIHRoYW4gaGF2aW5nIHRvIGRlYWwgd2l0aCBtb2RpZnlpbmcgbWVyZ2VPdmVybGFwcyB0byBoYW5kbGUgbnVsbEVuZHMgY2FsZW5kYXJzLFxyXG4gICAgICoganVzdCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gY3JlYXRpbmcgYWRkaXRpb25hbCBzbG90cyBpbiBudWxsRW5kcyBjYWxlbmRhcnMgdW5sZXNzIHRoZXJlIGFyZSBubyBzbG90cyB0aGVyZSBhbHJlYWR5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2FuUmVuZGVyR2hvc3QoKSB7XHJcbiAgICAgICAgLy8gVGhpcyBvbmUgbmVlZHMgdG8gY29tZSBmaXJzdCwgb3RoZXJ3aXNlIHJlbmRlckdob3N0IGJlaW5nIHNldCB0byB0cnVlIHdvdWxkIG92ZXJyaWRlIHRoZSBwcm90ZWN0aW9uIGFnYWluc3QgYWRkdCdsIHNsb3RzIGluIG51bGxFbmQgY2FsZW5kYXJzXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRyZW5kZXJHaG9zdCAmJiB0aGlzLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB5b3UncmUgYWxyZWFkeSBkcmFnZ2luZyB0aGUgZ2hvc3QgaXQgc2hvdWxkIG5ldmVyIGRpc2FwcGVhclxyXG4gICAgICAgIGlmICh0aGlzLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5pc0VkaXRhYmxlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuJHJlbmRlckdob3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSkgPiAtMTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzTm9TY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IHRoaXMuZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLmZpbGwodGhpcywgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZXJnZU92ZXJsYXBzKCkge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXMuZm9yRWFjaChzY2hlZHVsZSA9PiB0aGlzLm1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZSkpO1xyXG4gICAgICAgIH0gd2hpbGUgKHRoaXMubmVlZHNPdmVybGFwc01lcmdlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVyZ2VTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzY2hlZHVsZSB3ZSB3ZXJlIHdvcmtpbmcgd2l0aCB0byBiZSB0aGUgbW9zdCBpbXBvcnRhbnQsIHNvIGhhbmRsZSBpdHMgb3ZlcmxhcHMgZmlyc3QuXHJcbiAgICAgICAgdGhpcy5tZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwdXJnZURlZmF1bHRTY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSB0aGlzLnB1cmdlRGVmYXVsdFNlcnZpY2UucHVyZ2UodGhpcy5zY2hlZHVsZXMsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnLm9uUmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3ZlcmxhcCBoYW5kbGVyc1xyXG5cclxuICAgIHByaXZhdGUgZ2V0T3ZlcmxhcEhhbmRsZXIob3ZlcmxhcFN0YXRlOiBPdmVybGFwU3RhdGUpIHtcclxuICAgICAgICBjb25zdCBvdmVybGFwSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gb3ZlcmxhcEhhbmRsZXJzW292ZXJsYXBTdGF0ZV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEp1c3QgcmVtb3ZlICdjdXJyZW50J1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGN1cnJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG90aGVyLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogY3VycmVudC5zdGFydCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdGhlci51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuZCBvdmVybGFwIGhhbmRsZXJzXHJcblxyXG4gICAgcHJpdmF0ZSBpc0VkaXRhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5lZGl0YWJsZSkgfHwgdGhpcy5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVsLmVxdWFscyhzY2hlZHVsZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwSGFuZGxlciA9IHRoaXMuZ2V0T3ZlcmxhcEhhbmRsZXIob3ZlcmxhcFN0YXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBvdmVybGFwSGFuZGxlcihzY2hlZHVsZSwgZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBuZWVkc092ZXJsYXBzTWVyZ2VkKCkge1xyXG4gICAgICAgIGxldCBsZW4gPSB0aGlzLnNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5zY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5zY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMobmV4dCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydCwgT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbUZhY3Rvcnkge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZGF5TWFwOiBEYXlNYXAsXHJcbiAgICAgICAgcHJpdmF0ZSBmaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2U6IEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHB1cmdlRGVmYXVsdFNlcnZpY2U6IFB1cmdlRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZUl0ZW0oY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGRheTogbnVtYmVyLCBzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAgICAgICBsZXQgYnVpbGRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBjb25maWcuY3JlYXRlSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcbiAgICBcclxuICAgICAgICByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChidWlsZGVyLCB7IGxhYmVsOiB0aGlzLmRheU1hcFtkYXldIH0pO1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIG5ldyBXZWVrbHlTY2hlZHVsZXJJdGVtKGNvbmZpZywgcmVzdWx0LCB0aGlzLmZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSwgdGhpcy5vdmVybGFwU2VydmljZSwgdGhpcy5wdXJnZURlZmF1bHRTZXJ2aWNlLCB0aGlzLnJhbmdlRmFjdG9yeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnkpO1xyXG5cclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhIHNjaGVkdWxlIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgJGNsYXNzOiBzdHJpbmc7XHJcbiAgICAkaXNBY3RpdmU6IGJvb2xlYW47XHJcbiAgICAkaXNEZWxldGluZzogYm9vbGVhbjtcclxuICAgICRpc0VkaXRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxuICAgIHZhbHVlOiBUO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuZGF5ID0gc2NoZWR1bGUuZGF5O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzY2hlZHVsZS5zdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IHNjaGVkdWxlLmVuZDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gc2NoZWR1bGUudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGR1cmF0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5lcXVhbHModGhpcywgb3RoZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNTYW1lVmFsdWVBcyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSh1cGRhdGVkU2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgdXBkYXRlZFN0YXJ0ID0gdGhpcy51cGRhdGVTdGFydCh1cGRhdGVkU2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIGxldCB1cGRhdGVkRW5kID0gdGhpcy51cGRhdGVFbmQodXBkYXRlZFNjaGVkdWxlLmVuZCk7XHJcblxyXG4gICAgICAgIGlmICh1cGRhdGVkU3RhcnQgfHwgdXBkYXRlZEVuZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRW5kKHVwZGF0ZWRFbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKHRoaXMuY29uZmlnLCB1cGRhdGVkRW5kKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuVXBkYXRlU3RhcnQodXBkYXRlZFN0YXJ0KSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gdXBkYXRlZFN0YXJ0O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuZW5kICE9PSB1cGRhdGVkRW5kO1xyXG4gICAgICAgIGxldCBuZXdFbmRCZWZvcmVPckF0TWF4ID0gdXBkYXRlZEVuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICBsZXQgbmV3RW5kQWZ0ZXJPckF0RXhpc3RpbmdTdGFydCA9IHVwZGF0ZWRFbmQgPj0gdGhpcy5zdGFydCArIDE7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkICYmIG5ld0VuZEJlZm9yZU9yQXRNYXggJiYgbmV3RW5kQWZ0ZXJPckF0RXhpc3RpbmdTdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhblVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLnN0YXJ0ICE9PSB1cGRhdGVkU3RhcnQ7XHJcbiAgICAgICAgbGV0IG5ld1N0YXJ0QmVmb3JlT3JBdEV4aXN0aW5nRW5kID0gdXBkYXRlZFN0YXJ0IDw9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIHRoaXMuZW5kKSAtIDE7XHJcbiAgICAgICAgbGV0IG5ld1N0YXJ0QWZ0ZXJPckF0TWluID0gdXBkYXRlZFN0YXJ0ID49IDA7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEV4aXN0aW5nRW5kICYmIG5ld1N0YXJ0QWZ0ZXJPckF0TWluO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5IHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVSYW5nZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Piwgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVyUmFuZ2UoY29uZmlnLCBzY2hlZHVsZSwgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcm9vdFNjb3BlJyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwcml2YXRlIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwcml2YXRlIGdldERlbHRhOiAob3B0aW9uczogeyBwaXhlbDogbnVtYmVyIH0pID0+IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcbiAgcHJpdmF0ZSBkcmFnU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIGRyYWdTZXJ2aWNlOiBEcmFnU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIGdldCBoYXNEcmFnU2NoZWR1bGUoKSB7XHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQodGhpcy5kcmFnU2NoZWR1bGUpICYmIHRoaXMuZHJhZ1NjaGVkdWxlICE9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERyYWdTdGFydFZhbHVlcygpIHtcclxuICAgIHJldHVybiB0aGlzLmRyYWdTZXJ2aWNlLmdldERyYWdSYW5nZUZyb21TY2hlZHVsZSh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmR1cmF0aW9uKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLnVwZGF0ZSh7XHJcbiAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZERyYWcoKSB7XHJcbiAgICAvLyBJZiB0aGUgc2NoZWR1bGUgd2FzIG1vdmVkIHRvIGFub3RoZXIgaXRlbSwgdGhlICRzY29wZSBoaWVyYXJjaHkgd2lsbCBoYXZlIGJlZW4gYnJva2VuLCBzbyB3ZSBuZWVkIHRvIGJyb2FkY2FzdCB0aGlzIHRvIHRoZSB3aG9sZSBhcHBcclxuICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5EUkFHX0VOREVEKTtcclxuICAgIFxyXG4gICAgLy8gV2FzIHRoZSBzY2hlZHVsZSBtb3ZlZCB0byBhbm90aGVyIGl0ZW0/P1xyXG4gICAgaWYgKCF0aGlzLml0ZW0uaGFzU2NoZWR1bGUodGhpcy5zY2hlZHVsZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpZCB0aGUgdXNlciBhY3R1YWxseSBtb3ZlIG9yIHJlc2l6ZSB0aGUgc2xvdD8/XHJcbiAgICB2YXIgY2hhbmdlZDogYm9vbGVhbiA9ICF0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVxdWFscyh0aGlzLmdldERyYWdTdGFydFZhbHVlcygpKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZFJlc2l6ZSgpIHtcclxuICAgIC8vIERpZCB0aGUgdXNlciBhY3R1YWxseSBtb3ZlIG9yIHJlc2l6ZSB0aGUgc2xvdD8/XHJcbiAgICB2YXIgY2hhbmdlZDogYm9vbGVhbiA9ICF0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVxdWFscyh0aGlzLmdldERyYWdTdGFydFZhbHVlcygpKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVN0YXJ0KHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NoZWR1bGUudXBkYXRlU3RhcnQobmV3U3RhcnQpKSB7XHJcbiAgICAgIHRoaXMuY29uZmlnLm9uQ2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2hlZHVsZS51cGRhdGVFbmQobmV3RW5kKSkge1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5TTE9UX0RSQUdHRUQsIHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemUoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBkcmFnU2NoZWR1bGU6ICc8JyxcclxuICAgIGl0ZW06ICc8JyxcclxuICAgIHNjaGVkdWxlOiAnPW5nTW9kZWwnLFxyXG4gICAgZWRpdFNjaGVkdWxlOiAnJicsXHJcbiAgICBnZXREZWx0YTogJyYnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC5odG1sJztcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNsb3RDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgWm9vbVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0b3I6IHN0cmluZyA9ICcuc2NoZWR1bGUtYXJlYSc7XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRJbkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludChlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGgsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFpvb21FbGVtZW50KGNvbnRhaW5lcjogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSwgd2lkdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgdGhpcy5nZXRab29tRWxlbWVudChlbGVtZW50KS5zdHlsZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXNldFpvb20oZWxlbWVudDogYW55KSB7XHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgJzEwMCUnKTtcclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB6b29tSW4oZWxlbWVudDogYW55KSB7XHJcbiAgICAgICAgLy8gZ2V0IGN1cnJlbnQgem9vbSBsZXZlbCBmcm9tIHpvb21lZCBlbGVtZW50IGFzIGEgcGVyY2VudGFnZVxyXG4gICAgICAgIGxldCB6b29tID0gdGhpcy5nZXRab29tRWxlbWVudChlbGVtZW50KS5zdHlsZS53aWR0aDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBwYXJzZSB0byBpbnRlZ2VyICYgZG91YmxlXHJcbiAgICAgICAgbGV0IGxldmVsID0gcGFyc2VJbnQoem9vbSwgMTApICogMjtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBiYWNrIHRvIHBlcmNlbnRhZ2VcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCBsZXZlbCArICclJyk7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tSW5BQ2VsbChlbGVtZW50OiBhbnksIGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgICAgICAgbGV0IGkgPSBkYXRhLmlkeDtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9EaXNwbGF5ID0gNTtcclxuICAgICAgICBsZXQgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvIGJveGVzVG9EaXNwbGF5O1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb1NraXAgPSAyO1xyXG4gICAgICAgIGxldCBndXR0ZXJTaXplID0gYm94V2lkdGggKiBib3hlc1RvU2tpcDtcclxuXHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBlbGVtZW50Q291bnQgKiBib3hXaWR0aDtcclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJyk7XHJcblxyXG4gICAgICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gaSAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21CeVNjcm9sbChlbGVtZW50OiBhbnksIGV2ZW50OiBXaGVlbEV2ZW50LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRXaWR0aCA9IHRoaXMuZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIChjdXJyZW50V2lkdGggKyAyICogZGVsdGEpICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICAvKipcclxuICAgICAqIEltcGxlbWVudCB0aGlzIG9uIGEgY2xpZW50IGFuZCB0aGVuIHBhc3MgaXQgaW4gdG8gdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxUQ3VzdG9tLCBUVmFsdWU+IHtcclxuICAgICAgICBjdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UoY3VzdG9tOiBUQ3VzdG9tKTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUVmFsdWU+O1xyXG5cclxuICAgICAgICAvKiogVHJhbnNmb3JtIHRoZSBkYXRhIGhlbGQgd2l0aGluIHRoZSBjb21wb25lbnQgdG8gdGhlIGZvcm1hdCB5b3UgbmVlZCBpdCBvdXRzaWRlIG9mIHRoZSBjb21wb25lbnQuICovXHJcbiAgICAgICAgZ2V0U25hcHNob3QoKTogVEN1c3RvbVtdO1xyXG5cclxuICAgICAgICAvKiogVGhpcyBqdXN0IG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIGNsYXNzLCB3ZSdsbCBzZXQgaXQgaW50ZXJuYWxseSAqL1xyXG4gICAgICAgIGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxUVmFsdWU+W107XHJcblxyXG4gICAgICAgIGluaXRpYWxEYXRhOiBUQ3VzdG9tW107XHJcbiAgICB9XHJcbn1cclxuIiwiZGVjbGFyZSBjb25zdCBlbnVtIERyYWdNb2RlIHtcclxuICAgIE1PVkUsXHJcbiAgICBDT1BZXHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEludmFsaWRNZXNzYWdlcyB7XHJcbiAgICAgICAgZnVsbENhbGVuZGFyRmlsbEVtcHR5V2l0aERlZmF1bHQ6IHN0cmluZztcclxuICAgICAgICBmaWxsRW1wdHlXaXRoZGVmYXVsdERlZmF1bHRWYWx1ZTogc3RyaW5nO1xyXG4gICAgICAgIGdlbmVyaWM6IHN0cmluZztcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUG9pbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlIHtcclxuICAgIGluaXRpYWxpemUoKTogdm9pZDtcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZVNlcnZpY2VQcm92aWRlciBleHRlbmRzIGFuZ3VsYXIuSVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICAgICAgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgLyoqIERlZmF1bHRzIHdpbGwgYmUgcHJvdmlkZWQsIGJ1dCB5b3UgY2FuIG92ZXJyaWRlIHRoZXNlIG9uIGEgcGVyLWNhbGVuZGFyIGJhc2lzIGlmIG5lY2Vzc2FyeSAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyB7XHJcbiAgICAgICAgZnVsbENhbGVuZGFyOiBzdHJpbmc7XHJcbiAgICAgICAgbWF4VGltZVNsb3Q6ICh2YWx1ZTogc3RyaW5nKSA9PiBzdHJpbmc7XHJcbiAgICAgICAgbW9ub1NjaGVkdWxlOiBzdHJpbmc7XHJcbiAgICAgICAgbnVsbEVuZHM6IHN0cmluZztcclxuICAgICAgICBzY2hlZHVsZUNvdW50OiAob3B0aW9uczogU2NoZWR1bGVDb3VudE9wdGlvbnMpID0+IHN0cmluZztcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKiBEZWZhdWx0cyB3aWxsIGJlIHByb3ZpZGVkLCBidXQgeW91IGNhbiBvdmVycmlkZSB0aGVzZSBvbiBhIHBlci1jYWxlbmRhciBiYXNpcyBpZiBuZWNlc3NhcnkgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2NoZWR1bGVDb3VudE9wdGlvbnMge1xyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNjaGVkdWxlcyBhbGxvd2VkIG9uIGVhY2ggaXRlbS4gTnVsbCBmb3Igbm8gbWF4ICovXHJcbiAgICAgICAgY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIFdoZXRoZXIgeW91IG11c3QgaGF2ZSBleGFjdGx5IHRoYXQgbWFueSBzY2hlZHVsZXMsIG9yIGlmIFwidXAgdG9cIiBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgZXhhY3Q6IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBEYXlzIHtcclxuICAgICAgICBNb25kYXkgPSAwLFxyXG4gICAgICAgIFR1ZXNkYXkgPSAxLFxyXG4gICAgICAgIFdlZG5lc2RheSxcclxuICAgICAgICBUaHVyc2RheSxcclxuICAgICAgICBGcmlkYXksXHJcbiAgICAgICAgU2F0dXJkYXksXHJcbiAgICAgICAgU3VuZGF5XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2UgZXh0ZW5kcyBhbmd1bGFyLklGaWx0ZXJTZXJ2aWNlIHtcclxuICAgIChuYW1lOiAnYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0Jyk6IChtaW51dGVzOiBudW1iZXIpID0+IHN0cmluZ1xyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxUPiB7XHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSBzY2hlZHVsZXMgd2lsbCBiZSBhbGxvd2VkICYgcmVxdWlyZWQgdG8gaGF2ZSBubyBzZXQgZW5kIHRpbWUgKi9cclxuICAgICAgICBudWxsRW5kcz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBUaGVzZSBjbGFzc2VzIHdpbGwgYmUgYXBwbGllZCBkaXJlY3RseSB0byB0aGUgYnV0dG9ucyAqL1xyXG4gICAgICAgIGJ1dHRvbkNsYXNzZXM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gcmV0dXJuIGFuIGl0ZW0gLS0gdGhpcyBpcyBSRVFVSVJFRCBzbyB0aGF0IGFkYXB0ZXJzIHdpbGwgYWx3YXlzIGJlIHVzZWQgZm9yIG5ldyBpdGVtcywgZXZlbiBpZiB0aGV5IHdlcmVuJ3QgcGFzc2VkIGluICovXHJcbiAgICAgICAgY3JlYXRlSXRlbTogKGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W10pID0+IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxUPjtcclxuXHJcbiAgICAgICAgLyoqIGRlZmF1bHRWYWx1ZSBzaG91bGQgYmUgYXNzaWduZWQgcGVyIHNldCBvZiBvcHRpb25zLCBub3QgcGVyIGl0ZW0uIERvIG5vdCBhc3NpZ24gZm9yIG5vIGRlZmF1bHQgKi9cclxuICAgICAgICBkZWZhdWx0VmFsdWU/OiBUO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYW4gaXRlbSBpcyBjbGlja2VkIGluIG9yZGVyIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgaXQgKi9cclxuICAgICAgICBlZGl0U2xvdD86IChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSA9PiBhbmd1bGFyLklQcm9taXNlPElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPj47XHJcblxyXG4gICAgICAgIC8qKiBXaGV0aGVyIHRvIGZpbGwgZW1wdHkgc3BhY2VzIHdpdGggdGhlIGRlZmF1bHQgdmFsdWUgKi9cclxuICAgICAgICBmaWxsRW1wdHlXaXRoRGVmYXVsdD86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIEFMTCBzbG90cyBpbiB0aGUgY2FsZW5kYXIgbXVzdCBiZSBmaWxsZWQgaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkICovXHJcbiAgICAgICAgZnVsbENhbGVuZGFyPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgZGVmaW5lZCwgYSB0aW1lIHNsb3Qgd2lsbCBub3QgYmUgYWJsZSB0byBiZSBtb3JlIHRoYW4gdGhpcyBtYW55IG1pbnV0ZXMgbG9uZyAqL1xyXG4gICAgICAgIG1heFRpbWVTbG90PzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCB0aGUgY2FsZW5kYXIgd2lsbCBlbmZvcmNlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgcGVyIGl0ZW0gaXMgYWxsb3dlZCAqL1xyXG4gICAgICAgIG1vbm9TY2hlZHVsZT86IGJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIGFjY2VzcyBiYWNrIHRvIHRoZSBjbGllbnQgc2NvcGUgd2hlbiB0aGUgc2NoZWR1bGVyIGNoYW5nZXMuICovXHJcbiAgICAgICAgb25DaGFuZ2U/OiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gYSBzY2hlZHVsZXIgaXMgcmVtb3ZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblJlbW92ZT86ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIG1pbnV0ZXMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgICAgIGludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogT3ZlcnJpZGVzIGZvciByZXN0cmljdGlvbiBleHBsYW5hdGlvbnMsIGlmIG5lY2Vzc2FyeSAqL1xyXG4gICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zPzogUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgc2F2ZSBidXR0b24gaXMgY2xpY2tlZC4gSWYgdGhpcyBpcyBub3QgcGFzc2VkLCBubyBzYXZlIGJ1dHRvbiB3aWxsIGJlIHByZXNlbnQuICovXHJcbiAgICAgICAgc2F2ZVNjaGVkdWxlcj86ICgpID0+IGFuZ3VsYXIuSVByb21pc2U8YW55PjtcclxuXHJcbiAgICAgICAgLyoqIE92ZXJyaWRlcyBmb3Igc2NoZWR1bGUgY291bnQgb3B0aW9ucywgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICAgICAgc2NoZWR1bGVDb3VudE9wdGlvbnM6IFNjaGVkdWxlQ291bnRPcHRpb25zO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBVc2UgdGhpcyBmb3IgcHJvcGVydGllcyB5b3UgbmVlZCBhY2Nlc3MgdG8gYnV0IGRvbid0IHdhbnQgZXhwb3NlZCB0byBjbGllbnRzICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4gZXh0ZW5kcyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcbiAgICAgICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAgICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAgICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIE5vdCBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IG1ha2VzIHRoaW5ncyBhIHdob29vbGUgbG90IGVhc2llciAqL1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHZhbHVlOiBUO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><br-weekly-scheduler adapter="adapterTwo" ng-form="test2" options="model2.options"></br-weekly-scheduler><code>Result:<pre>{{ adapterTwoResult | json }}</pre></code> <code>Valid: {{ test2.$valid }}</code><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown()" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove()"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.item.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.item.$renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" get-delta="multiSliderCtrl.pixelToVal(pixel)" drag-schedule="multiSliderCtrl.dragSchedule" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: multiSliderCtrl.item.editable === false,\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.invalidMessage"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" br-full-calendar="{{ schedulerCtrl.config.fullCalendar }}" br-max-time-slot="{{ schedulerCtrl.config.maxTimeSlot }}" br-mono-schedule="{{ schedulerCtrl.config.monoSchedule }}" br-null-end="{{ schedulerCtrl.config.nullEnds }}" br-schedule-count="{{ schedulerCtrl.config.scheduleCountOptions && schedulerCtrl.config.scheduleCountOptions.count }}" br-overlap br-revalidate drag-schedule="schedulerCtrl.dragSchedule" ghost-values="schedulerCtrl.ghostValues" ng-model="item" ng-model-options="{allowInvalid: true}" set-ghost-values="schedulerCtrl.setGhostValues(ghostValues)"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.invalidMessage">{{ schedulerCtrl.invalidMessage }}</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resizeStart(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle immediate="weeklySlotCtrl.hasDragSchedule"><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resizeEnd(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);