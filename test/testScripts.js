angular.module('demoApp', ['weeklyScheduler'])
    .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {
        $scope.isDirty = false;
        $scope.model = {
            options: {
                createItem: function (day, schedules) {
                    return {
                        day: day,
                        schedules: schedules
                    };
                },
                editSlot: function (schedule) {
                    schedule.end += 15;
                    return $timeout(function () { return schedule; }, 400);
                }
            },
            items: [
                // {
                //   label: 'Sun',
                //   //editable: false,
                //   schedules: [
                //     { start: 315, end: 375 }
                //   ]
                // },
                // {
                //   label: 'Mon',
                //   //editable: false,
                //   schedules: [
                //     { start: 300, end: 1140 }
                //   ]
                // },
                // {
                //   label: 'Tue',
                //   schedules: [
                //     { start: 0, end: 240 },
                //     { start: 300, end: 360 }
                //   ]
                // },
                // {
                //   label: 'Wed',
                //   schedules: [
                //     { start: 120, end: 720 }
                //   ]
                // },
                // {
                //   label: 'Thur',
                //   editable: false,
                //   schedules: [
                //     { start: 300, end: 1140 }
                //   ]
                // },
                {
                    day: 5 /* Saturday */,
                    schedules: [
                        { start: 300, end: 900 }
                    ]
                }
            ]
        };
        this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
            $scope.isDirty = true;
            console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
        };
    }]);
angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);
/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small
 */
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
    GroupService.$name = 'groupService';
    return GroupService;
}());
angular
    .module('weeklyScheduler')
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
            element.on('mousedown', function (event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                x = event.pageX;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$apply(scope.ondragstart());
                }
            });
            function mousemove(event) {
                var delta = event.pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.$apply(scope.ondrag({ delta: delta }));
                }
            }
            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
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
        this.GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
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
    HourlyGridDirective.$name = 'hourlyGrid';
    return HourlyGridDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
/** @internal */
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $scope, $window, overlapService) {
        var _this = this;
        this.$element = $element;
        this.$scope = $scope;
        this.$window = $window;
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
        var _this = this;
        this.mergeAllOverlaps();
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
        if (this.$hoverElement.length) {
            this.$element.on('mousemove', function (e) {
                var elOffX = _this.getElementOffsetX(_this.$element);
                var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
                var val = _this.pixelToVal(left);
                _this.$hoverElement.css({
                    left: _this.getSlotLeft(val),
                    right: _this.getSlotRight(val + _this.size)
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
    MultiSliderController.prototype.addScheduleToItem = function (schedule) {
        this.item.schedules.push(schedule);
        this.merge(schedule);
        this.schedulerCtrl.onAdd();
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
    MultiSliderController.prototype.getSlotRight = function (end) {
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
        // Most of the time we won't want to do ANYTHING if there is no overlap, however...
        if (this.config.fullCalendar) {
            var currentIndex = this.item.schedules.indexOf(current);
            var otherIndex = this.item.schedules.indexOf(other);
            // Do nothing if the items aren't consecutive
            if (Math.abs(currentIndex - otherIndex) !== 1) {
                return;
            }
            // With a fullCalendar, if two items are touching and the start of the one on the right moves to the right, leaving a gap, the end of the left one should expand to fill the space
            if (this.adjustEndForView(current.end) > other.start) {
                this.updateSchedule(other, {
                    start: other.start,
                    end: current.start,
                    value: other.value
                });
            }
            // Same if two items are touching & the end of the one on the left moves to the left, leaving a gap
            if (this.adjustEndForView(current.end) < other.start) {
                this.updateSchedule(other, {
                    start: current.end,
                    end: other.end,
                    value: other.value
                });
            }
        }
    };
    MultiSliderController.prototype.handleOtherEndIsInsideCurrent = function (current, other) {
        if (this.valuesMatch(current, other)) {
            this.removeSchedule(other);
            this.updateSchedule(current, {
                start: other.start,
                end: current.end,
                value: other.value
            });
        }
        else {
            this.updateSchedule(other, {
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
                start: current.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            this.updateSchedule(other, {
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
            var end = this.adjustEndForModel(start + this.size);
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
        //this.schedulerCtrl.onDelete();
    };
    MultiSliderController.prototype.resize = function () {
        /* Since we have changed the width of the element via plain js +
         * the ng-styles for the individual slots are computed in this controller,
         * we must call $apply() manually so they will all update their positions to match the zoom level
         */
        this.$scope.$apply();
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
    MultiSliderController.$name = 'multiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$scope',
        '$window',
        'overlapService'
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
            schedulerCtrl: '^weeklyScheduler'
        };
        this.templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
    }
    MultiSliderComponent.$name = 'multiSlider';
    return MultiSliderComponent;
}());
angular.module('weeklyScheduler')
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
    OverlapService.$name = 'overlapService';
    return OverlapService;
}());
angular
    .module('weeklyScheduler')
    .service(OverlapService.$name, OverlapService);
/** @internal */
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
/** @internal */
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
var FullCalendarValidatorService = /** @class */ (function () {
    function FullCalendarValidatorService() {
    }
    FullCalendarValidatorService.prototype.validate = function (schedules, config) {
        if (!config.fullCalendar) {
            return true;
        }
        // When this option is true we should enforce that there are no gaps in the schedules
        // Compare two at a time until the end;
        var len = schedules.length - 1;
        var result = true;
        for (var i = 0; i < len; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            // Validate that the first item lands at 0
            if (i === 0 && current.start !== 0) {
                return false;
            }
            // Validate that the last item lands at maxValue
            if (i === len - 1 && (next.end || config.maxValue) !== config.maxValue) {
                return false;
            }
            result = result && current.end === next.start;
        }
        return result;
    };
    FullCalendarValidatorService.$name = 'fullCalendarValidatorService';
    return FullCalendarValidatorService;
}());
angular
    .module('weeklyScheduler')
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
    MaxTimeSlotValidatorService.$name = 'maxTimeSlotValidatorService';
    return MaxTimeSlotValidatorService;
}());
angular
    .module('weeklyScheduler')
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService);
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
    OverlapValidatorService.$name = 'overlapValidatorService';
    OverlapValidatorService.$inject = [
        'overlapService'
    ];
    return OverlapValidatorService;
}());
angular
    .module('weeklyScheduler')
    .service(OverlapValidatorService.$name, OverlapValidatorService);
/** @internal */
var ScheduleValidatorService = /** @class */ (function () {
    function ScheduleValidatorService(fullCalendarValidatorService, maxTimeSlotValidatorService, overlapValidatorService) {
        this.fullCalendarValidatorService = fullCalendarValidatorService;
        this.maxTimeSlotValidatorService = maxTimeSlotValidatorService;
        this.overlapValidatorService = overlapValidatorService;
    }
    ScheduleValidatorService.prototype.areSchedulesValid = function (item, config) {
        if (!this.maxTimeSlotValidatorService.validate(item.schedules, config.maxTimeSlot)) {
            return false;
        }
        if (!this.fullCalendarValidatorService.validate(item.schedules, config)) {
            return false;
        }
        if (!this.overlapValidatorService.validate(item.schedules, config.maxValue)) {
            return false;
        }
        return true;
    };
    ScheduleValidatorService.$name = 'scheduleValidatorService';
    ScheduleValidatorService.$inject = [
        'fullCalendarValidatorService',
        'maxTimeSlotValidatorService',
        'overlapValidatorService'
    ];
    return ScheduleValidatorService;
}());
angular
    .module('weeklyScheduler')
    .service(ScheduleValidatorService.$name, ScheduleValidatorService);
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
    TimeOfDayFilter.$name = 'timeOfDay';
    return TimeOfDayFilter;
}());
angular
    .module('weeklyScheduler')
    .filter(TimeOfDayFilter.$name, [TimeOfDayFilter.Factory]);
