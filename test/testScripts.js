angular.module('demoApp', ['br.weeklyScheduler'])
    .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {
        $scope.isDirty = false;
        $scope.model = {
            options: {
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
                interval: 1,
                maxTimeSlot: 600,
                monoSchedule: true,
                onChange: function (isValid) {
                    $scope.isDirty = true;
                    $scope.isValid = isValid;
                    console.log('The model has changed!');
                }
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
                end: 900,
                value: true
            },
            {
                day: 0 /* Monday */,
                start: 720,
                end: 1020,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 60,
                end: 180,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 30,
                end: 300,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 0,
                end: 60,
                value: true
            }
        ]);
        $scope.adapterTwo = new DemoAdapter([
            {
                day: 4 /* Friday */,
                start: 0,
                end: 360,
                value: false
            },
            {
                day: 4 /* Friday */,
                start: 360,
                end: 1440,
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
    function MultiSliderController($element, $q, $scope, $window, nullEndWidth, overlapService) {
        var _this = this;
        this.$element = $element;
        this.$q = $q;
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
            return this.schedulerCtrl.config.editSlot(schedule).then(function (editedSchedule) {
                _this.addScheduleToItem(editedSchedule);
            });
        }
        else {
            return this.$q.when(this.addScheduleToItem(schedule));
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
    MultiSliderController.prototype.onChange = function () {
        this.schedulerCtrl.config.onChange(!this.schedulerCtrl.hasInvalidSchedule());
    };
    MultiSliderController.prototype.onHoverElementClick = function (event) {
        var _this = this;
        if (this.canAdd) {
            var elOffX = this.getElementOffsetX(this.$element);
            var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
            var start = this.pixelToVal(hoverElOffX);
            var end = this.config.nullEnds ? null : this.adjustEndForModel(start + this.size);
            this.addSlot(start, end).then(function () {
                _this.onChange();
            });
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
        this.onChange();
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
        '$q',
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
    Object.defineProperty(FullCalendarValidatorService.prototype, "error", {
        get: function () {
            return "fullCalendarViolation" /* FullCalendarViolation */;
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
    function MaxTimeSlotValidatorService() {
    }
    Object.defineProperty(MaxTimeSlotValidatorService.prototype, "error", {
        get: function () {
            return "maxTimeSlotViolation" /* MaxTimeSlotViolation */;
        },
        enumerable: true,
        configurable: true
    });
    MaxTimeSlotValidatorService.prototype.validate = function (schedules, config) {
        var maxTimeSlot = config.maxTimeSlot;
        if (!maxTimeSlot) {
            return true;
        }
        return !schedules.some(function (s) { return s.value !== config.defaultValue && s.end - s.start > maxTimeSlot; });
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
    Object.defineProperty(MonoScheduleValidatorService.prototype, "error", {
        get: function () {
            return "monoScheduleViolation" /* MonoScheduleViolation */;
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
            return "nullEndViolation" /* NullEndViolation */;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(OverlapValidatorService.prototype, "error", {
        get: function () {
            return "overlapViolation" /* OverlapViolation */;
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
                var maxValue = config.maxValue;
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
        var validators = [
            this.maxTimeSlotValidatorService,
            this.monoScheduleValidatorService,
            this.nullEndScheduleValidatorService,
            this.fullCalendarValidatorService,
            this.overlapValidatorService
        ];
        var result = [];
        validators.forEach(function (validator) {
            if (!validator.validate(item.schedules, config)) {
                result.push(validator.error);
            }
        });
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
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.groupService = groupService;
        this.dayMap = dayMap;
        this.scheduleValidatorService = scheduleValidatorService;
        this.defaultOptions = {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            monoSchedule: false,
            onChange: function (isValid) { return angular.noop(); }
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
    WeeklySchedulerController.prototype.hasInvalidSchedule = function () {
        var validationErrors = this.getValidationErrors();
        return validationErrors.length > 0;
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
        var _this = this;
        var result = [];
        if (this.adapter) {
            var schedules = this.adapter.initialData.map(function (data) { return _this.adapter.customModelToWeeklySchedulerRange(data); });
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
            options: '='
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy1jb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9mdWxsLWNhbGVuZGFyLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21heC10aW1lLXNsb3QtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvbW9uby1zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9udWxsLWVuZC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9vdmVybGFwLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL3NjaGVkdWxlLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2Nyb2xsL3Njcm9sbC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9taW51dGVzLWFzLXRleHQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS90aW1lLXJhbmdlLWNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL051bGxFbmRXaWR0aC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvem9vbS96b29tLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2VQcm92aWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyT3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDOUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTTtJQUMvRCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFdkIsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPO3dCQUNMLEdBQUcsRUFBRSxHQUFHO3dCQUNSLFNBQVMsRUFBRSxTQUFTO3FCQUNyQixDQUFBO2dCQUNILENBQUM7Z0JBQ0QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFFBQVEsRUFBRSxVQUFVLFFBQVE7b0JBQzFCLE9BQU8sUUFBUSxDQUFDLGNBQU0sT0FBQSxRQUFRLEVBQVIsQ0FBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2dCQUNELFFBQVEsRUFBRSxDQUFDO2dCQUNYLFdBQVcsRUFBRSxHQUFHO2dCQUNoQixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsUUFBUSxFQUFFLFVBQUMsT0FB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RyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFuRk0saUJBQUssR0FBRyw4QkFBOEIsQ0FBQztJQUV2QyxtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFrRnBDLGtCQUFDO0NBckZELEFBcUZDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnYnIud2Vla2x5U2NoZWR1bGVyJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckcScsICckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHEsICRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5pc0RpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYnV0dG9uQ2xhc3NlczogWyd3b3chJ10sXHJcbiAgICAgICAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBkYXk6IGRheSxcclxuICAgICAgICAgICAgICBzY2hlZHVsZXM6IHNjaGVkdWxlc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uIChzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gc2NoZWR1bGUsIDQwMCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaW50ZXJ2YWw6IDEsXHJcbiAgICAgICAgICBtYXhUaW1lU2xvdDogNjAwLFxyXG4gICAgICAgICAgbW9ub1NjaGVkdWxlOiB0cnVlLFxyXG4gICAgICAgICAgb25DaGFuZ2U6IChpc1ZhbGlkKSA9PiB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLmlzVmFsaWQgPSBpc1ZhbGlkO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGFzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IERheXMuU2F0dXJkYXksXHJcbiAgICAgICAgLy8gICBzdGFydDogMTM4MCxcclxuICAgICAgICAvLyAgIGVuZDogbnVsbCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA2MDAsXHJcbiAgICAgICAgICBlbmQ6IDkwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA3MjAsXHJcbiAgICAgICAgICBlbmQ6IDEwMjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwLFxyXG4gICAgICAgICAgZW5kOiAxODAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMzAsXHJcbiAgICAgICAgICBlbmQ6IDMwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA2MCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyVHdvID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiAzNjAsXHJcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuRnJpZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDM2MCxcclxuICAgICAgICAgIGVuZDogMTQ0MCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5zYXZlQWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRzY29wZS5yZXN1bHQgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUuYWRhcHRlci5nZXRTbmFwc2hvdCgpKSArIEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyVHdvLmdldFNuYXBzaG90KCkpO1xyXG4gICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG4vKiogVGhlIGRhdGEgaXMgYWxyZWFkeSBpbiBhbiBhY2NlcHRhYmxlIGZvcm1hdCBmb3IgdGhlIGRlbW8gc28ganVzdCBwYXNzIGl0IHRocm91Z2ggKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEZW1vQWRhcHRlciBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+LCBib29sZWFuPiB7XHJcbiAgcHVibGljIGl0ZW1zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08Ym9vbGVhbj5bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyBpbml0aWFsRGF0YTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPltdLFxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNuYXBzaG90KCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMuaXRlbXMubWFwKGl0ZW0gPT4gaXRlbS5zY2hlZHVsZXMubWFwKHNjaGVkdWxlID0+IHNjaGVkdWxlKSkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShyYW5nZSkge1xyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG4gIH1cclxufVxyXG4iLCJhbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcblxyXG4gICAgbGV0IG1vdXNlZG93bkV2ZW50OiBzdHJpbmcgPSAnbW91c2Vkb3duIHRvdWNoc3RhcnQnO1xyXG4gICAgbGV0IG1vdXNlbW92ZUV2ZW50OiBzdHJpbmcgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSc7XHJcbiAgICBsZXQgbW91c2V1cEV2ZW50OiBzdHJpbmcgPSAnbW91c2V1cCB0b3VjaGVuZCc7XHJcblxyXG4gICAgZWxlbWVudC5vbihtb3VzZWRvd25FdmVudCwgKGV2ZW50KSA9PiB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdGFydCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFnZVgoZXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGV2ZW50LnBhZ2VYIHx8IGdldFRvdWNoZXMoZXZlbnQpWzBdLnBhZ2VYO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRvdWNoZXMoZXZlbnQ6IGFueSk6IGFueSB7IC8vIHRvZG9cclxuICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaWYgKCFldmVudC50b3VjaGVzKSB7XHJcbiAgICAgICAgZXZlbnQudG91Y2hlcyA9IFtldmVudC5vcmlnaW5hbEV2ZW50XTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJIb3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXmJyV2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vIFN0cmlwZSBpdCBieSBob3VyXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRxJyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR3aW5kb3cnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkcTogYW5ndWxhci5JUVNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHZvaWQ7IH0gPSB7XHJcbiAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICB9O1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gIHB1YmxpYyBjYW5BZGQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzSG92ZXJpbmdTbG90OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICBpZiAodGhpcy4kaG92ZXJFbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBsZWZ0ID0gZS5wYWdlWCAtIGVsT2ZmWCAtIHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCAvIDI7XHJcblxyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnBpeGVsVG9WYWwobGVmdCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgbGVmdDogdGhpcy5nZXRTbG90TGVmdCh2YWwpLFxyXG4gICAgICAgICAgcmlnaHQ6IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdGhpcy5nZXRTbG90UmlnaHQodmFsLCB2YWwgKyB0aGlzLm51bGxFbmRXaWR0aCkgOiB0aGlzLmdldFNsb3RSaWdodCh2YWwsIHZhbCArIHRoaXMuc2l6ZSlcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkU2xvdChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICBzdGFydCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuZCA+IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpdGVtID0gdGhpcy5pdGVtO1xyXG5cclxuICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2NoZWR1bGUgPSB7XHJcbiAgICAgIGRheTogdGhpcy5pdGVtLmRheSxcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZCxcclxuICAgICAgdmFsdWU6IHRoaXMuY29uZmlnLmRlZmF1bHRWYWx1ZVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChlZGl0ZWRTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWRkU2NoZWR1bGVUb0l0ZW0oZWRpdGVkU2NoZWR1bGUpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiRxLndoZW4odGhpcy5hZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERpcnR5KCkge1xyXG4gICAgdGhpcy5zY2hlZHVsZXJDdHJsLmRpcnR5ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkU2NoZWR1bGVUb0l0ZW0oc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5wdXNoKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2Uoc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2V0RGlydHkoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtZW50T2Zmc2V0WChlbGVtOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgIHJldHVybiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkanVzdEVuZEZvck1vZGVsKGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoZW5kID09PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIHNjaGVkdWxlIGlzIGFibGUgdG8gYmUgZWRpdGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5FZGl0KHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBpc0VkaXRhYmxlID0gIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuaXRlbS5lZGl0YWJsZSkgfHwgdGhpcy5pdGVtLmVkaXRhYmxlO1xyXG4gICAgbGV0IGhhc0VkaXRGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KTtcclxuICAgIGxldCBpc05vdEFjdGl2ZSA9ICFzY2hlZHVsZS4kaXNBY3RpdmU7XHJcbiAgICBsZXQgaXNOb3REcmFnZ2luZyA9ICF0aGlzLmlzRHJhZ2dpbmc7XHJcblxyXG4gICAgcmV0dXJuIGlzRWRpdGFibGUgJiYgaGFzRWRpdEZ1bmN0aW9uICYmIGlzTm90QWN0aXZlICYmIGlzTm90RHJhZ2dpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYXRoZXIgdGhhbiBoYXZpbmcgdG8gZGVhbCB3aXRoIG1vZGlmeWluZyBtZXJnZU92ZXJsYXBzIHRvIGhhbmRsZSBudWxsRW5kcyBjYWxlbmRhcnMsXHJcbiAgICoganVzdCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gY3JlYXRpbmcgYWRkaXRpb25hbCBzbG90cyBpbiBudWxsRW5kcyBjYWxlbmRhcnMgdW5sZXNzIHRoZXJlIGFyZSBubyBzbG90cyB0aGVyZSBhbHJlYWR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuUmVuZGVyR2hvc3Qoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLml0ZW0uc2NoZWR1bGVzLmxlbmd0aCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcGVuc2F0ZUZvckJvcmRlcihlbGVtOiBIVE1MRWxlbWVudCwgdmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBib3JkZXJXaWR0aCA9IHRoaXMuJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pLmdldFByb3BlcnR5VmFsdWUoJ2JvcmRlci1yaWdodCcpO1xyXG5cclxuICAgIC8vIFRoZXJlIGFyZSBkb3VibGUgYm9yZGVycyBhdCB0aGUgYmVnaW5uaW5ncyBhbmQgZW5kcyBvZiBob3Vycywgc28gd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCBpdFxyXG4gICAgbGV0IG9uSG91ciA9IHZhbCAlIDYwID09PSAwO1xyXG5cclxuICAgIHJldHVybiBvbkhvdXIgPyBlbGVtLm9mZnNldExlZnQgOiBlbGVtLm9mZnNldExlZnQgLSBwYXJzZUludChib3JkZXJXaWR0aCwgMTApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybSBhbiBleHRlcm5hbCBhY3Rpb24gdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBhIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHRoaXMuY2FuRWRpdChzY2hlZHVsZSkpIHtcclxuICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChuZXdTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIGlmIChuZXdTY2hlZHVsZS4kaXNEZWxldGluZykge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbGV0IHByZW1lcmdlU2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkobmV3U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgIHRoaXMubWVyZ2UobmV3U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgIC8vIElmIG1lcmdpbmcgbXV0YXRlZCB0aGUgc2NoZWR1bGUgZnVydGhlciwgdGhlbiB1cGRhdGVTY2hlZHVsZSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWRcclxuICAgICAgICAgIC8vIFRoaXMgaXMgc28gdGhhdCBlZGl0cyB0aGF0IGRvbid0IHRyaWdnZXIgbWVyZ2VzIHN0aWxsIHRyaWdnZXIgb25DaGFuZ2UsXHJcbiAgICAgICAgICAvLyBidXQgZWRpdHMgdGhhdCBkbyB0cmlnZ2VyIG1lcmdlcyBkb24ndCB0cmlnZ2VyIGl0IHR3aWNlXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMocHJlbWVyZ2VTY2hlZHVsZSwgbmV3U2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoc2NoZWR1bGUsIG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2V0RGlydHkoKTtcclxuICAgICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRPdmVybGFwU3RhdGUoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjdXJyZW50LnN0YXJ0LCB0aGlzLmFkanVzdEVuZEZvclZpZXcoY3VycmVudC5lbmQpLCBvdGhlci5zdGFydCwgdGhpcy5hZGp1c3RFbmRGb3JWaWV3KG90aGVyLmVuZCkpO1xyXG5cclxuICAgIHJldHVybiBvdmVybGFwU3RhdGU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBzdGFydCkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIElmIHRoZXJlIGlzIGEgbnVsbCBlbmQsIHBsYWNlIHRoZSBlbmQgb2YgdGhlIHNsb3QgdHdvIGhvdXJzIGF3YXkgZnJvbSB0aGUgYmVnaW5uaW5nLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA9PT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBzdGFydCArIHRoaXMubnVsbEVuZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JWaWV3KGVuZCk7XHJcblxyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdGhpcy5jb21wZW5zYXRlRm9yQm9yZGVyKHVuZGVybHlpbmdJbnRlcnZhbCwgZW5kKSArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAvLyBTbGlnaHRseSBoYWNreSBidXQgZG9lcyB0aGUgam9iLiBUT0RPID9cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgbGVmdCBvZiB0aGUgbGVmdG1vc3QgaW50ZXJ2YWwsIHNvIHJldHVybiB0aGF0IGluc3RlYWRcclxuICAgIGlmICh2YWwgPCAwKSB7XHJcbiAgICAgIHZhbCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIHJpZ2h0IG9mIHRoZSByaWdodG1vc3QgaW50ZXJ2YWwgLS0gdGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBub3QgYWN0dWFsbHkgcmVuZGVyIHdpdGggYSBcInJlbFwiIHZhbHVlXHJcbiAgICBsZXQgcmlnaHRtb3N0ID0gdGhpcy5jb25maWcubWF4VmFsdWUgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuXHJcbiAgICBpZiAodmFsID4gcmlnaHRtb3N0KSB7XHJcbiAgICAgIHZhbCA9IHJpZ2h0bW9zdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5wYXJlbnQoKVswXS5xdWVyeVNlbGVjdG9yKGBbcmVsPScke3ZhbH0nXWApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAvLyBIZXJlLCBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgdmFsdWVzIG1hdGNoIC0tIHRoZSBjb3ZlcmluZyBzbG90IGNhbiBhbHdheXMgXCJlYXRcIiB0aGUgb3RoZXIgb25lXHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgLy8gUmVtb3ZlICdvdGhlcicgJiBtYWtlIGN1cnJlbnQgZXhwYW5kIHRvIGZpdCB0aGUgb3RoZXIgc2xvdFxyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBKdXN0IHJlbW92ZSAnY3VycmVudCdcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShjdXJyZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gRG8gbm90aGluZ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgdmFsdWU6IGN1cnJlbnQudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUFsbE92ZXJsYXBzKCkge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5mb3JFYWNoKHMgPT4gdGhpcy5tZXJnZU92ZXJsYXBzKHMpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VPdmVybGFwcyhzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwgPT4ge1xyXG4gICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMuZ2V0T3ZlcmxhcFN0YXRlKHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBIYW5kbGVyID0gdGhpcy5vdmVybGFwSGFuZGxlcnNbb3ZlcmxhcFN0YXRlXTtcclxuXHJcbiAgICAgICAgb3ZlcmxhcEhhbmRsZXIoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkNoYW5nZSgpIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcub25DaGFuZ2UoIXRoaXMuc2NoZWR1bGVyQ3RybC5oYXNJbnZhbGlkU2NoZWR1bGUoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uSG92ZXJFbGVtZW50Q2xpY2soZXZlbnQpIHtcclxuICAgIGlmICh0aGlzLmNhbkFkZCkge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGhvdmVyRWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRob3ZlckVsZW1lbnQpIC0gZWxPZmZYO1xyXG5cclxuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5waXhlbFRvVmFsKGhvdmVyRWxPZmZYKTtcclxuICAgICAgdmFyIGVuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IHRoaXMuYWRqdXN0RW5kRm9yTW9kZWwoc3RhcnQgKyB0aGlzLnNpemUpO1xyXG5cclxuICAgICAgdGhpcy5hZGRTbG90KHN0YXJ0LCBlbmQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlT3ZlcigpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0dWFsbHkgcmVtb3ZlIHRoZSBzY2hlZHVsZSBmcm9tIGJvdGggdGhlIHNjcmVlbiBhbmQgdGhlIG1vZGVsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgdGhpcy5zZXREaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tbWl0IG5ldyB2YWx1ZXMgdG8gdGhlIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICBzY2hlZHVsZS5lbmQgPSB0aGlzLmFkanVzdEVuZEZvck1vZGVsKHVwZGF0ZS5lbmQpO1xyXG5cclxuICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzTWF0Y2goc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgcmV0dXJuIHNjaGVkdWxlLnZhbHVlID09PSBvdGhlci52YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoZW5kID09PSAwKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbmQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2Uoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gV2UgY29uc2lkZXIgdGhlIHNjaGVkdWxlIHdlIHdlcmUgd29ya2luZyB3aXRoIHRvIGJlIHRoZSBtb3N0IGltcG9ydGFudCwgc28gaGFuZGxlIGl0cyBvdmVybGFwcyBmaXJzdC5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcyhzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGl0ZW06ICc9JyxcclxuICAgIGluZGV4OiAnPCcsXHJcbiAgICBzaXplOiAnPD8nXHJcbiAgfVxyXG5cclxuICBjb250cm9sbGVyID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnO1xyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG90aGVyU3RhcnQsIG90aGVyRW5kKTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBpZiAob3RoZXJFbmQgPj0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbmQgPj0gb3RoZXJFbmQgJiYgY3VycmVudFN0YXJ0IDw9IG90aGVyU3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPiBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPj0gY3VycmVudFN0YXJ0ICYmIG90aGVyU3RhcnQgPCBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA9PT0gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPT09IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuTm9PdmVybGFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFNlcnZpY2UuJG5hbWUsIE92ZXJsYXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlUHJvdmlkZXIgaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVJlc2l6ZVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljICRuYW1lID0gJ2JyLndlZWtseVNjaGVkdWxlci5yZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLiRnZXQuJGluamVjdCA9IFtcclxuICAgICAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICAgICAnJHdpbmRvdydcclxuICAgICAgICBdXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjdXN0b21SZXNpemVFdmVudHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzZXJ2aWNlSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cyA9IGV2ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgJGdldChcclxuICAgICAgICAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICk6IElSZXNpemVTZXJ2aWNlIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0aWFsaXplOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4aXN0cyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gd2UgaGF2ZSB0byAkYXBwbHkgdGhlIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oZXZlbnQsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUluaXRpYWxpemVkID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnByb3ZpZGVyKFJlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgUmVzaXplU2VydmljZVByb3ZpZGVyKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCAocmVzaXplU2VydmljZTogSVJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdyZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGZpbHRlciddO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4cGxhbmF0aW9uczogeyBba2V5IGluIFZhbGlkYXRpb25FcnJvcl0/OiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgcHJpdmF0ZSB2aW9sYXRpb25zOiB7IFtrZXkgaW4gVmFsaWRhdGlvbkVycm9yXT86IGJvb2xlYW4gfSA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGZpbHRlcjogSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRkb0NoZWNrKCkge1xyXG4gICAgICAgIGxldCBlcnJvcnMgPSB0aGlzLnNjaGVkdWxlckN0cmwudmFsaWRhdGlvbkVycm9ycztcclxuXHJcbiAgICAgICAgdGhpcy52aW9sYXRpb25zID0ge1xyXG4gICAgICAgICAgICBbVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbl06IGVycm9ycy5pbmRleE9mKFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb24pID4gLTEsXHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb25dOiBlcnJvcnMuaW5kZXhPZihWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb24pID4gLTEsXHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uXTogZXJyb3JzLmluZGV4T2YoVmFsaWRhdGlvbkVycm9yLk1vbm9TY2hlZHVsZVZpb2xhdGlvbikgPiAtMVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgJG9uSW5pdCgpIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZztcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5tYXhUaW1lU2xvdCkge1xyXG4gICAgICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSB0aGlzLiRmaWx0ZXIoJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpKGNvbmZpZy5tYXhUaW1lU2xvdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbl0gPSBgTWF4IHRpbWUgc2xvdCBsZW5ndGg6ICR7bWF4VGltZVNsb3R9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb25dID0gJ0ZvciB0aGlzIGNhbGVuZGFyLCBldmVyeSBkYXkgbXVzdCBiZSBjb21wbGV0ZWx5IGZ1bGwgb2Ygc2NoZWR1bGVzLic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uXSA9ICdUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgb25lIHRpbWUgc2xvdCBwZXIgZGF5JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk51bGxFbmRWaW9sYXRpb25dID0gJ0l0ZW1zIGluIHRoaXMgY2FsZW5kYXIgZG8gbm90IGhhdmUgZW5kIHRpbWVzLiBTY2hlZHVsZWQgZXZlbnRzIGJlZ2luIGF0IHRoZSBzdGFydCB0aW1lIGFuZCBlbmQgd2hlbiB0aGV5IGFyZSBmaW5pc2hlZC4nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMnO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIHNjaGVkdWxlckN0cmw6ICdeYnJXZWVrbHlTY2hlZHVsZXInXHJcbiAgICB9O1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcm93IGV4cGxhbmF0aW9uc1wiIG5nLWNsYXNzPVwieyB2aW9sYXRpb246IHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC52aW9sYXRpb25zW2tleV0gfVwiIG5nLXJlcGVhdD1cIihrZXksIGV4cGxhbmF0aW9uKSBpbiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuZXhwbGFuYXRpb25zXCI+XHJcbiAgICAgICAgICAgIHt7IGV4cGxhbmF0aW9uIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC4kbmFtZSwgbmV3IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWUsIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcik7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50JyxcclxuICAgICAgICAnJHNjb3BlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJTY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgICBwcml2YXRlIHNjcm9sbFNlcnZpY2U6IFNjcm9sbFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRwb3N0TGluaygpIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07IC8vIGdyYWIgcGxhaW4ganMsIG5vdCBqcWxpdGVcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxTZXJ2aWNlLmhpamFja1Njcm9sbChlbGVtZW50LCAyMCk7XHJcbiAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NX0lOLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbihlbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclNjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFdoZW4gdGhpcyBvcHRpb24gaXMgdHJ1ZSB3ZSBzaG91bGQgZW5mb3JjZSB0aGF0IHRoZXJlIGFyZSBubyBnYXBzIGluIHRoZSBzY2hlZHVsZXNcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHNjaGVkdWxlcywgaXQgYXV0b21hdGljYWxseSBmYWlscy5cclxuICAgICAgICBpZiAoIWxlbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBvbmx5IG9uZSBpdGVtIHdlIHNob3VsZCBjaGVjayB0aGF0IGl0IHNwYW5zIHRoZSB3aG9sZSByYW5nZVxyXG4gICAgICAgIGlmIChsZW4gPT09IDEpIHtcclxuICAgICAgICAgICAgbGV0IHNjaGVkdWxlID0gc2NoZWR1bGVzWzBdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShzY2hlZHVsZS5zdGFydCkgJiYgdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUoc2NoZWR1bGUuZW5kLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbW9yZSwgY29tcGFyZSB0d28gYXQgYSB0aW1lIHVudGlsIHRoZSBlbmRcclxuICAgICAgICBsZXQgbG9vcExlbiA9IGxlbiAtIDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIFNvcnQgYnkgc3RhcnQgdGltZSBmaXJzdFxyXG4gICAgICAgIGxldCBzb3J0ZWRTY2hlZHVsZXMgPSBzY2hlZHVsZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydCA+IGIuc3RhcnQgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvb3BMZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgZmlyc3QgaXRlbSBsYW5kcyBhdCAwXHJcbiAgICAgICAgICAgIGlmIChpID09PSAwICYmICF0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKGN1cnJlbnQuc3RhcnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGxhc3QgaXRlbSBsYW5kcyBhdCBtYXhWYWx1ZVxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbG9vcExlbiAtIDEgJiYgIXRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKG5leHQuZW5kLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBjdXJyZW50LmVuZCA9PT0gbmV4dC5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShzdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXJ0ID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVFbmRBdE1heFZhbHVlKGVuZDogbnVtYmVyLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiAoZW5kIHx8IGNvbmZpZy5tYXhWYWx1ZSkgPT09IGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSBjb25maWcubWF4VGltZVNsb3Q7XHJcblxyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSAmJiBzLmVuZCAtIHMuc3RhcnQgPiBtYXhUaW1lU2xvdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbXBvcnRhbnQgbm90ZSAtLSB0aGlzIGRvZXMgbm90IHZhbGlkYXRlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLCBidXQgcmF0aGVyIHRoYXQgb25seSBvbmUgTk9OLURFRkFVTFQgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLiAqL1xyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYSBkZWZhdWx0IHZhbHVlIGlzIGRlZmluZWQsIHNjaGVkdWxlcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGRvbid0IGNvdW50IC0tIG9uZSBub24tZGVmYXVsdCBzY2hlZHVsZSBwZXIgaXRlbS5cclxuICAgICAgICBsZXQgc2NoZWR1bGVzVG9WYWxpZGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXMuZmlsdGVyKHNjaGVkdWxlID0+IHNjaGVkdWxlLnZhbHVlICE9PSBjb25maWcuZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBhbGxvd2VkIGVtcHR5IG9yIDEgc2NoZWR1bGUgcGVyIGl0ZW1cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoIHx8IHNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoID09PSAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk51bGxFbmRWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoIDw9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgIT09IG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuT3ZlcmxhcFZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZhbHVlc01hdGNoID0gY3VycmVudC52YWx1ZSA9PT0gbmV4dC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhWYWx1ZSA9IGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjdXJyZW50LnN0YXJ0LCBjdXJyZW50LmVuZCB8fCBtYXhWYWx1ZSwgbmV4dC5zdGFydCwgbmV4dC5lbmQgfHwgbWF4VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwLCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZCwgT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclZhbGlkYXRpb25TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSdcclxuICAgIF1cclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBudWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRWYWxpZGF0aW9uRXJyb3JzKGl0ZW06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IFZhbGlkYXRpb25FcnJvcltdIHtcclxuICAgICAgICBsZXQgdmFsaWRhdG9yczogVmFsaWRhdG9yU2VydmljZVtdID0gW1xyXG4gICAgICAgICAgICB0aGlzLm1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5tb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgICAgICB0aGlzLm51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHRoaXMuZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5vdmVybGFwVmFsaWRhdG9yU2VydmljZVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQ6IFZhbGlkYXRpb25FcnJvcltdID0gW107XHJcblxyXG4gICAgICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRvci52YWxpZGF0ZShpdGVtLnNjaGVkdWxlcywgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsaWRhdG9yLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZS4kbmFtZSwgU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2Nyb2xsU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY3JvbGxTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1pbnV0ZXNBc1RleHRGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYGA7XHJcblxyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCBoYXNIb3VycyA9IGhvdXJzID4gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoYXNIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAke2hvdXJzfSBob3Vyc2A7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBtaW4gPSBtaW51dGVzICUgNjA7XHJcbiAgICAgICAgICAgIGxldCBoYXNNaW51dGVzID0gbWluID4gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoYXNNaW51dGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzSG91cnMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gJyAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgJHttaW59IG1pbnV0ZSR7bWluID4gMSA/ICdzJyA6ICcnfWA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihNaW51dGVzQXNUZXh0RmlsdGVyLiRuYW1lLCBbTWludXRlc0FzVGV4dEZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdNaW51dGVzID0gKG1pbnV0ZXMgLSAoaG91cnMgKiA2MCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGhvdXJzID4gMTEgJiYgaG91cnMgPCAyNCA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdNaW51dGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRpc3BsYXlIb3VycyA9IGhvdXJzICUgMTIgfHwgMTI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9JHttZXJpZGllbX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZSc7XHJcblxyXG4gICAgYmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2NoZWR1bGU6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gVGltZVJhbmdlQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiB0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fS17eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLmVuZCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiAhdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0gdW50aWw8L3NwYW4+XHJcbiAgICBgXHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAndGltZVJhbmdlQ3RybCc7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2VDb250cm9sbGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhc1N0YXJ0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBoYXNFbmQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5oYXNTdGFydCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIHRoaXMuaGFzRW5kID0gYW5ndWxhci5pc0RlZmluZWQodGhpcy5zY2hlZHVsZS5lbmQpICYmIHRoaXMuc2NoZWR1bGUuZW5kICE9PSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChUaW1lUmFuZ2VDb21wb25lbnQuJG5hbWUsIG5ldyBUaW1lUmFuZ2VDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWUsIFRpbWVSYW5nZUNvbnRyb2xsZXIpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRxJyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyR3JvdXBTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJWYWxpZGF0aW9uU2VydmljZScsXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgZ3JvdXBTZXJ2aWNlOiBHcm91cFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGRheU1hcDogeyBba2V5OiBudW1iZXJdOiBzdHJpbmcgfSxcclxuICAgIHByaXZhdGUgc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9vcmlnaW5hbEl0ZW1zOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXTtcclxuXHJcbiAgcHJpdmF0ZSBhZGFwdGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8YW55LCBhbnk+O1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHNjaGVkdWxlciBoYXMgYmVlbiBpbnRlcmFjdGVkIHdpdGggKi9cclxuICBwdWJsaWMgZGlydHk6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBzaG91bGQgYmUgdHJ1ZSBpZiB0aGUgc2NoZWR1bGVyIGJlY2FtZSBpbnZhbGlkIGFmdGVyIGJlaW5nIGluaXRpYWxpemVkICovXHJcbiAgcHVibGljIGludmFsaWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBzaG91bGQgYmUgdHJ1ZSBpZiB0aGUgc2NoZWR1bGVyIHdhcyAqKmluaXRpYWxpemVkKiogd2l0aCBpbnZhbGlkIHZhbHVlcyAqL1xyXG4gIHB1YmxpYyBzdGFydGVkV2l0aEludmFsaWRTY2hlZHVsZTogYm9vbGVhbjtcclxuICBwdWJsaWMgaG92ZXJDbGFzczogc3RyaW5nO1xyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT5cclxuICBwdWJsaWMgaXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PjtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PiA9IHtcclxuICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4gYW5ndWxhci5ub29wKClcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdmFsaWRhdGlvbkVycm9yczogVmFsaWRhdGlvbkVycm9yW107XHJcblxyXG4gICRkb0NoZWNrKCkge1xyXG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnMgPSB0aGlzLmdldFZhbGlkYXRpb25FcnJvcnMoKTtcclxuXHJcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycykge1xyXG4gICAgICB0aGlzLnZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0aW9uRXJyb3JzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuY29uZmlnID0gdGhpcy5jb25maWd1cmUodGhpcy5vcHRpb25zKTtcclxuICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB0aGlzLnN0YXJ0ZWRXaXRoSW52YWxpZFNjaGVkdWxlID0gdGhpcy5oYXNJbnZhbGlkU2NoZWR1bGUoKTtcclxuICAgIHRoaXMud2F0Y2hBZGFwdGVyKCk7XHJcbiAgICB0aGlzLndhdGNoSG92ZXJDbGFzcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGhhc0ludmFsaWRTY2hlZHVsZSgpIHtcclxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IHRoaXMuZ2V0VmFsaWRhdGlvbkVycm9ycygpO1xyXG5cclxuICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXMoaXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5maWxsSXRlbXMoaXRlbXMpO1xyXG5cclxuICAgIC8vIGtlZXAgYSByZWZlcmVuY2Ugb24gdGhlIGFkYXB0ZXIgc28gd2UgY2FuIHB1bGwgaXQgb3V0IGxhdGVyXHJcbiAgICB0aGlzLmFkYXB0ZXIuaXRlbXMgPSB0aGlzLml0ZW1zO1xyXG5cclxuICAgIC8vIGtlZXAgYSBjb3B5IG9mIHRoZSBpdGVtcyBpbiBjYXNlIHdlIG5lZWQgdG8gcm9sbGJhY2tcclxuICAgIHRoaXMuX29yaWdpbmFsSXRlbXMgPSBhbmd1bGFyLmNvcHkodGhpcy5pdGVtcyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkSXRlbXNGcm9tQWRhcHRlcigpIHtcclxuICAgIHJldHVybiB0aGlzLmJ1aWxkSXRlbXModGhpcy5nZXRJdGVtc0Zyb21BZGFwdGVyKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIGlmICh0aGlzLmFkYXB0ZXIpIHtcclxuICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuYWRhcHRlci5pbml0aWFsRGF0YS5tYXAoZGF0YSA9PiB0aGlzLmFkYXB0ZXIuY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGRhdGEpKTtcclxuICAgICAgbGV0IGdyb3VwZWRTY2hlZHVsZXMgPSB0aGlzLmdyb3VwU2VydmljZS5ncm91cFNjaGVkdWxlcyhzY2hlZHVsZXMpO1xyXG5cclxuICAgICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWRTY2hlZHVsZXMpIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuY3JlYXRlSXRlbShwYXJzZUludChrZXksIDEwKSwgZ3JvdXBlZFNjaGVkdWxlc1trZXldKTtcclxuXHJcbiAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRWYWxpZGF0aW9uRXJyb3JzKCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMuaXRlbXMubWFwKGl0ZW0gPT4gdGhpcy5zY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuZ2V0VmFsaWRhdGlvbkVycm9ycyhpdGVtLCB0aGlzLmNvbmZpZykpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+KTogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+IHtcclxuICAgIHZhciBpbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgMTU7IC8vIG1pbnV0ZXNcclxuICAgIHZhciBob3Vyc0luRGF5ID0gMjQ7XHJcbiAgICB2YXIgbWludXRlc0luRGF5ID0gaG91cnNJbkRheSAqIDYwO1xyXG4gICAgdmFyIGludGVydmFsQ291bnQgPSBtaW51dGVzSW5EYXkgLyBpbnRlcnZhbDtcclxuXHJcbiAgICB2YXIgdXNlck9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQodXNlck9wdGlvbnMsIHtcclxuICAgICAgaW50ZXJ2YWw6IGludGVydmFsLFxyXG4gICAgICBtYXhWYWx1ZTogbWludXRlc0luRGF5LFxyXG4gICAgICBob3VyQ291bnQ6IGhvdXJzSW5EYXksXHJcbiAgICAgIGludGVydmFsQ291bnQ6IGludGVydmFsQ291bnQsXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVJdGVtKGRheTogbnVtYmVyLCBzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKSB7XHJcbiAgICBsZXQgcmVzdWx0OiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gICAgbGV0IGJ1aWxkZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gdGhpcy5jb25maWcuY3JlYXRlSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcblxyXG4gICAgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQoYnVpbGRlciwgeyBsYWJlbDogdGhpcy5kYXlNYXBbZGF5XSB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNjaGVkdWxlciBzaG91bGQgYWx3YXlzIHNob3cgYWxsIGRheXMsIGV2ZW4gaWYgaXQgd2FzIG5vdCBwYXNzZWQgYW55IHNjaGVkdWxlcyBmb3IgdGhhdCBkYXlcclxuICAgKi9cclxuICBwcml2YXRlIGZpbGxJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZGF5TWFwLCAoZGF5OiBzdHJpbmcsIHN0cmluZ0tleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgbGV0IGl0ZW06IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoID8gZmlsdGVyZWRJdGVtc1swXSA6IG51bGw7XHJcblxyXG4gICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNyZWF0ZUl0ZW0oa2V5LCBbXSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnNhdmVTY2hlZHVsZXIoKS50aGVuKCgpID0+IHRoaXMuZGlydHkgPSBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBBaGhhaGhhaGghIEZpZ2h0ZXIgb2YgdGhlIE5pZ2h0TWFwISAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERheU1hcCB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgdmFsdWUgPSB7XHJcbiAgICAgICAgMDogJ01vbicsXHJcbiAgICAgICAgMTogJ1R1ZScsXHJcbiAgICAgICAgMjogJ1dlZCcsXHJcbiAgICAgICAgMzogJ1RodXInLFxyXG4gICAgICAgIDQ6ICdGcmknLFxyXG4gICAgICAgIDU6ICdTYXQnLFxyXG4gICAgICAgIDY6ICdTdW4nIFxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KERheU1hcC4kbmFtZSwgRGF5TWFwLnZhbHVlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kV2lkdGgge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJztcclxuXHJcbiAgICBzdGF0aWMgdmFsdWUgPSAxMjA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoTnVsbEVuZFdpZHRoLiRuYW1lLCBOdWxsRW5kV2lkdGgudmFsdWUpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHRpbWVvdXQnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbXVsdGlzbGlkZXJDdHJsOiBNdWx0aVNsaWRlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBpdGVtOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwcml2YXRlIHVwZGF0ZVNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pn0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG5cclxuICBwcml2YXRlIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdlIHdhbnQgdG8gY2FuY2VsIHRoZSBkcmFnIG9wZXJhdGlvbiBpZiB0aGUgdXNlciBpcyBqdXN0IGNsaWNraW5nIG9uIHRoZSBpdGVtIG9yIGhhcyBzdGFydGVkIGRyYWdnaW5nIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIGRyYWcgdG8gXCJhY3RpdmF0ZVwiXHJcbiAgICogSG93ZXZlciwgd2Ugc2hvdWxkIGdpdmUgdGhlbSBhIHNtYWxsIHRvbGVyYW5jZSBiZWZvcmUgY29uc2lkZXJpbmcgdGhlbSB0byBoYXZlIHN0YXJ0ZWQgZHJhZ2dpbmcgZWFybHksIGFzIGl0IGlzIHZlcnkgZWFzeSB0byBhY2NpZGVudGFsbHkgbW92ZSBhIGZldyBwaXhlbHMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAocGl4ZWwgPiAzKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnKCkge1xyXG4gICAgdGhpcy4kdGltZW91dC5jYW5jZWwodGhpcy5zdGFydERyYWdUaW1lb3V0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RHJhZ1N0YXJ0VmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGF5OiB0aGlzLnNjaGVkdWxlLmRheSxcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jb25maWcubnVsbEVuZHMgPyB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOiB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuZW5kKSxcclxuICAgICAgdmFsdWU6IHRoaXMuc2NoZWR1bGUudmFsdWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG5cclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyBuZy1jbGljayBmcm9tIGFjY2lkZW50YWxseSBmaXJpbmcgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSwgMjAwKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwubWVyZ2UodGhpcy5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICB0aGlzLnJlc2l6ZVN0YXJ0KHVpLCBkZWx0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc2l6ZUVuZCh1aSwgZGVsdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVN0YXJ0KHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBzdGFydENoYW5nZWQgPSBzY2hlZHVsZS5zdGFydCAhPT0gbmV3U3RhcnQ7XHJcbiAgICBsZXQgbmV3U3RhcnRCZWZvcmVPckF0RW5kID0gbmV3U3RhcnQgPD0gdGhpcy5tdWx0aXNsaWRlckN0cmwuYWRqdXN0RW5kRm9yVmlldyhzY2hlZHVsZS5lbmQpIC0gMTtcclxuICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0ID0gbmV3U3RhcnQgPj0gMDtcclxuXHJcbiAgICBpZiAoc3RhcnRDaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCAmJiBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG4gICAgbGV0IGVuZENoYW5nZWQgPSBzY2hlZHVsZS5lbmQgIT09IG5ld0VuZDtcclxuICAgIGxldCBuZXdFbmRCZWZvcmVPckF0RW5kID0gbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgbGV0IG5ld0VuZEFmdGVyT3JBdFN0YXJ0ID0gbmV3RW5kID49IHNjaGVkdWxlLnN0YXJ0ICsgMTtcclxuXHJcbiAgICBpZiAoZW5kQ2hhbmdlZCAmJiBuZXdFbmRBZnRlck9yQXRTdGFydCAmJiBuZXdFbmRCZWZvcmVPckF0RW5kKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSwgdXBkYXRlOiB1cGRhdGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIHJlbW92ZVNjaGVkdWxlOiAnJicsXHJcbiAgICB1cGRhdGVTY2hlZHVsZTogJyYnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUmVzaXplU2VydmljZSB7XHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQ7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlUHJvdmlkZXIgZXh0ZW5kcyBhbmd1bGFyLklTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgICAgIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIERheXMge1xyXG4gICAgICAgIE1vbmRheSA9IDAsXHJcbiAgICAgICAgVHVlc2RheSA9IDEsXHJcbiAgICAgICAgV2VkbmVzZGF5LFxyXG4gICAgICAgIFRodXJzZGF5LFxyXG4gICAgICAgIEZyaWRheSxcclxuICAgICAgICBTYXR1cmRheSxcclxuICAgICAgICBTdW5kYXlcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gKi9cclxubmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgICAgIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShjdXN0b206IFRDdXN0b20pOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFRWYWx1ZT47XHJcblxyXG4gICAgICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgICAgICBnZXRTbmFwc2hvdCgpOiBUQ3VzdG9tW107XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICAgICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICAgICAgaW5pdGlhbERhdGE6IFRDdXN0b21bXTtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZSBleHRlbmRzIGFuZ3VsYXIuSUZpbHRlclNlcnZpY2Uge1xyXG4gICAgKG5hbWU6ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKTogKG1pbnV0ZXM6IG51bWJlcikgPT4gc3RyaW5nXHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPFQ+IHtcclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlIHNjaGVkdWxlcyB3aWxsIGJlIGFsbG93ZWQgJiByZXF1aXJlZCB0byBoYXZlIG5vIHNldCBlbmQgdGltZSAqL1xyXG4gICAgICAgIG51bGxFbmRzPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoZXNlIGNsYXNzZXMgd2lsbCBiZSBhcHBsaWVkIGRpcmVjdGx5IHRvIHRoZSBidXR0b25zICovXHJcbiAgICAgICAgYnV0dG9uQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgICAgICBjcmVhdGVJdGVtOiAoZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cywgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXSkgPT4gYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgICAgICAvKiogZGVmYXVsdFZhbHVlIHNob3VsZCBiZSBhc3NpZ25lZCBwZXIgc2V0IG9mIG9wdGlvbnMsIG5vdCBwZXIgaXRlbS4gRG8gbm90IGFzc2lnbiBmb3Igbm8gZGVmYXVsdCAqL1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZT86IFQ7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhbiBpdGVtIGlzIGNsaWNrZWQgaW4gb3JkZXIgdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBpdCAqL1xyXG4gICAgICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+PjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSwgQUxMIHNsb3RzIGluIHRoZSBjYWxlbmRhciBtdXN0IGJlIGZpbGxlZCBpbiBvcmRlciBmb3IgaXQgdG8gYmUgdmFsaWQgKi9cclxuICAgICAgICBmdWxsQ2FsZW5kYXI/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBhIHRpbWUgc2xvdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGJlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbWludXRlcyBsb25nICovXHJcbiAgICAgICAgbWF4VGltZVNsb3Q/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gdGhlIHNjaGVkdWxlciBjaGFuZ2VzLiBVc2UgaXQgdG8gaG9vayBpbnRvIGFuZ3VsYXIgZm9ybXNcclxuICAgICAgICAgKiBmb3Igc2V0dGluZyAkZGlydHkgb3IgdXBkYXRpbmcgdmFsaWRhdGlvbiBpbiBjYXNlcyB3aGVyZSBpdCBpcyBub3QgZGVzaXJhYmxlIHRvIHNhdmUgc2NoZWR1bGVzIGluZGl2aWR1YWxseS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkNoYW5nZT86IChpc1ZhbGlkOiBib29sZWFuKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgICAgICBpbnRlcnZhbD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3ZW4gdGhlIHNhdmUgYnV0dG9uIGlzIGNsaWNrZWQuIElmIHRoaXMgaXMgbm90IHBhc3NlZCwgbm8gc2F2ZSBidXR0b24gd2lsbCBiZSBwcmVzZW50LiAqL1xyXG4gICAgICAgIHNhdmVTY2hlZHVsZXI/OiAoKSA9PiBhbmd1bGFyLklQcm9taXNlPGFueT47XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAgICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAgICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIE5vdCBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IG1ha2VzIHRoaW5ncyBhIHdob29vbGUgbG90IGVhc2llciAqL1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHZhbHVlOiBUO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()">Save</button><br-weekly-scheduler adapter="adapter" options="model.options"></br-weekly-scheduler><code>Dirty: {{ isDirty }}</code> <code>Valid: {{ isValid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" options="model.options"></br-weekly-scheduler><hr>Result: {{ result }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot && multiSliderCtrl.canRenderGhost()">+</div><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 nullEnd: schedule.end === null,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></br-weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" item="item" index="$index"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.dirty || schedulerCtrl.validationErrors.length" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);