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
                    return $q.when(schedule);
                },
                interval: 60,
                minimumSeparation: 300,
                onChange: function (isValid) {
                },
                restrictionExplanations: {
                    maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                },
                scheduleCountOptions: {
                    count: 2
                }
            }
        };
        $scope.model2 = angular.copy($scope.model);
        $scope.model2.options.fillEmptyWithDefault = true;
        $scope.model2.options.interval = 900;
        $scope.model2.options.maxTimeSlot = 54000;
        $scope.model2.options.saveScheduler = function () {
            $scope.adapterTwoResult = $scope.adapterTwo.getSnapshot();
            return $q.when();
        };
        $scope.model.options.nullEnds = true;
        // $scope.adapter = new DemoAdapter([
        //   {
        //     day: br.weeklyScheduler.Days.Saturday,
        //     start: 1380,
        //     end: null,
        //     value: true
        //   },
        //   {
        //     day: br.weeklyScheduler.Days.Sunday,
        //     start: 600,
        //     end: null,
        //     value: true
        //   },
        //   {
        //     day: br.weeklyScheduler.Days.Monday,
        //     start: 720,
        //     end: null,
        //     value: true
        //   },
        //   {
        //     day: br.weeklyScheduler.Days.Tuesday,
        //     start: 60,
        //     end: null,
        //     value: true
        //   },
        //   {
        //     day: br.weeklyScheduler.Days.Wednesday,
        //     start: 60,
        //     end: null,
        //     value: true
        //   },
        //   {
        //     day: br.weeklyScheduler.Days.Friday,
        //     start: 0,
        //     end: null,
        //     value: true
        //   }
        // ]);
        $scope.adapterTwo = new DemoAdapter([
            // {
            //   day: br.weeklyScheduler.Days.Sunday,
            //   start: 0,
            //   end: 43200,
            //   value: true,
            //   editable: false
            // },
            {
                day: 6 /* Sunday */,
                start: 54000,
                end: 72000,
                value: true
            }
            // {
            //   day: br.weeklyScheduler.Days.Monday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Monday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Tuesday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Tuesday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Wednesday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Wednesday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Thursday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Thursday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Friday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Friday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Saturday,
            //   start: 0,
            //   end: 43200,
            //   value: true
            // },
            // {
            //   day: br.weeklyScheduler.Days.Saturday,
            //   start: 54000,
            //   end: 72000,
            //   value: true
            // }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvQWRhcHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9jb25maWd1cmF0aW9uL0NvbmZpZ3VyYXRpb25TZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvY29uZmxpY3Rpbmctb3B0aW9ucy9Db25mbGljdGluZ09wdGlvbnNTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZHJhZy9EcmFnU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L0VsZW1lbnRPZmZzZXRTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZW5kLWFkanVzdGVyL0VuZEFkanVzdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2ZpbGwtZW1wdHktd2l0aC1kZWZhdWx0L0ZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2Z1bGwtY2FsZW5kYXIvRnVsbENhbGVuZGFyRGlyZWN0aXZlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ2hvc3Qtc2xvdC9naG9zdC1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvZ3JvdXAtYnkvR3JvdXBTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL0hhbmRsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL0hvdXJseUdyaWREaXJlY3RpdmUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sYXN0LWdob3N0LWRheS9MYXN0R2hvc3REYXlTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbWF4LXRpbWUtc2xvdC9NYXhUaW1lU2xvdERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pbmltdW0tc2VwYXJhdGlvbi9NaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21pc3NpbmctZGF5cy9NaXNzaW5nRGF5c1NlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tb25vLXNjaGVkdWxlL01vbm9TY2hlZHVsZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vdXNlLXRyYWNrZXIvTW91c2VUcmFja2VyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbnVsbC1lbmQvTnVsbEVuZERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvT3ZlcmxhcFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9wdXJnZS1kZWZhdWx0L1B1cmdlRGVmYXVsdFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9SZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3JldmFsaWRhdGUvUmV2YWxpZGF0ZURpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyL3NjaGVkdWxlLWFyZWEtY29udGFpbmVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtY291bnQvU2NoZWR1bGVDb3VudERpcmVjdGl2ZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9GdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL01heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9NaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9OdWxsRW5kVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9PdmVybGFwVmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9TY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9TY3JvbGxTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9TZWNvbmRzQXNUZXh0RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9UaW1lQ29uc3RhbnRzU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvVGltZU9mRGF5RmlsdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS9UaW1lUmFuZ2VDb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90b3VjaC9Ub3VjaFNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci92YWx1ZS1ub3JtYWxpemF0aW9uL1ZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9EYXlNYXAudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9OdWxsRW5kV2lkdGgudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vV2Vla2x5U2NoZWR1bGVySXRlbS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItaXRlbS9XZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItcmFuZ2UvV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL1dlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvem9vbS9ab29tU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2FkYXB0ZXIvSVdlZWtseVNjaGVkdWxlckFkYXB0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9kcmFnLW1vZGUvRHJhZ01vZGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9pbnZhbGlkLW1lc3NhZ2UvSW52YWxpZE1lc3NhZ2VzLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcG9pbnQvSVBvaW50LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL0lSZXNpemVTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL0lSZXNpemVTZXJ2aWNlUHJvdmlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXN0cmljdGlvbi1leHBsYW5hdGlvbnMvUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1jb3VudC9TY2hlZHVsZUNvdW50T3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJPcHRpb25zLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1pdGVtL0lJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWl0ZW0vSVdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLXJhbmdlL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzVELFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXO0lBQzVFLFVBQVUsRUFBcUIsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTO1FBRWhFLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixPQUFPLEVB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S0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7U0FDakM7YUFBTTtZQUNILElBQUksS0FBSyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFuRk0saUJBQUssR0FBRyw4QkFBOEIsQ0FBQztJQUV2QyxtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFrRnBDLGtCQUFDO0NBckZELEFBcUZDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnYnIud2Vla2x5U2NoZWR1bGVyJywgJ25nTWF0ZXJpYWwnXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRxJywgJyRzY29wZScsICckdGltZW91dCcsICckbG9nJywgJyRtZERpYWxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlLCAkc2NvcGUsICR0aW1lb3V0LCAkbG9nLCAkbWREaWFsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBidXR0b25DbGFzc2VzOiBbJ3dvdyEnXSxcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERlbW9JdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uIChzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHEud2hlbihzY2hlZHVsZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaW50ZXJ2YWw6IDYwLFxyXG4gICAgICAgICAgbWluaW11bVNlcGFyYXRpb246IDMwMCxcclxuICAgICAgICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4ge1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zOiB7XHJcbiAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBTbG90cyBjYW5ub3QgYmUgbG9uZ2VyIHRoYW4gJHt2YWx1ZX0hYFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjaGVkdWxlQ291bnRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvdW50OiAyXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PlxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyID0gYW5ndWxhci5jb3B5KCRzY29wZS5tb2RlbCk7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tb2RlbDIub3B0aW9ucy5pbnRlcnZhbCA9IDkwMDtcclxuICAgICAgJHNjb3BlLm1vZGVsMi5vcHRpb25zLm1heFRpbWVTbG90ID0gNTQwMDA7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMuc2F2ZVNjaGVkdWxlciA9ICgpID0+IHtcclxuICAgICAgICAkc2NvcGUuYWRhcHRlclR3b1Jlc3VsdCA9ICRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCk7XHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsLm9wdGlvbnMubnVsbEVuZHMgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gJHNjb3BlLmFkYXB0ZXIgPSBuZXcgRGVtb0FkYXB0ZXIoW1xyXG4gICAgICAvLyAgIHtcclxuICAgICAgLy8gICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU2F0dXJkYXksXHJcbiAgICAgIC8vICAgICBzdGFydDogMTM4MCxcclxuICAgICAgLy8gICAgIGVuZDogbnVsbCxcclxuICAgICAgLy8gICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgIC8vICAgfSxcclxuICAgICAgLy8gICB7XHJcbiAgICAgIC8vICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheSxcclxuICAgICAgLy8gICAgIHN0YXJ0OiA2MDAsXHJcbiAgICAgIC8vICAgICBlbmQ6IG51bGwsXHJcbiAgICAgIC8vICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAvLyAgIH0sXHJcbiAgICAgIC8vICAge1xyXG4gICAgICAvLyAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5Nb25kYXksXHJcbiAgICAgIC8vICAgICBzdGFydDogNzIwLFxyXG4gICAgICAvLyAgICAgZW5kOiBudWxsLFxyXG4gICAgICAvLyAgICAgdmFsdWU6IHRydWVcclxuICAgICAgLy8gICB9LFxyXG4gICAgICAvLyAgIHtcclxuICAgICAgLy8gICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVHVlc2RheSxcclxuICAgICAgLy8gICAgIHN0YXJ0OiA2MCxcclxuICAgICAgLy8gICAgIGVuZDogbnVsbCxcclxuICAgICAgLy8gICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgIC8vICAgfSxcclxuICAgICAgLy8gICB7XHJcbiAgICAgIC8vICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheSxcclxuICAgICAgLy8gICAgIHN0YXJ0OiA2MCxcclxuICAgICAgLy8gICAgIGVuZDogbnVsbCxcclxuICAgICAgLy8gICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgIC8vICAgfSxcclxuICAgICAgLy8gICB7XHJcbiAgICAgIC8vICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgLy8gICAgIHN0YXJ0OiAwLFxyXG4gICAgICAvLyAgICAgZW5kOiBudWxsLFxyXG4gICAgICAvLyAgICAgdmFsdWU6IHRydWVcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vIF0pO1xyXG5cclxuICAgICAgJHNjb3BlLmFkYXB0ZXJUd28gPSBuZXcgRGVtb0FkYXB0ZXIoW1xyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgLy8gICBlbmQ6IDQzMjAwLFxyXG4gICAgICAgIC8vICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgLy8gICBlZGl0YWJsZTogZmFsc2VcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuU3VuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDU0MDAwLFxyXG4gICAgICAgICAgZW5kOiA3MjAwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuTW9uZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgLy8gICBlbmQ6IDQzMjAwLFxyXG4gICAgICAgIC8vICAgdmFsdWU6IHRydWVcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuTW9uZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDU0MDAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA3MjAwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlR1ZXNkYXksXHJcbiAgICAgICAgLy8gICBzdGFydDogMCxcclxuICAgICAgICAvLyAgIGVuZDogNDMyMDAsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDU0MDAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA3MjAwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA0MzIwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiA1NDAwMCxcclxuICAgICAgICAvLyAgIGVuZDogNzIwMDAsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UaHVyc2RheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA0MzIwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlRodXJzZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDU0MDAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA3MjAwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA0MzIwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiA1NDAwMCxcclxuICAgICAgICAvLyAgIGVuZDogNzIwMDAsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA0MzIwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDU0MDAwLFxyXG4gICAgICAgIC8vICAgZW5kOiA3MjAwMCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5zYXZlQWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRzY29wZS5yZXN1bHQgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUuYWRhcHRlci5nZXRTbmFwc2hvdCgpKSArIEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCkpO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9JdGVtIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGJvb2xlYW4+IHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLFxyXG4gICAgcHVibGljIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPltdXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBnZXQgZWRpdGFibGUoKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBUaGUgZGF0YSBpcyBhbHJlYWR5IGluIGFuIGFjY2VwdGFibGUgZm9ybWF0IGZvciB0aGUgZGVtbyBzbyBqdXN0IHBhc3MgaXQgdGhyb3VnaCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9BZGFwdGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj4sIGJvb2xlYW4+IHtcclxuICBwdWJsaWMgaXRlbXM6IERlbW9JdGVtW10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgaW5pdGlhbERhdGE6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj5bXSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTbmFwc2hvdCgpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLml0ZW1zLm1hcChpdGVtID0+IHtcclxuICAgICAgcmV0dXJuIGl0ZW0uc2NoZWR1bGVzLm1hcChzY2hlZHVsZSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGRheTogc2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBzY2hlZHVsZS5lbmQsXHJcbiAgICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShyYW5nZSkge1xyXG4gICAgcmFuZ2UuJGNsYXNzID0gJ3Rlc3QnO1xyXG5cclxuICAgIHJldHVybiByYW5nZTtcclxuICB9XHJcbn1cclxuIiwiYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQWRhcHRlclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQWRhcHRlclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBncm91cFNlcnZpY2U6IEdyb3VwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SXRlbXNGcm9tQWRhcHRlcihjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgYWRhcHRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55Pikge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKGFkYXB0ZXIpIHtcclxuICAgICAgICAgIGxldCBzY2hlZHVsZXMgPSBhZGFwdGVyLmluaXRpYWxEYXRhLm1hcChkYXRhID0+IGFkYXB0ZXIuY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGRhdGEpKTtcclxuICAgICAgICAgIGxldCBncm91cGVkU2NoZWR1bGVzID0gdGhpcy5ncm91cFNlcnZpY2UuZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuICAgIFxyXG4gICAgICAgICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWRTY2hlZHVsZXMpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1GYWN0b3J5LmNyZWF0ZUl0ZW0oY29uZmlnLCBwYXJzZUludChrZXksIDEwKSwgZ3JvdXBlZFNjaGVkdWxlc1trZXldKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQWRhcHRlclNlcnZpY2UuJG5hbWUsIEFkYXB0ZXJTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBDb25maWd1cmF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25maWd1cmF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyVGltZUNvbnN0YW50c1NlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB0aW1lQ29uc3RhbnRzOiBUaW1lQ29uc3RhbnRzU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbmZpZ3VyYXRpb24ob3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDkwMDsgLy8gc2Vjb25kc1xyXG4gICAgICAgIHZhciBpbnRlcnZhbENvdW50ID0gdGhpcy50aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fREFZIC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0gdGhpcy5nZXREZWZhdWx0T3B0aW9ucygpO1xyXG5cclxuICAgICAgICB2YXIgdXNlck9wdGlvbnMgPSBhbmd1bGFyLm1lcmdlKGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKHVzZXJPcHRpb25zLCB7XHJcbiAgICAgICAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgICAgICAgbWF4VmFsdWU6IHRoaXMudGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX0RBWSxcclxuICAgICAgICAgICAgaG91ckNvdW50OiB0aGlzLnRpbWVDb25zdGFudHMuSE9VUlNfSU5fREFZLFxyXG4gICAgICAgICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdE9wdGlvbnMoKTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgICAgICAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBvbkNoYW5nZTogKCkgPT4gYW5ndWxhci5ub29wKCksXHJcbiAgICAgICAgICAgIG9uUmVtb3ZlOiAoKSA9PiBhbmd1bGFyLm5vb3AoKSxcclxuICAgICAgICAgICAgcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1heFRpbWVTbG90OiAodmFsdWUpID0+IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHt2YWx1ZX1gLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bVNlcGFyYXRpb246ICh2YWx1ZSkgPT4gYFNsb3RzIG11c3QgYmUgYXQgbGVhc3QgJHt2YWx1ZX0gYXBhcnQhYCxcclxuICAgICAgICAgICAgICAgIGZ1bGxDYWxlbmRhcjogJ0ZvciB0aGlzIGNhbGVuZGFyLCBldmVyeSBkYXkgbXVzdCBiZSBjb21wbGV0ZWx5IGZ1bGwgb2Ygc2NoZWR1bGVzLicsXHJcbiAgICAgICAgICAgICAgICBtb25vU2NoZWR1bGU6ICdUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgb25lIHRpbWUgc2xvdCBwZXIgZGF5JyxcclxuICAgICAgICAgICAgICAgIG51bGxFbmRzOiAnSXRlbXMgaW4gdGhpcyBjYWxlbmRhciBkbyBub3QgaGF2ZSBlbmQgdGltZXMuIFNjaGVkdWxlZCBldmVudHMgYmVnaW4gYXQgdGhlIHN0YXJ0IHRpbWUgYW5kIGVuZCB3aGVuIHRoZXkgYXJlIGZpbmlzaGVkLicsXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZUNvdW50OiAob3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwbHVyYWxpemVkU2xvdCA9ICdzbG90JyArIChvcHRpb25zLmNvdW50ID09PSAxID8gJycgOiAncycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5leGFjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFRoaXMgY2FsZW5kYXIgbXVzdCBoYXZlIGV4YWN0bHkgJHtvcHRpb25zLmNvdW50fSAke3BsdXJhbGl6ZWRTbG90fSBwZXIgZGF5YDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFRoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBhIG1heGltdW0gb2YgJHtvcHRpb25zLmNvdW50fSAke3BsdXJhbGl6ZWRTbG90fSBwZXIgZGF5YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjaGVkdWxlQ291bnRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjb3VudDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKENvbmZpZ3VyYXRpb25TZXJ2aWNlLiRuYW1lLCBDb25maWd1cmF0aW9uU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb25mbGljdGluZ09wdGlvbnNTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29uZmxpY3RpbmdPcHRpb25zKG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+KSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZnVsbENhbGVuZGFyICYmIG9wdGlvbnMuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGBPcHRpb25zICdmdWxsQ2FsZW5kYXInICYgJ2ZpbGxFbXB0eVdpdGhEZWZhdWx0JyBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLmA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5maWxsRW1wdHlXaXRoRGVmYXVsdCAmJiAhYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgSWYgdXNpbmcgb3B0aW9uICdmaWxsRW1wdHlXaXRoRGVmYXVsdCcsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSAnZGVmYXVsdFZhbHVlLidgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZS4kbmFtZSwgQ29uZmxpY3RpbmdPcHRpb25zU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRHJhZ1NlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRHJhZ1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcmFuZ2VGYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREcmFnUmFuZ2VGcm9tU2NoZWR1bGUoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGNvbmZpZy5udWxsRW5kcyA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIHNjaGVkdWxlLmVuZCksXHJcbiAgICAgICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRHJhZ1NlcnZpY2UuJG5hbWUsIERyYWdTZXJ2aWNlKTtcclxuIiwiLyoqXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb25cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgalF1ZXJ5IHRvIGtlZXAgZGVwZW5kZW5jaWVzIG1pbmltYWxcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEVsZW1lbnRPZmZzZXRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgbGVmdCgkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICAgICAgcmV0dXJuICRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJpZ2h0KCRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbGVtZW50T2Zmc2V0U2VydmljZS4kbmFtZSwgRWxlbWVudE9mZnNldFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEVuZEFkanVzdGVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JNb2RlbChjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSBjb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbmRBZGp1c3RlclNlcnZpY2UuJG5hbWUsIEVuZEFkanVzdGVyU2VydmljZSk7XHJcbiIsIi8qKiBXaGVuIHVzaW5nIHRoZSAnZmlsbEVtcHR5V2l0aERlZmF1bHQnIG9wdGlvbiwgdGhpcyBzZXJ2aWNlIHdpbGwgYmUgdXNlZCB0byBjb25zdHJ1Y3QgdGhlIGNvcnJlY3QgY2FsZW5kYXIgZm9yIHNlcnZlciBzdWJtaXNzaW9uICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBmaWxsKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10ge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgaWYgKCFzY2hlZHVsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbdGhpcy5nZXRFbXB0eVNjaGVkdWxlKGl0ZW0sIGNvbmZpZyldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzKHNjaGVkdWxlcywgY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEVtcHR5U2NoZWR1bGUoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBpdGVtLmRheSxcclxuICAgICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwoY29uZmlnLCBjb25maWcubWF4VmFsdWUpLFxyXG4gICAgICAgICAgICB2YWx1ZTogY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RW5kU2NoZWR1bGUobGFzdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHtcclxuICAgICAgICAgICAgZGF5OiBsYXN0U2NoZWR1bGUuZGF5LFxyXG4gICAgICAgICAgICBzdGFydDogbGFzdFNjaGVkdWxlLmVuZCxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbChjb25maWcsIGNvbmZpZy5tYXhWYWx1ZSksXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0YXJ0U2NoZWR1bGUoZmlyc3RTY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZUZhY3RvcnkuY3JlYXRlUmFuZ2UoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGRheTogZmlyc3RTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgICBlbmQ6IGZpcnN0U2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIHZhbHVlOiBjb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXNGb3JTaW5nbGVTY2hlZHVsZShzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gW3NjaGVkdWxlXTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlVG91Y2hlc1N0YXJ0KHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0U3RhcnRTY2hlZHVsZShzY2hlZHVsZSwgY29uZmlnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5wdXNoKHRoaXMuZ2V0RW5kU2NoZWR1bGUoc2NoZWR1bGUsIGNvbmZpZykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U29ydGVkU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRGaWxsZWRTY2hlZHVsZXMoc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgc2NoZWR1bGVzID0gdGhpcy5nZXRTb3J0ZWRTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuXHJcbiAgICAgICAgaWYgKHNjaGVkdWxlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsbGVkU2NoZWR1bGVzRm9yU2luZ2xlU2NoZWR1bGUoc2NoZWR1bGVzWzBdLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIgYXQgYSB0aW1lXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFNjaGVkdWxlID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dFNjaGVkdWxlID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc0ZpcnN0TG9vcCA9IGkgPT0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0ZpcnN0TG9vcCAmJiAhdGhpcy5zY2hlZHVsZVRvdWNoZXNTdGFydChjdXJyZW50U2NoZWR1bGUsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydFNjaGVkdWxlID0gdGhpcy5nZXRTdGFydFNjaGVkdWxlKGN1cnJlbnRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChzdGFydFNjaGVkdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlc1RvdWNoKGN1cnJlbnRTY2hlZHVsZSwgbmV4dFNjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1NjaGVkdWxlID0gdGhpcy5nZXROZXdTY2hlZHVsZShjdXJyZW50U2NoZWR1bGUsIG5leHRTY2hlZHVsZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMucHVzaChuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpc0xhc3RMb29wID0gaSA9PSBsZW4gLSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTGFzdExvb3AgJiYgIXRoaXMuc2NoZWR1bGVUb3VjaGVzRW5kKG5leHRTY2hlZHVsZSwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZFNjaGVkdWxlID0gdGhpcy5nZXRFbmRTY2hlZHVsZShuZXh0U2NoZWR1bGUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnB1c2goZW5kU2NoZWR1bGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmV3U2NoZWR1bGUoY3VycmVudFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBuZXh0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKGNvbmZpZywge1xyXG4gICAgICAgICAgICBkYXk6IGN1cnJlbnRTY2hlZHVsZS5kYXksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50U2NoZWR1bGUuZW5kLFxyXG4gICAgICAgICAgICBlbmQ6IG5leHRTY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNvcnRlZFNjaGVkdWxlcyhzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydCAtIGIuc3RhcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVzVG91Y2goZWFybGllclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBsYXRlclNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIGVhcmxpZXJTY2hlZHVsZS5lbmQgPT09IGxhdGVyU2NoZWR1bGUuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVRvdWNoZXNTdGFydChzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUuc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByaXZhdGUgc2NoZWR1bGVUb3VjaGVzRW5kKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZS5lbmQgPT09IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvck1vZGVsKGNvbmZpZywgY29uZmlnLm1heFZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS4kbmFtZSwgRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyRnVsbENhbGVuZGFyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ickZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bGxDYWxlbmRhckRpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoRnVsbENhbGVuZGFyRGlyZWN0aXZlLiRuYW1lLCBGdWxsQ2FsZW5kYXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3RDb250cm9sbGVyJztcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ2dob3N0U2xvdEN0cmwnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5XHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG11bHRpU2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyR2hvc3RTbG90JztcclxuXHJcbiAgICBjb250cm9sbGVyID0gR2hvc3RTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IEdob3N0U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIG11bHRpU2xpZGVyQ3RybDogJ15ick11bHRpU2xpZGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8bmctdHJhbnNjbHVkZSBjbGFzcz1cImZ1bGxXaWR0aFwiPjwvbmctdHJhbnNjbHVkZT5cclxuICAgIGA7XHJcblxyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbn1cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWUsIEdob3N0U2xvdENvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KEdob3N0U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IEdob3N0U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnLFxyXG4gICAgaW1tZWRpYXRlOiAnPCdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciBtb3VzZVRyYWNrZXJTZXJ2aWNlID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlO1xyXG4gICAgdmFyIHRvdWNoU2VydmljZSA9IHRoaXMudG91Y2hTZXJ2aWNlO1xyXG4gICAgdmFyIHggPSAwO1xyXG5cclxuICAgIGxldCBtb3VzZWRvd25FdmVudDogc3RyaW5nID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0JztcclxuICAgIGxldCBtb3VzZW1vdmVFdmVudDogc3RyaW5nID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUnO1xyXG4gICAgbGV0IG1vdXNldXBFdmVudDogc3RyaW5nID0gJ21vdXNldXAgdG91Y2hlbmQnO1xyXG5cclxuICAgIGVsZW1lbnQub24obW91c2Vkb3duRXZlbnQsIG1vdXNlZG93bik7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vkb3duKGV2ZW50KSB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBoYW5kbGVycyBmcm9tIGJlaW5nIGZpcmVkIGlmIHRoZXkgYXJlIG5lc3RlZCAob25seSB0aGUgb25lIHlvdSBkaXJlY3RseSBpbnRlcmFjdGVkIHdpdGggc2hvdWxkIGZpcmUpXHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgc3RhcnREcmFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmFrZU1vdXNlZG93bigpIHtcclxuICAgICAgeCA9IG1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpLng7XHJcblxyXG4gICAgICBzdGFydERyYWcoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYWdlWChldmVudCkge1xyXG4gICAgICByZXR1cm4gZXZlbnQucGFnZVggfHwgdG91Y2hTZXJ2aWNlLmdldFBhZ2VYKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0RHJhZygpIHtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNlbW92ZUV2ZW50LCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQub24obW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RhcnQpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5QXN5bmMoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2NvcGUuaW1tZWRpYXRlKSB7XHJcbiAgICAgIGZha2VNb3VzZWRvd24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZG9jdW1lbnQ6IGFuZ3VsYXIuSURvY3VtZW50U2VydmljZSxcclxuICAgIHByaXZhdGUgbW91c2VUcmFja2VyU2VydmljZTogTW91c2VUcmFja2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgdG91Y2hTZXJ2aWNlOiBUb3VjaFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSkgPT4gbmV3IEhhbmRsZURpcmVjdGl2ZSgkZG9jdW1lbnQsIG1vdXNlVHJhY2tlclNlcnZpY2UsIHRvdWNoU2VydmljZSk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCcsICdicldlZWtseVNjaGVkdWxlck1vdXNlVHJhY2tlclNlcnZpY2UnLCAnYnJXZWVrbHlTY2hlZHVsZXJUb3VjaFNlcnZpY2UnXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShIYW5kbGVEaXJlY3RpdmUuJG5hbWUsIEhhbmRsZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JySG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ15icldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkVsZW1lbnRzOiBob3VyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBTdHJpcGUgaXQgYnkgaG91clxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IHRoaXMudGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX0hPVVIgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHRpbWVDb25zdGFudHM6IFRpbWVDb25zdGFudHNTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHRpbWVDb25zdGFudHMpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKHRpbWVDb25zdGFudHMpO1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJUaW1lQ29uc3RhbnRzU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShIb3VybHlHcmlkRGlyZWN0aXZlLiRuYW1lLCBIb3VybHlHcmlkRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTGFzdEdob3N0RGF5U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJMYXN0R2hvc3REYXlTZXJ2aWNlJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gZHJhZ2dpbmcgZ2hvc3RzIGFjcm9zcyBtdWx0aXBsZSBkYXlzLCBpZiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgcG9pbnRlciBvdXQgb2Ygb25lIGV4dHJlbWUgYW5kIGJhY2sgaW50byB0aGUgbGFzdCBzbG90IHRoYXQgcmVuZGVyZWQgYSBnaG9zdCxcclxuICAgICAqIFdlIHNob3VsZCByZW1vdmUgdGhlIGdob3N0IGZyb20gdGhhdCBleHRyZW1lLiBUaGlzIHdpbGwgaGVscCBncmFiIHRoZSBjb3JyZWN0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TGFzdEdob3N0RGF5KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleCA9IHRoaXMuZ2V0T3JpZ2luSW5kZXgoaXRlbXMpO1xyXG4gICAgICAgIGxldCByZW5kZXJlZEdob3N0SW5kaWNlcyA9IHRoaXMuZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXMpO1xyXG5cclxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIG90aGVyICRyZW5kZXJHaG9zdCBpdGVtcyBhcmUgYWJvdmUgb3IgYmVsb3cgdGhlICRpc0dob3N0T3JpZ2luIGl0ZW1cclxuICAgICAgICBsZXQgYWJvdmUgPSByZW5kZXJlZEdob3N0SW5kaWNlcy5ldmVyeShpID0+IGkgPD0gb3JpZ2luSW5kZXgpO1xyXG5cclxuICAgICAgICAvLyB0YWtlIGZpcnN0IGl0ZW0gZm9yIGFib3ZlIG9yIGxhc3QgaXRlbSBmb3IgYmVsb3dcclxuICAgICAgICBsZXQgbGFzdEdob3N0RGF5SW5kZXggPSBhYm92ZSA/IDAgOiByZW5kZXJlZEdob3N0SW5kaWNlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVuZGVyZWRHaG9zdEluZGljZXNbbGFzdEdob3N0RGF5SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgdGhlIGluZGV4IG9mIHRoZSAkaXNHaG9zdE9yaWdpbiBpdGVtICovXHJcbiAgICBwcml2YXRlIGdldE9yaWdpbkluZGV4KGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgICAgIGxldCBvcmlnaW5JbmRleDtcclxuICAgICAgICBsZXQgbGVuID0gaXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtLiRpc0dob3N0T3JpZ2luKSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5JbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbkluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBHZXQgYWxsIG9mIHRoZSBpdGVtIGluZGljZXMgdGhhdCBjdXJyZW50bHkgaGF2ZSBnaG9zdHMgcmVuZGVyZWQgKi9cclxuICAgIHByaXZhdGUgZ2V0UmVuZGVyZWRHaG9zdEluZGljZXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICAgICAgbGV0IHJlbmRlcmVkR2hvc3RJbmRpY2VzID0gW107XHJcbiAgICAgICAgbGV0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSBpdGVtc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlcmVkR2hvc3RJbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZW5kZXJlZEdob3N0SW5kaWNlcztcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKExhc3RHaG9zdERheVNlcnZpY2UuJG5hbWUsIExhc3RHaG9zdERheVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1heFRpbWVTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdick1heFRpbWVTbG90JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyTWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3IuZXJyb3JdID0gKG1vZGVsVmFsdWU6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICh2YWxpZGF0b3IpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXhUaW1lU2xvdERpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShNYXhUaW1lU2xvdERpcmVjdGl2ZS4kbmFtZSwgTWF4VGltZVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWluaW11bVNlcGFyYXRpb25EaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTWluaW11bVNlcGFyYXRpb24nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdmFsaWRhdG9yOiBNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoYXR0cnMuYnJNaW5pbXVtU2VwYXJhdGlvbikge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1pbmltdW1TZXBhcmF0aW9uRGlyZWN0aXZlKHZhbGlkYXRvcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyTWluaW11bVNlcGFyYXRpb25WYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKE1pbmltdW1TZXBhcmF0aW9uRGlyZWN0aXZlLiRuYW1lLCBNaW5pbXVtU2VwYXJhdGlvbkRpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1pc3NpbmdEYXlzU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaXNzaW5nRGF5c1NlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBkYXlNYXA6IERheU1hcCxcclxuICAgICAgICBwcml2YXRlIGl0ZW1GYWN0b3J5OiBXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2NoZWR1bGVyIHNob3VsZCBhbHdheXMgc2hvdyBhbGwgZGF5cywgZXZlbiBpZiBpdCB3YXMgbm90IHBhc3NlZCBhbnkgc2NoZWR1bGVzIGZvciB0aGF0IGRheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZmlsbEl0ZW1zKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSA9IFtdO1xyXG5cclxuICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5kYXlNYXAsIChkYXk6IHN0cmluZywgc3RyaW5nS2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5kYXkgPT09IGtleSk7XHJcbiAgICAgICAgICBsZXQgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gZmlsdGVyZWRJdGVtcy5sZW5ndGggPyBmaWx0ZXJlZEl0ZW1zWzBdIDogbnVsbDtcclxuICAgIFxyXG4gICAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuaXRlbUZhY3RvcnkuY3JlYXRlSXRlbShjb25maWcsIGtleSwgW10pKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICAgICAgaXRlbS5sYWJlbCA9IGRheTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkocmVzdWx0KS5zb3J0KChhLCBiKSA9PiBhLmRheSAtIGIuZGF5KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1pc3NpbmdEYXlzU2VydmljZS4kbmFtZSwgTWlzc2luZ0RheXNTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyTW9ub1NjaGVkdWxlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChhdHRycy5ick1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbm9TY2hlZHVsZURpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoTW9ub1NjaGVkdWxlRGlyZWN0aXZlLiRuYW1lLCBNb25vU2NoZWR1bGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW91c2VUcmFja2VyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb3VzZVRyYWNrZXJTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG1vdXNlUG9zaXRpb246IElQb2ludDtcclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSc7XHJcblxyXG4gICAgICAgIGxldCBldmVudCA9IHRoaXMuc2V0TW91c2VQb3NpdGlvbi5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLiRkb2N1bWVudC51bmJpbmQoZXZlbnROYW1lLCBldmVudCk7XHJcbiAgICAgICAgdGhpcy4kZG9jdW1lbnQub24oZXZlbnROYW1lLCBldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vdXNlUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VQb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldE1vdXNlUG9zaXRpb24oZXZlbnQpIHtcclxuICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSB7IHg6IGV2ZW50LnBhZ2VYLCB5OiBldmVudC5wYWdlWSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW91c2VUcmFja2VyU2VydmljZS4kbmFtZSwgTW91c2VUcmFja2VyU2VydmljZSlcclxuICAgIC5ydW4oW01vdXNlVHJhY2tlclNlcnZpY2UuJG5hbWUsIChtb3VzZVRyYWNrZXJTZXJ2aWNlOiBNb3VzZVRyYWNrZXJTZXJ2aWNlKSA9PiB7XHJcbiAgICAgICAgbW91c2VUcmFja2VyU2VydmljZS5pbml0aWFsaXplKCk7XHJcbiAgICB9XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHEnLFxyXG4gICAgJyRzY29wZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbGVtZW50T2Zmc2V0U2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTW91c2VUcmFja2VyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlclZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgZWxlbWVudE9mZnNldFNlcnZpY2U6IEVsZW1lbnRPZmZzZXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbW91c2VUcmFja2VyU2VydmljZTogTW91c2VUcmFja2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5LFxyXG4gICAgcHJpdmF0ZSB2YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlOiBWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkcmFnU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcbiAgcHJpdmF0ZSBwZW5kaW5nU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnRpbmdHaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG4gIHByaXZhdGUgc2V0R2hvc3RWYWx1ZXM6IChvcHRpb25zOiB7IGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9IH0pID0+IHZvaWQ7XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIFxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gIHB1YmxpYyAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWVudGVyJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9uTW91c2VFbnRlcigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2VsZWF2ZScsICgpID0+IHtcclxuICAgICAgdGhpcy5vbk1vdXNlTGVhdmUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICAgICB0aGlzLm9uTW91c2VVcCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DT01NSVRfR0hPU1QsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBnaG9zdFNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgICAgdGhpcy5jb21taXRHaG9zdChnaG9zdFNjaGVkdWxlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfR0hPU1QsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXk6IG51bWJlcikgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuaXRlbS4kaXNHaG9zdE9yaWdpbiAmJiB0aGlzLml0ZW0uZGF5ID09PSBkYXkpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdob3N0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0FMTF9HSE9TVFMsICgpID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVHaG9zdCgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VFbnRlcigpIHtcclxuICAgIC8vIElmIHRoZSBjdXJzb3IgaXMgbW92aW5nIEJBQ0sgaW50byBhbiBpdGVtIHRoYXQgQUxSRUFEWSBoYXMgYSBnaG9zdCByZW5kZXJlZCwgd2UnbGwgd2FudCB0byByZW1vdmUgdGhlIGdob3N0IGZyb20gdGhlIGl0ZW0gdGhhdCB3YXMgbGVmdFxyXG4gICAgaWYgKHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QpIHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFTU9WRV9MQVNUX0dIT1NUKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5kcmFnU2NoZWR1bGUpIHtcclxuICAgICAgdGhpcy5hZGREcmFnU2NoZWR1bGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5naG9zdFZhbHVlcyAmJiAhdGhpcy5pdGVtLiRyZW5kZXJHaG9zdCkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUdob3N0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2VMZWF2ZSgpIHtcclxuICAgIGlmICh0aGlzLmRyYWdTY2hlZHVsZSkge1xyXG4gICAgICB0aGlzLnJlbW92ZURyYWdTY2hlZHVsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vdXNlVXAoKSB7XHJcbiAgICBpZiAodGhpcy5wZW5kaW5nU2NoZWR1bGUpIHtcclxuICAgICAgdGhpcy5jb21taXREcmFnU2NoZWR1bGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgdGhpcy5kcmFnU2NoZWR1bGUuZGF5ID0gdGhpcy5pdGVtLmRheTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlID0gdGhpcy5pdGVtLmFkZFNjaGVkdWxlKHRoaXMuZHJhZ1NjaGVkdWxlKTtcclxuICAgIHRoaXMucGVuZGluZ1NjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZURyYWdTY2hlZHVsZSgpIHtcclxuICAgIHRoaXMuaXRlbS5yZW1vdmVTY2hlZHVsZSh0aGlzLmRyYWdTY2hlZHVsZSk7XHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21taXREcmFnU2NoZWR1bGUoKSB7XHJcbiAgICB0aGlzLnBlbmRpbmdTY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgdGhpcy5pdGVtLm1lcmdlU2NoZWR1bGUodGhpcy5wZW5kaW5nU2NoZWR1bGUpO1xyXG4gICAgdGhpcy5wZW5kaW5nU2NoZWR1bGUgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTY2hlZHVsZUZvckFkZChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgc3RhcnQgPSB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUoc3RhcnQsIDAsIGVuZCk7XHJcbiAgICBlbmQgPSB0aGlzLnZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2Uubm9ybWFsaXplVmFsdWUoZW5kLCBzdGFydCwgdGhpcy5jb25maWcubWF4VmFsdWUpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICBlbmQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzY2hlZHVsZSA9IHtcclxuICAgICAgZGF5OiB0aGlzLml0ZW0uZGF5LFxyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBzY2hlZHVsZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb3BlbkVkaXRvckZvckFkZChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogYW5ndWxhci5JUHJvbWlzZTxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4+IHtcclxuICAgIGlmICh0aGlzLml0ZW0uY2FuRWRpdCgpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcS53aGVuKHNjaGVkdWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBFeHBhbmQgZ2hvc3Qgd2hpbGUgZHJhZ2dpbmcgaW4gaXQgKi9cclxuICBwdWJsaWMgYWRqdXN0R2hvc3QoKSB7XHJcbiAgICBsZXQgcG9pbnQgPSB0aGlzLm1vdXNlVHJhY2tlclNlcnZpY2UuZ2V0TW91c2VQb3NpdGlvbigpO1xyXG4gICAgbGV0IG1vdXNlVmFsdWU6IG51bWJlciA9IHRoaXMuZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKHBvaW50LngpO1xyXG5cclxuICAgIGxldCBleGlzdGluZ0xlZnRWYWx1ZTogbnVtYmVyID0gdGhpcy5zdGFydGluZ0dob3N0VmFsdWVzLmxlZnQ7XHJcblxyXG4gICAgbGV0IHVwZGF0ZWRMZWZ0VmFsdWU6IG51bWJlcjtcclxuICAgIGxldCB1cGRhdGVkUmlnaHRWYWx1ZTogbnVtYmVyO1xyXG4gICAgXHJcbiAgICBpZiAobW91c2VWYWx1ZSA8IGV4aXN0aW5nTGVmdFZhbHVlKSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgbGVmdFxyXG4gICAgICB1cGRhdGVkTGVmdFZhbHVlID0gbW91c2VWYWx1ZTtcclxuICAgICAgdXBkYXRlZFJpZ2h0VmFsdWUgPSBleGlzdGluZ0xlZnRWYWx1ZTtcclxuICAgIH0gZWxzZSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgcmlnaHRcclxuICAgICAgdXBkYXRlZExlZnRWYWx1ZSA9IGV4aXN0aW5nTGVmdFZhbHVlO1xyXG4gICAgICB1cGRhdGVkUmlnaHRWYWx1ZSA9IG1vdXNlVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGdob3N0VmFsdWVzID0ge1xyXG4gICAgICBsZWZ0OiB0aGlzLm5vcm1hbGl6ZUdob3N0VmFsdWUodXBkYXRlZExlZnRWYWx1ZSksXHJcbiAgICAgIHJpZ2h0OiB0aGlzLm5vcm1hbGl6ZUdob3N0VmFsdWUodXBkYXRlZFJpZ2h0VmFsdWUpXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc2V0R2hvc3RWYWx1ZXMoeyBcclxuICAgICAgZ2hvc3RWYWx1ZXM6IGdob3N0VmFsdWVzXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLyoqIE1vdmUgZ2hvc3QgYXJvdW5kIHdoaWxlIG5vdCBkcmFnZ2luZyAqL1xyXG4gIHB1YmxpYyBwb3NpdGlvbkdob3N0KCkge1xyXG4gICAgbGV0IHBvaW50ID0gdGhpcy5tb3VzZVRyYWNrZXJTZXJ2aWNlLmdldE1vdXNlUG9zaXRpb24oKTtcclxuICAgIGxldCB2YWwgPSB0aGlzLmdldFZhbEF0TW91c2VQb3NpdGlvbihwb2ludC54KTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMgPSB7XHJcbiAgICAgIGxlZnQ6IHZhbCxcclxuICAgICAgcmlnaHQ6IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdmFsICsgdGhpcy5udWxsRW5kV2lkdGggOiB2YWwgKyB0aGlzLmNvbmZpZy5pbnRlcnZhbFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnNldEdob3N0VmFsdWVzKHtcclxuICAgICAgZ2hvc3RWYWx1ZXM6IGFuZ3VsYXIuY29weSh0aGlzLnN0YXJ0aW5nR2hvc3RWYWx1ZXMpXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlRG93bigpIHtcclxuICAgIGlmICghdGhpcy5pdGVtLmVkaXRhYmxlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLml0ZW0uJGlzR2hvc3RPcmlnaW4gPSB0cnVlO1xyXG4gICAgdGhpcy5jcmVhdGVHaG9zdCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VNb3ZlKCkge1xyXG4gICAgLy8gbnVsbEVuZHMgY2FsZW5kYXJzIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgYmVjYXVzZSB0aGUgc2l6ZSBvZiB0aGUgc2xvdCBkb2Vzbid0IHJlYWxseSBtYXR0ZXJcclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uR2hvc3QoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLml0ZW0uJHJlbmRlckdob3N0KSB7XHJcbiAgICAgIHRoaXMuYWRqdXN0R2hvc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkdob3N0V3JhcHBlck1vdXNlVXAoKSB7XHJcbiAgICBsZXQgZ2hvc3RTY2hlZHVsZSA9IHRoaXMuZ2V0U2NoZWR1bGVGb3JBZGQodGhpcy5naG9zdFZhbHVlcy5sZWZ0LCB0aGlzLmdob3N0VmFsdWVzLnJpZ2h0KTtcclxuXHJcbiAgICB0aGlzLm9wZW5FZGl0b3JGb3JBZGQoZ2hvc3RTY2hlZHVsZSkudGhlbihlZGl0ZWRHaG9zdFNjaGVkdWxlID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkdIT1NUX0RSQUdfRU5ERUQsIGVkaXRlZEdob3N0U2NoZWR1bGUpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICB0aGlzLiRzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0FOQ0VMX0dIT1NUKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVHaG9zdCgpIHtcclxuICAgIHRoaXMuaXRlbS4kcmVuZGVyR2hvc3QgPSB0cnVlO1xyXG4gICAgdGhpcy5wb3NpdGlvbkdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbW1pdEdob3N0KGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLml0ZW0uY2FuQWRkU2NoZWR1bGUoKSkge1xyXG4gICAgICB0aGlzLml0ZW0uYWRkU2NoZWR1bGVBbmRNZXJnZShnaG9zdFNjaGVkdWxlKTtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbW92ZUdob3N0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE1vdXNlUG9zaXRpb24ocGFnZVg6IG51bWJlcikge1xyXG4gICAgbGV0IGVsZW1lbnRPZmZzZXRYID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgbGV0IGxlZnQgPSBwYWdlWCAtIGVsZW1lbnRPZmZzZXRYO1xyXG5cclxuICAgIHJldHVybiBsZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRWYWxBdE1vdXNlUG9zaXRpb24ocGFnZVg6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHRoaXMucGl4ZWxUb1ZhbCh0aGlzLmdldE1vdXNlUG9zaXRpb24ocGFnZVgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm0gYW4gZXh0ZXJuYWwgYWN0aW9uIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgYSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5pdGVtLmNhbkVkaXQoKSkge1xyXG4gICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChuZXdTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIGxldCByYW5nZSA9IHRoaXMucmFuZ2VGYWN0b3J5LmNyZWF0ZVJhbmdlKHRoaXMuY29uZmlnLCBuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZERlbGV0ZShyYW5nZSkpIHtcclxuICAgICAgICAgIHRoaXMuaXRlbS5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHJhbmdlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZShyYW5nZSk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgbWVyZ2luZyBtdXRhdGVkIHRoZSBzY2hlZHVsZSBmdXJ0aGVyLCB0aGVuIHVwZGF0ZVNjaGVkdWxlIHdvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIGNhbGxlZFxyXG4gICAgICAgICAgLy8gVGhpcyBpcyBzbyB0aGF0IGVkaXRzIHRoYXQgZG9uJ3QgdHJpZ2dlciBtZXJnZXMgc3RpbGwgdHJpZ2dlciBvbkNoYW5nZSxcclxuICAgICAgICAgIC8vIGJ1dCBlZGl0cyB0aGF0IGRvIHRyaWdnZXIgbWVyZ2VzIGRvbid0IHRyaWdnZXIgaXQgdHdpY2VcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhwcmVtZXJnZVNjaGVkdWxlLCByYW5nZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGUudXBkYXRlKHJhbmdlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGV4Y2VwdCBlYXQgdGhlIHVuaGFuZGxlZCByZWplY3Rpb24gZXJyb3JcclxuICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRMZWZ0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdFJpZ2h0KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhIG51bGwgZW5kLCBwbGFjZSB0aGUgZW5kIG9mIHRoZSBzbG90IHR3byBob3VycyBhd2F5IGZyb20gdGhlIGJlZ2lubmluZy5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcyAmJiBlbmQgPT09IG51bGwpIHtcclxuICAgICAgZW5kID0gc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbiBlbmQgb2YgMCBzaG91bGQgZGlzcGxheSBhbGxsbCB0aGUgd2F5IHRvIHRoZSByaWdodCwgdXAgdG8gdGhlIGVkZ2VcclxuICAgIGVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIGVuZCk7XHJcblxyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0V2lkdGg7XHJcbiAgICBsZXQgY29udGFpbmVyTGVmdCA9IHRoaXMuZWxlbWVudE9mZnNldFNlcnZpY2UubGVmdCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5yaWdodCh0aGlzLiRlbGVtZW50KTtcclxuXHJcbiAgICBsZXQgcmVzdWx0ID0gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIHZhbCA9IHRoaXMubm9ybWFsaXplSW50ZXJ2YWxWYWx1ZSh2YWwpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGBbcmVsPScke3ZhbH0nXWApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG91bGREZWxldGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHNjaGVkdWxlLiRpc0RlbGV0aW5nKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmNvbmZpZy5maWxsRW1wdHlXaXRoRGVmYXVsdCAmJiBzY2hlZHVsZS52YWx1ZSA9PT0gdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBub3JtYWxpemVJbnRlcnZhbFZhbHVlKHZhbHVlOiBudW1iZXIpIHtcclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSByaWdodCBvZiB0aGUgcmlnaHRtb3N0IGludGVydmFsIC0tIHRoZSBsYXN0IGludGVydmFsIHdpbGwgbm90IGFjdHVhbGx5IHJlbmRlciB3aXRoIGEgXCJyZWxcIiB2YWx1ZVxyXG4gICAgbGV0IHJpZ2h0bW9zdCA9IHRoaXMuY29uZmlnLm1heFZhbHVlIC0gdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVOb3JtYWxpemF0aW9uU2VydmljZS5ub3JtYWxpemVWYWx1ZSh2YWx1ZSwgMCwgcmlnaHRtb3N0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbm9ybWFsaXplR2hvc3RWYWx1ZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlLm5vcm1hbGl6ZVZhbHVlKHZhbHVlLCAwLCB0aGlzLmNvbmZpZy5tYXhWYWx1ZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZUdob3N0KCkge1xyXG4gICAgdGhpcy5pdGVtLiRpc0dob3N0T3JpZ2luID0gZmFsc2U7XHJcbiAgICB0aGlzLml0ZW0uJHJlbmRlckdob3N0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnNldEdob3N0VmFsdWVzKG51bGwpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGRyYWdTY2hlZHVsZTogJzwnLFxyXG4gICAgZ2hvc3RWYWx1ZXM6ICc8JyxcclxuICAgIGl0ZW06ICc9bmdNb2RlbCcsXHJcbiAgICBzZXRHaG9zdFZhbHVlczogJyYnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJOdWxsRW5kJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9yLmVycm9yXSA9IChtb2RlbFZhbHVlOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRlKG1vZGVsVmFsdWUuc2NoZWR1bGVzLCBtb2RlbFZhbHVlLmNvbmZpZyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1aXJlID0gJ25nTW9kZWwnO1xyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAodmFsaWRhdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVsbEVuZERpcmVjdGl2ZSh2YWxpZGF0b3IpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlck51bGxFbmRWYWxpZGF0b3JTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKE51bGxFbmREaXJlY3RpdmUuJG5hbWUsIE51bGxFbmREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuXHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJPdmVybGFwJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHZhbGlkYXRvcjogT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRvci52YWxpZGF0ZShtb2RlbFZhbHVlLnNjaGVkdWxlcywgbW9kZWxWYWx1ZS5jb25maWcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE92ZXJsYXBEaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShPdmVybGFwRGlyZWN0aXZlLiRuYW1lLCBPdmVybGFwRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBPdmVybGFwU3RhdGUge1xyXG4gICAgICAgIGxldCBjdXJyZW50U3RhcnQgPSBjdXJyZW50LnN0YXJ0O1xyXG4gICAgICAgIGxldCBjdXJyZW50RW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIGN1cnJlbnQuZW5kKTtcclxuXHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnQgPSBvdGhlci5zdGFydDtcclxuICAgICAgICBsZXQgb3RoZXJFbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgb3RoZXIuZW5kKTtcclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID49IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50U3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RW5kID49IG90aGVyRW5kICYmIGN1cnJlbnRTdGFydCA8PSBvdGhlclN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID4gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID49IGN1cnJlbnRTdGFydCAmJiBvdGhlclN0YXJ0IDwgY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPT09IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID09PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBTZXJ2aWNlLiRuYW1lLCBPdmVybGFwU2VydmljZSk7XHJcbiIsIi8qKiBXaGVuIHVzaW5nIHRoZSAnZmlsbEVtcHR5V2l0aERlZmF1bHQnIG9wdGlvbiwgdGhpcyBzZXJ2aWNlIHdpbGwgYmUgdXNlZCB0byBkZWxldGUgdGhlIGRlZmF1bHQgc2NoZWR1bGVzIGZvciBjb3JyZWN0IGRpc3BsYXkgb24gdGhlIGNhbGVuZGFyICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUHVyZ2VEZWZhdWx0U2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJQdXJnZURlZmF1bHRTZXJ2aWNlJztcclxuXHJcbiAgICBwdXJnZShzY2hlZHVsZXM6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10ge1xyXG4gICAgICAgIGxldCBsYXN0SW5kZXggPSBzY2hlZHVsZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgLy8gbG9vcCBpbiByZXZlcnNlIHRvIGF2b2lkIG1lc3NpbmcgdXAgaW5kaWNlcyBhcyB3ZSBnb1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBsYXN0SW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmIChzY2hlZHVsZXNbaV0udmFsdWUgPT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY2hlZHVsZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShQdXJnZURlZmF1bHRTZXJ2aWNlLiRuYW1lLCBQdXJnZURlZmF1bHRTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlUHJvdmlkZXIgaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVJlc2l6ZVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljICRuYW1lID0gJ2JyLndlZWtseVNjaGVkdWxlci5yZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLiRnZXQuJGluamVjdCA9IFtcclxuICAgICAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICAgICAnJHdpbmRvdydcclxuICAgICAgICBdXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjdXN0b21SZXNpemVFdmVudHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzZXJ2aWNlSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cyA9IGV2ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgJGdldChcclxuICAgICAgICAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICk6IElSZXNpemVTZXJ2aWNlIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0aWFsaXplOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4aXN0cyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gd2UgaGF2ZSB0byAkYXBwbHkgdGhlIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oZXZlbnQsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUluaXRpYWxpemVkID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnByb3ZpZGVyKFJlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgUmVzaXplU2VydmljZVByb3ZpZGVyKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCAocmVzaXplU2VydmljZTogSVJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdyZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGZpbHRlciddO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4cGxhbmF0aW9uczogeyBba2V5IGluIFZhbGlkYXRpb25FcnJvcl0/OiBzdHJpbmcgfSA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGZpbHRlcjogSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gdGhpcy4kZmlsdGVyKCdicldlZWtseVNjaGVkdWxlclNlY29uZHNBc1RleHQnKShjb25maWcubWF4VGltZVNsb3QpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1heFRpbWVTbG90KG1heFRpbWVTbG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLmZ1bGxDYWxlbmRhcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1vbm9TY2hlZHVsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk51bGxFbmRdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm51bGxFbmRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucyAmJiBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLlNjaGVkdWxlQ291bnRdID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLnNjaGVkdWxlQ291bnQoY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubWluaW11bVNlcGFyYXRpb24pIHtcclxuICAgICAgICAgICAgbGV0IG1pbmltdW1TZXBhcmF0aW9uID0gdGhpcy4kZmlsdGVyKCdicldlZWtseVNjaGVkdWxlclNlY29uZHNBc1RleHQnKShjb25maWcubWluaW11bVNlcGFyYXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTWluaW11bVNlcGFyYXRpb25dID0gY29uZmlnLnJlc3RyaWN0aW9uRXhwbGFuYXRpb25zLm1pbmltdW1TZXBhcmF0aW9uKG1pbmltdW1TZXBhcmF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBzY2hlZHVsZXJDdHJsOiAnXmJyV2Vla2x5U2NoZWR1bGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3JvdyBleHBsYW5hdGlvbnNcIiBuZy1jbGFzcz1cInsgdmlvbGF0aW9uOiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuc2NoZWR1bGVyQ3RybC5mb3JtQ29udHJvbGxlci4kZXJyb3Jba2V5XSB9XCIgbmctcmVwZWF0PVwiKGtleSwgZXhwbGFuYXRpb24pIGluIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC5leHBsYW5hdGlvbnNcIj5cclxuICAgICAgICAgICAge3sgZXhwbGFuYXRpb24gfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LiRuYW1lLCBuZXcgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZSwgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyKTtcclxuIiwiLyoqXHJcbiAqIFJ1bnMgY3VzdG9tIHZhbGlkYXRvcnMgd2hlbmV2ZXIgdGhlIG1vZGVsIGNoYW5nZXNcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJldmFsaWRhdGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyUmV2YWxpZGF0ZSc7XHJcblxyXG4gICAgbGluayA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5uZ01vZGVsLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiR2YWxpZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUgPSAnbmdNb2RlbCc7XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXZhbGlkYXRlRGlyZWN0aXZlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoUmV2YWxpZGF0ZURpcmVjdGl2ZS4kbmFtZSwgUmV2YWxpZGF0ZURpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG4gICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTRVRfWk9PTSwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW4oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJTY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQ291bnREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVDb3VudCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB2YWxpZGF0b3I6IFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmJyU2NoZWR1bGVDb3VudCkge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kdmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvci5lcnJvcl0gPSAobW9kZWxWYWx1ZTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGUobW9kZWxWYWx1ZS5zY2hlZHVsZXMsIG1vZGVsVmFsdWUuY29uZmlnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWlyZSA9ICduZ01vZGVsJztcclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKHZhbGlkYXRvcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNjaGVkdWxlQ291bnREaXJlY3RpdmUodmFsaWRhdG9yKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSddO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShTY2hlZHVsZUNvdW50RGlyZWN0aXZlLiRuYW1lLCBTY2hlZHVsZUNvdW50RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcblxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyBXaGVuIHRoaXMgb3B0aW9uIGlzIHRydWUgd2Ugc2hvdWxkIGVuZm9yY2UgdGhhdCB0aGVyZSBhcmUgbm8gZ2FwcyBpbiB0aGUgc2NoZWR1bGVzXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzY2hlZHVsZXMsIGl0IGF1dG9tYXRpY2FsbHkgZmFpbHMuXHJcbiAgICAgICAgaWYgKCFsZW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgb25seSBvbmUgaXRlbSB3ZSBzaG91bGQgY2hlY2sgdGhhdCBpdCBzcGFucyB0aGUgd2hvbGUgcmFuZ2VcclxuICAgICAgICBpZiAobGVuID09PSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsZSA9IHNjaGVkdWxlc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc2NoZWR1bGUuc3RhcnQpICYmIHRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKHNjaGVkdWxlLmVuZCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG1vcmUsIGNvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxvb3BMZW4gPSBsZW4gLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTb3J0IGJ5IHN0YXJ0IHRpbWUgZmlyc3RcclxuICAgICAgICBsZXQgc29ydGVkU2NoZWR1bGVzID0gc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgPiBiLnN0YXJ0ID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiAhdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShjdXJyZW50LnN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBsYXN0IGl0ZW0gbGFuZHMgYXQgbWF4VmFsdWVcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxvb3BMZW4gLSAxICYmICF0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShuZXh0LmVuZCwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgY3VycmVudC5lbmQgPT09IG5leHQuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBzdGFydCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRW5kQXRNYXhWYWx1ZShlbmQ6IG51bWJlciwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gKGVuZCB8fCBjb25maWcubWF4VmFsdWUpID09PSBjb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSBjb25maWcubWF4VGltZVNsb3Q7XHJcblxyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSAmJiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgcy5lbmQpIC0gcy5zdGFydCA+IG1heFRpbWVTbG90KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW5pbXVtU2VwYXJhdGlvblZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTWluaW11bVNlcGFyYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubWluaW11bVNlcGFyYXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAobGVuIDw9IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb29wTGVuID0gbGVuIC0gMTtcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgLSBiLnN0YXJ0KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHRTY2hlZHVsZSA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dFNjaGVkdWxlLnN0YXJ0IC0gY3VycmVudFNjaGVkdWxlLmVuZCA8IGNvbmZpZy5taW5pbXVtU2VwYXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1pbmltdW1TZXBhcmF0aW9uVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWluaW11bVNlcGFyYXRpb25WYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEltcG9ydGFudCBub3RlIC0tIHRoaXMgZG9lcyBub3QgdmFsaWRhdGUgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0sIGJ1dCByYXRoZXIgdGhhdCBvbmx5IG9uZSBOT04tREVGQVVMVCBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0uICovXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhIGRlZmF1bHQgdmFsdWUgaXMgZGVmaW5lZCwgc2NoZWR1bGVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgZG9uJ3QgY291bnQgLS0gb25lIG5vbi1kZWZhdWx0IHNjaGVkdWxlIHBlciBpdGVtLlxyXG4gICAgICAgIGxldCBzY2hlZHVsZXNUb1ZhbGlkYXRlO1xyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnLmRlZmF1bHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcy5maWx0ZXIoc2NoZWR1bGUgPT4gc2NoZWR1bGUudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGFsbG93ZWQgZW1wdHkgb3IgMSBzY2hlZHVsZSBwZXIgaXRlbVxyXG4gICAgICAgIHJldHVybiAhc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggfHwgc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggPT09IDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZDtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gMSAmJiBzY2hlZHVsZXMuZXZlcnkoc2NoZWR1bGUgPT4gc2NoZWR1bGUuZW5kID09PSBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCAhPT0gbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5PdmVybGFwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQ291bnRWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuU2NoZWR1bGVDb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5jb3VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLnNjaGVkdWxlQ291bnRPcHRpb25zLmV4YWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlRXhhY3RDb3VudChzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVNYXhDb3VudChzY2hlZHVsZXMsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVFeGFjdENvdW50KHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPT09IGNvbmZpZy5zY2hlZHVsZUNvdW50T3B0aW9ucy5jb3VudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlTWF4Q291bnQoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmxlbmd0aCA8PSBjb25maWcuc2NoZWR1bGVDb3VudE9wdGlvbnMuY291bnQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY2hlZHVsZUNvdW50VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgU2NoZWR1bGVDb3VudFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTZWNvbmRzQXNUZXh0RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNlY29uZHNBc1RleHQnO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZmFjdG9yeUZ1bmN0aW9uID0gKHRpbWVDb25zdGFudHM6IFRpbWVDb25zdGFudHNTZXJ2aWNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZWNvbmRzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGBgO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9IT1VSKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBTZWNvbmRzQXNUZXh0RmlsdGVyLmFkZEhvdXJzVG9SZXN1bHQocmVzdWx0LCBob3Vycyk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2Vjb25kcyAtPSBob3VycyAqIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9IT1VSO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gdGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX01JTlVURSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gU2Vjb25kc0FzVGV4dEZpbHRlci5hZGRNaW51dGVzVG9SZXN1bHQocmVzdWx0LCBtaW51dGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzIC09IG1pbnV0ZXMgKiB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fTUlOVVRFO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IFNlY29uZHNBc1RleHRGaWx0ZXIuYWRkU2Vjb25kc1RvUmVzdWx0KHJlc3VsdCwgc2Vjb25kcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZhY3RvcnlGdW5jdGlvbi4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlclRpbWVDb25zdGFudHNTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHJldHVybiBmYWN0b3J5RnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYWRkSG91cnNUb1Jlc3VsdChyZXN1bHQ6IHN0cmluZywgaG91cnM6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChob3Vycykge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gYCR7aG91cnN9IGhvdXJzYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYWRkTWludXRlc1RvUmVzdWx0KHJlc3VsdDogc3RyaW5nLCBtaW51dGVzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAobWludXRlcykge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCBgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgKz0gYCR7bWludXRlc30gbWludXRlJHttaW51dGVzID4gMSA/ICdzJyA6ICcnfWA7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBhZGRTZWNvbmRzVG9SZXN1bHQocmVzdWx0OiBzdHJpbmcsIHNlY29uZHM6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChzZWNvbmRzKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgIGA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBgJHtzZWNvbmRzfSBzZWNvbmQke3NlY29uZHMgPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFNlY29uZHNBc1RleHRGaWx0ZXIuJG5hbWUsIFNlY29uZHNBc1RleHRGaWx0ZXIuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lQ29uc3RhbnRzU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUaW1lQ29uc3RhbnRzU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGdldCBTRUNPTkRTX0lOX0RBWSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5NSU5VVEVTX0lOX0RBWSAqIHRoaXMuU0VDT05EU19JTl9NSU5VVEU7IFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgU0VDT05EU19JTl9IT1VSKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlNFQ09ORFNfSU5fTUlOVVRFICogdGhpcy5NSU5VVEVTX0lOX0hPVVI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBTRUNPTkRTX0lOX01JTlVURSgpIHtcclxuICAgICAgICByZXR1cm4gNjA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBIT1VSU19JTl9EQVkoKSB7XHJcbiAgICAgICAgcmV0dXJuIDI0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgTUlOVVRFU19JTl9EQVkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuTUlOVVRFU19JTl9IT1VSICogdGhpcy5IT1VSU19JTl9EQVk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBNSU5VVEVTX0lOX0hPVVIoKSB7XHJcbiAgICAgICAgcmV0dXJuIDYwO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoVGltZUNvbnN0YW50c1NlcnZpY2UuJG5hbWUsIFRpbWVDb25zdGFudHNTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGZhY3RvcnlGdW5jdGlvbiA9ICh0aW1lQ29uc3RhbnRzOiBUaW1lQ29uc3RhbnRzU2VydmljZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2Vjb25kczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9IT1VSKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGhvdXJzID4gMTEgJiYgaG91cnMgPCAyNCA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzIC09IGhvdXJzICogdGltZUNvbnN0YW50cy5TRUNPTkRTX0lOX0hPVVI7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyB0aW1lQ29uc3RhbnRzLlNFQ09ORFNfSU5fTUlOVVRFKTtcclxuICAgICAgICAgICAgICAgIHNlY29uZHMgLT0gbWludXRlcyAqIHRpbWVDb25zdGFudHMuU0VDT05EU19JTl9NSU5VVEU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSBtaW51dGVzLnRvU3RyaW5nKClcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nTWludXRlcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBkaXNwbGF5SG91cnMgPSBob3VycyAlIDEyIHx8IDEyO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2Vjb25kcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc306JHtzZWNvbmRzfSR7bWVyaWRpZW19YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZhY3RvcnlGdW5jdGlvbi4kaW5qZWN0ID0gWydicldlZWtseVNjaGVkdWxlclRpbWVDb25zdGFudHNTZXJ2aWNlJ11cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhY3RvcnlGdW5jdGlvbjtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZSc7XHJcblxyXG4gICAgYmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2NoZWR1bGU6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gVGltZVJhbmdlQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiB0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fS17eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLmVuZCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiAhdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0gdW50aWw8L3NwYW4+XHJcbiAgICBgXHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAndGltZVJhbmdlQ3RybCc7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2VDb250cm9sbGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhc1N0YXJ0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBoYXNFbmQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5oYXNTdGFydCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIHRoaXMuaGFzRW5kID0gYW5ndWxhci5pc0RlZmluZWQodGhpcy5zY2hlZHVsZS5lbmQpICYmIHRoaXMuc2NoZWR1bGUuZW5kICE9PSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChUaW1lUmFuZ2VDb21wb25lbnQuJG5hbWUsIG5ldyBUaW1lUmFuZ2VDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWUsIFRpbWVSYW5nZUNvbnRyb2xsZXIpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRvdWNoU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUb3VjaFNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBnZXRUb3VjaGVzKGV2ZW50OiBhbnkpOiBhbnkgeyAvLyB0b2RvXHJcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWV2ZW50LnRvdWNoZXMpIHtcclxuICAgICAgICAgICAgZXZlbnQudG91Y2hlcyA9IFtldmVudC5vcmlnaW5hbEV2ZW50XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBldmVudC50b3VjaGVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgZ2V0UGFnZVgoZXZlbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHRvdWNoZXMgPSB0aGlzLmdldFRvdWNoZXMoZXZlbnQpO1xyXG5cclxuICAgICAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCAmJiB0b3VjaGVzWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3VjaGVzWzBdLnBhZ2VYO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShUb3VjaFNlcnZpY2UuJG5hbWUsIFRvdWNoU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVmFsdWVOb3JtYWxpemF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJWYWx1ZU5vcm1hbGl6YXRpb25TZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgbm9ybWFsaXplVmFsdWUodmFsdWU6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgbWluKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmFsdWUgPiBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1heDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UuJG5hbWUsIFZhbHVlTm9ybWFsaXphdGlvblNlcnZpY2UpO1xyXG5cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR0aW1lb3V0JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckFkYXB0ZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckNvbmZpZ3VyYXRpb25TZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTGFzdEdob3N0RGF5U2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJNaXNzaW5nRGF5c1NlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgIHByaXZhdGUgYWRhcHRlclNlcnZpY2U6IEFkYXB0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uU2VydmljZTogQ29uZmlndXJhdGlvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2U6IENvbmZsaWN0aW5nT3B0aW9uc1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxhc3RHaG9zdERheVNlcnZpY2U6IExhc3RHaG9zdERheVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG1pc3NpbmdEYXlzU2VydmljZTogTWlzc2luZ0RheXNTZXJ2aWNlLFxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxJdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcblxyXG4gIHByaXZhdGUgYWRhcHRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55PjtcclxuXHJcbiAgcHVibGljIGludmFsaWRNZXNzYWdlOiBzdHJpbmcgPSAnJztcclxuXHJcbiAgcHJpdmF0ZSBkcmFnU2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgZ2hvc3RWYWx1ZXM6IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH07XHJcblxyXG4gIC8qKiB0aGlzIGlzIHJlcXVpcmVkIHRvIGJlIHBhcnQgb2YgYSBmb3JtIGZvciBkaXJ0eS92YWxpZCBjaGVja3MgKi9cclxuICBwdWJsaWMgZm9ybUNvbnRyb2xsZXI6IGFuZ3VsYXIuSUZvcm1Db250cm9sbGVyO1xyXG5cclxuICBwdWJsaWMgaG92ZXJDbGFzczogc3RyaW5nO1xyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHVibGljIGl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT47XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJhdGlvblNlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbih0aGlzLm9wdGlvbnMpO1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKTtcclxuICAgIHRoaXMud2F0Y2hBZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoSG92ZXJDbGFzcygpO1xyXG4gIH1cclxuXHJcbiAgJHBvc3RMaW5rKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5TTE9UX0RSQUdHRUQsIChldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBzY2hlZHVsZTogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4ge1xyXG4gICAgICB0aGlzLmRyYWdTY2hlZHVsZSA9IHNjaGVkdWxlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5EUkFHX0VOREVELCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZHJhZ1NjaGVkdWxlID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuR0hPU1RfRFJBR19FTkRFRCwgKGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGdob3N0U2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHtcclxuICAgICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ09NTUlUX0dIT1NULCBnaG9zdFNjaGVkdWxlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVNT1ZFX0xBU1RfR0hPU1QsICgpID0+IHtcclxuICAgICAgbGV0IGxhc3RHaG9zdERheSA9IHRoaXMubGFzdEdob3N0RGF5U2VydmljZS5nZXRMYXN0R2hvc3REYXkodGhpcy5pdGVtcyk7XHJcblxyXG4gICAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfR0hPU1QsIGxhc3RHaG9zdERheSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNBTkNFTF9HSE9TVCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRU1PVkVfQUxMX0dIT1NUUyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5pbnZhbGlkTWVzc2FnZSA9IHRoaXMuZ2V0SW52YWxpZE1lc3NhZ2UoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEludmFsaWRNZXNzYWdlKCkge1xyXG4gICAgbGV0IGNvbmZsaWN0aW5nT3B0aW9ucyA9IHRoaXMuY29uZmxpY3RpbmdPcHRpb25zU2VydmljZS5nZXRDb25mbGljdGluZ09wdGlvbnModGhpcy5vcHRpb25zKTtcclxuXHJcbiAgICBpZiAoY29uZmxpY3RpbmdPcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiBjb25mbGljdGluZ09wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaGFzSW52YWxpZFNjaGVkdWxlKCkpIHtcclxuICAgICAgcmV0dXJuICdPbmUgb3IgbW9yZSBvZiB0aGUgc2NoZWR1bGVzIGlzIGludmFsaWQhIFBsZWFzZSBjb250YWN0IHNlcnZpY2UuJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNJbnZhbGlkU2NoZWR1bGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JtQ29udHJvbGxlci4kaW52YWxpZDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtcyhpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLm1pc3NpbmdEYXlzU2VydmljZS5maWxsSXRlbXModGhpcy5jb25maWcsIGl0ZW1zKTtcclxuXHJcbiAgICB0aGlzLml0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLm1lcmdlT3ZlcmxhcHMoKSk7XHJcblxyXG4gICAgdGhpcy5pdGVtcyA9IHRoaXMucHVyZ2VJdGVtcyh0aGlzLml0ZW1zKTtcclxuXHJcbiAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBhZGFwdGVyIHNvIHdlIGNhbiBwdWxsIGl0IG91dCBsYXRlclxyXG4gICAgdGhpcy5hZGFwdGVyLml0ZW1zID0gdGhpcy5pdGVtcztcclxuXHJcbiAgICAvLyBrZWVwIGEgY29weSBvZiB0aGUgaXRlbXMgaW4gY2FzZSB3ZSBuZWVkIHRvIHJvbGxiYWNrXHJcbiAgICB0aGlzLl9vcmlnaW5hbEl0ZW1zID0gYW5ndWxhci5jb3B5KHRoaXMuaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKSB7XHJcbiAgICBsZXQgaXRlbXMgPSB0aGlzLmFkYXB0ZXJTZXJ2aWNlLmdldEl0ZW1zRnJvbUFkYXB0ZXIodGhpcy5jb25maWcsIHRoaXMuYWRhcHRlcik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYnVpbGRJdGVtcyhpdGVtcyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHB1cmdlSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcuZmlsbEVtcHR5V2l0aERlZmF1bHQpIHtcclxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgIGl0ZW0ucHVyZ2VEZWZhdWx0U2NoZWR1bGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaXRlbXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByZXBhcmVJdGVtcyhpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIGlmICh0aGlzLmNvbmZpZy5maWxsRW1wdHlXaXRoRGVmYXVsdCkge1xyXG4gICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgaXRlbS5maWxsRW1wdHlTbG90c1dpdGhEZWZhdWx0U2NoZWR1bGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaXRlbXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldEdob3N0VmFsdWVzKGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9KSB7XHJcbiAgICB0aGlzLmdob3N0VmFsdWVzID0gZ2hvc3RWYWx1ZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0Wm9vbSgpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0VUX1pPT00pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB6b29tSW4oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NX0lOKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcm9sbGJhY2soKSB7XHJcbiAgICB0aGlzLmJ1aWxkSXRlbXModGhpcy5fb3JpZ2luYWxJdGVtcyk7XHJcbiAgICB0aGlzLmZvcm1Db250cm9sbGVyLiRzZXRQcmlzdGluZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlKCkge1xyXG4gICAgdGhpcy5pdGVtcyA9IHRoaXMucHJlcGFyZUl0ZW1zKHRoaXMuaXRlbXMpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbmZpZy5zYXZlU2NoZWR1bGVyKCkudGhlbigoKSA9PiB7XHJcbiAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLnB1cmdlSXRlbXModGhpcy5pdGVtcyk7XHJcbiAgICAgIHRoaXMuZm9ybUNvbnRyb2xsZXIuJHNldFByaXN0aW5lKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hBZGFwdGVyKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+IHtcclxuICAgICAgcmV0dXJuIHRoaXMuYWRhcHRlcjtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgdGhpcy5idWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB3YXRjaEhvdmVyQ2xhc3MoKSB7XHJcbiAgICBjb25zdCBwdWxzZUNsYXNzID0gJ3B1bHNlJztcclxuICAgIGNvbnN0IHB1bHNlU2VsZWN0b3IgPSBgLiR7cHVsc2VDbGFzc31gO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmhvdmVyQ2xhc3MsICgpID0+IHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5maW5kKHB1bHNlU2VsZWN0b3IpLnJlbW92ZUNsYXNzKHB1bHNlQ2xhc3MpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuaG92ZXJDbGFzcykge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5ob3ZlckNsYXNzfWApLmFkZENsYXNzKHB1bHNlQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBhZGFwdGVyOiAnPCcsXHJcbiAgICBob3ZlckNsYXNzOiAnPCcsXHJcbiAgICBvcHRpb25zOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBmb3JtQ29udHJvbGxlcjogJ2Zvcm0nXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBBaGhhaGhhaGghIEZpZ2h0ZXIgb2YgdGhlIE5pZ2h0TWFwISAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERheU1hcCB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgdmFsdWUgPSB7XHJcbiAgICAgICAgW2JyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheV06ICdNb24nLFxyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5XTogJ1R1ZScsXHJcbiAgICAgICAgW2JyLndlZWtseVNjaGVkdWxlci5EYXlzLldlZG5lc2RheV06ICdXZWQnLFxyXG4gICAgICAgIFtici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UaHVyc2RheV06ICdUaHVyJyxcclxuICAgICAgICBbYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5XTogJ0ZyaScsXHJcbiAgICAgICAgW2JyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5XTogJ1NhdCcsXHJcbiAgICAgICAgW2JyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheV06ICdTdW4nIFxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KERheU1hcC4kbmFtZSwgRGF5TWFwLnZhbHVlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kV2lkdGgge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJztcclxuXHJcbiAgICBzdGF0aWMgdmFsdWUgPSA3MjAwOyBcclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChOdWxsRW5kV2lkdGguJG5hbWUsIE51bGxFbmRXaWR0aC52YWx1ZSk7XHJcbiIsIi8qKiBQcm92aWRlcyBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgYW4gaXRlbSAtLSBwYXNzIGl0IGluIGFuZCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGFsbG93IHlvdSB0byBvcGVyYXRlIG9uIGl0ICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBpbXBsZW1lbnRzIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgJGlzR2hvc3RPcmlnaW46IGJvb2xlYW47XHJcbiAgICAkcmVuZGVyR2hvc3Q6IGJvb2xlYW47XHJcbiAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgZWRpdGFibGU6IGJvb2xlYW47XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgc2NoZWR1bGVzOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8VD4sXHJcbiAgICAgICAgaXRlbTogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPixcclxuICAgICAgICBwcml2YXRlIGZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZTogRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcHVyZ2VEZWZhdWx0U2VydmljZTogUHVyZ2VEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJhbmdlRmFjdG9yeTogV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5XHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmRheSA9IGl0ZW0uZGF5O1xyXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBhbmd1bGFyLmlzRGVmaW5lZChpdGVtLmVkaXRhYmxlKSA/IGl0ZW0uZWRpdGFibGUgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBpdGVtLmxhYmVsO1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXMubWFwKHNjaGVkdWxlID0+IHJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZShjb25maWcsIHNjaGVkdWxlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZFNjaGVkdWxlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgc2NoZWR1bGUuZGF5ID0gdGhpcy5kYXk7XHJcbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlRmFjdG9yeS5jcmVhdGVSYW5nZSh0aGlzLmNvbmZpZywgc2NoZWR1bGUpO1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzLnB1c2gocmFuZ2UpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZFNjaGVkdWxlQW5kTWVyZ2Uoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLmFkZFNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgICAgICB0aGlzLm1lcmdlU2NoZWR1bGUocmFuZ2UpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNhbkFkZFNjaGVkdWxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXNOb1NjaGVkdWxlcygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogRGV0ZXJtaW5lIGlmIHRoZSBjb25kaXRpb25zIGFsbG93IGZvciBhIHBvcC11cCBlZGl0b3IgKi9cclxuICAgIHB1YmxpYyBjYW5FZGl0KCkge1xyXG4gICAgICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5jb25maWcuZWRpdFNsb3QpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lZGl0YWJsZSAmJiBoYXNFZGl0RnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERldGVybWluZSBpZiBhIHNjaGVkdWxlIGlzIGFibGUgdG8gYmUgbW9kaWZpZWQgKi9cclxuICAgIHB1YmxpYyBjYW5FZGl0U2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IGl0ZW1Jc0VkaXRhYmxlID0gdGhpcy5lZGl0YWJsZTtcclxuICAgICAgICBsZXQgc2NoZWR1bGVJc0VkaXRhYmxlID0gc2NoZWR1bGUuZWRpdGFibGU7XHJcblxyXG4gICAgICAgIHJldHVybiBpdGVtSXNFZGl0YWJsZSAmJiBzY2hlZHVsZUlzRWRpdGFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSYXRoZXIgdGhhbiBoYXZpbmcgdG8gZGVhbCB3aXRoIG1vZGlmeWluZyBtZXJnZU92ZXJsYXBzIHRvIGhhbmRsZSBudWxsRW5kcyBjYWxlbmRhcnMsXHJcbiAgICAgKiBqdXN0IHByZXZlbnQgdGhlIHVzZXIgZnJvbSBjcmVhdGluZyBhZGRpdGlvbmFsIHNsb3RzIGluIG51bGxFbmRzIGNhbGVuZGFycyB1bmxlc3MgdGhlcmUgYXJlIG5vIHNsb3RzIHRoZXJlIGFscmVhZHkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjYW5SZW5kZXJHaG9zdCgpIHtcclxuICAgICAgICAvLyBUaGlzIG9uZSBuZWVkcyB0byBjb21lIGZpcnN0LCBvdGhlcndpc2UgcmVuZGVyR2hvc3QgYmVpbmcgc2V0IHRvIHRydWUgd291bGQgb3ZlcnJpZGUgdGhlIHByb3RlY3Rpb24gYWdhaW5zdCBhZGR0J2wgc2xvdHMgaW4gbnVsbEVuZCBjYWxlbmRhcnNcclxuICAgICAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHJlbmRlckdob3N0ICYmIHRoaXMuaGFzTm9TY2hlZHVsZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLiRyZW5kZXJHaG9zdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpID4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc05vU2NoZWR1bGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbGxFbXB0eVNsb3RzV2l0aERlZmF1bHRTY2hlZHVsZXMoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXMgPSB0aGlzLmZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZS5maWxsKHRoaXMsIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVyZ2VPdmVybGFwcygpIHtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVzLmZvckVhY2goc2NoZWR1bGUgPT4gdGhpcy5tZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGUpKTtcclxuICAgICAgICB9IHdoaWxlICh0aGlzLm5lZWRzT3ZlcmxhcHNNZXJnZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1lcmdlU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICAvLyBXZSBjb25zaWRlciB0aGUgc2NoZWR1bGUgd2Ugd2VyZSB3b3JraW5nIHdpdGggdG8gYmUgdGhlIG1vc3QgaW1wb3J0YW50LCBzbyBoYW5kbGUgaXRzIG92ZXJsYXBzIGZpcnN0LlxyXG4gICAgICAgIHRoaXMubWVyZ2VPdmVybGFwc0ZvclNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgICAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHVyZ2VEZWZhdWx0U2NoZWR1bGVzKCkge1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzID0gdGhpcy5wdXJnZURlZmF1bHRTZXJ2aWNlLnB1cmdlKHRoaXMuc2NoZWR1bGVzLCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZy5vblJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE92ZXJsYXAgaGFuZGxlcnNcclxuXHJcbiAgICBwcml2YXRlIGdldE92ZXJsYXBIYW5kbGVyKG92ZXJsYXBTdGF0ZTogT3ZlcmxhcFN0YXRlKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4gdm9pZDsgfSA9IHtcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXBdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgICAgICAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICAgICAgICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQsIG90aGVyKSxcclxuICAgICAgICAgICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudCwgb3RoZXIpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG92ZXJsYXBIYW5kbGVyc1tvdmVybGFwU3RhdGVdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgJ290aGVyJyAmIG1ha2UgY3VycmVudCBleHBhbmQgdG8gZml0IHRoZSBvdGhlciBzbG90XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBKdXN0IHJlbW92ZSAnY3VycmVudCdcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShjdXJyZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVOb092ZXJsYXAoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZ1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiBjdXJyZW50LmVuZCxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdGhlci51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudC52YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZGF5OiBjdXJyZW50LmRheSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3RoZXIudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgICAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50OiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc1NhbWVWYWx1ZUFzKG90aGVyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudDogV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNTYW1lVmFsdWVBcyhvdGhlcikpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBFbmQgb3ZlcmxhcCBoYW5kbGVyc1xyXG4gICAgcHJpdmF0ZSBtZXJnZU92ZXJsYXBzRm9yU2NoZWR1bGUoc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIHNjaGVkdWxlcy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgaWYgKCFlbC5lcXVhbHMoc2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2NoZWR1bGVzQm90aEVkaXRhYmxlID0gZWwuZWRpdGFibGUgJiYgc2NoZWR1bGUuZWRpdGFibGU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjaGVkdWxlc0JvdGhFZGl0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLmdldE92ZXJsYXBIYW5kbGVyKG92ZXJsYXBTdGF0ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXBIYW5kbGVyKHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5lZWRzT3ZlcmxhcHNNZXJnZWQoKSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IHRoaXMuc2NoZWR1bGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSB0d28gYXQgYSB0aW1lXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLnNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLnNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgc2NoZWR1bGVzQm90aEVkaXRhYmxlID0gY3VycmVudC5lZGl0YWJsZSAmJiBuZXh0LmVkaXRhYmxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzY2hlZHVsZXNCb3RoRWRpdGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQuaGFzU2FtZVZhbHVlQXMobmV4dCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydCwgT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbUZhY3Rvcnkge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnknO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRmlsbEVtcHR5V2l0aERlZmF1bHRTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUHVyZ2VEZWZhdWx0U2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZGF5TWFwOiBEYXlNYXAsXHJcbiAgICAgICAgcHJpdmF0ZSBmaWxsRW1wdHlXaXRoRGVmYXVsdFNlcnZpY2U6IEZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHB1cmdlRGVmYXVsdFNlcnZpY2U6IFB1cmdlRGVmYXVsdFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByYW5nZUZhY3Rvcnk6IFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZUl0ZW0oY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGRheTogbnVtYmVyLCBzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAgICAgICBsZXQgYnVpbGRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBjb25maWcuY3JlYXRlSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcbiAgICBcclxuICAgICAgICByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChidWlsZGVyLCB7IGxhYmVsOiB0aGlzLmRheU1hcFtkYXldIH0pO1xyXG4gICAgXHJcbiAgICAgICAgcmV0dXJuIG5ldyBXZWVrbHlTY2hlZHVsZXJJdGVtKGNvbmZpZywgcmVzdWx0LCB0aGlzLmZpbGxFbXB0eVdpdGhEZWZhdWx0U2VydmljZSwgdGhpcy5vdmVybGFwU2VydmljZSwgdGhpcy5wdXJnZURlZmF1bHRTZXJ2aWNlLCB0aGlzLnJhbmdlRmFjdG9yeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShXZWVrbHlTY2hlZHVsZXJJdGVtRmFjdG9yeS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVySXRlbUZhY3RvcnkpO1xyXG5cclxuIiwiLyoqIFByb3ZpZGVzIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBhIHNjaGVkdWxlIC0tIHBhc3MgaXQgaW4gYW5kIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYWxsb3cgeW91IHRvIG9wZXJhdGUgb24gaXQgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgJGNsYXNzOiBzdHJpbmc7XHJcbiAgICAkaXNBY3RpdmU6IGJvb2xlYW47XHJcbiAgICAkaXNEZWxldGluZzogYm9vbGVhbjtcclxuICAgICRpc0VkaXRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxuICAgIHZhbHVlOiBUO1xyXG5cclxuICAgIGVkaXRhYmxlOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuJGNsYXNzID0gc2NoZWR1bGUuJGNsYXNzO1xyXG4gICAgICAgIHRoaXMuZGF5ID0gc2NoZWR1bGUuZGF5O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzY2hlZHVsZS5zdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IHNjaGVkdWxlLmVuZDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gc2NoZWR1bGUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHNjaGVkdWxlLmVkaXRhYmxlKSA/IHNjaGVkdWxlLmVkaXRhYmxlIDogdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZHVyYXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5kIC0gdGhpcy5zdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHJldHVybiBhbmd1bGFyLmVxdWFscyh0aGlzLCBvdGhlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc1NhbWVWYWx1ZUFzKG90aGVyOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKHVwZGF0ZWRTY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCB1cGRhdGVkU3RhcnQgPSB0aGlzLnVwZGF0ZVN0YXJ0KHVwZGF0ZWRTY2hlZHVsZS5zdGFydCk7XHJcbiAgICAgICAgbGV0IHVwZGF0ZWRFbmQgPSB0aGlzLnVwZGF0ZUVuZCh1cGRhdGVkU2NoZWR1bGUuZW5kKTtcclxuXHJcbiAgICAgICAgaWYgKHVwZGF0ZWRTdGFydCB8fCB1cGRhdGVkRW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLm9uQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVFbmQodXBkYXRlZEVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuVXBkYXRlRW5kKHVwZGF0ZWRFbmQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwodGhpcy5jb25maWcsIHVwZGF0ZWRFbmQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlU3RhcnQodXBkYXRlZFN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5VcGRhdGVTdGFydCh1cGRhdGVkU3RhcnQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnQgPSB1cGRhdGVkU3RhcnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FuVXBkYXRlRW5kKHVwZGF0ZWRFbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5lbmQgIT09IHVwZGF0ZWRFbmQ7XHJcbiAgICAgICAgbGV0IG5ld0VuZEJlZm9yZU9yQXRNYXggPSB1cGRhdGVkRW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgICAgIGxldCBuZXdFbmRBZnRlck9yQXRFeGlzdGluZ1N0YXJ0ID0gdXBkYXRlZEVuZCA+PSB0aGlzLnN0YXJ0ICsgMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQgJiYgbmV3RW5kQmVmb3JlT3JBdE1heCAmJiBuZXdFbmRBZnRlck9yQXRFeGlzdGluZ1N0YXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FuVXBkYXRlU3RhcnQodXBkYXRlZFN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuc3RhcnQgIT09IHVwZGF0ZWRTdGFydDtcclxuICAgICAgICBsZXQgbmV3U3RhcnRCZWZvcmVPckF0RXhpc3RpbmdFbmQgPSB1cGRhdGVkU3RhcnQgPD0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgdGhpcy5lbmQpIC0gMTtcclxuICAgICAgICBsZXQgbmV3U3RhcnRBZnRlck9yQXRNaW4gPSB1cGRhdGVkU3RhcnQgPj0gMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQgJiYgKHRoaXMuY29uZmlnLm51bGxFbmRzIHx8IG5ld1N0YXJ0QmVmb3JlT3JBdEV4aXN0aW5nRW5kKSAmJiBuZXdTdGFydEFmdGVyT3JBdE1pbjtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJSYW5nZUZhY3RvcnknO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlUmFuZ2UoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFdlZWtseVNjaGVkdWxlclJhbmdlKGNvbmZpZywgc2NoZWR1bGUsIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlKTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFdlZWtseVNjaGVkdWxlclJhbmdlRmFjdG9yeS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVyUmFuZ2VGYWN0b3J5KTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHJvb3RTY29wZScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckRyYWdTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBnZXREZWx0YTogKG9wdGlvbnM6IHsgcGl4ZWw6IG51bWJlciB9KSA9PiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG4gIHByaXZhdGUgZHJhZ1NjaGVkdWxlOiBXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGU6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzT25EcmFnU3RhcnQ6IFdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBkcmFnU2VydmljZTogRHJhZ1NlcnZpY2UsXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBnZXQgaGFzRHJhZ1NjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuZHJhZ1NjaGVkdWxlKSAmJiB0aGlzLmRyYWdTY2hlZHVsZSAhPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnU3RhcnRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kcmFnU2VydmljZS5nZXREcmFnUmFuZ2VGcm9tU2NoZWR1bGUodGhpcy5jb25maWcsIHRoaXMuc2NoZWR1bGUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IG51bGwgOiBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5kdXJhdGlvbik7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS51cGRhdGUoe1xyXG4gICAgICBkYXk6IHVpLmRheSxcclxuICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgdmFsdWU6IHVpLnZhbHVlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgLy8gSWYgdGhlIHNjaGVkdWxlIHdhcyBtb3ZlZCB0byBhbm90aGVyIGl0ZW0sIHRoZSAkc2NvcGUgaGllcmFyY2h5IHdpbGwgaGF2ZSBiZWVuIGJyb2tlbiwgc28gd2UgbmVlZCB0byBicm9hZGNhc3QgdGhpcyB0byB0aGUgd2hvbGUgYXBwXHJcbiAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuRFJBR19FTkRFRCk7XHJcbiAgICBcclxuICAgIC8vIFdhcyB0aGUgc2NoZWR1bGUgbW92ZWQgdG8gYW5vdGhlciBpdGVtPz9cclxuICAgIGlmICghdGhpcy5pdGVtLmhhc1NjaGVkdWxlKHRoaXMuc2NoZWR1bGUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEaWQgdGhlIHVzZXIgYWN0dWFsbHkgbW92ZSBvciByZXNpemUgdGhlIHNsb3Q/P1xyXG4gICAgdmFyIGNoYW5nZWQ6IGJvb2xlYW4gPSAhdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lcXVhbHModGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmRSZXNpemUoKSB7XHJcbiAgICAvLyBEaWQgdGhlIHVzZXIgYWN0dWFsbHkgbW92ZSBvciByZXNpemUgdGhlIHNsb3Q/P1xyXG4gICAgdmFyIGNoYW5nZWQ6IGJvb2xlYW4gPSAhdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lcXVhbHModGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLml0ZW0ubWVyZ2VTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVTdGFydChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgIGlmICh0aGlzLnNjaGVkdWxlLnVwZGF0ZVN0YXJ0KG5ld1N0YXJ0KSkge1xyXG4gICAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZUVuZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmdldERlbHRhKHsgcGl4ZWw6IHBpeGVsIH0pO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NoZWR1bGUudXBkYXRlRW5kKG5ld0VuZCkpIHtcclxuICAgICAgdGhpcy5jb25maWcub25DaGFuZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXRlbS5jYW5FZGl0U2NoZWR1bGUodGhpcy5zY2hlZHVsZSkpe1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlNMT1RfRFJBR0dFRCwgdGhpcy5zY2hlZHVsZSk7XHJcbiAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZSgpIHtcclxuICAgIGlmICghdGhpcy5pdGVtLmNhbkVkaXRTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2xvdCc7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGRyYWdTY2hlZHVsZTogJzwnLFxyXG4gICAgaXRlbTogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIGdldERlbHRhOiAnJidcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG5nTW9kZWxDdHJsOiAnbmdNb2RlbCdcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgICAgIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShjdXN0b206IFRDdXN0b20pOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFRWYWx1ZT47XHJcblxyXG4gICAgICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgICAgICBnZXRTbmFwc2hvdCgpOiBUQ3VzdG9tW107XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICAgICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICAgICAgaW5pdGlhbERhdGE6IFRDdXN0b21bXTtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmRlY2xhcmUgY29uc3QgZW51bSBEcmFnTW9kZSB7XHJcbiAgICBNT1ZFLFxyXG4gICAgQ09QWVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJbnZhbGlkTWVzc2FnZXMge1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhckZpbGxFbXB0eVdpdGhEZWZhdWx0OiBzdHJpbmc7XHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aGRlZmF1bHREZWZhdWx0VmFsdWU6IHN0cmluZztcclxuICAgICAgICBnZW5lcmljOiBzdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSVBvaW50IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUmVzaXplU2VydmljZSB7XHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQ7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlUHJvdmlkZXIgZXh0ZW5kcyBhbmd1bGFyLklTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgICAgIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKiBEZWZhdWx0cyB3aWxsIGJlIHByb3ZpZGVkLCBidXQgeW91IGNhbiBvdmVycmlkZSB0aGVzZSBvbiBhIHBlci1jYWxlbmRhciBiYXNpcyBpZiBuZWNlc3NhcnkgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMge1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcjogc3RyaW5nO1xyXG4gICAgICAgIG1heFRpbWVTbG90OiAodmFsdWU6IHN0cmluZykgPT4gc3RyaW5nO1xyXG4gICAgICAgIG1pbmltdW1TZXBhcmF0aW9uOiAodmFsdWU6IHN0cmluZykgPT4gc3RyaW5nO1xyXG4gICAgICAgIG1vbm9TY2hlZHVsZTogc3RyaW5nO1xyXG4gICAgICAgIG51bGxFbmRzOiBzdHJpbmc7XHJcbiAgICAgICAgc2NoZWR1bGVDb3VudDogKG9wdGlvbnM6IFNjaGVkdWxlQ291bnRPcHRpb25zKSA9PiBzdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICAvKiogRGVmYXVsdHMgd2lsbCBiZSBwcm92aWRlZCwgYnV0IHlvdSBjYW4gb3ZlcnJpZGUgdGhlc2Ugb24gYSBwZXItY2FsZW5kYXIgYmFzaXMgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNjaGVkdWxlQ291bnRPcHRpb25zIHtcclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBzY2hlZHVsZXMgYWxsb3dlZCBvbiBlYWNoIGl0ZW0uIE51bGwgZm9yIG5vIG1heCAqL1xyXG4gICAgICAgIGNvdW50OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBXaGV0aGVyIHlvdSBtdXN0IGhhdmUgZXhhY3RseSB0aGF0IG1hbnkgc2NoZWR1bGVzLCBvciBpZiBcInVwIHRvXCIgaXMgYWxsb3dlZCAqL1xyXG4gICAgICAgIGV4YWN0OiBib29sZWFuO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRGF5cyB7XHJcbiAgICAgICAgTW9uZGF5ID0gMCxcclxuICAgICAgICBUdWVzZGF5ID0gMSxcclxuICAgICAgICBXZWRuZXNkYXksXHJcbiAgICAgICAgVGh1cnNkYXksXHJcbiAgICAgICAgRnJpZGF5LFxyXG4gICAgICAgIFNhdHVyZGF5LFxyXG4gICAgICAgIFN1bmRheVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlIGV4dGVuZHMgYW5ndWxhci5JRmlsdGVyU2VydmljZSB7XHJcbiAgICAobmFtZTogJ2JyV2Vla2x5U2NoZWR1bGVyU2Vjb25kc0FzVGV4dCcpOiAobWludXRlczogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8VD4ge1xyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUgc2NoZWR1bGVzIHdpbGwgYmUgYWxsb3dlZCAmIHJlcXVpcmVkIHRvIGhhdmUgbm8gc2V0IGVuZCB0aW1lICovXHJcbiAgICAgICAgbnVsbEVuZHM/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhlc2UgY2xhc3NlcyB3aWxsIGJlIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIGJ1dHRvbnMgKi9cclxuICAgICAgICBidXR0b25DbGFzc2VzPzogc3RyaW5nW107XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHJldHVybiBhbiBpdGVtIC0tIHRoaXMgaXMgUkVRVUlSRUQgc28gdGhhdCBhZGFwdGVycyB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBuZXcgaXRlbXMsIGV2ZW4gaWYgdGhleSB3ZXJlbid0IHBhc3NlZCBpbiAqL1xyXG4gICAgICAgIGNyZWF0ZUl0ZW06IChkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLCBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdKSA9PiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD47XHJcblxyXG4gICAgICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBEbyBub3QgYXNzaWduIGZvciBubyBkZWZhdWx0ICovXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlPzogVDtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZCBpbiBvcmRlciB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGl0ICovXHJcbiAgICAgICAgZWRpdFNsb3Q/OiAoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikgPT4gYW5ndWxhci5JUHJvbWlzZTxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4+O1xyXG5cclxuICAgICAgICAvKiogV2hldGhlciB0byBmaWxsIGVtcHR5IHNwYWNlcyB3aXRoIHRoZSBkZWZhdWx0IHZhbHVlICovXHJcbiAgICAgICAgZmlsbEVtcHR5V2l0aERlZmF1bHQ/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcj86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgICAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgZGVmaW5lZCwgc2xvdHMgbXVzdCBiZSBhdCBsZWFzdCB0aGlzIG1hbnkgbWludXRlcyBhcGFydCAqL1xyXG4gICAgICAgIG1pbmltdW1TZXBhcmF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCB0aGUgY2FsZW5kYXIgd2lsbCBlbmZvcmNlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgcGVyIGl0ZW0gaXMgYWxsb3dlZCAqL1xyXG4gICAgICAgIG1vbm9TY2hlZHVsZT86IGJvb2xlYW47XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIGFjY2VzcyBiYWNrIHRvIHRoZSBjbGllbnQgc2NvcGUgd2hlbiB0aGUgc2NoZWR1bGVyIGNoYW5nZXMuICovXHJcbiAgICAgICAgb25DaGFuZ2U/OiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gYSBzY2hlZHVsZXIgaXMgcmVtb3ZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblJlbW92ZT86ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNlY29uZHMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgICAgIGludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogT3ZlcnJpZGVzIGZvciByZXN0cmljdGlvbiBleHBsYW5hdGlvbnMsIGlmIG5lY2Vzc2FyeSAqL1xyXG4gICAgICAgIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zPzogUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnM7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgc2F2ZSBidXR0b24gaXMgY2xpY2tlZC4gSWYgdGhpcyBpcyBub3QgcGFzc2VkLCBubyBzYXZlIGJ1dHRvbiB3aWxsIGJlIHByZXNlbnQuICovXHJcbiAgICAgICAgc2F2ZVNjaGVkdWxlcj86ICgpID0+IGFuZ3VsYXIuSVByb21pc2U8YW55PjtcclxuXHJcbiAgICAgICAgLyoqIE92ZXJyaWRlcyBmb3Igc2NoZWR1bGUgY291bnQgb3B0aW9ucywgaWYgbmVjZXNzYXJ5ICovXHJcbiAgICAgICAgc2NoZWR1bGVDb3VudE9wdGlvbnM/OiBTY2hlZHVsZUNvdW50T3B0aW9ucztcclxuICAgIH1cclxufVxyXG4iLCIvKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgICAgIC8qKiBBIGNzcyBjbGFzcyB0byBhcHBseSAqL1xyXG4gICAgICAgICRjbGFzcz86IHN0cmluZztcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBjb25zaWRlcmVkIGFjdGl2ZSB0byB0aGUgVUkgKi9cclxuICAgICAgICAkaXNBY3RpdmU/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBzZXQgdG8gdHJ1ZSB3aGlsZSB0aGUgdXNlciBpcyBlZGl0aW5nIGFuIGV4aXN0aW5nIGl0ZW0sIGl0IHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHRoZSBlZGl0IHByb21pc2UgaXMgcmVzb2x2ZWQgKi9cclxuICAgICAgICAkaXNEZWxldGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgYmVpbmcgZWRpdGVkIGJ5IHRoZSB1c2VyICovXHJcbiAgICAgICAgJGlzRWRpdGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBOb3Qgc3RyaWN0bHkgbmVjZXNzYXJ5IGJ1dCBtYWtlcyB0aGluZ3MgYSB3aG9vb2xlIGxvdCBlYXNpZXIgKi9cclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG5cclxuICAgICAgICBzdGFydDogbnVtYmVyO1xyXG4gICAgICAgIGVuZDogbnVtYmVyO1xyXG5cclxuICAgICAgICB2YWx1ZTogVDtcclxuXHJcbiAgICAgICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><br-weekly-scheduler adapter="adapterTwo" ng-form="test2" options="model2.options"></br-weekly-scheduler><code>Result:<pre>{{ adapterTwoResult | json }}</pre></code> <code>Valid: {{ test2.$valid }}</code><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown()" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove()"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.item.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.item.$renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" get-delta="multiSliderCtrl.pixelToVal(pixel)" drag-schedule="multiSliderCtrl.dragSchedule" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: !multiSliderCtrl.item.canEditSchedule(schedule),\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.invalidMessage"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" br-full-calendar="{{ schedulerCtrl.config.fullCalendar }}" br-max-time-slot="{{ schedulerCtrl.config.maxTimeSlot }}" br-minimum-separation="{{ schedulerCtrl.config.minimumSeparation }}" br-mono-schedule="{{ schedulerCtrl.config.monoSchedule }}" br-null-end="{{ schedulerCtrl.config.nullEnds }}" br-schedule-count="{{ schedulerCtrl.config.scheduleCountOptions && schedulerCtrl.config.scheduleCountOptions.count }}" br-overlap br-revalidate drag-schedule="schedulerCtrl.dragSchedule" ghost-values="schedulerCtrl.ghostValues" ng-model="item" ng-model-options="{allowInvalid: true}" set-ghost-values="schedulerCtrl.setGhostValues(ghostValues)"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.invalidMessage">{{ schedulerCtrl.invalidMessage }}</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resizeStart(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle immediate="weeklySlotCtrl.hasDragSchedule"><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resizeEnd(delta)" ondragstart="weeklySlotCtrl.startResize()" ondragstop="weeklySlotCtrl.endResize()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);