/** @internal */
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($element, $scope, dayMap, scheduleValidatorService) {
        this.$element = $element;
        this.$scope = $scope;
        this.dayMap = dayMap;
        this.scheduleValidatorService = scheduleValidatorService;
        this.defaultOptions = {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            defaultValue: null,
            monoSchedule: false
        };
    }
    WeeklySchedulerController.prototype.$doCheck = function () {
        // Check for reference equality, not object equality.
        // This should only rerun if the whole set of items is replaced on the client.
        if (this.items !== this.previousItems) {
            this.items = this.fillItems(this.items);
            this.previousItems = this.items;
        }
    };
    WeeklySchedulerController.prototype.$onInit = function () {
        this.config = this.configure(this.options);
        this.updateScheduleValidity();
        this.items = this.fillItems(this.items);
        this.previousItems = this.items;
        this.watchHoverClass();
    };
    WeeklySchedulerController.prototype.checkScheduleValidity = function () {
        var _this = this;
        return this.items.some(function (item) { return !_this.scheduleValidatorService.areSchedulesValid(item, _this.config); });
    };
    /**
     * Configure the scheduler.
     */
    WeeklySchedulerController.prototype.configure = function (options) {
        var interval = options.interval || 15; // minutes
        var hoursInDay = 24;
        var minutesInDay = hoursInDay * 60;
        var intervalCount = minutesInDay / interval;
        var result = angular.extend(this.defaultOptions, {
            createItem: options.createItem,
            editSlot: options.editSlot,
            fullCalendar: options.fullCalendar,
            interval: interval,
            maxValue: minutesInDay,
            hourCount: hoursInDay,
            intervalCount: intervalCount
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
    WeeklySchedulerController.prototype.updateScheduleValidity = function () {
        this.hasInvalidSchedule = this.checkScheduleValidity();
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'weeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$element',
        '$scope',
        'dayMap',
        'scheduleValidatorService'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
            adapter: '<',
            hoverClass: '<',
            items: '=',
            options: '=',
            onAdd: '&',
            onChange: '&',
            onDelete: '&'
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
/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
var DayMap = /** @class */ (function () {
    function DayMap() {
    }
    DayMap.$name = 'dayMap';
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
    .module('weeklyScheduler')
    .constant(DayMap.$name, DayMap.value);
/** @internal */
var WeeklySlotController = /** @class */ (function () {
    function WeeklySlotController($scope, $timeout, overlapService) {
        this.$scope = $scope;
        this.$timeout = $timeout;
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
            start: this.schedule.start,
            end: this.multisliderCtrl.adjustEndForView(this.schedule.end),
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
        var newEnd = Math.round(newStart + duration);
        if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
            this.updateSelf({
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
            return;
        }
        this.$timeout(function () {
            // this prevents user from accidentally
            // adding new slot after resizing or dragging
            _this.multisliderCtrl.canAdd = true;
            // this prevents ng-click from accidentally firing after resizing or dragging
            _this.schedule.$isActive = false;
            _this.multisliderCtrl.isDragging = false;
        }, 200).then(function () {
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
        'overlapService'
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
            multisliderCtrl: '^multiSlider'
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
    ZoomService.prototype.setZoomWidth = function (element, width) {
        element.querySelector(this.selector).style.width = width;
    };
    ZoomService.prototype.resetZoom = function (element) {
        this.setZoomWidth(element, '100%');
        this.broadcastZoomedOutEvent();
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
    ZoomService.$name = 'zoomService';
    ZoomService.$inject = ['$rootScope'];
    return ZoomService;
}());
angular
    .module('weeklyScheduler')
    .service(ZoomService.$name, ZoomService);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvZnVsbC1jYWxlbmRhci12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9tYXgtdGltZS1zbG90LXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL292ZXJsYXAtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3Ivc2NoZWR1bGUtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5TWFwLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQzNDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTTtJQUN6RCxVQUFVLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSTtRQUU5QixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUV2QixNQUFNLENBQUMsS0FBSyxHQUFHO1lBQ2IsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPO3dCQUNMLEdBQUcsRUFBRSxHQUFHO3dCQUNSLFNBQVMsRUFBRSxTQUFTO3FCQUNy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SCxJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBbEVNLGlCQUFLLEdBQUcsYUFBYSxDQUFDO0lBRXRCLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQWlFcEMsa0JBQUM7Q0FwRUQsQUFvRUMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWyd3ZWVrbHlTY2hlZHVsZXInXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckdGltZW91dCcsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbG9nKSB7XHJcblxyXG4gICAgICAkc2NvcGUuaXNEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGRheTogZGF5LFxyXG4gICAgICAgICAgICAgIHNjaGVkdWxlczogc2NoZWR1bGVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBlZGl0U2xvdDogZnVuY3Rpb24oc2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGUuZW5kICs9IDE1O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICR0aW1lb3V0KCgpID0+IHNjaGVkdWxlLCA0MDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdTdW4nLFxyXG4gICAgICAgICAgLy8gICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIC8vICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAvLyAgICAgeyBzdGFydDogMzE1LCBlbmQ6IDM3NSB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnTW9uJyxcclxuICAgICAgICAgIC8vICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdUdWUnLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAwLCBlbmQ6IDI0MCB9LFxyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAzNjAgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ1dlZCcsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDEyMCwgZW5kOiA3MjAgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ1RodXInLFxyXG4gICAgICAgICAgLy8gICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZGF5OiBEYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogOTAwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0gYXMgSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmRvU29tZXRoaW5nID0gZnVuY3Rpb24gKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkge1xyXG4gICAgICAgICRzY29wZS5pc0RpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbiBjbGFzcyBHcm91cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2dyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pOiB7IFtrZXk6IG51bWJlcl06IElXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSB9ICB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHNjaGVkdWxlcy5yZWR1Y2UoKHJlZHVjZXIsIGN1cnJlbnRTY2hlZHVsZSwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBjdXJyZW50U2NoZWR1bGUuZGF5O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZWR1Y2VyW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHJlZHVjZXJba2V5XSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZWR1Y2VyW2tleV0ucHVzaChjdXJyZW50U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlZHVjZXI7XHJcbiAgICAgICAgfSwgc2VlZCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiB9XHJcblxyXG4gYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdGFydCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnKSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWcoeyBkZWx0YTogZGVsdGEgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2V1cCgpIHtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdG9wKSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdG9wKCkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIb3VybHlHcmlkRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdob3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXndlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgbmJFbGVtZW50czogaG91ckNvdW50LFxyXG4gICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gU3RyaXBlIGl0IGJ5IGhvdXJcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdzdHJpcGVkJyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudEhvdXIgPSBpICUgMTI7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGkgPj0gMTIgPyAncCcgOiAnYSc7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC50ZXh0KGAke2N1cnJlbnRIb3VyIHx8ICcxMid9JHttZXJpZGllbX1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBudW1JbnRlcnZhbHNJblRpY2sgPSA2MCAvIGNvbmZpZy5pbnRlcnZhbDtcclxuICAgICAgICAgICAgbGV0IGludGVydmFsUGVyY2VudGFnZSA9IDEwMCAvIG51bUludGVydmFsc0luVGljaztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtSW50ZXJ2YWxzSW5UaWNrOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBncmFuZENoaWxkID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmF0dHIoJ3JlbCcsICgoaSAqIG51bUludGVydmFsc0luVGljaykgKyBqKSAqIGNvbmZpZy5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmFkZENsYXNzKCdpbnRlcnZhbCcpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5jc3MoJ3dpZHRoJywgaW50ZXJ2YWxQZXJjZW50YWdlICsgJyUnKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFwcGVuZChncmFuZENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSG91cmx5R3JpZERpcmVjdGl2ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShIb3VybHlHcmlkRGlyZWN0aXZlLiRuYW1lLCBIb3VybHlHcmlkRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHdpbmRvdycsXHJcbiAgICAnb3ZlcmxhcFNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgJGhvdmVyRWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xyXG4gIHByaXZhdGUgaW5kZXg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBvdmVybGFwSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHZvaWQ7IH0gPSB7XHJcbiAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICB9O1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcbiAgXHJcbiAgcHVibGljIGNhbkFkZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgcHVibGljIGlzRHJhZ2dpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgaXNIb3ZlcmluZ1Nsb3Q6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHB1YmxpYyBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG4gIHB1YmxpYyBzaXplOiBudW1iZXIgPSA2MDsgLy8gbWludXRlc1xyXG4gIFxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcblxyXG4gICAgaWYgKHRoaXMuJGhvdmVyRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgICB2YXIgbGVmdCA9IGUucGFnZVggLSBlbE9mZlggLSB0aGlzLiRob3ZlckVsZW1lbnRbMF0uY2xpZW50V2lkdGggLyAyO1xyXG5cclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5waXhlbFRvVmFsKGxlZnQpO1xyXG5cclxuICAgICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgIGxlZnQ6IHRoaXMuZ2V0U2xvdExlZnQodmFsKSxcclxuICAgICAgICAgIHJpZ2h0OiB0aGlzLmdldFNsb3RSaWdodCh2YWwgKyB0aGlzLnNpemUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmQgPiB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbTtcclxuXHJcbiAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlID0ge1xyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlIFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpKSB7XHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKGVkaXRlZFNjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShlZGl0ZWRTY2hlZHVsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5wdXNoKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2Uoc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkFkZCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZW1lbnRPZmZzZXRYKGVsZW06IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgcmV0dXJuIGVsZW1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRqdXN0RW5kRm9yTW9kZWwoZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChlbmQgPT09IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVuZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiB0aGUgc2NoZWR1bGUgaXMgYWJsZSB0byBiZSBlZGl0ZWRcclxuICAgKi9cclxuICBwcml2YXRlIGNhbkVkaXQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgaXNFZGl0YWJsZSA9ICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCk7XHJcbiAgICBsZXQgaXNOb3RBY3RpdmUgPSAhc2NoZWR1bGUuJGlzQWN0aXZlO1xyXG4gICAgbGV0IGlzTm90RHJhZ2dpbmcgPSAhdGhpcy5pc0RyYWdnaW5nO1xyXG5cclxuICAgIHJldHVybiBpc0VkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbiAmJiBpc05vdEFjdGl2ZSAmJiBpc05vdERyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wZW5zYXRlRm9yQm9yZGVyKGVsZW06IEhUTUxFbGVtZW50LCB2YWw6IG51bWJlcikge1xyXG4gICAgbGV0IGJvcmRlcldpZHRoID0gdGhpcy4kd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXJpZ2h0Jyk7XHJcblxyXG4gICAgLy8gVGhlcmUgYXJlIGRvdWJsZSBib3JkZXJzIGF0IHRoZSBiZWdpbm5pbmdzIGFuZCBlbmRzIG9mIGhvdXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGl0XHJcbiAgICBsZXQgb25Ib3VyID0gdmFsICUgNjAgPT09IDA7XHJcblxyXG4gICAgcmV0dXJuIG9uSG91ciA/IGVsZW0ub2Zmc2V0TGVmdCA6IGVsZW0ub2Zmc2V0TGVmdCAtIHBhcnNlSW50KGJvcmRlcldpZHRoLCAxMCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGFuIGV4dGVybmFsIGFjdGlvbiB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGEgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLmNhbkVkaXQoc2NoZWR1bGUpKSB7XHJcbiAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigobmV3U2NoZWR1bGUpID0+IHtcclxuICAgICAgICBpZiAobmV3U2NoZWR1bGUuJGlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1lcmdlKG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgIC8vIElmIG1lcmdpbmcgbXV0YXRlZCB0aGUgc2NoZWR1bGUgZnVydGhlciwgdGhlbiB1cGRhdGVTY2hlZHVsZSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWRcclxuICAgICAgICAgIC8vIFRoaXMgaXMgc28gdGhhdCBlZGl0cyB0aGF0IGRvbid0IHRyaWdnZXIgbWVyZ2VzIHN0aWxsIHRyaWdnZXIgb25DaGFuZ2UsXHJcbiAgICAgICAgICAvLyBidXQgZWRpdHMgdGhhdCBkbyB0cmlnZ2VyIG1lcmdlcyBkb24ndCB0cmlnZ2VyIGl0IHR3aWNlXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMocHJlbWVyZ2VTY2hlZHVsZSwgbmV3U2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoc2NoZWR1bGUsIG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE92ZXJsYXBTdGF0ZShjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjdXJyZW50LnN0YXJ0LCB0aGlzLmFkanVzdEVuZEZvclZpZXcoY3VycmVudC5lbmQpLCBvdGhlci5zdGFydCwgdGhpcy5hZGp1c3RFbmRGb3JWaWV3KG90aGVyLmVuZCkpO1xyXG5cclxuICAgIHJldHVybiBvdmVybGFwU3RhdGU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBzdGFydCkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JWaWV3KGVuZCk7XHJcblxyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdGhpcy5jb21wZW5zYXRlRm9yQm9yZGVyKHVuZGVybHlpbmdJbnRlcnZhbCwgZW5kKSArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQgKyAncHgnO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSBsZWZ0IG9mIHRoZSBsZWZ0bW9zdCBpbnRlcnZhbCwgc28gcmV0dXJuIHRoYXQgaW5zdGVhZFxyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIGlmICh2YWwgPiByaWdodG1vc3QpIHtcclxuICAgICAgdmFsID0gcmlnaHRtb3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnBhcmVudCgpWzBdLnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAvLyBIZXJlLCBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgdmFsdWVzIG1hdGNoIC0tIHRoZSBjb3ZlcmluZyBzbG90IGNhbiBhbHdheXMgXCJlYXRcIiB0aGUgb3RoZXIgb25lXHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSnVzdCByZW1vdmUgJ2N1cnJlbnQnXHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoY3VycmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAvLyBNb3N0IG9mIHRoZSB0aW1lIHdlIHdvbid0IHdhbnQgdG8gZG8gQU5ZVEhJTkcgaWYgdGhlcmUgaXMgbm8gb3ZlcmxhcCwgaG93ZXZlci4uLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICBsZXQgY3VycmVudEluZGV4ID0gdGhpcy5pdGVtLnNjaGVkdWxlcy5pbmRleE9mKGN1cnJlbnQpO1xyXG4gICAgICBsZXQgb3RoZXJJbmRleCA9IHRoaXMuaXRlbS5zY2hlZHVsZXMuaW5kZXhPZihvdGhlcik7XHJcblxyXG4gICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSBpdGVtcyBhcmVuJ3QgY29uc2VjdXRpdmVcclxuICAgICAgaWYgKE1hdGguYWJzKGN1cnJlbnRJbmRleCAtIG90aGVySW5kZXgpICE9PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXaXRoIGEgZnVsbENhbGVuZGFyLCBpZiB0d28gaXRlbXMgYXJlIHRvdWNoaW5nIGFuZCB0aGUgc3RhcnQgb2YgdGhlIG9uZSBvbiB0aGUgcmlnaHQgbW92ZXMgdG8gdGhlIHJpZ2h0LCBsZWF2aW5nIGEgZ2FwLCB0aGUgZW5kIG9mIHRoZSBsZWZ0IG9uZSBzaG91bGQgZXhwYW5kIHRvIGZpbGwgdGhlIHNwYWNlXHJcbiAgICAgIGlmICh0aGlzLmFkanVzdEVuZEZvclZpZXcoY3VycmVudC5lbmQpID4gb3RoZXIuc3RhcnQpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKG90aGVyLCB7XHJcbiAgICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2FtZSBpZiB0d28gaXRlbXMgYXJlIHRvdWNoaW5nICYgdGhlIGVuZCBvZiB0aGUgb25lIG9uIHRoZSBsZWZ0IG1vdmVzIHRvIHRoZSBsZWZ0LCBsZWF2aW5nIGEgZ2FwXHJcbiAgICAgIGlmICh0aGlzLmFkanVzdEVuZEZvclZpZXcoY3VycmVudC5lbmQpIDwgb3RoZXIuc3RhcnQpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKG90aGVyLCB7XHJcbiAgICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKTtcclxuICAgIH0gZWxzZSB7IFxyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUFsbE92ZXJsYXBzKCkge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5mb3JFYWNoKHMgPT4gdGhpcy5tZXJnZU92ZXJsYXBzKHMpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VPdmVybGFwcyhzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5mb3JFYWNoKChlbCA9PiB7XHJcbiAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5nZXRPdmVybGFwU3RhdGUoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLm92ZXJsYXBIYW5kbGVyc1tvdmVybGFwU3RhdGVdO1xyXG5cclxuICAgICAgICBvdmVybGFwSGFuZGxlcihzY2hlZHVsZSwgZWwpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uSG92ZXJFbGVtZW50Q2xpY2soZXZlbnQpIHtcclxuICAgIGlmICh0aGlzLmNhbkFkZCkge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGhvdmVyRWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRob3ZlckVsZW1lbnQpIC0gZWxPZmZYO1xyXG4gICAgICBcclxuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5waXhlbFRvVmFsKGhvdmVyRWxPZmZYKTtcclxuICAgICAgdmFyIGVuZCA9IHRoaXMuYWRqdXN0RW5kRm9yTW9kZWwoc3RhcnQgKyB0aGlzLnNpemUpO1xyXG5cclxuICAgICAgdGhpcy5hZGRTbG90KHN0YXJ0LCBlbmQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZU92ZXIoKSB7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VMZWF2ZSgpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFjdHVhbGx5IHJlbW92ZSB0aGUgc2NoZWR1bGUgZnJvbSBib3RoIHRoZSBzY3JlZW4gYW5kIHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcblxyXG4gICAgLy90aGlzLnNjaGVkdWxlckN0cmwub25EZWxldGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzaXplKCkge1xyXG4gICAgLyogU2luY2Ugd2UgaGF2ZSBjaGFuZ2VkIHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudCB2aWEgcGxhaW4ganMgK1xyXG4gICAgICogdGhlIG5nLXN0eWxlcyBmb3IgdGhlIGluZGl2aWR1YWwgc2xvdHMgYXJlIGNvbXB1dGVkIGluIHRoaXMgY29udHJvbGxlcixcclxuICAgICAqIHdlIG11c3QgY2FsbCAkYXBwbHkoKSBtYW51YWxseSBzbyB0aGV5IHdpbGwgYWxsIHVwZGF0ZSB0aGVpciBwb3NpdGlvbnMgdG8gbWF0Y2ggdGhlIHpvb20gbGV2ZWxcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21taXQgbmV3IHZhbHVlcyB0byB0aGUgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZVNjaGVkdWxlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICBzY2hlZHVsZS5lbmQgPSB0aGlzLmFkanVzdEVuZEZvck1vZGVsKHVwZGF0ZS5lbmQpO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkNoYW5nZSh7XHJcbiAgICAgIGl0ZW1JbmRleDogdGhpcy5pbmRleCxcclxuICAgICAgc2NoZWR1bGVJbmRleDogdGhpcy5pdGVtLnNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSxcclxuICAgICAgc2NoZWR1bGVWYWx1ZTogc2NoZWR1bGVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNNYXRjaChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgcmV0dXJuIHNjaGVkdWxlLnZhbHVlID09PSBvdGhlci52YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoZW5kID09PSAwKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbmQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2Uoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAvLyBXZSBjb25zaWRlciB0aGUgc2NoZWR1bGUgd2Ugd2VyZSB3b3JraW5nIHdpdGggdG8gYmUgdGhlIG1vc3QgaW1wb3J0YW50LCBzbyBoYW5kbGUgaXRzIG92ZXJsYXBzIGZpcnN0LlxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2VBbGxPdmVybGFwcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBzY2hlZHVsZXJDdHJsOiAnXndlZWtseVNjaGVkdWxlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ292ZXJsYXBTZXJ2aWNlJztcclxuXHJcbiAgICBnZXRPdmVybGFwU3RhdGUoY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLCBvdGhlclN0YXJ0LCBvdGhlckVuZCk6IE92ZXJsYXBTdGF0ZSB7XHJcbiAgICAgICAgaWYgKG90aGVyRW5kID49IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50U3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RW5kID49IG90aGVyRW5kICYmIGN1cnJlbnRTdGFydCA8PSBvdGhlclN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID4gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID49IGN1cnJlbnRTdGFydCAmJiBvdGhlclN0YXJ0IDwgY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPT09IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID09PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBTZXJ2aWNlLiRuYW1lLCBPdmVybGFwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAncmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICckd2luZG93J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUmVzaXplU2VydmljZS4kbmFtZSwgUmVzaXplU2VydmljZSlcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2UuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdzY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2Z1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZDtcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBjdXJyZW50LnN0YXJ0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGxhc3QgaXRlbSBsYW5kcyBhdCBtYXhWYWx1ZVxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGVuIC0gMSAmJiAobmV4dC5lbmQgfHwgY29uZmlnLm1heFZhbHVlKSAhPT0gY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBjdXJyZW50LmVuZCA9PT0gbmV4dC5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ21heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgbWF4VGltZVNsb3Q6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy5lbmQgLSBzLnN0YXJ0ID4gbWF4VGltZVNsb3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdvdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ292ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgbWF4VmFsdWU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQuc3RhcnQsIGN1cnJlbnQuZW5kIHx8IG1heFZhbHVlLCBuZXh0LnN0YXJ0LCBuZXh0LmVuZCB8fCBtYXhWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ21heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ292ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlJ1xyXG4gICAgXVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBmdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlOiBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlOiBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwVmFsaWRhdG9yU2VydmljZTogT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhcmVTY2hlZHVsZXNWYWxpZChpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5tYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UudmFsaWRhdGUoaXRlbS5zY2hlZHVsZXMsIGNvbmZpZy5tYXhUaW1lU2xvdCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UudmFsaWRhdGUoaXRlbS5zY2hlZHVsZXMsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcubWF4VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3Njcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAndGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSAmJiBob3VycyA8IDI0ID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ2RheU1hcCcsXHJcbiAgICAnc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBkYXlNYXA6IHsgW2tleTogbnVtYmVyXTogc3RyaW5nIH0sXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55PjtcclxuXHJcbiAgLyogV2UgbmVlZCB0byBtb2RpZnkgdGhlIGl0ZW1zIHRoYXQgYXJlIGJlaW5nIHdhdGNoZWQgaW5zaWRlIHRoZSB3YXRjaGVyLCBzbyB3ZSdsbCBoYXZlIHRvIGNhbmNlbCBhbmQgcmVhZGQgdGhlIHdhdGNoZXIgdG8gcHJldmVudCBpbmZkaWcgKi9cclxuICBwcml2YXRlIGl0ZW1zV2F0Y2hlckNhbmNlbGxlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGhhc0ludmFsaWRTY2hlZHVsZTogYm9vbGVhbjtcclxuICBwdWJsaWMgaG92ZXJDbGFzczogc3RyaW5nO1xyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT5cclxuICBwdWJsaWMgaXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPltdO1xyXG4gIHB1YmxpYyBwcmV2aW91c0l0ZW1zOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PjtcclxuXHJcbiAgcHVibGljIG9uQWRkOiAoKSA9PiB2b2lkO1xyXG4gIHB1YmxpYyBvbkNoYW5nZTogKG9wdGlvbnM6IHsgaXRlbUluZGV4OiBudW1iZXIsIHNjaGVkdWxlSW5kZXg6IG51bWJlciwgc2NoZWR1bGVWYWx1ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwdWJsaWMgb25EZWxldGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBkZWZhdWx0T3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PiA9IHtcclxuICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgZGVmYXVsdFZhbHVlOiBudWxsLFxyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gICRkb0NoZWNrKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHJlZmVyZW5jZSBlcXVhbGl0eSwgbm90IG9iamVjdCBlcXVhbGl0eS5cclxuICAgIC8vIFRoaXMgc2hvdWxkIG9ubHkgcmVydW4gaWYgdGhlIHdob2xlIHNldCBvZiBpdGVtcyBpcyByZXBsYWNlZCBvbiB0aGUgY2xpZW50LlxyXG4gICAgaWYodGhpcy5pdGVtcyAhPT0gdGhpcy5wcmV2aW91c0l0ZW1zKSB7XHJcbiAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyh0aGlzLml0ZW1zKTtcclxuICAgICAgdGhpcy5wcmV2aW91c0l0ZW1zID0gdGhpcy5pdGVtcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcbiAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlVmFsaWRpdHkoKTtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyh0aGlzLml0ZW1zKTtcclxuICAgIHRoaXMucHJldmlvdXNJdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2hlY2tTY2hlZHVsZVZhbGlkaXR5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXRlbXMuc29tZShpdGVtID0+ICF0aGlzLnNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS5hcmVTY2hlZHVsZXNWYWxpZChpdGVtLCB0aGlzLmNvbmZpZykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWd1cmUob3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55Pik6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHJlc3VsdDogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+ID0gYW5ndWxhci5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywge1xyXG4gICAgICBjcmVhdGVJdGVtOiBvcHRpb25zLmNyZWF0ZUl0ZW0sXHJcbiAgICAgIGVkaXRTbG90OiBvcHRpb25zLmVkaXRTbG90LFxyXG4gICAgICBmdWxsQ2FsZW5kYXI6IG9wdGlvbnMuZnVsbENhbGVuZGFyLFxyXG4gICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXHJcbiAgICAgIG1heFZhbHVlOiBtaW51dGVzSW5EYXksXHJcbiAgICAgIGhvdXJDb3VudDogaG91cnNJbkRheSxcclxuICAgICAgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlSXRlbShkYXk6IG51bWJlciwgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdKSB7XHJcbiAgICBsZXQgcmVzdWx0OiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcblxyXG4gICAgbGV0IGJ1aWxkZXI6IElXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSB0aGlzLmNvbmZpZy5jcmVhdGVJdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuXHJcbiAgICByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChidWlsZGVyLCB7IGxhYmVsOiB0aGlzLmRheU1hcFtkYXldIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc2NoZWR1bGVyIHNob3VsZCBhbHdheXMgc2hvdyBhbGwgZGF5cywgZXZlbiBpZiBpdCB3YXMgbm90IHBhc3NlZCBhbnkgc2NoZWR1bGVzIGZvciB0aGF0IGRheVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZmlsbEl0ZW1zKGl0ZW1zOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10gPSBbXTtcclxuXHJcbiAgICBhbmd1bGFyLmZvckVhY2godGhpcy5kYXlNYXAsIChkYXk6IHN0cmluZywgc3RyaW5nS2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgbGV0IGtleSA9IHBhcnNlSW50KHN0cmluZ0tleSwgMTApO1xyXG4gICAgICBsZXQgZmlsdGVyZWRJdGVtcyA9IGl0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0uZGF5ID09PSBrZXkpO1xyXG4gICAgICBsZXQgaXRlbTogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gZmlsdGVyZWRJdGVtcy5sZW5ndGggPyBmaWx0ZXJlZEl0ZW1zWzBdIDogbnVsbDtcclxuXHJcbiAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuY3JlYXRlSXRlbShrZXksIFtdKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gRElEIGV4aXN0IGp1c3Qgc2V0IHRoZSBsYWJlbFxyXG4gICAgICAgIGl0ZW0ubGFiZWwgPSBkYXk7XHJcblxyXG4gICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gYW5ndWxhci5jb3B5KHJlc3VsdCkuc29ydCgoYSwgYikgPT4gYS5kYXkgPiBiLmRheSA/IDEgOiAtMSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoSG92ZXJDbGFzcygpIHtcclxuICAgIGNvbnN0IHB1bHNlQ2xhc3MgPSAncHVsc2UnO1xyXG4gICAgY29uc3QgcHVsc2VTZWxlY3RvciA9IGAuJHtwdWxzZUNsYXNzfWA7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+IHRoaXMuaG92ZXJDbGFzcywgKCkgPT4ge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmZpbmQocHVsc2VTZWxlY3RvcikucmVtb3ZlQ2xhc3MocHVsc2VDbGFzcyk7XHJcblxyXG4gICAgICBpZiAodGhpcy5ob3ZlckNsYXNzKSB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKGAuJHt0aGlzLmhvdmVyQ2xhc3N9YCkuYWRkQ2xhc3MocHVsc2VDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNjaGVkdWxlVmFsaWRpdHkoKSB7XHJcbiAgICB0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSA9IHRoaXMuY2hlY2tTY2hlZHVsZVZhbGlkaXR5KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGFkYXB0ZXI6ICc8JyxcclxuICAgIGhvdmVyQ2xhc3M6ICc8JyxcclxuICAgIGl0ZW1zOiAnPScsXHJcbiAgICBvcHRpb25zOiAnPScsXHJcbiAgICBvbkFkZDogJyYnLFxyXG4gICAgb25DaGFuZ2U6ICcmJyxcclxuICAgIG9uRGVsZXRlOiAnJidcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2RheU1hcCc7XHJcbiAgICBcclxuICAgIHN0YXRpYyB2YWx1ZSA9IHtcclxuICAgICAgICAwOiAnTW9uJyxcclxuICAgICAgICAxOiAnVHVlJyxcclxuICAgICAgICAyOiAnV2VkJyxcclxuICAgICAgICAzOiAnVGh1cicsXHJcbiAgICAgICAgNDogJ0ZyaScsXHJcbiAgICAgICAgNTogJ1NhdCcsXHJcbiAgICAgICAgNjogJ1N1bicgXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoRGF5TWFwLiRuYW1lLCBEYXlNYXAudmFsdWUpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHRpbWVvdXQnLFxyXG4gICAgJ292ZXJsYXBTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbXVsdGlzbGlkZXJDdHJsOiBNdWx0aVNsaWRlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+fSkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlbW92ZVNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXZSB3YW50IHRvIGNhbmNlbCB0aGUgZHJhZyBvcGVyYXRpb24gaWYgdGhlIHVzZXIgaXMganVzdCBjbGlja2luZyBvbiB0aGUgaXRlbSBvciBoYXMgc3RhcnRlZCBkcmFnZ2luZyB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBkcmFnIHRvIFwiYWN0aXZhdGVcIlxyXG4gICAqIEhvd2V2ZXIsIHdlIHNob3VsZCBnaXZlIHRoZW0gYSBzbWFsbCB0b2xlcmFuY2UgYmVmb3JlIGNvbnNpZGVyaW5nIHRoZW0gdG8gaGF2ZSBzdGFydGVkIGRyYWdnaW5nIGVhcmx5LCBhcyBpdCBpcyB2ZXJ5IGVhc3kgdG8gYWNjaWRlbnRhbGx5IG1vdmUgYSBmZXcgcGl4ZWxzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuY2VsRHJhZ0lmVGhyZXNob2xkRXhjZWVkZWQocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKHBpeGVsID4gMykge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FuY2VsRHJhZygpIHtcclxuICAgIHRoaXMuJHRpbWVvdXQuY2FuY2VsKHRoaXMuc3RhcnREcmFnVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERyYWdTdGFydFZhbHVlcygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMubXVsdGlzbGlkZXJDdHJsLmFkanVzdEVuZEZvclZpZXcodGhpcy5zY2hlZHVsZS5lbmQpLFxyXG4gICAgICB2YWx1ZTogdGhpcy5zY2hlZHVsZS52YWx1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG5cclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuICAgIGxldCBkdXJhdGlvbiA9IHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiB1aS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgICAvLyBhZGRpbmcgbmV3IHNsb3QgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuY2FuQWRkID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHRoaXMgcHJldmVudHMgbmctY2xpY2sgZnJvbSBhY2NpZGVudGFsbHkgZmlyaW5nIGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIH0sIDIwMCkudGhlbigoKSA9PiB7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLm1lcmdlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMubXVsdGlzbGlkZXJDdHJsLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG5cclxuICAgIGlmICh0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQpIHtcclxuICAgICAgdGhpcy5yZXNpemVTdGFydCh1aSwgZGVsdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXNpemVFbmQodWksIGRlbHRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVTdGFydChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBzdGFydENoYW5nZWQgPSBzY2hlZHVsZS5zdGFydCAhPT0gbmV3U3RhcnQ7XHJcbiAgICBsZXQgbmV3U3RhcnRCZWZvcmVPckF0RW5kID0gbmV3U3RhcnQgPD0gdGhpcy5tdWx0aXNsaWRlckN0cmwuYWRqdXN0RW5kRm9yVmlldyhzY2hlZHVsZS5lbmQpIC0gMTtcclxuICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0ID0gbmV3U3RhcnQgPj0gMDtcclxuXHJcbiAgICBpZiAoc3RhcnRDaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCAmJiBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcbiAgICBsZXQgZW5kQ2hhbmdlZCA9IHNjaGVkdWxlLmVuZCAhPT0gbmV3RW5kO1xyXG4gICAgbGV0IG5ld0VuZEJlZm9yZU9yQXRFbmQgPSBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICBsZXQgbmV3RW5kQWZ0ZXJPckF0U3RhcnQgPSBuZXdFbmQgPj0gc2NoZWR1bGUuc3RhcnQgKyAxO1xyXG5cclxuICAgIGlmIChlbmRDaGFuZ2VkICYmIG5ld0VuZEFmdGVyT3JBdFN0YXJ0ICYmIG5ld0VuZEJlZm9yZU9yQXRFbmQpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBzdGFydDogc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmQsXHJcbiAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgIHRoaXMuc3RhcnREcmFnVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmNhbkFkZCA9IGZhbHNlO1xyXG4gICAgfSwgNTAwKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVFbmQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlU2VsZih1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGVkaXRTY2hlZHVsZTogJyYnLFxyXG4gICAgcmVtb3ZlU2NoZWR1bGU6ICcmJyxcclxuICAgIHVwZGF0ZVNjaGVkdWxlOiAnJicsXHJcbiAgICBpdGVtOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG11bHRpc2xpZGVyQ3RybDogJ15tdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnem9vbVNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0b3I6IHN0cmluZyA9ICcuc2NoZWR1bGUtYXJlYSc7XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRJbkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludChlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGgsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFpvb21XaWR0aChlbGVtZW50OiBhbnksIHdpZHRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICcxMDAlJyk7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tSW5BQ2VsbChlbGVtZW50OiBhbnksIGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgICAgICAgbGV0IGkgPSBkYXRhLmlkeDtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9EaXNwbGF5ID0gNTtcclxuICAgICAgICBsZXQgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvIGJveGVzVG9EaXNwbGF5O1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb1NraXAgPSAyO1xyXG4gICAgICAgIGxldCBndXR0ZXJTaXplID0gYm94V2lkdGggKiBib3hlc1RvU2tpcDtcclxuXHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBlbGVtZW50Q291bnQgKiBib3hXaWR0aDtcclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJyk7XHJcblxyXG4gICAgICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gaSAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21CeVNjcm9sbChlbGVtZW50OiBhbnksIGV2ZW50OiBXaGVlbEV2ZW50LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRXaWR0aCA9IHRoaXMuZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIChjdXJyZW50V2lkdGggKyAyICogZGVsdGEpICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIiwiY29uc3QgZW51bSBEYXlzIHtcclxuICAgIE1vbmRheSA9IDAsXHJcbiAgICBUdWVzZGF5ID0gMSxcclxuICAgIFdlZG5lc2RheSxcclxuICAgIFRodXJzZGF5LFxyXG4gICAgRnJpZGF5LFxyXG4gICAgU2F0dXJkYXksXHJcbiAgICBTdW5kYXlcclxufVxyXG4iLCIvKipcclxuICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgLyoqIFRyYW5zZm9ybSB0aGUgZGF0YSBoZWxkIHdpdGhpbiB0aGUgY29tcG9uZW50IHRvIHRoZSBmb3JtYXQgeW91IG5lZWQgaXQgb3V0c2lkZSBvZiB0aGUgY29tcG9uZW50LiAqL1xyXG4gICAgZ2V0U25hcHNob3QoKTogVEN1c3RvbVtdO1xyXG5cclxuICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08VFZhbHVlPltdO1xyXG5cclxuICAgIGluaXRpYWxEYXRhOiBUQ3VzdG9tW107XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGRheTogRGF5cztcclxuICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbn1cclxuXHJcbi8qKiBVc2UgdGhpcyBmb3IgcHJvcGVydGllcyB5b3UgbmVlZCBhY2Nlc3MgdG8gYnV0IGRvbid0IHdhbnQgZXhwb3NlZCB0byBjbGllbnRzICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4gZXh0ZW5kcyBJV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG59XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxUPiB7XHJcbiAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgIGNyZWF0ZUl0ZW06IChkYXk6IERheXMsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W10pID0+IElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBBc3NpZ24gbnVsbCBmb3Igbm8gZGVmYXVsdC4gKi9cclxuICAgIGRlZmF1bHRWYWx1ZTogVDtcclxuXHJcbiAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYW4gaXRlbSBpcyBjbGlja2VkIGluIG9yZGVyIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgaXQgKi9cclxuICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+PjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgZnVsbENhbGVuZGFyPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBhIHRpbWUgc2xvdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGJlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbWludXRlcyBsb25nICovXHJcbiAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCB0aGUgY2FsZW5kYXIgd2lsbCBlbmZvcmNlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgcGVyIGl0ZW0gaXMgYWxsb3dlZCAqL1xyXG4gICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgIGludGVydmFsPzogbnVtYmVyO1xyXG59XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAkY2xhc3M/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBjb25zaWRlcmVkIGFjdGl2ZSB0byB0aGUgVUkgKi9cclxuICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUgd2hpbGUgdGhlIHVzZXIgaXMgZWRpdGluZyBhbiBleGlzdGluZyBpdGVtLCBpdCB3aWxsIGJlIHJlbW92ZWQgd2hlbiB0aGUgZWRpdCBwcm9taXNlIGlzIHJlc29sdmVkICovXHJcbiAgICAkaXNEZWxldGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICRpc0VkaXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxuXHJcbiAgICB2YWx1ZTogVDtcclxufVxyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler>Dirty: {{ isDirty }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length) && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot">+</div><weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.hasInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container></div><div class="srow" ng-if="schedulerCtrl.hasInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div></div>');}]);