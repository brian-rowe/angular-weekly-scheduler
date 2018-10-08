angular.module('demoApp', ['br.weeklyScheduler'])
    .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {
        $scope.model = {
            options: {
                buttonClasses: ['wow!'],
                createItem: function (day, schedules) {
                    return new DemoItem(day, schedules);
                },
                defaultValue: false,
                editSlot: function (schedule) {
                    schedule.value = true;
                    return $q.when(schedule);
                },
                interval: 1,
                minimumSeparation: 5,
                onChange: function (isValid) {
                },
                restrictionExplanations: {
                    maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                },
                scheduleCountOptions: {
                    count: 2,
                    exact: true
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
                value: true,
                editable: false
            },
            {
                day: 6 /* Sunday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 0 /* Monday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 0 /* Monday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 3 /* Thursday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 3 /* Thursday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 900,
                end: 1200,
                value: true
            },
            {
                day: 5 /* Saturday */,
                start: 0,
                end: 720,
                value: true
            },
            {
                day: 5 /* Saturday */,
                start: 900,
                end: 1200,
                value: true
            }
        ]);
        $scope.saveAll = function () {
            $scope.result = JSON.stringify($scope.adapter.getSnapshot()) + JSON.stringify($scope.adapterTwo.getSnapshot());
        };
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
        if (config.minimumSeparation) {
            var minimumSeparation = this.$filter('brWeeklySchedulerMinutesAsText')(config.minimumSeparation);
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
        this.editable = angular.isDefined(item.editable) ? item.editable : true;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvQWRhcHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9jb25maWd1cmF0aW9uL0NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvY29uZmxpY3Rpbmctb3B0aW9ucy9Db25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy9EcmFnU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L0VsZW1lbnRPZmZzZXRTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZW5kLWFkanVzdGVyL0VuZEFkanVzdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ZpbGwtZW1wdHktd2l0aC1kZWZhdWx0L0ZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2Z1bGwtY2FsZW5kYXIvRnVsbENhbGVuZGFyRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ2hvc3Qtc2xvdC9naG9zdC1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ3JvdXAtYnkvR3JvdXBTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL0hhbmRsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL0hvdXJseUdyaWREaXJlY3RpdmUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sYXN0LWdob3N0LWRheS9MYXN0R2hvc3REYXlTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbWF4LXRpbWUtc2xvdC9NYXhUaW1lU2xvdERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pbmltdW0tc2VwYXJhdGlvbi9NaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pc3NpbmctZGF5cy9NaXNzaW5nRGF5c1NlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tb25vLXNjaGVkdWxlL01vbm9TY2hlZHVsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vdXNlLXRyYWNrZXIvTW91c2VUcmFja2VyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbnVsbC1lbmQvTnVsbEVuZERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9wdXJnZS1kZWZhdWx0L1B1cmdlRGVmYXVsdFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3JldmFsaWRhdGUvUmV2YWxpZGF0ZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtY291bnQvU2NoZWR1bGVDb3VudERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9GdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL01heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9NaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9OdWxsRW5kVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9PdmVybGFwVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9TY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9TY3JvbGxTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9NaW51dGVzQXNUZXh0RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9UaW1lT2ZEYXlGaWx0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lLXJhbmdlL1RpbWVSYW5nZUNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RvdWNoL1RvdWNoU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3ZhbHVlLW5vcm1hbGl6YXRpb24vVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL051bGxFbmRXaWR0aC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9XZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL1dlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1yYW5nZS9XZWVrbHlTY2hlZHVsZXJSYW5nZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItcmFuZ2UvV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL1pvb21TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvYWRhcHRlci9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2RyYWctbW9kZS9EcmFnTW9kZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ludmFsaWQtbWVzc2FnZS9JbnZhbGlkTWVzc2FnZXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9wb2ludC9JUG9pbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2VQcm92aWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLWNvdW50L1NjaGVkdWxlQ291bnRPcHRpb25zLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5cy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9JV2Vla2x5U2NoZWR1bGVySXRlbS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItcmFuZ2UvSVdlZWtseVNjaGVkdWxlclJhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUM5QyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNO0lBQy9ELFVBQVUsRUFBcUIsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFckQsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxZQUFZLEVBQUUsS0FBSztnQkFDbkIsUUFBUSxFQUFFLFVBQVUsUUFBUTtvQkFDMUIsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxRQUFRLEVBQUUsQ0FBQztnQkFDWCxpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixRQUFRLEVBQUUsVUFBQyxPQUFPO2dCQUNsQixDQUFDO2dCQUNELHVCQUF1QixFQUFFO29CQUN2QixXQUFXLEVBQUUsVUFBQyxLQUFLLElBQUssT0FBQSxpQ0FBK0IsS0FBSyxNQUFHLEVBQXZDLENBQXVDO2lCQUNoRTtnQkFDRCxvQkFBb0IsRUFBRTtvQkFDcEIsS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxFQUFFLElBQUk7aUJBQ1o7YUFDaUQ7U0FDckQsQ0FBQTtRQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUV4QyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUc7WUFDcEMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUQsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFBO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVyQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDO1lBQy9CLElBQUk7WUFDSix3QkFBd0I7WUFDeEIsaUJBQWlCO1lBQ2pCLGVBQWU7WUFDZixnQkFBZ0I7WUFDaEIsS0FBSztZQUNMO2dCQUNFLEdBQUcsZ0JBQWdDO2dCQUNuQyxLQUFLLEVBQUUsR0FBRztnQkFDVixHQUFHLEVBQUUsSUFBSTtnQkFDVCxLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxnQkFBZ0M7Z0JBQ25DLEtBQUssRUFBRSxHQUFHO2dCQUNWLEdBQUcsRUFBRSxJQUFJO2dCQUNULEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRDtnQkFDRSxHQUFHLGlCQUFpQztnQkFDcEMsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNEO2dCQUNFLEdBQUcsbUJBQW1DO2dCQUN0QyxLQUFLLEVBQUUsRUFBRTtnQkFDVCxHQUFHLEVBQUUsSUFBSTtnQkFDVCxLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxnQkFBZ0M7Z0JBQ25DLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxJQUFJO2dCQUNULEtBQUssRUFBRSxJQUFJO2FBQ1o7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksV0FBVyxDQUFDO1lBQ2xDO2dCQUNFLEdBQUcsZ0JBQWdDO2dCQUNuQyxLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsSUFBSTtnQkFDWCxRQUFRLEVBQUUsS0FBSzthQUNoQjtZQUNEO2dCQUNFLEdBQUcsZ0JBQWdDO2dCQUNuQyxLQUFLLEVBQUUsR0FBRztnQkFDVixHQUFHLEVBQUUsSUFBSTtnQkFDVCxLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxnQkFBZ0M7Z0JBQ25DLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRDtnQkFDRSxHQUFHLGdCQUFnQztnQkFDbkMsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNEO2dCQUNFLEdBQUcsaUJBQWlDO2dCQUNwQyxLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxpQkFBaUM7Z0JBQ3BDLEtBQUssRUFBRSxHQUFHO2dCQUNWLEdBQUcsRUFBRSxJQUFJO2dCQUNULEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRDtnQkFDRSxHQUFHLG1CQUFtQztnQkFDdEMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNEO2dCQUNFLEdBQUcsbUJBQW1DO2dCQUN0QyxLQUFLLEVBQUUsR0FBRztnQkFDVixHQUFHLEVBQUUsSUFBSTtnQkFDVCxLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxrQkFBa0M7Z0JBQ3JDLEtBQUssRUFBRSxDQUFDO2dCQUNSLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRDtnQkFDRSxHQUFHLGtCQUFrQztnQkFDckMsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNEO2dCQUNFLEdBQUcsZ0JBQWdDO2dCQUNuQyxLQUFLLEVBQUUsQ0FBQztnQkFDUixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0Q7Z0JBQ0UsR0FBRyxnQkFBZ0M7Z0JBQ25DLEtBQUssRUFBRSxHQUFHO2dCQUNWLEdBQUcsRUFBRSxJQUFJO2dCQUNULEtBQUssRUFBRSxJQUFJO2FBQ1o7WUFDRDtnQkFDRSxHQUFHLGtCQUFrQztnQkFDckMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNEO2dCQUNFLEdBQUcsa0JBQWtDO2dCQUNyQyxLQUFLLEVBQUUsR0FBRztnQkFDVixHQUFHLEVBQUUsSUFBSTtnQkFDVCxLQUFLLEVBQUUsSUFBSTthQUNaO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRztZQUNmLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDakgsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVSLGdCQUFnQjtBQUNoQjtJQUNFLGtCQUNTLEdBQTRCLEVBQzVCLFNBQThEO1FBRDlELFFBQUcsR0FBSCxHQUFHLENBQXlCO1FBQzVCLGNBQVMsR0FBVCxTQUFTLENBQXFEO0lBRXZFLENBQUM7SUFFRCxzQkFBSSw4QkFBUTthQUFaO1lBQ0UsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDOzs7T0FBQTtJQUNILGVBQUM7QUFBRCxDQVZBLEFBVUMsSUFBQTtBQUVELHVGQUF1RjtBQUN2RixnQkFBZ0I7QUFDaEI7SUFHRSxxQkFDUyxXQUFnRTtRQUFoRSxnQkFBVyxHQUFYLFdBQVcsQ0FBcUQ7UUFIbEUsVUFBSyxHQUFlLEVBQUUsQ0FBQztJQUs5QixDQUFDO0lBRU0saUNBQVcsR0FBbEI7UUFDRSxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1lBQ3pELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRO2dCQUNoQyxPQUFPO29CQUNMLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztvQkFDakIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO29CQUNyQixHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUc7b0JBQ2pCLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztpQkFDdEIsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFTSx1REFBaUMsR0FBeEMsVUFBeUMsS0FBSztRQUM1QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDSCxrQkFBQztBQUFELENBeEJBLEFBd0JDLElBQUE7QUNwTkQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztBQ0FyRSxnQkFBZ0I7QUFDaEI7SUFRSSx3QkFDWSxZQUEwQixFQUMxQixXQUF1QztRQUR2QyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixnQkFBVyxHQUFYLFdBQVcsQ0FBNEI7SUFFbkQsQ0FBQztJQUVELDRDQUFtQixHQUFuQixVQUFvQixNQUFtQyxFQUFFLE9BQTZEO1FBQ2xILElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVoQixJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7WUFDakcsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVuRSxLQUFLLElBQUksR0FBRyxJQUFJLGdCQUFnQixFQUFFO2dCQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUV6RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBNUJNLG9CQUFLLEdBQUcsaUNBQWlDLENBQUM7SUFFMUMsc0JBQU8sR0FBRztRQUNiLCtCQUErQjtRQUMvQiw4QkFBOEI7S0FDakMsQ0FBQztJQXdCTixxQkFBQztDQTlCRCxBQThCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztBQ25DbkQsZ0JBQWdCO0FBQ2hCO0lBQUE7SUFtREEsQ0FBQztJQWhEVSwrQ0FBZ0IsR0FBdkIsVUFBd0IsT0FBd0Q7UUFDNUUsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxVQUFVO1FBQ2pELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFlBQVksR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ25DLElBQUksYUFBYSxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUM7UUFFNUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFaEQsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFekQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDckMsUUFBUSxFQUFFLFFBQVE7WUFDbEIsUUFBUSxFQUFFLFlBQVk7WUFDdEIsU0FBUyxFQUFFLFVBQVU7WUFDckIsYUFBYSxFQUFFLGFBQWE7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGdEQUFpQixHQUF6QjtRQUNJLE9BQU87WUFDSCxVQUFVLEVBQUUsVUFBQyxHQUFHLEVBQUUsU0FBUyxJQUFPLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQSxDQUFDLENBQUM7WUFDN0UsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQWQsQ0FBYztZQUM5QixRQUFRLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBZCxDQUFjO1lBQzlCLHVCQUF1QixFQUFFO2dCQUNyQixXQUFXLEVBQUUsVUFBQyxLQUFLLElBQUssT0FBQSwyQkFBeUIsS0FBTyxFQUFoQyxDQUFnQztnQkFDeEQsaUJBQWlCLEVBQUUsVUFBQyxLQUFLLElBQUssT0FBQSw0QkFBMEIsS0FBSyxZQUFTLEVBQXhDLENBQXdDO2dCQUN0RSxZQUFZLEVBQUUsb0VBQW9FO2dCQUNsRixZQUFZLEVBQUUsbURBQW1EO2dCQUNqRSxRQUFRLEVBQUUsd0hBQXdIO2dCQUNsSSxhQUFhLEVBQUUsVUFBQyxPQUFPO29CQUNuQixJQUFJLGNBQWMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFL0QsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO3dCQUNmLE9BQU8scUNBQW1DLE9BQU8sQ0FBQyxLQUFLLFNBQUksY0FBYyxhQUFVLENBQUM7cUJBQ3ZGO3lCQUFNO3dCQUNILE9BQU8sOENBQTRDLE9BQU8sQ0FBQyxLQUFLLFNBQUksY0FBYyxhQUFVLENBQUM7cUJBQ2hHO2dCQUNMLENBQUM7YUFDSjtZQUNELG9CQUFvQixFQUFFO2dCQUNsQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxLQUFLLEVBQUUsS0FBSzthQUNmO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFqRE0sMEJBQUssR0FBRyx1Q0FBdUMsQ0FBQztJQWtEM0QsMkJBQUM7Q0FuREQsQUFtREMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FDeEQvRCxnQkFBZ0I7QUFDaEI7SUFBQTtJQWNBLENBQUM7SUFYVSx5REFBcUIsR0FBNUIsVUFBNkIsT0FBd0Q7UUFDakYsSUFBSSxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTtZQUN0RCxPQUFPLHlFQUF5RSxDQUFDO1NBQ3BGO1FBRUQsSUFBSSxPQUFPLENBQUMsb0JBQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUMxRSxPQUFPLCtFQUErRSxDQUFDO1NBQzFGO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBWk0sK0JBQUssR0FBRyw0Q0FBNEMsQ0FBQztJQWFoRSxnQ0FBQztDQWRELEFBY0MsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FDbkJ6RSxnQkFBZ0I7QUFDaEI7SUFTSSxxQkFDWSxrQkFBc0MsRUFDdEMsWUFBb0IsRUFDcEIsWUFBeUM7UUFGekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0QyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixpQkFBWSxHQUFaLFlBQVksQ0FBNkI7SUFFckQsQ0FBQztJQUVNLDhDQUF3QixHQUEvQixVQUFnQyxNQUFtQyxFQUFFLFFBQW1DO1FBQ3BHLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3pDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztZQUNqQixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7WUFDckIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDbEUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1NBQ3hCLENBQUMsQ0FBQztJQUNQLENBQUM7SUF4Qk0saUJBQUssR0FBRyw4QkFBOEIsQ0FBQztJQUV2QyxtQkFBTyxHQUFHO1FBQ2IscUNBQXFDO1FBQ3JDLCtCQUErQjtRQUMvQiwrQkFBK0I7S0FDbEMsQ0FBQztJQW1CTixrQkFBQztDQTFCRCxBQTBCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztBQy9CN0M7OztHQUdHO0FBRUgsZ0JBQWdCO0FBQ2hCO0lBQUE7SUFVQSxDQUFDO0lBUFUsbUNBQUksR0FBWCxVQUFZLFFBQWtDO1FBQzFDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ3BELENBQUM7SUFFTSxvQ0FBSyxHQUFaLFVBQWEsUUFBa0M7UUFDM0MsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDckQsQ0FBQztJQVJNLDBCQUFLLEdBQUcsdUNBQXVDLENBQUM7SUFTM0QsMkJBQUM7Q0FWRCxBQVVDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQ3BCL0QsZ0JBQWdCO0FBQ2hCO0lBQUE7SUFrQkEsQ0FBQztJQWZVLDhDQUFpQixHQUF4QixVQUF5QixNQUFtQyxFQUFFLEdBQVc7UUFDckUsSUFBSSxHQUFHLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN6QixPQUFPLENBQUMsQ0FBQztTQUNaO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU0sNkNBQWdCLEdBQXZCLFVBQXdCLE1BQW1DLEVBQUUsR0FBVztRQUNwRSxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7WUFDWCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDMUI7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFoQk0sd0JBQUssR0FBRyxxQ0FBcUMsQ0FBQztJQWlCekQseUJBQUM7Q0FsQkQsQUFrQkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FDdkIzRCxzSUFBc0k7QUFDdEksZ0JBQWdCO0FBQ2hCO0lBUUkscUNBQ1ksa0JBQXNDLEVBQ3RDLFlBQXlDO1FBRHpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsaUJBQVksR0FBWixZQUFZLENBQTZCO0lBRXJELENBQUM7SUFFRCwwQ0FBSSxHQUFKLFVBQUssSUFBOEIsRUFBRSxNQUFtQztRQUNwRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRS9CLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDaEQ7UUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLHNEQUFnQixHQUF4QixVQUF5QixJQUE4QixFQUFFLE1BQW1DO1FBQ3hGLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3pDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLEtBQUssRUFBRSxDQUFDO1lBQ1IsR0FBRyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUN2RSxLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9EQUFjLEdBQXRCLFVBQXVCLFlBQXVDLEVBQUUsTUFBbUM7UUFDL0YsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDekMsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO1lBQ3JCLEtBQUssRUFBRSxZQUFZLENBQUMsR0FBRztZQUN2QixHQUFHLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3ZFLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWTtTQUM3QixDQUFDLENBQUE7SUFDTixDQUFDO0lBRU8sc0RBQWdCLEdBQXhCLFVBQXlCLGFBQXdDLEVBQUUsTUFBbUM7UUFDbEcsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDekMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHO1lBQ3RCLEtBQUssRUFBRSxDQUFDO1lBQ1IsR0FBRyxFQUFFLGFBQWEsQ0FBQyxLQUFLO1lBQ3hCLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8seUVBQW1DLEdBQTNDLFVBQTRDLFFBQW1DLEVBQUUsTUFBbUM7UUFDaEgsSUFBSSxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUM5QyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUN6RDtRQUVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyx3REFBa0IsR0FBMUIsVUFBMkIsU0FBc0MsRUFBRSxNQUFtQztRQUNsRyxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9DLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUMsbUNBQW1DLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFL0IsY0FBYztRQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxlQUFlLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFcEMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QixJQUFJLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BFLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRW5FLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDakM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQ3JELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFN0UsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMvQjtZQUVELElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRTlCLElBQUksVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDOUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRTVELFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVCLE1BQU07YUFDVDtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVPLG9EQUFjLEdBQXRCLFVBQXVCLGVBQTBDLEVBQUUsWUFBdUMsRUFBRSxNQUFtQztRQUMzSSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUN6QyxHQUFHLEVBQUUsZUFBZSxDQUFDLEdBQUc7WUFDeEIsS0FBSyxFQUFFLGVBQWUsQ0FBQyxHQUFHO1lBQzFCLEdBQUcsRUFBRSxZQUFZLENBQUMsS0FBSztZQUN2QixLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHdEQUFrQixHQUExQixVQUEyQixTQUFzQztRQUM3RCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFqQixDQUFpQixDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLG9EQUFjLEdBQXRCLFVBQXVCLGVBQTBDLEVBQUUsYUFBd0M7UUFDdkcsT0FBTyxlQUFlLENBQUMsR0FBRyxLQUFLLGFBQWEsQ0FBQyxLQUFLLENBQUM7SUFDdkQsQ0FBQztJQUVPLDBEQUFvQixHQUE1QixVQUE2QixRQUFtQyxFQUFFLE1BQW1DO1FBQ2pHLE9BQU8sUUFBUSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLHdEQUFrQixHQUExQixVQUEyQixRQUFtQyxFQUFFLE1BQW1DO1FBQy9GLE9BQU8sUUFBUSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBaElNLGlDQUFLLEdBQUcsOENBQThDLENBQUM7SUFFdkQsbUNBQU8sR0FBRztRQUNiLHFDQUFxQztRQUNyQywrQkFBK0I7S0FDbEMsQ0FBQztJQTRITixrQ0FBQztDQWxJRCxBQWtJQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLDJCQUEyQixDQUFDLENBQUM7QUN4STdFLGdCQUFnQjtBQUNoQjtJQUdJLCtCQUNZLFNBQXVDO1FBRG5ELGlCQUdDO1FBRlcsY0FBUyxHQUFULFNBQVMsQ0FBOEI7UUFJbkQsU0FBSSxHQUFHLFVBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQUUsV0FBdUM7WUFDakksSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFO2dCQUN0QixXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBQyxVQUFvQztvQkFDakYsT0FBTyxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxDQUFDO2FBQ0w7UUFDTCxDQUFDLENBQUE7UUFFRCxZQUFPLEdBQUcsU0FBUyxDQUFDO0lBVnBCLENBQUM7SUFZTSw2QkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUV0RSxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBekJNLDJCQUFLLEdBQUcsZ0JBQWdCLENBQUM7SUEwQnBDLDRCQUFDO0NBM0JELEFBMkJDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQ2hDN0UsZ0JBQWdCO0FBQ2hCO0lBUUksNkJBQ1ksUUFBa0M7UUFBbEMsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7SUFFOUMsQ0FBQztJQVZNLHlCQUFLLEdBQUcsdUJBQXVCLENBQUM7SUFDaEMsaUNBQWEsR0FBRyxlQUFlLENBQUM7SUFFaEMsMkJBQU8sR0FBRztRQUNiLFVBQVU7S0FDYixDQUFDO0lBUU4sMEJBQUM7Q0FkRCxBQWNDLElBQUE7QUFFRCxnQkFBZ0I7QUFDaEI7SUFBQTtRQUdJLGVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7UUFDdkMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQyxhQUFhLENBQUM7UUFFakQsWUFBTyxHQUFHO1lBQ04sZUFBZSxFQUFFLGdCQUFnQjtTQUNwQyxDQUFDO1FBRUYsYUFBUSxHQUFHLHFFQUVWLENBQUM7UUFFRixlQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFkVSx3QkFBSyxHQUFHLGFBQWEsQ0FBQztJQWNqQyx5QkFBQztDQWZELEFBZUMsSUFBQTtBQUdELE9BQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDL0IsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztLQUMxRCxTQUFTLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0FDdENuRTs7OztHQUlHO0FBRUgsZ0JBQWdCO0FBQ2hCO0lBQUE7SUFvQkEsQ0FBQztJQWpCRyxxQ0FBYyxHQUFkLFVBQWUsU0FBMEQ7UUFDckUsSUFBSSxJQUFJLEdBQXVFLEVBQUUsQ0FBQztRQUVsRixJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSztZQUNqRSxJQUFJLEdBQUcsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDO1lBRTlCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNyQjtZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFbkMsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQWxCTSxrQkFBSyxHQUFHLCtCQUErQixDQUFDO0lBbUJuRCxtQkFBQztDQXBCRCxBQW9CQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztBQy9CL0MsZ0JBQWdCO0FBQ2hCO0lBNkVFLHlCQUNVLFNBQW1DLEVBQ25DLG1CQUF3QyxFQUN4QyxZQUEwQjtRQUhwQyxpQkFLQztRQUpTLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsaUJBQVksR0FBWixZQUFZLENBQWM7UUE5RXBDLGFBQVEsR0FBRyxHQUFHLENBQUM7UUFFZixVQUFLLEdBQUc7WUFDTixNQUFNLEVBQUUsR0FBRztZQUNYLFVBQVUsRUFBRSxHQUFHO1lBQ2YsV0FBVyxFQUFFLEdBQUc7WUFDaEIsU0FBUyxFQUFFLEdBQUc7U0FDZixDQUFDO1FBRUYsU0FBSSxHQUFHLFVBQUMsS0FBSyxFQUFFLE9BQWlDO1lBQzlDLElBQUksU0FBUyxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUM7WUFDL0IsSUFBSSxtQkFBbUIsR0FBRyxLQUFJLENBQUMsbUJBQW1CLENBQUM7WUFDbkQsSUFBSSxZQUFZLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQztZQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFVixJQUFJLGNBQWMsR0FBVyxzQkFBc0IsQ0FBQztZQUNwRCxJQUFJLGNBQWMsR0FBVyxxQkFBcUIsQ0FBQztZQUNuRCxJQUFJLFlBQVksR0FBVyxrQkFBa0IsQ0FBQztZQUU5QyxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV0QyxtQkFBbUIsS0FBSztnQkFDdEIsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFcEIsK0NBQStDO2dCQUMvQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXZCLHdIQUF3SDtnQkFDeEgsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUV4QixTQUFTLEVBQUUsQ0FBQztZQUNkLENBQUM7WUFFRDtnQkFDRSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTdDLFNBQVMsRUFBRSxDQUFDO1lBQ2QsQ0FBQztZQUVELGtCQUFrQixLQUFLO2dCQUNyQixPQUFPLEtBQUssQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsbUJBQW1CLEtBQUs7Z0JBQ3RCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFFdEIsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDOUM7WUFDSCxDQUFDO1lBRUQ7Z0JBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQzVDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUV4QyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2lCQUNsQztZQUNILENBQUM7WUFFRDtnQkFDRSxTQUFTLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDeEMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXBDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3pDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQ3hDO1lBQ0gsQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsYUFBYSxFQUFFLENBQUM7YUFDakI7UUFDSCxDQUFDLENBQUE7SUFPRCxDQUFDO0lBRU0sdUJBQU8sR0FBZDtRQUNFLElBQUksU0FBUyxHQUFHLFVBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFlBQVksSUFBSyxPQUFBLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxZQUFZLENBQUMsRUFBakUsQ0FBaUUsQ0FBQztRQUVwSSxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsV0FBVyxFQUFFLHNDQUFzQyxFQUFFLCtCQUErQixDQUFDLENBQUM7UUFFM0csT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQXpGTSxxQkFBSyxHQUFHLFVBQVUsQ0FBQztJQTBGNUIsc0JBQUM7Q0EzRkQsQUEyRkMsSUFBQTtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDakMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUMvRi9ELGdCQUFnQjtBQUNoQjtJQUFBO1FBQUEsaUJBb0VDO1FBakVHLGFBQVEsR0FBRyxHQUFHLENBQUM7UUFDZixZQUFPLEdBQUcsb0JBQW9CLENBQUM7UUFFdkIsa0JBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFtRHpFLFNBQUksR0FBRyxVQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQXdDO1lBQ25FLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUQ7UUFDTCxDQUFDLENBQUE7SUFPTCxDQUFDO0lBNURXLDhDQUFnQixHQUF4QixVQUF5QixLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLO1FBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ1QsS0FBSyxDQUFDLEtBQUsseURBQXdDO29CQUMvQyxVQUFVLEVBQUUsU0FBUztvQkFDckIsR0FBRyxFQUFFLEdBQUc7aUJBQ1gsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxvQ0FBTSxHQUFkLFVBQWUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBbUM7UUFDckUsb0NBQW9DO1FBQ3BDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU1QyxnQkFBZ0I7UUFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWhCLG9CQUFvQjtRQUNwQixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRS9CLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBRW5DLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBRyxXQUFXLElBQUksSUFBSSxJQUFHLFFBQVUsQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNMLElBQUksa0JBQWtCLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQzlDLElBQUksa0JBQWtCLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixDQUFDO2dCQUVsRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3pDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pFLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1QjthQUNGO1lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFRTSwyQkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsY0FBTSxPQUFBLElBQUksbUJBQW1CLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQztRQUVoRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBbEVNLHlCQUFLLEdBQUcsY0FBYyxDQUFDO0lBbUVsQywwQkFBQztDQXBFRCxBQW9FQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixTQUFTLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUN6RXpFLGdCQUFnQjtBQUNoQjtJQUFBO0lBb0RBLENBQUM7SUFqREc7OztPQUdHO0lBQ0ksNkNBQWUsR0FBdEIsVUFBdUIsS0FBaUM7UUFDcEQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLG9CQUFvQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvRCx1RkFBdUY7UUFDdkYsSUFBSSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxJQUFJLFdBQVcsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBRTlELG1EQUFtRDtRQUNuRCxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsK0NBQStDO0lBQ3ZDLDRDQUFjLEdBQXRCLFVBQXVCLEtBQWlDO1FBQ3BELElBQUksV0FBVyxDQUFDO1FBQ2hCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0IsSUFBSSxXQUFXLENBQUMsY0FBYyxFQUFFO2dCQUM1QixXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixNQUFNO2FBQ1Q7U0FDSjtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxzRUFBc0U7SUFDOUQscURBQXVCLEdBQS9CLFVBQWdDLEtBQWlDO1FBQzdELElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO1FBQzlCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0IsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFO2dCQUMxQixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEM7U0FDSjtRQUVELE9BQU8sb0JBQW9CLENBQUM7SUFDaEMsQ0FBQztJQWxETSx5QkFBSyxHQUFHLHNDQUFzQyxDQUFDO0lBbUQxRCwwQkFBQztDQXBERCxBQW9EQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUN6RDdELGdCQUFnQjtBQUNoQjtJQUdJLDhCQUNZLFNBQXNDO1FBRGxELGlCQUdDO1FBRlcsY0FBUyxHQUFULFNBQVMsQ0FBNkI7UUFJbEQsU0FBSSxHQUFHLFVBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQUUsV0FBdUM7WUFDakksSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO2dCQUNyQixXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBQyxVQUFvQztvQkFDakYsT0FBTyxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxDQUFDO2FBQ0w7UUFDTCxDQUFDLENBQUE7UUFFRCxZQUFPLEdBQUcsU0FBUyxDQUFDO0lBVnBCLENBQUM7SUFZTSw0QkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsOENBQThDLENBQUMsQ0FBQztRQUVyRSxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBekJNLDBCQUFLLEdBQUcsZUFBZSxDQUFDO0lBMEJuQywyQkFBQztDQTNCRCxBQTJCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixTQUFTLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUNoQzNFLGdCQUFnQjtBQUNoQjtJQUdJLG9DQUNZLFNBQTRDO1FBRHhELGlCQUdDO1FBRlcsY0FBUyxHQUFULFNBQVMsQ0FBbUM7UUFJeEQsU0FBSSxHQUFHLFVBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQUUsV0FBdUM7WUFDakksSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzNCLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFDLFVBQW9DO29CQUNqRixPQUFPLEtBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RSxDQUFDLENBQUM7YUFDTDtRQUNMLENBQUMsQ0FBQTtRQUVELFlBQU8sR0FBRyxTQUFTLENBQUM7SUFWcEIsQ0FBQztJQVlNLGtDQUFPLEdBQWQ7UUFDSSxJQUFJLFNBQVMsR0FBRyxVQUFDLFNBQVM7WUFDdEIsT0FBTyxJQUFJLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQztRQUVGLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBRTNFLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUF6Qk0sZ0NBQUssR0FBRyxxQkFBcUIsQ0FBQztJQTBCekMsaUNBQUM7Q0EzQkQsQUEyQkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsU0FBUyxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSwwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FDaEN2RixnQkFBZ0I7QUFDaEI7SUFRSSw0QkFDWSxNQUFjLEVBQ2QsV0FBdUM7UUFEdkMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGdCQUFXLEdBQVgsV0FBVyxDQUE0QjtJQUVuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxzQ0FBUyxHQUFoQixVQUFpQixNQUFtQyxFQUFFLEtBQWlDO1FBQXZGLGlCQW1CQztRQWxCRyxJQUFJLE1BQU0sR0FBK0IsRUFBRSxDQUFDO1FBRTVDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFDLEdBQVcsRUFBRSxTQUFpQjtZQUMxRCxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1lBQzNELElBQUksSUFBSSxHQUE2QixhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVwRixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzNEO2lCQUFNO2dCQUNMLDJDQUEyQztnQkFDM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBRWpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7SUFDdkUsQ0FBQztJQW5DTSx3QkFBSyxHQUFHLHFDQUFxQyxDQUFDO0lBRTlDLDBCQUFPLEdBQUc7UUFDYix5QkFBeUI7UUFDekIsOEJBQThCO0tBQ2pDLENBQUM7SUErQk4seUJBQUM7Q0FyQ0QsQUFxQ0MsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FDMUMzRCxnQkFBZ0I7QUFDaEI7SUFHSSwrQkFDWSxTQUF1QztRQURuRCxpQkFHQztRQUZXLGNBQVMsR0FBVCxTQUFTLENBQThCO1FBSW5ELFNBQUksR0FBRyxVQUFDLEtBQXFCLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUFFLFdBQXVDO1lBQ2pJLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRTtnQkFDdEIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQUMsVUFBb0M7b0JBQ2pGLE9BQU8sS0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVFLENBQUMsQ0FBQzthQUNMO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsWUFBTyxHQUFHLFNBQVMsQ0FBQztJQVZwQixDQUFDO0lBWU0sNkJBQU8sR0FBZDtRQUNJLElBQUksU0FBUyxHQUFHLFVBQUMsU0FBUztZQUN0QixPQUFPLElBQUkscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDO1FBRUYsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFFdEUsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQXpCTSwyQkFBSyxHQUFHLGdCQUFnQixDQUFDO0lBMEJwQyw0QkFBQztDQTNCRCxBQTJCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixTQUFTLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUNoQzdFLGdCQUFnQjtBQUNoQjtJQUtJLDZCQUNZLFNBQW1DO1FBQW5DLGNBQVMsR0FBVCxTQUFTLENBQTBCO0lBRS9DLENBQUM7SUFJTSx3Q0FBVSxHQUFqQjtRQUNJLElBQU0sU0FBUyxHQUFHLHFCQUFxQixDQUFDO1FBRXhDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sOENBQWdCLEdBQXZCO1FBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFFTyw4Q0FBZ0IsR0FBeEIsVUFBeUIsS0FBSztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0lBMUJNLHlCQUFLLEdBQUcsc0NBQXNDLENBQUM7SUFFL0MsMkJBQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBeUJuQywwQkFBQztDQTVCRCxBQTRCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0tBQ3ZELEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxVQUFDLG1CQUF3QztRQUN0RSxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FDcENSLGdCQUFnQjtBQUNoQjtJQWdCRSwrQkFDVSxRQUFrQyxFQUNsQyxFQUFxQixFQUNyQixNQUFzQixFQUN0QixvQkFBMEMsRUFDMUMsa0JBQXNDLEVBQ3RDLG1CQUF3QyxFQUN4QyxZQUFvQixFQUNwQixZQUF5QyxFQUN6Qyx5QkFBb0Q7UUFScEQsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7UUFDbEMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFDckIsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsaUJBQVksR0FBWixZQUFZLENBQTZCO1FBQ3pDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFFNUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFnQk0seUNBQVMsR0FBaEI7UUFBQSxpQkE0QkM7UUEzQkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFO1lBQzdCLEtBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUM3QixLQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7WUFDekIsS0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHFEQUFxQyxVQUFDLEtBQTRCLEVBQUUsYUFBd0M7WUFDekgsSUFBSSxLQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDMUIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUNqQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHFEQUFxQyxVQUFDLEtBQTRCLEVBQUUsR0FBVztZQUM1RixJQUFJLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFO2dCQUN0RCxLQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7YUFDaEM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyw4REFBMEM7WUFDdkQsS0FBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLDRDQUFZLEdBQXBCO1FBQ0UsMElBQTBJO1FBQzFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLDZEQUF5QyxDQUFDO1NBQzVEO1FBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUN4QjtRQUVELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQy9DLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7SUFFTyw0Q0FBWSxHQUFwQjtRQUNFLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFTyx5Q0FBUyxHQUFqQjtRQUNFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN4QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFTywrQ0FBZSxHQUF2QjtRQUNFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBRU8sa0RBQWtCLEdBQTFCO1FBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVPLGtEQUFrQixHQUExQjtRQUNFLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUV2QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRU8saURBQWlCLEdBQXpCLFVBQTBCLEtBQWEsRUFBRSxHQUFXO1FBQ2xELEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckUsR0FBRyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRGLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDeEIsR0FBRyxHQUFHLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxRQUFRLEdBQUc7WUFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ2xCLEtBQUssRUFBRSxLQUFLO1lBQ1osR0FBRyxFQUFFLEdBQUc7WUFDUixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO1NBQ2hDLENBQUM7UUFFRixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sZ0RBQWdCLEdBQXhCLFVBQXlCLFFBQXVEO1FBQzlFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUVELHdDQUF3QztJQUNqQywyQ0FBVyxHQUFsQjtRQUNFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hELElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0QsSUFBSSxpQkFBaUIsR0FBVyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1FBRTlELElBQUksZ0JBQXdCLENBQUM7UUFDN0IsSUFBSSxpQkFBeUIsQ0FBQztRQUU5QixJQUFJLFVBQVUsR0FBRyxpQkFBaUIsRUFBRSxFQUFFLHdCQUF3QjtZQUM1RCxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7WUFDOUIsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7U0FDdkM7YUFBTSxFQUFFLHlCQUF5QjtZQUNoQyxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztZQUNyQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7U0FDaEM7UUFFRCxJQUFJLFdBQVcsR0FBRztZQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDO1lBQ2hELEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUM7U0FDbkQsQ0FBQztRQUVGLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDbEIsV0FBVyxFQUFFLFdBQVc7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJDQUEyQztJQUNwQyw2Q0FBYSxHQUFwQjtRQUNFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHO1lBQ3pCLElBQUksRUFBRSxHQUFHO1lBQ1QsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtTQUNuRixDQUFDO1FBRUYsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNsQixXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7U0FDcEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLHVEQUF1QixHQUE5QjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN2QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFTSx1REFBdUIsR0FBOUI7UUFDRSxrR0FBa0c7UUFDbEcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN4QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsT0FBTztTQUNSO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRU0scURBQXFCLEdBQTVCO1FBQUEsaUJBUUM7UUFQQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsbUJBQW1CO1lBQzNELEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyw0REFBeUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDUCxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssb0RBQW9DLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sMkNBQVcsR0FBbkI7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTywyQ0FBVyxHQUFuQixVQUFvQixhQUF3QztRQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBRWpDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUVPLGdEQUFnQixHQUF4QixVQUF5QixLQUFhO1FBQ3BDLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxjQUFjLENBQUM7UUFFbEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8scURBQXFCLEdBQTdCLFVBQThCLEtBQWE7UUFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNLLDRDQUFZLEdBQXBCLFVBQXFCLFFBQW1DO1FBQXhELGlCQTZCQztRQTVCQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDdkIsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFFM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsV0FBVztnQkFDOUMsSUFBSSxLQUFLLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM1QixLQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDcEM7cUJBQU07b0JBQ0wsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUUzQyxLQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFL0IsOEZBQThGO29CQUM5RiwwRUFBMEU7b0JBQzFFLDBEQUEwRDtvQkFDMUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUMzQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUN4QjtpQkFDRjtnQkFFRCxLQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDUCxzREFBc0Q7WUFDeEQsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUNULFFBQVEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU8sMkNBQVcsR0FBbkIsVUFBb0IsS0FBYTtRQUMvQixJQUFJLGtCQUFrQixHQUFnQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEUsT0FBTyxrQkFBa0IsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQzlDLENBQUM7SUFFTyw0Q0FBWSxHQUFwQixVQUFxQixLQUFhLEVBQUUsR0FBVztRQUM3Qyx1RkFBdUY7UUFDdkYsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztTQUNqQztRQUVELHdFQUF3RTtRQUN4RSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFakUsaUhBQWlIO1FBQ2pILElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhGLElBQUksV0FBVyxHQUFHLGtCQUFrQixDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7UUFDakYsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDakUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEUsSUFBSSxNQUFNLEdBQUcsY0FBYyxHQUFHLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFFMUQsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxxREFBcUIsR0FBN0IsVUFBOEIsR0FBVztRQUN2QyxHQUFHLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFdBQVMsR0FBRyxPQUFJLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sNENBQVksR0FBcEIsVUFBcUIsUUFBdUQ7UUFDMUUsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLElBQUksUUFBUSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtZQUNuRixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU0sMENBQVUsR0FBakIsVUFBa0IsS0FBYTtRQUM3QixJQUFJLE9BQU8sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDeEYsQ0FBQztJQUVPLHNEQUFzQixHQUE5QixVQUErQixLQUFhO1FBQzFDLCtIQUErSDtRQUMvSCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUU1RCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU8sbURBQW1CLEdBQTNCLFVBQTRCLEtBQWE7UUFDdkMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBclZNLDJCQUFLLEdBQUcseUJBQXlCLENBQUM7SUFDbEMsbUNBQWEsR0FBRyxpQkFBaUIsQ0FBQztJQUVsQyw2QkFBTyxHQUFHO1FBQ2YsVUFBVTtRQUNWLElBQUk7UUFDSixRQUFRO1FBQ1IsdUNBQXVDO1FBQ3ZDLHFDQUFxQztRQUNyQyxzQ0FBc0M7UUFDdEMsK0JBQStCO1FBQy9CLCtCQUErQjtRQUMvQiw0Q0FBNEM7S0FDN0MsQ0FBQztJQXlVSiw0QkFBQztDQXZWRCxBQXVWQyxJQUFBO0FBRUQsZ0JBQWdCO0FBQ2hCO0lBQUE7UUFHRSxhQUFRLEdBQUc7WUFDVCxNQUFNLEVBQUUsR0FBRztZQUNYLFlBQVksRUFBRSxHQUFHO1lBQ2pCLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLElBQUksRUFBRSxVQUFVO1lBQ2hCLGNBQWMsRUFBRSxHQUFHO1NBQ3BCLENBQUM7UUFFRixlQUFVLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDO1FBQ3pDLGlCQUFZLEdBQUcscUJBQXFCLENBQUMsYUFBYSxDQUFDO1FBRW5ELFlBQU8sR0FBRztZQUNSLFdBQVcsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7UUFFRixnQkFBVyxHQUFHLGtEQUFrRCxDQUFDO0lBQ25FLENBQUM7SUFsQlEsMEJBQUssR0FBRyxlQUFlLENBQUM7SUFrQmpDLDJCQUFDO0NBbkJELEFBbUJDLElBQUE7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQ2pDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUM7S0FDOUQsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLG9CQUFvQixFQUFFLENBQUMsQ0FBQztBQ2xYckUsZ0JBQWdCO0FBQ2hCO0lBR0ksMEJBQ1ksU0FBMEM7UUFEdEQsaUJBR0M7UUFGVyxjQUFTLEdBQVQsU0FBUyxDQUFpQztRQUl0RCxTQUFJLEdBQUcsVUFBQyxLQUFxQixFQUFFLE9BQWlDLEVBQUUsS0FBMEIsRUFBRSxXQUF1QztZQUNqSSxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBQyxVQUFvQztnQkFDakYsT0FBTyxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUE7UUFFRCxZQUFPLEdBQUcsU0FBUyxDQUFDO0lBUnBCLENBQUM7SUFVTSx3QkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUVqRSxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBdkJNLHNCQUFLLEdBQUcsV0FBVyxDQUFDO0lBd0IvQix1QkFBQztDQXpCRCxBQXlCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixTQUFTLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUM5Qm5FLGdCQUFnQjtBQUNoQjtJQUdJLDBCQUNZLFNBQWtDO1FBRDlDLGlCQUdDO1FBRlcsY0FBUyxHQUFULFNBQVMsQ0FBeUI7UUFJOUMsU0FBSSxHQUFHLFVBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQUUsV0FBdUM7WUFDakksV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQUMsVUFBb0M7Z0JBQ2pGLE9BQU8sS0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUUsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFBO1FBRUQsWUFBTyxHQUFHLFNBQVMsQ0FBQztJQVJwQixDQUFDO0lBVU0sd0JBQU8sR0FBZDtRQUNJLElBQUksU0FBUyxHQUFHLFVBQUMsU0FBUztZQUN0QixPQUFPLElBQUksZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDO1FBRUYsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFFakUsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQXZCTSxzQkFBSyxHQUFHLFdBQVcsQ0FBQztJQXdCL0IsdUJBQUM7Q0F6QkQsQUF5QkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FDOUJuRSxnQkFBZ0I7QUFDaEI7SUFPSSx3QkFDWSxrQkFBc0M7UUFBdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtJQUVsRCxDQUFDO0lBRUQsd0NBQWUsR0FBZixVQUFnQixNQUFtQyxFQUFFLE9BQXNELEVBQUUsS0FBb0Q7UUFDN0osSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNqQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUvRSxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzdCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNFLElBQUksUUFBUSxJQUFJLFVBQVUsSUFBSSxVQUFVLElBQUksWUFBWSxFQUFFO1lBQ3RELG9DQUF5QztTQUM1QztRQUVELElBQUksVUFBVSxJQUFJLFFBQVEsSUFBSSxZQUFZLElBQUksVUFBVSxFQUFFO1lBQ3RELGtDQUF1QztTQUMxQztRQUVELElBQUksUUFBUSxHQUFHLFlBQVksSUFBSSxRQUFRLElBQUksVUFBVSxFQUFFO1lBQ25ELHVDQUE0QztTQUMvQztRQUVELElBQUksVUFBVSxJQUFJLFlBQVksSUFBSSxVQUFVLEdBQUcsVUFBVSxFQUFFO1lBQ3ZELHlDQUE4QztTQUNqRDtRQUVELElBQUksUUFBUSxLQUFLLFlBQVksSUFBSSxRQUFRLElBQUksVUFBVSxFQUFFO1lBQ3JELHNDQUEyQztTQUM5QztRQUVELElBQUksVUFBVSxLQUFLLFVBQVUsSUFBSSxVQUFVLElBQUksVUFBVSxFQUFFO1lBQ3ZELHNDQUEyQztTQUM5QztRQUVELHlCQUE4QjtJQUNsQyxDQUFDO0lBM0NNLG9CQUFLLEdBQUcsaUNBQWlDLENBQUM7SUFFMUMsc0JBQU8sR0FBRztRQUNiLHFDQUFxQztLQUN4QyxDQUFDO0lBd0NOLHFCQUFDO0NBN0NELEFBNkNDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FDbERuRCxrSkFBa0o7QUFDbEosZ0JBQWdCO0FBQ2hCO0lBQUE7SUFlQSxDQUFDO0lBWkcsbUNBQUssR0FBTCxVQUFNLFNBQXNDLEVBQUUsTUFBbUM7UUFDN0UsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFckMsdURBQXVEO1FBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxZQUFZLEVBQUU7Z0JBQzVDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzFCO1NBQ0o7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBYk0seUJBQUssR0FBRyxzQ0FBc0MsQ0FBQztJQWMxRCwwQkFBQztDQWZELEFBZUMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FDckI3RCxnQkFBZ0I7QUFDaEI7SUFHSTtRQU9RLHVCQUFrQixHQUFhLEVBQUUsQ0FBQztRQUVsQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFSeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUc7WUFDaEIsWUFBWTtZQUNaLFNBQVM7U0FDWixDQUFBO0lBQ0wsQ0FBQztJQU1NLHFEQUFxQixHQUE1QixVQUE2QixNQUFnQjtRQUN6QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDO0lBQ3JDLENBQUM7SUFFTSxvQ0FBSSxHQUFYLFVBQ0ksVUFBcUMsRUFDckMsT0FBK0I7UUFGbkMsaUJBNEJDO1FBeEJHLE9BQU87WUFDSCxVQUFVLEVBQUU7Z0JBQ1IsSUFBSSxLQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3pCLE9BQU87aUJBQ1Y7Z0JBRUQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtvQkFDL0IsNkVBQTZFO29CQUM3RSxVQUFVLENBQUMsTUFBTSxDQUFDO3dCQUNkLFVBQVUsQ0FBQyxVQUFVLDJDQUErQixDQUFDO29CQUN6RCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLEtBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDekIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7d0JBQ2xDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFOzRCQUNsQixVQUFVLENBQUMsVUFBVSwyQ0FBK0IsQ0FBQzt3QkFDekQsQ0FBQyxDQUFDLENBQUE7b0JBQ04sQ0FBQyxDQUFDLENBQUE7aUJBQ0w7Z0JBRUQsS0FBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUM7SUE3Q2EsMkJBQUssR0FBRyxrQ0FBa0MsQ0FBQztJQThDN0QsNEJBQUM7Q0EvQ0QsQUErQ0MsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxxQkFBcUIsQ0FBQztLQUM1RCxHQUFHLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsVUFBQyxhQUE2QixJQUFLLE9BQUEsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUExQixDQUEwQixDQUFDLENBQUMsQ0FBQztBQ3JEdkcsZ0JBQWdCO0FBQ2hCO0lBVUksMkNBQ1ksT0FBc0M7UUFBdEMsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFIMUMsaUJBQVksR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFRCxtREFBTyxHQUFQO1FBQ0ksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFFdkMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLFlBQVksaUNBQTZCLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM1RztRQUVELElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTtZQUNyQixJQUFJLENBQUMsWUFBWSxtQ0FBOEIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1NBQ2pHO1FBRUQsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxZQUFZLG1DQUE4QixHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7U0FDakc7UUFFRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDakIsSUFBSSxDQUFDLFlBQVkseUJBQXlCLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQztTQUN4RjtRQUVELElBQUksTUFBTSxDQUFDLG9CQUFvQixJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUU7WUFDbEUsSUFBSSxDQUFDLFlBQVkscUNBQStCLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUNoSTtRQUVELElBQUksTUFBTSxDQUFDLGlCQUFpQixFQUFFO1lBQzFCLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQyxZQUFZLDZDQUFtQyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzlIO0lBQ0wsQ0FBQztJQTFDTSwrQ0FBYSxHQUFHLDZCQUE2QixDQUFDO0lBQzlDLHVDQUFLLEdBQUcsb0RBQW9ELENBQUM7SUFFN0QseUNBQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBd0NqQyx3Q0FBQztDQTVDRCxBQTRDQyxJQUFBO0FBRUQsZ0JBQWdCO0FBQ2hCO0lBQUE7UUFHSSxlQUFVLEdBQUcsaUNBQWlDLENBQUMsS0FBSyxDQUFDO1FBQ3JELGlCQUFZLEdBQUcsaUNBQWlDLENBQUMsYUFBYSxDQUFDO1FBRS9ELFlBQU8sR0FBRztZQUNOLGFBQWEsRUFBRSxvQkFBb0I7U0FDdEMsQ0FBQztRQUVGLGFBQVEsR0FBRyxnUkFJVixDQUFDO0lBQ04sQ0FBQztJQWRVLHNDQUFLLEdBQUcsMkJBQTJCLENBQUM7SUFjL0MsdUNBQUM7Q0FmRCxBQWVDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsSUFBSSxnQ0FBZ0MsRUFBRSxDQUFDO0tBQ3pGLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztBQ3BFNUY7O0dBRUc7QUFFSCxnQkFBZ0I7QUFDaEI7SUFBQTtRQUdJLFNBQUksR0FBRyxVQUFDLEtBQXFCLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUFFLFdBQXVDO1lBQ2pJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUMsQ0FBQTtRQUVELFlBQU8sR0FBRyxTQUFTLENBQUM7SUFTeEIsQ0FBQztJQVBVLDJCQUFPLEdBQWQ7UUFDSSxJQUFJLFNBQVMsR0FBRztZQUNaLE9BQU8sSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQztRQUVGLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFoQk0seUJBQUssR0FBRyxjQUFjLENBQUM7SUFpQmxDLDBCQUFDO0NBbEJELEFBa0JDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQzNCekUsZ0JBQWdCO0FBQ2hCO0lBVUkseUNBQ1ksUUFBa0MsRUFDbEMsTUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIsV0FBd0I7UUFIeEIsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7UUFDbEMsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7SUFFcEMsQ0FBQztJQUVELG1EQUFTLEdBQVQ7UUFBQSxpQkFrQkM7UUFqQkcsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtRQUU1RCxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFHcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHlEQUF3QyxVQUFDLENBQUMsRUFBRSxJQUFJO1lBQzNELEtBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsaURBQW1DLFVBQUMsQ0FBQztZQUNoRCxLQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRywyQ0FBZ0MsVUFBQyxDQUFDO1lBQzdDLEtBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQW5DTSxxQ0FBSyxHQUFHLGtEQUFrRCxDQUFDO0lBRTNELHVDQUFPLEdBQUc7UUFDYixVQUFVO1FBQ1YsUUFBUTtRQUNSLGdDQUFnQztRQUNoQyw4QkFBOEI7S0FDakMsQ0FBQztJQTZCTixzQ0FBQztDQXJDRCxBQXFDQyxJQUFBO0FBRUQsZ0JBQWdCO0FBQ2hCO0lBQUE7UUFHSSxlQUFVLEdBQUcsK0JBQStCLENBQUMsS0FBSyxDQUFDO1FBQ25ELGVBQVUsR0FBRyxJQUFJLENBQUM7UUFFbEIsYUFBUSxHQUFHLGlDQUFpQyxDQUFDO0lBQ2pELENBQUM7SUFOVSxvQ0FBSyxHQUFHLHlCQUF5QixDQUFDO0lBTTdDLHFDQUFDO0NBUEQsQUFPQyxJQUFBO0FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUMvQixVQUFVLENBQUMsK0JBQStCLENBQUMsS0FBSyxFQUFFLCtCQUErQixDQUFDO0tBQ2xGLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSw4QkFBOEIsRUFBRSxDQUFDLENBQUM7QUNwRDNGLGdCQUFnQjtBQUNoQjtJQUdJLGdDQUNZLFNBQXdDO1FBRHBELGlCQUdDO1FBRlcsY0FBUyxHQUFULFNBQVMsQ0FBK0I7UUFJcEQsU0FBSSxHQUFHLFVBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQUUsV0FBdUM7WUFDakksSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFO2dCQUN2QixXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBQyxVQUFvQztvQkFDakYsT0FBTyxLQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxDQUFDO2FBQ0w7UUFDTCxDQUFDLENBQUE7UUFFRCxZQUFPLEdBQUcsU0FBUyxDQUFDO0lBVnBCLENBQUM7SUFZTSw4QkFBTyxHQUFkO1FBQ0ksSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUV2RSxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBekJNLDRCQUFLLEdBQUcsaUJBQWlCLENBQUM7SUEwQnJDLDZCQUFDO0NBM0JELEFBMkJDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQ2hDL0UsZ0JBQWdCO0FBQ2hCO0lBQUE7SUE2REEsQ0FBQztJQTFERyxzQkFBSSwrQ0FBSzthQUFUO1lBQ0kseUNBQW9DO1FBQ3hDLENBQUM7OztPQUFBO0lBRU0sK0NBQVEsR0FBZixVQUFnQixTQUEwRCxFQUFFLE1BQW1DO1FBQzNHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFHRCxxRkFBcUY7UUFDckYsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUUzQixxREFBcUQ7UUFDckQsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsMkVBQTJFO1FBQzNFLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtZQUNYLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDM0c7UUFFRCwrQ0FBK0M7UUFDL0MsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbEIsMkJBQTJCO1FBQzNCLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7UUFFM0UsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU1QiwwQ0FBMEM7WUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekQsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFFRCxnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLEtBQUssT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNwRSxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELE1BQU0sR0FBRyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ2pEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLDhEQUF1QixHQUEvQixVQUFnQyxLQUFhO1FBQ3pDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRU8sNERBQXFCLEdBQTdCLFVBQThCLEdBQVcsRUFBRSxNQUFtQztRQUMxRSxPQUFPLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3hELENBQUM7SUEzRE0sa0NBQUssR0FBRywrQ0FBK0MsQ0FBQztJQTREbkUsbUNBQUM7Q0E3REQsQUE2REMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FDbEUvRSxnQkFBZ0I7QUFDaEI7SUFLSSxxQ0FDWSxrQkFBc0M7UUFBdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtJQUVsRCxDQUFDO0lBRUQsc0JBQUksOENBQUs7YUFBVDtZQUNJLHVDQUFtQztRQUN2QyxDQUFDOzs7T0FBQTtJQUVNLDhDQUFRLEdBQWYsVUFBZ0IsU0FBMEQsRUFBRSxNQUFtQztRQUEvRyxpQkFRQztRQVBHLElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFFckMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLFlBQVksSUFBSSxLQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsRUFBbEgsQ0FBa0gsQ0FBQyxDQUFDO0lBQ3BKLENBQUM7SUFyQk0saUNBQUssR0FBRyw4Q0FBOEMsQ0FBQztJQUV2RCxtQ0FBTyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQW9CN0Qsa0NBQUM7Q0F2QkQsQUF1QkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0FDNUI3RSxnQkFBZ0I7QUFDaEI7SUFBQTtJQWlDQSxDQUFDO0lBOUJHLHNCQUFJLG9EQUFLO2FBQVQ7WUFDSSxtREFBeUM7UUFDN0MsQ0FBQzs7O09BQUE7SUFFTSxvREFBUSxHQUFmLFVBQWdCLFNBQTBELEVBQUUsTUFBbUM7UUFDM0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtZQUMzQixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsSUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUU3QixJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFDVixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsSUFBTSxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUV4QixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO1FBRTVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxlQUFlLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFcEMsSUFBSSxZQUFZLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFO2dCQUNyRSxPQUFPLEtBQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQS9CTSx1Q0FBSyxHQUFHLG9EQUFvRCxDQUFDO0lBZ0N4RSx3Q0FBQztDQWpDRCxBQWlDQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsaUNBQWlDLENBQUMsS0FBSyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7QUN0Q3pGLGdCQUFnQjtBQUNoQjtJQUFBO0lBeUJBLENBQUM7SUF0Qkcsc0JBQUksK0NBQUs7YUFBVDtZQUNJLHlDQUFvQztRQUN4QyxDQUFDOzs7T0FBQTtJQUVELHNKQUFzSjtJQUMvSSwrQ0FBUSxHQUFmLFVBQWdCLFNBQTBELEVBQUUsTUFBbUM7UUFDM0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7WUFDdEIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELGlIQUFpSDtRQUNqSCxJQUFJLG1CQUFtQixDQUFDO1FBRXhCLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDeEMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLFlBQVksRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO1NBQzlGO2FBQU07WUFDSCxtQkFBbUIsR0FBRyxTQUFTLENBQUM7U0FDbkM7UUFFRCw0Q0FBNEM7UUFDNUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUF2Qk0sa0NBQUssR0FBRywrQ0FBK0MsQ0FBQztJQXdCbkUsbUNBQUM7Q0F6QkQsQUF5QkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FDOUIvRSxnQkFBZ0I7QUFDaEI7SUFBQTtJQWNBLENBQUM7SUFYRyxzQkFBSSxrREFBSzthQUFUO1lBQ0ksK0JBQStCO1FBQ25DLENBQUM7OztPQUFBO0lBRUQsa0RBQVEsR0FBUixVQUFTLFNBQTBELEVBQUUsTUFBbUM7UUFDcEcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFyQixDQUFxQixDQUFDLENBQUM7U0FDdEY7YUFBTTtZQUNILE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFyQixDQUFxQixDQUFDLENBQUM7U0FDN0Q7SUFDTCxDQUFDO0lBWk0scUNBQUssR0FBRywwQ0FBMEMsQ0FBQztJQWE5RCxzQ0FBQztDQWRELEFBY0MsSUFBQTtBQUdELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLCtCQUErQixDQUFDLEtBQUssRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0FDcEJyRixnQkFBZ0I7QUFDaEI7SUFPSSxpQ0FDWSxjQUE4QjtRQUE5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7SUFFMUMsQ0FBQztJQUVELHNCQUFJLDBDQUFLO2FBQVQ7WUFDSSwrQkFBK0I7UUFDbkMsQ0FBQzs7O09BQUE7SUFFTSwwQ0FBUSxHQUFmLFVBQWdCLFNBQTBELEVBQUUsTUFBbUM7UUFDM0csc0NBQXNDO1FBQ3RDLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTVCLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQztZQUUvQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNkLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlFLE1BQU0sR0FBRyxNQUFNLElBQUksbUZBQWtHLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3BKO1NBQ0o7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBakNNLDZCQUFLLEdBQUcsMENBQTBDLENBQUM7SUFFbkQsK0JBQU8sR0FBRztRQUNiLGlDQUFpQztLQUNwQyxDQUFDO0lBOEJOLDhCQUFDO0NBbkNELEFBbUNDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQ3hDckUsZ0JBQWdCO0FBQ2hCO0lBQUE7SUEwQkEsQ0FBQztJQXZCRyxzQkFBSSxnREFBSzthQUFUO1lBQ0ksMkNBQXFDO1FBQ3pDLENBQUM7OztPQUFBO0lBRU0sZ0RBQVEsR0FBZixVQUFnQixTQUEwRCxFQUFFLE1BQW1DO1FBQzNHLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3JEO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDbkQ7SUFDTCxDQUFDO0lBRU8sMERBQWtCLEdBQTFCLFVBQTJCLFNBQTBELEVBQUUsTUFBbUM7UUFDdEgsT0FBTyxTQUFTLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7SUFDbEUsQ0FBQztJQUVPLHdEQUFnQixHQUF4QixVQUF5QixTQUEwRCxFQUFFLE1BQW1DO1FBQ3BILE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO0lBQ2pFLENBQUM7SUF4Qk0sbUNBQUssR0FBRyxnREFBZ0QsQ0FBQztJQXlCcEUsb0NBQUM7Q0ExQkQsQUEwQkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLDZCQUE2QixDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0FDL0JqRixnQkFBZ0I7QUFDaEI7SUFPSSx1QkFDWSxXQUF3QjtRQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUVwQyxDQUFDO0lBRU0sb0NBQVksR0FBbkIsVUFBb0IsT0FBTyxFQUFFLEtBQUs7UUFBbEMsaUJBaUJDO1FBaEJHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBQyxLQUFpQjtZQUNyRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhCLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDZixLQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNILElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO2lCQUMvQjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQztpQkFDL0I7YUFDSjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQTVCTSxtQkFBSyxHQUFHLGdDQUFnQyxDQUFDO0lBRXpDLHFCQUFPLEdBQUc7UUFDYiw4QkFBOEI7S0FDakMsQ0FBQztJQXlCTixvQkFBQztDQTlCRCxBQThCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztBQ25DakQsZ0JBQWdCO0FBQ2hCO0lBQUE7SUFnQ0EsQ0FBQztJQTdCaUIsMkJBQU8sR0FBckI7UUFDSSxPQUFPLFVBQVMsT0FBZTtZQUMzQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFaEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckMsSUFBSSxRQUFRLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUV6QixJQUFJLFFBQVEsRUFBRTtnQkFDVixNQUFNLElBQU8sS0FBSyxXQUFRLENBQUM7YUFDOUI7WUFFRCxJQUFJLEdBQUcsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksVUFBVSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFekIsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osSUFBSSxRQUFRLEVBQUU7b0JBQ1YsTUFBTSxJQUFJLEdBQUcsQ0FBQztpQkFDakI7Z0JBRUQsTUFBTSxJQUFPLEdBQUcsZ0JBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQzthQUNsRDtZQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsTUFBTSxHQUFHLE1BQU0sQ0FBQzthQUNuQjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUMsQ0FBQTtJQUNMLENBQUM7SUE5Qk0seUJBQUssR0FBRyxnQ0FBZ0MsQ0FBQztJQStCcEQsMEJBQUM7Q0FoQ0QsQUFnQ0MsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUNyQ3RFLGdCQUFnQjtBQUNoQjtJQUFBO0lBa0JBLENBQUM7SUFmaUIsdUJBQU8sR0FBckI7UUFDSSxPQUFPLFVBQVMsT0FBZTtZQUMzQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNyQyxJQUFJLGdCQUFnQixHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDM0QsSUFBSSxRQUFRLEdBQUcsS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUVwRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQzlCLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQzthQUM3QztZQUVELElBQUksWUFBWSxHQUFHLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO1lBRXBDLE9BQVUsWUFBWSxTQUFJLGdCQUFnQixHQUFHLFFBQVUsQ0FBQztRQUM1RCxDQUFDLENBQUE7SUFDTCxDQUFDO0lBaEJNLHFCQUFLLEdBQUcsNEJBQTRCLENBQUM7SUFpQmhELHNCQUFDO0NBbEJELEFBa0JDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUN2QjlELGdCQUFnQjtBQUNoQjtJQUFBO1FBR0ksYUFBUSxHQUFHO1lBQ1AsUUFBUSxFQUFFLEdBQUc7U0FDaEIsQ0FBQTtRQUVELGVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7UUFDdkMsaUJBQVksR0FBRyxtQkFBbUIsQ0FBQyxhQUFhLENBQUM7UUFFakQsYUFBUSxHQUFHLDJXQUdWLENBQUE7SUFDTCxDQUFDO0lBYlUsd0JBQUssR0FBRyxhQUFhLENBQUM7SUFhakMseUJBQUM7Q0FkRCxBQWNDLElBQUE7QUFFRCxnQkFBZ0I7QUFDaEI7SUFBQTtJQWFBLENBQUM7SUFKRyxxQ0FBTyxHQUFQO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDO0lBQ3JGLENBQUM7SUFYTSxpQ0FBYSxHQUFHLGVBQWUsQ0FBQztJQUNoQyx5QkFBSyxHQUFHLHVCQUF1QixDQUFDO0lBVzNDLDBCQUFDO0NBYkQsQUFhQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixTQUFTLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksa0JBQWtCLEVBQUUsQ0FBQztLQUM3RCxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUNwQ2hFLGdCQUFnQjtBQUNoQjtJQUFBO0lBNEJBLENBQUM7SUF6QlUsaUNBQVUsR0FBakIsVUFBa0IsS0FBVTtRQUN4QixJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUU7WUFDckIsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25FLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hGLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUM7YUFDN0M7U0FDSjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDekM7UUFFRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVNLCtCQUFRLEdBQWYsVUFBZ0IsS0FBVTtRQUN0QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUExQk0sa0JBQUssR0FBRywrQkFBK0IsQ0FBQztJQTJCbkQsbUJBQUM7Q0E1QkQsQUE0QkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7QUNqQy9DLGdCQUFnQjtBQUNoQjtJQUFBO0lBY0EsQ0FBQztJQVhVLGtEQUFjLEdBQXJCLFVBQXNCLEtBQWEsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUN6RCxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7WUFDYixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ2IsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFaTSwrQkFBSyxHQUFHLDRDQUE0QyxDQUFDO0lBYWhFLGdDQUFDO0NBZEQsQUFjQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLENBQUM7QUNuQnpFLGdCQUFnQjtBQUNoQjtJQWVFLG1DQUNVLFFBQWtDLEVBQ2xDLE1BQXNCLEVBQ3RCLFFBQWlDLEVBQ2pDLGNBQThCLEVBQzlCLG9CQUEwQyxFQUMxQyx5QkFBb0QsRUFDcEQsbUJBQXdDLEVBQ3hDLGtCQUFzQztRQVB0QyxhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUNqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQVF6QyxtQkFBYyxHQUFXLEVBQUUsQ0FBQztJQU5uQyxDQUFDO0lBcUJELDJDQUFPLEdBQVA7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsNkNBQVMsR0FBVDtRQUFBLGlCQTBCQztRQXpCQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcscURBQXFDLFVBQUMsS0FBNEIsRUFBRSxRQUFtQztZQUNwSCxLQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxpREFBbUM7WUFDaEQsS0FBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsNERBQXlDLFVBQUMsS0FBNEIsRUFBRSxhQUF3QztZQUM3SCxLQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUscURBQXFDLGFBQWEsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLDhEQUEwQztZQUN2RCxJQUFJLFlBQVksR0FBRyxLQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4RSxLQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUscURBQXFDLFlBQVksQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHFEQUFxQztZQUNsRCxLQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsNkRBQXlDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ1osS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxxREFBaUIsR0FBeEI7UUFDRSxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFNUYsSUFBSSxrQkFBa0IsRUFBRTtZQUN0QixPQUFPLGtCQUFrQixDQUFDO1NBQzNCO1FBRUQsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtZQUM3QixPQUFPLGtFQUFrRSxDQUFDO1NBQzNFO0lBQ0gsQ0FBQztJQUVNLHNEQUFrQixHQUF6QjtRQUNFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7SUFDdEMsQ0FBQztJQUVPLDhDQUFVLEdBQWxCLFVBQW1CLEtBQWlDO1FBQ2xELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6Qyw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVoQyx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU8seURBQXFCLEdBQTdCO1FBQ0UsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvRSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLDhDQUFVLEdBQWxCLFVBQW1CLEtBQWlDO1FBQ2xELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRTtZQUNwQyxLQUFpQixVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSztnQkFBakIsSUFBSSxJQUFJLGNBQUE7Z0JBQ1gsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7YUFDOUI7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVPLGdEQUFZLEdBQXBCLFVBQXFCLEtBQWlDO1FBQ3BELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRTtZQUNwQyxLQUFpQixVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSztnQkFBakIsSUFBSSxJQUFJLGNBQUE7Z0JBQ1gsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7YUFDM0M7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVPLGtEQUFjLEdBQXRCLFVBQXVCLFdBQTRDO1FBQ2pFLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFTyw2Q0FBUyxHQUFqQjtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxnREFBa0MsQ0FBQztJQUMzRCxDQUFDO0lBRU8sMENBQU0sR0FBZDtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSwwQ0FBK0IsQ0FBQztJQUN4RCxDQUFDO0lBRU8sNENBQVEsR0FBaEI7UUFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFTyx3Q0FBSSxHQUFaO1FBQUEsaUJBT0M7UUFOQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDdEMsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxLQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGdEQUFZLEdBQXBCO1FBQUEsaUJBTUM7UUFMQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNqQixPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUM7UUFDdEIsQ0FBQyxFQUFFO1lBQ0QsS0FBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sbURBQWUsR0FBdkI7UUFBQSxpQkFXQztRQVZDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztRQUMzQixJQUFNLGFBQWEsR0FBRyxNQUFJLFVBQVksQ0FBQztRQUV2QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFVBQVUsRUFBZixDQUFlLEVBQUU7WUFDeEMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTFELElBQUksS0FBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBSSxLQUFJLENBQUMsVUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hFO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBckxNLHVDQUFhLEdBQUcsZUFBZSxDQUFDO0lBQ2hDLCtCQUFLLEdBQUcsNkJBQTZCLENBQUM7SUFFdEMsaUNBQU8sR0FBRztRQUNmLFVBQVU7UUFDVixRQUFRO1FBQ1IsVUFBVTtRQUNWLGlDQUFpQztRQUNqQyx1Q0FBdUM7UUFDdkMsNENBQTRDO1FBQzVDLHNDQUFzQztRQUN0QyxxQ0FBcUM7S0FDdEMsQ0FBQztJQTBLSixnQ0FBQztDQXZMRCxBQXVMQyxJQUFBO0FBRUQsZ0JBQWdCO0FBQ2hCO0lBQUE7UUFHRSxhQUFRLEdBQUc7WUFDVCxPQUFPLEVBQUUsR0FBRztZQUNaLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEdBQUc7U0FDYixDQUFDO1FBRUYsZUFBVSxHQUFHLHlCQUF5QixDQUFDLEtBQUssQ0FBQztRQUM3QyxpQkFBWSxHQUFHLHlCQUF5QixDQUFDLGFBQWEsQ0FBQztRQUV2RCxZQUFPLEdBQUc7WUFDUixjQUFjLEVBQUUsTUFBTTtTQUN2QixDQUFDO1FBRUYsZ0JBQVcsR0FBRyw0REFBNEQsQ0FBQztJQUM3RSxDQUFDO0lBaEJRLDhCQUFLLEdBQUcsbUJBQW1CLENBQUM7SUFnQnJDLCtCQUFDO0NBakJELEFBaUJDLElBQUE7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQ2pDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUseUJBQXlCLENBQUM7S0FDdEUsU0FBUyxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxJQUFJLHdCQUF3QixFQUFFLENBQUMsQ0FBQztBQ2hON0UsMENBQTBDO0FBQzFDLGdCQUFnQjtBQUNoQjtJQUFBO0lBWUEsQ0FBQztJQVhVLFlBQUssR0FBRyx5QkFBeUIsQ0FBQztJQUVsQyxZQUFLLEdBQUc7UUFDWCxDQUFDLEVBQUUsS0FBSztRQUNSLENBQUMsRUFBRSxLQUFLO1FBQ1IsQ0FBQyxFQUFFLEtBQUs7UUFDUixDQUFDLEVBQUUsTUFBTTtRQUNULENBQUMsRUFBRSxLQUFLO1FBQ1IsQ0FBQyxFQUFFLEtBQUs7UUFDUixDQUFDLEVBQUUsS0FBSztLQUNYLENBQUE7SUFDTCxhQUFDO0NBWkQsQUFZQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUNsQjFDLGdCQUFnQjtBQUNoQjtJQUFBO0lBSUEsQ0FBQztJQUhVLGtCQUFLLEdBQUcsK0JBQStCLENBQUM7SUFFeEMsa0JBQUssR0FBRyxHQUFHLENBQUM7SUFDdkIsbUJBQUM7Q0FKRCxBQUlDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQ1R0RCx1SEFBdUg7QUFDdkgsZ0JBQWdCO0FBQ2hCO0lBUUksNkJBQ1csTUFBaUMsRUFDeEMsSUFBcUMsRUFDN0IsMkJBQXdELEVBQ3hELGNBQThCLEVBQzlCLG1CQUF3QyxFQUN4QyxZQUF5QztRQUwxQyxXQUFNLEdBQU4sTUFBTSxDQUEyQjtRQUVoQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtRQUVqRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3hFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQTFDLENBQTBDLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRU0seUNBQVcsR0FBbEIsVUFBbUIsUUFBcUQ7UUFDcEUsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0saURBQW1CLEdBQTFCLFVBQTJCLFFBQXFEO1FBQzVFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sNENBQWMsR0FBckI7UUFDSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ2hDO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELDREQUE0RDtJQUNyRCxxQ0FBTyxHQUFkO1FBQ0ksSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9ELE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxlQUFlLENBQUM7SUFDNUMsQ0FBQztJQUVELHFEQUFxRDtJQUM5Qyw2Q0FBZSxHQUF0QixVQUF1QixRQUFpQztRQUNwRCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ25DLElBQUksa0JBQWtCLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUUzQyxPQUFPLGNBQWMsSUFBSSxrQkFBa0IsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksNENBQWMsR0FBckI7UUFDSSxnSkFBZ0o7UUFDaEosSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3JEO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFFTSx5Q0FBVyxHQUFsQixVQUFtQixRQUFpQztRQUNoRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSw0Q0FBYyxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxnRUFBa0MsR0FBekM7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU0sMkNBQWEsR0FBcEI7UUFBQSxpQkFJQztRQUhHLEdBQUc7WUFDQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQyxDQUFDO1NBQy9FLFFBQVEsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7SUFDekMsQ0FBQztJQUVNLDJDQUFhLEdBQXBCLFVBQXFCLFFBQW1DO1FBQ3BELHdHQUF3RztRQUN4RyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxtREFBcUIsR0FBNUI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVNLDRDQUFjLEdBQXJCLFVBQXNCLFFBQWlDO1FBQ25ELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFL0IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELG1CQUFtQjtJQUVYLCtDQUFpQixHQUF6QixVQUEwQixZQUEwQjtRQUFwRCxpQkFZQztRQVhHLElBQU0sZUFBZTtZQUNqQix3QkFBMEIsVUFBQyxPQUFPLEVBQUUsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQXBDLENBQW9DO1lBQ2xGLG1DQUFxQyxVQUFDLE9BQU8sRUFBRSxLQUFLLElBQUssT0FBQSxLQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUEvQyxDQUErQztZQUN4RyxpQ0FBbUMsVUFBQyxPQUFPLEVBQUUsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBN0MsQ0FBNkM7WUFDcEcsc0NBQXdDLFVBQUMsT0FBTyxFQUFFLEtBQUssSUFBSyxPQUFBLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQWxELENBQWtEO1lBQzlHLHdDQUEwQyxVQUFDLE9BQU8sRUFBRSxLQUFLLElBQUssT0FBQSxLQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFwRCxDQUFvRDtZQUNsSCxxQ0FBdUMsVUFBQyxPQUFPLEVBQUUsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBakQsQ0FBaUQ7WUFDNUcscUNBQXVDLFVBQUMsT0FBTyxFQUFFLEtBQUssSUFBSyxPQUFBLEtBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQWpELENBQWlEO2VBQy9HLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7SUFDekMsQ0FBQztJQUVPLHNEQUF3QixHQUFoQyxVQUFpQyxPQUFrQyxFQUFFLEtBQWdDO1FBQ2pHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVPLHdEQUEwQixHQUFsQyxVQUFtQyxPQUFrQyxFQUFFLEtBQWdDO1FBQ25HLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMvQiw2REFBNkQ7WUFDN0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUzQixPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUNYLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztnQkFDZCxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7Z0JBQ2xCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztnQkFDZCxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7YUFDckIsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILHdCQUF3QjtZQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUVPLDZDQUFlLEdBQXZCLFVBQXdCLE9BQXNELEVBQUUsS0FBb0Q7UUFDaEksYUFBYTtJQUNqQixDQUFDO0lBRU8sMkRBQTZCLEdBQXJDLFVBQXNDLE9BQWtDLEVBQUUsS0FBZ0M7UUFDdEcsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDWCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztnQkFDbEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO2dCQUNoQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7YUFDckIsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ1QsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztnQkFDbEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNsQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7YUFDdkIsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRU8sNkRBQStCLEdBQXZDLFVBQXdDLE9BQWtDLEVBQUUsS0FBZ0M7UUFDeEcsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDWCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztnQkFDcEIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzthQUNyQixDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDVCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7Z0JBQ2QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHO2dCQUNsQixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7Z0JBQ2QsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO2FBQ3JCLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVPLDBEQUE0QixHQUFwQyxVQUFxQyxPQUFrQyxFQUFFLEtBQWdDO1FBQ3JHLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3REO2FBQU07WUFDSCxxREFBcUQ7U0FDeEQ7SUFDTCxDQUFDO0lBRU8sMERBQTRCLEdBQXBDLFVBQXFDLE9BQWtDLEVBQUUsS0FBZ0M7UUFDckcsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNILHFEQUFxRDtTQUN4RDtJQUNMLENBQUM7SUFFRCx1QkFBdUI7SUFDZixzREFBd0IsR0FBaEMsVUFBaUMsUUFBbUM7UUFBcEUsaUJBZUM7UUFkRyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRS9CLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QixJQUFJLHFCQUFxQixHQUFHLEVBQUUsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFFN0QsSUFBSSxxQkFBcUIsRUFBRTtvQkFDdkIsSUFBSSxZQUFZLEdBQUcsS0FBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ2xGLElBQUksY0FBYyxHQUFHLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUQsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDaEM7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGlEQUFtQixHQUEzQjtRQUNJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBRWhDLHdCQUF3QjtRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFakMsSUFBSSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7WUFFOUQsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUN4QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRW5GLE9BQU8sZ0VBQTBFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2hIO1NBQ0o7SUFDTCxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQXBQQSxBQW9QQyxJQUFBO0FDdFBELGdCQUFnQjtBQUNoQjtJQVdJLG9DQUNZLE1BQWMsRUFDZCwyQkFBd0QsRUFDeEQsY0FBOEIsRUFDOUIsbUJBQXdDLEVBQ3hDLFlBQXlDO1FBSnpDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtJQUVyRCxDQUFDO0lBRU0sK0NBQVUsR0FBakIsVUFBa0IsTUFBbUMsRUFBRSxHQUFXLEVBQUUsU0FBMEQ7UUFDMUgsSUFBSSxNQUF5QyxDQUFDO1FBRTlDLElBQUksT0FBTyxHQUFpRCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUU5RixNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFOUQsT0FBTyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2SixDQUFDO0lBM0JNLGdDQUFLLEdBQUcsOEJBQThCLENBQUM7SUFFdkMsa0NBQU8sR0FBRztRQUNiLHlCQUF5QjtRQUN6Qiw4Q0FBOEM7UUFDOUMsaUNBQWlDO1FBQ2pDLHNDQUFzQztRQUN0QywrQkFBK0I7S0FDbEMsQ0FBQztJQW9CTixpQ0FBQztDQTdCRCxBQTZCQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsMEJBQTBCLENBQUMsS0FBSyxFQUFFLDBCQUEwQixDQUFDLENBQUM7QUNsQzNFLDBIQUEwSDtBQUMxSCxnQkFBZ0I7QUFDaEI7SUFhSSw4QkFDWSxNQUFpQyxFQUN6QyxRQUFxRCxFQUM3QyxrQkFBc0M7UUFGdEMsV0FBTSxHQUFOLE1BQU0sQ0FBMkI7UUFFakMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUU5QyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3BGLENBQUM7SUFFRCxzQkFBSSwwQ0FBUTthQUFaO1lBQ0ksT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFFTSxxQ0FBTSxHQUFiLFVBQWMsS0FBOEI7UUFDeEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sNkNBQWMsR0FBckIsVUFBc0IsS0FBOEI7UUFDaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDdEMsQ0FBQztJQUVNLHFDQUFNLEdBQWIsVUFBYyxlQUE0RDtRQUN0RSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyRCxJQUFJLFlBQVksSUFBSSxVQUFVLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTSx3Q0FBUyxHQUFoQixVQUFpQixVQUFrQjtRQUMvQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLDBDQUFXLEdBQWxCLFVBQW1CLFlBQW9CO1FBQ25DLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVPLDJDQUFZLEdBQXBCLFVBQXFCLFVBQWtCO1FBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssVUFBVSxDQUFDO1FBQ3RDLElBQUksbUJBQW1CLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzdELElBQUksNEJBQTRCLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWhFLE9BQU8sT0FBTyxJQUFJLG1CQUFtQixJQUFJLDRCQUE0QixDQUFDO0lBQzFFLENBQUM7SUFFTyw2Q0FBYyxHQUF0QixVQUF1QixZQUFvQjtRQUN2QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFlBQVksQ0FBQztRQUMxQyxJQUFJLDZCQUE2QixHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hILElBQUksb0JBQW9CLEdBQUcsWUFBWSxJQUFJLENBQUMsQ0FBQztRQUU3QyxPQUFPLE9BQU8sSUFBSSw2QkFBNkIsSUFBSSxvQkFBb0IsQ0FBQztJQUM1RSxDQUFDO0lBQ0wsMkJBQUM7QUFBRCxDQS9FQSxBQStFQyxJQUFBO0FDakZELGdCQUFnQjtBQUNoQjtJQU9JLHFDQUNZLGtCQUFzQztRQUF0Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO0lBRWxELENBQUM7SUFFTSxpREFBVyxHQUFsQixVQUFtQixNQUFtQyxFQUFFLFFBQXVEO1FBQzNHLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFiTSxpQ0FBSyxHQUFHLCtCQUErQixDQUFDO0lBRXhDLG1DQUFPLEdBQUc7UUFDYixxQ0FBcUM7S0FDeEMsQ0FBQztJQVVOLGtDQUFDO0NBZkQsQUFlQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUM1QixPQUFPLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLDJCQUEyQixDQUFDLENBQUM7QUNwQjdFLGdCQUFnQjtBQUNoQjtJQXVCRSw4QkFDVSxRQUFrQyxFQUNsQyxVQUFxQyxFQUNyQyxNQUFzQixFQUN0QixXQUF3QjtRQUh4QixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUEyQjtRQUNyQyxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUVsQyxDQUFDO0lBRUQsc0JBQUksaURBQWU7YUFBbkI7WUFDRSxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDO1FBQzNFLENBQUM7OztPQUFBO0lBRU8saURBQWtCLEdBQTFCO1FBQ0UsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFTSx1Q0FBUSxHQUFmO1FBQ0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sbUNBQUksR0FBWCxVQUFZLEtBQWE7UUFDdkIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNuQixHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUc7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLEdBQUcsRUFBRSxNQUFNO1lBQ1gsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO1NBQ2hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxzQ0FBTyxHQUFkO1FBQ0UsdUlBQXVJO1FBQ3ZJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxnREFBa0MsQ0FBQztRQUU3RCwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN6QyxPQUFPO1NBQ1I7UUFFRCxrREFBa0Q7UUFDbEQsSUFBSSxPQUFPLEdBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFFakYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRWhDLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEM7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFFTSx3Q0FBUyxHQUFoQjtRQUNFLGtEQUFrRDtRQUNsRCxJQUFJLE9BQU8sR0FBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztRQUVqRixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFaEMsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QzthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQUVNLDBDQUFXLEdBQWxCLFVBQW1CLEtBQWE7UUFDOUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztRQUVoRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRU0sd0NBQVMsR0FBaEIsVUFBaUIsS0FBYTtRQUM1QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBRTVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFTSx3Q0FBUyxHQUFoQjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUM7WUFDNUMsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLHFEQUFxQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRU0sMENBQVcsR0FBbEI7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzdDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDckQsQ0FBQztJQWhJTSwwQkFBSyxHQUFHLHNCQUFzQixDQUFDO0lBQy9CLGtDQUFhLEdBQUcsZ0JBQWdCLENBQUM7SUFFakMsNEJBQU8sR0FBRztRQUNmLFVBQVU7UUFDVixZQUFZO1FBQ1osUUFBUTtRQUNSLDhCQUE4QjtLQUMvQixDQUFDO0lBeUhKLDJCQUFDO0NBbElELEFBa0lDLElBQUE7QUFFRCxnQkFBZ0I7QUFDaEI7SUFBQTtRQUdFLGFBQVEsR0FBRztZQUNULE1BQU0sRUFBRSxHQUFHO1lBQ1gsWUFBWSxFQUFFLEdBQUc7WUFDakIsSUFBSSxFQUFFLEdBQUc7WUFDVCxRQUFRLEVBQUUsVUFBVTtZQUNwQixZQUFZLEVBQUUsR0FBRztZQUNqQixRQUFRLEVBQUUsR0FBRztTQUNkLENBQUM7UUFFRixlQUFVLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1FBQ3hDLGlCQUFZLEdBQUcsb0JBQW9CLENBQUMsYUFBYSxDQUFDO1FBRWxELFlBQU8sR0FBRztZQUNSLFdBQVcsRUFBRSxTQUFTO1NBQ3ZCLENBQUM7UUFFRixnQkFBVyxHQUFHLGtEQUFrRCxDQUFDO0lBQ25FLENBQUM7SUFuQlEseUJBQUssR0FBRyxjQUFjLENBQUM7SUFtQmhDLDBCQUFDO0NBcEJELEFBb0JDLElBQUE7QUFFRCxPQUFPO0tBQ0osTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7S0FDNUQsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQztBQy9KbkUsZ0JBQWdCO0FBQ2hCO0lBS0kscUJBQ1ksVUFBcUM7UUFBckMsZUFBVSxHQUFWLFVBQVUsQ0FBMkI7UUFJekMsYUFBUSxHQUFXLGdCQUFnQixDQUFDO0lBRjVDLENBQUM7SUFJTyw0Q0FBc0IsR0FBOUI7UUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsOENBQWlDLENBQUM7SUFDaEUsQ0FBQztJQUVPLDZDQUF1QixHQUEvQjtRQUNJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxnREFBa0MsQ0FBQztJQUNqRSxDQUFDO0lBRU8seUNBQW1CLEdBQTNCLFVBQTRCLE9BQVk7UUFDcEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU8sb0NBQWMsR0FBdEIsVUFBdUIsU0FBYztRQUNqQyxPQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyxrQ0FBWSxHQUFwQixVQUFxQixPQUFZLEVBQUUsS0FBYTtRQUM3QyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3BELENBQUM7SUFFTSwrQkFBUyxHQUFoQixVQUFpQixPQUFZO1FBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSw0QkFBTSxHQUFiLFVBQWMsT0FBWTtRQUN0Qiw2REFBNkQ7UUFDN0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRXBELDRCQUE0QjtRQUM1QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxpQ0FBVyxHQUFsQixVQUFtQixPQUFZLEVBQUUsS0FBNEIsRUFBRSxJQUFTO1FBQ3BFLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVqQixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBRXpDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLFFBQVEsR0FBRyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBRS9DLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsV0FBVyxDQUFDO1FBRXhDLElBQUksbUJBQW1CLEdBQUcsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUNsRCxJQUFJLHdCQUF3QixHQUFHLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBRTVFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRTNELHlDQUF5QztRQUN6QyxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBRS9DLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxrQ0FBWSxHQUFuQixVQUFvQixPQUFZLEVBQUUsS0FBaUIsRUFBRSxLQUFhO1FBQzlELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0gsSUFBSSxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQW5GTSxpQkFBSyxHQUFHLDhCQUE4QixDQUFDO0lBRXZDLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQWtGcEMsa0JBQUM7Q0FyRkQsQUFxRkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWydici53ZWVrbHlTY2hlZHVsZXInXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRxJywgJyRzY29wZScsICckdGltZW91dCcsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkcTogYW5ndWxhci5JUVNlcnZpY2UsICRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBidXR0b25DbGFzc2VzOiBbJ3dvdyEnXSxcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERlbW9JdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uIChzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiAkcS53aGVuKHNjaGVkdWxlKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBpbnRlcnZhbDogMSxcclxuICAgICAgICAgIG1pbmltdW1TZXBhcmF0aW9uOiA1LFxyXG4gICAgICAgICAgb25DaGFuZ2U6IChpc1ZhbGlkKSA9PiB7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgbWF4VGltZVNsb3Q6ICh2YWx1ZSkgPT4gYFNsb3RzIGNhbm5vdCBiZSBsb25nZXIgdGhhbiAke3ZhbHVlfSFgXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgc2NoZWR1bGVDb3VudE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY291bnQ6IDIsXHJcbiAgICAgICAgICAgIGV4YWN0OiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PlxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyID0gYW5ndWxhci5jb3B5KCRzY29wZS5tb2RlbCk7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5pbnRlcnZhbCA9IDE1O1xyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMubWF4VGltZVNsb3QgPSA5MDA7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMuc2F2ZVNjaGVkdWxlciA9ICgpID0+IHtcclxuICAgICAgICAkc2NvcGUuYWRhcHRlclR3b1Jlc3VsdCA9ICRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCk7XHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsLm9wdGlvbnMubnVsbEVuZHMgPSB0cnVlO1xyXG5cclxuICAgICAgJHNjb3BlLmFkYXB0ZXIgPSBuZXcgRGVtb0FkYXB0ZXIoW1xyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAxMzgwLFxyXG4gICAgICAgIC8vICAgZW5kOiBudWxsLFxyXG4gICAgICAgIC8vICAgdmFsdWU6IHRydWVcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA3MjAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuV2VkbmVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDMwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgXSk7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlclR3byA9IG5ldyBEZW1vQWRhcHRlcihbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICBlZGl0YWJsZTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDkwMCxcclxuICAgICAgICAgIGVuZDogMTIwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5Nb25kYXksXHJcbiAgICAgICAgICBzdGFydDogOTAwLFxyXG4gICAgICAgICAgZW5kOiAxMjAwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVHVlc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDkwMCxcclxuICAgICAgICAgIGVuZDogMTIwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogOTAwLFxyXG4gICAgICAgICAgZW5kOiAxMjAwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVGh1cnNkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNzIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVGh1cnNkYXksXHJcbiAgICAgICAgICBzdGFydDogOTAwLFxyXG4gICAgICAgICAgZW5kOiAxMjAwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDcyMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAgIHN0YXJ0OiA5MDAsXHJcbiAgICAgICAgICBlbmQ6IDEyMDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA5MDAsXHJcbiAgICAgICAgICBlbmQ6IDEyMDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgXSk7XHJcbiAgICAgIFxyXG4gICAgICAkc2NvcGUuc2F2ZUFsbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkc2NvcGUucmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmFkYXB0ZXIuZ2V0U25hcHNob3QoKSkgKyBKU09OLnN0cmluZ2lmeSgkc2NvcGUuYWRhcHRlclR3by5nZXRTbmFwc2hvdCgpKTtcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vSXRlbSBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxib29sZWFuPiB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cyxcclxuICAgIHB1YmxpYyBzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj5bXVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgZ2V0IGVkaXRhYmxlKCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogVGhlIGRhdGEgaXMgYWxyZWFkeSBpbiBhbiBhY2NlcHRhYmxlIGZvcm1hdCBmb3IgdGhlIGRlbW8gc28ganVzdCBwYXNzIGl0IHRocm91Z2ggKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vQWRhcHRlciBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+LCBib29sZWFuPiB7XHJcbiAgcHVibGljIGl0ZW1zOiBEZW1vSXRlbVtdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGluaXRpYWxEYXRhOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+W10sXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U25hcHNob3QoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgIHJldHVybiBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UocmFuZ2UpIHtcclxuICAgIHJldHVybiByYW5nZTtcclxuICB9XHJcbn1cclxuIiwiYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQWRhcHRlclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQWRhcHRlclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBncm91cFNlcnZpY2U6IEdyb3VwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SXRlbXNGcm9tQWRhcHRlcihjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgYWRhcHRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55Pikge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKGFkYXB0ZXIpIHtcclxuICAgICAgICAgIGxldCBzY2hlZHVsZXMgPSBhZGFwdGVyLmluaXRpYWxEYXRhLm1hcChkYXRhID0+IGFkYXB0ZXIuY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGRhdGEpKTtcclxuICAgICAgICAgIGxldCBncm91cGVkU2NoZWR1bGVzID0gdGhpcy5ncm91cFNlcnZpY2UuZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuICAgIFxyXG4gICAgICAgICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWRTY2hlZHVsZXMpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1GYWN0b3J5LmNyZWF0ZUl0ZW0oY29uZmlnLCBwYXJzZUludChrZXksIDEwKSwgZ3JvdXBlZFNjaGVkdWxlc1trZXldKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQWRhcHRlclNlcnZpY2UuJG5hbWUsIEFkYXB0ZXJTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBDb25maWd1cmF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGdldENvbmZpZ3VyYXRpb24ob3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICAgICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgICAgICB2YXIgbWludXRlc0luRGF5ID0gaG91cnNJbkRheSAqIDYwO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0gdGhpcy5nZXREZWZhdWx0T3B0aW9ucygpO1xyXG5cclxuICAgICAgICB2YXIgdXNlck9wdGlvbnMgPSBhbmd1bGFyLm1lcmdlKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKHVzZXJPcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICAgICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdE9wdGlvbnMoKTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgICAgICAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBvbkNoYW5nZTogKCkgPT4gYW5ndWxhci5ub29wKCksXHJcbiAgICAgICAgICAgIG9uUmVtb3ZlOiAoKSA9PiBhbmd1bGFyLm5vb3AoKSxcclxuICAgICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHt2YWx1ZX1gLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bVNlcGFyYXRpb246ICh2YWx1ZSkgPT4gYFNsb3RzIG11c3QgYmUgYXQgbGVhc3QgJHt2YWx1ZX0gYXBhcnQhYCxcclxuICAgICAgICAgICAgICAgIGZ1bGxDYWxlbmRhcjogJ0ZvciB0aGlzIGNhbGVuZGFyLCBldmVyeSBkYXkgbXVzdCBiZSBjb21wbGV0ZWx5IGZ1bGwgb2Ygc2NoZWR1bGVzLicsXHJcbiAgICAgICAgICAgICAgICBtb25vU2NoZWR1bGU6ICdUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgb25lIHRpbWUgc2xvdCBwZXIgZGF5JyxcclxuICAgICAgICAgICAgICAgIG51bGxFbmRzOiAnSXRlbXMgaW4gdGhpcyBjYWxlbmRhciBkbyBub3QgaGF2ZSBlbmQgdGltZXMuIFNjaGVkdWxlZCBldmVudHMgYmVnaW4gYXQgdGhlIHN0YXJ0IHRpbWUgYW5kIGVuZCB3aGVuIHRoZXkgYXJlIGZpbmlzaGVkLicsXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZUNvdW50OiAob3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwbHVyYWxpemVkU2xvdCA9ICdzbG90JyArIChvcHRpb25zLmNvdW50ID09PSAxID8gJycgOiAncycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5leGFjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFRoaXMgY2FsZW5kYXIgbXVzdCBoYXZlIGV4YWN0bHkgJHtvcHRpb25zLmNvdW50fSAke3BsdXJhbGl6ZWRTbG90fSBwZXIgZGF5YDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFRoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBhIG1heGltdW0gb2YgJHtvcHRpb25zLmNvdW50fSAke3BsdXJhbGl6ZWRTbG90fSBwZXIgZGF5YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjaGVkdWxlQ291bnRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjb3VudDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKENvbmZpZ3VyYXRpb25TZXJ2aWNlLiRuYW1lLCBDb25maWd1cmF0aW9uU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29uZmxpY3RpbmdPcHRpb25zKG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+KSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZnVsbENhbGVuZGFyICYmIG9wdGlvbnMuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBPcHRpb25zICdmdWxsQ2FsZW5kYXInICYgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLmA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCAmJiAhYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgSWYgdXNpbmcgb3B0aW9uICdmaWxsRW1wdHlXaXRoRGVmYXVsdCcsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSAnZGVmYXVsdFZhbHVlLidgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZS4kbmFtZSwgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRHJhZ1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREcmFnUmFuZ2VGcm9tU2NoZWR1bGUoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGNvbmZpZy5udWxsRW5kcyA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHNjaGVkdWxlLmVuZCksXHJcbiAgICAgICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRHJhZ1NlcnZpY2UuJG5hbWUsIERyYWdTZXJ2aWNlKTtcclxuIiwiLyoqXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb25cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgalF1ZXJ5IHRvIGtlZXAgZGVwZW5kZW5jaWVzIG1pbmltYWxcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEVsZW1lbnRPZmZzZXRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgbGVmdCgkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJpZ2h0KCRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbGVtZW50T2Zmc2V0U2VydmljZS4kbmFtZSwgRWxlbWVudE9mZnNldFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEVuZEFkanVzdGVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JNb2RlbChjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSBjb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbmRBZGp1c3RlclNlcnZpY2UuJG5hbWUsIEVuZEFkanVzdGVyU2VydmljZSk7XHJcbiIsIi8qKiBXaGVuIHVzaW5nIHRoZSAnZmlsbEVtcHR5V2l0aERlZmF1bHQnIG9wdGlvbiwgdGhpcyBzZXJ2aWNlIHdpbGwgYmUgdXNlZCB0byBjb25zdHJ1Y3QgdGhlIGNvcnJlY3QgY2FsZW5kYXIgZm9yIHNlcnZlciBzdWJtaXNzaW9uICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBmaWxsKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10ge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgaWYgKCFzY2hlZHVsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbdGhpcy5nZXRFbXB0eVNjaGVkdWxlKGl0ZW0sIGNvbmZpZyldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzKHNjaGVkdWxlcywgY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEVtcHR5U2NoZWR1bGUoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBpdGVtLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RW5kU2NoZWR1bGUobGFzdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBsYXN0U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogbGFzdFNjaGVkdWxlLmVuZCxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbChjb25maWcsIGNvbmZpZy5tYXhWYWx1ZSksXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0YXJ0U2NoZWR1bGUoZmlyc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogZmlyc3RTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgICBlbmQ6IGZpcnN0U2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXNGb3JTaW5nbGVTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gW3NjaGVkdWxlXTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlVG91Y2hlc1N0YXJ0KHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0U3RhcnRTY2hlZHVsZShzY2hlZHVsZSwgY29uZmlnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0RW5kU2NoZWR1bGUoc2NoZWR1bGUsIGNvbmZpZykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXMoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgc2NoZWR1bGVzID0gdGhpcy5nZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGVzWzBdLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIgYXQgYSB0aW1lXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNjaGVkdWxlID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dFNjaGVkdWxlID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc0ZpcnN0TG9vcCA9IGkgPT0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0ZpcnN0TG9vcCAmJiAhdGhpcy5zY2hlZHVsZVRvdWNoZXNTdGFydChjdXJyZW50U2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydFNjaGVkdWxlID0gdGhpcy5nZXRTdGFydFNjaGVkdWxlKGN1cnJlbnRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChzdGFydFNjaGVkdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlc1RvdWNoKGN1cnJlbnRTY2hlZHVsZSwgbmV4dFNjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1NjaGVkdWxlID0gdGhpcy5nZXROZXdTY2hlZHVsZShjdXJyZW50U2NoZWR1bGUsIG5leHRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0xhc3RMb29wID0gaSA9PSBsZW4gLSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTGFzdExvb3AgJiYgIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKG5leHRTY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZFNjaGVkdWxlID0gdGhpcy5nZXRFbmRTY2hlZHVsZShuZXh0U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2goZW5kU2NoZWR1bGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV3U2NoZWR1bGUoY3VycmVudFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBuZXh0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGN1cnJlbnRTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50U2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgICBlbmQ6IG5leHRTY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydCAtIGIuc3RhcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVzVG91Y2goZWFybGllclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBsYXRlclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIGVhcmxpZXJTY2hlZHVsZS5lbmQgPT09IGxhdGVyU2NoZWR1bGUuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVRvdWNoZXNTdGFydChzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUuc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZS5lbmQgPT09IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKGNvbmZpZywgY29uZmlnLm1heFZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS4kbmFtZSwgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyRnVsbENhbGVuZGFyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ickZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bGxDYWxlbmRhckRpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoRnVsbENhbGVuZGFyRGlyZWN0aXZlLiRuYW1lLCBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3RDb250cm9sbGVyJztcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ2dob3N0U2xvdEN0cmwnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG11bHRpU2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyR2hvc3RTbG90JztcclxuXHJcbiAgICBjb250cm9sbGVyID0gR2hvc3RTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IEdob3N0U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIG11bHRpU2xpZGVyQ3RybDogJ15ick11bHRpU2xpZGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8bmctdHJhbnNjbHVkZSBjbGFzcz1cImZ1bGxXaWR0aFwiPjwvbmctdHJhbnNjbHVkZT5cclxuICAgIGA7XHJcblxyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbn1cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWUsIEdob3N0U2xvdENvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KEdob3N0U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IEdob3N0U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnLFxyXG4gICAgaW1tZWRpYXRlOiAnPCdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciBtb3VzZVRyYWNrZXJTZXJ2aWNlID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlO1xyXG4gICAgdmFyIHRvdWNoU2VydmljZSA9IHRoaXMudG91Y2hTZXJ2aWNlO1xyXG4gICAgdmFyIHggPSAwO1xyXG5cclxuICAgIGxldCBtb3VzZWRvd25FdmVudDogc3RyaW5nID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0JztcclxuICAgIGxldCBtb3VzZW1vdmVFdmVudDogc3RyaW5nID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUnO1xyXG4gICAgbGV0IG1vdXNldXBFdmVudDogc3RyaW5nID0gJ21vdXNldXAgdG91Y2hlbmQnO1xyXG5cclxuICAgIGVsZW1lbnQub24obW91c2Vkb3duRXZlbnQsIG1vdXNlZG93bik7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vkb3duKGV2ZW50KSB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBoYW5kbGVycyBmcm9tIGJlaW5nIGZpcmVkIGlmIHRoZXkgYXJlIG5lc3RlZCAob25seSB0aGUgb25lIHlvdSBkaXJlY3RseSBpbnRlcmFjdGVkIHdpdGggc2hvdWxkIGZpcmUpXHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmFrZU1vdXNlZG93bigpIHtcclxuICAgICAgeCA9IG1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpLng7XHJcblxyXG4gICAgICBzdGFydERyYWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYWdlWChldmVudCkge1xyXG4gICAgICByZXR1cm4gZXZlbnQucGFnZVggfHwgdG91Y2hTZXJ2aWNlLmdldFBhZ2VYKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0RHJhZygpIHtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNlbW92ZUV2ZW50LCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24obW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5QXN5bmMoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2NvcGUuaW1tZWRpYXRlKSB7XHJcbiAgICAgIGZha2VNb3VzZWRvd24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZSxcclxuICAgIHByaXZhdGUgbW91c2VUcmFja2VyU2VydmljZTogTW91c2VUcmFja2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdG91Y2hTZXJ2aWNlOiBUb3VjaFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCcsICdicldlZWtseVNjaGVkdWxlck1vdXNlVHJhY2tlclNlcnZpY2UnLCAnYnJXZWVrbHlTY2hlZHVsZXJUb3VjaFNlcnZpY2UnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JySG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ15icldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBTdHJpcGUgaXQgYnkgaG91clxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IDYwIC8gY29uZmlnLmludGVydmFsO1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWxQZXJjZW50YWdlID0gMTAwIC8gbnVtSW50ZXJ2YWxzSW5UaWNrO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1JbnRlcnZhbHNJblRpY2s7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyYW5kQ2hpbGQgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBMYXN0R2hvc3REYXlTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckxhc3RHaG9zdERheVNlcnZpY2UnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBkcmFnZ2luZyBnaG9zdHMgYWNyb3NzIG11bHRpcGxlIGRheXMsIGlmIHRoZSB1c2VyIG1vdmVzIHRoZSBtb3VzZSBwb2ludGVyIG91dCBvZiBvbmUgZXh0cmVtZSBhbmQgYmFjayBpbnRvIHRoZSBsYXN0IHNsb3QgdGhhdCByZW5kZXJlZCBhIGdob3N0LFxyXG4gICAgICogV2Ugc2hvdWxkIHJlbW92ZSB0aGUgZ2hvc3QgZnJvbSB0aGF0IGV4dHJlbWUuIFRoaXMgd2lsbCBoZWxwIGdyYWIgdGhlIGNvcnJlY3QgZGF5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRMYXN0R2hvc3REYXkoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICAgICAgbGV0IG9yaWdpbkluZGV4ID0gdGhpcy5nZXRPcmlnaW5JbmRleChpdGVtcyk7XHJcbiAgICAgICAgbGV0IHJlbmRlcmVkR2hvc3RJbmRpY2VzID0gdGhpcy5nZXRSZW5kZXJlZEdob3N0SW5kaWNlcyhpdGVtcyk7XHJcblxyXG4gICAgICAgIC8vIGRldGVybWluZSBpZiB0aGUgb3RoZXIgJHJlbmRlckdob3N0IGl0ZW1zIGFyZSBhYm92ZSBvciBiZWxvdyB0aGUgJGlzR2hvc3RPcmlnaW4gaXRlbVxyXG4gICAgICAgIGxldCBhYm92ZSA9IHJlbmRlcmVkR2hvc3RJbmRpY2VzLmV2ZXJ5KGkgPT4gaSA8PSBvcmlnaW5JbmRleCk7XHJcblxyXG4gICAgICAgIC8vIHRha2UgZmlyc3QgaXRlbSBmb3IgYWJvdmUgb3IgbGFzdCBpdGVtIGZvciBiZWxvd1xyXG4gICAgICAgIGxldCBsYXN0R2hvc3REYXlJbmRleCA9IGFib3ZlID8gMCA6IHJlbmRlcmVkR2hvc3RJbmRpY2VzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIHJldHVybiByZW5kZXJlZEdob3N0SW5kaWNlc1tsYXN0R2hvc3REYXlJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEdldCB0aGUgaW5kZXggb2YgdGhlICRpc0dob3N0T3JpZ2luIGl0ZW0gKi9cclxuICAgIHByaXZhdGUgZ2V0T3JpZ2luSW5kZXgoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICAgICAgbGV0IG9yaWdpbkluZGV4O1xyXG4gICAgICAgIGxldCBsZW4gPSBpdGVtcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gaXRlbXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0uJGlzR2hvc3RPcmlnaW4pIHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbkluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3JpZ2luSW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEdldCBhbGwgb2YgdGhlIGl0ZW0gaW5kaWNlcyB0aGF0IGN1cnJlbnRseSBoYXZlIGdob3N0cyByZW5kZXJlZCAqL1xyXG4gICAgcHJpdmF0ZSBnZXRSZW5kZXJlZEdob3N0SW5kaWNlcyhpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVuZGVyZWRHaG9zdEluZGljZXMgPSBbXTtcclxuICAgICAgICBsZXQgbGVuID0gaXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyZWRHaG9zdEluZGljZXMucHVzaChpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVkR2hvc3RJbmRpY2VzO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTGFzdEdob3N0RGF5U2VydmljZS4kbmFtZSwgTGFzdEdob3N0RGF5U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3REaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTWF4VGltZVNsb3QnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoYXR0cnMuYnJNYXhUaW1lU2xvdCkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1heFRpbWVTbG90RGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKE1heFRpbWVTbG90RGlyZWN0aXZlLiRuYW1lLCBNYXhUaW1lU2xvdERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJNaW5pbXVtU2VwYXJhdGlvbic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IE1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ick1pbmltdW1TZXBhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWluaW11bVNlcGFyYXRpb25EaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoTWluaW11bVNlcGFyYXRpb25EaXJlY3RpdmUuJG5hbWUsIE1pbmltdW1TZXBhcmF0aW9uRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWlzc2luZ0RheXNTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pc3NpbmdEYXlzU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGRheU1hcDogRGF5TWFwLFxyXG4gICAgICAgIHByaXZhdGUgaXRlbUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzY2hlZHVsZXIgc2hvdWxkIGFsd2F5cyBzaG93IGFsbCBkYXlzLCBldmVuIGlmIGl0IHdhcyBub3QgcGFzc2VkIGFueSBzY2hlZHVsZXMgZm9yIHRoYXQgZGF5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaWxsSXRlbXMoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmRheU1hcCwgKGRheTogc3RyaW5nLCBzdHJpbmdLZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgbGV0IGtleSA9IHBhcnNlSW50KHN0cmluZ0tleSwgMTApO1xyXG4gICAgICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgICAgIGxldCBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCA/IGZpbHRlcmVkSXRlbXNbMF0gOiBudWxsO1xyXG4gICAgXHJcbiAgICAgICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5pdGVtRmFjdG9yeS5jcmVhdGVJdGVtKGNvbmZpZywga2V5LCBbXSkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZW0gRElEIGV4aXN0IGp1c3Qgc2V0IHRoZSBsYWJlbFxyXG4gICAgICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG4gICAgXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWlzc2luZ0RheXNTZXJ2aWNlLiRuYW1lLCBNaXNzaW5nRGF5c1NlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1vbm9TY2hlZHVsZURpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJNb25vU2NoZWR1bGUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyTW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTW9ub1NjaGVkdWxlRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShNb25vU2NoZWR1bGVEaXJlY3RpdmUuJG5hbWUsIE1vbm9TY2hlZHVsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb3VzZVRyYWNrZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1vdXNlVHJhY2tlclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckZG9jdW1lbnQnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbW91c2VQb3NpdGlvbjogSVBvaW50O1xyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9ICdtb3VzZW1vdmUgdG91Y2htb3ZlJztcclxuXHJcbiAgICAgICAgbGV0IGV2ZW50ID0gdGhpcy5zZXRNb3VzZVBvc2l0aW9uLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuJGRvY3VtZW50LnVuYmluZChldmVudE5hbWUsIGV2ZW50KTtcclxuICAgICAgICB0aGlzLiRkb2N1bWVudC5vbihldmVudE5hbWUsIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TW91c2VQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0TW91c2VQb3NpdGlvbihldmVudCkge1xyXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbiA9IHsgeDogZXZlbnQucGFnZVgsIHk6IGV2ZW50LnBhZ2VZIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb3VzZVRyYWNrZXJTZXJ2aWNlLiRuYW1lLCBNb3VzZVRyYWNrZXJTZXJ2aWNlKVxyXG4gICAgLnJ1bihbTW91c2VUcmFja2VyU2VydmljZS4kbmFtZSwgKG1vdXNlVHJhY2tlclNlcnZpY2U6IE1vdXNlVHJhY2tlclNlcnZpY2UpID0+IHtcclxuICAgICAgICBtb3VzZVRyYWNrZXJTZXJ2aWNlLmluaXRpYWxpemUoKTtcclxuICAgIH1dKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlckNvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ211bHRpU2xpZGVyQ3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJNb3VzZVRyYWNrZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBlbGVtZW50T2Zmc2V0U2VydmljZTogRWxlbWVudE9mZnNldFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtb3VzZVRyYWNrZXJTZXJ2aWNlOiBNb3VzZVRyYWNrZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlcixcclxuICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnksXHJcbiAgICBwcml2YXRlIHZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2U6IFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYWdTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuICBwcml2YXRlIHBlbmRpbmdTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBzdGFydGluZ0dob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH07XHJcbiAgcHJpdmF0ZSBzZXRHaG9zdFZhbHVlczogKG9wdGlvbnM6IHsgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH0gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcbiAgXHJcbiAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG5cclxuICBwcml2YXRlIGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZW50ZXInLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMub25Nb3VzZUVudGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9uTW91c2VMZWF2ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgIHRoaXMub25Nb3VzZVVwKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNPTU1JVF9HSE9TVCwgKGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgaWYgKHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgICB0aGlzLmNvbW1pdEdob3N0KGdob3N0U2NoZWR1bGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9HSE9TVCwgKGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRheTogbnVtYmVyKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pdGVtLiRpc0dob3N0T3JpZ2luICYmIHRoaXMuaXRlbS5kYXkgPT09IGRheSkge1xyXG4gICAgICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfQUxMX0dIT1NUUywgKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW0uJHJlbmRlckdob3N0ID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZUVudGVyKCkge1xyXG4gICAgLy8gSWYgdGhlIGN1cnNvciBpcyBtb3ZpbmcgQkFDSyBpbnRvIGFuIGl0ZW0gdGhhdCBBTFJFQURZIGhhcyBhIGdob3N0IHJlbmRlcmVkLCB3ZSdsbCB3YW50IHRvIHJlbW92ZSB0aGUgZ2hvc3QgZnJvbSB0aGUgaXRlbSB0aGF0IHdhcyBsZWZ0XHJcbiAgICBpZiAodGhpcy5pdGVtLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0xBU1RfR0hPU1QpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmRyYWdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLmFkZERyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdob3N0VmFsdWVzICYmICF0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlR2hvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZUxlYXZlKCkge1xyXG4gICAgaWYgKHRoaXMuZHJhZ1NjaGVkdWxlKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlRHJhZ1NjaGVkdWxlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VVcCgpIHtcclxuICAgIGlmICh0aGlzLnBlbmRpbmdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLmNvbW1pdERyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGREcmFnU2NoZWR1bGUoKSB7XHJcbiAgICB0aGlzLmRyYWdTY2hlZHVsZS5kYXkgPSB0aGlzLml0ZW0uZGF5O1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSB0aGlzLml0ZW0uYWRkU2NoZWR1bGUodGhpcy5kcmFnU2NoZWR1bGUpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgdGhpcy5pdGVtLnJlbW92ZVNjaGVkdWxlKHRoaXMuZHJhZ1NjaGVkdWxlKTtcclxuICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICB0aGlzLnBlbmRpbmdTY2hlZHVsZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbW1pdERyYWdTY2hlZHVsZSgpIHtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnBlbmRpbmdTY2hlZHVsZSk7XHJcbiAgICB0aGlzLnBlbmRpbmdTY2hlZHVsZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNjaGVkdWxlRm9yQWRkKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICBzdGFydCA9IHRoaXMudmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS5ub3JtYWxpemVWYWx1ZShzdGFydCwgMCwgZW5kKTtcclxuICAgIGVuZCA9IHRoaXMudmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS5ub3JtYWxpemVWYWx1ZShlbmQsIHN0YXJ0LCB0aGlzLmNvbmZpZy5tYXhWYWx1ZSk7XHJcblxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIGVuZCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlID0ge1xyXG4gICAgICBkYXk6IHRoaXMuaXRlbS5kYXksXHJcbiAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgZW5kOiBlbmQsXHJcbiAgICAgIHZhbHVlOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHNjaGVkdWxlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvcGVuRWRpdG9yRm9yQWRkKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBhbmd1bGFyLklQcm9taXNlPGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pj4ge1xyXG4gICAgaWYgKHRoaXMuaXRlbS5jYW5FZGl0KCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiRxLndoZW4oc2NoZWR1bGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEV4cGFuZCBnaG9zdCB3aGlsZSBkcmFnZ2luZyBpbiBpdCAqL1xyXG4gIHB1YmxpYyBhZGp1c3RHaG9zdCgpIHtcclxuICAgIGxldCBwb2ludCA9IHRoaXMubW91c2VUcmFja2VyU2VydmljZS5nZXRNb3VzZVBvc2l0aW9uKCk7XHJcbiAgICBsZXQgbW91c2VWYWx1ZTogbnVtYmVyID0gdGhpcy5nZXRWYWxBdE1vdXNlUG9zaXRpb24ocG9pbnQueCk7XHJcblxyXG4gICAgbGV0IGV4aXN0aW5nTGVmdFZhbHVlOiBudW1iZXIgPSB0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMubGVmdDtcclxuXHJcbiAgICBsZXQgdXBkYXRlZExlZnRWYWx1ZTogbnVtYmVyO1xyXG4gICAgbGV0IHVwZGF0ZWRSaWdodFZhbHVlOiBudW1iZXI7XHJcbiAgICBcclxuICAgIGlmIChtb3VzZVZhbHVlIDwgZXhpc3RpbmdMZWZ0VmFsdWUpIHsgLy8gdXNlciBpcyBkcmFnZ2luZyBsZWZ0XHJcbiAgICAgIHVwZGF0ZWRMZWZ0VmFsdWUgPSBtb3VzZVZhbHVlO1xyXG4gICAgICB1cGRhdGVkUmlnaHRWYWx1ZSA9IGV4aXN0aW5nTGVmdFZhbHVlO1xyXG4gICAgfSBlbHNlIHsgLy8gdXNlciBpcyBkcmFnZ2luZyByaWdodFxyXG4gICAgICB1cGRhdGVkTGVmdFZhbHVlID0gZXhpc3RpbmdMZWZ0VmFsdWU7XHJcbiAgICAgIHVwZGF0ZWRSaWdodFZhbHVlID0gbW91c2VWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZ2hvc3RWYWx1ZXMgPSB7XHJcbiAgICAgIGxlZnQ6IHRoaXMubm9ybWFsaXplR2hvc3RWYWx1ZSh1cGRhdGVkTGVmdFZhbHVlKSxcclxuICAgICAgcmlnaHQ6IHRoaXMubm9ybWFsaXplR2hvc3RWYWx1ZSh1cGRhdGVkUmlnaHRWYWx1ZSlcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZXRHaG9zdFZhbHVlcyh7IFxyXG4gICAgICBnaG9zdFZhbHVlczogZ2hvc3RWYWx1ZXNcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvKiogTW92ZSBnaG9zdCBhcm91bmQgd2hpbGUgbm90IGRyYWdnaW5nICovXHJcbiAgcHVibGljIHBvc2l0aW9uR2hvc3QoKSB7XHJcbiAgICBsZXQgcG9pbnQgPSB0aGlzLm1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpO1xyXG4gICAgbGV0IHZhbCA9IHRoaXMuZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKHBvaW50LngpO1xyXG5cclxuICAgIHRoaXMuc3RhcnRpbmdHaG9zdFZhbHVlcyA9IHtcclxuICAgICAgbGVmdDogdmFsLFxyXG4gICAgICByaWdodDogdGhpcy5jb25maWcubnVsbEVuZHMgPyB2YWwgKyB0aGlzLm51bGxFbmRXaWR0aCA6IHZhbCArIHRoaXMuY29uZmlnLmludGVydmFsXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc2V0R2hvc3RWYWx1ZXMoe1xyXG4gICAgICBnaG9zdFZhbHVlczogYW5ndWxhci5jb3B5KHRoaXMuc3RhcnRpbmdHaG9zdFZhbHVlcylcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VEb3duKCkge1xyXG4gICAgaWYgKCF0aGlzLml0ZW0uZWRpdGFibGUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXRlbS4kaXNHaG9zdE9yaWdpbiA9IHRydWU7XHJcbiAgICB0aGlzLmNyZWF0ZUdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25HaG9zdFdyYXBwZXJNb3VzZU1vdmUoKSB7XHJcbiAgICAvLyBudWxsRW5kcyBjYWxlbmRhcnMgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBiZWNhdXNlIHRoZSBzaXplIG9mIHRoZSBzbG90IGRvZXNuJ3QgcmVhbGx5IG1hdHRlclxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25HaG9zdCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgdGhpcy5hZGp1c3RHaG9zdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VVcCgpIHtcclxuICAgIGxldCBnaG9zdFNjaGVkdWxlID0gdGhpcy5nZXRTY2hlZHVsZUZvckFkZCh0aGlzLmdob3N0VmFsdWVzLmxlZnQsIHRoaXMuZ2hvc3RWYWx1ZXMucmlnaHQpO1xyXG5cclxuICAgIHRoaXMub3BlbkVkaXRvckZvckFkZChnaG9zdFNjaGVkdWxlKS50aGVuKGVkaXRlZEdob3N0U2NoZWR1bGUgPT4ge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuR0hPU1RfRFJBR19FTkRFRCwgZWRpdGVkR2hvc3RTY2hlZHVsZSk7XHJcbiAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuJHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DQU5DRUxfR0hPU1QpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUdob3N0KCkge1xyXG4gICAgdGhpcy5pdGVtLiRyZW5kZXJHaG9zdCA9IHRydWU7XHJcbiAgICB0aGlzLnBvc2l0aW9uR2hvc3QoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tbWl0R2hvc3QoZ2hvc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pdGVtLiRyZW5kZXJHaG9zdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5pdGVtLiRpc0dob3N0T3JpZ2luID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHRoaXMuaXRlbS5jYW5BZGRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHRoaXMuaXRlbS5hZGRTY2hlZHVsZUFuZE1lcmdlKGdob3N0U2NoZWR1bGUpO1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgICB0aGlzLnNldEdob3N0VmFsdWVzKG51bGwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRNb3VzZVBvc2l0aW9uKHBhZ2VYOiBudW1iZXIpIHtcclxuICAgIGxldCBlbGVtZW50T2Zmc2V0WCA9IHRoaXMuZWxlbWVudE9mZnNldFNlcnZpY2UubGVmdCh0aGlzLiRlbGVtZW50KTtcclxuICAgIGxldCBsZWZ0ID0gcGFnZVggLSBlbGVtZW50T2Zmc2V0WDtcclxuXHJcbiAgICByZXR1cm4gbGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKHBhZ2VYOiBudW1iZXIpIHtcclxuICAgIHJldHVybiB0aGlzLnBpeGVsVG9WYWwodGhpcy5nZXRNb3VzZVBvc2l0aW9uKHBhZ2VYKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGFuIGV4dGVybmFsIGFjdGlvbiB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGEgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHRoaXMuaXRlbS5jYW5FZGl0KCkpIHtcclxuICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigobmV3U2NoZWR1bGUpID0+IHtcclxuICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZSh0aGlzLmNvbmZpZywgbmV3U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG91bGREZWxldGUocmFuZ2UpKSB7XHJcbiAgICAgICAgICB0aGlzLml0ZW0ucmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZXQgcHJlbWVyZ2VTY2hlZHVsZSA9IGFuZ3VsYXIuY29weShyYW5nZSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5pdGVtLm1lcmdlU2NoZWR1bGUocmFuZ2UpO1xyXG5cclxuICAgICAgICAgIC8vIElmIG1lcmdpbmcgbXV0YXRlZCB0aGUgc2NoZWR1bGUgZnVydGhlciwgdGhlbiB1cGRhdGVTY2hlZHVsZSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWRcclxuICAgICAgICAgIC8vIFRoaXMgaXMgc28gdGhhdCBlZGl0cyB0aGF0IGRvbid0IHRyaWdnZXIgbWVyZ2VzIHN0aWxsIHRyaWdnZXIgb25DaGFuZ2UsXHJcbiAgICAgICAgICAvLyBidXQgZWRpdHMgdGhhdCBkbyB0cmlnZ2VyIG1lcmdlcyBkb24ndCB0cmlnZ2VyIGl0IHR3aWNlXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMocHJlbWVyZ2VTY2hlZHVsZSwgcmFuZ2UpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLnVwZGF0ZShyYW5nZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyBleGNlcHQgZWF0IHRoZSB1bmhhbmRsZWQgcmVqZWN0aW9uIGVycm9yXHJcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gSWYgdGhlcmUgaXMgYSBudWxsIGVuZCwgcGxhY2UgdGhlIGVuZCBvZiB0aGUgc2xvdCB0d28gaG91cnMgYXdheSBmcm9tIHRoZSBiZWdpbm5pbmcuXHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMgJiYgZW5kID09PSBudWxsKSB7XHJcbiAgICAgIGVuZCA9IHN0YXJ0ICsgdGhpcy5udWxsRW5kV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQW4gZW5kIG9mIDAgc2hvdWxkIGRpc3BsYXkgYWxsbGwgdGhlIHdheSB0byB0aGUgcmlnaHQsIHVwIHRvIHRoZSBlZGdlXHJcbiAgICBlbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCBlbmQpO1xyXG5cclxuICAgIC8vIFdlIHdhbnQgdGhlIHJpZ2h0IHNpZGUgdG8gZ28gL3VwIHRvLyB0aGUgaW50ZXJ2YWwgaXQgcmVwcmVzZW50cywgbm90IGNvdmVyIGl0LCBzbyB3ZSBtdXN0IHN1YnN0cmFjdCAxIGludGVydmFsXHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoZW5kIC0gdGhpcy5jb25maWcuaW50ZXJ2YWwpO1xyXG5cclxuICAgIGxldCBvZmZzZXRSaWdodCA9IHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRMZWZ0ICsgdW5kZXJseWluZ0ludGVydmFsLm9mZnNldFdpZHRoO1xyXG4gICAgbGV0IGNvbnRhaW5lckxlZnQgPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLmxlZnQodGhpcy4kZWxlbWVudClcclxuICAgIGxldCBjb250YWluZXJSaWdodCA9IHRoaXMuZWxlbWVudE9mZnNldFNlcnZpY2UucmlnaHQodGhpcy4kZWxlbWVudCk7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IGNvbnRhaW5lclJpZ2h0IC0gY29udGFpbmVyTGVmdCAtIG9mZnNldFJpZ2h0O1xyXG5cclxuICAgIHJldHVybiByZXN1bHQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICB2YWwgPSB0aGlzLm5vcm1hbGl6ZUludGVydmFsVmFsdWUodmFsKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvdWxkRGVsZXRlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmIChzY2hlZHVsZS4kaXNEZWxldGluZykge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQgJiYgc2NoZWR1bGUudmFsdWUgPT09IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbm9ybWFsaXplSW50ZXJ2YWxWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUodmFsdWUsIDAsIHJpZ2h0bW9zdCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG5vcm1hbGl6ZUdob3N0VmFsdWUodmFsdWU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS5ub3JtYWxpemVWYWx1ZSh2YWx1ZSwgMCwgdGhpcy5jb25maWcubWF4VmFsdWUpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGRyYWdTY2hlZHVsZTogJzwnLFxyXG4gICAgZ2hvc3RWYWx1ZXM6ICc8JyxcclxuICAgIGl0ZW06ICc9bmdNb2RlbCcsXHJcbiAgICBzZXRHaG9zdFZhbHVlczogJyYnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJOdWxsRW5kJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVsbEVuZERpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck51bGxFbmRWYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKE51bGxFbmREaXJlY3RpdmUuJG5hbWUsIE51bGxFbmREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJPdmVybGFwJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE92ZXJsYXBEaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShPdmVybGFwRGlyZWN0aXZlLiRuYW1lLCBPdmVybGFwRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBPdmVybGFwU3RhdGUge1xyXG4gICAgICAgIGxldCBjdXJyZW50U3RhcnQgPSBjdXJyZW50LnN0YXJ0O1xyXG4gICAgICAgIGxldCBjdXJyZW50RW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIGN1cnJlbnQuZW5kKTtcclxuXHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnQgPSBvdGhlci5zdGFydDtcclxuICAgICAgICBsZXQgb3RoZXJFbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgb3RoZXIuZW5kKTtcclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID49IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50U3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RW5kID49IG90aGVyRW5kICYmIGN1cnJlbnRTdGFydCA8PSBvdGhlclN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID4gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID49IGN1cnJlbnRTdGFydCAmJiBvdGhlclN0YXJ0IDwgY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPT09IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID09PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBTZXJ2aWNlLiRuYW1lLCBPdmVybGFwU2VydmljZSk7XHJcbiIsIi8qKiBXaGVuIHVzaW5nIHRoZSAnZmlsbEVtcHR5V2l0aERlZmF1bHQnIG9wdGlvbiwgdGhpcyBzZXJ2aWNlIHdpbGwgYmUgdXNlZCB0byBkZWxldGUgdGhlIGRlZmF1bHQgc2NoZWR1bGVzIGZvciBjb3JyZWN0IGRpc3BsYXkgb24gdGhlIGNhbGVuZGFyICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUHVyZ2VEZWZhdWx0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJQdXJnZURlZmF1bHRTZXJ2aWNlJztcclxuXHJcbiAgICBwdXJnZShzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10ge1xyXG4gICAgICAgIGxldCBsYXN0SW5kZXggPSBzY2hlZHVsZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgLy8gbG9vcCBpbiByZXZlcnNlIHRvIGF2b2lkIG1lc3NpbmcgdXAgaW5kaWNlcyBhcyB3ZSBnb1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBsYXN0SW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmIChzY2hlZHVsZXNbaV0udmFsdWUgPT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShQdXJnZURlZmF1bHRTZXJ2aWNlLiRuYW1lLCBQdXJnZURlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlUHJvdmlkZXIgaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVJlc2l6ZVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljICRuYW1lID0gJ2JyLndlZWtseVNjaGVkdWxlci5yZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLiRnZXQuJGluamVjdCA9IFtcclxuICAgICAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICAgICAnJHdpbmRvdydcclxuICAgICAgICBdXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjdXN0b21SZXNpemVFdmVudHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzZXJ2aWNlSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cyA9IGV2ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgJGdldChcclxuICAgICAgICAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICk6IElSZXNpemVTZXJ2aWNlIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0aWFsaXplOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4aXN0cyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gd2UgaGF2ZSB0byAkYXBwbHkgdGhlIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oZXZlbnQsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUluaXRpYWxpemVkID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnByb3ZpZGVyKFJlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgUmVzaXplU2VydmljZVByb3ZpZGVyKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCAocmVzaXplU2VydmljZTogSVJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdyZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGZpbHRlciddO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4cGxhbmF0aW9uczogeyBba2V5IGluIFZhbGlkYXRpb25FcnJvcl0/OiBzdHJpbmcgfSA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGZpbHRlcjogSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gdGhpcy4kZmlsdGVyKCdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKShjb25maWcubWF4VGltZVNsb3QpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1heFRpbWVTbG90KG1heFRpbWVTbG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLmZ1bGxDYWxlbmRhcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1vbm9TY2hlZHVsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk51bGxFbmRdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm51bGxFbmRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucyAmJiBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLlNjaGVkdWxlQ291bnRdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLnNjaGVkdWxlQ291bnQoY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubWluaW11bVNlcGFyYXRpb24pIHtcclxuICAgICAgICAgICAgbGV0IG1pbmltdW1TZXBhcmF0aW9uID0gdGhpcy4kZmlsdGVyKCdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKShjb25maWcubWluaW11bVNlcGFyYXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTWluaW11bVNlcGFyYXRpb25dID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1pbmltdW1TZXBhcmF0aW9uKG1pbmltdW1TZXBhcmF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBzY2hlZHVsZXJDdHJsOiAnXmJyV2Vla2x5U2NoZWR1bGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3JvdyBleHBsYW5hdGlvbnNcIiBuZy1jbGFzcz1cInsgdmlvbGF0aW9uOiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuc2NoZWR1bGVyQ3RybC5mb3JtQ29udHJvbGxlci4kZXJyb3Jba2V5XSB9XCIgbmctcmVwZWF0PVwiKGtleSwgZXhwbGFuYXRpb24pIGluIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC5leHBsYW5hdGlvbnNcIj5cclxuICAgICAgICAgICAge3sgZXhwbGFuYXRpb24gfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LiRuYW1lLCBuZXcgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZSwgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyKTtcclxuIiwiLyoqXHJcbiAqIFJ1bnMgY3VzdG9tIHZhbGlkYXRvcnMgd2hlbmV2ZXIgdGhlIG1vZGVsIGNoYW5nZXNcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJldmFsaWRhdGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyUmV2YWxpZGF0ZSc7XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5uZ01vZGVsLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXZhbGlkYXRlRGlyZWN0aXZlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoUmV2YWxpZGF0ZURpcmVjdGl2ZS4kbmFtZSwgUmV2YWxpZGF0ZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG4gICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTRVRfWk9PTSwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW4oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJTY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQ291bnREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVDb3VudCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyU2NoZWR1bGVDb3VudCkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNjaGVkdWxlQ291bnREaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShTY2hlZHVsZUNvdW50RGlyZWN0aXZlLiRuYW1lLCBTY2hlZHVsZUNvdW50RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyBXaGVuIHRoaXMgb3B0aW9uIGlzIHRydWUgd2Ugc2hvdWxkIGVuZm9yY2UgdGhhdCB0aGVyZSBhcmUgbm8gZ2FwcyBpbiB0aGUgc2NoZWR1bGVzXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzY2hlZHVsZXMsIGl0IGF1dG9tYXRpY2FsbHkgZmFpbHMuXHJcbiAgICAgICAgaWYgKCFsZW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgb25seSBvbmUgaXRlbSB3ZSBzaG91bGQgY2hlY2sgdGhhdCBpdCBzcGFucyB0aGUgd2hvbGUgcmFuZ2VcclxuICAgICAgICBpZiAobGVuID09PSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsZSA9IHNjaGVkdWxlc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc2NoZWR1bGUuc3RhcnQpICYmIHRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKHNjaGVkdWxlLmVuZCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG1vcmUsIGNvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxvb3BMZW4gPSBsZW4gLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTb3J0IGJ5IHN0YXJ0IHRpbWUgZmlyc3RcclxuICAgICAgICBsZXQgc29ydGVkU2NoZWR1bGVzID0gc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgPiBiLnN0YXJ0ID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiAhdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShjdXJyZW50LnN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBsYXN0IGl0ZW0gbGFuZHMgYXQgbWF4VmFsdWVcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxvb3BMZW4gLSAxICYmICF0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShuZXh0LmVuZCwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgY3VycmVudC5lbmQgPT09IG5leHQuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBzdGFydCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRW5kQXRNYXhWYWx1ZShlbmQ6IG51bWJlciwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gKGVuZCB8fCBjb25maWcubWF4VmFsdWUpID09PSBjb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSBjb25maWcubWF4VGltZVNsb3Q7XHJcblxyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSAmJiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgcy5lbmQpIC0gcy5zdGFydCA+IG1heFRpbWVTbG90KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTWluaW11bVNlcGFyYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubWluaW11bVNlcGFyYXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAobGVuIDw9IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb29wTGVuID0gbGVuIC0gMTtcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgLSBiLnN0YXJ0KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dFNjaGVkdWxlLnN0YXJ0IC0gY3VycmVudFNjaGVkdWxlLmVuZCA8IGNvbmZpZy5taW5pbXVtU2VwYXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWluaW11bVNlcGFyYXRpb25WYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEltcG9ydGFudCBub3RlIC0tIHRoaXMgZG9lcyBub3QgdmFsaWRhdGUgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0sIGJ1dCByYXRoZXIgdGhhdCBvbmx5IG9uZSBOT04tREVGQVVMVCBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0uICovXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhIGRlZmF1bHQgdmFsdWUgaXMgZGVmaW5lZCwgc2NoZWR1bGVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgZG9uJ3QgY291bnQgLS0gb25lIG5vbi1kZWZhdWx0IHNjaGVkdWxlIHBlciBpdGVtLlxyXG4gICAgICAgIGxldCBzY2hlZHVsZXNUb1ZhbGlkYXRlO1xyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnLmRlZmF1bHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcy5maWx0ZXIoc2NoZWR1bGUgPT4gc2NoZWR1bGUudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGFsbG93ZWQgZW1wdHkgb3IgMSBzY2hlZHVsZSBwZXIgaXRlbVxyXG4gICAgICAgIHJldHVybiAhc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggfHwgc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggPT09IDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZDtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gMSAmJiBzY2hlZHVsZXMuZXZlcnkoc2NoZWR1bGUgPT4gc2NoZWR1bGUuZW5kID09PSBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCAhPT0gbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5PdmVybGFwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuU2NoZWR1bGVDb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5jb3VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmV4YWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlRXhhY3RDb3VudChzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVNYXhDb3VudChzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVFeGFjdENvdW50KHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPT09IGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5jb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlTWF4Q291bnQoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmxlbmd0aCA8PSBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW51dGVzQXNUZXh0RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGBgO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgaGFzSG91cnMgPSBob3VycyA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzSG91cnMpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgJHtob3Vyc30gaG91cnNgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbWluID0gbWludXRlcyAlIDYwO1xyXG4gICAgICAgICAgICBsZXQgaGFzTWludXRlcyA9IG1pbiA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzTWludXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7bWlufSBtaW51dGUke21pbiA+IDEgPyAncycgOiAnJ31gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoTWludXRlc0FzVGV4dEZpbHRlci4kbmFtZSwgW01pbnV0ZXNBc1RleHRGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nTWludXRlcyA9IChtaW51dGVzIC0gKGhvdXJzICogNjApKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBob3VycyA+IDExICYmIGhvdXJzIDwgMjQgPyAnUCcgOiAnQSc7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVtYWluaW5nTWludXRlcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nTWludXRlcyA9ICcwJyArIHJlbWFpbmluZ01pbnV0ZXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkaXNwbGF5SG91cnMgPSBob3VycyAlIDEyIHx8IDEyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke2Rpc3BsYXlIb3Vyc306JHtyZW1haW5pbmdNaW51dGVzfSR7bWVyaWRpZW19YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2UnO1xyXG5cclxuICAgIGJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNjaGVkdWxlOiAnPCdcclxuICAgIH1cclxuXHJcbiAgICBjb250cm9sbGVyID0gVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0te3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5lbmQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgIXRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19IHVudGlsPC9zcGFuPlxyXG4gICAgYFxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3RpbWVSYW5nZUN0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlQ29udHJvbGxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTdGFydDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgaGFzRW5kOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIHRoaXMuaGFzU3RhcnQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICB0aGlzLmhhc0VuZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuZW5kKSAmJiB0aGlzLnNjaGVkdWxlLmVuZCAhPT0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoVGltZVJhbmdlQ29tcG9uZW50LiRuYW1lLCBuZXcgVGltZVJhbmdlQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lLCBUaW1lUmFuZ2VDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUb3VjaFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVG91Y2hTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0VG91Y2hlcyhldmVudDogYW55KTogYW55IHsgLy8gdG9kb1xyXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFldmVudC50b3VjaGVzKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnRvdWNoZXMgPSBbZXZlbnQub3JpZ2luYWxFdmVudF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGdldFBhZ2VYKGV2ZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0b3VjaGVzID0gdGhpcy5nZXRUb3VjaGVzKGV2ZW50KTtcclxuXHJcbiAgICAgICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggJiYgdG91Y2hlc1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdG91Y2hlc1swXS5wYWdlWDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoVG91Y2hTZXJ2aWNlLiRuYW1lLCBUb3VjaFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIG5vcm1hbGl6ZVZhbHVlKHZhbHVlOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh2YWx1ZSA8IG1pbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlID4gbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLiRuYW1lLCBWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckdGltZW91dCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJBZGFwdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckxhc3RHaG9zdERheVNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWlzc2luZ0RheXNTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGFkYXB0ZXJTZXJ2aWNlOiBBZGFwdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblNlcnZpY2U6IENvbmZpZ3VyYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlOiBDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsYXN0R2hvc3REYXlTZXJ2aWNlOiBMYXN0R2hvc3REYXlTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBtaXNzaW5nRGF5c1NlcnZpY2U6IE1pc3NpbmdEYXlzU2VydmljZSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29yaWdpbmFsSXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcblxyXG4gIHB1YmxpYyBpbnZhbGlkTWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gIHByaXZhdGUgZHJhZ1NjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG5cclxuICAvKiogdGhpcyBpcyByZXF1aXJlZCB0byBiZSBwYXJ0IG9mIGEgZm9ybSBmb3IgZGlydHkvdmFsaWQgY2hlY2tzICovXHJcbiAgcHVibGljIGZvcm1Db250cm9sbGVyOiBhbmd1bGFyLklGb3JtQ29udHJvbGxlcjtcclxuXHJcbiAgcHVibGljIGhvdmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHB1YmxpYyBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+O1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25TZXJ2aWNlLmdldENvbmZpZ3VyYXRpb24odGhpcy5vcHRpb25zKTtcclxuICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoQWRhcHRlcigpO1xyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuU0xPVF9EUkFHR0VELCAoZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgdGhpcy5kcmFnU2NoZWR1bGUgPSBzY2hlZHVsZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuRFJBR19FTkRFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWdTY2hlZHVsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBnaG9zdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB7XHJcbiAgICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNPTU1JVF9HSE9TVCwgZ2hvc3RTY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9MQVNUX0dIT1NULCAoKSA9PiB7XHJcbiAgICAgIGxldCBsYXN0R2hvc3REYXkgPSB0aGlzLmxhc3RHaG9zdERheVNlcnZpY2UuZ2V0TGFzdEdob3N0RGF5KHRoaXMuaXRlbXMpO1xyXG5cclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0dIT1NULCBsYXN0R2hvc3REYXkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DQU5DRUxfR0hPU1QsICgpID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0FMTF9HSE9TVFMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZE1lc3NhZ2UgPSB0aGlzLmdldEludmFsaWRNZXNzYWdlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRJbnZhbGlkTWVzc2FnZSgpIHtcclxuICAgIGxldCBjb25mbGljdGluZ09wdGlvbnMgPSB0aGlzLmNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UuZ2V0Q29uZmxpY3RpbmdPcHRpb25zKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKGNvbmZsaWN0aW5nT3B0aW9ucykge1xyXG4gICAgICByZXR1cm4gY29uZmxpY3RpbmdPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpKSB7XHJcbiAgICAgIHJldHVybiAnT25lIG9yIG1vcmUgb2YgdGhlIHNjaGVkdWxlcyBpcyBpbnZhbGlkISBQbGVhc2UgY29udGFjdCBzZXJ2aWNlLic7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9ybUNvbnRyb2xsZXIuJGludmFsaWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5taXNzaW5nRGF5c1NlcnZpY2UuZmlsbEl0ZW1zKHRoaXMuY29uZmlnLCBpdGVtcyk7XHJcblxyXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5tZXJnZU92ZXJsYXBzKCkpO1xyXG5cclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnB1cmdlSXRlbXModGhpcy5pdGVtcyk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IGl0ZW1zID0gdGhpcy5hZGFwdGVyU2VydmljZS5nZXRJdGVtc0Zyb21BZGFwdGVyKHRoaXMuY29uZmlnLCB0aGlzLmFkYXB0ZXIpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmJ1aWxkSXRlbXMoaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwdXJnZUl0ZW1zKGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZpbGxFbXB0eVdpdGhEZWZhdWx0KSB7XHJcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICBpdGVtLnB1cmdlRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcmVwYXJlSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGl0ZW0uZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRHaG9zdFZhbHVlcyhnaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfSkge1xyXG4gICAgdGhpcy5naG9zdFZhbHVlcyA9IGdob3N0VmFsdWVzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5mb3JtQ29udHJvbGxlci4kc2V0UHJpc3RpbmUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2F2ZSgpIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLnByZXBhcmVJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2F2ZVNjaGVkdWxlcigpLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLml0ZW1zID0gdGhpcy5wdXJnZUl0ZW1zKHRoaXMuaXRlbXMpO1xyXG4gICAgICB0aGlzLmZvcm1Db250cm9sbGVyLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgZm9ybUNvbnRyb2xsZXI6ICdmb3JtJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJztcclxuICAgIFxyXG4gICAgc3RhdGljIHZhbHVlID0ge1xyXG4gICAgICAgIDA6ICdNb24nLFxyXG4gICAgICAgIDE6ICdUdWUnLFxyXG4gICAgICAgIDI6ICdXZWQnLFxyXG4gICAgICAgIDM6ICdUaHVyJyxcclxuICAgICAgICA0OiAnRnJpJyxcclxuICAgICAgICA1OiAnU2F0JyxcclxuICAgICAgICA2OiAnU3VuJyBcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChEYXlNYXAuJG5hbWUsIERheU1hcC52YWx1ZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gMTIwO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KE51bGxFbmRXaWR0aC4kbmFtZSwgTnVsbEVuZFdpZHRoLnZhbHVlKTtcclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhbiBpdGVtIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGltcGxlbWVudHMgSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICAkaXNHaG9zdE9yaWdpbjogYm9vbGVhbjtcclxuICAgICRyZW5kZXJHaG9zdDogYm9vbGVhbjtcclxuICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcbiAgICBlZGl0YWJsZTogYm9vbGVhbjtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxUPixcclxuICAgICAgICBpdGVtOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlOiBGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBwdXJnZURlZmF1bHRTZXJ2aWNlOiBQdXJnZURlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuZGF5ID0gaXRlbS5kYXk7XHJcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKGl0ZW0uZWRpdGFibGUpID8gaXRlbS5lZGl0YWJsZSA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGl0ZW0ubGFiZWw7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4gcmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywgc2NoZWR1bGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKHRoaXMuY29uZmlnLCBzY2hlZHVsZSk7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMucHVzaChyYW5nZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2NoZWR1bGVBbmRNZXJnZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCByYW5nZSA9IHRoaXMuYWRkU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMubWVyZ2VTY2hlZHVsZShyYW5nZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FuQWRkU2NoZWR1bGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZXRlcm1pbmUgaWYgdGhlIGNvbmRpdGlvbnMgYWxsb3cgZm9yIGEgcG9wLXVwIGVkaXRvciAqL1xyXG4gICAgcHVibGljIGNhbkVkaXQoKSB7XHJcbiAgICAgICAgbGV0IGhhc0VkaXRGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLmNvbmZpZy5lZGl0U2xvdCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGV0ZXJtaW5lIGlmIGEgc2NoZWR1bGUgaXMgYWJsZSB0byBiZSBtb2RpZmllZCAqL1xyXG4gICAgcHVibGljIGNhbkVkaXRTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgaXRlbUlzRWRpdGFibGUgPSB0aGlzLmVkaXRhYmxlO1xyXG4gICAgICAgIGxldCBzY2hlZHVsZUlzRWRpdGFibGUgPSBzY2hlZHVsZS5lZGl0YWJsZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGl0ZW1Jc0VkaXRhYmxlICYmIHNjaGVkdWxlSXNFZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJhdGhlciB0aGFuIGhhdmluZyB0byBkZWFsIHdpdGggbW9kaWZ5aW5nIG1lcmdlT3ZlcmxhcHMgdG8gaGFuZGxlIG51bGxFbmRzIGNhbGVuZGFycyxcclxuICAgICAqIGp1c3QgcHJldmVudCB0aGUgdXNlciBmcm9tIGNyZWF0aW5nIGFkZGl0aW9uYWwgc2xvdHMgaW4gbnVsbEVuZHMgY2FsZW5kYXJzIHVubGVzcyB0aGVyZSBhcmUgbm8gc2xvdHMgdGhlcmUgYWxyZWFkeS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNhblJlbmRlckdob3N0KCkge1xyXG4gICAgICAgIC8vIFRoaXMgb25lIG5lZWRzIHRvIGNvbWUgZmlyc3QsIG90aGVyd2lzZSByZW5kZXJHaG9zdCBiZWluZyBzZXQgdG8gdHJ1ZSB3b3VsZCBvdmVycmlkZSB0aGUgcHJvdGVjdGlvbiBhZ2FpbnN0IGFkZHQnbCBzbG90cyBpbiBudWxsRW5kIGNhbGVuZGFyc1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kcmVuZGVyR2hvc3QgJiYgdGhpcy5oYXNOb1NjaGVkdWxlcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuJHJlbmRlckdob3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSkgPiAtMTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzTm9TY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmlsbEVtcHR5U2xvdHNXaXRoRGVmYXVsdFNjaGVkdWxlcygpIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IHRoaXMuZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLmZpbGwodGhpcywgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZXJnZU92ZXJsYXBzKCkge1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXMuZm9yRWFjaChzY2hlZHVsZSA9PiB0aGlzLm1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZSkpO1xyXG4gICAgICAgIH0gd2hpbGUgKHRoaXMubmVlZHNPdmVybGFwc01lcmdlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVyZ2VTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzY2hlZHVsZSB3ZSB3ZXJlIHdvcmtpbmcgd2l0aCB0byBiZSB0aGUgbW9zdCBpbXBvcnRhbnQsIHNvIGhhbmRsZSBpdHMgb3ZlcmxhcHMgZmlyc3QuXHJcbiAgICAgICAgdGhpcy5tZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwdXJnZURlZmF1bHRTY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSB0aGlzLnB1cmdlRGVmYXVsdFNlcnZpY2UucHVyZ2UodGhpcy5zY2hlZHVsZXMsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnLm9uUmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3ZlcmxhcCBoYW5kbGVyc1xyXG5cclxuICAgIHByaXZhdGUgZ2V0T3ZlcmxhcEhhbmRsZXIob3ZlcmxhcFN0YXRlOiBPdmVybGFwU3RhdGUpIHtcclxuICAgICAgICBjb25zdCBvdmVybGFwSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gb3ZlcmxhcEhhbmRsZXJzW292ZXJsYXBTdGF0ZV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEp1c3QgcmVtb3ZlICdjdXJyZW50J1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGN1cnJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG90aGVyLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogY3VycmVudC5zdGFydCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdGhlci51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuZCBvdmVybGFwIGhhbmRsZXJzXHJcbiAgICBwcml2YXRlIG1lcmdlT3ZlcmxhcHNGb3JTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWVsLmVxdWFscyhzY2hlZHVsZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzY2hlZHVsZXNCb3RoRWRpdGFibGUgPSBlbC5lZGl0YWJsZSAmJiBzY2hlZHVsZS5lZGl0YWJsZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NoZWR1bGVzQm90aEVkaXRhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKHRoaXMuY29uZmlnLCBzY2hlZHVsZSwgZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvdmVybGFwSGFuZGxlciA9IHRoaXMuZ2V0T3ZlcmxhcEhhbmRsZXIob3ZlcmxhcFN0YXRlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcEhhbmRsZXIoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbmVlZHNPdmVybGFwc01lcmdlZCgpIHtcclxuICAgICAgICBsZXQgbGVuID0gdGhpcy5zY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsZXNCb3RoRWRpdGFibGUgPSBjdXJyZW50LmVkaXRhYmxlICYmIG5leHQuZWRpdGFibGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNjaGVkdWxlc0JvdGhFZGl0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhuZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKHRoaXMuY29uZmlnLCBjdXJyZW50LCBuZXh0KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0LCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJGaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJQdXJnZURlZmF1bHRTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBkYXlNYXA6IERheU1hcCxcclxuICAgICAgICBwcml2YXRlIGZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZTogRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcHVyZ2VEZWZhdWx0U2VydmljZTogUHVyZ2VEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlSXRlbShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZGF5OiBudW1iZXIsIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gICAgICAgIGxldCBidWlsZGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGNvbmZpZy5jcmVhdGVJdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuICAgIFxyXG4gICAgICAgIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKGJ1aWxkZXIsIHsgbGFiZWw6IHRoaXMuZGF5TWFwW2RheV0gfSk7XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gbmV3IFdlZWtseVNjaGVkdWxlckl0ZW0oY29uZmlnLCByZXN1bHQsIHRoaXMuZmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLCB0aGlzLm92ZXJsYXBTZXJ2aWNlLCB0aGlzLnB1cmdlRGVmYXVsdFNlcnZpY2UsIHRoaXMucmFuZ2VGYWN0b3J5KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFdlZWtseVNjaGVkdWxlckl0ZW1GYWN0b3J5LiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeSk7XHJcblxyXG4iLCIvKiogUHJvdmlkZXMgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIGEgc2NoZWR1bGUgLS0gcGFzcyBpdCBpbiBhbmQgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBhbGxvdyB5b3UgdG8gb3BlcmF0ZSBvbiBpdCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAkY2xhc3M6IHN0cmluZztcclxuICAgICRpc0FjdGl2ZTogYm9vbGVhbjtcclxuICAgICRpc0RlbGV0aW5nOiBib29sZWFuO1xyXG4gICAgJGlzRWRpdGluZzogYm9vbGVhbjtcclxuXHJcbiAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgc3RhcnQ6IG51bWJlcjtcclxuICAgIGVuZDogbnVtYmVyO1xyXG4gICAgdmFsdWU6IFQ7XHJcblxyXG4gICAgZWRpdGFibGU6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8VD4sXHJcbiAgICAgICAgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4sXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBzY2hlZHVsZS5kYXk7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHNjaGVkdWxlLnN0YXJ0O1xyXG4gICAgICAgIHRoaXMuZW5kID0gc2NoZWR1bGUuZW5kO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBzY2hlZHVsZS52YWx1ZTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gYW5ndWxhci5pc0RlZmluZWQoc2NoZWR1bGUuZWRpdGFibGUpID8gc2NoZWR1bGUuZWRpdGFibGUgOiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBkdXJhdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbmQgLSB0aGlzLnN0YXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZXF1YWxzKHRoaXMsIG90aGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzU2FtZVZhbHVlQXMob3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUodXBkYXRlZFNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHVwZGF0ZWRTdGFydCA9IHRoaXMudXBkYXRlU3RhcnQodXBkYXRlZFNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICBsZXQgdXBkYXRlZEVuZCA9IHRoaXMudXBkYXRlRW5kKHVwZGF0ZWRTY2hlZHVsZS5lbmQpO1xyXG5cclxuICAgICAgICBpZiAodXBkYXRlZFN0YXJ0IHx8IHVwZGF0ZWRFbmQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUVuZCh1cGRhdGVkRW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5VcGRhdGVFbmQodXBkYXRlZEVuZCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbCh0aGlzLmNvbmZpZywgdXBkYXRlZEVuZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVTdGFydCh1cGRhdGVkU3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmNhblVwZGF0ZVN0YXJ0KHVwZGF0ZWRTdGFydCkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCA9IHVwZGF0ZWRTdGFydDtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW5VcGRhdGVFbmQodXBkYXRlZEVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLmVuZCAhPT0gdXBkYXRlZEVuZDtcclxuICAgICAgICBsZXQgbmV3RW5kQmVmb3JlT3JBdE1heCA9IHVwZGF0ZWRFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICAgICAgbGV0IG5ld0VuZEFmdGVyT3JBdEV4aXN0aW5nU3RhcnQgPSB1cGRhdGVkRW5kID49IHRoaXMuc3RhcnQgKyAxO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlZCAmJiBuZXdFbmRCZWZvcmVPckF0TWF4ICYmIG5ld0VuZEFmdGVyT3JBdEV4aXN0aW5nU3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYW5VcGRhdGVTdGFydCh1cGRhdGVkU3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5zdGFydCAhPT0gdXBkYXRlZFN0YXJ0O1xyXG4gICAgICAgIGxldCBuZXdTdGFydEJlZm9yZU9yQXRFeGlzdGluZ0VuZCA9IHVwZGF0ZWRTdGFydCA8PSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCB0aGlzLmVuZCkgLSAxO1xyXG4gICAgICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdE1pbiA9IHVwZGF0ZWRTdGFydCA+PSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlZCAmJiBuZXdTdGFydEJlZm9yZU9yQXRFeGlzdGluZ0VuZCAmJiBuZXdTdGFydEFmdGVyT3JBdE1pbjtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlUmFuZ2UoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFdlZWtseVNjaGVkdWxlclJhbmdlKGNvbmZpZywgc2NoZWR1bGUsIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5KTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHJvb3RTY29wZScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckRyYWdTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBnZXREZWx0YTogKG9wdGlvbnM6IHsgcGl4ZWw6IG51bWJlciB9KSA9PiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG4gIHByaXZhdGUgZHJhZ1NjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzT25EcmFnU3RhcnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBkcmFnU2VydmljZTogRHJhZ1NlcnZpY2UsXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBnZXQgaGFzRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuZHJhZ1NjaGVkdWxlKSAmJiB0aGlzLmRyYWdTY2hlZHVsZSAhPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnU3RhcnRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kcmFnU2VydmljZS5nZXREcmFnUmFuZ2VGcm9tU2NoZWR1bGUodGhpcy5jb25maWcsIHRoaXMuc2NoZWR1bGUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IG51bGwgOiBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5kdXJhdGlvbik7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS51cGRhdGUoe1xyXG4gICAgICBkYXk6IHVpLmRheSxcclxuICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgdmFsdWU6IHVpLnZhbHVlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgLy8gSWYgdGhlIHNjaGVkdWxlIHdhcyBtb3ZlZCB0byBhbm90aGVyIGl0ZW0sIHRoZSAkc2NvcGUgaGllcmFyY2h5IHdpbGwgaGF2ZSBiZWVuIGJyb2tlbiwgc28gd2UgbmVlZCB0byBicm9hZGNhc3QgdGhpcyB0byB0aGUgd2hvbGUgYXBwXHJcbiAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuRFJBR19FTkRFRCk7XHJcbiAgICBcclxuICAgIC8vIFdhcyB0aGUgc2NoZWR1bGUgbW92ZWQgdG8gYW5vdGhlciBpdGVtPz9cclxuICAgIGlmICghdGhpcy5pdGVtLmhhc1NjaGVkdWxlKHRoaXMuc2NoZWR1bGUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEaWQgdGhlIHVzZXIgYWN0dWFsbHkgbW92ZSBvciByZXNpemUgdGhlIHNsb3Q/P1xyXG4gICAgdmFyIGNoYW5nZWQ6IGJvb2xlYW4gPSAhdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lcXVhbHModGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmRSZXNpemUoKSB7XHJcbiAgICAvLyBEaWQgdGhlIHVzZXIgYWN0dWFsbHkgbW92ZSBvciByZXNpemUgdGhlIHNsb3Q/P1xyXG4gICAgdmFyIGNoYW5nZWQ6IGJvb2xlYW4gPSAhdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lcXVhbHModGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVTdGFydChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgIGlmICh0aGlzLnNjaGVkdWxlLnVwZGF0ZVN0YXJ0KG5ld1N0YXJ0KSkge1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZUVuZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NoZWR1bGUudXBkYXRlRW5kKG5ld0VuZCkpIHtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXRlbS5jYW5FZGl0U2NoZWR1bGUodGhpcy5zY2hlZHVsZSkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlNMT1RfRFJBR0dFRCwgdGhpcy5zY2hlZHVsZSk7XHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZSgpIHtcclxuICAgIGlmICghdGhpcy5pdGVtLmNhbkVkaXRTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2xvdCc7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGRyYWdTY2hlZHVsZTogJzwnLFxyXG4gICAgaXRlbTogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIGdldERlbHRhOiAnJidcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgICAgIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShjdXN0b206IFRDdXN0b20pOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFRWYWx1ZT47XHJcblxyXG4gICAgICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgICAgICBnZXRTbmFwc2hvdCgpOiBUQ3VzdG9tW107XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICAgICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICAgICAgaW5pdGlhbERhdGE6IFRDdXN0b21bXTtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmRlY2xhcmUgY29uc3QgZW51bSBEcmFnTW9kZSB7XHJcbiAgICBNT1ZFLFxyXG4gICAgQ09QWVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnZhbGlkTWVzc2FnZXMge1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhckZpbGxFbXB0eVdpdGhEZWZhdWx0OiBzdHJpbmc7XHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aGRlZmF1bHREZWZhdWx0VmFsdWU6IHN0cmluZztcclxuICAgICAgICBnZW5lcmljOiBzdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSVBvaW50IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUmVzaXplU2VydmljZSB7XHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQ7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlUHJvdmlkZXIgZXh0ZW5kcyBhbmd1bGFyLklTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgICAgIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKiBEZWZhdWx0cyB3aWxsIGJlIHByb3ZpZGVkLCBidXQgeW91IGNhbiBvdmVycmlkZSB0aGVzZSBvbiBhIHBlci1jYWxlbmRhciBiYXNpcyBpZiBuZWNlc3NhcnkgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMge1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcjogc3RyaW5nO1xyXG4gICAgICAgIG1heFRpbWVTbG90OiAodmFsdWU6IHN0cmluZykgPT4gc3RyaW5nO1xyXG4gICAgICAgIG1pbmltdW1TZXBhcmF0aW9uOiAodmFsdWU6IHN0cmluZykgPT4gc3RyaW5nO1xyXG4gICAgICAgIG1vbm9TY2hlZHVsZTogc3RyaW5nO1xyXG4gICAgICAgIG51bGxFbmRzOiBzdHJpbmc7XHJcbiAgICAgICAgc2NoZWR1bGVDb3VudDogKG9wdGlvbnM6IFNjaGVkdWxlQ291bnRPcHRpb25zKSA9PiBzdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICAvKiogRGVmYXVsdHMgd2lsbCBiZSBwcm92aWRlZCwgYnV0IHlvdSBjYW4gb3ZlcnJpZGUgdGhlc2Ugb24gYSBwZXItY2FsZW5kYXIgYmFzaXMgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNjaGVkdWxlQ291bnRPcHRpb25zIHtcclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBzY2hlZHVsZXMgYWxsb3dlZCBvbiBlYWNoIGl0ZW0uIE51bGwgZm9yIG5vIG1heCAqL1xyXG4gICAgICAgIGNvdW50OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBXaGV0aGVyIHlvdSBtdXN0IGhhdmUgZXhhY3RseSB0aGF0IG1hbnkgc2NoZWR1bGVzLCBvciBpZiBcInVwIHRvXCIgaXMgYWxsb3dlZCAqL1xyXG4gICAgICAgIGV4YWN0OiBib29sZWFuO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRGF5cyB7XHJcbiAgICAgICAgTW9uZGF5ID0gMCxcclxuICAgICAgICBUdWVzZGF5ID0gMSxcclxuICAgICAgICBXZWRuZXNkYXksXHJcbiAgICAgICAgVGh1cnNkYXksXHJcbiAgICAgICAgRnJpZGF5LFxyXG4gICAgICAgIFNhdHVyZGF5LFxyXG4gICAgICAgIFN1bmRheVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlIGV4dGVuZHMgYW5ndWxhci5JRmlsdGVyU2VydmljZSB7XHJcbiAgICAobmFtZTogJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpOiAobWludXRlczogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8VD4ge1xyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUgc2NoZWR1bGVzIHdpbGwgYmUgYWxsb3dlZCAmIHJlcXVpcmVkIHRvIGhhdmUgbm8gc2V0IGVuZCB0aW1lICovXHJcbiAgICAgICAgbnVsbEVuZHM/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhlc2UgY2xhc3NlcyB3aWxsIGJlIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIGJ1dHRvbnMgKi9cclxuICAgICAgICBidXR0b25DbGFzc2VzPzogc3RyaW5nW107XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHJldHVybiBhbiBpdGVtIC0tIHRoaXMgaXMgUkVRVUlSRUQgc28gdGhhdCBhZGFwdGVycyB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBuZXcgaXRlbXMsIGV2ZW4gaWYgdGhleSB3ZXJlbid0IHBhc3NlZCBpbiAqL1xyXG4gICAgICAgIGNyZWF0ZUl0ZW06IChkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLCBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdKSA9PiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD47XHJcblxyXG4gICAgICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBEbyBub3QgYXNzaWduIGZvciBubyBkZWZhdWx0ICovXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlPzogVDtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZCBpbiBvcmRlciB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGl0ICovXHJcbiAgICAgICAgZWRpdFNsb3Q/OiAoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikgPT4gYW5ndWxhci5JUHJvbWlzZTxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4+O1xyXG5cclxuICAgICAgICAvKiogV2hldGhlciB0byBmaWxsIGVtcHR5IHNwYWNlcyB3aXRoIHRoZSBkZWZhdWx0IHZhbHVlICovXHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aERlZmF1bHQ/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcj86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgICAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgZGVmaW5lZCwgc2xvdHMgbXVzdCBiZSBhdCBsZWFzdCB0aGlzIG1hbnkgbWludXRlcyBhcGFydCAqL1xyXG4gICAgICAgIG1pbmltdW1TZXBhcmF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCB0aGUgY2FsZW5kYXIgd2lsbCBlbmZvcmNlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgcGVyIGl0ZW0gaXMgYWxsb3dlZCAqL1xyXG4gICAgICAgIG1vbm9TY2hlZHVsZT86IGJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIGFjY2VzcyBiYWNrIHRvIHRoZSBjbGllbnQgc2NvcGUgd2hlbiB0aGUgc2NoZWR1bGVyIGNoYW5nZXMuICovXHJcbiAgICAgICAgb25DaGFuZ2U/OiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gYSBzY2hlZHVsZXIgaXMgcmVtb3ZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblJlbW92ZT86ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIG1pbnV0ZXMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgICAgIGludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogT3ZlcnJpZGVzIGZvciByZXN0cmljdGlvbiBleHBsYW5hdGlvbnMsIGlmIG5lY2Vzc2FyeSAqL1xyXG4gICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zPzogUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgc2F2ZSBidXR0b24gaXMgY2xpY2tlZC4gSWYgdGhpcyBpcyBub3QgcGFzc2VkLCBubyBzYXZlIGJ1dHRvbiB3aWxsIGJlIHByZXNlbnQuICovXHJcbiAgICAgICAgc2F2ZVNjaGVkdWxlcj86ICgpID0+IGFuZ3VsYXIuSVByb21pc2U8YW55PjtcclxuXHJcbiAgICAgICAgLyoqIE92ZXJyaWRlcyBmb3Igc2NoZWR1bGUgY291bnQgb3B0aW9ucywgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICAgICAgc2NoZWR1bGVDb3VudE9wdGlvbnM/OiBTY2hlZHVsZUNvdW50T3B0aW9ucztcclxuICAgIH1cclxufVxyXG4iLCIvKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgICAgIC8qKiBBIGNzcyBjbGFzcyB0byBhcHBseSAqL1xyXG4gICAgICAgICRjbGFzcz86IHN0cmluZztcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBjb25zaWRlcmVkIGFjdGl2ZSB0byB0aGUgVUkgKi9cclxuICAgICAgICAkaXNBY3RpdmU/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBzZXQgdG8gdHJ1ZSB3aGlsZSB0aGUgdXNlciBpcyBlZGl0aW5nIGFuIGV4aXN0aW5nIGl0ZW0sIGl0IHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHRoZSBlZGl0IHByb21pc2UgaXMgcmVzb2x2ZWQgKi9cclxuICAgICAgICAkaXNEZWxldGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgYmVpbmcgZWRpdGVkIGJ5IHRoZSB1c2VyICovXHJcbiAgICAgICAgJGlzRWRpdGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBOb3Qgc3RyaWN0bHkgbmVjZXNzYXJ5IGJ1dCBtYWtlcyB0aGluZ3MgYSB3aG9vb2xlIGxvdCBlYXNpZXIgKi9cclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG5cclxuICAgICAgICBzdGFydDogbnVtYmVyO1xyXG4gICAgICAgIGVuZDogbnVtYmVyO1xyXG5cclxuICAgICAgICB2YWx1ZTogVDtcclxuXHJcbiAgICAgICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><br-weekly-scheduler adapter="adapterTwo" ng-form="test2" options="model2.options"></br-weekly-scheduler><code>Result:<pre>{{ adapterTwoResult | json }}</pre></code> <code>Valid: {{ test2.$valid }}</code><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown()" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove()"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.item.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.item.$renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" get-delta="multiSliderCtrl.pixelToVal(pixel)" drag-schedule="multiSliderCtrl.dragSchedule" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: !multiSliderCtrl.item.canEditSchedule(schedule),\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.invalidMessage"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" br-full-calendar="{{ schedulerCtrl.config.fullCalendar }}" br-max-time-slot="{{ schedulerCtrl.config.maxTimeSlot }}" br-minimum-separation="{{ schedulerCtrl.config.minimumSeparation }}" br-mono-schedule="{{ schedulerCtrl.config.monoSchedule }}" br-null-end="{{ schedulerCtrl.config.nullEnds }}" br-schedule-count="{{ schedulerCtrl.config.scheduleCountOptions && schedulerCtrl.config.scheduleCountOptions.count }}" br-overlap br-revalidate drag-schedule="schedulerCtrl.dragSchedule" ghost-values="schedulerCtrl.ghostValues" ng-model="item" ng-model-options="{allowInvalid: true}" set-ghost-values="schedulerCtrl.setGhostValues(ghostValues)"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.invalidMessage">{{ schedulerCtrl.invalidMessage }}</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resizeStart(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle immediate="weeklySlotCtrl.hasDragSchedule"><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resizeEnd(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);