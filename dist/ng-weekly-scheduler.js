angular.module('demoApp', ['br.weeklyScheduler'])
    .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {
        $scope.isDirty = false;
        $scope.model = {
            options: {
                nullEnds: true,
                buttonClasses: ['wow!'],
                createItem: function (day, schedules) {
                    return {
                        day: day,
                        schedules: schedules
                    };
                },
                defaultValue: true,
                editSlot: function (schedule) {
                    return $timeout(function () { return schedule; }, 400);
                },
                maxTimeSlot: 300,
                monoSchedule: true
            }
        };
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
                day: 3 /* Thursday */,
                start: 0,
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
        $scope.rangeAdapter = new DemoRangeAdapter();
        this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
            $scope.isDirty = true;
            console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
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
    return DemoAdapter;
}());
/** Same here */
/** @internal */
var DemoRangeAdapter = /** @class */ (function () {
    function DemoRangeAdapter() {
    }
    DemoRangeAdapter.prototype.adapt = function (range) {
        return range;
    };
    return DemoRangeAdapter;
}());
angular.module('br.weeklyScheduler', ['ngWeeklySchedulerTemplates']);
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
                $document.on(mousemoveEvent, mousemove);
                $document.on(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$apply(scope.ondragstart());
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
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $scope, $window, nullEndWidth, overlapService) {
        var _this = this;
        this.$element = $element;
        this.$scope = $scope;
        this.$window = $window;
        this.nullEndWidth = nullEndWidth;
        this.overlapService = overlapService;
        this.overlapHandlers = (_a = {},
            _a[0 /* NoOverlap */] = function (current, other) { return _this.handleNoOverlap(current, other); },
            _a[1 /* CurrentIsInsideOther */] = function (current, other) { return _this.handleCurrentIsInsideOther(current, other); },
            _a[2 /* CurrentCoversOther */] = function (current, other) { return _this.handleCurrentCoversOther(current, other); },
            _a[3 /* OtherEndIsInsideCurrent */] = function (current, other) { return _this.handleOtherEndIsInsideCurrent(current, other); },
            _a[4 /* OtherStartIsInsideCurrent */] = function (current, other) { return _this.handleOtherStartIsInsideCurrent(current, other); },
            _a[5 /* OtherEndIsCurrentStart */] = function (current, other) { return _this.handleOtherEndIsCurrentStart(current, other); },
            _a[6 /* OtherStartIsCurrentEnd */] = function (current, other) { return _this.handleOtherStartIsCurrentEnd(current, other); },
            _a);
        this.canAdd = true;
        this.isDragging = false;
        this.isHoveringSlot = false;
        this.size = 60; // minutes
        this.element = this.$element[0];
        var _a;
    }
    MultiSliderController.prototype.$onInit = function () {
        this.mergeAllOverlaps();
    };
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$hoverElement = angular.element(this.$element.find('div')[0]);
        if (this.$hoverElement.length) {
            this.$element.on('mousemove', function (e) {
                var elOffX = _this.getElementOffsetX(_this.$element);
                var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
                var val = _this.pixelToVal(left);
                _this.$hoverElement.css({
                    left: _this.getSlotLeft(val),
                    right: _this.config.nullEnds ? _this.getSlotRight(val, val + _this.nullEndWidth) : _this.getSlotRight(val, val + _this.size)
                });
            });
        }
    };
    MultiSliderController.prototype.addSlot = function (start, end) {
        var _this = this;
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
        var schedule = {
            day: this.item.day,
            start: start,
            end: end,
            value: this.config.defaultValue
        };
        if (angular.isFunction(this.schedulerCtrl.config.editSlot)) {
            this.schedulerCtrl.config.editSlot(schedule).then(function (editedSchedule) {
                _this.addScheduleToItem(editedSchedule);
            });
        }
        else {
            this.addScheduleToItem(schedule);
        }
    };
    MultiSliderController.prototype.setDirty = function () {
        this.schedulerCtrl.dirty = true;
    };
    MultiSliderController.prototype.addScheduleToItem = function (schedule) {
        this.item.schedules.push(schedule);
        this.merge(schedule);
        this.setDirty();
    };
    MultiSliderController.prototype.getElementOffsetX = function (elem) {
        return elem[0].getBoundingClientRect().left;
    };
    MultiSliderController.prototype.adjustEndForModel = function (end) {
        if (end === this.config.maxValue) {
            end = 0;
        }
        return end;
    };
    /**
     * Determine if the schedule is able to be edited
     */
    MultiSliderController.prototype.canEdit = function (schedule) {
        var isEditable = !angular.isDefined(this.item.editable) || this.item.editable;
        var hasEditFunction = angular.isFunction(this.schedulerCtrl.config.editSlot);
        var isNotActive = !schedule.$isActive;
        var isNotDragging = !this.isDragging;
        return isEditable && hasEditFunction && isNotActive && isNotDragging;
    };
    /**
     * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
     * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
     */
    MultiSliderController.prototype.canRenderGhost = function (schedule) {
        if (this.config.nullEnds) {
            return this.item.schedules.length === 0;
        }
        return true;
    };
    MultiSliderController.prototype.compensateForBorder = function (elem, val) {
        var borderWidth = this.$window.getComputedStyle(elem).getPropertyValue('border-right');
        // There are double borders at the beginnings and ends of hours, so we don't need to worry about it
        var onHour = val % 60 === 0;
        return onHour ? elem.offsetLeft : elem.offsetLeft - parseInt(borderWidth, 10);
    };
    /**
     * Perform an external action to bring up an editor for a schedule
     */
    MultiSliderController.prototype.editSchedule = function (schedule) {
        var _this = this;
        if (this.canEdit(schedule)) {
            schedule.$isEditing = true;
            this.schedulerCtrl.config.editSlot(schedule).then(function (newSchedule) {
                if (newSchedule.$isDeleting) {
                    _this.removeSchedule(schedule);
                }
                else {
                    var premergeSchedule = angular.copy(newSchedule);
                    _this.merge(newSchedule);
                    // If merging mutated the schedule further, then updateSchedule would have already been called
                    // This is so that edits that don't trigger merges still trigger onChange,
                    // but edits that do trigger merges don't trigger it twice
                    if (angular.equals(premergeSchedule, newSchedule)) {
                        _this.updateSchedule(schedule, newSchedule);
                    }
                }
            }).finally(function () {
                _this.setDirty();
                schedule.$isEditing = false;
            });
        }
    };
    MultiSliderController.prototype.getOverlapState = function (current, other) {
        var overlapState = this.overlapService.getOverlapState(current.start, this.adjustEndForView(current.end), other.start, this.adjustEndForView(other.end));
        return overlapState;
    };
    MultiSliderController.prototype.getSlotLeft = function (start) {
        var underlyingInterval = this.getUnderlyingInterval(start);
        return this.compensateForBorder(underlyingInterval, start) + 'px';
    };
    MultiSliderController.prototype.getSlotRight = function (start, end) {
        // If there is a null end, place the end of the slot two hours away from the beginning.
        if (this.config.nullEnds && end === null) {
            end = start + this.nullEndWidth;
        }
        // An end of 0 should display allll the way to the right, up to the edge
        end = this.adjustEndForView(end);
        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        var underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);
        var offsetRight = this.compensateForBorder(underlyingInterval, end) + underlyingInterval.offsetWidth;
        var containerLeft = this.getElementOffsetX(this.$element);
        var containerRight = this.$element[0].getBoundingClientRect().right;
        return containerRight - containerLeft - offsetRight + 'px';
    };
    MultiSliderController.prototype.getUnderlyingInterval = function (val) {
        // Slightly hacky but does the job. TODO ?
        // There is no interval to the left of the leftmost interval, so return that instead
        if (val < 0) {
            val = 0;
        }
        // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
        var rightmost = this.config.maxValue - this.config.interval;
        if (val > rightmost) {
            val = rightmost;
        }
        return this.$element.parent()[0].querySelector("[rel='" + val + "']");
    };
    MultiSliderController.prototype.handleCurrentCoversOther = function (current, other) {
        // Here, it doesn't matter if the values match -- the covering slot can always "eat" the other one
        this.removeSchedule(other);
    };
    MultiSliderController.prototype.handleCurrentIsInsideOther = function (current, other) {
        if (this.valuesMatch(current, other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeSchedule(other);
            this.updateSchedule(current, {
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
    MultiSliderController.prototype.handleNoOverlap = function (current, other) {
        // Do nothing
    };
    MultiSliderController.prototype.handleOtherEndIsInsideCurrent = function (current, other) {
        if (this.valuesMatch(current, other)) {
            this.removeSchedule(other);
            this.updateSchedule(current, {
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        }
        else {
            this.updateSchedule(other, {
                day: other.day,
                start: other.start,
                end: current.start,
                value: current.value
            });
        }
    };
    MultiSliderController.prototype.handleOtherStartIsInsideCurrent = function (current, other) {
        if (this.valuesMatch(current, other)) {
            this.removeSchedule(other);
            this.updateSchedule(current, {
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            this.updateSchedule(other, {
                day: other.day,
                start: current.end,
                end: other.end,
                value: other.value
            });
        }
    };
    MultiSliderController.prototype.handleOtherEndIsCurrentStart = function (current, other) {
        if (this.valuesMatch(current, other)) {
            this.handleOtherEndIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    MultiSliderController.prototype.handleOtherStartIsCurrentEnd = function (current, other) {
        if (this.valuesMatch(current, other)) {
            this.handleOtherStartIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    MultiSliderController.prototype.mergeAllOverlaps = function () {
        var _this = this;
        this.item.schedules.forEach(function (s) { return _this.mergeOverlaps(s); });
    };
    MultiSliderController.prototype.mergeOverlaps = function (schedule) {
        var _this = this;
        var schedules = this.item.schedules;
        schedules.forEach((function (el) {
            if (el !== schedule) {
                var overlapState = _this.getOverlapState(schedule, el);
                var overlapHandler = _this.overlapHandlers[overlapState];
                overlapHandler(schedule, el);
            }
        }));
    };
    MultiSliderController.prototype.onHoverElementClick = function (event) {
        if (this.canAdd) {
            var elOffX = this.getElementOffsetX(this.$element);
            var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
            var start = this.pixelToVal(hoverElOffX);
            var end = this.config.nullEnds ? null : this.adjustEndForModel(start + this.size);
            this.addSlot(start, end);
        }
    };
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.isHoveringSlot = true;
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.isHoveringSlot = false;
    };
    /**
     * Actually remove the schedule from both the screen and the model
     */
    MultiSliderController.prototype.removeSchedule = function (schedule) {
        this.isDragging = false;
        this.isHoveringSlot = false;
        var schedules = this.item.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
        this.setDirty();
    };
    /**
     * Commit new values to the schedule
     */
    MultiSliderController.prototype.updateSchedule = function (schedule, update) {
        schedule.start = update.start;
        schedule.end = this.adjustEndForModel(update.end);
        this.schedulerCtrl.onChange({
            itemIndex: this.index,
            scheduleIndex: this.item.schedules.indexOf(schedule),
            scheduleValue: schedule
        });
    };
    MultiSliderController.prototype.valuesMatch = function (schedule, other) {
        return schedule.value === other.value;
    };
    MultiSliderController.prototype.adjustEndForView = function (end) {
        if (end === 0) {
            end = this.config.maxValue;
        }
        return end;
    };
    MultiSliderController.prototype.merge = function (schedule) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlaps(schedule);
        this.mergeAllOverlaps();
    };
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    MultiSliderController.$name = 'brMultiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$scope',
        '$window',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerOverlapService'
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
        this.require = {
            schedulerCtrl: '^brWeeklyScheduler'
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
var OverlapService = /** @class */ (function () {
    function OverlapService() {
    }
    OverlapService.prototype.getOverlapState = function (currentStart, currentEnd, otherStart, otherEnd) {
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
    return OverlapService;
}());
angular
    .module('br.weeklyScheduler')
    .service(OverlapService.$name, OverlapService);
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
        this.violations = {};
    }
    RestrictionExplanationsController.prototype.$doCheck = function () {
        var errors = this.schedulerCtrl.validationErrors;
        this.violations = (_a = {},
            _a["fullCalendarViolation" /* FullCalendarViolation */] = errors.indexOf("fullCalendarViolation" /* FullCalendarViolation */) > -1,
            _a["maxTimeSlotViolation" /* MaxTimeSlotViolation */] = errors.indexOf("maxTimeSlotViolation" /* MaxTimeSlotViolation */) > -1,
            _a["monoScheduleViolation" /* MonoScheduleViolation */] = errors.indexOf("monoScheduleViolation" /* MonoScheduleViolation */) > -1,
            _a);
        var _a;
    };
    RestrictionExplanationsController.prototype.$onInit = function () {
        var config = this.schedulerCtrl.config;
        if (config.maxTimeSlot) {
            var maxTimeSlot = this.$filter('brWeeklySchedulerMinutesAsText')(config.maxTimeSlot);
            this.explanations["maxTimeSlotViolation" /* MaxTimeSlotViolation */] = "Max time slot length: " + maxTimeSlot;
        }
        if (config.fullCalendar) {
            this.explanations["fullCalendarViolation" /* FullCalendarViolation */] = 'For this calendar, every day must be completely full of schedules.';
        }
        if (config.monoSchedule) {
            this.explanations["monoScheduleViolation" /* MonoScheduleViolation */] = 'This calendar may only have one time slot per day';
        }
        if (config.nullEnds) {
            this.explanations["nullEndViolation" /* NullEndViolation */] = 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.';
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
        this.template = "\n        <div class=\"srow explanations\" ng-class=\"{ violation: restrictionExplanationsCtrl.violations[key] }\" ng-repeat=\"(key, explanation) in restrictionExplanationsCtrl.explanations\">\n            {{ explanation }}\n        </div>\n    ";
    }
    RestrictionExplanationsComponent.$name = 'brRestrictionExplanations';
    return RestrictionExplanationsComponent;
}());
angular
    .module('br.weeklyScheduler')
    .component(RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsController.$name, RestrictionExplanationsController);
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
    function MaxTimeSlotValidatorService() {
    }
    MaxTimeSlotValidatorService.prototype.validate = function (schedules, maxTimeSlot) {
        if (!maxTimeSlot) {
            return true;
        }
        return !schedules.some(function (s) { return s.end - s.start > maxTimeSlot; });
    };
    MaxTimeSlotValidatorService.$name = 'brWeeklySchedulerMaxTimeSlotValidatorService';
    return MaxTimeSlotValidatorService;
}());
angular
    .module('br.weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
/** @internal */
var MonoScheduleValidatorService = /** @class */ (function () {
    function MonoScheduleValidatorService() {
    }
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
    NullEndScheduleValidatorService.prototype.validate = function (schedules, config) {
        if (config.nullEnds) {
            return schedules.length <= 1;
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
    OverlapValidatorService.prototype.validate = function (schedules, maxValue) {
        // Compare two at a time until the end
        var len = schedules.length;
        var result = true;
        for (var i = 0; i < len - 1; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            var valuesMatch = current.value === next.value;
            if (!valuesMatch) {
                var overlapState = this.overlapService.getOverlapState(current.start, current.end || maxValue, next.start, next.end || maxValue);
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
var ScheduleValidationService = /** @class */ (function () {
    function ScheduleValidationService(fullCalendarValidatorService, maxTimeSlotValidatorService, monoScheduleValidatorService, nullEndScheduleValidatorService, overlapValidatorService) {
        this.fullCalendarValidatorService = fullCalendarValidatorService;
        this.maxTimeSlotValidatorService = maxTimeSlotValidatorService;
        this.monoScheduleValidatorService = monoScheduleValidatorService;
        this.nullEndScheduleValidatorService = nullEndScheduleValidatorService;
        this.overlapValidatorService = overlapValidatorService;
    }
    ScheduleValidationService.prototype.getValidationErrors = function (item, config) {
        var result = [];
        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
            result.push("maxTimeSlotViolation" /* MaxTimeSlotViolation */);
        }
        if (!this.monoScheduleValidatorService.validate(item.schedules, config)) {
            result.push("fullCalendarViolation" /* FullCalendarViolation */);
        }
        if (!this.nullEndScheduleValidatorService.validate(item.schedules, config)) {
            result.push("nullEndViolation" /* NullEndViolation */);
        }
        if (!this.fullCalendarValidatorService.validate(item.schedules, config)) {
            result.push("fullCalendarViolation" /* FullCalendarViolation */);
        }
        if (!this.overlapValidatorService.validate(item.schedules, config.maxValue)) {
            result.push("overlapViolation" /* OverlapViolation */);
        }
        return result;
    };
    ScheduleValidationService.$name = 'brWeeklySchedulerValidationService';
    ScheduleValidationService.$inject = [
        'brWeeklySchedulerFullCalendarValidatorService',
        'brWeeklySchedulerMaxTimeSlotValidatorService',
        'brWeeklySchedulerMonoScheduleValidatorService',
        'brWeeklySchedulerNullEndValidatorService',
        'brWeeklySchedulerOverlapValidatorService'
    ];
    return ScheduleValidationService;
}());
angular
    .module('br.weeklyScheduler')
    .service(ScheduleValidationService.$name, ScheduleValidationService);
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
    function WeeklySchedulerController($element, $q, $scope, groupService, dayMap, scheduleValidatorService) {
        var _this = this;
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.groupService = groupService;
        this.dayMap = dayMap;
        this.scheduleValidatorService = scheduleValidatorService;
        this.defaultOptions = {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            saveScheduler: function () {
                console.log('saved');
                return _this.$q.when();
            },
            defaultValue: null,
            monoSchedule: false
        };
    }
    WeeklySchedulerController.prototype.$doCheck = function () {
        var validationErrors = this.getValidationErrors();
        if (validationErrors) {
            this.validationErrors = validationErrors;
        }
    };
    WeeklySchedulerController.prototype.$onInit = function () {
        this.config = this.configure(this.options);
        this.buildItemsFromAdapter();
        this.startedWithInvalidSchedule = this.hasInvalidSchedule();
        this.watchAdapter();
        this.watchHoverClass();
    };
    WeeklySchedulerController.prototype.buildItems = function (items) {
        this.items = this.fillItems(items);
        // keep a reference on the adapter so we can pull it out later
        this.adapter.items = this.items;
        // keep a copy of the items in case we need to rollback
        this._originalItems = angular.copy(this.items);
    };
    WeeklySchedulerController.prototype.buildItemsFromAdapter = function () {
        return this.buildItems(this.getItemsFromAdapter());
    };
    WeeklySchedulerController.prototype.getItemsFromAdapter = function () {
        var result = [];
        if (this.adapter && this.rangeAdapter) {
            var schedules = this.rangeAdapter.adapt(this.adapter.initialData);
            var groupedSchedules = this.groupService.groupSchedules(schedules);
            for (var key in groupedSchedules) {
                var item = this.createItem(parseInt(key, 10), groupedSchedules[key]);
                result.push(item);
            }
        }
        return result;
    };
    WeeklySchedulerController.prototype.getValidationErrors = function () {
        var _this = this;
        return Array.prototype.concat.apply([], this.items.map(function (item) { return _this.scheduleValidatorService.getValidationErrors(item, _this.config); }));
    };
    WeeklySchedulerController.prototype.hasInvalidSchedule = function () {
        var validationErrors = this.getValidationErrors();
        return validationErrors.length > 0;
    };
    /**
     * Configure the scheduler.
     */
    WeeklySchedulerController.prototype.configure = function (options) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;
        var userOptions = angular.extend(this.defaultOptions, options);
        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: minutesInDay,
            hourCount: hoursInDay,
            intervalCount: intervalCount,
        });
        return result;
    };
    WeeklySchedulerController.prototype.createItem = function (day, schedules) {
        var result;
        var builder = this.config.createItem(day, schedules);
        result = angular.extend(builder, { label: this.dayMap[day] });
        return result;
    };
    /**
     * The scheduler should always show all days, even if it was not passed any schedules for that day
     */
    WeeklySchedulerController.prototype.fillItems = function (items) {
        var _this = this;
        var result = [];
        angular.forEach(this.dayMap, function (day, stringKey) {
            var key = parseInt(stringKey, 10);
            var filteredItems = items.filter(function (item) { return item.day === key; });
            var item = filteredItems.length ? filteredItems[0] : null;
            if (!item) {
                result.push(_this.createItem(key, []));
            }
            else {
                // If the item DID exist just set the label
                item.label = day;
                result.push(item);
            }
        });
        return angular.copy(result).sort(function (a, b) { return a.day > b.day ? 1 : -1; });
    };
    WeeklySchedulerController.prototype.resetZoom = function () {
        this.$scope.$broadcast("resetZoom" /* RESET_ZOOM */);
    };
    WeeklySchedulerController.prototype.zoomIn = function () {
        this.$scope.$broadcast("zoomIn" /* ZOOM_IN */);
    };
    WeeklySchedulerController.prototype.rollback = function () {
        this.buildItems(this._originalItems);
        this.dirty = false;
    };
    WeeklySchedulerController.prototype.save = function () {
        var _this = this;
        return this.config.saveScheduler().then(function () { return _this.dirty = false; });
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
        '$q',
        '$scope',
        'brWeeklySchedulerGroupService',
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerValidationService',
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
            adapter: '<',
            hoverClass: '<',
            options: '=',
            onChange: '&',
            rangeAdapter: '<',
        };
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.transclude = true;
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
/** @internal */
var WeeklySlotController = /** @class */ (function () {
    function WeeklySlotController($scope, $timeout, nullEndWidth, overlapService) {
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.nullEndWidth = nullEndWidth;
        this.overlapService = overlapService;
        this.resizeDirectionIsStart = true;
    }
    WeeklySlotController.prototype.$onInit = function () {
        this.valuesOnDragStart = this.getDragStartValues();
    };
    /**
     * We want to cancel the drag operation if the user is just clicking on the item or has started dragging without waiting for the drag to "activate"
     * However, we should give them a small tolerance before considering them to have started dragging early, as it is very easy to accidentally move a few pixels.
     */
    WeeklySlotController.prototype.cancelDragIfThresholdExceeded = function (pixel) {
        if (pixel > 3) {
            this.cancelDrag();
        }
    };
    WeeklySlotController.prototype.cancelDrag = function () {
        this.$timeout.cancel(this.startDragTimeout);
    };
    WeeklySlotController.prototype.getDragStartValues = function () {
        return {
            day: this.schedule.day,
            start: this.schedule.start,
            end: this.config.nullEnds ? this.multisliderCtrl.adjustEndForView(this.schedule.start + this.nullEndWidth) : this.multisliderCtrl.adjustEndForView(this.schedule.end),
            value: this.schedule.value
        };
    };
    WeeklySlotController.prototype.deleteSelf = function () {
        this.removeSchedule({ schedule: this.schedule });
    };
    WeeklySlotController.prototype.editSelf = function () {
        this.editSchedule({ schedule: this.schedule });
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        if (!this.schedule.$isActive) {
            this.cancelDragIfThresholdExceeded(pixel);
            return;
        }
        this.multisliderCtrl.isDragging = true;
        var ui = this.schedule;
        var delta = this.multisliderCtrl.pixelToVal(pixel);
        var duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var newEnd = this.config.nullEnds ? null : Math.round(newStart + duration);
        if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
            this.updateSelf({
                day: ui.day,
                start: newStart,
                end: newEnd,
                value: ui.value
            });
        }
    };
    WeeklySlotController.prototype.endDrag = function () {
        var _this = this;
        this.cancelDrag();
        if (!this.schedule.$isActive) {
            return this.editSelf();
        }
        this.$timeout(function () {
            // this prevents user from accidentally
            // adding new slot after resizing or dragging
            _this.multisliderCtrl.canAdd = true;
            // this prevents ng-click from accidentally firing after resizing or dragging
            _this.schedule.$isActive = false;
            _this.multisliderCtrl.isDragging = false;
        }, 200).then(function () {
            _this.multisliderCtrl.setDirty();
            _this.multisliderCtrl.merge(_this.schedule);
        });
    };
    WeeklySlotController.prototype.resize = function (pixel) {
        if (!this.schedule.$isActive) {
            this.cancelDragIfThresholdExceeded(pixel);
            return;
        }
        this.multisliderCtrl.isDragging = true;
        var ui = this.schedule;
        var delta = this.multisliderCtrl.pixelToVal(pixel);
        if (this.resizeDirectionIsStart) {
            this.resizeStart(ui, delta);
        }
        else {
            this.resizeEnd(ui, delta);
        }
    };
    WeeklySlotController.prototype.resizeStart = function (schedule, delta) {
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var startChanged = schedule.start !== newStart;
        var newStartBeforeOrAtEnd = newStart <= this.multisliderCtrl.adjustEndForView(schedule.end) - 1;
        var newStartAfterOrAtStart = newStart >= 0;
        if (startChanged && newStartBeforeOrAtEnd && newStartAfterOrAtStart) {
            this.updateSelf({
                day: schedule.day,
                start: newStart,
                end: schedule.end,
                value: schedule.value
            });
        }
    };
    WeeklySlotController.prototype.resizeEnd = function (schedule, delta) {
        var newEnd = Math.round(this.valuesOnDragStart.end + delta);
        var endChanged = schedule.end !== newEnd;
        var newEndBeforeOrAtEnd = newEnd <= this.config.maxValue;
        var newEndAfterOrAtStart = newEnd >= schedule.start + 1;
        if (endChanged && newEndAfterOrAtStart && newEndBeforeOrAtEnd) {
            this.updateSelf({
                day: schedule.day,
                start: schedule.start,
                end: newEnd,
                value: schedule.value
            });
        }
    };
    WeeklySlotController.prototype.startDrag = function () {
        var _this = this;
        this.startDragTimeout = this.$timeout(function () {
            _this.schedule.$isActive = true;
            _this.multisliderCtrl.canAdd = false;
        }, 500);
        this.valuesOnDragStart = this.getDragStartValues();
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
        this.updateSchedule({ schedule: this.schedule, update: update });
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        '$scope',
        '$timeout',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerOverlapService'
    ];
    return WeeklySlotController;
}());
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            schedule: '=ngModel',
            editSchedule: '&',
            removeSchedule: '&',
            updateSchedule: '&',
            item: '='
        };
        this.controller = WeeklySlotController.$name;
        this.controllerAs = WeeklySlotController.$controllerAs;
        this.require = {
            multisliderCtrl: '^brMultiSlider'
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy1jb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9mdWxsLWNhbGVuZGFyLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21heC10aW1lLXNsb3QtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvbW9uby1zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9udWxsLWVuZC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9vdmVybGFwLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL3NjaGVkdWxlLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2Nyb2xsL3Njcm9sbC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9taW51dGVzLWFzLXRleHQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS90aW1lLXJhbmdlLWNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL051bGxFbmRXaWR0aC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvem9vbS96b29tLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9EYXlzLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVJlc2l6ZVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JUmVzaXplU2VydmljZVByb3ZpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckFkYXB0ZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2VBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUM5QyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDekQsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFdkIsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPO3dCQUNMLEdBQUcsRUFBRSxHQUFHO3dCQUNSLFNBQVMsRUFBRSxTQUFTO3FCQUNyQixDQUFBO2dCQUNILENBQUM7Z0JBQ0QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFFBQVEsRUFBRSxVQUFVLFFBQVE7b0JBQzFCLE9BQU8sUUFBUSxDQUFDLGNBQU0sT0FBQSxRQUFRLEVBQVIsQ0FBUSxFQUFF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bHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ2JyLndlZWtseVNjaGVkdWxlciddKVxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5pc0RpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgbnVsbEVuZHM6IHRydWUsXHJcbiAgICAgICAgICBidXR0b25DbGFzc2VzOiBbJ3dvdyEnXSxcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGRheTogZGF5LFxyXG4gICAgICAgICAgICAgIHNjaGVkdWxlczogc2NoZWR1bGVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICAgICAgICBlZGl0U2xvdDogZnVuY3Rpb24gKHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiBzY2hlZHVsZSwgNDAwKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBtYXhUaW1lU2xvdDogMzAwLFxyXG4gICAgICAgICAgbW9ub1NjaGVkdWxlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmFkYXB0ZXIgPSBuZXcgRGVtb0FkYXB0ZXIoW1xyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgIGRheTogRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAvLyAgIHN0YXJ0OiAxMzgwLFxyXG4gICAgICAgIC8vICAgZW5kOiBudWxsLFxyXG4gICAgICAgIC8vICAgdmFsdWU6IHRydWVcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogNjAwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogRGF5cy5Nb25kYXksXHJcbiAgICAgICAgICBzdGFydDogNzIwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMzAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBEYXlzLlRodXJzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBEYXlzLkZyaWRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIF0pO1xyXG5cclxuICAgICAgJHNjb3BlLnJhbmdlQWRhcHRlciA9IG5ldyBEZW1vUmFuZ2VBZGFwdGVyKCk7XHJcblxyXG4gICAgICB0aGlzLmRvU29tZXRoaW5nID0gZnVuY3Rpb24gKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkge1xyXG4gICAgICAgICRzY29wZS5pc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG5cclxuLyoqIFRoZSBkYXRhIGlzIGFscmVhZHkgaW4gYW4gYWNjZXB0YWJsZSBmb3JtYXQgZm9yIHRoZSBkZW1vIHNvIGp1c3QgcGFzcyBpdCB0aHJvdWdoICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRGVtb0FkYXB0ZXIgaW1wbGVtZW50cyBJV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj4sIGJvb2xlYW4+IHtcclxuICBwdWJsaWMgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPGJvb2xlYW4+W10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgaW5pdGlhbERhdGE6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPltdLFxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNuYXBzaG90KCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMuaXRlbXMubWFwKGl0ZW0gPT4gaXRlbS5zY2hlZHVsZXMubWFwKHNjaGVkdWxlID0+IHNjaGVkdWxlKSkpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFNhbWUgaGVyZSAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9SYW5nZUFkYXB0ZXIgaW1wbGVtZW50cyBJV2Vla2x5U2NoZWR1bGVyUmFuZ2VBZGFwdGVyPElXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPiwgYm9vbGVhbj4ge1xyXG4gIHB1YmxpYyBhZGFwdChyYW5nZSkge1xyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG4gIH1cclxufVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKTogeyBba2V5OiBudW1iZXJdOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0ge1xyXG4gICAgICAgIGxldCBzZWVkOiB7IFtrZXk6IG51bWJlcl06IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcblxyXG4gICAgbGV0IG1vdXNlZG93bkV2ZW50OiBzdHJpbmcgPSAnbW91c2Vkb3duIHRvdWNoc3RhcnQnO1xyXG4gICAgbGV0IG1vdXNlbW92ZUV2ZW50OiBzdHJpbmcgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSc7XHJcbiAgICBsZXQgbW91c2V1cEV2ZW50OiBzdHJpbmcgPSAnbW91c2V1cCB0b3VjaGVuZCc7XHJcblxyXG4gICAgZWxlbWVudC5vbihtb3VzZWRvd25FdmVudCwgKGV2ZW50KSA9PiB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdGFydCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFnZVgoZXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGV2ZW50LnBhZ2VYIHx8IGdldFRvdWNoZXMoZXZlbnQpWzBdLnBhZ2VYO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRvdWNoZXMoZXZlbnQ6IGFueSk6IGFueSB7IC8vIHRvZG9cclxuICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaWYgKCFldmVudC50b3VjaGVzKSB7XHJcbiAgICAgICAgZXZlbnQudG91Y2hlcyA9IFtldmVudC5vcmlnaW5hbEV2ZW50XTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJIb3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXmJyV2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vIFN0cmlwZSBpdCBieSBob3VyXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHdpbmRvdycsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXBdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudCwgb3RoZXIpXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG5cclxuICBwdWJsaWMgY2FuQWRkOiBib29sZWFuID0gdHJ1ZTtcclxuICBwdWJsaWMgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0hvdmVyaW5nU2xvdDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBwdWJsaWMgZWxlbWVudDogRWxlbWVudDtcclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHVibGljIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICBpZiAodGhpcy4kaG92ZXJFbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBsZWZ0ID0gZS5wYWdlWCAtIGVsT2ZmWCAtIHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCAvIDI7XHJcblxyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnBpeGVsVG9WYWwobGVmdCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogdGhpcy5nZXRTbG90TGVmdCh2YWwpLFxyXG4gICAgICAgICAgcmlnaHQ6IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdGhpcy5nZXRTbG90UmlnaHQodmFsLCB2YWwgKyB0aGlzLm51bGxFbmRXaWR0aCkgOiB0aGlzLmdldFNsb3RSaWdodCh2YWwsIHZhbCArIHRoaXMuc2l6ZSlcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkU2xvdChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICBzdGFydCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuZCA+IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpdGVtID0gdGhpcy5pdGVtO1xyXG5cclxuICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2NoZWR1bGUgPSB7XHJcbiAgICAgIGRheTogdGhpcy5pdGVtLmRheSxcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZCxcclxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpKSB7XHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKGVkaXRlZFNjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShlZGl0ZWRTY2hlZHVsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0RGlydHkoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwuZGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXRlbS5zY2hlZHVsZXMucHVzaChzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlKHNjaGVkdWxlKTtcclxuXHJcbiAgICB0aGlzLnNldERpcnR5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RWxlbWVudE9mZnNldFgoZWxlbTogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICByZXR1cm4gZWxlbVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGp1c3RFbmRGb3JNb2RlbChlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKGVuZCA9PT0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZW5kO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSBzY2hlZHVsZSBpcyBhYmxlIHRvIGJlIGVkaXRlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuRWRpdChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBpc0VkaXRhYmxlID0gIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuaXRlbS5lZGl0YWJsZSkgfHwgdGhpcy5pdGVtLmVkaXRhYmxlO1xyXG4gICAgbGV0IGhhc0VkaXRGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KTtcclxuICAgIGxldCBpc05vdEFjdGl2ZSA9ICFzY2hlZHVsZS4kaXNBY3RpdmU7XHJcbiAgICBsZXQgaXNOb3REcmFnZ2luZyA9ICF0aGlzLmlzRHJhZ2dpbmc7XHJcblxyXG4gICAgcmV0dXJuIGlzRWRpdGFibGUgJiYgaGFzRWRpdEZ1bmN0aW9uICYmIGlzTm90QWN0aXZlICYmIGlzTm90RHJhZ2dpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYXRoZXIgdGhhbiBoYXZpbmcgdG8gZGVhbCB3aXRoIG1vZGlmeWluZyBtZXJnZU92ZXJsYXBzIHRvIGhhbmRsZSBudWxsRW5kcyBjYWxlbmRhcnMsXHJcbiAgICoganVzdCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gY3JlYXRpbmcgYWRkaXRpb25hbCBzbG90cyBpbiBudWxsRW5kcyBjYWxlbmRhcnMgdW5sZXNzIHRoZXJlIGFyZSBubyBzbG90cyB0aGVyZSBhbHJlYWR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuUmVuZGVyR2hvc3Qoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXRlbS5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wZW5zYXRlRm9yQm9yZGVyKGVsZW06IEhUTUxFbGVtZW50LCB2YWw6IG51bWJlcikge1xyXG4gICAgbGV0IGJvcmRlcldpZHRoID0gdGhpcy4kd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXJpZ2h0Jyk7XHJcblxyXG4gICAgLy8gVGhlcmUgYXJlIGRvdWJsZSBib3JkZXJzIGF0IHRoZSBiZWdpbm5pbmdzIGFuZCBlbmRzIG9mIGhvdXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGl0XHJcbiAgICBsZXQgb25Ib3VyID0gdmFsICUgNjAgPT09IDA7XHJcblxyXG4gICAgcmV0dXJuIG9uSG91ciA/IGVsZW0ub2Zmc2V0TGVmdCA6IGVsZW0ub2Zmc2V0TGVmdCAtIHBhcnNlSW50KGJvcmRlcldpZHRoLCAxMCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGFuIGV4dGVybmFsIGFjdGlvbiB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGEgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLmNhbkVkaXQoc2NoZWR1bGUpKSB7XHJcbiAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigobmV3U2NoZWR1bGUpID0+IHtcclxuICAgICAgICBpZiAobmV3U2NoZWR1bGUuJGlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1lcmdlKG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiBtZXJnaW5nIG11dGF0ZWQgdGhlIHNjaGVkdWxlIGZ1cnRoZXIsIHRoZW4gdXBkYXRlU2NoZWR1bGUgd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHNvIHRoYXQgZWRpdHMgdGhhdCBkb24ndCB0cmlnZ2VyIG1lcmdlcyBzdGlsbCB0cmlnZ2VyIG9uQ2hhbmdlLFxyXG4gICAgICAgICAgLy8gYnV0IGVkaXRzIHRoYXQgZG8gdHJpZ2dlciBtZXJnZXMgZG9uJ3QgdHJpZ2dlciBpdCB0d2ljZVxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHByZW1lcmdlU2NoZWR1bGUsIG5ld1NjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKHNjaGVkdWxlLCBuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNldERpcnR5KCk7XHJcbiAgICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBPdmVybGFwU3RhdGUge1xyXG4gICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQuc3RhcnQsIHRoaXMuYWRqdXN0RW5kRm9yVmlldyhjdXJyZW50LmVuZCksIG90aGVyLnN0YXJ0LCB0aGlzLmFkanVzdEVuZEZvclZpZXcob3RoZXIuZW5kKSk7XHJcblxyXG4gICAgcmV0dXJuIG92ZXJsYXBTdGF0ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIHN0YXJ0KSArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gSWYgdGhlcmUgaXMgYSBudWxsIGVuZCwgcGxhY2UgdGhlIGVuZCBvZiB0aGUgc2xvdCB0d28gaG91cnMgYXdheSBmcm9tIHRoZSBiZWdpbm5pbmcuXHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMgJiYgZW5kID09PSBudWxsKSB7XHJcbiAgICAgIGVuZCA9IHN0YXJ0ICsgdGhpcy5udWxsRW5kV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQW4gZW5kIG9mIDAgc2hvdWxkIGRpc3BsYXkgYWxsbGwgdGhlIHdheSB0byB0aGUgcmlnaHQsIHVwIHRvIHRoZSBlZGdlXHJcbiAgICBlbmQgPSB0aGlzLmFkanVzdEVuZEZvclZpZXcoZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBlbmQpICsgdW5kZXJseWluZ0ludGVydmFsLm9mZnNldFdpZHRoO1xyXG4gICAgbGV0IGNvbnRhaW5lckxlZnQgPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xyXG5cclxuICAgIHJldHVybiBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSBsZWZ0IG9mIHRoZSBsZWZ0bW9zdCBpbnRlcnZhbCwgc28gcmV0dXJuIHRoYXQgaW5zdGVhZFxyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIGlmICh2YWwgPiByaWdodG1vc3QpIHtcclxuICAgICAgdmFsID0gcmlnaHRtb3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnBhcmVudCgpWzBdLnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAvLyBIZXJlLCBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgdmFsdWVzIG1hdGNoIC0tIHRoZSBjb3ZlcmluZyBzbG90IGNhbiBhbHdheXMgXCJlYXRcIiB0aGUgb3RoZXIgb25lXHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSnVzdCByZW1vdmUgJ2N1cnJlbnQnXHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoY3VycmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAvLyBEbyBub3RoaW5nXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgdmFsdWU6IGN1cnJlbnQudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgZGF5OiBjdXJyZW50LmRheSxcclxuICAgICAgICBzdGFydDogY3VycmVudC5zdGFydCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKG90aGVyLCB7XHJcbiAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgc3RhcnQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUFsbE92ZXJsYXBzKCkge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5mb3JFYWNoKHMgPT4gdGhpcy5tZXJnZU92ZXJsYXBzKHMpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VPdmVybGFwcyhzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5mb3JFYWNoKChlbCA9PiB7XHJcbiAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5nZXRPdmVybGFwU3RhdGUoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLm92ZXJsYXBIYW5kbGVyc1tvdmVybGFwU3RhdGVdO1xyXG5cclxuICAgICAgICBvdmVybGFwSGFuZGxlcihzY2hlZHVsZSwgZWwpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uSG92ZXJFbGVtZW50Q2xpY2soZXZlbnQpIHtcclxuICAgIGlmICh0aGlzLmNhbkFkZCkge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGhvdmVyRWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRob3ZlckVsZW1lbnQpIC0gZWxPZmZYO1xyXG5cclxuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5waXhlbFRvVmFsKGhvdmVyRWxPZmZYKTtcclxuICAgICAgdmFyIGVuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IHRoaXMuYWRqdXN0RW5kRm9yTW9kZWwoc3RhcnQgKyB0aGlzLnNpemUpO1xyXG5cclxuICAgICAgdGhpcy5hZGRTbG90KHN0YXJ0LCBlbmQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZU92ZXIoKSB7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VMZWF2ZSgpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFjdHVhbGx5IHJlbW92ZSB0aGUgc2NoZWR1bGUgZnJvbSBib3RoIHRoZSBzY3JlZW4gYW5kIHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgdGhpcy5zZXREaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tbWl0IG5ldyB2YWx1ZXMgdG8gdGhlIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHNjaGVkdWxlLnN0YXJ0ID0gdXBkYXRlLnN0YXJ0O1xyXG4gICAgc2NoZWR1bGUuZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JNb2RlbCh1cGRhdGUuZW5kKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2Uoe1xyXG4gICAgICBpdGVtSW5kZXg6IHRoaXMuaW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlSW5kZXg6IHRoaXMuaXRlbS5zY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksXHJcbiAgICAgIHNjaGVkdWxlVmFsdWU6IHNjaGVkdWxlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzTWF0Y2goc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHJldHVybiBzY2hlZHVsZS52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRqdXN0RW5kRm9yVmlldyhlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKGVuZCA9PT0gMCkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZW5kO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gV2UgY29uc2lkZXIgdGhlIHNjaGVkdWxlIHdlIHdlcmUgd29ya2luZyB3aXRoIHRvIGJlIHRoZSBtb3N0IGltcG9ydGFudCwgc28gaGFuZGxlIGl0cyBvdmVybGFwcyBmaXJzdC5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcyhzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGl0ZW06ICc9JyxcclxuICAgIGluZGV4OiAnPCcsXHJcbiAgICBzaXplOiAnPD8nXHJcbiAgfVxyXG5cclxuICBjb250cm9sbGVyID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnO1xyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG90aGVyU3RhcnQsIG90aGVyRW5kKTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBpZiAob3RoZXJFbmQgPj0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbmQgPj0gb3RoZXJFbmQgJiYgY3VycmVudFN0YXJ0IDw9IG90aGVyU3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPiBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPj0gY3VycmVudFN0YXJ0ICYmIG90aGVyU3RhcnQgPCBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA9PT0gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPT09IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuTm9PdmVybGFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFNlcnZpY2UuJG5hbWUsIE92ZXJsYXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlUHJvdmlkZXIgaW1wbGVtZW50cyBJUmVzaXplU2VydmljZVByb3ZpZGVyIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgJG5hbWUgPSAnYnIud2Vla2x5U2NoZWR1bGVyLnJlc2l6ZVNlcnZpY2UnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuJGdldC4kaW5qZWN0ID0gW1xyXG4gICAgICAgICAgICAnJHJvb3RTY29wZScsXHJcbiAgICAgICAgICAgICckd2luZG93J1xyXG4gICAgICAgIF1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGN1c3RvbVJlc2l6ZUV2ZW50czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIHNlcnZpY2VJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBzZXRDdXN0b21SZXNpemVFdmVudHMoZXZlbnRzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzID0gZXZlbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyAkZ2V0KFxyXG4gICAgICAgICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgJHdpbmRvdzogYW5ndWxhci5JV2luZG93U2VydmljZVxyXG4gICAgKTogSVJlc2l6ZVNlcnZpY2Uge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlcnZpY2VJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZEV2ZW50TGlzdGVuZXIgZXhpc3RzIG91dHNpZGUgb2YgYW5ndWxhciBzbyB3ZSBoYXZlIHRvICRhcHBseSB0aGUgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXN0b21SZXNpemVFdmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihldmVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQgPSB0cnVlOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAucHJvdmlkZXIoUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCBSZXNpemVTZXJ2aWNlUHJvdmlkZXIpXHJcbiAgICAucnVuKFtSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBJUmVzaXplU2VydmljZSkgPT4gcmVzaXplU2VydmljZS5pbml0aWFsaXplKCldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3Jlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybCc7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckZmlsdGVyJ107XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG5cclxuICAgIHByaXZhdGUgZXhwbGFuYXRpb25zOiB7IFtrZXkgaW4gVmFsaWRhdGlvbkVycm9yXT86IHN0cmluZyB9ID0ge307XHJcbiAgICBwcml2YXRlIHZpb2xhdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogYm9vbGVhbiB9ID0ge307XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZmlsdGVyOiBJV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJGRvQ2hlY2soKSB7XHJcbiAgICAgICAgbGV0IGVycm9ycyA9IHRoaXMuc2NoZWR1bGVyQ3RybC52YWxpZGF0aW9uRXJyb3JzO1xyXG5cclxuICAgICAgICB0aGlzLnZpb2xhdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uXTogZXJyb3JzLmluZGV4T2YoVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbikgPiAtMSxcclxuICAgICAgICAgICAgW1ZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbl06IGVycm9ycy5pbmRleE9mKFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbikgPiAtMSxcclxuICAgICAgICAgICAgW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb25dOiBlcnJvcnMuaW5kZXhPZihWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uKSA+IC0xXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JykoY29uZmlnLm1heFRpbWVTbG90KTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90VmlvbGF0aW9uXSA9IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHttYXhUaW1lU2xvdH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbl0gPSAnRm9yIHRoaXMgY2FsZW5kYXIsIGV2ZXJ5IGRheSBtdXN0IGJlIGNvbXBsZXRlbHkgZnVsbCBvZiBzY2hlZHVsZXMuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb25dID0gJ1RoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBvbmUgdGltZSBzbG90IHBlciBkYXknO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZFZpb2xhdGlvbl0gPSAnSXRlbXMgaW4gdGhpcyBjYWxlbmRhciBkbyBub3QgaGF2ZSBlbmQgdGltZXMuIFNjaGVkdWxlZCBldmVudHMgYmVnaW4gYXQgdGhlIHN0YXJ0IHRpbWUgYW5kIGVuZCB3aGVuIHRoZXkgYXJlIGZpbmlzaGVkLic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHJlcXVpcmUgPSB7XHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNyb3cgZXhwbGFuYXRpb25zXCIgbmctY2xhc3M9XCJ7IHZpb2xhdGlvbjogcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsLnZpb2xhdGlvbnNba2V5XSB9XCIgbmctcmVwZWF0PVwiKGtleSwgZXhwbGFuYXRpb24pIGluIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC5leHBsYW5hdGlvbnNcIj5cclxuICAgICAgICAgICAge3sgZXhwbGFuYXRpb24gfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LiRuYW1lLCBuZXcgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZSwgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0VUX1pPT00sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01fSU4sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc2NoZWR1bGVzLCBpdCBhdXRvbWF0aWNhbGx5IGZhaWxzLlxyXG4gICAgICAgIGlmICghbGVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG9ubHkgb25lIGl0ZW0gd2Ugc2hvdWxkIGNoZWNrIHRoYXQgaXQgc3BhbnMgdGhlIHdob2xlIHJhbmdlXHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICBsZXQgc2NoZWR1bGUgPSBzY2hlZHVsZXNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHNjaGVkdWxlLnN0YXJ0KSAmJiB0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShzY2hlZHVsZS5lbmQsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBtb3JlLCBjb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsb29wTGVuID0gbGVuIC0gMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gU29ydCBieSBzdGFydCB0aW1lIGZpcnN0XHJcbiAgICAgICAgbGV0IHNvcnRlZFNjaGVkdWxlcyA9IHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0ID4gYi5zdGFydCA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcExlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBmaXJzdCBpdGVtIGxhbmRzIGF0IDBcclxuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgIXRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoY3VycmVudC5zdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgbGFzdCBpdGVtIGxhbmRzIGF0IG1heFZhbHVlXHJcbiAgICAgICAgICAgIGlmIChpID09PSBsb29wTGVuIC0gMSAmJiAhdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUobmV4dC5lbmQsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIGN1cnJlbnQuZW5kID09PSBuZXh0LnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZUVuZEF0TWF4VmFsdWUoZW5kOiBudW1iZXIsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIChlbmQgfHwgY29uZmlnLm1heFZhbHVlKSA9PT0gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgbWF4VGltZVNsb3Q6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy5lbmQgLSBzLnN0YXJ0ID4gbWF4VGltZVNsb3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgLyoqIEltcG9ydGFudCBub3RlIC0tIHRoaXMgZG9lcyBub3QgdmFsaWRhdGUgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0sIGJ1dCByYXRoZXIgdGhhdCBvbmx5IG9uZSBOT04tREVGQVVMVCBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0uICovXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGEgZGVmYXVsdCB2YWx1ZSBpcyBkZWZpbmVkLCBzY2hlZHVsZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBkb24ndCBjb3VudCAtLSBvbmUgbm9uLWRlZmF1bHQgc2NoZWR1bGUgcGVyIGl0ZW0uXHJcbiAgICAgICAgbGV0IHNjaGVkdWxlc1RvVmFsaWRhdGU7XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChjb25maWcuZGVmYXVsdFZhbHVlKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzLmZpbHRlcihzY2hlZHVsZSA9PiBzY2hlZHVsZS52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgYWxsb3dlZCBlbXB0eSBvciAxIHNjaGVkdWxlIHBlciBpdGVtXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXNUb1ZhbGlkYXRlLmxlbmd0aCB8fCBzY2hlZHVsZXNUb1ZhbGlkYXRlLmxlbmd0aCA9PT0gMTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoIDw9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgIT09IG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBtYXhWYWx1ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gQ29tcGFyZSB0d28gYXQgYSB0aW1lIHVudGlsIHRoZSBlbmRcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aDtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCB2YWx1ZXNNYXRjaCA9IGN1cnJlbnQudmFsdWUgPT09IG5leHQudmFsdWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlc01hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUoY3VycmVudC5zdGFydCwgY3VycmVudC5lbmQgfHwgbWF4VmFsdWUsIG5leHQuc3RhcnQsIG5leHQuZW5kIHx8IG1heFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcCwgT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQsIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XS5pbmRleE9mKG92ZXJsYXBTdGF0ZSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBPdmVybGFwVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJWYWxpZGF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnXHJcbiAgICBdXHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2U6IEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBtYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2U6IE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBudWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFZhbGlkYXRvclNlcnZpY2U6IE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VmFsaWRhdGlvbkVycm9ycyhpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IFZhbGlkYXRpb25FcnJvcltdIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMubWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcubWF4VGltZVNsb3QpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMubW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS52YWxpZGF0ZShpdGVtLnNjaGVkdWxlcywgY29uZmlnKSkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5udWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFZhbGlkYXRpb25FcnJvci5OdWxsRW5kVmlvbGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5mdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcubWF4VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFZhbGlkYXRpb25FcnJvci5PdmVybGFwVmlvbGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlLiRuYW1lLCBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWludXRlc0FzVGV4dEZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IGhhc0hvdXJzID0gaG91cnMgPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7aG91cnN9IGhvdXJzYDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1pbiA9IG1pbnV0ZXMgJSA2MDtcclxuICAgICAgICAgICAgbGV0IGhhc01pbnV0ZXMgPSBtaW4gPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc01pbnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAke21pbn0gbWludXRlJHttaW4gPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKE1pbnV0ZXNBc1RleHRGaWx0ZXIuJG5hbWUsIFtNaW51dGVzQXNUZXh0RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSAmJiBob3VycyA8IDI0ID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlJztcclxuXHJcbiAgICBiaW5kaW5ncyA9IHtcclxuICAgICAgICBzY2hlZHVsZTogJzwnXHJcbiAgICB9XHJcblxyXG4gICAgY29udHJvbGxlciA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmIHRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19LXt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuZW5kIHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX08L3NwYW4+XHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmICF0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fSB1bnRpbDwvc3Bhbj5cclxuICAgIGBcclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd0aW1lUmFuZ2VDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZUNvbnRyb2xsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFzU3RhcnQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGhhc0VuZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIHRoaXMuaGFzU3RhcnQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICB0aGlzLmhhc0VuZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuZW5kKSAmJiB0aGlzLnNjaGVkdWxlLmVuZCAhPT0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoVGltZVJhbmdlQ29tcG9uZW50LiRuYW1lLCBuZXcgVGltZVJhbmdlQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lLCBUaW1lUmFuZ2VDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyVmFsaWRhdGlvblNlcnZpY2UnLFxyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkcTogYW5ndWxhci5JUVNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIGdyb3VwU2VydmljZTogR3JvdXBTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBkYXlNYXA6IHsgW2tleTogbnVtYmVyXTogc3RyaW5nIH0sXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxJdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcblxyXG4gIHByaXZhdGUgYWRhcHRlcjogSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8YW55LCBhbnk+O1xyXG4gIHByaXZhdGUgcmFuZ2VBZGFwdGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2VBZGFwdGVyPGFueSwgYW55PjtcclxuXHJcbiAgLyoqIHNob3VsZCBiZSB0cnVlIGlmIHRoZSBzY2hlZHVsZXIgaGFzIGJlZW4gaW50ZXJhY3RlZCB3aXRoICovXHJcbiAgcHVibGljIGRpcnR5OiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHNjaGVkdWxlciBiZWNhbWUgaW52YWxpZCBhZnRlciBiZWluZyBpbml0aWFsaXplZCAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkOiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHNjaGVkdWxlciB3YXMgKippbml0aWFsaXplZCoqIHdpdGggaW52YWxpZCB2YWx1ZXMgKi9cclxuICBwdWJsaWMgc3RhcnRlZFdpdGhJbnZhbGlkU2NoZWR1bGU6IGJvb2xlYW47XHJcbiAgcHVibGljIGhvdmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+XHJcbiAgcHVibGljIGl0ZW1zOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PjtcclxuXHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4gPSB7XHJcbiAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHsgcmV0dXJuIHsgZGF5OiBkYXksIHNjaGVkdWxlczogc2NoZWR1bGVzIH0gfSxcclxuICAgIHNhdmVTY2hlZHVsZXI6ICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ3NhdmVkJyk7XHJcbiAgICAgIHJldHVybiB0aGlzLiRxLndoZW4oKTtcclxuICAgIH0sXHJcbiAgICBkZWZhdWx0VmFsdWU6IG51bGwsXHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHZhbGlkYXRpb25FcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdO1xyXG5cclxuICAkZG9DaGVjaygpIHtcclxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcblxyXG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMpIHtcclxuICAgICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGlvbkVycm9ycztcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcbiAgICB0aGlzLmJ1aWxkSXRlbXNGcm9tQWRhcHRlcigpO1xyXG4gICAgdGhpcy5zdGFydGVkV2l0aEludmFsaWRTY2hlZHVsZSA9IHRoaXMuaGFzSW52YWxpZFNjaGVkdWxlKCk7XHJcbiAgICB0aGlzLndhdGNoQWRhcHRlcigpO1xyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyhpdGVtcyk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVpbGRJdGVtcyh0aGlzLmdldEl0ZW1zRnJvbUFkYXB0ZXIoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEl0ZW1zRnJvbUFkYXB0ZXIoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuYWRhcHRlciAmJiB0aGlzLnJhbmdlQWRhcHRlcikge1xyXG4gICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5yYW5nZUFkYXB0ZXIuYWRhcHQodGhpcy5hZGFwdGVyLmluaXRpYWxEYXRhKTtcclxuICAgICAgbGV0IGdyb3VwZWRTY2hlZHVsZXMgPSB0aGlzLmdyb3VwU2VydmljZS5ncm91cFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG5cclxuICAgICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWRTY2hlZHVsZXMpIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuY3JlYXRlSXRlbShwYXJzZUludChrZXksIDEwKSwgZ3JvdXBlZFNjaGVkdWxlc1trZXldKTtcclxuXHJcbiAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRWYWxpZGF0aW9uRXJyb3JzKCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMuaXRlbXMubWFwKGl0ZW0gPT4gdGhpcy5zY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuZ2V0VmFsaWRhdGlvbkVycm9ycyhpdGVtLCB0aGlzLmNvbmZpZykpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcblxyXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4ge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciB1c2VyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZCh1c2VyT3B0aW9ucywge1xyXG4gICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXHJcbiAgICAgIG1heFZhbHVlOiBtaW51dGVzSW5EYXksXHJcbiAgICAgIGhvdXJDb3VudDogaG91cnNJbkRheSxcclxuICAgICAgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudCxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUl0ZW0oZGF5OiBudW1iZXIsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAgIGxldCBidWlsZGVyOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gdGhpcy5jb25maWcuY3JlYXRlSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcblxyXG4gICAgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQoYnVpbGRlciwgeyBsYWJlbDogdGhpcy5kYXlNYXBbZGF5XSB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNjaGVkdWxlciBzaG91bGQgYWx3YXlzIHNob3cgYWxsIGRheXMsIGV2ZW4gaWYgaXQgd2FzIG5vdCBwYXNzZWQgYW55IHNjaGVkdWxlcyBmb3IgdGhhdCBkYXlcclxuICAgKi9cclxuICBwcml2YXRlIGZpbGxJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZGF5TWFwLCAoZGF5OiBzdHJpbmcsIHN0cmluZ0tleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgbGV0IGl0ZW06IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoID8gZmlsdGVyZWRJdGVtc1swXSA6IG51bGw7XHJcblxyXG4gICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNyZWF0ZUl0ZW0oa2V5LCBbXSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnNhdmVTY2hlZHVsZXIoKS50aGVuKCgpID0+IHRoaXMuZGlydHkgPSBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nLFxyXG4gICAgb25DaGFuZ2U6ICcmJyxcclxuICAgIHJhbmdlQWRhcHRlcjogJzwnLFxyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJztcclxuICAgIFxyXG4gICAgc3RhdGljIHZhbHVlID0ge1xyXG4gICAgICAgIDA6ICdNb24nLFxyXG4gICAgICAgIDE6ICdUdWUnLFxyXG4gICAgICAgIDI6ICdXZWQnLFxyXG4gICAgICAgIDM6ICdUaHVyJyxcclxuICAgICAgICA0OiAnRnJpJyxcclxuICAgICAgICA1OiAnU2F0JyxcclxuICAgICAgICA2OiAnU3VuJyBcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb25zdGFudChEYXlNYXAuJG5hbWUsIERheU1hcC52YWx1ZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gMTIwO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KE51bGxFbmRXaWR0aC4kbmFtZSwgTnVsbEVuZFdpZHRoLnZhbHVlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR0aW1lb3V0JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSdcclxuICBdO1xyXG5cclxuICBwcml2YXRlIG11bHRpc2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG5cclxuICBwcml2YXRlIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHByaXZhdGUgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgdXBkYXRlU2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pn0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcblxyXG4gIHByaXZhdGUgcmVzaXplRGlyZWN0aW9uSXNTdGFydDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIHN0YXJ0RHJhZ1RpbWVvdXQ6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD47XHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdlIHdhbnQgdG8gY2FuY2VsIHRoZSBkcmFnIG9wZXJhdGlvbiBpZiB0aGUgdXNlciBpcyBqdXN0IGNsaWNraW5nIG9uIHRoZSBpdGVtIG9yIGhhcyBzdGFydGVkIGRyYWdnaW5nIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIGRyYWcgdG8gXCJhY3RpdmF0ZVwiXHJcbiAgICogSG93ZXZlciwgd2Ugc2hvdWxkIGdpdmUgdGhlbSBhIHNtYWxsIHRvbGVyYW5jZSBiZWZvcmUgY29uc2lkZXJpbmcgdGhlbSB0byBoYXZlIHN0YXJ0ZWQgZHJhZ2dpbmcgZWFybHksIGFzIGl0IGlzIHZlcnkgZWFzeSB0byBhY2NpZGVudGFsbHkgbW92ZSBhIGZldyBwaXhlbHMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAocGl4ZWwgPiAzKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnKCkge1xyXG4gICAgdGhpcy4kdGltZW91dC5jYW5jZWwodGhpcy5zdGFydERyYWdUaW1lb3V0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RHJhZ1N0YXJ0VmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGF5OiB0aGlzLnNjaGVkdWxlLmRheSxcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jb25maWcubnVsbEVuZHMgPyB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOiB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuZW5kKSxcclxuICAgICAgdmFsdWU6IHRoaXMuc2NoZWR1bGUudmFsdWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG5cclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyBuZy1jbGljayBmcm9tIGFjY2lkZW50YWxseSBmaXJpbmcgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSwgMjAwKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwubWVyZ2UodGhpcy5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICB0aGlzLnJlc2l6ZVN0YXJ0KHVpLCBkZWx0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc2l6ZUVuZCh1aSwgZGVsdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVN0YXJ0KHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IHN0YXJ0Q2hhbmdlZCA9IHNjaGVkdWxlLnN0YXJ0ICE9PSBuZXdTdGFydDtcclxuICAgIGxldCBuZXdTdGFydEJlZm9yZU9yQXRFbmQgPSBuZXdTdGFydCA8PSB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHNjaGVkdWxlLmVuZCkgLSAxO1xyXG4gICAgbGV0IG5ld1N0YXJ0QWZ0ZXJPckF0U3RhcnQgPSBuZXdTdGFydCA+PSAwO1xyXG5cclxuICAgIGlmIChzdGFydENoYW5nZWQgJiYgbmV3U3RhcnRCZWZvcmVPckF0RW5kICYmIG5ld1N0YXJ0QWZ0ZXJPckF0U3RhcnQpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgZW5kOiBzY2hlZHVsZS5lbmQsXHJcbiAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVFbmQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuICAgIGxldCBlbmRDaGFuZ2VkID0gc2NoZWR1bGUuZW5kICE9PSBuZXdFbmQ7XHJcbiAgICBsZXQgbmV3RW5kQmVmb3JlT3JBdEVuZCA9IG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIGxldCBuZXdFbmRBZnRlck9yQXRTdGFydCA9IG5ld0VuZCA+PSBzY2hlZHVsZS5zdGFydCArIDE7XHJcblxyXG4gICAgaWYgKGVuZENoYW5nZWQgJiYgbmV3RW5kQWZ0ZXJPckF0U3RhcnQgJiYgbmV3RW5kQmVmb3JlT3JBdEVuZCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogc2NoZWR1bGUuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy5zdGFydERyYWdUaW1lb3V0ID0gdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuY2FuQWRkID0gZmFsc2U7XHJcbiAgICB9LCA1MDApO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSwgdXBkYXRlOiB1cGRhdGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIHJlbW92ZVNjaGVkdWxlOiAnJicsXHJcbiAgICB1cGRhdGVTY2hlZHVsZTogJyYnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCJjb25zdCBlbnVtIERheXMge1xyXG4gICAgTW9uZGF5ID0gMCxcclxuICAgIFR1ZXNkYXkgPSAxLFxyXG4gICAgV2VkbmVzZGF5LFxyXG4gICAgVGh1cnNkYXksXHJcbiAgICBGcmlkYXksXHJcbiAgICBTYXR1cmRheSxcclxuICAgIFN1bmRheVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlIHtcclxuICAgIGluaXRpYWxpemUoKTogdm9pZDtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVJlc2l6ZVNlcnZpY2VQcm92aWRlciBleHRlbmRzIGFuZ3VsYXIuSVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICBzZXRDdXN0b21SZXNpemVFdmVudHMoZXZlbnRzOiBzdHJpbmdbXSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEltcGxlbWVudCB0aGlzIG9uIGEgY2xpZW50IGFuZCB0aGVuIHBhc3MgaXQgaW4gdG8gdGhlIGNvbXBvbmVudC5cclxuICovXHJcbmludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxUQ3VzdG9tLCBUVmFsdWU+IHtcclxuICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgIGdldFNuYXBzaG90KCk6IFRDdXN0b21bXTtcclxuXHJcbiAgICAvKiogVGhpcyBqdXN0IG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIGNsYXNzLCB3ZSdsbCBzZXQgaXQgaW50ZXJuYWxseSAqL1xyXG4gICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICBpbml0aWFsRGF0YTogVEN1c3RvbVtdO1xyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlIGV4dGVuZHMgYW5ndWxhci5JRmlsdGVyU2VydmljZSB7XHJcbiAgICAobmFtZTogJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpOiAobWludXRlczogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgZGF5OiBEYXlzO1xyXG4gICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXTtcclxufVxyXG5cclxuLyoqIFVzZSB0aGlzIGZvciBwcm9wZXJ0aWVzIHlvdSBuZWVkIGFjY2VzcyB0byBidXQgZG9uJ3Qgd2FudCBleHBvc2VkIHRvIGNsaWVudHMgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5pbnRlcmZhY2UgSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBleHRlbmRzIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPFQ+IHtcclxuICAgIC8vIElmIHRoaXMgaXMgdHJ1ZSBpdCdsbCBiZSBva2F5IGZvciBhIHNjaGVkdWxlIHRvIGhhdmUgbm8gZW5kIHRpbWUgLS0gdGhpcyBtdXN0IGJlIGNvbWJpbmVkIHdpdGggbW9ub1NjaGVkdWxlPXRydWUuIERlZmF1bHQgPSBmYWxzZSAqL1xyXG4gICAgbnVsbEVuZHM/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBUaGVzZSBjbGFzc2VzIHdpbGwgYmUgYXBwbGllZCBkaXJlY3RseSB0byB0aGUgYnV0dG9ucyAqL1xyXG4gICAgYnV0dG9uQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG4gICAgXHJcbiAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgIGNyZWF0ZUl0ZW06IChkYXk6IERheXMsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W10pID0+IElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBEbyBub3QgYXNzaWduIGZvciBubyBkZWZhdWx0ICovXHJcbiAgICBkZWZhdWx0VmFsdWU/OiBUO1xyXG5cclxuICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhbiBpdGVtIGlzIGNsaWNrZWQgaW4gb3JkZXIgdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBpdCAqL1xyXG4gICAgZWRpdFNsb3Q/OiAoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikgPT4gYW5ndWxhci5JUHJvbWlzZTxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4+O1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIEFMTCBzbG90cyBpbiB0aGUgY2FsZW5kYXIgbXVzdCBiZSBmaWxsZWQgaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkICovXHJcbiAgICBmdWxsQ2FsZW5kYXI/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgIG1heFRpbWVTbG90PzogbnVtYmVyO1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICBtb25vU2NoZWR1bGU/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBUaGUgbnVtYmVyIG9mIG1pbnV0ZXMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgaW50ZXJ2YWw/OiBudW1iZXI7XHJcblxyXG4gICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3ZW4gdGhlIHNhdmUgYnV0dG9uIGlzIGNsaWNrZWQgKi9cclxuICAgIHNhdmVTY2hlZHVsZXI6ICgpID0+IGFuZ3VsYXIuSVByb21pc2U8YW55PjtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgIC8qKiBBIGNzcyBjbGFzcyB0byBhcHBseSAqL1xyXG4gICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgY29uc2lkZXJlZCBhY3RpdmUgdG8gdGhlIFVJICovXHJcbiAgICAkaXNBY3RpdmU/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgJGlzRGVsZXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgYmVpbmcgZWRpdGVkIGJ5IHRoZSB1c2VyICovXHJcbiAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogTm90IHN0cmljdGx5IG5lY2Vzc2FyeSBidXQgbWFrZXMgdGhpbmdzIGEgd2hvb29sZSBsb3QgZWFzaWVyICovXHJcbiAgICBkYXk6IERheXM7XHJcblxyXG4gICAgc3RhcnQ6IG51bWJlcjtcclxuICAgIGVuZDogbnVtYmVyO1xyXG5cclxuICAgIHZhbHVlOiBUO1xyXG59XHJcbiIsIi8qKiBDb252ZXJ0cyBjdXN0b20gbW9kZWwgdG8gV2Vla2x5U2NoZWR1bGVyUmFuZ2UgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZUFkYXB0ZXI8VEN1c3RvbSwgVFJhbmdlPiB7XHJcbiAgICBhZGFwdChjdXN0b206IFRDdXN0b21bXSk6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUUmFuZ2U+W107XHJcbn1cclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><br-weekly-scheduler adapter="adapter" items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options" range-adapter="rangeAdapter"></br-weekly-scheduler>Dirty: {{ isDirty }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot && multiSliderCtrl.canRenderGhost()">+</div><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 nullEnd: schedule.end === null,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></br-weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" item="item" index="$index"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.dirty || schedulerCtrl.validationErrors.length">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);