angular.module('demoApp', ['br.weeklyScheduler', 'ngMaterial'])
    .controller('DemoController', ['$q', '$scope', '$timeout', '$log', '$mdDialog',
    function ($q, $scope, $timeout, $log, $mdDialog) {
        $scope.model = {
            options: {
                buttonClasses: ['wow!'],
                createItem: function (day, schedules) {
                    return new DemoItem(day, schedules);
                },
                defaultValue: false,
                editSlot: function (schedule) {
                    schedule.$isDeleting = true;
                    return $q.when(schedule);
                },
                fillEmptyWithDefault: true,
                interval: 60 * 15,
                fillNullEnds: 1800,
                maxTimeSlot: 3600,
                minimumSeparation: 300,
                onChange: function (isValid) {
                },
                restrictionExplanations: {
                    maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                },
                saveScheduler: function () {
                    $scope.result = $scope.adapter.getSnapshot();
                    return $q.when(true);
                }
            }
        };
        $scope.model.options.nullEnds = true;
        $scope.adapter = new DemoAdapter([
            {
                day: 5 /* Saturday */,
                start: 0,
                end: 3600,
                value: false
            },
            {
                day: 5 /* Saturday */,
                start: 3600,
                end: 7500,
                value: true
            },
            {
                day: 5 /* Saturday */,
                start: 7200,
                end: 0,
                value: false
            }
        ]);
    }]);
