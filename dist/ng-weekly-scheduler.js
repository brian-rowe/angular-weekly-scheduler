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
                    day: other.day,
                    start: other.start,
                    end: current.start,
                    value: other.value
                });
            }
            // Same if two items are touching & the end of the one on the left moves to the left, leaving a gap
            if (this.adjustEndForView(current.end) < other.start) {
                this.updateSchedule(other, {
                    day: other.day,
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
    function WeeklySchedulerController($element, $scope, groupService, dayMap, scheduleValidatorService) {
        this.$element = $element;
        this.$scope = $scope;
        this.groupService = groupService;
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
        this.items = this.fillItems(this.buildItemsFromAdapter());
        this.updateScheduleValidity();
        this.previousItems = this.items;
        this.watchHoverClass();
    };
    WeeklySchedulerController.prototype.buildItemsFromAdapter = function () {
        var result = [];
        if (this.adapter && this.rangeAdapter) {
            var schedules = this.rangeAdapter.adapt(this.adapter.initialData);
            var groupedSchedules = this.groupService.groupSchedules(schedules);
            for (var key in groupedSchedules) {
                var item = this.createItem(parseInt(key, 10), groupedSchedules[key]);
                result.push(item);
            }
        }
        // keep a reference on the adapter so we can pull it out later
        this.adapter.items = result;
        return result;
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
        'groupService',
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
            options: '=',
            onAdd: '&',
            onChange: '&',
            onDelete: '&',
            rangeAdapter: '<',
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
            day: this.schedule.day,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvZnVsbC1jYWxlbmRhci12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9tYXgtdGltZS1zbG90LXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL292ZXJsYXAtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3Ivc2NoZWR1bGUtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5TWFwLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2VBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMzQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDekQsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFdkIsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxVQUFVLEVB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SUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0gsSUFBSSxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQWxFTSxpQkFBSyxHQUFHLGFBQWEsQ0FBQztJQUV0QixtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFpRXBDLGtCQUFDO0NBcEVELEFBb0VDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnd2Vla2x5U2NoZWR1bGVyJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLmlzRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBkYXk6IGRheSxcclxuICAgICAgICAgICAgICBzY2hlZHVsZXM6IHNjaGVkdWxlc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uKHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLmVuZCArPSAxNTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiBzY2hlZHVsZSwgNDAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnU3VuJyxcclxuICAgICAgICAgIC8vICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMxNSwgZW5kOiAzNzUgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ01vbicsXHJcbiAgICAgICAgICAvLyAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnVHVlJyxcclxuICAgICAgICAgIC8vICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAvLyAgICAgeyBzdGFydDogMCwgZW5kOiAyNDAgfSxcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMzYwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdXZWQnLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAxMjAsIGVuZDogNzIwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdUaHVyJyxcclxuICAgICAgICAgIC8vICAgZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGRheTogRGF5cy5TYXR1cmRheSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzAwLCBlbmQ6IDkwMCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdIGFzIElXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAkc2NvcGUuaXNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKlxyXG4gKiBXZSBzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IHRoZSBzY2hlZHVsZXMgYmVmb3JlaGFuZCwgcGFzcyBqdXN0IHRoZSBzY2hlZHVsZXMgaW4gYW5kIGhhdmUgdGhpcyBwYWNrYWdlIGJ1aWxkIHRoZSBpdGVtc1xyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGluIGNsaWVudHMuXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGxvZGFzaC5ncm91cEJ5IHRvIGtlZXAgdGhlIGZvb3RwcmludCBzbWFsbCBcclxuICovXHJcblxyXG4gY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdncm91cFNlcnZpY2UnO1xyXG5cclxuICAgIGdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSB9ICB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSB9ID0ge307XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSBzY2hlZHVsZXMucmVkdWNlKChyZWR1Y2VyLCBjdXJyZW50U2NoZWR1bGUsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gY3VycmVudFNjaGVkdWxlLmRheTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmVkdWNlcltrZXldKSB7XHJcbiAgICAgICAgICAgICAgICByZWR1Y2VyW2tleV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVkdWNlcltrZXldLnB1c2goY3VycmVudFNjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZWR1Y2VyO1xyXG4gICAgICAgIH0sIHNlZWQpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gfVxyXG5cclxuIGFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShHcm91cFNlcnZpY2UuJG5hbWUsIEdyb3VwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICcmJyxcclxuICAgIG9uZHJhZ3N0b3A6ICcmJyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnJidcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlbW92ZShldmVudCkge1xyXG4gICAgICB2YXIgZGVsdGEgPSBldmVudC5wYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vIFN0cmlwZSBpdCBieSBob3VyXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdtdWx0aVNsaWRlckNvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ211bHRpU2xpZGVyQ3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR3aW5kb3cnLFxyXG4gICAgJ292ZXJsYXBTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXBdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudCwgb3RoZXIpXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG4gIFxyXG4gIHB1YmxpYyBjYW5BZGQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzSG92ZXJpbmdTbG90OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuICBwdWJsaWMgc2l6ZTogbnVtYmVyID0gNjA7IC8vIG1pbnV0ZXNcclxuICBcclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5tZXJnZUFsbE92ZXJsYXBzKCk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVELCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VULCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJHBvc3RMaW5rKCkge1xyXG4gICAgdGhpcy4kaG92ZXJFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KHRoaXMuJGVsZW1lbnQuZmluZCgnZGl2JylbMF0pO1xyXG5cclxuICAgIGlmICh0aGlzLiRob3ZlckVsZW1lbnQubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBlLnBhZ2VYIC0gZWxPZmZYIC0gdGhpcy4kaG92ZXJFbGVtZW50WzBdLmNsaWVudFdpZHRoIC8gMjtcclxuXHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucGl4ZWxUb1ZhbChsZWZ0KTtcclxuXHJcbiAgICAgICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICBsZWZ0OiB0aGlzLmdldFNsb3RMZWZ0KHZhbCksXHJcbiAgICAgICAgICByaWdodDogdGhpcy5nZXRTbG90UmlnaHQodmFsICsgdGhpcy5zaXplKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRTbG90KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgIHN0YXJ0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5kID4gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW07XHJcblxyXG4gICAgaWYgKCFpdGVtLnNjaGVkdWxlcykge1xyXG4gICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzY2hlZHVsZSA9IHtcclxuICAgICAgZGF5OiB0aGlzLml0ZW0uZGF5LFxyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlIFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpKSB7XHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKGVkaXRlZFNjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShlZGl0ZWRTY2hlZHVsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5wdXNoKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2Uoc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkFkZCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZW1lbnRPZmZzZXRYKGVsZW06IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgcmV0dXJuIGVsZW1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRqdXN0RW5kRm9yTW9kZWwoZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChlbmQgPT09IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVuZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiB0aGUgc2NoZWR1bGUgaXMgYWJsZSB0byBiZSBlZGl0ZWRcclxuICAgKi9cclxuICBwcml2YXRlIGNhbkVkaXQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgaXNFZGl0YWJsZSA9ICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCk7XHJcbiAgICBsZXQgaXNOb3RBY3RpdmUgPSAhc2NoZWR1bGUuJGlzQWN0aXZlO1xyXG4gICAgbGV0IGlzTm90RHJhZ2dpbmcgPSAhdGhpcy5pc0RyYWdnaW5nO1xyXG5cclxuICAgIHJldHVybiBpc0VkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbiAmJiBpc05vdEFjdGl2ZSAmJiBpc05vdERyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wZW5zYXRlRm9yQm9yZGVyKGVsZW06IEhUTUxFbGVtZW50LCB2YWw6IG51bWJlcikge1xyXG4gICAgbGV0IGJvcmRlcldpZHRoID0gdGhpcy4kd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXJpZ2h0Jyk7XHJcblxyXG4gICAgLy8gVGhlcmUgYXJlIGRvdWJsZSBib3JkZXJzIGF0IHRoZSBiZWdpbm5pbmdzIGFuZCBlbmRzIG9mIGhvdXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGl0XHJcbiAgICBsZXQgb25Ib3VyID0gdmFsICUgNjAgPT09IDA7XHJcblxyXG4gICAgcmV0dXJuIG9uSG91ciA/IGVsZW0ub2Zmc2V0TGVmdCA6IGVsZW0ub2Zmc2V0TGVmdCAtIHBhcnNlSW50KGJvcmRlcldpZHRoLCAxMCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGFuIGV4dGVybmFsIGFjdGlvbiB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGEgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLmNhbkVkaXQoc2NoZWR1bGUpKSB7XHJcbiAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigobmV3U2NoZWR1bGUpID0+IHtcclxuICAgICAgICBpZiAobmV3U2NoZWR1bGUuJGlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1lcmdlKG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgIC8vIElmIG1lcmdpbmcgbXV0YXRlZCB0aGUgc2NoZWR1bGUgZnVydGhlciwgdGhlbiB1cGRhdGVTY2hlZHVsZSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWRcclxuICAgICAgICAgIC8vIFRoaXMgaXMgc28gdGhhdCBlZGl0cyB0aGF0IGRvbid0IHRyaWdnZXIgbWVyZ2VzIHN0aWxsIHRyaWdnZXIgb25DaGFuZ2UsXHJcbiAgICAgICAgICAvLyBidXQgZWRpdHMgdGhhdCBkbyB0cmlnZ2VyIG1lcmdlcyBkb24ndCB0cmlnZ2VyIGl0IHR3aWNlXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMocHJlbWVyZ2VTY2hlZHVsZSwgbmV3U2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoc2NoZWR1bGUsIG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE92ZXJsYXBTdGF0ZShjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjdXJyZW50LnN0YXJ0LCB0aGlzLmFkanVzdEVuZEZvclZpZXcoY3VycmVudC5lbmQpLCBvdGhlci5zdGFydCwgdGhpcy5hZGp1c3RFbmRGb3JWaWV3KG90aGVyLmVuZCkpO1xyXG5cclxuICAgIHJldHVybiBvdmVybGFwU3RhdGU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBzdGFydCkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JWaWV3KGVuZCk7XHJcblxyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdGhpcy5jb21wZW5zYXRlRm9yQm9yZGVyKHVuZGVybHlpbmdJbnRlcnZhbCwgZW5kKSArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQgKyAncHgnO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSBsZWZ0IG9mIHRoZSBsZWZ0bW9zdCBpbnRlcnZhbCwgc28gcmV0dXJuIHRoYXQgaW5zdGVhZFxyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIGlmICh2YWwgPiByaWdodG1vc3QpIHtcclxuICAgICAgdmFsID0gcmlnaHRtb3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnBhcmVudCgpWzBdLnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICAvLyBIZXJlLCBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgdmFsdWVzIG1hdGNoIC0tIHRoZSBjb3ZlcmluZyBzbG90IGNhbiBhbHdheXMgXCJlYXRcIiB0aGUgb3RoZXIgb25lXHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIC8vIFJlbW92ZSAnb3RoZXInICYgbWFrZSBjdXJyZW50IGV4cGFuZCB0byBmaXQgdGhlIG90aGVyIHNsb3RcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBKdXN0IHJlbW92ZSAnY3VycmVudCdcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShjdXJyZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIC8vIE1vc3Qgb2YgdGhlIHRpbWUgd2Ugd29uJ3Qgd2FudCB0byBkbyBBTllUSElORyBpZiB0aGVyZSBpcyBubyBvdmVybGFwLCBob3dldmVyLi4uXHJcbiAgICBpZiAodGhpcy5jb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgIGxldCBjdXJyZW50SW5kZXggPSB0aGlzLml0ZW0uc2NoZWR1bGVzLmluZGV4T2YoY3VycmVudCk7XHJcbiAgICAgIGxldCBvdGhlckluZGV4ID0gdGhpcy5pdGVtLnNjaGVkdWxlcy5pbmRleE9mKG90aGVyKTtcclxuXHJcbiAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIGl0ZW1zIGFyZW4ndCBjb25zZWN1dGl2ZVxyXG4gICAgICBpZiAoTWF0aC5hYnMoY3VycmVudEluZGV4IC0gb3RoZXJJbmRleCkgIT09IDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdpdGggYSBmdWxsQ2FsZW5kYXIsIGlmIHR3byBpdGVtcyBhcmUgdG91Y2hpbmcgYW5kIHRoZSBzdGFydCBvZiB0aGUgb25lIG9uIHRoZSByaWdodCBtb3ZlcyB0byB0aGUgcmlnaHQsIGxlYXZpbmcgYSBnYXAsIHRoZSBlbmQgb2YgdGhlIGxlZnQgb25lIHNob3VsZCBleHBhbmQgdG8gZmlsbCB0aGUgc3BhY2VcclxuICAgICAgaWYgKHRoaXMuYWRqdXN0RW5kRm9yVmlldyhjdXJyZW50LmVuZCkgPiBvdGhlci5zdGFydCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhbWUgaWYgdHdvIGl0ZW1zIGFyZSB0b3VjaGluZyAmIHRoZSBlbmQgb2YgdGhlIG9uZSBvbiB0aGUgbGVmdCBtb3ZlcyB0byB0aGUgbGVmdCwgbGVhdmluZyBhIGdhcFxyXG4gICAgICBpZiAodGhpcy5hZGp1c3RFbmRGb3JWaWV3KGN1cnJlbnQuZW5kKSA8IG90aGVyLnN0YXJ0KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgdmFsdWU6IGN1cnJlbnQudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgZGF5OiBjdXJyZW50LmRheSxcclxuICAgICAgICBzdGFydDogY3VycmVudC5zdGFydCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKG90aGVyLCB7XHJcbiAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgc3RhcnQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2UgeyBcclxuICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VBbGxPdmVybGFwcygpIHtcclxuICAgIHRoaXMuaXRlbS5zY2hlZHVsZXMuZm9yRWFjaChzID0+IHRoaXMubWVyZ2VPdmVybGFwcyhzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1lcmdlT3ZlcmxhcHMoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwgPT4ge1xyXG4gICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMuZ2V0T3ZlcmxhcFN0YXRlKHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBIYW5kbGVyID0gdGhpcy5vdmVybGFwSGFuZGxlcnNbb3ZlcmxhcFN0YXRlXTtcclxuXHJcbiAgICAgICAgb3ZlcmxhcEhhbmRsZXIoc2NoZWR1bGUsIGVsKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy5jYW5BZGQpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSB0aGlzLmFkanVzdEVuZEZvck1vZGVsKHN0YXJ0ICsgdGhpcy5zaXplKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlTGVhdmUoKSB7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBY3R1YWxseSByZW1vdmUgdGhlIHNjaGVkdWxlIGZyb20gYm90aCB0aGUgc2NyZWVuIGFuZCB0aGUgbW9kZWxcclxuICAgKi9cclxuICBwcml2YXRlIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG5cclxuICAgIC8vdGhpcy5zY2hlZHVsZXJDdHJsLm9uRGVsZXRlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2l6ZSgpIHtcclxuICAgIC8qIFNpbmNlIHdlIGhhdmUgY2hhbmdlZCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgdmlhIHBsYWluIGpzICtcclxuICAgICAqIHRoZSBuZy1zdHlsZXMgZm9yIHRoZSBpbmRpdmlkdWFsIHNsb3RzIGFyZSBjb21wdXRlZCBpbiB0aGlzIGNvbnRyb2xsZXIsXHJcbiAgICAgKiB3ZSBtdXN0IGNhbGwgJGFwcGx5KCkgbWFudWFsbHkgc28gdGhleSB3aWxsIGFsbCB1cGRhdGUgdGhlaXIgcG9zaXRpb25zIHRvIG1hdGNoIHRoZSB6b29tIGxldmVsXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tbWl0IG5ldyB2YWx1ZXMgdG8gdGhlIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHNjaGVkdWxlLnN0YXJ0ID0gdXBkYXRlLnN0YXJ0O1xyXG4gICAgc2NoZWR1bGUuZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JNb2RlbCh1cGRhdGUuZW5kKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2Uoe1xyXG4gICAgICBpdGVtSW5kZXg6IHRoaXMuaW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlSW5kZXg6IHRoaXMuaXRlbS5zY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksXHJcbiAgICAgIHNjaGVkdWxlVmFsdWU6IHNjaGVkdWxlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzTWF0Y2goc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHJldHVybiBzY2hlZHVsZS52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRqdXN0RW5kRm9yVmlldyhlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKGVuZCA9PT0gMCkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZW5kO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gV2UgY29uc2lkZXIgdGhlIHNjaGVkdWxlIHdlIHdlcmUgd29ya2luZyB3aXRoIHRvIGJlIHRoZSBtb3N0IGltcG9ydGFudCwgc28gaGFuZGxlIGl0cyBvdmVybGFwcyBmaXJzdC5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcyhzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdtdWx0aVNsaWRlcic7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGl0ZW06ICc9JyxcclxuICAgIGluZGV4OiAnPCcsXHJcbiAgICBzaXplOiAnPD8nXHJcbiAgfVxyXG5cclxuICBjb250cm9sbGVyID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ153ZWVrbHlTY2hlZHVsZXInXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdvdmVybGFwU2VydmljZSc7XHJcblxyXG4gICAgZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCwgb3RoZXJTdGFydCwgb3RoZXJFbmQpOiBPdmVybGFwU3RhdGUge1xyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA+PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJTdGFydCA8IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID09PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA9PT0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5Ob092ZXJsYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwU2VydmljZS4kbmFtZSwgT3ZlcmxhcFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc2l6ZVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3Jlc2l6ZVNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckcm9vdFNjb3BlJyxcclxuICAgICAgICAnJHdpbmRvdydcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgJHdpbmRvdzogYW5ndWxhci5JV2luZG93U2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4kd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFJlc2l6ZVNlcnZpY2UuJG5hbWUsIFJlc2l6ZVNlcnZpY2UpXHJcbiAgICAucnVuKFtSZXNpemVTZXJ2aWNlLiRuYW1lLCAocmVzaXplU2VydmljZTogUmVzaXplU2VydmljZSkgPT4gcmVzaXplU2VydmljZS5pbml0aWFsaXplKCldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50JyxcclxuICAgICAgICAnJHNjb3BlJyxcclxuICAgICAgICAnc2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ3pvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdmdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdoZW4gdGhpcyBvcHRpb24gaXMgdHJ1ZSB3ZSBzaG91bGQgZW5mb3JjZSB0aGF0IHRoZXJlIGFyZSBubyBnYXBzIGluIHRoZSBzY2hlZHVsZXNcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSB0d28gYXQgYSB0aW1lIHVudGlsIHRoZSBlbmQ7XHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBmaXJzdCBpdGVtIGxhbmRzIGF0IDBcclxuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgY3VycmVudC5zdGFydCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBsYXN0IGl0ZW0gbGFuZHMgYXQgbWF4VmFsdWVcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxlbiAtIDEgJiYgKG5leHQuZW5kIHx8IGNvbmZpZy5tYXhWYWx1ZSkgIT09IGNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgY3VycmVudC5lbmQgPT09IG5leHQuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdtYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIG1heFRpbWVTbG90OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIW1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXMuc29tZShzID0+IHMuZW5kIC0gcy5zdGFydCA+IG1heFRpbWVTbG90KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnb3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdvdmVybGFwU2VydmljZSdcclxuICAgIF07XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIG1heFZhbHVlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZhbHVlc01hdGNoID0gY3VycmVudC52YWx1ZSA9PT0gbmV4dC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjdXJyZW50LnN0YXJ0LCBjdXJyZW50LmVuZCB8fCBtYXhWYWx1ZSwgbmV4dC5zdGFydCwgbmV4dC5lbmQgfHwgbWF4VmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwLCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZCwgT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2Z1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdtYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdvdmVybGFwVmFsaWRhdG9yU2VydmljZSdcclxuICAgIF1cclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZTogRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZTogTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFZhbGlkYXRvclNlcnZpY2U6IE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXJlU2NoZWR1bGVzVmFsaWQoaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMubWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcubWF4VGltZVNsb3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5mdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5vdmVybGFwVmFsaWRhdG9yU2VydmljZS52YWxpZGF0ZShpdGVtLnNjaGVkdWxlcywgY29uZmlnLm1heFZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY3JvbGxTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3RpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdNaW51dGVzID0gKG1pbnV0ZXMgLSAoaG91cnMgKiA2MCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGhvdXJzID4gMTEgJiYgaG91cnMgPCAyNCA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdNaW51dGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRpc3BsYXlIb3VycyA9IGhvdXJzICUgMTIgfHwgMTI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9JHttZXJpZGllbX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdncm91cFNlcnZpY2UnLFxyXG4gICAgJ2RheU1hcCcsXHJcbiAgICAnc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBncm91cFNlcnZpY2U6IEdyb3VwU2VydmljZSxcclxuICAgIHByaXZhdGUgZGF5TWFwOiB7IFtrZXk6IG51bWJlcl06IHN0cmluZyB9LFxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGFwdGVyOiBJV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcbiAgcHJpdmF0ZSByYW5nZUFkYXB0ZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZUFkYXB0ZXI8YW55LCBhbnk+O1xyXG5cclxuICAvKiBXZSBuZWVkIHRvIG1vZGlmeSB0aGUgaXRlbXMgdGhhdCBhcmUgYmVpbmcgd2F0Y2hlZCBpbnNpZGUgdGhlIHdhdGNoZXIsIHNvIHdlJ2xsIGhhdmUgdG8gY2FuY2VsIGFuZCByZWFkZCB0aGUgd2F0Y2hlciB0byBwcmV2ZW50IGluZmRpZyAqL1xyXG4gIHByaXZhdGUgaXRlbXNXYXRjaGVyQ2FuY2VsbGVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlOiBib29sZWFuO1xyXG4gIHB1YmxpYyBob3ZlckNsYXNzOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PlxyXG4gIHB1YmxpYyBpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcbiAgcHVibGljIHByZXZpb3VzSXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+O1xyXG5cclxuICBwdWJsaWMgb25BZGQ6ICgpID0+IHZvaWQ7XHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG4gIHB1YmxpYyBvbkRlbGV0ZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+ID0ge1xyXG4gICAgY3JlYXRlSXRlbTogKGRheSwgc2NoZWR1bGVzKSA9PiB7IHJldHVybiB7IGRheTogZGF5LCBzY2hlZHVsZXM6IHNjaGVkdWxlcyB9IH0sXHJcbiAgICBkZWZhdWx0VmFsdWU6IG51bGwsXHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgJGRvQ2hlY2soKSB7XHJcbiAgICAvLyBDaGVjayBmb3IgcmVmZXJlbmNlIGVxdWFsaXR5LCBub3Qgb2JqZWN0IGVxdWFsaXR5LlxyXG4gICAgLy8gVGhpcyBzaG91bGQgb25seSByZXJ1biBpZiB0aGUgd2hvbGUgc2V0IG9mIGl0ZW1zIGlzIHJlcGxhY2VkIG9uIHRoZSBjbGllbnQuXHJcbiAgICBpZih0aGlzLml0ZW1zICE9PSB0aGlzLnByZXZpb3VzSXRlbXMpIHtcclxuICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuZmlsbEl0ZW1zKHRoaXMuaXRlbXMpO1xyXG4gICAgICB0aGlzLnByZXZpb3VzSXRlbXMgPSB0aGlzLml0ZW1zO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuY29uZmlnID0gdGhpcy5jb25maWd1cmUodGhpcy5vcHRpb25zKTtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyh0aGlzLmJ1aWxkSXRlbXNGcm9tQWRhcHRlcigpKTtcclxuICAgIHRoaXMudXBkYXRlU2NoZWR1bGVWYWxpZGl0eSgpO1xyXG5cclxuICAgIHRoaXMucHJldmlvdXNJdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdO1xyXG4gICAgXHJcbiAgICBpZiAodGhpcy5hZGFwdGVyICYmIHRoaXMucmFuZ2VBZGFwdGVyKSB7XHJcbiAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLnJhbmdlQWRhcHRlci5hZGFwdCh0aGlzLmFkYXB0ZXIuaW5pdGlhbERhdGEpO1xyXG4gICAgICBsZXQgZ3JvdXBlZFNjaGVkdWxlcyA9IHRoaXMuZ3JvdXBTZXJ2aWNlLmdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcblxyXG4gICAgICBmb3IgKGxldCBrZXkgaW4gZ3JvdXBlZFNjaGVkdWxlcykge1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5jcmVhdGVJdGVtKHBhcnNlSW50KGtleSwgMTApLCBncm91cGVkU2NoZWR1bGVzW2tleV0pO1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBhZGFwdGVyIHNvIHdlIGNhbiBwdWxsIGl0IG91dCBsYXRlclxyXG4gICAgdGhpcy5hZGFwdGVyLml0ZW1zID0gcmVzdWx0O1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNoZWNrU2NoZWR1bGVWYWxpZGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLml0ZW1zLnNvbWUoaXRlbSA9PiAhdGhpcy5zY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuYXJlU2NoZWR1bGVzVmFsaWQoaXRlbSwgdGhpcy5jb25maWcpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4ge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciByZXN1bHQ6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHtcclxuICAgICAgY3JlYXRlSXRlbTogb3B0aW9ucy5jcmVhdGVJdGVtLFxyXG4gICAgICBlZGl0U2xvdDogb3B0aW9ucy5lZGl0U2xvdCxcclxuICAgICAgZnVsbENhbGVuZGFyOiBvcHRpb25zLmZ1bGxDYWxlbmRhcixcclxuICAgICAgaW50ZXJ2YWw6IGludGVydmFsLFxyXG4gICAgICBtYXhWYWx1ZTogbWludXRlc0luRGF5LFxyXG4gICAgICBob3VyQ291bnQ6IGhvdXJzSW5EYXksXHJcbiAgICAgIGludGVydmFsQ291bnQ6IGludGVydmFsQ291bnRcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUl0ZW0oZGF5OiBudW1iZXIsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAgIGxldCBidWlsZGVyOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+ID0gdGhpcy5jb25maWcuY3JlYXRlSXRlbShkYXksIHNjaGVkdWxlcyk7XHJcblxyXG4gICAgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQoYnVpbGRlciwgeyBsYWJlbDogdGhpcy5kYXlNYXBbZGF5XSB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNjaGVkdWxlciBzaG91bGQgYWx3YXlzIHNob3cgYWxsIGRheXMsIGV2ZW4gaWYgaXQgd2FzIG5vdCBwYXNzZWQgYW55IHNjaGVkdWxlcyBmb3IgdGhhdCBkYXlcclxuICAgKi9cclxuICBwcml2YXRlIGZpbGxJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZGF5TWFwLCAoZGF5OiBzdHJpbmcsIHN0cmluZ0tleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgbGV0IGl0ZW06IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoID8gZmlsdGVyZWRJdGVtc1swXSA6IG51bGw7XHJcblxyXG4gICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNyZWF0ZUl0ZW0oa2V5LCBbXSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB3YXRjaEhvdmVyQ2xhc3MoKSB7XHJcbiAgICBjb25zdCBwdWxzZUNsYXNzID0gJ3B1bHNlJztcclxuICAgIGNvbnN0IHB1bHNlU2VsZWN0b3IgPSBgLiR7cHVsc2VDbGFzc31gO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmhvdmVyQ2xhc3MsICgpID0+IHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5maW5kKHB1bHNlU2VsZWN0b3IpLnJlbW92ZUNsYXNzKHB1bHNlQ2xhc3MpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuaG92ZXJDbGFzcykge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5ob3ZlckNsYXNzfWApLmFkZENsYXNzKHB1bHNlQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTY2hlZHVsZVZhbGlkaXR5KCkge1xyXG4gICAgdGhpcy5oYXNJbnZhbGlkU2NoZWR1bGUgPSB0aGlzLmNoZWNrU2NoZWR1bGVWYWxpZGl0eSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBhZGFwdGVyOiAnPCcsXHJcbiAgICBob3ZlckNsYXNzOiAnPCcsXHJcbiAgICBvcHRpb25zOiAnPScsXHJcbiAgICBvbkFkZDogJyYnLFxyXG4gICAgb25DaGFuZ2U6ICcmJyxcclxuICAgIG9uRGVsZXRlOiAnJicsXHJcbiAgICByYW5nZUFkYXB0ZXI6ICc8JyxcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQWhoYWhoYWhoISBGaWdodGVyIG9mIHRoZSBOaWdodE1hcCEgKi9cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBEYXlNYXAge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2RheU1hcCc7XHJcbiAgICBcclxuICAgIHN0YXRpYyB2YWx1ZSA9IHtcclxuICAgICAgICAwOiAnTW9uJyxcclxuICAgICAgICAxOiAnVHVlJyxcclxuICAgICAgICAyOiAnV2VkJyxcclxuICAgICAgICAzOiAnVGh1cicsXHJcbiAgICAgICAgNDogJ0ZyaScsXHJcbiAgICAgICAgNTogJ1NhdCcsXHJcbiAgICAgICAgNjogJ1N1bicgXHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoRGF5TWFwLiRuYW1lLCBEYXlNYXAudmFsdWUpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHRpbWVvdXQnLFxyXG4gICAgJ292ZXJsYXBTZXJ2aWNlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbXVsdGlzbGlkZXJDdHJsOiBNdWx0aVNsaWRlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+fSkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlbW92ZVNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZSxcclxuICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXZSB3YW50IHRvIGNhbmNlbCB0aGUgZHJhZyBvcGVyYXRpb24gaWYgdGhlIHVzZXIgaXMganVzdCBjbGlja2luZyBvbiB0aGUgaXRlbSBvciBoYXMgc3RhcnRlZCBkcmFnZ2luZyB3aXRob3V0IHdhaXRpbmcgZm9yIHRoZSBkcmFnIHRvIFwiYWN0aXZhdGVcIlxyXG4gICAqIEhvd2V2ZXIsIHdlIHNob3VsZCBnaXZlIHRoZW0gYSBzbWFsbCB0b2xlcmFuY2UgYmVmb3JlIGNvbnNpZGVyaW5nIHRoZW0gdG8gaGF2ZSBzdGFydGVkIGRyYWdnaW5nIGVhcmx5LCBhcyBpdCBpcyB2ZXJ5IGVhc3kgdG8gYWNjaWRlbnRhbGx5IG1vdmUgYSBmZXcgcGl4ZWxzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuY2VsRHJhZ0lmVGhyZXNob2xkRXhjZWVkZWQocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKHBpeGVsID4gMykge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2FuY2VsRHJhZygpIHtcclxuICAgIHRoaXMuJHRpbWVvdXQuY2FuY2VsKHRoaXMuc3RhcnREcmFnVGltZW91dCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldERyYWdTdGFydFZhbHVlcygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRheTogdGhpcy5zY2hlZHVsZS5kYXksXHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMubXVsdGlzbGlkZXJDdHJsLmFkanVzdEVuZEZvclZpZXcodGhpcy5zY2hlZHVsZS5lbmQpLFxyXG4gICAgICB2YWx1ZTogdGhpcy5zY2hlZHVsZS52YWx1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG5cclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuICAgIGxldCBkdXJhdGlvbiA9IHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiB1aS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiB1aS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgICAvLyBhZGRpbmcgbmV3IHNsb3QgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuY2FuQWRkID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHRoaXMgcHJldmVudHMgbmctY2xpY2sgZnJvbSBhY2NpZGVudGFsbHkgZmlyaW5nIGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIH0sIDIwMCkudGhlbigoKSA9PiB7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLm1lcmdlKHRoaXMuc2NoZWR1bGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMubXVsdGlzbGlkZXJDdHJsLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG5cclxuICAgIGlmICh0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQpIHtcclxuICAgICAgdGhpcy5yZXNpemVTdGFydCh1aSwgZGVsdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXNpemVFbmQodWksIGRlbHRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemVTdGFydChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBzdGFydENoYW5nZWQgPSBzY2hlZHVsZS5zdGFydCAhPT0gbmV3U3RhcnQ7XHJcbiAgICBsZXQgbmV3U3RhcnRCZWZvcmVPckF0RW5kID0gbmV3U3RhcnQgPD0gdGhpcy5tdWx0aXNsaWRlckN0cmwuYWRqdXN0RW5kRm9yVmlldyhzY2hlZHVsZS5lbmQpIC0gMTtcclxuICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0ID0gbmV3U3RhcnQgPj0gMDtcclxuXHJcbiAgICBpZiAoc3RhcnRDaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCAmJiBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcbiAgICBsZXQgZW5kQ2hhbmdlZCA9IHNjaGVkdWxlLmVuZCAhPT0gbmV3RW5kO1xyXG4gICAgbGV0IG5ld0VuZEJlZm9yZU9yQXRFbmQgPSBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICBsZXQgbmV3RW5kQWZ0ZXJPckF0U3RhcnQgPSBuZXdFbmQgPj0gc2NoZWR1bGUuc3RhcnQgKyAxO1xyXG5cclxuICAgIGlmIChlbmRDaGFuZ2VkICYmIG5ld0VuZEFmdGVyT3JBdFN0YXJ0ICYmIG5ld0VuZEJlZm9yZU9yQXRFbmQpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBkYXk6IHNjaGVkdWxlLmRheSxcclxuICAgICAgICBzdGFydDogc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmQsXHJcbiAgICAgICAgdmFsdWU6IHNjaGVkdWxlLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgIHRoaXMuc3RhcnREcmFnVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmNhbkFkZCA9IGZhbHNlO1xyXG4gICAgfSwgNTAwKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZVN0YXJ0KCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVFbmQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RhcnREcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlU2VsZih1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGVkaXRTY2hlZHVsZTogJyYnLFxyXG4gICAgcmVtb3ZlU2NoZWR1bGU6ICcmJyxcclxuICAgIHVwZGF0ZVNjaGVkdWxlOiAnJicsXHJcbiAgICBpdGVtOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIG11bHRpc2xpZGVyQ3RybDogJ15tdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnem9vbVNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcm9vdFNjb3BlJ107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0b3I6IHN0cmluZyA9ICcuc2NoZWR1bGUtYXJlYSc7XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRJbkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludChlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGgsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFpvb21XaWR0aChlbGVtZW50OiBhbnksIHdpZHRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICcxMDAlJyk7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tSW5BQ2VsbChlbGVtZW50OiBhbnksIGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgICAgICAgbGV0IGkgPSBkYXRhLmlkeDtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9EaXNwbGF5ID0gNTtcclxuICAgICAgICBsZXQgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvIGJveGVzVG9EaXNwbGF5O1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb1NraXAgPSAyO1xyXG4gICAgICAgIGxldCBndXR0ZXJTaXplID0gYm94V2lkdGggKiBib3hlc1RvU2tpcDtcclxuXHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBlbGVtZW50Q291bnQgKiBib3hXaWR0aDtcclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ID0gKHNjaGVkdWxlQXJlYVdpZHRoUHggLyBjb250YWluZXJXaWR0aCkgKiAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJyk7XHJcblxyXG4gICAgICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gaSAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21CeVNjcm9sbChlbGVtZW50OiBhbnksIGV2ZW50OiBXaGVlbEV2ZW50LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRXaWR0aCA9IHRoaXMuZ2V0Q3VycmVudFpvb21XaWR0aChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIChjdXJyZW50V2lkdGggKyAyICogZGVsdGEpICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoWm9vbVNlcnZpY2UuJG5hbWUsIFpvb21TZXJ2aWNlKTtcclxuIiwiY29uc3QgZW51bSBEYXlzIHtcclxuICAgIE1vbmRheSA9IDAsXHJcbiAgICBUdWVzZGF5ID0gMSxcclxuICAgIFdlZG5lc2RheSxcclxuICAgIFRodXJzZGF5LFxyXG4gICAgRnJpZGF5LFxyXG4gICAgU2F0dXJkYXksXHJcbiAgICBTdW5kYXlcclxufVxyXG4iLCIvKipcclxuICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgLyoqIFRyYW5zZm9ybSB0aGUgZGF0YSBoZWxkIHdpdGhpbiB0aGUgY29tcG9uZW50IHRvIHRoZSBmb3JtYXQgeW91IG5lZWQgaXQgb3V0c2lkZSBvZiB0aGUgY29tcG9uZW50LiAqL1xyXG4gICAgZ2V0U25hcHNob3QoKTogVEN1c3RvbVtdO1xyXG5cclxuICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08VFZhbHVlPltdO1xyXG5cclxuICAgIGluaXRpYWxEYXRhOiBUQ3VzdG9tW107XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGRheTogRGF5cztcclxuICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbn1cclxuXHJcbi8qKiBVc2UgdGhpcyBmb3IgcHJvcGVydGllcyB5b3UgbmVlZCBhY2Nlc3MgdG8gYnV0IGRvbid0IHdhbnQgZXhwb3NlZCB0byBjbGllbnRzICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4gZXh0ZW5kcyBJV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG59XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxUPiB7XHJcbiAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgIGNyZWF0ZUl0ZW06IChkYXk6IERheXMsIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W10pID0+IElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBBc3NpZ24gbnVsbCBmb3Igbm8gZGVmYXVsdC4gKi9cclxuICAgIGRlZmF1bHRWYWx1ZTogVDtcclxuXHJcbiAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYW4gaXRlbSBpcyBjbGlja2VkIGluIG9yZGVyIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgaXQgKi9cclxuICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+PjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgZnVsbENhbGVuZGFyPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBhIHRpbWUgc2xvdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGJlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbWludXRlcyBsb25nICovXHJcbiAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCB0aGUgY2FsZW5kYXIgd2lsbCBlbmZvcmNlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgcGVyIGl0ZW0gaXMgYWxsb3dlZCAqL1xyXG4gICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgIGludGVydmFsPzogbnVtYmVyO1xyXG59XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4ge1xyXG4gICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAkY2xhc3M/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBjb25zaWRlcmVkIGFjdGl2ZSB0byB0aGUgVUkgKi9cclxuICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUgd2hpbGUgdGhlIHVzZXIgaXMgZWRpdGluZyBhbiBleGlzdGluZyBpdGVtLCBpdCB3aWxsIGJlIHJlbW92ZWQgd2hlbiB0aGUgZWRpdCBwcm9taXNlIGlzIHJlc29sdmVkICovXHJcbiAgICAkaXNEZWxldGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICRpc0VkaXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBOb3Qgc3RyaWN0bHkgbmVjZXNzYXJ5IGJ1dCBtYWtlcyB0aGluZ3MgYSB3aG9vb2xlIGxvdCBlYXNpZXIgKi9cclxuICAgIGRheTogRGF5cztcclxuXHJcbiAgICBzdGFydDogbnVtYmVyO1xyXG4gICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgdmFsdWU6IFQ7XHJcbn1cclxuIiwiLyoqIENvbnZlcnRzIGN1c3RvbSBtb2RlbCB0byBXZWVrbHlTY2hlZHVsZXJSYW5nZSAqL1xyXG5pbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlQWRhcHRlcjxUQ3VzdG9tLCBUUmFuZ2U+IHtcclxuICAgIGFkYXB0KGN1c3RvbTogVEN1c3RvbVtdKTogSVdlZWtseVNjaGVkdWxlclJhbmdlPFRSYW5nZT5bXTtcclxufVxyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler>Dirty: {{ isDirty }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length) && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot">+</div><weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.hasInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container></div><div class="srow" ng-if="schedulerCtrl.hasInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div></div>');}]);