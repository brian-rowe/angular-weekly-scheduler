angular.module('demoApp', ['weeklyScheduler'])
    .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {
        $scope.isDirty = false;
        $scope.model = {
            options: {
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
                    label: 'Fri',
                    defaultValue: false,
                    schedules: [
                        { start: 720, end: 900, value: false },
                        { start: 915, end: 960, value: false }
                    ]
                },
                {
                    defaultValue: false,
                    label: 'Sat',
                    schedules: [
                        { start: 720, end: 900, value: false },
                        { start: 930, end: 960, value: false }
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
            value: item.defaultValue
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
                    // but don't trigger it twice
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
    function WeeklySchedulerController($element, $scope, scheduleValidatorService) {
        this.$element = $element;
        this.$scope = $scope;
        this.scheduleValidatorService = scheduleValidatorService;
        this.defaultOptions = {
            monoSchedule: false
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        var _this = this;
        this.config = this.configure(this.options);
        this.updateScheduleValidity();
        /**
         * Watch the model items
         */
        this.$scope.$watchCollection(function () { return _this.items; }, function (newItems) { return _this.onModelChange(newItems); });
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
            editSlot: options.editSlot,
            fullCalendar: options.fullCalendar,
            interval: interval,
            maxValue: minutesInDay,
            hourCount: hoursInDay,
            intervalCount: intervalCount
        });
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
        }
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
        'scheduleValidatorService'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvb3ZlcmxhcC9vdmVybGFwLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvcmVzaXplLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9mdWxsLWNhbGVuZGFyLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21heC10aW1lLXNsb3QtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3Ivb3ZlcmxhcC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9zY3JvbGwtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvdGltZS1vZi1kYXkudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3pvb20vem9vbS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckl0ZW0udHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyT3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDM0MsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNO0lBQ3pELFVBQVUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJO1FBRTlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBRXZCLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLFVBQVMsUUFBUTtvQkFDekIsUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7b0JBRW5CLE9BQU8sUUFBUSxDQUFDLGNBQU0sT0FBQSxRQUFRLEVBQVIsQ0FBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2FBQ0Y7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSTtnQkFDSixrQkFBa0I7Z0JBQ2xCLHVCQUF1QjtnQkFDdkIsaUJBQWlCO2dCQUNqQiwrQkFBK0I7Z0JBQy9CLE1BQU07Z0JBQ04sS0FBSztnQkFDTCxJQUFJO2dCQUNKLGtCQUFrQjtnQkFDbEIsdUJBQXVCO2dCQUN2QixpQkFBaUI7Z0JBQ2pCLGdDQUFnQztnQkFDaEMsTUFBTTtnQkFDTixLQUFLO2dCQUNM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LENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFsRU0saUJBQUssR0FBRyxhQUFhLENBQUM7SUFFdEIsbUJBQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBaUVwQyxrQkFBQztDQXBFRCxBQW9FQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUN6QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ3dlZWtseVNjaGVkdWxlciddKVxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5pc0RpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uKHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLmVuZCArPSAxNTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiBzY2hlZHVsZSwgNDAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnU3VuJyxcclxuICAgICAgICAgIC8vICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMxNSwgZW5kOiAzNzUgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ01vbicsXHJcbiAgICAgICAgICAvLyAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnVHVlJyxcclxuICAgICAgICAgIC8vICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAvLyAgICAgeyBzdGFydDogMCwgZW5kOiAyNDAgfSxcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMzYwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdXZWQnLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAxMjAsIGVuZDogNzIwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdUaHVyJyxcclxuICAgICAgICAgIC8vICAgZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnRnJpJyxcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogNzIwLCBlbmQ6IDkwMCwgdmFsdWU6IGZhbHNlIH0sXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogOTE1LCBlbmQ6IDk2MCwgdmFsdWU6IGZhbHNlIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGFiZWw6ICdTYXQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiA3MjAsIGVuZDogOTAwLCB2YWx1ZTogZmFsc2UgfSxcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiA5MzAsIGVuZDogOTYwLCB2YWx1ZTogZmFsc2UgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAkc2NvcGUuaXNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICcmJyxcclxuICAgIG9uZHJhZ3N0b3A6ICcmJyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnJidcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlbW92ZShldmVudCkge1xyXG4gICAgICB2YXIgZGVsdGEgPSBldmVudC5wYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBTdHJpcGUgaXQgYnkgaG91clxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3N0cmlwZWQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IDYwIC8gY29uZmlnLmludGVydmFsO1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWxQZXJjZW50YWdlID0gMTAwIC8gbnVtSW50ZXJ2YWxzSW5UaWNrO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1JbnRlcnZhbHNJblRpY2s7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyYW5kQ2hpbGQgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckd2luZG93JyxcclxuICAgICdvdmVybGFwU2VydmljZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgJHdpbmRvdzogYW5ndWxhci5JV2luZG93U2VydmljZSxcclxuICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgcHJpdmF0ZSBpbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIG92ZXJsYXBIYW5kbGVyczogeyBba2V5OiBudW1iZXJdOiAoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4gdm9pZDsgfSA9IHtcclxuICAgIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU5vT3ZlcmxhcChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyXTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50XTogKGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQsIG90aGVyKVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuICBcclxuICBwdWJsaWMgY2FuQWRkOiBib29sZWFuID0gdHJ1ZTtcclxuICBwdWJsaWMgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0hvdmVyaW5nU2xvdDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBwdWJsaWMgZWxlbWVudDogRWxlbWVudDtcclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG4gIHB1YmxpYyBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+O1xyXG4gIHB1YmxpYyBzaXplOiBudW1iZXIgPSA2MDsgLy8gbWludXRlc1xyXG4gIFxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcblxyXG4gICAgaWYgKHRoaXMuJGhvdmVyRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgICB2YXIgbGVmdCA9IGUucGFnZVggLSBlbE9mZlggLSB0aGlzLiRob3ZlckVsZW1lbnRbMF0uY2xpZW50V2lkdGggLyAyO1xyXG5cclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5waXhlbFRvVmFsKGxlZnQpO1xyXG5cclxuICAgICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgIGxlZnQ6IHRoaXMuZ2V0U2xvdExlZnQodmFsKSxcclxuICAgICAgICAgIHJpZ2h0OiB0aGlzLmdldFNsb3RSaWdodCh2YWwgKyB0aGlzLnNpemUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmQgPiB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbTtcclxuXHJcbiAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlID0ge1xyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogaXRlbS5kZWZhdWx0VmFsdWVcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KSkge1xyXG4gICAgICB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChlZGl0ZWRTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWRkU2NoZWR1bGVUb0l0ZW0oZWRpdGVkU2NoZWR1bGUpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkU2NoZWR1bGVUb0l0ZW0oc2NoZWR1bGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXRlbS5zY2hlZHVsZXMucHVzaChzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlKHNjaGVkdWxlKTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25BZGQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtZW50T2Zmc2V0WChlbGVtOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgIHJldHVybiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkanVzdEVuZEZvck1vZGVsKGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoZW5kID09PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbmQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIHNjaGVkdWxlIGlzIGFibGUgdG8gYmUgZWRpdGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5FZGl0KHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgbGV0IGlzRWRpdGFibGUgPSAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5pdGVtLmVkaXRhYmxlKSB8fCB0aGlzLml0ZW0uZWRpdGFibGU7XHJcbiAgICBsZXQgaGFzRWRpdEZ1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpO1xyXG4gICAgbGV0IGlzTm90QWN0aXZlID0gIXNjaGVkdWxlLiRpc0FjdGl2ZTtcclxuICAgIGxldCBpc05vdERyYWdnaW5nID0gIXRoaXMuaXNEcmFnZ2luZztcclxuXHJcbiAgICByZXR1cm4gaXNFZGl0YWJsZSAmJiBoYXNFZGl0RnVuY3Rpb24gJiYgaXNOb3RBY3RpdmUgJiYgaXNOb3REcmFnZ2luZztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcGVuc2F0ZUZvckJvcmRlcihlbGVtOiBIVE1MRWxlbWVudCwgdmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBib3JkZXJXaWR0aCA9IHRoaXMuJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pLmdldFByb3BlcnR5VmFsdWUoJ2JvcmRlci1yaWdodCcpO1xyXG5cclxuICAgIC8vIFRoZXJlIGFyZSBkb3VibGUgYm9yZGVycyBhdCB0aGUgYmVnaW5uaW5ncyBhbmQgZW5kcyBvZiBob3Vycywgc28gd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCBpdFxyXG4gICAgbGV0IG9uSG91ciA9IHZhbCAlIDYwID09PSAwO1xyXG5cclxuICAgIHJldHVybiBvbkhvdXIgPyBlbGVtLm9mZnNldExlZnQgOiBlbGVtLm9mZnNldExlZnQgLSBwYXJzZUludChib3JkZXJXaWR0aCwgMTApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybSBhbiBleHRlcm5hbCBhY3Rpb24gdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBhIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5jYW5FZGl0KHNjaGVkdWxlKSkge1xyXG4gICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKG5ld1NjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld1NjaGVkdWxlLiRpc0RlbGV0aW5nKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsZXQgcHJlbWVyZ2VTY2hlZHVsZSA9IGFuZ3VsYXIuY29weShuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5tZXJnZShuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAvLyBJZiBtZXJnaW5nIG11dGF0ZWQgdGhlIHNjaGVkdWxlIGZ1cnRoZXIsIHRoZW4gdXBkYXRlU2NoZWR1bGUgd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHNvIHRoYXQgZWRpdHMgdGhhdCBkb24ndCB0cmlnZ2VyIG1lcmdlcyBzdGlsbCB0cmlnZ2VyIG9uQ2hhbmdlLFxyXG4gICAgICAgICAgLy8gYnV0IGRvbid0IHRyaWdnZXIgaXQgdHdpY2VcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhwcmVtZXJnZVNjaGVkdWxlLCBuZXdTY2hlZHVsZSkpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShzY2hlZHVsZSwgbmV3U2NoZWR1bGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBPdmVybGFwU3RhdGUge1xyXG4gICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQuc3RhcnQsIHRoaXMuYWRqdXN0RW5kRm9yVmlldyhjdXJyZW50LmVuZCksIG90aGVyLnN0YXJ0LCB0aGlzLmFkanVzdEVuZEZvclZpZXcob3RoZXIuZW5kKSk7XHJcblxyXG4gICAgcmV0dXJuIG92ZXJsYXBTdGF0ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIHN0YXJ0KSArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gQW4gZW5kIG9mIDAgc2hvdWxkIGRpc3BsYXkgYWxsbGwgdGhlIHdheSB0byB0aGUgcmlnaHQsIHVwIHRvIHRoZSBlZGdlXHJcbiAgICBlbmQgPSB0aGlzLmFkanVzdEVuZEZvclZpZXcoZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBlbmQpICsgdW5kZXJseWluZ0ludGVydmFsLm9mZnNldFdpZHRoO1xyXG4gICAgbGV0IGNvbnRhaW5lckxlZnQgPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xyXG5cclxuICAgIHJldHVybiBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodCArICdweCc7XHJcbiAgfVxyXG4gIFxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHZhbDogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xyXG4gICAgLy8gU2xpZ2h0bHkgaGFja3kgYnV0IGRvZXMgdGhlIGpvYi4gVE9ETyA/XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIGxlZnQgb2YgdGhlIGxlZnRtb3N0IGludGVydmFsLCBzbyByZXR1cm4gdGhhdCBpbnN0ZWFkXHJcbiAgICBpZiAodmFsIDwgMCkge1xyXG4gICAgICB2YWwgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSByaWdodCBvZiB0aGUgcmlnaHRtb3N0IGludGVydmFsIC0tIHRoZSBsYXN0IGludGVydmFsIHdpbGwgbm90IGFjdHVhbGx5IHJlbmRlciB3aXRoIGEgXCJyZWxcIiB2YWx1ZVxyXG4gICAgbGV0IHJpZ2h0bW9zdCA9IHRoaXMuY29uZmlnLm1heFZhbHVlIC0gdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcblxyXG4gICAgaWYgKHZhbCA+IHJpZ2h0bW9zdCkge1xyXG4gICAgICB2YWwgPSByaWdodG1vc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQucGFyZW50KClbMF0ucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIC8vIEhlcmUsIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHRoZSB2YWx1ZXMgbWF0Y2ggLS0gdGhlIGNvdmVyaW5nIHNsb3QgY2FuIGFsd2F5cyBcImVhdFwiIHRoZSBvdGhlciBvbmVcclxuICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgLy8gUmVtb3ZlICdvdGhlcicgJiBtYWtlIGN1cnJlbnQgZXhwYW5kIHRvIGZpdCB0aGUgb3RoZXIgc2xvdFxyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBKdXN0IHJlbW92ZSAnY3VycmVudCdcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShjdXJyZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTm9PdmVybGFwKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIC8vIE1vc3Qgb2YgdGhlIHRpbWUgd2Ugd29uJ3Qgd2FudCB0byBkbyBBTllUSElORyBpZiB0aGVyZSBpcyBubyBvdmVybGFwLCBob3dldmVyLi4uXHJcbiAgICBpZiAodGhpcy5jb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgIGxldCBjdXJyZW50SW5kZXggPSB0aGlzLml0ZW0uc2NoZWR1bGVzLmluZGV4T2YoY3VycmVudCk7XHJcbiAgICAgIGxldCBvdGhlckluZGV4ID0gdGhpcy5pdGVtLnNjaGVkdWxlcy5pbmRleE9mKG90aGVyKTtcclxuXHJcbiAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIGl0ZW1zIGFyZW4ndCBjb25zZWN1dGl2ZVxyXG4gICAgICBpZiAoTWF0aC5hYnMoY3VycmVudEluZGV4IC0gb3RoZXJJbmRleCkgIT09IDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdpdGggYSBmdWxsQ2FsZW5kYXIsIGlmIHR3byBpdGVtcyBhcmUgdG91Y2hpbmcgYW5kIHRoZSBzdGFydCBvZiB0aGUgb25lIG9uIHRoZSByaWdodCBtb3ZlcyB0byB0aGUgcmlnaHQsIGxlYXZpbmcgYSBnYXAsIHRoZSBlbmQgb2YgdGhlIGxlZnQgb25lIHNob3VsZCBleHBhbmQgdG8gZmlsbCB0aGUgc3BhY2VcclxuICAgICAgaWYgKHRoaXMuYWRqdXN0RW5kRm9yVmlldyhjdXJyZW50LmVuZCkgPiBvdGhlci5zdGFydCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICAgIGVuZDogY3VycmVudC5zdGFydCxcclxuICAgICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYW1lIGlmIHR3byBpdGVtcyBhcmUgdG91Y2hpbmcgJiB0aGUgZW5kIG9mIHRoZSBvbmUgb24gdGhlIGxlZnQgbW92ZXMgdG8gdGhlIGxlZnQsIGxlYXZpbmcgYSBnYXBcclxuICAgICAgaWYgKHRoaXMuYWRqdXN0RW5kRm9yVmlldyhjdXJyZW50LmVuZCkgPCBvdGhlci5zdGFydCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICAgIHN0YXJ0OiBjdXJyZW50LmVuZCxcclxuICAgICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgdmFsdWU6IGN1cnJlbnQudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LmVuZCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoY3VycmVudCwgb3RoZXIpO1xyXG4gICAgfSBlbHNlIHsgXHJcbiAgICAgIC8vIERPIE5PVEhJTkcsIHRoaXMgaXMgb2theSBpZiB0aGUgdmFsdWVzIGRvbid0IG1hdGNoXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1lcmdlQWxsT3ZlcmxhcHMoKSB7XHJcbiAgICB0aGlzLml0ZW0uc2NoZWR1bGVzLmZvckVhY2gocyA9PiB0aGlzLm1lcmdlT3ZlcmxhcHMocykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZU92ZXJsYXBzKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLmZvckVhY2goKGVsID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLmdldE92ZXJsYXBTdGF0ZShzY2hlZHVsZSwgZWwpO1xyXG4gICAgICAgIGxldCBvdmVybGFwSGFuZGxlciA9IHRoaXMub3ZlcmxhcEhhbmRsZXJzW292ZXJsYXBTdGF0ZV07XHJcblxyXG4gICAgICAgIG92ZXJsYXBIYW5kbGVyKHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25Ib3ZlckVsZW1lbnRDbGljayhldmVudCkge1xyXG4gICAgaWYgKHRoaXMuY2FuQWRkKSB7XHJcbiAgICAgIHZhciBlbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgICB2YXIgaG92ZXJFbE9mZlggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGhvdmVyRWxlbWVudCkgLSBlbE9mZlg7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnBpeGVsVG9WYWwoaG92ZXJFbE9mZlgpO1xyXG4gICAgICB2YXIgZW5kID0gdGhpcy5hZGp1c3RFbmRGb3JNb2RlbChzdGFydCArIHRoaXMuc2l6ZSk7XHJcblxyXG4gICAgICB0aGlzLmFkZFNsb3Qoc3RhcnQsIGVuZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlT3ZlcigpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0dWFsbHkgcmVtb3ZlIHRoZSBzY2hlZHVsZSBmcm9tIGJvdGggdGhlIHNjcmVlbiBhbmQgdGhlIG1vZGVsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLCAxKTtcclxuXHJcbiAgICAvL3RoaXMuc2NoZWR1bGVyQ3RybC5vbkRlbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNpemUoKSB7XHJcbiAgICAvKiBTaW5jZSB3ZSBoYXZlIGNoYW5nZWQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50IHZpYSBwbGFpbiBqcyArXHJcbiAgICAgKiB0aGUgbmctc3R5bGVzIGZvciB0aGUgaW5kaXZpZHVhbCBzbG90cyBhcmUgY29tcHV0ZWQgaW4gdGhpcyBjb250cm9sbGVyLFxyXG4gICAgICogd2UgbXVzdCBjYWxsICRhcHBseSgpIG1hbnVhbGx5IHNvIHRoZXkgd2lsbCBhbGwgdXBkYXRlIHRoZWlyIHBvc2l0aW9ucyB0byBtYXRjaCB0aGUgem9vbSBsZXZlbFxyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbW1pdCBuZXcgdmFsdWVzIHRvIHRoZSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlU2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBzY2hlZHVsZS5zdGFydCA9IHVwZGF0ZS5zdGFydDtcclxuICAgIHNjaGVkdWxlLmVuZCA9IHRoaXMuYWRqdXN0RW5kRm9yTW9kZWwodXBkYXRlLmVuZCk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZXJDdHJsLm9uQ2hhbmdlKHtcclxuICAgICAgaXRlbUluZGV4OiB0aGlzLmluZGV4LFxyXG4gICAgICBzY2hlZHVsZUluZGV4OiB0aGlzLml0ZW0uc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLFxyXG4gICAgICBzY2hlZHVsZVZhbHVlOiBzY2hlZHVsZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZhbHVlc01hdGNoKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICByZXR1cm4gc2NoZWR1bGUudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkanVzdEVuZEZvclZpZXcoZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVuZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtZXJnZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzY2hlZHVsZSB3ZSB3ZXJlIHdvcmtpbmcgd2l0aCB0byBiZSB0aGUgbW9zdCBpbXBvcnRhbnQsIHNvIGhhbmRsZSBpdHMgb3ZlcmxhcHMgZmlyc3QuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoc2NoZWR1bGUpO1xyXG4gICAgdGhpcy5tZXJnZUFsbE92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXInO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBpdGVtOiAnPScsXHJcbiAgICBpbmRleDogJzwnLFxyXG4gICAgc2l6ZTogJzw/J1xyXG4gIH1cclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIHNjaGVkdWxlckN0cmw6ICded2Vla2x5U2NoZWR1bGVyJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnb3ZlcmxhcFNlcnZpY2UnO1xyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG90aGVyU3RhcnQsIG90aGVyRW5kKTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBpZiAob3RoZXJFbmQgPj0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbmQgPj0gb3RoZXJFbmQgJiYgY3VycmVudFN0YXJ0IDw9IG90aGVyU3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPiBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPj0gY3VycmVudFN0YXJ0ICYmIG90aGVyU3RhcnQgPCBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA9PT0gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPT09IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuTm9PdmVybGFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFNlcnZpY2UuJG5hbWUsIE92ZXJsYXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdyZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJHJvb3RTY29wZScsXHJcbiAgICAgICAgJyR3aW5kb3cnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShSZXNpemVTZXJ2aWNlLiRuYW1lLCBSZXNpemVTZXJ2aWNlKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZS4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IFJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ3Njcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgICBwcml2YXRlIHNjcm9sbFNlcnZpY2U6IFNjcm9sbFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRwb3N0TGluaygpIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07IC8vIGdyYWIgcGxhaW4ganMsIG5vdCBqcWxpdGVcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxTZXJ2aWNlLmhpamFja1Njcm9sbChlbGVtZW50LCAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZDtcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBjdXJyZW50LnN0YXJ0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGxhc3QgaXRlbSBsYW5kcyBhdCBtYXhWYWx1ZVxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGVuIC0gMSAmJiAobmV4dC5lbmQgfHwgY29uZmlnLm1heFZhbHVlKSAhPT0gY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBjdXJyZW50LmVuZCA9PT0gbmV4dC5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ21heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgbWF4VGltZVNsb3Q6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy5lbmQgLSBzLnN0YXJ0ID4gbWF4VGltZVNsb3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdvdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ292ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgbWF4VmFsdWU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGN1cnJlbnQuc3RhcnQsIGN1cnJlbnQuZW5kIHx8IG1heFZhbHVlLCBuZXh0LnN0YXJ0LCBuZXh0LmVuZCB8fCBtYXhWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ21heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ292ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlJ1xyXG4gICAgXVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBmdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlOiBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlOiBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwVmFsaWRhdG9yU2VydmljZTogT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhcmVTY2hlZHVsZXNWYWxpZChpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMubWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcubWF4VGltZVNsb3QpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5mdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5vdmVybGFwVmFsaWRhdG9yU2VydmljZS52YWxpZGF0ZShpdGVtLnNjaGVkdWxlcywgY29uZmlnLm1heFZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY3JvbGxTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3RpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdNaW51dGVzID0gKG1pbnV0ZXMgLSAoaG91cnMgKiA2MCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGhvdXJzID4gMTEgJiYgaG91cnMgPCAyNCA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdNaW51dGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRpc3BsYXlIb3VycyA9IGhvdXJzICUgMTIgfHwgMTI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9JHttZXJpZGllbX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdzY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlOiBib29sZWFuO1xyXG4gIHB1YmxpYyBob3ZlckNsYXNzOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zO1xyXG5cclxuICBwdWJsaWMgb25BZGQ6ICgpID0+IHZvaWQ7XHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG4gIHB1YmxpYyBvbkRlbGV0ZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucyA9IHtcclxuICAgIG1vbm9TY2hlZHVsZTogZmFsc2VcclxuICB9O1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyZSh0aGlzLm9wdGlvbnMpO1xyXG4gICAgdGhpcy51cGRhdGVTY2hlZHVsZVZhbGlkaXR5KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgbW9kZWwgaXRlbXNcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiB0aGlzLml0ZW1zLCAobmV3SXRlbXMpID0+IHRoaXMub25Nb2RlbENoYW5nZShuZXdJdGVtcykpO1xyXG5cclxuICAgIHRoaXMud2F0Y2hIb3ZlckNsYXNzKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNoZWNrU2NoZWR1bGVWYWxpZGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLml0ZW1zLnNvbWUoaXRlbSA9PiAhdGhpcy5zY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuYXJlU2NoZWR1bGVzVmFsaWQoaXRlbSwgdGhpcy5jb25maWcpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zKTogSVdlZWtseVNjaGVkdWxlckNvbmZpZyB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHJlc3VsdDogSVdlZWtseVNjaGVkdWxlckNvbmZpZyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHtcclxuICAgICAgZWRpdFNsb3Q6IG9wdGlvbnMuZWRpdFNsb3QsXHJcbiAgICAgIGZ1bGxDYWxlbmRhcjogb3B0aW9ucy5mdWxsQ2FsZW5kYXIsXHJcbiAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vZGVsQ2hhbmdlKGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+W10pIHtcclxuICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBwcmVzZW50XHJcbiAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBpbiBhbiBBcnJheVxyXG4gICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShpdGVtcykpIHtcclxuICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygb3VyIG1vZGVsICh1c2UgaXQgaW4gdGVtcGxhdGUpXHJcbiAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAgIC8vIElmIGluIG11bHRpU2xpZGVyIG1vZGUsIGVuc3VyZSBhIHNjaGVkdWxlIGFycmF5IGlzIHByZXNlbnQgb24gZWFjaCBpdGVtXHJcbiAgICAgIC8vIEVsc2Ugb25seSB1c2UgZmlyc3QgZWxlbWVudCBvZiBzY2hlZHVsZSBhcnJheVxyXG4gICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBpZiAoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW3NjaGVkdWxlc1swXV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlU2NoZWR1bGVWYWxpZGl0eSgpIHtcclxuICAgIHRoaXMuaGFzSW52YWxpZFNjaGVkdWxlID0gdGhpcy5jaGVja1NjaGVkdWxlVmFsaWRpdHkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgaXRlbXM6ICc9JyxcclxuICAgIG9wdGlvbnM6ICc9JyxcclxuICAgIG9uQWRkOiAnJicsXHJcbiAgICBvbkNoYW5nZTogJyYnLFxyXG4gICAgb25EZWxldGU6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdENvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3dlZWtseVNsb3RDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckdGltZW91dCcsXHJcbiAgICAnb3ZlcmxhcFNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBtdWx0aXNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgdXBkYXRlU2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pn0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcblxyXG4gIHByaXZhdGUgcmVzaXplRGlyZWN0aW9uSXNTdGFydDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIHN0YXJ0RHJhZ1RpbWVvdXQ6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD47XHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2Ugd2FudCB0byBjYW5jZWwgdGhlIGRyYWcgb3BlcmF0aW9uIGlmIHRoZSB1c2VyIGlzIGp1c3QgY2xpY2tpbmcgb24gdGhlIGl0ZW0gb3IgaGFzIHN0YXJ0ZWQgZHJhZ2dpbmcgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgZHJhZyB0byBcImFjdGl2YXRlXCJcclxuICAgKiBIb3dldmVyLCB3ZSBzaG91bGQgZ2l2ZSB0aGVtIGEgc21hbGwgdG9sZXJhbmNlIGJlZm9yZSBjb25zaWRlcmluZyB0aGVtIHRvIGhhdmUgc3RhcnRlZCBkcmFnZ2luZyBlYXJseSwgYXMgaXQgaXMgdmVyeSBlYXN5IHRvIGFjY2lkZW50YWxseSBtb3ZlIGEgZmV3IHBpeGVscy5cclxuICAgKi9cclxuICBwcml2YXRlIGNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmIChwaXhlbCA+IDMpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbmNlbERyYWcoKSB7XHJcbiAgICB0aGlzLiR0aW1lb3V0LmNhbmNlbCh0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnU3RhcnRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLm11bHRpc2xpZGVyQ3RybC5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuZW5kKSxcclxuICAgICAgdmFsdWU6IHRoaXMuc2NoZWR1bGUudmFsdWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG5cclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcclxuICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmNhbkFkZCA9IHRydWU7XHJcblxyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIG5nLWNsaWNrIGZyb20gYWNjaWRlbnRhbGx5IGZpcmluZyBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LCAyMDApLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5tZXJnZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZShwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAoIXRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZ0lmVGhyZXNob2xkRXhjZWVkZWQocGl4ZWwpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICBcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgIHRoaXMucmVzaXplU3RhcnQodWksIGRlbHRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzaXplRW5kKHVpLCBkZWx0YSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplU3RhcnQoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgc3RhcnRDaGFuZ2VkID0gc2NoZWR1bGUuc3RhcnQgIT09IG5ld1N0YXJ0O1xyXG4gICAgbGV0IG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCA9IG5ld1N0YXJ0IDw9IHRoaXMubXVsdGlzbGlkZXJDdHJsLmFkanVzdEVuZEZvclZpZXcoc2NoZWR1bGUuZW5kKSAtIDE7XHJcbiAgICBsZXQgbmV3U3RhcnRBZnRlck9yQXRTdGFydCA9IG5ld1N0YXJ0ID49IDA7XHJcblxyXG4gICAgaWYgKHN0YXJ0Q2hhbmdlZCAmJiBuZXdTdGFydEJlZm9yZU9yQXRFbmQgJiYgbmV3U3RhcnRBZnRlck9yQXRTdGFydCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IHNjaGVkdWxlLmVuZCxcclxuICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZUVuZChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG4gICAgbGV0IGVuZENoYW5nZWQgPSBzY2hlZHVsZS5lbmQgIT09IG5ld0VuZDtcclxuICAgIGxldCBuZXdFbmRCZWZvcmVPckF0RW5kID0gbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgbGV0IG5ld0VuZEFmdGVyT3JBdFN0YXJ0ID0gbmV3RW5kID49IHNjaGVkdWxlLnN0YXJ0ICsgMTtcclxuXHJcbiAgICBpZiAoZW5kQ2hhbmdlZCAmJiBuZXdFbmRBZnRlck9yQXRTdGFydCAmJiBuZXdFbmRCZWZvcmVPckF0RW5kKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy51cGRhdGVTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlLCB1cGRhdGU6IHVwZGF0ZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIHJlbW92ZVNjaGVkdWxlOiAnJicsXHJcbiAgICB1cGRhdGVTY2hlZHVsZTogJyYnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdebXVsdGlTbGlkZXInXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC5odG1sJztcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNsb3RDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgWm9vbVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3pvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudDogYW55KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUluQUNlbGwoZWxlbWVudDogYW55LCBldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgZWxlbWVudENvdW50ID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gICAgICAgIGxldCBpID0gZGF0YS5pZHg7XHJcblxyXG4gICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvRGlzcGxheSA9IDU7XHJcbiAgICAgICAgbGV0IGJveFdpZHRoID0gY29udGFpbmVyV2lkdGggLyBib3hlc1RvRGlzcGxheTtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9Ta2lwID0gMjtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoICogYm94ZXNUb1NraXA7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJScpO1xyXG5cclxuICAgICAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tQnlTY3JvbGwoZWxlbWVudDogYW55LCBldmVudDogV2hlZWxFdmVudCwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSB0aGlzLmdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFpvb21TZXJ2aWNlLiRuYW1lLCBab29tU2VydmljZSk7XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBkZWZhdWx0VmFsdWU6IFQ7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXTtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlck9wdGlvbnMge1xyXG4gICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZCBpbiBvcmRlciB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGl0ICovXHJcbiAgICBlZGl0U2xvdD86IChzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4+O1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIEFMTCBzbG90cyBpbiB0aGUgY2FsZW5kYXIgbXVzdCBiZSBmaWxsZWQgaW4gb3JkZXIgZm9yIGl0IHRvIGJlIHZhbGlkICovXHJcbiAgICBmdWxsQ2FsZW5kYXI/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgIG1heFRpbWVTbG90PzogbnVtYmVyO1xyXG5cclxuICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICBtb25vU2NoZWR1bGU/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKiBUaGUgbnVtYmVyIG9mIG1pbnV0ZXMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgaW50ZXJ2YWw/OiBudW1iZXI7XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAvKiogQSBjc3MgY2xhc3MgdG8gYXBwbHkgKi9cclxuICAgICRjbGFzcz86IHN0cmluZztcclxuXHJcbiAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgJGlzQWN0aXZlPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogSWYgdGhpcyBpcyBzZXQgdG8gdHJ1ZSB3aGlsZSB0aGUgdXNlciBpcyBlZGl0aW5nIGFuIGV4aXN0aW5nIGl0ZW0sIGl0IHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHRoZSBlZGl0IHByb21pc2UgaXMgcmVzb2x2ZWQgKi9cclxuICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGJlaW5nIGVkaXRlZCBieSB0aGUgdXNlciAqL1xyXG4gICAgJGlzRWRpdGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgc3RhcnQ6IG51bWJlcjtcclxuICAgIGVuZDogbnVtYmVyO1xyXG5cclxuICAgIHZhbHVlOiBUO1xyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler>Dirty: {{ isDirty }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length) && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot">+</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="[schedule.$class, {\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 pending: schedule.$isEditing\r\n             }]" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.hasInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container></div><div class="srow" ng-if="schedulerCtrl.hasInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div></div>');}]);