/** @internal */
var DemoItem = /** @class */ (function () {
    function DemoItem(day, schedules) {
        this.day = day;
        this.schedules = schedules;
    }
    Object.defineProperty(DemoItem.prototype, "editable", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return DemoItem;
}());
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
        range.$class = 'test';
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
    function ConfigurationService(timeConstants) {
        this.timeConstants = timeConstants;
    }
    ConfigurationService.prototype.getConfiguration = function (options) {
        var interval = options.interval || 900; // seconds
        var intervalCount = this.timeConstants.SECONDS_IN_DAY / interval;
        var defaultOptions = this.getDefaultOptions();
        var userOptions = angular.merge(defaultOptions, options);
        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: this.timeConstants.SECONDS_IN_DAY,
            hourCount: this.timeConstants.HOURS_IN_DAY,
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
                minimumSeparation: function (value) { return "Slots must be at least " + value + " apart!"; },
                fullCalendar: 'For this calendar, every day must be completely full of schedules.',
                monoSchedule: 'This calendar may only have one time slot per day',
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.',
                scheduleCount: function (options) {
                    var pluralizedSlot = 'slot' + (options.count === 1 ? '' : 's');
                    if (options.exact) {
                        return "This calendar must have exactly " + options.count + " " + pluralizedSlot + " per day";
                    }
                    else {
                        return "This calendar may only have a maximum of " + options.count + " " + pluralizedSlot + " per day";
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
    ConfigurationService.$inject = [
        'brWeeklySchedulerTimeConstantsService'
    ];
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
        if (options.nullEnds && options.scheduleCountOptions && options.scheduleCountOptions.count > 1) {
            return "A nullEnds calendar has a maximum scheduleCount of 1";
        }
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
        if (this.shouldFillNullEnd(schedule, config)) {
            schedule.end = this.getNullEndValue(schedule, config);
        }
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
    FillEmptyWithDefaultService.prototype.getNullEndValue = function (schedule, config) {
        return schedule.start + config.fillNullEnds;
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
    FillEmptyWithDefaultService.prototype.shouldFillNullEnd = function (schedule, config) {
        return schedule.end === null && config.nullEnds && config.fillNullEnds;
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
    function HourlyGridDirective(timeConstants) {
        var _this = this;
        this.timeConstants = timeConstants;
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
                var numIntervalsInTick = this.timeConstants.SECONDS_IN_HOUR / config.interval;
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
        var directive = function (timeConstants) { return new HourlyGridDirective(timeConstants); };
        directive.$inject = ['brWeeklySchedulerTimeConstantsService'];
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
var MinimumSeparationDirective = /** @class */ (function () {
    function MinimumSeparationDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMinimumSeparation) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MinimumSeparationDirective.Factory = function () {
        var directive = function (validator) {
            return new MinimumSeparationDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMinimumSeparationValidatorService'];
        return directive;
    };
    MinimumSeparationDirective.$name = 'brMinimumSeparation';
    return MinimumSeparationDirective;
}());
angular
    .module('br.weeklyScheduler')
    .directive(MinimumSeparationDirective.$name, MinimumSeparationDirective.Factory());
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
        return angular.copy(result).sort(function (a, b) { return a.day - b.day; });
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
                _this.removeGhost();
            }
        });
        this.$scope.$on("brWeeklyScheduler.removeAllGhosts" /* REMOVE_ALL_GHOSTS */, function () {
            _this.removeGhost();
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
        this.ngModelCtrl.$setDirty();
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
        if (!this.item.editable) {
            return;
        }
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
        if (this.item.canAddSchedule()) {
            this.item.addScheduleAndMerge(ghostSchedule);
            this.ngModelCtrl.$setDirty();
            this.config.onChange();
        }
        this.removeGhost();
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
        var result = this.element.clientWidth - offsetRight;
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
    MultiSliderController.prototype.removeGhost = function () {
        this.item.$isGhostOrigin = false;
        this.item.$renderGhost = false;
        this.setGhostValues(null);
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
            var maxTimeSlot = this.$filter('brWeeklySchedulerSecondsAsText')(config.maxTimeSlot);
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
        if (config.minimumSeparation) {
            var minimumSeparation = this.$filter('brWeeklySchedulerSecondsAsText')(config.minimumSeparation);
            this.explanations["minimumSeparation" /* MinimumSeparation */] = config.restrictionExplanations.minimumSeparation(minimumSeparation);
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
var MinimumSeparationValidatorService = /** @class */ (function () {
    function MinimumSeparationValidatorService() {
    }
    Object.defineProperty(MinimumSeparationValidatorService.prototype, "error", {
        get: function () {
            return "minimumSeparation" /* MinimumSeparation */;
        },
        enumerable: true,
        configurable: true
    });
    MinimumSeparationValidatorService.prototype.validate = function (schedules, config) {
        if (!config.minimumSeparation) {
            return true;
        }
        var len = schedules.length;
        if (len <= 1) {
            return true;
        }
        var loopLen = len - 1;
        schedules.sort(function (a, b) { return a.start - b.start; });
        for (var i = 0; i < loopLen; i++) {
            var currentSchedule = schedules[i];
            var nextSchedule = schedules[i + 1];
            if (nextSchedule.start - currentSchedule.end < config.minimumSeparation) {
                return false;
            }
        }
        return true;
    };
    MinimumSeparationValidatorService.$name = 'brWeeklySchedulerMinimumSeparationValidatorService';
    return MinimumSeparationValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MinimumSeparationValidatorService.$name, MinimumSeparationValidatorService);
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
var SecondsAsTextFilter = /** @class */ (function () {
    function SecondsAsTextFilter() {
    }
    SecondsAsTextFilter.Factory = function () {
        var factoryFunction = function (timeConstants) {
            return function (seconds) {
                var result = "";
                var hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);
                result = SecondsAsTextFilter.addHoursToResult(result, hours);
                seconds -= hours * timeConstants.SECONDS_IN_HOUR;
                var minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);
                result = SecondsAsTextFilter.addMinutesToResult(result, minutes);
                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;
                result = SecondsAsTextFilter.addSecondsToResult(result, seconds);
                if (!result) {
                    result = 'none';
                }
                return result;
            };
        };
        factoryFunction.$inject = ['brWeeklySchedulerTimeConstantsService'];
        return factoryFunction;
    };
    SecondsAsTextFilter.addHoursToResult = function (result, hours) {
        if (hours) {
            result += hours + " hours";
        }
        return result;
    };
    SecondsAsTextFilter.addMinutesToResult = function (result, minutes) {
        if (minutes) {
            if (result) {
                result += " ";
            }
            result += minutes + " minute" + (minutes > 1 ? 's' : '');
        }
        return result;
    };
    SecondsAsTextFilter.addSecondsToResult = function (result, seconds) {
        if (seconds) {
            if (result) {
                result += " ";
            }
            result += seconds + " second" + (seconds > 1 ? 's' : '');
        }
        return result;
    };
    SecondsAsTextFilter.$name = 'brWeeklySchedulerSecondsAsText';
    return SecondsAsTextFilter;
}());
angular
    .module('br.weeklyScheduler')
    .filter(SecondsAsTextFilter.$name, SecondsAsTextFilter.Factory());
/** @internal */
var TimeConstantsService = /** @class */ (function () {
    function TimeConstantsService() {
    }
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_DAY", {
        get: function () {
            return this.MINUTES_IN_DAY * this.SECONDS_IN_MINUTE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_HOUR", {
        get: function () {
            return this.SECONDS_IN_MINUTE * this.MINUTES_IN_HOUR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_MINUTE", {
        get: function () {
            return 60;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "HOURS_IN_DAY", {
        get: function () {
            return 24;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "MINUTES_IN_DAY", {
        get: function () {
            return this.MINUTES_IN_HOUR * this.HOURS_IN_DAY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "MINUTES_IN_HOUR", {
        get: function () {
            return 60;
        },
        enumerable: true,
        configurable: true
    });
    TimeConstantsService.$name = 'brWeeklySchedulerTimeConstantsService';
    return TimeConstantsService;
}());
angular
    .module('br.weeklyScheduler')
    .service(TimeConstantsService.$name, TimeConstantsService);
/** @internal */
var TimeOfDayFilter = /** @class */ (function () {
    function TimeOfDayFilter() {
    }
    TimeOfDayFilter.Factory = function () {
        var factoryFunction = function (timeConstants) {
            return function (seconds) {
                var hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);
                var meridiem = hours > 11 && hours < 24 ? 'P' : 'A';
                seconds -= hours * timeConstants.SECONDS_IN_HOUR;
                var minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);
                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;
                var remainingMinutes = minutes.toString();
                if (remainingMinutes.length == 1) {
                    remainingMinutes = '0' + remainingMinutes;
                }
                var displayHours = hours % 12 || 12;
                if (!seconds) {
                    return displayHours + ":" + remainingMinutes + meridiem;
                }
                else {
                    return displayHours + ":" + remainingMinutes + ":" + seconds + meridiem;
                }
            };
        };
        factoryFunction.$inject = ['brWeeklySchedulerTimeConstantsService'];
        return factoryFunction;
    };
    TimeOfDayFilter.$name = 'brWeeklySchedulerTimeOfDay';
    return TimeOfDayFilter;
}());
angular
    .module('br.weeklyScheduler')
    .filter(TimeOfDayFilter.$name, TimeOfDayFilter.Factory());
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
/** @internal */
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
        this.items = this.purgeItems(this.items);
        this.items.forEach(function (item) { return item.mergeOverlaps(); });
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
                if (this.config.nullEnds) {
                    item.forceNullEnds();
                }
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
    DayMap.value = (_a = {},
        _a[0 /* Monday */] = 'Mon',
        _a[1 /* Tuesday */] = 'Tue',
        _a[2 /* Wednesday */] = 'Wed',
        _a[3 /* Thursday */] = 'Thur',
        _a[4 /* Friday */] = 'Fri',
        _a[5 /* Saturday */] = 'Sat',
        _a[6 /* Sunday */] = 'Sun',
        _a);
    return DayMap;
}());
angular
    .module('br.weeklyScheduler')
    .constant(DayMap.$name, DayMap.value);
var _a;
/** @internal */
var NullEndWidth = /** @class */ (function () {
    function NullEndWidth() {
    }
    NullEndWidth.$name = 'brWeeklySchedulerNullEndWidth';
    NullEndWidth.value = 7200;
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
        this.editable = angular.isDefined(item.editable) ? item.editable : true;
        this.label = item.label;
        this.schedules = item.schedules.map(function (schedule) { return rangeFactory.createRange(config, schedule); });
    }
    WeeklySchedulerItem.prototype.addSchedule = function (schedule) {
        schedule.day = this.day;
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
        var hasEditFunction = angular.isFunction(this.config.editSlot);
        return this.editable && hasEditFunction;
    };
    /** Determine if a schedule is able to be modified */
    WeeklySchedulerItem.prototype.canEditSchedule = function (schedule) {
        var itemIsEditable = this.editable;
        var scheduleIsEditable = schedule.editable;
        return itemIsEditable && scheduleIsEditable;
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
    WeeklySchedulerItem.prototype.forceNullEnds = function () {
        this.schedules.forEach(function (s) { return s.end = null; });
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
                var schedulesBothEditable = el.editable && schedule.editable;
                if (schedulesBothEditable) {
                    var overlapState = _this.overlapService.getOverlapState(_this.config, schedule, el);
                    var overlapHandler = _this.getOverlapHandler(overlapState);
                    overlapHandler(schedule, el);
                }
            }
        });
    };
    WeeklySchedulerItem.prototype.needsOverlapsMerged = function () {
        var len = this.schedules.length;
        // Compare two at a time
        for (var i = 0; i < len - 1; i += 1) {
            var current = this.schedules[i];
            var next = this.schedules[i + 1];
            var schedulesBothEditable = current.editable && next.editable;
            if (!schedulesBothEditable) {
                return false;
            }
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
        this.$class = schedule.$class;
        this.$isActive = schedule.$isActive;
        this.$isDeleting = schedule.$isDeleting;
        this.$isEditing = schedule.$isEditing;
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
        this.editable = angular.isDefined(schedule.editable) ? schedule.editable : true;
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
        var newEndAfterOrAtExistingStart = this.endAdjusterService.adjustEndForView(this.config, updatedEnd) >= this.start + 1;
        return changed && newEndBeforeOrAtMax && newEndAfterOrAtExistingStart;
    };
    WeeklySchedulerRange.prototype.canUpdateStart = function (updatedStart) {
        var changed = this.start !== updatedStart;
        var newStartBeforeOrAtExistingEnd = updatedStart <= this.endAdjusterService.adjustEndForView(this.config, this.end) - 1;
        var newStartAfterOrAtMin = updatedStart >= 0;
        return changed && (this.config.nullEnds || newStartBeforeOrAtExistingEnd) && newStartAfterOrAtMin;
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
        if (!this.item.canEditSchedule(this.schedule)) {
            return;
        }
        this.$scope.$emit("brWeeklyScheduler.slotDragged" /* SLOT_DRAGGED */, this.schedule);
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.prototype.startResize = function () {
        if (!this.item.canEditSchedule(this.schedule)) {
            return;
        }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvQWRhcHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9jb25maWd1cmF0aW9uL0NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvY29uZmxpY3Rpbmctb3B0aW9ucy9Db25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy9EcmFnU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L0VsZW1lbnRPZmZzZXRTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZW5kLWFkanVzdGVyL0VuZEFkanVzdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ZpbGwtZW1wdHktd2l0aC1kZWZhdWx0L0ZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2Z1bGwtY2FsZW5kYXIvRnVsbENhbGVuZGFyRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ2hvc3Qtc2xvdC9naG9zdC1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ3JvdXAtYnkvR3JvdXBTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL0hhbmRsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL0hvdXJseUdyaWREaXJlY3RpdmUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sYXN0LWdob3N0LWRheS9MYXN0R2hvc3REYXlTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbWF4LXRpbWUtc2xvdC9NYXhUaW1lU2xvdERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pbmltdW0tc2VwYXJhdGlvbi9NaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pc3NpbmctZGF5cy9NaXNzaW5nRGF5c1NlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tb25vLXNjaGVkdWxlL01vbm9TY2hlZHVsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vdXNlLXRyYWNrZXIvTW91c2VUcmFja2VyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbnVsbC1lbmQvTnVsbEVuZERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9wdXJnZS1kZWZhdWx0L1B1cmdlRGVmYXVsdFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3JldmFsaWRhdGUvUmV2YWxpZGF0ZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtY291bnQvU2NoZWR1bGVDb3VudERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9GdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL01heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9NaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9OdWxsRW5kVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9PdmVybGFwVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9TY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9TY3JvbGxTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9TZWNvbmRzQXNUZXh0RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9UaW1lQ29uc3RhbnRzU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvVGltZU9mRGF5RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS9UaW1lUmFuZ2VDb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90b3VjaC9Ub3VjaFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci92YWx1ZS1ub3JtYWxpemF0aW9uL1ZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9EYXlNYXAudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9OdWxsRW5kV2lkdGgudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vV2Vla2x5U2NoZWR1bGVySXRlbS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9XZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItcmFuZ2UvV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL1dlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvem9vbS9ab29tU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvSVdlZWtseVNjaGVkdWxlckFkYXB0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9kcmFnLW1vZGUvRHJhZ01vZGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9pbnZhbGlkLW1lc3NhZ2UvSW52YWxpZE1lc3NhZ2VzLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcG9pbnQvSVBvaW50LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL0lSZXNpemVTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL0lSZXNpemVTZXJ2aWNlUHJvdmlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXN0cmljdGlvbi1leHBsYW5hdGlvbnMvUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1jb3VudC9TY2hlZHVsZUNvdW50T3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJPcHRpb25zLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL0lJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vSVdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzVELFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXO0lBQzVFLFVBQVUsRUFBcUIsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTO1FBRWhFLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixPQUFPLEVB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QUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDSCxJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBbkZNLGlCQUFLLEdBQUcsOEJBQThCLENBQUM7SUFFdkMsbUJBQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBa0ZwQyxrQkFBQztDQXJGRCxBQXFGQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ2JyLndlZWtseVNjaGVkdWxlcicsICduZ01hdGVyaWFsJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckcScsICckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsICckbWREaWFsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRxOiBhbmd1bGFyLklRU2VydmljZSwgJHNjb3BlLCAkdGltZW91dCwgJGxvZywgJG1kRGlhbG9nKSB7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYnV0dG9uQ2xhc3NlczogWyd3b3chJ10sXHJcbiAgICAgICAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEZW1vSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgIGVkaXRTbG90OiBmdW5jdGlvbiAoc2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGUuJGlzRGVsZXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gJHEud2hlbihzY2hlZHVsZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmlsbEVtcHR5V2l0aERlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICBpbnRlcnZhbDogNjAgKiAxNSxcclxuICAgICAgICAgIGZpbGxOdWxsRW5kczogMTgwMCxcclxuICAgICAgICAgIG1heFRpbWVTbG90OiAzNjAwLFxyXG4gICAgICAgICAgbWluaW11bVNlcGFyYXRpb246IDMwMCxcclxuICAgICAgICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4ge1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zOiB7XHJcbiAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBTbG90cyBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gJHt2YWx1ZX0hYFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNhdmVTY2hlZHVsZXI6ICgpID0+IHtcclxuICAgICAgICAgICAgJHNjb3BlLnJlc3VsdCA9ICRzY29wZS5hZGFwdGVyLmdldFNuYXBzaG90KCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJHEud2hlbih0cnVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGFzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5tb2RlbC5vcHRpb25zLm51bGxFbmRzID0gdHJ1ZTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDM2MDAsXHJcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU2F0dXJkYXksXHJcbiAgICAgICAgICBzdGFydDogMzYwMCxcclxuICAgICAgICAgIGVuZDogNzUwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDcyMDAsXHJcbiAgICAgICAgICBlbmQ6IDAsXHJcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIF0pO1xyXG4gICAgfV0pO1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vSXRlbSBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxib29sZWFuPiB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cyxcclxuICAgIHB1YmxpYyBzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj5bXVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgZ2V0IGVkaXRhYmxlKCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogVGhlIGRhdGEgaXMgYWxyZWFkeSBpbiBhbiBhY2NlcHRhYmxlIGZvcm1hdCBmb3IgdGhlIGRlbW8gc28ganVzdCBwYXNzIGl0IHRocm91Z2ggKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vQWRhcHRlciBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+LCBib29sZWFuPiB7XHJcbiAgcHVibGljIGl0ZW1zOiBEZW1vSXRlbVtdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGluaXRpYWxEYXRhOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+W10sXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U25hcHNob3QoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgIHJldHVybiBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UocmFuZ2UpIHtcclxuICAgIHJhbmdlLiRjbGFzcyA9ICd0ZXN0JztcclxuXHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfVxyXG59XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEFkYXB0ZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckFkYXB0ZXJTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJHcm91cFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZ3JvdXBTZXJ2aWNlOiBHcm91cFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBpdGVtRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldEl0ZW1zRnJvbUFkYXB0ZXIoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT4pIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgIGlmIChhZGFwdGVyKSB7XHJcbiAgICAgICAgICBsZXQgc2NoZWR1bGVzID0gYWRhcHRlci5pbml0aWFsRGF0YS5tYXAoZGF0YSA9PiBhZGFwdGVyLmN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShkYXRhKSk7XHJcbiAgICAgICAgICBsZXQgZ3JvdXBlZFNjaGVkdWxlcyA9IHRoaXMuZ3JvdXBTZXJ2aWNlLmdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcbiAgICBcclxuICAgICAgICAgIGZvciAobGV0IGtleSBpbiBncm91cGVkU2NoZWR1bGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5pdGVtRmFjdG9yeS5jcmVhdGVJdGVtKGNvbmZpZywgcGFyc2VJbnQoa2V5LCAxMCksIGdyb3VwZWRTY2hlZHVsZXNba2V5XSk7XHJcbiAgICBcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEFkYXB0ZXJTZXJ2aWNlLiRuYW1lLCBBZGFwdGVyU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQ29uZmlndXJhdGlvblNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29uZmlndXJhdGlvblNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclRpbWVDb25zdGFudHNTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdGltZUNvbnN0YW50czogVGltZUNvbnN0YW50c1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb25maWd1cmF0aW9uKG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+KSB7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCA5MDA7IC8vIHNlY29uZHNcclxuICAgICAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IHRoaXMudGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX0RBWSAvIGludGVydmFsO1xyXG5cclxuICAgICAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHRoaXMuZ2V0RGVmYXVsdE9wdGlvbnMoKTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXJPcHRpb25zID0gYW5ndWxhci5tZXJnZShkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZCh1c2VyT3B0aW9ucywge1xyXG4gICAgICAgICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXHJcbiAgICAgICAgICAgIG1heFZhbHVlOiB0aGlzLnRpbWVDb25zdGFudHMuU0VDT05EU19JTl9EQVksXHJcbiAgICAgICAgICAgIGhvdXJDb3VudDogdGhpcy50aW1lQ29uc3RhbnRzLkhPVVJTX0lOX0RBWSxcclxuICAgICAgICAgICAgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldERlZmF1bHRPcHRpb25zKCk6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHsgcmV0dXJuIHsgZGF5OiBkYXksIHNjaGVkdWxlczogc2NoZWR1bGVzIH0gfSxcclxuICAgICAgICAgICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICAgICAgICAgICAgb25DaGFuZ2U6ICgpID0+IGFuZ3VsYXIubm9vcCgpLFxyXG4gICAgICAgICAgICBvblJlbW92ZTogKCkgPT4gYW5ndWxhci5ub29wKCksXHJcbiAgICAgICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhUaW1lU2xvdDogKHZhbHVlKSA9PiBgTWF4IHRpbWUgc2xvdCBsZW5ndGg6ICR7dmFsdWV9YCxcclxuICAgICAgICAgICAgICAgIG1pbmltdW1TZXBhcmF0aW9uOiAodmFsdWUpID0+IGBTbG90cyBtdXN0IGJlIGF0IGxlYXN0ICR7dmFsdWV9IGFwYXJ0IWAsXHJcbiAgICAgICAgICAgICAgICBmdWxsQ2FsZW5kYXI6ICdGb3IgdGhpcyBjYWxlbmRhciwgZXZlcnkgZGF5IG11c3QgYmUgY29tcGxldGVseSBmdWxsIG9mIHNjaGVkdWxlcy4nLFxyXG4gICAgICAgICAgICAgICAgbW9ub1NjaGVkdWxlOiAnVGhpcyBjYWxlbmRhciBtYXkgb25seSBoYXZlIG9uZSB0aW1lIHNsb3QgcGVyIGRheScsXHJcbiAgICAgICAgICAgICAgICBudWxsRW5kczogJ0l0ZW1zIGluIHRoaXMgY2FsZW5kYXIgZG8gbm90IGhhdmUgZW5kIHRpbWVzLiBTY2hlZHVsZWQgZXZlbnRzIGJlZ2luIGF0IHRoZSBzdGFydCB0aW1lIGFuZCBlbmQgd2hlbiB0aGV5IGFyZSBmaW5pc2hlZC4nLFxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVDb3VudDogKG9wdGlvbnMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGx1cmFsaXplZFNsb3QgPSAnc2xvdCcgKyAob3B0aW9ucy5jb3VudCA9PT0gMSA/ICcnIDogJ3MnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhhY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBUaGlzIGNhbGVuZGFyIG11c3QgaGF2ZSBleGFjdGx5ICR7b3B0aW9ucy5jb3VudH0gJHtwbHVyYWxpemVkU2xvdH0gcGVyIGRheWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgYSBtYXhpbXVtIG9mICR7b3B0aW9ucy5jb3VudH0gJHtwbHVyYWxpemVkU2xvdH0gcGVyIGRheWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY2hlZHVsZUNvdW50T3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShDb25maWd1cmF0aW9uU2VydmljZS4kbmFtZSwgQ29uZmlndXJhdGlvblNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGdldENvbmZsaWN0aW5nT3B0aW9ucyhvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55Pikge1xyXG4gICAgICAgIGlmIChvcHRpb25zLm51bGxFbmRzICYmIG9wdGlvbnMuc2NoZWR1bGVDb3VudE9wdGlvbnMgJiYgb3B0aW9ucy5zY2hlZHVsZUNvdW50T3B0aW9ucy5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBBIG51bGxFbmRzIGNhbGVuZGFyIGhhcyBhIG1heGltdW0gc2NoZWR1bGVDb3VudCBvZiAxYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmZ1bGxDYWxlbmRhciAmJiBvcHRpb25zLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgT3B0aW9ucyAnZnVsbENhbGVuZGFyJyAmICdmaWxsRW1wdHlXaXRoRGVmYXVsdCcgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS5gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsbEVtcHR5V2l0aERlZmF1bHQgJiYgIWFuZ3VsYXIuaXNEZWZpbmVkKG9wdGlvbnMuZGVmYXVsdFZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYElmIHVzaW5nIG9wdGlvbiAnZmlsbEVtcHR5V2l0aERlZmF1bHQnLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgJ2RlZmF1bHRWYWx1ZS4nYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuJG5hbWUsIENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIERyYWdTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckRyYWdTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlcixcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RHJhZ1JhbmdlRnJvbVNjaGVkdWxlKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBjb25maWcubnVsbEVuZHMgP1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHNjaGVkdWxlLnN0YXJ0ICsgdGhpcy5udWxsRW5kV2lkdGgpIDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBzY2hlZHVsZS5lbmQpLFxyXG4gICAgICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKERyYWdTZXJ2aWNlLiRuYW1lLCBEcmFnU2VydmljZSk7XHJcbiIsIi8qKlxyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGpRdWVyeSB0byBrZWVwIGRlcGVuZGVuY2llcyBtaW5pbWFsXHJcbiAqL1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBFbGVtZW50T2Zmc2V0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbGVtZW50T2Zmc2V0U2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGxlZnQoJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByaWdodCgkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRWxlbWVudE9mZnNldFNlcnZpY2UuJG5hbWUsIEVsZW1lbnRPZmZzZXRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBFbmRBZGp1c3RlclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGVuZCA9PT0gY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVuZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRqdXN0RW5kRm9yVmlldyhjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubWF4VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRW5kQWRqdXN0ZXJTZXJ2aWNlLiRuYW1lLCBFbmRBZGp1c3RlclNlcnZpY2UpO1xyXG4iLCIvKiogV2hlbiB1c2luZyB0aGUgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBvcHRpb24sIHRoaXMgc2VydmljZSB3aWxsIGJlIHVzZWQgdG8gY29uc3RydWN0IHRoZSBjb3JyZWN0IGNhbGVuZGFyIGZvciBzZXJ2ZXIgc3VibWlzc2lvbiAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZmlsbChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIGlmICghc2NoZWR1bGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW3RoaXMuZ2V0RW1wdHlTY2hlZHVsZShpdGVtLCBjb25maWcpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpbGxlZFNjaGVkdWxlcyhzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRFbXB0eVNjaGVkdWxlKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogaXRlbS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKGNvbmZpZywgY29uZmlnLm1heFZhbHVlKSxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEVuZFNjaGVkdWxlKGxhc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogbGFzdFNjaGVkdWxlLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IGxhc3RTY2hlZHVsZS5lbmQsXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTdGFydFNjaGVkdWxlKGZpcnN0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGZpcnN0U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgICAgZW5kOiBmaXJzdFNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkRmlsbE51bGxFbmQoc2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGUuZW5kID0gdGhpcy5nZXROdWxsRW5kVmFsdWUoc2NoZWR1bGUsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gW3NjaGVkdWxlXTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlVG91Y2hlc1N0YXJ0KHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0U3RhcnRTY2hlZHVsZShzY2hlZHVsZSwgY29uZmlnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0RW5kU2NoZWR1bGUoc2NoZWR1bGUsIGNvbmZpZykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXMoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgc2NoZWR1bGVzID0gdGhpcy5nZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGVzWzBdLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIgYXQgYSB0aW1lXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNjaGVkdWxlID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dFNjaGVkdWxlID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc0ZpcnN0TG9vcCA9IGkgPT0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0ZpcnN0TG9vcCAmJiAhdGhpcy5zY2hlZHVsZVRvdWNoZXNTdGFydChjdXJyZW50U2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydFNjaGVkdWxlID0gdGhpcy5nZXRTdGFydFNjaGVkdWxlKGN1cnJlbnRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChzdGFydFNjaGVkdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlc1RvdWNoKGN1cnJlbnRTY2hlZHVsZSwgbmV4dFNjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1NjaGVkdWxlID0gdGhpcy5nZXROZXdTY2hlZHVsZShjdXJyZW50U2NoZWR1bGUsIG5leHRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0xhc3RMb29wID0gaSA9PSBsZW4gLSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTGFzdExvb3AgJiYgIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKG5leHRTY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZFNjaGVkdWxlID0gdGhpcy5nZXRFbmRTY2hlZHVsZShuZXh0U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2goZW5kU2NoZWR1bGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV3U2NoZWR1bGUoY3VycmVudFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBuZXh0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGN1cnJlbnRTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50U2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgICBlbmQ6IG5leHRTY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE51bGxFbmRWYWx1ZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUuc3RhcnQgKyBjb25maWcuZmlsbE51bGxFbmRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlczogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKSB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0IC0gYi5zdGFydCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZXNUb3VjaChlYXJsaWVyU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGxhdGVyU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gZWFybGllclNjaGVkdWxlLmVuZCA9PT0gbGF0ZXJTY2hlZHVsZS5zdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVG91Y2hlc1N0YXJ0KHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZS5zdGFydCA9PT0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVRvdWNoZXNFbmQoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlLmVuZCA9PT0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvdWxkRmlsbE51bGxFbmQoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlLmVuZCA9PT0gbnVsbCAmJiBjb25maWcubnVsbEVuZHMgJiYgY29uZmlnLmZpbGxOdWxsRW5kcztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS4kbmFtZSwgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyRnVsbENhbGVuZGFyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ickZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bGxDYWxlbmRhckRpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoRnVsbENhbGVuZGFyRGlyZWN0aXZlLiRuYW1lLCBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3RDb250cm9sbGVyJztcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ2dob3N0U2xvdEN0cmwnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG11bHRpU2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyR2hvc3RTbG90JztcclxuXHJcbiAgICBjb250cm9sbGVyID0gR2hvc3RTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IEdob3N0U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIG11bHRpU2xpZGVyQ3RybDogJ15ick11bHRpU2xpZGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8bmctdHJhbnNjbHVkZSBjbGFzcz1cImZ1bGxXaWR0aFwiPjwvbmctdHJhbnNjbHVkZT5cclxuICAgIGA7XHJcblxyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbn1cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWUsIEdob3N0U2xvdENvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KEdob3N0U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IEdob3N0U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnLFxyXG4gICAgaW1tZWRpYXRlOiAnPCdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciBtb3VzZVRyYWNrZXJTZXJ2aWNlID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlO1xyXG4gICAgdmFyIHRvdWNoU2VydmljZSA9IHRoaXMudG91Y2hTZXJ2aWNlO1xyXG4gICAgdmFyIHggPSAwO1xyXG5cclxuICAgIGxldCBtb3VzZWRvd25FdmVudDogc3RyaW5nID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0JztcclxuICAgIGxldCBtb3VzZW1vdmVFdmVudDogc3RyaW5nID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUnO1xyXG4gICAgbGV0IG1vdXNldXBFdmVudDogc3RyaW5nID0gJ21vdXNldXAgdG91Y2hlbmQnO1xyXG5cclxuICAgIGVsZW1lbnQub24obW91c2Vkb3duRXZlbnQsIG1vdXNlZG93bik7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vkb3duKGV2ZW50KSB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBoYW5kbGVycyBmcm9tIGJlaW5nIGZpcmVkIGlmIHRoZXkgYXJlIG5lc3RlZCAob25seSB0aGUgb25lIHlvdSBkaXJlY3RseSBpbnRlcmFjdGVkIHdpdGggc2hvdWxkIGZpcmUpXHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmFrZU1vdXNlZG93bigpIHtcclxuICAgICAgeCA9IG1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpLng7XHJcblxyXG4gICAgICBzdGFydERyYWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYWdlWChldmVudCkge1xyXG4gICAgICByZXR1cm4gZXZlbnQucGFnZVggfHwgdG91Y2hTZXJ2aWNlLmdldFBhZ2VYKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0RHJhZygpIHtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNlbW92ZUV2ZW50LCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24obW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5QXN5bmMoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2NvcGUuaW1tZWRpYXRlKSB7XHJcbiAgICAgIGZha2VNb3VzZWRvd24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZSxcclxuICAgIHByaXZhdGUgbW91c2VUcmFja2VyU2VydmljZTogTW91c2VUcmFja2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdG91Y2hTZXJ2aWNlOiBUb3VjaFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCcsICdicldlZWtseVNjaGVkdWxlck1vdXNlVHJhY2tlclNlcnZpY2UnLCAnYnJXZWVrbHlTY2hlZHVsZXJUb3VjaFNlcnZpY2UnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JySG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ15icldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBTdHJpcGUgaXQgYnkgaG91clxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IHRoaXMudGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX0hPVVIgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHRpbWVDb25zdGFudHM6IFRpbWVDb25zdGFudHNTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHRpbWVDb25zdGFudHMpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKHRpbWVDb25zdGFudHMpO1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJUaW1lQ29uc3RhbnRzU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShIb3VybHlHcmlkRGlyZWN0aXZlLiRuYW1lLCBIb3VybHlHcmlkRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTGFzdEdob3N0RGF5U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJMYXN0R2hvc3REYXlTZXJ2aWNlJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gZHJhZ2dpbmcgZ2hvc3RzIGFjcm9zcyBtdWx0aXBsZSBkYXlzLCBpZiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgcG9pbnRlciBvdXQgb2Ygb25lIGV4dHJlbWUgYW5kIGJhY2sgaW50byB0aGUgbGFzdCBzbG90IHRoYXQgcmVuZGVyZWQgYSBnaG9zdCxcclxuICAgICAqIFdlIHNob3VsZCByZW1vdmUgdGhlIGdob3N0IGZyb20gdGhhdCBleHRyZW1lLiBUaGlzIHdpbGwgaGVscCBncmFiIHRoZSBjb3JyZWN0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TGFzdEdob3N0RGF5KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleCA9IHRoaXMuZ2V0T3JpZ2luSW5kZXgoaXRlbXMpO1xyXG4gICAgICAgIGxldCByZW5kZXJlZEdob3N0SW5kaWNlcyA9IHRoaXMuZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXMpO1xyXG5cclxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIG90aGVyICRyZW5kZXJHaG9zdCBpdGVtcyBhcmUgYWJvdmUgb3IgYmVsb3cgdGhlICRpc0dob3N0T3JpZ2luIGl0ZW1cclxuICAgICAgICBsZXQgYWJvdmUgPSByZW5kZXJlZEdob3N0SW5kaWNlcy5ldmVyeShpID0+IGkgPD0gb3JpZ2luSW5kZXgpO1xyXG5cclxuICAgICAgICAvLyB0YWtlIGZpcnN0IGl0ZW0gZm9yIGFib3ZlIG9yIGxhc3QgaXRlbSBmb3IgYmVsb3dcclxuICAgICAgICBsZXQgbGFzdEdob3N0RGF5SW5kZXggPSBhYm92ZSA/IDAgOiByZW5kZXJlZEdob3N0SW5kaWNlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVuZGVyZWRHaG9zdEluZGljZXNbbGFzdEdob3N0RGF5SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgdGhlIGluZGV4IG9mIHRoZSAkaXNHaG9zdE9yaWdpbiBpdGVtICovXHJcbiAgICBwcml2YXRlIGdldE9yaWdpbkluZGV4KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleDtcclxuICAgICAgICBsZXQgbGVuID0gaXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLiRpc0dob3N0T3JpZ2luKSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5JbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbkluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgYWxsIG9mIHRoZSBpdGVtIGluZGljZXMgdGhhdCBjdXJyZW50bHkgaGF2ZSBnaG9zdHMgcmVuZGVyZWQgKi9cclxuICAgIHByaXZhdGUgZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICAgICAgbGV0IHJlbmRlcmVkR2hvc3RJbmRpY2VzID0gW107XHJcbiAgICAgICAgbGV0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSBpdGVtc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlcmVkR2hvc3RJbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZW5kZXJlZEdob3N0SW5kaWNlcztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKExhc3RHaG9zdERheVNlcnZpY2UuJG5hbWUsIExhc3RHaG9zdERheVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1heFRpbWVTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdick1heFRpbWVTbG90JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyTWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXhUaW1lU2xvdERpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShNYXhUaW1lU2xvdERpcmVjdGl2ZS4kbmFtZSwgTWF4VGltZVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWluaW11bVNlcGFyYXRpb25EaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTWluaW11bVNlcGFyYXRpb24nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoYXR0cnMuYnJNaW5pbXVtU2VwYXJhdGlvbikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1pbmltdW1TZXBhcmF0aW9uRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyTWluaW11bVNlcGFyYXRpb25WYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKE1pbmltdW1TZXBhcmF0aW9uRGlyZWN0aXZlLiRuYW1lLCBNaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1pc3NpbmdEYXlzU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaXNzaW5nRGF5c1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBkYXlNYXA6IERheU1hcCxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2NoZWR1bGVyIHNob3VsZCBhbHdheXMgc2hvdyBhbGwgZGF5cywgZXZlbiBpZiBpdCB3YXMgbm90IHBhc3NlZCBhbnkgc2NoZWR1bGVzIGZvciB0aGF0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmlsbEl0ZW1zKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSA9IFtdO1xyXG5cclxuICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5kYXlNYXAsIChkYXk6IHN0cmluZywgc3RyaW5nS2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5kYXkgPT09IGtleSk7XHJcbiAgICAgICAgICBsZXQgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gZmlsdGVyZWRJdGVtcy5sZW5ndGggPyBmaWx0ZXJlZEl0ZW1zWzBdIDogbnVsbDtcclxuICAgIFxyXG4gICAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuaXRlbUZhY3RvcnkuY3JlYXRlSXRlbShjb25maWcsIGtleSwgW10pKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGRheTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkocmVzdWx0KS5zb3J0KChhLCBiKSA9PiBhLmRheSAtIGIuZGF5KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1pc3NpbmdEYXlzU2VydmljZS4kbmFtZSwgTWlzc2luZ0RheXNTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTW9ub1NjaGVkdWxlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ick1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbm9TY2hlZHVsZURpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoTW9ub1NjaGVkdWxlRGlyZWN0aXZlLiRuYW1lLCBNb25vU2NoZWR1bGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW91c2VUcmFja2VyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb3VzZVRyYWNrZXJTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdXNlUG9zaXRpb246IElQb2ludDtcclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSc7XHJcblxyXG4gICAgICAgIGxldCBldmVudCA9IHRoaXMuc2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLiRkb2N1bWVudC51bmJpbmQoZXZlbnROYW1lLCBldmVudCk7XHJcbiAgICAgICAgdGhpcy4kZG9jdW1lbnQub24oZXZlbnROYW1lLCBldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vdXNlUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldE1vdXNlUG9zaXRpb24oZXZlbnQpIHtcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSB7IHg6IGV2ZW50LnBhZ2VYLCB5OiBldmVudC5wYWdlWSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW91c2VUcmFja2VyU2VydmljZS4kbmFtZSwgTW91c2VUcmFja2VyU2VydmljZSlcclxuICAgIC5ydW4oW01vdXNlVHJhY2tlclNlcnZpY2UuJG5hbWUsIChtb3VzZVRyYWNrZXJTZXJ2aWNlOiBNb3VzZVRyYWNrZXJTZXJ2aWNlKSA9PiB7XHJcbiAgICAgICAgbW91c2VUcmFja2VyU2VydmljZS5pbml0aWFsaXplKCk7XHJcbiAgICB9XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHEnLFxyXG4gICAgJyRzY29wZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbGVtZW50T2Zmc2V0U2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTW91c2VUcmFja2VyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlclZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgZWxlbWVudE9mZnNldFNlcnZpY2U6IEVsZW1lbnRPZmZzZXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbW91c2VUcmFja2VyU2VydmljZTogTW91c2VUcmFja2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LFxyXG4gICAgcHJpdmF0ZSB2YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlOiBWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkcmFnU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcbiAgcHJpdmF0ZSBwZW5kaW5nU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnRpbmdHaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG4gIHByaXZhdGUgc2V0R2hvc3RWYWx1ZXM6IChvcHRpb25zOiB7IGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9IH0pID0+IHZvaWQ7XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIFxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9uTW91c2VFbnRlcigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5vbk1vdXNlTGVhdmUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICAgICB0aGlzLm9uTW91c2VVcCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DT01NSVRfR0hPU1QsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBnaG9zdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgICAgdGhpcy5jb21taXRHaG9zdChnaG9zdFNjaGVkdWxlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfR0hPU1QsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXk6IG51bWJlcikgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuaXRlbS4kaXNHaG9zdE9yaWdpbiAmJiB0aGlzLml0ZW0uZGF5ID09PSBkYXkpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdob3N0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0FMTF9HSE9TVFMsICgpID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVHaG9zdCgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VFbnRlcigpIHtcclxuICAgIC8vIElmIHRoZSBjdXJzb3IgaXMgbW92aW5nIEJBQ0sgaW50byBhbiBpdGVtIHRoYXQgQUxSRUFEWSBoYXMgYSBnaG9zdCByZW5kZXJlZCwgd2UnbGwgd2FudCB0byByZW1vdmUgdGhlIGdob3N0IGZyb20gdGhlIGl0ZW0gdGhhdCB3YXMgbGVmdFxyXG4gICAgaWYgKHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9MQVNUX0dIT1NUKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kcmFnU2NoZWR1bGUpIHtcclxuICAgICAgdGhpcy5hZGREcmFnU2NoZWR1bGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5naG9zdFZhbHVlcyAmJiAhdGhpcy5pdGVtLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUdob3N0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VMZWF2ZSgpIHtcclxuICAgIGlmICh0aGlzLmRyYWdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLnJlbW92ZURyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vdXNlVXAoKSB7XHJcbiAgICBpZiAodGhpcy5wZW5kaW5nU2NoZWR1bGUpIHtcclxuICAgICAgdGhpcy5jb21taXREcmFnU2NoZWR1bGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgdGhpcy5kcmFnU2NoZWR1bGUuZGF5ID0gdGhpcy5pdGVtLmRheTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlID0gdGhpcy5pdGVtLmFkZFNjaGVkdWxlKHRoaXMuZHJhZ1NjaGVkdWxlKTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZURyYWdTY2hlZHVsZSgpIHtcclxuICAgIHRoaXMuaXRlbS5yZW1vdmVTY2hlZHVsZSh0aGlzLmRyYWdTY2hlZHVsZSk7XHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21taXREcmFnU2NoZWR1bGUoKSB7XHJcbiAgICB0aGlzLnBlbmRpbmdTY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgdGhpcy5pdGVtLm1lcmdlU2NoZWR1bGUodGhpcy5wZW5kaW5nU2NoZWR1bGUpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTY2hlZHVsZUZvckFkZChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgc3RhcnQgPSB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUoc3RhcnQsIDAsIGVuZCk7XHJcbiAgICBlbmQgPSB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUoZW5kLCBzdGFydCwgdGhpcy5jb25maWcubWF4VmFsdWUpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICBlbmQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzY2hlZHVsZSA9IHtcclxuICAgICAgZGF5OiB0aGlzLml0ZW0uZGF5LFxyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBzY2hlZHVsZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb3BlbkVkaXRvckZvckFkZChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogYW5ndWxhci5JUHJvbWlzZTxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4+IHtcclxuICAgIGlmICh0aGlzLml0ZW0uY2FuRWRpdCgpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcS53aGVuKHNjaGVkdWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBFeHBhbmQgZ2hvc3Qgd2hpbGUgZHJhZ2dpbmcgaW4gaXQgKi9cclxuICBwdWJsaWMgYWRqdXN0R2hvc3QoKSB7XHJcbiAgICBsZXQgcG9pbnQgPSB0aGlzLm1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpO1xyXG4gICAgbGV0IG1vdXNlVmFsdWU6IG51bWJlciA9IHRoaXMuZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKHBvaW50LngpO1xyXG5cclxuICAgIGxldCBleGlzdGluZ0xlZnRWYWx1ZTogbnVtYmVyID0gdGhpcy5zdGFydGluZ0dob3N0VmFsdWVzLmxlZnQ7XHJcblxyXG4gICAgbGV0IHVwZGF0ZWRMZWZ0VmFsdWU6IG51bWJlcjtcclxuICAgIGxldCB1cGRhdGVkUmlnaHRWYWx1ZTogbnVtYmVyO1xyXG4gICAgXHJcbiAgICBpZiAobW91c2VWYWx1ZSA8IGV4aXN0aW5nTGVmdFZhbHVlKSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgbGVmdFxyXG4gICAgICB1cGRhdGVkTGVmdFZhbHVlID0gbW91c2VWYWx1ZTtcclxuICAgICAgdXBkYXRlZFJpZ2h0VmFsdWUgPSBleGlzdGluZ0xlZnRWYWx1ZTtcclxuICAgIH0gZWxzZSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgcmlnaHRcclxuICAgICAgdXBkYXRlZExlZnRWYWx1ZSA9IGV4aXN0aW5nTGVmdFZhbHVlO1xyXG4gICAgICB1cGRhdGVkUmlnaHRWYWx1ZSA9IG1vdXNlVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGdob3N0VmFsdWVzID0ge1xyXG4gICAgICBsZWZ0OiB0aGlzLm5vcm1hbGl6ZUdob3N0VmFsdWUodXBkYXRlZExlZnRWYWx1ZSksXHJcbiAgICAgIHJpZ2h0OiB0aGlzLm5vcm1hbGl6ZUdob3N0VmFsdWUodXBkYXRlZFJpZ2h0VmFsdWUpXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc2V0R2hvc3RWYWx1ZXMoeyBcclxuICAgICAgZ2hvc3RWYWx1ZXM6IGdob3N0VmFsdWVzXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLyoqIE1vdmUgZ2hvc3QgYXJvdW5kIHdoaWxlIG5vdCBkcmFnZ2luZyAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvbkdob3N0KCkge1xyXG4gICAgbGV0IHBvaW50ID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlLmdldE1vdXNlUG9zaXRpb24oKTtcclxuICAgIGxldCB2YWwgPSB0aGlzLmdldFZhbEF0TW91c2VQb3NpdGlvbihwb2ludC54KTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMgPSB7XHJcbiAgICAgIGxlZnQ6IHZhbCxcclxuICAgICAgcmlnaHQ6IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdmFsICsgdGhpcy5udWxsRW5kV2lkdGggOiB2YWwgKyB0aGlzLmNvbmZpZy5pbnRlcnZhbFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNldEdob3N0VmFsdWVzKHtcclxuICAgICAgZ2hvc3RWYWx1ZXM6IGFuZ3VsYXIuY29weSh0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlRG93bigpIHtcclxuICAgIGlmICghdGhpcy5pdGVtLmVkaXRhYmxlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLml0ZW0uJGlzR2hvc3RPcmlnaW4gPSB0cnVlO1xyXG4gICAgdGhpcy5jcmVhdGVHaG9zdCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VNb3ZlKCkge1xyXG4gICAgLy8gbnVsbEVuZHMgY2FsZW5kYXJzIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgYmVjYXVzZSB0aGUgc2l6ZSBvZiB0aGUgc2xvdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXJcclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uR2hvc3QoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgIHRoaXMuYWRqdXN0R2hvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlVXAoKSB7XHJcbiAgICBsZXQgZ2hvc3RTY2hlZHVsZSA9IHRoaXMuZ2V0U2NoZWR1bGVGb3JBZGQodGhpcy5naG9zdFZhbHVlcy5sZWZ0LCB0aGlzLmdob3N0VmFsdWVzLnJpZ2h0KTtcclxuXHJcbiAgICB0aGlzLm9wZW5FZGl0b3JGb3JBZGQoZ2hvc3RTY2hlZHVsZSkudGhlbihlZGl0ZWRHaG9zdFNjaGVkdWxlID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIGVkaXRlZEdob3N0U2NoZWR1bGUpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0FOQ0VMX0dIT1NUKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVHaG9zdCgpIHtcclxuICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSB0cnVlO1xyXG4gICAgdGhpcy5wb3NpdGlvbkdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbW1pdEdob3N0KGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLml0ZW0uY2FuQWRkU2NoZWR1bGUoKSkge1xyXG4gICAgICB0aGlzLml0ZW0uYWRkU2NoZWR1bGVBbmRNZXJnZShnaG9zdFNjaGVkdWxlKTtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbW92ZUdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE1vdXNlUG9zaXRpb24ocGFnZVg6IG51bWJlcikge1xyXG4gICAgbGV0IGVsZW1lbnRPZmZzZXRYID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgbGV0IGxlZnQgPSBwYWdlWCAtIGVsZW1lbnRPZmZzZXRYO1xyXG5cclxuICAgIHJldHVybiBsZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRWYWxBdE1vdXNlUG9zaXRpb24ocGFnZVg6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHRoaXMucGl4ZWxUb1ZhbCh0aGlzLmdldE1vdXNlUG9zaXRpb24ocGFnZVgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm0gYW4gZXh0ZXJuYWwgYWN0aW9uIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgYSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5pdGVtLmNhbkVkaXQoKSkge1xyXG4gICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChuZXdTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIGxldCByYW5nZSA9IHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKHRoaXMuY29uZmlnLCBuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZERlbGV0ZShyYW5nZSkpIHtcclxuICAgICAgICAgIHRoaXMuaXRlbS5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHJhbmdlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZShyYW5nZSk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgbWVyZ2luZyBtdXRhdGVkIHRoZSBzY2hlZHVsZSBmdXJ0aGVyLCB0aGVuIHVwZGF0ZVNjaGVkdWxlIHdvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIGNhbGxlZFxyXG4gICAgICAgICAgLy8gVGhpcyBpcyBzbyB0aGF0IGVkaXRzIHRoYXQgZG9uJ3QgdHJpZ2dlciBtZXJnZXMgc3RpbGwgdHJpZ2dlciBvbkNoYW5nZSxcclxuICAgICAgICAgIC8vIGJ1dCBlZGl0cyB0aGF0IGRvIHRyaWdnZXIgbWVyZ2VzIGRvbid0IHRyaWdnZXIgaXQgdHdpY2VcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhwcmVtZXJnZVNjaGVkdWxlLCByYW5nZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGUudXBkYXRlKHJhbmdlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGV4Y2VwdCBlYXQgdGhlIHVuaGFuZGxlZCByZWplY3Rpb24gZXJyb3JcclxuICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRMZWZ0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdFJpZ2h0KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhIG51bGwgZW5kLCBwbGFjZSB0aGUgZW5kIG9mIHRoZSBzbG90IHR3byBob3VycyBhd2F5IGZyb20gdGhlIGJlZ2lubmluZy5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcyAmJiBlbmQgPT09IG51bGwpIHtcclxuICAgICAgZW5kID0gc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbiBlbmQgb2YgMCBzaG91bGQgZGlzcGxheSBhbGxsbCB0aGUgd2F5IHRvIHRoZSByaWdodCwgdXAgdG8gdGhlIGVkZ2VcclxuICAgIGVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIGVuZCk7XHJcblxyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFJpZ2h0O1xyXG5cclxuICAgIHJldHVybiByZXN1bHQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICB2YWwgPSB0aGlzLm5vcm1hbGl6ZUludGVydmFsVmFsdWUodmFsKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvdWxkRGVsZXRlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmIChzY2hlZHVsZS4kaXNEZWxldGluZykge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQgJiYgc2NoZWR1bGUudmFsdWUgPT09IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbm9ybWFsaXplSW50ZXJ2YWxWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUodmFsdWUsIDAsIHJpZ2h0bW9zdCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG5vcm1hbGl6ZUdob3N0VmFsdWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS5ub3JtYWxpemVWYWx1ZSh2YWx1ZSwgMCwgdGhpcy5jb25maWcubWF4VmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZW1vdmVHaG9zdCgpIHtcclxuICAgIHRoaXMuaXRlbS4kaXNHaG9zdE9yaWdpbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5pdGVtLiRyZW5kZXJHaG9zdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZXRHaG9zdFZhbHVlcyhudWxsKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBkcmFnU2NoZWR1bGU6ICc8JyxcclxuICAgIGdob3N0VmFsdWVzOiAnPCcsXHJcbiAgICBpdGVtOiAnPW5nTW9kZWwnLFxyXG4gICAgc2V0R2hvc3RWYWx1ZXM6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE51bGxFbmREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTnVsbEVuZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bGxFbmREaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShOdWxsRW5kRGlyZWN0aXZlLiRuYW1lLCBOdWxsRW5kRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyT3ZlcmxhcCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBPdmVybGFwRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoT3ZlcmxhcERpcmVjdGl2ZS4kbmFtZSwgT3ZlcmxhcERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBsZXQgY3VycmVudFN0YXJ0ID0gY3VycmVudC5zdGFydDtcclxuICAgICAgICBsZXQgY3VycmVudEVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBjdXJyZW50LmVuZCk7XHJcblxyXG4gICAgICAgIGxldCBvdGhlclN0YXJ0ID0gb3RoZXIuc3RhcnQ7XHJcbiAgICAgICAgbGV0IG90aGVyRW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIG90aGVyLmVuZCk7XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA+PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJTdGFydCA8IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID09PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA9PT0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5Ob092ZXJsYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwU2VydmljZS4kbmFtZSwgT3ZlcmxhcFNlcnZpY2UpO1xyXG4iLCIvKiogV2hlbiB1c2luZyB0aGUgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBvcHRpb24sIHRoaXMgc2VydmljZSB3aWxsIGJlIHVzZWQgdG8gZGVsZXRlIHRoZSBkZWZhdWx0IHNjaGVkdWxlcyBmb3IgY29ycmVjdCBkaXNwbGF5IG9uIHRoZSBjYWxlbmRhciAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFB1cmdlRGVmYXVsdFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgcHVyZ2Uoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIHtcclxuICAgICAgICBsZXQgbGFzdEluZGV4ID0gc2NoZWR1bGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIC8vIGxvb3AgaW4gcmV2ZXJzZSB0byBhdm9pZCBtZXNzaW5nIHVwIGluZGljZXMgYXMgd2UgZ29cclxuICAgICAgICBmb3IgKGxldCBpID0gbGFzdEluZGV4OyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBpZiAoc2NoZWR1bGVzW2ldLnZhbHVlID09PSBjb25maWcuZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUHVyZ2VEZWZhdWx0U2VydmljZS4kbmFtZSwgUHVyZ2VEZWZhdWx0U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZVByb3ZpZGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklSZXNpemVTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyAkbmFtZSA9ICdici53ZWVrbHlTY2hlZHVsZXIucmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy4kZ2V0LiRpbmplY3QgPSBbXHJcbiAgICAgICAgICAgICckcm9vdFNjb3BlJyxcclxuICAgICAgICAgICAgJyR3aW5kb3cnXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tUmVzaXplRXZlbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgc2VydmljZUluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMgPSBldmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljICRnZXQoXHJcbiAgICAgICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApOiBJUmVzaXplU2VydmljZSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VydmljZUluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleGlzdHMgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIHdlIGhhdmUgdG8gJGFwcGx5IHRoZSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKGV2ZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VJbml0aWFsaXplZCA9IHRydWU7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5wcm92aWRlcihSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIFJlc2l6ZVNlcnZpY2VQcm92aWRlcilcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IElSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAncmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRmaWx0ZXInXTtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBleHBsYW5hdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogc3RyaW5nIH0gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRmaWx0ZXI6IElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJTZWNvbmRzQXNUZXh0JykoY29uZmlnLm1heFRpbWVTbG90KTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90XSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tYXhUaW1lU2xvdChtYXhUaW1lU2xvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5mdWxsQ2FsZW5kYXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5tb25vU2NoZWR1bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5OdWxsRW5kXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5udWxsRW5kcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMgJiYgY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmNvdW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5TY2hlZHVsZUNvdW50XSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5zY2hlZHVsZUNvdW50KGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1pbmltdW1TZXBhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIGxldCBtaW5pbXVtU2VwYXJhdGlvbiA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJTZWNvbmRzQXNUZXh0JykoY29uZmlnLm1pbmltdW1TZXBhcmF0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1pbmltdW1TZXBhcmF0aW9uXSA9IGNvbmZpZy5yZXN0cmljdGlvbkV4cGxhbmF0aW9ucy5taW5pbXVtU2VwYXJhdGlvbihtaW5pbXVtU2VwYXJhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHJlcXVpcmUgPSB7XHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNyb3cgZXhwbGFuYXRpb25zXCIgbmctY2xhc3M9XCJ7IHZpb2xhdGlvbjogcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsLnNjaGVkdWxlckN0cmwuZm9ybUNvbnRyb2xsZXIuJGVycm9yW2tleV0gfVwiIG5nLXJlcGVhdD1cIihrZXksIGV4cGxhbmF0aW9uKSBpbiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuZXhwbGFuYXRpb25zXCI+XHJcbiAgICAgICAgICAgIHt7IGV4cGxhbmF0aW9uIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC4kbmFtZSwgbmV3IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWUsIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcik7XHJcbiIsIi8qKlxyXG4gKiBSdW5zIGN1c3RvbSB2YWxpZGF0b3JzIHdoZW5ldmVyIHRoZSBtb2RlbCBjaGFuZ2VzXHJcbiAqL1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXZhbGlkYXRlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJldmFsaWRhdGUnO1xyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMubmdNb2RlbCwgKCkgPT4ge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdGUoKTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmV2YWxpZGF0ZURpcmVjdGl2ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKFJldmFsaWRhdGVEaXJlY3RpdmUuJG5hbWUsIFJldmFsaWRhdGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0VUX1pPT00sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01fSU4sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUNvdW50RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclNjaGVkdWxlQ291bnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5iclNjaGVkdWxlQ291bnQpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTY2hlZHVsZUNvdW50RGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoU2NoZWR1bGVDb3VudERpcmVjdGl2ZS4kbmFtZSwgU2NoZWR1bGVDb3VudERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc2NoZWR1bGVzLCBpdCBhdXRvbWF0aWNhbGx5IGZhaWxzLlxyXG4gICAgICAgIGlmICghbGVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG9ubHkgb25lIGl0ZW0gd2Ugc2hvdWxkIGNoZWNrIHRoYXQgaXQgc3BhbnMgdGhlIHdob2xlIHJhbmdlXHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICBsZXQgc2NoZWR1bGUgPSBzY2hlZHVsZXNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHNjaGVkdWxlLnN0YXJ0KSAmJiB0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShzY2hlZHVsZS5lbmQsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBtb3JlLCBjb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsb29wTGVuID0gbGVuIC0gMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gU29ydCBieSBzdGFydCB0aW1lIGZpcnN0XHJcbiAgICAgICAgbGV0IHNvcnRlZFNjaGVkdWxlcyA9IHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0ID4gYi5zdGFydCA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcExlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBmaXJzdCBpdGVtIGxhbmRzIGF0IDBcclxuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgIXRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoY3VycmVudC5zdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgbGFzdCBpdGVtIGxhbmRzIGF0IG1heFZhbHVlXHJcbiAgICAgICAgICAgIGlmIChpID09PSBsb29wTGVuIC0gMSAmJiAhdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUobmV4dC5lbmQsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIGN1cnJlbnQuZW5kID09PSBuZXh0LnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZUVuZEF0TWF4VmFsdWUoZW5kOiBudW1iZXIsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIChlbmQgfHwgY29uZmlnLm1heFZhbHVlKSA9PT0gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gY29uZmlnLm1heFRpbWVTbG90O1xyXG5cclxuICAgICAgICBpZiAoIW1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXMuc29tZShzID0+IHMudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUgJiYgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHMuZW5kKSAtIHMuc3RhcnQgPiBtYXhUaW1lU2xvdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWluaW11bVNlcGFyYXRpb25WYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk1pbmltdW1TZXBhcmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLm1pbmltdW1TZXBhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbGVuID0gc2NoZWR1bGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKGxlbiA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9vcExlbiA9IGxlbiAtIDE7XHJcblxyXG4gICAgICAgIHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0IC0gYi5zdGFydCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcExlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50U2NoZWR1bGUgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0U2NoZWR1bGUgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5leHRTY2hlZHVsZS5zdGFydCAtIGN1cnJlbnRTY2hlZHVsZS5lbmQgPCBjb25maWcubWluaW11bVNlcGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbXBvcnRhbnQgbm90ZSAtLSB0aGlzIGRvZXMgbm90IHZhbGlkYXRlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLCBidXQgcmF0aGVyIHRoYXQgb25seSBvbmUgTk9OLURFRkFVTFQgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLiAqL1xyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYSBkZWZhdWx0IHZhbHVlIGlzIGRlZmluZWQsIHNjaGVkdWxlcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGRvbid0IGNvdW50IC0tIG9uZSBub24tZGVmYXVsdCBzY2hlZHVsZSBwZXIgaXRlbS5cclxuICAgICAgICBsZXQgc2NoZWR1bGVzVG9WYWxpZGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXMuZmlsdGVyKHNjaGVkdWxlID0+IHNjaGVkdWxlLnZhbHVlICE9PSBjb25maWcuZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBhbGxvd2VkIGVtcHR5IG9yIDEgc2NoZWR1bGUgcGVyIGl0ZW1cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoIHx8IHNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoID09PSAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk51bGxFbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoIDw9IDEgJiYgc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCA9PT0gbnVsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgIT09IG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuT3ZlcmxhcDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZhbHVlc01hdGNoID0gY3VycmVudC52YWx1ZSA9PT0gbmV4dC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjb25maWcsIGN1cnJlbnQsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwLCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZCwgT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLlNjaGVkdWxlQ291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5leGFjdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUV4YWN0Q291bnQoc2NoZWR1bGVzLCBjb25maWcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlTWF4Q291bnQoc2NoZWR1bGVzLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRXhhY3RDb3VudChzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoID09PSBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZU1heENvdW50KHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmNvdW50O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2Vjb25kc0FzVGV4dEZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTZWNvbmRzQXNUZXh0JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGZhY3RvcnlGdW5jdGlvbiA9ICh0aW1lQ29uc3RhbnRzOiBUaW1lQ29uc3RhbnRzU2VydmljZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2Vjb25kczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fSE9VUik7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gU2Vjb25kc0FzVGV4dEZpbHRlci5hZGRIb3Vyc1RvUmVzdWx0KHJlc3VsdCwgaG91cnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlY29uZHMgLT0gaG91cnMgKiB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fSE9VUjtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9NSU5VVEUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFNlY29uZHNBc1RleHRGaWx0ZXIuYWRkTWludXRlc1RvUmVzdWx0KHJlc3VsdCwgbWludXRlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2Vjb25kcyAtPSBtaW51dGVzICogdGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX01JTlVURTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBTZWNvbmRzQXNUZXh0RmlsdGVyLmFkZFNlY29uZHNUb1Jlc3VsdChyZXN1bHQsIHNlY29uZHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmYWN0b3J5RnVuY3Rpb24uJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJUaW1lQ29uc3RhbnRzU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFjdG9yeUZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGFkZEhvdXJzVG9SZXN1bHQocmVzdWx0OiBzdHJpbmcsIGhvdXJzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoaG91cnMpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IGAke2hvdXJzfSBob3Vyc2A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGFkZE1pbnV0ZXNUb1Jlc3VsdChyZXN1bHQ6IHN0cmluZywgbWludXRlczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG1pbnV0ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAgYDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ICs9IGAke21pbnV0ZXN9IG1pbnV0ZSR7bWludXRlcyA+IDEgPyAncycgOiAnJ31gOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYWRkU2Vjb25kc1RvUmVzdWx0KHJlc3VsdDogc3RyaW5nLCBzZWNvbmRzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc2Vjb25kcykge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCBgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgKz0gYCR7c2Vjb25kc30gc2Vjb25kJHtzZWNvbmRzID4gMSA/ICdzJyA6ICcnfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihTZWNvbmRzQXNUZXh0RmlsdGVyLiRuYW1lLCBTZWNvbmRzQXNUZXh0RmlsdGVyLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZUNvbnN0YW50c1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVGltZUNvbnN0YW50c1NlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgU0VDT05EU19JTl9EQVkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuTUlOVVRFU19JTl9EQVkgKiB0aGlzLlNFQ09ORFNfSU5fTUlOVVRFOyBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IFNFQ09ORFNfSU5fSE9VUigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5TRUNPTkRTX0lOX01JTlVURSAqIHRoaXMuTUlOVVRFU19JTl9IT1VSO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgU0VDT05EU19JTl9NSU5VVEUoKSB7XHJcbiAgICAgICAgcmV0dXJuIDYwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgSE9VUlNfSU5fREFZKCkge1xyXG4gICAgICAgIHJldHVybiAyNDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IE1JTlVURVNfSU5fREFZKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLk1JTlVURVNfSU5fSE9VUiAqIHRoaXMuSE9VUlNfSU5fREFZO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgTUlOVVRFU19JTl9IT1VSKCkge1xyXG4gICAgICAgIHJldHVybiA2MDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFRpbWVDb25zdGFudHNTZXJ2aWNlLiRuYW1lLCBUaW1lQ29uc3RhbnRzU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBmYWN0b3J5RnVuY3Rpb24gPSAodGltZUNvbnN0YW50czogVGltZUNvbnN0YW50c1NlcnZpY2UpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlY29uZHM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fSE9VUik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBob3VycyA+IDExICYmIGhvdXJzIDwgMjQgPyAnUCcgOiAnQSc7XHJcblxyXG4gICAgICAgICAgICAgICAgc2Vjb25kcyAtPSBob3VycyAqIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9IT1VSO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gdGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX01JTlVURSk7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzIC09IG1pbnV0ZXMgKiB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fTUlOVVRFO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCByZW1haW5pbmdNaW51dGVzID0gbWludXRlcy50b1N0cmluZygpXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlY29uZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9JHttZXJpZGllbX1gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9OiR7c2Vjb25kc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmYWN0b3J5RnVuY3Rpb24uJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJUaW1lQ29uc3RhbnRzU2VydmljZSddXHJcblxyXG4gICAgICAgIHJldHVybiBmYWN0b3J5RnVuY3Rpb247XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgVGltZU9mRGF5RmlsdGVyLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2UnO1xyXG5cclxuICAgIGJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNjaGVkdWxlOiAnPCdcclxuICAgIH1cclxuXHJcbiAgICBjb250cm9sbGVyID0gVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0te3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5lbmQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgIXRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19IHVudGlsPC9zcGFuPlxyXG4gICAgYFxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3RpbWVSYW5nZUN0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlQ29udHJvbGxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTdGFydDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgaGFzRW5kOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIHRoaXMuaGFzU3RhcnQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICB0aGlzLmhhc0VuZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuZW5kKSAmJiB0aGlzLnNjaGVkdWxlLmVuZCAhPT0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoVGltZVJhbmdlQ29tcG9uZW50LiRuYW1lLCBuZXcgVGltZVJhbmdlQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lLCBUaW1lUmFuZ2VDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUb3VjaFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVG91Y2hTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0VG91Y2hlcyhldmVudDogYW55KTogYW55IHsgLy8gdG9kb1xyXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFldmVudC50b3VjaGVzKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnRvdWNoZXMgPSBbZXZlbnQub3JpZ2luYWxFdmVudF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFBhZ2VYKGV2ZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3VjaGVzID0gdGhpcy5nZXRUb3VjaGVzKGV2ZW50KTtcclxuXHJcbiAgICAgICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggJiYgdG91Y2hlc1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdG91Y2hlc1swXS5wYWdlWDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoVG91Y2hTZXJ2aWNlLiRuYW1lLCBUb3VjaFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIG5vcm1hbGl6ZVZhbHVlKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh2YWx1ZSA8IG1pbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlID4gbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLiRuYW1lLCBWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckdGltZW91dCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJBZGFwdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckxhc3RHaG9zdERheVNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWlzc2luZ0RheXNTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGFkYXB0ZXJTZXJ2aWNlOiBBZGFwdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblNlcnZpY2U6IENvbmZpZ3VyYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlOiBDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsYXN0R2hvc3REYXlTZXJ2aWNlOiBMYXN0R2hvc3REYXlTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtaXNzaW5nRGF5c1NlcnZpY2U6IE1pc3NpbmdEYXlzU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29yaWdpbmFsSXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcblxyXG4gIHB1YmxpYyBpbnZhbGlkTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gIHByaXZhdGUgZHJhZ1NjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG5cclxuICAvKiogdGhpcyBpcyByZXF1aXJlZCB0byBiZSBwYXJ0IG9mIGEgZm9ybSBmb3IgZGlydHkvdmFsaWQgY2hlY2tzICovXHJcbiAgcHVibGljIGZvcm1Db250cm9sbGVyOiBhbmd1bGFyLklGb3JtQ29udHJvbGxlcjtcclxuXHJcbiAgcHVibGljIGhvdmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHB1YmxpYyBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+O1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25TZXJ2aWNlLmdldENvbmZpZ3VyYXRpb24odGhpcy5vcHRpb25zKTtcclxuICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoQWRhcHRlcigpO1xyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuU0xPVF9EUkFHR0VELCAoZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgdGhpcy5kcmFnU2NoZWR1bGUgPSBzY2hlZHVsZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuRFJBR19FTkRFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWdTY2hlZHVsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBnaG9zdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB7XHJcbiAgICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNPTU1JVF9HSE9TVCwgZ2hvc3RTY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9MQVNUX0dIT1NULCAoKSA9PiB7XHJcbiAgICAgIGxldCBsYXN0R2hvc3REYXkgPSB0aGlzLmxhc3RHaG9zdERheVNlcnZpY2UuZ2V0TGFzdEdob3N0RGF5KHRoaXMuaXRlbXMpO1xyXG5cclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0dIT1NULCBsYXN0R2hvc3REYXkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DQU5DRUxfR0hPU1QsICgpID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0FMTF9HSE9TVFMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZE1lc3NhZ2UgPSB0aGlzLmdldEludmFsaWRNZXNzYWdlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRJbnZhbGlkTWVzc2FnZSgpIHtcclxuICAgIGxldCBjb25mbGljdGluZ09wdGlvbnMgPSB0aGlzLmNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuZ2V0Q29uZmxpY3RpbmdPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKGNvbmZsaWN0aW5nT3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gY29uZmxpY3RpbmdPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHJldHVybiAnT25lIG9yIG1vcmUgb2YgdGhlIHNjaGVkdWxlcyBpcyBpbnZhbGlkISBQbGVhc2UgY29udGFjdCBzZXJ2aWNlLic7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9ybUNvbnRyb2xsZXIuJGludmFsaWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5taXNzaW5nRGF5c1NlcnZpY2UuZmlsbEl0ZW1zKHRoaXMuY29uZmlnLCBpdGVtcyk7XHJcblxyXG4gICAgdGhpcy5pdGVtcyA9IHRoaXMucHVyZ2VJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICB0aGlzLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLm1lcmdlT3ZlcmxhcHMoKSk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IGl0ZW1zID0gdGhpcy5hZGFwdGVyU2VydmljZS5nZXRJdGVtc0Zyb21BZGFwdGVyKHRoaXMuY29uZmlnLCB0aGlzLmFkYXB0ZXIpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmJ1aWxkSXRlbXMoaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXJnZUl0ZW1zKGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICBpdGVtLnB1cmdlRGVmYXVsdFNjaGVkdWxlcygpO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgaXRlbS5mb3JjZU51bGxFbmRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcmVwYXJlSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGl0ZW0uZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRHaG9zdFZhbHVlcyhnaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfSkge1xyXG4gICAgdGhpcy5naG9zdFZhbHVlcyA9IGdob3N0VmFsdWVzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5mb3JtQ29udHJvbGxlci4kc2V0UHJpc3RpbmUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2F2ZSgpIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnByZXBhcmVJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2F2ZVNjaGVkdWxlcigpLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW1zID0gdGhpcy5wdXJnZUl0ZW1zKHRoaXMuaXRlbXMpO1xyXG4gICAgICB0aGlzLmZvcm1Db250cm9sbGVyLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgZm9ybUNvbnRyb2xsZXI6ICdmb3JtJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJztcclxuICAgIFxyXG4gICAgc3RhdGljIHZhbHVlID0ge1xyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5Nb25kYXldOiAnTW9uJyxcclxuICAgICAgICBbYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVHVlc2RheV06ICdUdWUnLFxyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXldOiAnV2VkJyxcclxuICAgICAgICBbYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVGh1cnNkYXldOiAnVGh1cicsXHJcbiAgICAgICAgW2JyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheV06ICdGcmknLFxyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TYXR1cmRheV06ICdTYXQnLFxyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXldOiAnU3VuJyBcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChEYXlNYXAuJG5hbWUsIERheU1hcC52YWx1ZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gNzIwMDsgXHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoTnVsbEVuZFdpZHRoLiRuYW1lLCBOdWxsRW5kV2lkdGgudmFsdWUpO1xyXG4iLCIvKiogUHJvdmlkZXMgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIGFuIGl0ZW0gLS0gcGFzcyBpdCBpbiBhbmQgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBhbGxvdyB5b3UgdG8gb3BlcmF0ZSBvbiBpdCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckl0ZW08VD4gaW1wbGVtZW50cyBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICRpc0dob3N0T3JpZ2luOiBib29sZWFuO1xyXG4gICAgJHJlbmRlckdob3N0OiBib29sZWFuO1xyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIGVkaXRhYmxlOiBib29sZWFuO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHNjaGVkdWxlczogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIGl0ZW06IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4sXHJcbiAgICAgICAgcHJpdmF0ZSBmaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2U6IEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHB1cmdlRGVmYXVsdFNlcnZpY2U6IFB1cmdlRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBpdGVtLmRheTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gYW5ndWxhci5pc0RlZmluZWQoaXRlbS5lZGl0YWJsZSkgPyBpdGVtLmVkaXRhYmxlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gaXRlbS5sYWJlbDtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzLm1hcChzY2hlZHVsZSA9PiByYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCBzY2hlZHVsZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHNjaGVkdWxlLmRheSA9IHRoaXMuZGF5O1xyXG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UodGhpcy5jb25maWcsIHNjaGVkdWxlKTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcy5wdXNoKHJhbmdlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJhbmdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZUFuZE1lcmdlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHJhbmdlID0gdGhpcy5hZGRTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgdGhpcy5tZXJnZVNjaGVkdWxlKHJhbmdlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJhbmdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYW5BZGRTY2hlZHVsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzTm9TY2hlZHVsZXMoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERldGVybWluZSBpZiB0aGUgY29uZGl0aW9ucyBhbGxvdyBmb3IgYSBwb3AtdXAgZWRpdG9yICovXHJcbiAgICBwdWJsaWMgY2FuRWRpdCgpIHtcclxuICAgICAgICBsZXQgaGFzRWRpdEZ1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuY29uZmlnLmVkaXRTbG90KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWRpdGFibGUgJiYgaGFzRWRpdEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZXRlcm1pbmUgaWYgYSBzY2hlZHVsZSBpcyBhYmxlIHRvIGJlIG1vZGlmaWVkICovXHJcbiAgICBwdWJsaWMgY2FuRWRpdFNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCBpdGVtSXNFZGl0YWJsZSA9IHRoaXMuZWRpdGFibGU7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlSXNFZGl0YWJsZSA9IHNjaGVkdWxlLmVkaXRhYmxlO1xyXG5cclxuICAgICAgICByZXR1cm4gaXRlbUlzRWRpdGFibGUgJiYgc2NoZWR1bGVJc0VkaXRhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmF0aGVyIHRoYW4gaGF2aW5nIHRvIGRlYWwgd2l0aCBtb2RpZnlpbmcgbWVyZ2VPdmVybGFwcyB0byBoYW5kbGUgbnVsbEVuZHMgY2FsZW5kYXJzLFxyXG4gICAgICoganVzdCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gY3JlYXRpbmcgYWRkaXRpb25hbCBzbG90cyBpbiBudWxsRW5kcyBjYWxlbmRhcnMgdW5sZXNzIHRoZXJlIGFyZSBubyBzbG90cyB0aGVyZSBhbHJlYWR5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2FuUmVuZGVyR2hvc3QoKSB7XHJcbiAgICAgICAgLy8gVGhpcyBvbmUgbmVlZHMgdG8gY29tZSBmaXJzdCwgb3RoZXJ3aXNlIHJlbmRlckdob3N0IGJlaW5nIHNldCB0byB0cnVlIHdvdWxkIG92ZXJyaWRlIHRoZSBwcm90ZWN0aW9uIGFnYWluc3QgYWRkdCdsIHNsb3RzIGluIG51bGxFbmQgY2FsZW5kYXJzXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRyZW5kZXJHaG9zdCAmJiB0aGlzLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy4kcmVuZGVyR2hvc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc1NjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSA+IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNOb1NjaGVkdWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBmaWxsRW1wdHlTbG90c1dpdGhEZWZhdWx0U2NoZWR1bGVzKCkge1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzID0gdGhpcy5maWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UuZmlsbCh0aGlzLCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZvcmNlTnVsbEVuZHMoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMuZm9yRWFjaChzID0+IHMuZW5kID0gbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1lcmdlT3ZlcmxhcHMoKSB7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlcy5mb3JFYWNoKHNjaGVkdWxlID0+IHRoaXMubWVyZ2VPdmVybGFwc0ZvclNjaGVkdWxlKHNjaGVkdWxlKSk7XHJcbiAgICAgICAgfSB3aGlsZSAodGhpcy5uZWVkc092ZXJsYXBzTWVyZ2VkKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZXJnZVNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgLy8gV2UgY29uc2lkZXIgdGhlIHNjaGVkdWxlIHdlIHdlcmUgd29ya2luZyB3aXRoIHRvIGJlIHRoZSBtb3N0IGltcG9ydGFudCwgc28gaGFuZGxlIGl0cyBvdmVybGFwcyBmaXJzdC5cclxuICAgICAgICB0aGlzLm1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHB1cmdlRGVmYXVsdFNjaGVkdWxlcygpIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IHRoaXMucHVyZ2VEZWZhdWx0U2VydmljZS5wdXJnZSh0aGlzLnNjaGVkdWxlcywgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcub25SZW1vdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPdmVybGFwIGhhbmRsZXJzXHJcblxyXG4gICAgcHJpdmF0ZSBnZXRPdmVybGFwSGFuZGxlcihvdmVybGFwU3RhdGU6IE92ZXJsYXBTdGF0ZSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXBIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHZvaWQ7IH0gPSB7XHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU5vT3ZlcmxhcChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQsIG90aGVyKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBvdmVybGFwSGFuZGxlcnNbb3ZlcmxhcFN0YXRlXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgLy8gUmVtb3ZlICdvdGhlcicgJiBtYWtlIGN1cnJlbnQgZXhwYW5kIHRvIGZpdCB0aGUgb3RoZXIgc2xvdFxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSnVzdCByZW1vdmUgJ2N1cnJlbnQnXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoY3VycmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmdcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBjdXJyZW50LmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3RoZXIudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnQudmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogY3VycmVudC5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG90aGVyLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50LmVuZCxcclxuICAgICAgICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRW5kIG92ZXJsYXAgaGFuZGxlcnNcclxuICAgIHByaXZhdGUgbWVyZ2VPdmVybGFwc0ZvclNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZWwuZXF1YWxzKHNjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjaGVkdWxlc0JvdGhFZGl0YWJsZSA9IGVsLmVkaXRhYmxlICYmIHNjaGVkdWxlLmVkaXRhYmxlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY2hlZHVsZXNCb3RoRWRpdGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUodGhpcy5jb25maWcsIHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBIYW5kbGVyID0gdGhpcy5nZXRPdmVybGFwSGFuZGxlcihvdmVybGFwU3RhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdmVybGFwSGFuZGxlcihzY2hlZHVsZSwgZWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBuZWVkc092ZXJsYXBzTWVyZ2VkKCkge1xyXG4gICAgICAgIGxldCBsZW4gPSB0aGlzLnNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5zY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5zY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNjaGVkdWxlc0JvdGhFZGl0YWJsZSA9IGN1cnJlbnQuZWRpdGFibGUgJiYgbmV4dC5lZGl0YWJsZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2NoZWR1bGVzQm90aEVkaXRhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG5leHQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUodGhpcy5jb25maWcsIGN1cnJlbnQsIG5leHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXS5pbmRleE9mKG92ZXJsYXBTdGF0ZSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5IHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5JztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclB1cmdlRGVmYXVsdFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGRheU1hcDogRGF5TWFwLFxyXG4gICAgICAgIHByaXZhdGUgZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlOiBGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBwdXJnZURlZmF1bHRTZXJ2aWNlOiBQdXJnZURlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVJdGVtKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBkYXk6IG51bWJlciwgc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgICAgICAgbGV0IGJ1aWxkZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gY29uZmlnLmNyZWF0ZUl0ZW0oZGF5LCBzY2hlZHVsZXMpO1xyXG4gICAgXHJcbiAgICAgICAgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQoYnVpbGRlciwgeyBsYWJlbDogdGhpcy5kYXlNYXBbZGF5XSB9KTtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVySXRlbShjb25maWcsIHJlc3VsdCwgdGhpcy5maWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UsIHRoaXMub3ZlcmxhcFNlcnZpY2UsIHRoaXMucHVyZ2VEZWZhdWx0U2VydmljZSwgdGhpcy5yYW5nZUZhY3RvcnkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnkuJG5hbWUsIFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5KTtcclxuXHJcbiIsIi8qKiBQcm92aWRlcyBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgYSBzY2hlZHVsZSAtLSBwYXNzIGl0IGluIGFuZCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGFsbG93IHlvdSB0byBvcGVyYXRlIG9uIGl0ICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4gaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgICRjbGFzczogc3RyaW5nO1xyXG4gICAgJGlzQWN0aXZlOiBib29sZWFuO1xyXG4gICAgJGlzRGVsZXRpbmc6IGJvb2xlYW47XHJcbiAgICAkaXNFZGl0aW5nOiBib29sZWFuO1xyXG5cclxuICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcbiAgICBzdGFydDogbnVtYmVyO1xyXG4gICAgZW5kOiBudW1iZXI7XHJcbiAgICB2YWx1ZTogVDtcclxuXHJcbiAgICBlZGl0YWJsZTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxUPixcclxuICAgICAgICBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPixcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLiRjbGFzcyA9IHNjaGVkdWxlLiRjbGFzcztcclxuICAgICAgICB0aGlzLiRpc0FjdGl2ZSA9IHNjaGVkdWxlLiRpc0FjdGl2ZTtcclxuICAgICAgICB0aGlzLiRpc0RlbGV0aW5nID0gc2NoZWR1bGUuJGlzRGVsZXRpbmc7XHJcbiAgICAgICAgdGhpcy4kaXNFZGl0aW5nID0gc2NoZWR1bGUuJGlzRWRpdGluZztcclxuICAgICAgICB0aGlzLmRheSA9IHNjaGVkdWxlLmRheTtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gc2NoZWR1bGUuc3RhcnQ7XHJcbiAgICAgICAgdGhpcy5lbmQgPSBzY2hlZHVsZS5lbmQ7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHNjaGVkdWxlLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBhbmd1bGFyLmlzRGVmaW5lZChzY2hlZHVsZS5lZGl0YWJsZSkgPyBzY2hlZHVsZS5lZGl0YWJsZSA6IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGR1cmF0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5lcXVhbHModGhpcywgb3RoZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNTYW1lVmFsdWVBcyhvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZSh1cGRhdGVkU2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgdXBkYXRlZFN0YXJ0ID0gdGhpcy51cGRhdGVTdGFydCh1cGRhdGVkU2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIGxldCB1cGRhdGVkRW5kID0gdGhpcy51cGRhdGVFbmQodXBkYXRlZFNjaGVkdWxlLmVuZCk7XHJcblxyXG4gICAgICAgIGlmICh1cGRhdGVkU3RhcnQgfHwgdXBkYXRlZEVuZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRW5kKHVwZGF0ZWRFbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKHRoaXMuY29uZmlnLCB1cGRhdGVkRW5kKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuVXBkYXRlU3RhcnQodXBkYXRlZFN0YXJ0KSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gdXBkYXRlZFN0YXJ0O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNhblVwZGF0ZUVuZCh1cGRhdGVkRW5kOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuZW5kICE9PSB1cGRhdGVkRW5kO1xyXG4gICAgICAgIGxldCBuZXdFbmRCZWZvcmVPckF0TWF4ID0gdXBkYXRlZEVuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICBsZXQgbmV3RW5kQWZ0ZXJPckF0RXhpc3RpbmdTdGFydCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIHVwZGF0ZWRFbmQpID49IHRoaXMuc3RhcnQgKyAxO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlZCAmJiBuZXdFbmRCZWZvcmVPckF0TWF4ICYmIG5ld0VuZEFmdGVyT3JBdEV4aXN0aW5nU3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW5VcGRhdGVTdGFydCh1cGRhdGVkU3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5zdGFydCAhPT0gdXBkYXRlZFN0YXJ0O1xyXG4gICAgICAgIGxldCBuZXdTdGFydEJlZm9yZU9yQXRFeGlzdGluZ0VuZCA9IHVwZGF0ZWRTdGFydCA8PSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCB0aGlzLmVuZCkgLSAxO1xyXG4gICAgICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdE1pbiA9IHVwZGF0ZWRTdGFydCA+PSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlZCAmJiAodGhpcy5jb25maWcubnVsbEVuZHMgfHwgbmV3U3RhcnRCZWZvcmVPckF0RXhpc3RpbmdFbmQpICYmIG5ld1N0YXJ0QWZ0ZXJPckF0TWluO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5IHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVSYW5nZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Piwgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVyUmFuZ2UoY29uZmlnLCBzY2hlZHVsZSwgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcm9vdFNjb3BlJyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwcml2YXRlIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwcml2YXRlIGdldERlbHRhOiAob3B0aW9uczogeyBwaXhlbDogbnVtYmVyIH0pID0+IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcbiAgcHJpdmF0ZSBkcmFnU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIGRyYWdTZXJ2aWNlOiBEcmFnU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIGdldCBoYXNEcmFnU2NoZWR1bGUoKSB7XHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQodGhpcy5kcmFnU2NoZWR1bGUpICYmIHRoaXMuZHJhZ1NjaGVkdWxlICE9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERyYWdTdGFydFZhbHVlcygpIHtcclxuICAgIHJldHVybiB0aGlzLmRyYWdTZXJ2aWNlLmdldERyYWdSYW5nZUZyb21TY2hlZHVsZSh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmR1cmF0aW9uKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLnVwZGF0ZSh7XHJcbiAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZERyYWcoKSB7XHJcbiAgICAvLyBJZiB0aGUgc2NoZWR1bGUgd2FzIG1vdmVkIHRvIGFub3RoZXIgaXRlbSwgdGhlICRzY29wZSBoaWVyYXJjaHkgd2lsbCBoYXZlIGJlZW4gYnJva2VuLCBzbyB3ZSBuZWVkIHRvIGJyb2FkY2FzdCB0aGlzIHRvIHRoZSB3aG9sZSBhcHBcclxuICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5EUkFHX0VOREVEKTtcclxuICAgIFxyXG4gICAgLy8gV2FzIHRoZSBzY2hlZHVsZSBtb3ZlZCB0byBhbm90aGVyIGl0ZW0/P1xyXG4gICAgaWYgKCF0aGlzLml0ZW0uaGFzU2NoZWR1bGUodGhpcy5zY2hlZHVsZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpZCB0aGUgdXNlciBhY3R1YWxseSBtb3ZlIG9yIHJlc2l6ZSB0aGUgc2xvdD8/XHJcbiAgICB2YXIgY2hhbmdlZDogYm9vbGVhbiA9ICF0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVxdWFscyh0aGlzLmdldERyYWdTdGFydFZhbHVlcygpKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZFJlc2l6ZSgpIHtcclxuICAgIC8vIERpZCB0aGUgdXNlciBhY3R1YWxseSBtb3ZlIG9yIHJlc2l6ZSB0aGUgc2xvdD8/XHJcbiAgICB2YXIgY2hhbmdlZDogYm9vbGVhbiA9ICF0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVxdWFscyh0aGlzLmdldERyYWdTdGFydFZhbHVlcygpKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIHRoaXMuaXRlbS5tZXJnZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVN0YXJ0KHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NoZWR1bGUudXBkYXRlU3RhcnQobmV3U3RhcnQpKSB7XHJcbiAgICAgIHRoaXMuY29uZmlnLm9uQ2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMuZ2V0RGVsdGEoeyBwaXhlbDogcGl4ZWwgfSk7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICBpZiAodGhpcy5zY2hlZHVsZS51cGRhdGVFbmQobmV3RW5kKSkge1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgIGlmICghdGhpcy5pdGVtLmNhbkVkaXRTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKSl7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuU0xPVF9EUkFHR0VELCB0aGlzLnNjaGVkdWxlKTtcclxuICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplKCkge1xyXG4gICAgaWYgKCF0aGlzLml0ZW0uY2FuRWRpdFNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgZHJhZ1NjaGVkdWxlOiAnPCcsXHJcbiAgICBpdGVtOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGVkaXRTY2hlZHVsZTogJyYnLFxyXG4gICAgZ2V0RGVsdGE6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudDogYW55KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRab29tRWxlbWVudChjb250YWluZXI6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBjb250YWluZXIucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFpvb21XaWR0aChlbGVtZW50OiBhbnksIHdpZHRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgIHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGggPSB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICcxMDAlJyk7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgem9vbUluKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIC8vIGdldCBjdXJyZW50IHpvb20gbGV2ZWwgZnJvbSB6b29tZWQgZWxlbWVudCBhcyBhIHBlcmNlbnRhZ2VcclxuICAgICAgICBsZXQgem9vbSA9IHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gcGFyc2UgdG8gaW50ZWdlciAmIGRvdWJsZVxyXG4gICAgICAgIGxldCBsZXZlbCA9IHBhcnNlSW50KHpvb20sIDEwKSAqIDI7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgYmFjayB0byBwZXJjZW50YWdlXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgbGV2ZWwgKyAnJScpO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUluQUNlbGwoZWxlbWVudDogYW55LCBldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgZWxlbWVudENvdW50ID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gICAgICAgIGxldCBpID0gZGF0YS5pZHg7XHJcblxyXG4gICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvRGlzcGxheSA9IDU7XHJcbiAgICAgICAgbGV0IGJveFdpZHRoID0gY29udGFpbmVyV2lkdGggLyBib3hlc1RvRGlzcGxheTtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9Ta2lwID0gMjtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoICogYm94ZXNUb1NraXA7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJScpO1xyXG5cclxuICAgICAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tQnlTY3JvbGwoZWxlbWVudDogYW55LCBldmVudDogV2hlZWxFdmVudCwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSB0aGlzLmdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFpvb21TZXJ2aWNlLiRuYW1lLCBab29tU2VydmljZSk7XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBsZW1lbnQgdGhpcyBvbiBhIGNsaWVudCBhbmQgdGhlbiBwYXNzIGl0IGluIHRvIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8VEN1c3RvbSwgVFZhbHVlPiB7XHJcbiAgICAgICAgY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGN1c3RvbTogVEN1c3RvbSk6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VFZhbHVlPjtcclxuXHJcbiAgICAgICAgLyoqIFRyYW5zZm9ybSB0aGUgZGF0YSBoZWxkIHdpdGhpbiB0aGUgY29tcG9uZW50IHRvIHRoZSBmb3JtYXQgeW91IG5lZWQgaXQgb3V0c2lkZSBvZiB0aGUgY29tcG9uZW50LiAqL1xyXG4gICAgICAgIGdldFNuYXBzaG90KCk6IFRDdXN0b21bXTtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMganVzdCBuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBjbGFzcywgd2UnbGwgc2V0IGl0IGludGVybmFsbHkgKi9cclxuICAgICAgICBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08VFZhbHVlPltdO1xyXG5cclxuICAgICAgICBpbml0aWFsRGF0YTogVEN1c3RvbVtdO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuZGVjbGFyZSBjb25zdCBlbnVtIERyYWdNb2RlIHtcclxuICAgIE1PVkUsXHJcbiAgICBDT1BZXHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEludmFsaWRNZXNzYWdlcyB7XHJcbiAgICAgICAgZnVsbENhbGVuZGFyRmlsbEVtcHR5V2l0aERlZmF1bHQ6IHN0cmluZztcclxuICAgICAgICBmaWxsRW1wdHlXaXRoZGVmYXVsdERlZmF1bHRWYWx1ZTogc3RyaW5nO1xyXG4gICAgICAgIGdlbmVyaWM6IHN0cmluZztcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUG9pbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlIHtcclxuICAgIGluaXRpYWxpemUoKTogdm9pZDtcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZVNlcnZpY2VQcm92aWRlciBleHRlbmRzIGFuZ3VsYXIuSVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICAgICAgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgLyoqIERlZmF1bHRzIHdpbGwgYmUgcHJvdmlkZWQsIGJ1dCB5b3UgY2FuIG92ZXJyaWRlIHRoZXNlIG9uIGEgcGVyLWNhbGVuZGFyIGJhc2lzIGlmIG5lY2Vzc2FyeSAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyB7XHJcbiAgICAgICAgZnVsbENhbGVuZGFyOiBzdHJpbmc7XHJcbiAgICAgICAgbWF4VGltZVNsb3Q6ICh2YWx1ZTogc3RyaW5nKSA9PiBzdHJpbmc7XHJcbiAgICAgICAgbWluaW11bVNlcGFyYXRpb246ICh2YWx1ZTogc3RyaW5nKSA9PiBzdHJpbmc7XHJcbiAgICAgICAgbW9ub1NjaGVkdWxlOiBzdHJpbmc7XHJcbiAgICAgICAgbnVsbEVuZHM6IHN0cmluZztcclxuICAgICAgICBzY2hlZHVsZUNvdW50OiAob3B0aW9uczogU2NoZWR1bGVDb3VudE9wdGlvbnMpID0+IHN0cmluZztcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKiBEZWZhdWx0cyB3aWxsIGJlIHByb3ZpZGVkLCBidXQgeW91IGNhbiBvdmVycmlkZSB0aGVzZSBvbiBhIHBlci1jYWxlbmRhciBiYXNpcyBpZiBuZWNlc3NhcnkgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2NoZWR1bGVDb3VudE9wdGlvbnMge1xyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNjaGVkdWxlcyBhbGxvd2VkIG9uIGVhY2ggaXRlbS4gTnVsbCBmb3Igbm8gbWF4ICovXHJcbiAgICAgICAgY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIFdoZXRoZXIgeW91IG11c3QgaGF2ZSBleGFjdGx5IHRoYXQgbWFueSBzY2hlZHVsZXMsIG9yIGlmIFwidXAgdG9cIiBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgZXhhY3Q6IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBEYXlzIHtcclxuICAgICAgICBNb25kYXkgPSAwLFxyXG4gICAgICAgIFR1ZXNkYXkgPSAxLFxyXG4gICAgICAgIFdlZG5lc2RheSxcclxuICAgICAgICBUaHVyc2RheSxcclxuICAgICAgICBGcmlkYXksXHJcbiAgICAgICAgU2F0dXJkYXksXHJcbiAgICAgICAgU3VuZGF5XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2UgZXh0ZW5kcyBhbmd1bGFyLklGaWx0ZXJTZXJ2aWNlIHtcclxuICAgIChuYW1lOiAnYnJXZWVrbHlTY2hlZHVsZXJTZWNvbmRzQXNUZXh0Jyk6IChtaW51dGVzOiBudW1iZXIpID0+IHN0cmluZ1xyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxUPiB7XHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSBzY2hlZHVsZXMgd2lsbCBiZSBhbGxvd2VkICYgcmVxdWlyZWQgdG8gaGF2ZSBubyBzZXQgZW5kIHRpbWUgKi9cclxuICAgICAgICBudWxsRW5kcz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBUaGVzZSBjbGFzc2VzIHdpbGwgYmUgYXBwbGllZCBkaXJlY3RseSB0byB0aGUgYnV0dG9ucyAqL1xyXG4gICAgICAgIGJ1dHRvbkNsYXNzZXM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gcmV0dXJuIGFuIGl0ZW0gLS0gdGhpcyBpcyBSRVFVSVJFRCBzbyB0aGF0IGFkYXB0ZXJzIHdpbGwgYWx3YXlzIGJlIHVzZWQgZm9yIG5ldyBpdGVtcywgZXZlbiBpZiB0aGV5IHdlcmVuJ3QgcGFzc2VkIGluICovXHJcbiAgICAgICAgY3JlYXRlSXRlbTogKGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W10pID0+IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxUPjtcclxuXHJcbiAgICAgICAgLyoqIGRlZmF1bHRWYWx1ZSBzaG91bGQgYmUgYXNzaWduZWQgcGVyIHNldCBvZiBvcHRpb25zLCBub3QgcGVyIGl0ZW0uIERvIG5vdCBhc3NpZ24gZm9yIG5vIGRlZmF1bHQgKi9cclxuICAgICAgICBkZWZhdWx0VmFsdWU/OiBUO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYW4gaXRlbSBpcyBjbGlja2VkIGluIG9yZGVyIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgaXQgKi9cclxuICAgICAgICBlZGl0U2xvdD86IChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSA9PiBhbmd1bGFyLklQcm9taXNlPElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPj47XHJcblxyXG4gICAgICAgIC8qKiBXaGV0aGVyIHRvIGZpbGwgZW1wdHkgc3BhY2VzIHdpdGggdGhlIGRlZmF1bHQgdmFsdWUgKi9cclxuICAgICAgICBmaWxsRW1wdHlXaXRoRGVmYXVsdD86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgbnVsbC1lbmRlZCB0aW1lIHNsb3Qgd2lsbCBiZSBhc3NpZ25lZCBpdHMgc3RhcnQgKyB0aGlzIHZhbHVlIHdoZW4gaXQgaXMgc2F2ZWQgKi9cclxuICAgICAgICBmaWxsTnVsbEVuZHM/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIEFMTCBzbG90cyBpbiB0aGUgY2FsZW5kYXIgbXVzdCBiZSBmaWxsZWQgaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkICovXHJcbiAgICAgICAgZnVsbENhbGVuZGFyPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgZGVmaW5lZCwgYSB0aW1lIHNsb3Qgd2lsbCBub3QgYmUgYWJsZSB0byBiZSBtb3JlIHRoYW4gdGhpcyBtYW55IG1pbnV0ZXMgbG9uZyAqL1xyXG4gICAgICAgIG1heFRpbWVTbG90PzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBzbG90cyBtdXN0IGJlIGF0IGxlYXN0IHRoaXMgbWFueSBtaW51dGVzIGFwYXJ0ICovXHJcbiAgICAgICAgbWluaW11bVNlcGFyYXRpb24/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICAvKiogVGhpcyBmdW5jdGlvbiBhbGxvd3MgYWNjZXNzIGJhY2sgdG8gdGhlIGNsaWVudCBzY29wZSB3aGVuIHRoZSBzY2hlZHVsZXIgY2hhbmdlcy4gKi9cclxuICAgICAgICBvbkNoYW5nZT86ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIGFjY2VzcyBiYWNrIHRvIHRoZSBjbGllbnQgc2NvcGUgd2hlbiBhIHNjaGVkdWxlciBpcyByZW1vdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uUmVtb3ZlPzogKCkgPT4gdm9pZDtcclxuXHJcbiAgICAgICAgLyoqIFRoZSBudW1iZXIgb2Ygc2Vjb25kcyBlYWNoIGRpdmlzaW9uIG9mIHRoZSBjYWxlbmRhciBzaG91bGQgYmUgLS0gdmFsdWVzIHdpbGwgc25hcCB0byB0aGlzICovXHJcbiAgICAgICAgaW50ZXJ2YWw/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBPdmVycmlkZXMgZm9yIHJlc3RyaWN0aW9uIGV4cGxhbmF0aW9ucywgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM/OiBSZXN0cmljdGlvbkV4cGxhbmF0aW9ucztcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBzYXZlIGJ1dHRvbiBpcyBjbGlja2VkLiBJZiB0aGlzIGlzIG5vdCBwYXNzZWQsIG5vIHNhdmUgYnV0dG9uIHdpbGwgYmUgcHJlc2VudC4gKi9cclxuICAgICAgICBzYXZlU2NoZWR1bGVyPzogKCkgPT4gYW5ndWxhci5JUHJvbWlzZTxhbnk+O1xyXG5cclxuICAgICAgICAvKiogT3ZlcnJpZGVzIGZvciBzY2hlZHVsZSBjb3VudCBvcHRpb25zLCBpZiBuZWNlc3NhcnkgKi9cclxuICAgICAgICBzY2hlZHVsZUNvdW50T3B0aW9ucz86IFNjaGVkdWxlQ291bnRPcHRpb25zO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBVc2UgdGhpcyBmb3IgcHJvcGVydGllcyB5b3UgbmVlZCBhY2Nlc3MgdG8gYnV0IGRvbid0IHdhbnQgZXhwb3NlZCB0byBjbGllbnRzICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4gZXh0ZW5kcyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcbiAgICAgICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAgICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAgICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIE5vdCBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IG1ha2VzIHRoaW5ncyBhIHdob29vbGUgbG90IGVhc2llciAqL1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHZhbHVlOiBUO1xyXG5cclxuICAgICAgICBlZGl0YWJsZT86IGJvb2xlYW47XHJcbiAgICB9XHJcbn1cclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><br-weekly-scheduler adapter="adapter" ng-form="test" options="model.options"></br-weekly-scheduler><code>Valid: {{ test.$valid }}</code><hr><code>Result:<pre ng-bind="result | json" style="overflow-y:auto"></pre></code><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown()" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove()"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.item.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.item.$renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" get-delta="multiSliderCtrl.pixelToVal(pixel)" drag-schedule="multiSliderCtrl.dragSchedule" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: !multiSliderCtrl.item.canEditSchedule(schedule),\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.invalidMessage"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" br-full-calendar="{{ schedulerCtrl.config.fullCalendar }}" br-max-time-slot="{{ schedulerCtrl.config.maxTimeSlot }}" br-minimum-separation="{{ schedulerCtrl.config.minimumSeparation }}" br-mono-schedule="{{ schedulerCtrl.config.monoSchedule }}" br-null-end="{{ schedulerCtrl.config.nullEnds }}" br-schedule-count="{{ schedulerCtrl.config.scheduleCountOptions && schedulerCtrl.config.scheduleCountOptions.count }}" br-overlap br-revalidate drag-schedule="schedulerCtrl.dragSchedule" ghost-values="schedulerCtrl.ghostValues" ng-model="item" ng-model-options="{allowInvalid: true}" set-ghost-values="schedulerCtrl.setGhostValues(ghostValues)"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.invalidMessage">{{ schedulerCtrl.invalidMessage }}</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resizeStart(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle immediate="weeklySlotCtrl.hasDragSchedule"><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resizeEnd(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);