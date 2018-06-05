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
                    return $timeout(function () { return schedule; }, 0);
                },
                interval: 1,
                onChange: function (isValid) {
                    $scope.isDirty = true;
                    $scope.isValid = isValid;
                    console.log('The model has changed!');
                }
            }
        };
        $scope.model2 = angular.copy($scope.model);
        $scope.model2.options.interval = 15;
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
        $scope.adapterTwo = new DemoAdapter(JSON.parse('[{"$class":"Unoccupied","day":3,"start":0,"end":135,"value":"Unoccupied"},{"$class":"Setpointd0f1df","day":3,"start":135,"end":195,"value":"Setpointd0f1df"},{"$class":"Unoccupied","day":3,"start":195,"end":225,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":225,"end":270,"value":"Unoccupied"},{"$class":"Setpointd0f1df","day":3,"start":270,"end":330,"value":"Setpointd0f1df"},{"$class":"Setpointd0f1df","day":3,"start":330,"end":360,"value":"Setpointd0f1df"},{"$class":"Setpointd0f1df","day":3,"start":360,"end":510,"value":"Setpointd0f1df"},{"$class":"Unoccupied","day":3,"start":510,"end":585,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":585,"end":630,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":630,"end":675,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":675,"end":690,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":690,"end":810,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":810,"end":0,"value":"Unoccupied"}]'));
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
/** @internal */
var GhostSlotController = /** @class */ (function () {
    function GhostSlotController($element, $timeout) {
        this.$element = $element;
        this.$timeout = $timeout;
        this.isDragging = false;
    }
    GhostSlotController.prototype.$postLink = function () {
        this.$element.addClass('slot');
        this.multiSliderCtrl.$hoverElement = this.$element;
    };
    GhostSlotController.prototype.drag = function (event) {
        if (this.isDragging) {
            this.multiSliderCtrl.adjustGhost(event);
        }
    };
    GhostSlotController.prototype.startDrag = function () {
        var _this = this;
        // Delay start of drag
        this.dragTimeout = this.$timeout(function () {
            _this.isDragging = true;
            _this.$element.addClass('active');
        }, 250);
    };
    GhostSlotController.prototype.stopDrag = function () {
        // Cancel timeout if applicable
        this.$timeout.cancel(this.dragTimeout);
        this.isDragging = false;
        this.$element.removeClass('active');
        this.multiSliderCtrl.onHoverElementClick();
    };
    GhostSlotController.$name = 'brGhostSlotController';
    GhostSlotController.$controllerAs = 'ghostSlotCtrl';
    GhostSlotController.$inject = [
        '$element',
        '$timeout'
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
        this.template = "\n        <div br-handle\n             ondragstart=\"ghostSlotCtrl.startDrag()\"\n             ondrag=\"ghostSlotCtrl.drag(event)\"\n             ondragstop=\"ghostSlotCtrl.stopDrag()\"\n        >\n        +\n        </div>\n    ";
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
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $q, endAdjusterService, nullEndWidth, overlapService) {
        var _this = this;
        this.$element = $element;
        this.$q = $q;
        this.endAdjusterService = endAdjusterService;
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
        this.isAdding = false;
        this.isDragging = false;
        this.isHoveringSlot = false;
        this.element = this.$element[0];
        var _a;
    }
    MultiSliderController.prototype.$onInit = function () {
        this.mergeAllOverlaps();
    };
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        if (this.$hoverElement.length) {
            this.element.addEventListener('mousemove', function (e) {
                var primary = 1;
                var defaultSize = 60;
                // must use 'buttons' not 'button'
                var isDragging = e.buttons === primary;
                var val = _this.getGhostLeftVal(e);
                if (!isDragging) {
                    var updatedLeft = _this.getSlotLeft(val);
                    var updatedRight = _this.config.nullEnds ? _this.getSlotRight(val, val + _this.nullEndWidth) : _this.getSlotRight(val, val + defaultSize);
                    _this.$hoverElement.css({
                        left: updatedLeft,
                        right: updatedRight
                    });
                }
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
        // Sanity check -- don't add a slot with an end before the start
        if (end <= start) {
            return this.$q.when();
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
    /** Expand ghost while dragging in it */
    MultiSliderController.prototype.adjustGhost = function (event) {
        var currentLeftVal = this.getGhostLeftVal(event);
        // Make right edge adjust to new mouse position
        var updatedRightVal = this.pixelToVal(event.pageX);
        var updatedRightPx = this.getSlotRight(currentLeftVal, updatedRightVal);
        // Lock left edge in place, only update right
        this.$hoverElement.css({
            right: updatedRightPx
        });
    };
    MultiSliderController.prototype.setDirty = function () {
        this.schedulerCtrl.dirty = true;
    };
    MultiSliderController.prototype.addScheduleToItem = function (schedule) {
        this.item.addSchedule(schedule);
        this.merge(schedule);
        this.setDirty();
    };
    MultiSliderController.prototype.getElementOffsetX = function (elem) {
        return elem[0].getBoundingClientRect().left;
    };
    MultiSliderController.prototype.onHoverElementClick = function () {
        var _this = this;
        if (this.canAdd) {
            var elementOffsetX = this.getElementOffsetX(this.$element);
            var hoverElementOffsetX = this.getElementOffsetX(this.$hoverElement) - elementOffsetX;
            var start = this.pixelToVal(hoverElementOffsetX);
            var width = this.pixelToVal(this.$hoverElement[0].clientWidth);
            var end = this.config.nullEnds ? null : this.endAdjusterService.adjustEndForModel(this.config, start + width);
            this.isAdding = true;
            this.addSlot(start, end).then(function () {
                _this.schedulerCtrl.onChange();
                _this.isAdding = false;
            });
        }
    };
    /**
     * Determine if the schedule is able to be edited
     */
    MultiSliderController.prototype.canEdit = function (schedule) {
        var isEditable = this.item.isEditable();
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
            return this.item.hasNoSchedules();
        }
        if (!this.item.isEditable()) {
            return false;
        }
        if (this.isAdding) {
            return false;
        }
        if (this.isDragging) {
            return false;
        }
        if (this.isHoveringSlot) {
            return false;
        }
        return true;
    };
    MultiSliderController.prototype.getGhostLeftPixel = function (event) {
        var elementOffsetX = this.getElementOffsetX(this.$element);
        var left = event.pageX - elementOffsetX - 4; // give a little tolerance to make sure the mouse pointer is always inside the ghost
        return left;
    };
    MultiSliderController.prototype.getGhostLeftVal = function (event) {
        return this.pixelToVal(this.getGhostLeftPixel(event));
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
                    // If merging mutated the schedule further, then schedulerCtrl.updateSchedule would have already been called
                    // This is so that edits that don't trigger merges still trigger onChange,
                    // but edits that do trigger merges don't trigger it twice
                    if (angular.equals(premergeSchedule, newSchedule)) {
                        _this.schedulerCtrl.updateSchedule(schedule, newSchedule);
                    }
                }
            }).finally(function () {
                _this.setDirty();
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
        var containerLeft = this.getElementOffsetX(this.$element);
        var containerRight = this.$element[0].getBoundingClientRect().right;
        var result = containerRight - containerLeft - offsetRight;
        return result + 'px';
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
            this.schedulerCtrl.updateSchedule(current, {
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
            this.schedulerCtrl.updateSchedule(current, {
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        }
        else {
            this.schedulerCtrl.updateSchedule(other, {
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
            this.schedulerCtrl.updateSchedule(current, {
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            this.schedulerCtrl.updateSchedule(other, {
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
        do {
            this.item.schedules.forEach(function (s) { return _this.mergeOverlaps(s); });
        } while (this.item.needsOverlapsMerged());
    };
    MultiSliderController.prototype.mergeOverlaps = function (schedule) {
        var _this = this;
        var schedules = this.item.schedules;
        schedules.forEach((function (el) {
            if (el !== schedule) {
                var overlapState = _this.overlapService.getOverlapState(_this.config, schedule, el);
                var overlapHandler = _this.overlapHandlers[overlapState];
                overlapHandler(schedule, el);
            }
        }));
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
        this.item.removeSchedule(schedule);
        this.setDirty();
    };
    MultiSliderController.prototype.valuesMatch = function (schedule, other) {
        return schedule.value === other.value;
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
        'brWeeklySchedulerEndAdjusterService',
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
            item: '='
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
    function WeeklySchedulerController($element, $q, $scope, groupService, dayMap, endAdjusterService, overlapService, scheduleValidatorService) {
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.groupService = groupService;
        this.dayMap = dayMap;
        this.endAdjusterService = endAdjusterService;
        this.overlapService = overlapService;
        this.scheduleValidatorService = scheduleValidatorService;
        this.defaultOptions = {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            monoSchedule: false,
            onChange: function (isValid) { return angular.noop(); }
        };
    }
    WeeklySchedulerController.prototype.$doCheck = function () {
        this.validationErrors = this.getValidationErrors();
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
    WeeklySchedulerController.prototype.onChange = function () {
        this.config.onChange(!this.hasInvalidSchedule());
    };
    /**
     * Commit new values to the schedule
     */
    WeeklySchedulerController.prototype.updateSchedule = function (schedule, update) {
        schedule.start = update.start;
        schedule.end = this.endAdjusterService.adjustEndForModel(this.config, update.end);
        this.onChange();
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
        return new WeeklySchedulerItem(this.config, result, this.overlapService);
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
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerOverlapService',
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
/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
var WeeklySchedulerItem = /** @class */ (function () {
    function WeeklySchedulerItem(config, item, overlapService) {
        this.config = config;
        this.item = item;
        this.overlapService = overlapService;
        this.day = item.day;
        this.editable = item.editable;
        this.label = item.label;
        this.schedules = item.schedules;
    }
    WeeklySchedulerItem.prototype.schedulesHaveMatchingValues = function (schedule, other) {
        return schedule.value === other.value;
    };
    WeeklySchedulerItem.prototype.addSchedule = function (schedule) {
        this.schedules.push(schedule);
    };
    WeeklySchedulerItem.prototype.hasNoSchedules = function () {
        return this.schedules.length === 0;
    };
    WeeklySchedulerItem.prototype.isEditable = function () {
        return !angular.isDefined(this.editable) || this.editable;
    };
    WeeklySchedulerItem.prototype.needsOverlapsMerged = function () {
    };
    WeeklySchedulerItem.prototype.removeSchedule = function (schedule) {
        var schedules = this.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
    };
    return WeeklySchedulerItem;
}());
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
    function WeeklySlotController($timeout, endAdjusterService, nullEndWidth) {
        this.$timeout = $timeout;
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
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
            end: this.config.nullEnds ?
                this.endAdjusterService.adjustEndForView(this.config, this.schedule.start + this.nullEndWidth) :
                this.endAdjusterService.adjustEndForView(this.config, this.schedule.end),
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
        var newStartBeforeOrAtEnd = newStart <= this.endAdjusterService.adjustEndForView(this.config, schedule.end) - 1;
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
        '$timeout',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth'
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
            updateSchedule: '&'
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VuZC1hZGp1c3Rlci9lbmQtYWRqdXN0ZXItc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dob3N0LXNsb3QvZ2hvc3Qtc2xvdC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy1jb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9mdWxsLWNhbGVuZGFyLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21heC10aW1lLXNsb3QtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvbW9uby1zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9udWxsLWVuZC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9vdmVybGFwLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL3NjaGVkdWxlLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2Nyb2xsL3Njcm9sbC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9taW51dGVzLWFzLXRleHQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS90aW1lLXJhbmdlLWNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvTnVsbEVuZFdpZHRoLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZVByb3ZpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5cy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJBZGFwdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyT3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDOUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTTtJQUMvRCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFdkIsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPO3dCQUNMLEdBQUcsRUFBRSxHQUFHO3dCQUNSLFNBQVMsRUFBRSxTQUFTO3FCQUNyQixDQUFBO2dCQUNILENBQUM7Z0JBQ0QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFFBQVEsRUFBRSxVQUFVLFFBQVE7b0JBQzFCLE9BQU8sUUFBUSxDQUFDLGNBQU0sT0FBQSxRQUFRLEVBQVIsQ0FBUSxFQUFFLENB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LENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWydici53ZWVrbHlTY2hlZHVsZXInXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRxJywgJyRzY29wZScsICckdGltZW91dCcsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkcSwgJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLmlzRGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBidXR0b25DbGFzc2VzOiBbJ3dvdyEnXSxcclxuICAgICAgICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGRheTogZGF5LFxyXG4gICAgICAgICAgICAgIHNjaGVkdWxlczogc2NoZWR1bGVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICAgICAgICBlZGl0U2xvdDogZnVuY3Rpb24gKHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiBzY2hlZHVsZSwgMCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaW50ZXJ2YWw6IDEsXHJcbiAgICAgICAgICBvbkNoYW5nZTogKGlzVmFsaWQpID0+IHtcclxuICAgICAgICAgICAgJHNjb3BlLmlzRGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNWYWxpZCA9IGlzVmFsaWQ7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIG1vZGVsIGhhcyBjaGFuZ2VkIScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gYXMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT5cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsMiA9IGFuZ3VsYXIuY29weSgkc2NvcGUubW9kZWwpO1xyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMuaW50ZXJ2YWwgPSAxNTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICAvLyB7XHJcbiAgICAgICAgLy8gICBkYXk6IERheXMuU2F0dXJkYXksXHJcbiAgICAgICAgLy8gICBzdGFydDogMTM4MCxcclxuICAgICAgICAvLyAgIGVuZDogbnVsbCxcclxuICAgICAgICAvLyAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA2MDAsXHJcbiAgICAgICAgICBlbmQ6IDkwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLk1vbmRheSxcclxuICAgICAgICAgIHN0YXJ0OiA3MjAsXHJcbiAgICAgICAgICBlbmQ6IDEwMjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDYwLFxyXG4gICAgICAgICAgZW5kOiAxODAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMzAsXHJcbiAgICAgICAgICBlbmQ6IDMwMCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLkZyaWRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiA2MCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyVHdvID0gbmV3IERlbW9BZGFwdGVyKEpTT04ucGFyc2UoJ1t7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjAsXCJlbmRcIjoxMzUsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlNldHBvaW50ZDBmMWRmXCIsXCJkYXlcIjozLFwic3RhcnRcIjoxMzUsXCJlbmRcIjoxOTUsXCJ2YWx1ZVwiOlwiU2V0cG9pbnRkMGYxZGZcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjoxOTUsXCJlbmRcIjoyMjUsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjIyNSxcImVuZFwiOjI3MCxcInZhbHVlXCI6XCJVbm9jY3VwaWVkXCJ9LHtcIiRjbGFzc1wiOlwiU2V0cG9pbnRkMGYxZGZcIixcImRheVwiOjMsXCJzdGFydFwiOjI3MCxcImVuZFwiOjMzMCxcInZhbHVlXCI6XCJTZXRwb2ludGQwZjFkZlwifSx7XCIkY2xhc3NcIjpcIlNldHBvaW50ZDBmMWRmXCIsXCJkYXlcIjozLFwic3RhcnRcIjozMzAsXCJlbmRcIjozNjAsXCJ2YWx1ZVwiOlwiU2V0cG9pbnRkMGYxZGZcIn0se1wiJGNsYXNzXCI6XCJTZXRwb2ludGQwZjFkZlwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6MzYwLFwiZW5kXCI6NTEwLFwidmFsdWVcIjpcIlNldHBvaW50ZDBmMWRmXCJ9LHtcIiRjbGFzc1wiOlwiVW5vY2N1cGllZFwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6NTEwLFwiZW5kXCI6NTg1LFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjo1ODUsXCJlbmRcIjo2MzAsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjYzMCxcImVuZFwiOjY3NSxcInZhbHVlXCI6XCJVbm9jY3VwaWVkXCJ9LHtcIiRjbGFzc1wiOlwiVW5vY2N1cGllZFwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6Njc1LFwiZW5kXCI6NjkwLFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjo2OTAsXCJlbmRcIjo4MTAsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjgxMCxcImVuZFwiOjAsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifV0nKSk7XHJcblxyXG4gICAgICAkc2NvcGUuc2F2ZUFsbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkc2NvcGUucmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmFkYXB0ZXIuZ2V0U25hcHNob3QoKSkgKyBKU09OLnN0cmluZ2lmeSgkc2NvcGUuYWRhcHRlclR3by5nZXRTbmFwc2hvdCgpKTtcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxuLyoqIFRoZSBkYXRhIGlzIGFscmVhZHkgaW4gYW4gYWNjZXB0YWJsZSBmb3JtYXQgZm9yIHRoZSBkZW1vIHNvIGp1c3QgcGFzcyBpdCB0aHJvdWdoICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRGVtb0FkYXB0ZXIgaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8YnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxib29sZWFuPiwgYm9vbGVhbj4ge1xyXG4gIHB1YmxpYyBpdGVtczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGJvb2xlYW4+W10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgaW5pdGlhbERhdGE6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj5bXSxcclxuICApIHtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTbmFwc2hvdCgpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLml0ZW1zLm1hcChpdGVtID0+IGl0ZW0uc2NoZWR1bGVzLm1hcChzY2hlZHVsZSA9PiBzY2hlZHVsZSkpKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UocmFuZ2UpIHtcclxuICAgIHJldHVybiByYW5nZTtcclxuICB9XHJcbn1cclxuIiwiYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRW5kQWRqdXN0ZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGFkanVzdEVuZEZvck1vZGVsKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IGNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkanVzdEVuZEZvclZpZXcoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGVuZCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVuZDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEVuZEFkanVzdGVyU2VydmljZS4kbmFtZSwgRW5kQWRqdXN0ZXJTZXJ2aWNlKTsiLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickdob3N0U2xvdENvbnRyb2xsZXInO1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnZ2hvc3RTbG90Q3RybCc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50JyxcclxuICAgICAgICAnJHRpbWVvdXQnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICR0aW1lb3V0OiBhbmd1bGFyLklUaW1lb3V0U2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIG11bHRpU2xpZGVyQ3RybDogTXVsdGlTbGlkZXJDb250cm9sbGVyO1xyXG4gICAgcHJpdmF0ZSBkcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgICBwdWJsaWMgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3Nsb3QnKTtcclxuICAgICAgICB0aGlzLm11bHRpU2xpZGVyQ3RybC4kaG92ZXJFbGVtZW50ID0gdGhpcy4kZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZHJhZyhldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5tdWx0aVNsaWRlckN0cmwuYWRqdXN0R2hvc3QoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgICAgIC8vIERlbGF5IHN0YXJ0IG9mIGRyYWdcclxuICAgICAgICB0aGlzLmRyYWdUaW1lb3V0ID0gdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH0sIDI1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0b3BEcmFnKCkge1xyXG4gICAgICAgIC8vIENhbmNlbCB0aW1lb3V0IGlmIGFwcGxpY2FibGVcclxuICAgICAgICB0aGlzLiR0aW1lb3V0LmNhbmNlbCh0aGlzLmRyYWdUaW1lb3V0KTtcclxuICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aVNsaWRlckN0cmwub25Ib3ZlckVsZW1lbnRDbGljaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyR2hvc3RTbG90JztcclxuXHJcbiAgICBjb250cm9sbGVyID0gR2hvc3RTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IEdob3N0U2xvdENvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIG11bHRpU2xpZGVyQ3RybDogJ15ick11bHRpU2xpZGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2IGJyLWhhbmRsZVxyXG4gICAgICAgICAgICAgb25kcmFnc3RhcnQ9XCJnaG9zdFNsb3RDdHJsLnN0YXJ0RHJhZygpXCJcclxuICAgICAgICAgICAgIG9uZHJhZz1cImdob3N0U2xvdEN0cmwuZHJhZyhldmVudClcIlxyXG4gICAgICAgICAgICAgb25kcmFnc3RvcD1cImdob3N0U2xvdEN0cmwuc3RvcERyYWcoKVwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICtcclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWUsIEdob3N0U2xvdENvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KEdob3N0U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IEdob3N0U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqXHJcbiAqIFdlIHNob3VsZCBiZSBhYmxlIHRvIGNvbnZlcnQgdGhlIHNjaGVkdWxlcyBiZWZvcmVoYW5kLCBwYXNzIGp1c3QgdGhlIHNjaGVkdWxlcyBpbiBhbmQgaGF2ZSB0aGlzIHBhY2thZ2UgYnVpbGQgdGhlIGl0ZW1zXHJcbiAqIFRoaXMgaGVscHMgcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gaW4gY2xpZW50cy5cclxuICogVGhpcyBpcyB1c2VkIGFzIGEgc3Vic3RpdHV0ZSBmb3IgbG9kYXNoLmdyb3VwQnkgdG8ga2VlcCB0aGUgZm9vdHByaW50IHNtYWxsIFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgR3JvdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZSc7XHJcblxyXG4gICAgZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSk6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSB7XHJcbiAgICAgICAgbGV0IHNlZWQ6IHsgW2tleTogbnVtYmVyXTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10gfSA9IHt9O1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gc2NoZWR1bGVzLnJlZHVjZSgocmVkdWNlciwgY3VycmVudFNjaGVkdWxlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGN1cnJlbnRTY2hlZHVsZS5kYXk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlZHVjZXJba2V5XSkge1xyXG4gICAgICAgICAgICAgICAgcmVkdWNlcltrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlZHVjZXJba2V5XS5wdXNoKGN1cnJlbnRTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVkdWNlcjtcclxuICAgICAgICB9LCBzZWVkKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEdyb3VwU2VydmljZS4kbmFtZSwgR3JvdXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdickhhbmRsZSc7XHJcbiAgcmVzdHJpY3QgPSAnQSc7XHJcblxyXG4gIHNjb3BlID0ge1xyXG4gICAgb25kcmFnOiAnJicsXHJcbiAgICBvbmRyYWdzdG9wOiAnJicsXHJcbiAgICBvbmRyYWdzdGFydDogJyYnXHJcbiAgfTtcclxuXHJcbiAgbGluayA9IChzY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSA9PiB7XHJcbiAgICB2YXIgJGRvY3VtZW50ID0gdGhpcy4kZG9jdW1lbnQ7XHJcbiAgICB2YXIgeCA9IDA7XHJcblxyXG4gICAgbGV0IG1vdXNlZG93bkV2ZW50OiBzdHJpbmcgPSAnbW91c2Vkb3duIHRvdWNoc3RhcnQnO1xyXG4gICAgbGV0IG1vdXNlbW92ZUV2ZW50OiBzdHJpbmcgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSc7XHJcbiAgICBsZXQgbW91c2V1cEV2ZW50OiBzdHJpbmcgPSAnbW91c2V1cCB0b3VjaGVuZCc7XHJcblxyXG4gICAgZWxlbWVudC5vbihtb3VzZWRvd25FdmVudCwgKGV2ZW50KSA9PiB7XHJcbiAgICAgIHggPSBnZXRQYWdlWChldmVudCk7XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZHJhZ2dpbmcgb2Ygc2VsZWN0ZWQgY29udGVudFxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdGFydCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFnZVgoZXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGV2ZW50LnBhZ2VYIHx8IGdldFRvdWNoZXMoZXZlbnQpWzBdLnBhZ2VYO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFRvdWNoZXMoZXZlbnQ6IGFueSk6IGFueSB7IC8vIHRvZG9cclxuICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaWYgKCFldmVudC50b3VjaGVzKSB7XHJcbiAgICAgICAgZXZlbnQudG91Y2hlcyA9IFtldmVudC5vcmlnaW5hbEV2ZW50XTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gZXZlbnQudG91Y2hlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgbGV0IHBhZ2VYID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG4gICAgICB2YXIgZGVsdGEgPSBwYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhLCBldmVudDogZXZlbnQgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2V1cCgpIHtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZChtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZChtb3VzZXVwRXZlbnQsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdG9wKSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdG9wKCkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIb3VybHlHcmlkRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickhvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICdeYnJXZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmJFbGVtZW50czogaG91ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBob3VyIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICAgIHZhciB0aWNrY291bnQgPSBjb25maWcuaG91ckNvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gU3RyaXBlIGl0IGJ5IGhvdXJcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdzdHJpcGVkJyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudEhvdXIgPSBpICUgMTI7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGkgPj0gMTIgPyAncCcgOiAnYSc7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC50ZXh0KGAke2N1cnJlbnRIb3VyIHx8ICcxMid9JHttZXJpZGllbX1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBudW1JbnRlcnZhbHNJblRpY2sgPSA2MCAvIGNvbmZpZy5pbnRlcnZhbDtcclxuICAgICAgICAgICAgbGV0IGludGVydmFsUGVyY2VudGFnZSA9IDEwMCAvIG51bUludGVydmFsc0luVGljaztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbnVtSW50ZXJ2YWxzSW5UaWNrOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBncmFuZENoaWxkID0gdGhpcy5HUklEX1RFTVBMQVRFLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmF0dHIoJ3JlbCcsICgoaSAqIG51bUludGVydmFsc0luVGljaykgKyBqKSAqIGNvbmZpZy5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmFkZENsYXNzKCdpbnRlcnZhbCcpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5jc3MoJ3dpZHRoJywgaW50ZXJ2YWxQZXJjZW50YWdlICsgJyUnKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFwcGVuZChncmFuZENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSG91cmx5R3JpZERpcmVjdGl2ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmRpcmVjdGl2ZShIb3VybHlHcmlkRGlyZWN0aXZlLiRuYW1lLCBIb3VybHlHcmlkRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHEnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pID0+IHZvaWQ7IH0gPSB7XHJcbiAgICBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVOb092ZXJsYXAoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcl06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudF06IChjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdOiAoY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChjdXJyZW50LCBvdGhlcilcclxuICB9O1xyXG4gIFxyXG4gIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuICBcclxuICBwdWJsaWMgJGhvdmVyRWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xyXG5cclxuICBwdWJsaWMgY2FuQWRkOiBib29sZWFuID0gdHJ1ZTtcclxuICBwdWJsaWMgaXNBZGRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyBpc0hvdmVyaW5nU2xvdDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBwdWJsaWMgZWxlbWVudDogRWxlbWVudDtcclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHVibGljIGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMubWVyZ2VBbGxPdmVybGFwcygpO1xyXG4gIH1cclxuXHJcbiAgJHBvc3RMaW5rKCkge1xyXG4gICAgaWYgKHRoaXMuJGhvdmVyRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcHJpbWFyeSA9IDE7XHJcbiAgICAgICAgY29uc3QgZGVmYXVsdFNpemUgPSA2MDtcclxuXHJcbiAgICAgICAgLy8gbXVzdCB1c2UgJ2J1dHRvbnMnIG5vdCAnYnV0dG9uJ1xyXG4gICAgICAgIGxldCBpc0RyYWdnaW5nID0gZS5idXR0b25zID09PSBwcmltYXJ5O1xyXG5cclxuICAgICAgICBsZXQgdmFsID0gdGhpcy5nZXRHaG9zdExlZnRWYWwoZSk7XHJcblxyXG4gICAgICAgIGlmICghaXNEcmFnZ2luZykge1xyXG4gICAgICAgICAgbGV0IHVwZGF0ZWRMZWZ0ID0gdGhpcy5nZXRTbG90TGVmdCh2YWwpO1xyXG4gICAgICAgICAgbGV0IHVwZGF0ZWRSaWdodCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gdGhpcy5nZXRTbG90UmlnaHQodmFsLCB2YWwgKyB0aGlzLm51bGxFbmRXaWR0aCkgOiB0aGlzLmdldFNsb3RSaWdodCh2YWwsIHZhbCArIGRlZmF1bHRTaXplKTtcclxuXHJcbiAgICAgICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogdXBkYXRlZExlZnQsXHJcbiAgICAgICAgICAgIHJpZ2h0OiB1cGRhdGVkUmlnaHRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkU2xvdChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICBzdGFydCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuZCA+IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhbml0eSBjaGVjayAtLSBkb24ndCBhZGQgYSBzbG90IHdpdGggYW4gZW5kIGJlZm9yZSB0aGUgc3RhcnRcclxuICAgIGlmIChlbmQgPD0gc3RhcnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHEud2hlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzY2hlZHVsZSA9IHtcclxuICAgICAgZGF5OiB0aGlzLml0ZW0uZGF5LFxyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKGVkaXRlZFNjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShlZGl0ZWRTY2hlZHVsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHEud2hlbih0aGlzLmFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogRXhwYW5kIGdob3N0IHdoaWxlIGRyYWdnaW5nIGluIGl0ICovXHJcbiAgcHVibGljIGFkanVzdEdob3N0KGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICBsZXQgY3VycmVudExlZnRWYWw6IG51bWJlciA9IHRoaXMuZ2V0R2hvc3RMZWZ0VmFsKGV2ZW50KTtcclxuXHJcbiAgICAvLyBNYWtlIHJpZ2h0IGVkZ2UgYWRqdXN0IHRvIG5ldyBtb3VzZSBwb3NpdGlvblxyXG4gICAgbGV0IHVwZGF0ZWRSaWdodFZhbDogbnVtYmVyID0gdGhpcy5waXhlbFRvVmFsKGV2ZW50LnBhZ2VYKTtcclxuICAgIGxldCB1cGRhdGVkUmlnaHRQeDogc3RyaW5nID0gdGhpcy5nZXRTbG90UmlnaHQoY3VycmVudExlZnRWYWwsIHVwZGF0ZWRSaWdodFZhbCk7XHJcbiAgICBcclxuICAgIC8vIExvY2sgbGVmdCBlZGdlIGluIHBsYWNlLCBvbmx5IHVwZGF0ZSByaWdodFxyXG4gICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgIHJpZ2h0OiB1cGRhdGVkUmlnaHRQeFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0RGlydHkoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwuZGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRTY2hlZHVsZVRvSXRlbShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLml0ZW0uYWRkU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG4gICAgdGhpcy5tZXJnZShzY2hlZHVsZSk7XHJcblxyXG4gICAgdGhpcy5zZXREaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEVsZW1lbnRPZmZzZXRYKGVsZW06IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgcmV0dXJuIGVsZW1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkhvdmVyRWxlbWVudENsaWNrKCkge1xyXG4gICAgaWYgKHRoaXMuY2FuQWRkKSB7XHJcbiAgICAgIGxldCBlbGVtZW50T2Zmc2V0WCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIGxldCBob3ZlckVsZW1lbnRPZmZzZXRYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRob3ZlckVsZW1lbnQpIC0gZWxlbWVudE9mZnNldFg7XHJcblxyXG4gICAgICBsZXQgc3RhcnQgPSB0aGlzLnBpeGVsVG9WYWwoaG92ZXJFbGVtZW50T2Zmc2V0WCk7XHJcbiAgICAgIGxldCB3aWR0aCA9IHRoaXMucGl4ZWxUb1ZhbCh0aGlzLiRob3ZlckVsZW1lbnRbMF0uY2xpZW50V2lkdGgpO1xyXG4gICAgICBsZXQgZW5kID0gdGhpcy5jb25maWcubnVsbEVuZHMgPyBudWxsIDogdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwodGhpcy5jb25maWcsIHN0YXJ0ICsgd2lkdGgpO1xyXG5cclxuICAgICAgdGhpcy5pc0FkZGluZyA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLmFkZFNsb3Qoc3RhcnQsIGVuZCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLm9uQ2hhbmdlKCk7XHJcbiAgICAgICAgdGhpcy5pc0FkZGluZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiB0aGUgc2NoZWR1bGUgaXMgYWJsZSB0byBiZSBlZGl0ZWRcclxuICAgKi9cclxuICBwcml2YXRlIGNhbkVkaXQoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgbGV0IGlzRWRpdGFibGUgPSB0aGlzLml0ZW0uaXNFZGl0YWJsZSgpO1xyXG4gICAgbGV0IGhhc0VkaXRGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KTtcclxuICAgIGxldCBpc05vdEFjdGl2ZSA9ICFzY2hlZHVsZS4kaXNBY3RpdmU7XHJcbiAgICBsZXQgaXNOb3REcmFnZ2luZyA9ICF0aGlzLmlzRHJhZ2dpbmc7XHJcblxyXG4gICAgcmV0dXJuIGlzRWRpdGFibGUgJiYgaGFzRWRpdEZ1bmN0aW9uICYmIGlzTm90QWN0aXZlICYmIGlzTm90RHJhZ2dpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYXRoZXIgdGhhbiBoYXZpbmcgdG8gZGVhbCB3aXRoIG1vZGlmeWluZyBtZXJnZU92ZXJsYXBzIHRvIGhhbmRsZSBudWxsRW5kcyBjYWxlbmRhcnMsXHJcbiAgICoganVzdCBwcmV2ZW50IHRoZSB1c2VyIGZyb20gY3JlYXRpbmcgYWRkaXRpb25hbCBzbG90cyBpbiBudWxsRW5kcyBjYWxlbmRhcnMgdW5sZXNzIHRoZXJlIGFyZSBubyBzbG90cyB0aGVyZSBhbHJlYWR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuUmVuZGVyR2hvc3Qoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLml0ZW0uaGFzTm9TY2hlZHVsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuaXRlbS5pc0VkaXRhYmxlKCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzQWRkaW5nKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc0RyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc0hvdmVyaW5nU2xvdCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEdob3N0TGVmdFBpeGVsKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICBsZXQgZWxlbWVudE9mZnNldFggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpO1xyXG4gICAgbGV0IGxlZnQgPSBldmVudC5wYWdlWCAtIGVsZW1lbnRPZmZzZXRYIC0gNDsgLy8gZ2l2ZSBhIGxpdHRsZSB0b2xlcmFuY2UgdG8gbWFrZSBzdXJlIHRoZSBtb3VzZSBwb2ludGVyIGlzIGFsd2F5cyBpbnNpZGUgdGhlIGdob3N0XHJcblxyXG4gICAgcmV0dXJuIGxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEdob3N0TGVmdFZhbChldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGl4ZWxUb1ZhbCh0aGlzLmdldEdob3N0TGVmdFBpeGVsKGV2ZW50KSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtIGFuIGV4dGVybmFsIGFjdGlvbiB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGEgc2NoZWR1bGVcclxuICAgKi9cclxuICBwcml2YXRlIGVkaXRTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5jYW5FZGl0KHNjaGVkdWxlKSkge1xyXG4gICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKG5ld1NjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld1NjaGVkdWxlLiRpc0RlbGV0aW5nKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsZXQgcHJlbWVyZ2VTY2hlZHVsZSA9IGFuZ3VsYXIuY29weShuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5tZXJnZShuZXdTY2hlZHVsZSk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgbWVyZ2luZyBtdXRhdGVkIHRoZSBzY2hlZHVsZSBmdXJ0aGVyLCB0aGVuIHNjaGVkdWxlckN0cmwudXBkYXRlU2NoZWR1bGUgd291bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHNvIHRoYXQgZWRpdHMgdGhhdCBkb24ndCB0cmlnZ2VyIG1lcmdlcyBzdGlsbCB0cmlnZ2VyIG9uQ2hhbmdlLFxyXG4gICAgICAgICAgLy8gYnV0IGVkaXRzIHRoYXQgZG8gdHJpZ2dlciBtZXJnZXMgZG9uJ3QgdHJpZ2dlciBpdCB0d2ljZVxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHByZW1lcmdlU2NoZWR1bGUsIG5ld1NjaGVkdWxlKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlckN0cmwudXBkYXRlU2NoZWR1bGUoc2NoZWR1bGUsIG5ld1NjaGVkdWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2V0RGlydHkoKTtcclxuICAgICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90TGVmdChzdGFydDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsOiBIVE1MRWxlbWVudCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKHN0YXJ0KTtcclxuXHJcbiAgICByZXR1cm4gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIElmIHRoZXJlIGlzIGEgbnVsbCBlbmQsIHBsYWNlIHRoZSBlbmQgb2YgdGhlIHNsb3QgdHdvIGhvdXJzIGF3YXkgZnJvbSB0aGUgYmVnaW5uaW5nLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA9PT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBzdGFydCArIHRoaXMubnVsbEVuZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICBsZXQgcmVzdWx0ID0gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSBsZWZ0IG9mIHRoZSBsZWZ0bW9zdCBpbnRlcnZhbCwgc28gcmV0dXJuIHRoYXQgaW5zdGVhZFxyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIGlmICh2YWwgPiByaWdodG1vc3QpIHtcclxuICAgICAgdmFsID0gcmlnaHRtb3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnBhcmVudCgpWzBdLnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIC8vIEhlcmUsIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHRoZSB2YWx1ZXMgbWF0Y2ggLS0gdGhlIGNvdmVyaW5nIHNsb3QgY2FuIGFsd2F5cyBcImVhdFwiIHRoZSBvdGhlciBvbmVcclxuICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50SXNJbnNpZGVPdGhlcihjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICAvLyBSZW1vdmUgJ290aGVyJyAmIG1ha2UgY3VycmVudCBleHBhbmQgdG8gZml0IHRoZSBvdGhlciBzbG90XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUob3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSnVzdCByZW1vdmUgJ2N1cnJlbnQnXHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoY3VycmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIC8vIERvIG5vdGhpbmdcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnNjaGVkdWxlckN0cmwudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLnVwZGF0ZVNjaGVkdWxlKG90aGVyLCB7XHJcbiAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogY3VycmVudC5zdGFydCxcclxuICAgICAgICB2YWx1ZTogY3VycmVudC52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnZhbHVlc01hdGNoKGN1cnJlbnQsIG90aGVyKSkge1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgZGF5OiBjdXJyZW50LmRheSxcclxuICAgICAgICBzdGFydDogY3VycmVudC5zdGFydCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNjaGVkdWxlckN0cmwudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogY3VycmVudC5lbmQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5oYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUFsbE92ZXJsYXBzKCkge1xyXG4gICAgZG8ge1xyXG4gICAgICB0aGlzLml0ZW0uc2NoZWR1bGVzLmZvckVhY2gocyA9PiB0aGlzLm1lcmdlT3ZlcmxhcHMocykpO1xyXG4gICAgfSB3aGlsZSAodGhpcy5pdGVtLm5lZWRzT3ZlcmxhcHNNZXJnZWQoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1lcmdlT3ZlcmxhcHMoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLmZvckVhY2goKGVsID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLm92ZXJsYXBIYW5kbGVyc1tvdmVybGFwU3RhdGVdO1xyXG5cclxuICAgICAgICBvdmVybGFwSGFuZGxlcihzY2hlZHVsZSwgZWwpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlT3ZlcigpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0dWFsbHkgcmVtb3ZlIHRoZSBzY2hlZHVsZSBmcm9tIGJvdGggdGhlIHNjcmVlbiBhbmQgdGhlIG1vZGVsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLml0ZW0ucmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMuc2V0RGlydHkoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzTWF0Y2goc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgcmV0dXJuIHNjaGVkdWxlLnZhbHVlID09PSBvdGhlci52YWx1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtZXJnZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAvLyBXZSBjb25zaWRlciB0aGUgc2NoZWR1bGUgd2Ugd2VyZSB3b3JraW5nIHdpdGggdG8gYmUgdGhlIG1vc3QgaW1wb3J0YW50LCBzbyBoYW5kbGUgaXRzIG92ZXJsYXBzIGZpcnN0LlxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2VBbGxPdmVybGFwcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyTXVsdGlTbGlkZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIHNjaGVkdWxlckN0cmw6ICdeYnJXZWVrbHlTY2hlZHVsZXInXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lLCBNdWx0aVNsaWRlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChNdWx0aVNsaWRlckNvbXBvbmVudC4kbmFtZSwgbmV3IE11bHRpU2xpZGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiBPdmVybGFwU3RhdGUge1xyXG4gICAgICAgIGxldCBjdXJyZW50U3RhcnQgPSBjdXJyZW50LnN0YXJ0O1xyXG4gICAgICAgIGxldCBjdXJyZW50RW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIGN1cnJlbnQuZW5kKTtcclxuXHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnQgPSBvdGhlci5zdGFydDtcclxuICAgICAgICBsZXQgb3RoZXJFbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgb3RoZXIuZW5kKTtcclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID49IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50U3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50SXNJbnNpZGVPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RW5kID49IG90aGVyRW5kICYmIGN1cnJlbnRTdGFydCA8PSBvdGhlclN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID4gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID49IGN1cnJlbnRTdGFydCAmJiBvdGhlclN0YXJ0IDwgY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPT09IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlclN0YXJ0ID09PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBTZXJ2aWNlLiRuYW1lLCBPdmVybGFwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZVByb3ZpZGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklSZXNpemVTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgcHVibGljIHN0YXRpYyAkbmFtZSA9ICdici53ZWVrbHlTY2hlZHVsZXIucmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy4kZ2V0LiRpbmplY3QgPSBbXHJcbiAgICAgICAgICAgICckcm9vdFNjb3BlJyxcclxuICAgICAgICAgICAgJyR3aW5kb3cnXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tUmVzaXplRXZlbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgc2VydmljZUluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMgPSBldmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljICRnZXQoXHJcbiAgICAgICAgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApOiBJUmVzaXplU2VydmljZSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VydmljZUluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBleGlzdHMgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIHdlIGhhdmUgdG8gJGFwcGx5IHRoZSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKGV2ZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VJbml0aWFsaXplZCA9IHRydWU7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5wcm92aWRlcihSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIFJlc2l6ZVNlcnZpY2VQcm92aWRlcilcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IElSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAncmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRmaWx0ZXInXTtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBleHBsYW5hdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogc3RyaW5nIH0gPSB7fTtcclxuICAgIHByaXZhdGUgdmlvbGF0aW9uczogeyBba2V5IGluIFZhbGlkYXRpb25FcnJvcl0/OiBib29sZWFuIH0gPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRmaWx0ZXI6IElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkZG9DaGVjaygpIHtcclxuICAgICAgICBsZXQgZXJyb3JzID0gdGhpcy5zY2hlZHVsZXJDdHJsLnZhbGlkYXRpb25FcnJvcnM7XHJcblxyXG4gICAgICAgIHRoaXMudmlvbGF0aW9ucyA9IHtcclxuICAgICAgICAgICAgW1ZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb25dOiBlcnJvcnMuaW5kZXhPZihWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uKSA+IC0xLFxyXG4gICAgICAgICAgICBbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90VmlvbGF0aW9uXTogZXJyb3JzLmluZGV4T2YoVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90VmlvbGF0aW9uKSA+IC0xLFxyXG4gICAgICAgICAgICBbVmFsaWRhdGlvbkVycm9yLk1vbm9TY2hlZHVsZVZpb2xhdGlvbl06IGVycm9ycy5pbmRleE9mKFZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb24pID4gLTFcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gdGhpcy4kZmlsdGVyKCdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKShjb25maWcubWF4VGltZVNsb3QpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb25dID0gYE1heCB0aW1lIHNsb3QgbGVuZ3RoOiAke21heFRpbWVTbG90fWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uXSA9ICdGb3IgdGhpcyBjYWxlbmRhciwgZXZlcnkgZGF5IG11c3QgYmUgY29tcGxldGVseSBmdWxsIG9mIHNjaGVkdWxlcy4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1vbm9TY2hlZHVsZVZpb2xhdGlvbl0gPSAnVGhpcyBjYWxlbmRhciBtYXkgb25seSBoYXZlIG9uZSB0aW1lIHNsb3QgcGVyIGRheSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5OdWxsRW5kVmlvbGF0aW9uXSA9ICdJdGVtcyBpbiB0aGlzIGNhbGVuZGFyIGRvIG5vdCBoYXZlIGVuZCB0aW1lcy4gU2NoZWR1bGVkIGV2ZW50cyBiZWdpbiBhdCB0aGUgc3RhcnQgdGltZSBhbmQgZW5kIHdoZW4gdGhleSBhcmUgZmluaXNoZWQuJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclJlc3RyaWN0aW9uRXhwbGFuYXRpb25zJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBzY2hlZHVsZXJDdHJsOiAnXmJyV2Vla2x5U2NoZWR1bGVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3JvdyBleHBsYW5hdGlvbnNcIiBuZy1jbGFzcz1cInsgdmlvbGF0aW9uOiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwudmlvbGF0aW9uc1trZXldIH1cIiBuZy1yZXBlYXQ9XCIoa2V5LCBleHBsYW5hdGlvbikgaW4gcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsLmV4cGxhbmF0aW9uc1wiPlxyXG4gICAgICAgICAgICB7eyBleHBsYW5hdGlvbiB9fVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQuJG5hbWUsIG5ldyBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudCgpKVxyXG4gICAgLmNvbnRyb2xsZXIoUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyLiRuYW1lLCBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG4gICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluQUNlbGwoZWxlbWVudCwgZSwgZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTRVRfWk9PTSwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW4oZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJTY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyBXaGVuIHRoaXMgb3B0aW9uIGlzIHRydWUgd2Ugc2hvdWxkIGVuZm9yY2UgdGhhdCB0aGVyZSBhcmUgbm8gZ2FwcyBpbiB0aGUgc2NoZWR1bGVzXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzY2hlZHVsZXMsIGl0IGF1dG9tYXRpY2FsbHkgZmFpbHMuXHJcbiAgICAgICAgaWYgKCFsZW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgb25seSBvbmUgaXRlbSB3ZSBzaG91bGQgY2hlY2sgdGhhdCBpdCBzcGFucyB0aGUgd2hvbGUgcmFuZ2VcclxuICAgICAgICBpZiAobGVuID09PSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsZSA9IHNjaGVkdWxlc1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc2NoZWR1bGUuc3RhcnQpICYmIHRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKHNjaGVkdWxlLmVuZCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG1vcmUsIGNvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxvb3BMZW4gPSBsZW4gLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBTb3J0IGJ5IHN0YXJ0IHRpbWUgZmlyc3RcclxuICAgICAgICBsZXQgc29ydGVkU2NoZWR1bGVzID0gc2NoZWR1bGVzLnNvcnQoKGEsIGIpID0+IGEuc3RhcnQgPiBiLnN0YXJ0ID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb29wTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGZpcnN0IGl0ZW0gbGFuZHMgYXQgMFxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiAhdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShjdXJyZW50LnN0YXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBsYXN0IGl0ZW0gbGFuZHMgYXQgbWF4VmFsdWVcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxvb3BMZW4gLSAxICYmICF0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShuZXh0LmVuZCwgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgY3VycmVudC5lbmQgPT09IG5leHQuc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVTdGFydEF0TWluVmFsdWUoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBzdGFydCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlRW5kQXRNYXhWYWx1ZShlbmQ6IG51bWJlciwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICByZXR1cm4gKGVuZCB8fCBjb25maWcubWF4VmFsdWUpID09PSBjb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG1heFRpbWVTbG90ID0gY29uZmlnLm1heFRpbWVTbG90O1xyXG5cclxuICAgICAgICBpZiAoIW1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXMuc29tZShzID0+IHMudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUgJiYgcy5lbmQgLSBzLnN0YXJ0ID4gbWF4VGltZVNsb3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk1vbm9TY2hlZHVsZVZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogSW1wb3J0YW50IG5vdGUgLS0gdGhpcyBkb2VzIG5vdCB2YWxpZGF0ZSB0aGF0IG9ubHkgb25lIHNjaGVkdWxlIGV4aXN0cyBwZXIgaXRlbSwgYnV0IHJhdGhlciB0aGF0IG9ubHkgb25lIE5PTi1ERUZBVUxUIHNjaGVkdWxlIGV4aXN0cyBwZXIgaXRlbS4gKi9cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGEgZGVmYXVsdCB2YWx1ZSBpcyBkZWZpbmVkLCBzY2hlZHVsZXMgd2l0aCBkZWZhdWx0IHZhbHVlcyBkb24ndCBjb3VudCAtLSBvbmUgbm9uLWRlZmF1bHQgc2NoZWR1bGUgcGVyIGl0ZW0uXHJcbiAgICAgICAgbGV0IHNjaGVkdWxlc1RvVmFsaWRhdGU7XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChjb25maWcuZGVmYXVsdFZhbHVlKSkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzLmZpbHRlcihzY2hlZHVsZSA9PiBzY2hlZHVsZS52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgYWxsb3dlZCBlbXB0eSBvciAxIHNjaGVkdWxlIHBlciBpdGVtXHJcbiAgICAgICAgcmV0dXJuICFzY2hlZHVsZXNUb1ZhbGlkYXRlLmxlbmd0aCB8fCBzY2hlZHVsZXNUb1ZhbGlkYXRlLmxlbmd0aCA9PT0gMTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5OdWxsRW5kVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmxlbmd0aCA8PSAxICYmIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgPT09IG51bGwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMuZXZlcnkoc2NoZWR1bGUgPT4gc2NoZWR1bGUuZW5kICE9PSBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UgaW1wbGVtZW50cyBWYWxpZGF0b3JTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSdcclxuICAgIF07XHJcbiAgICBcclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk92ZXJsYXBWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gQ29tcGFyZSB0d28gYXQgYSB0aW1lIHVudGlsIHRoZSBlbmRcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aDtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBzY2hlZHVsZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2NoZWR1bGVzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGxldCB2YWx1ZXNNYXRjaCA9IGN1cnJlbnQudmFsdWUgPT09IG5leHQudmFsdWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlc01hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4VmFsdWUgPSBjb25maWcubWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlcmxhcFN0YXRlID0gdGhpcy5vdmVybGFwU2VydmljZS5nZXRPdmVybGFwU3RhdGUoY29uZmlnLCBjdXJyZW50LCBuZXh0KTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBbT3ZlcmxhcFN0YXRlLk5vT3ZlcmxhcCwgT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmQsIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XS5pbmRleE9mKG92ZXJsYXBTdGF0ZSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBPdmVybGFwVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJWYWxpZGF0aW9uU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnXHJcbiAgICBdXHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBtYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBtb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VmFsaWRhdGlvbkVycm9ycyhpdGVtOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBWYWxpZGF0aW9uRXJyb3JbXSB7XHJcbiAgICAgICAgbGV0IHZhbGlkYXRvcnM6IFZhbGlkYXRvclNlcnZpY2VbXSA9IFtcclxuICAgICAgICAgICAgdGhpcy5tYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHRoaXMubW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5udWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgICAgICB0aGlzLmZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHRoaXMub3ZlcmxhcFZhbGlkYXRvclNlcnZpY2VcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xyXG5cclxuICAgICAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHtcclxuICAgICAgICAgICAgaWYgKCF2YWxpZGF0b3IudmFsaWRhdGUoaXRlbS5zY2hlZHVsZXMsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbGlkYXRvci5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjaGVkdWxlVmFsaWRhdGlvblNlcnZpY2UuJG5hbWUsIFNjaGVkdWxlVmFsaWRhdGlvblNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyWm9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWphY2tTY3JvbGwoZWxlbWVudCwgZGVsdGEpIHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tQnlTY3JvbGwoZWxlbWVudCwgZXZlbnQsIGRlbHRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY3JvbGxTZXJ2aWNlLiRuYW1lLCBTY3JvbGxTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNaW51dGVzQXNUZXh0RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGBgO1xyXG5cclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgaGFzSG91cnMgPSBob3VycyA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzSG91cnMpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgJHtob3Vyc30gaG91cnNgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbWluID0gbWludXRlcyAlIDYwO1xyXG4gICAgICAgICAgICBsZXQgaGFzTWludXRlcyA9IG1pbiA+IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzTWludXRlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7bWlufSBtaW51dGUke21pbiA+IDEgPyAncycgOiAnJ31gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoTWludXRlc0FzVGV4dEZpbHRlci4kbmFtZSwgW01pbnV0ZXNBc1RleHRGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nTWludXRlcyA9IChtaW51dGVzIC0gKGhvdXJzICogNjApKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBob3VycyA+IDExICYmIGhvdXJzIDwgMjQgPyAnUCcgOiAnQSc7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVtYWluaW5nTWludXRlcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nTWludXRlcyA9ICcwJyArIHJlbWFpbmluZ01pbnV0ZXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkaXNwbGF5SG91cnMgPSBob3VycyAlIDEyIHx8IDEyO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke2Rpc3BsYXlIb3Vyc306JHtyZW1haW5pbmdNaW51dGVzfSR7bWVyaWRpZW19YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2UnO1xyXG5cclxuICAgIGJpbmRpbmdzID0ge1xyXG4gICAgICAgIHNjaGVkdWxlOiAnPCdcclxuICAgIH1cclxuXHJcbiAgICBjb250cm9sbGVyID0gVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0te3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5lbmQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBuZy1pZj1cInRpbWVSYW5nZUN0cmwuaGFzU3RhcnQgJiYgIXRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19IHVudGlsPC9zcGFuPlxyXG4gICAgYFxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3RpbWVSYW5nZUN0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlQ29udHJvbGxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTdGFydDogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgaGFzRW5kOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIHRoaXMuaGFzU3RhcnQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLnN0YXJ0KTtcclxuICAgICAgICB0aGlzLmhhc0VuZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuZW5kKSAmJiB0aGlzLnNjaGVkdWxlLmVuZCAhPT0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb21wb25lbnQoVGltZVJhbmdlQ29tcG9uZW50LiRuYW1lLCBuZXcgVGltZVJhbmdlQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lLCBUaW1lUmFuZ2VDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckcScsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckdyb3VwU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlclZhbGlkYXRpb25TZXJ2aWNlJyxcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSBncm91cFNlcnZpY2U6IEdyb3VwU2VydmljZSxcclxuICAgIHByaXZhdGUgZGF5TWFwOiB7IFtrZXk6IG51bWJlcl06IHN0cmluZyB9LFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IFNjaGVkdWxlVmFsaWRhdGlvblNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX29yaWdpbmFsSXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG5cclxuICBwcml2YXRlIGFkYXB0ZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyQWRhcHRlcjxhbnksIGFueT47XHJcblxyXG4gIC8qKiBzaG91bGQgYmUgdHJ1ZSBpZiB0aGUgc2NoZWR1bGVyIGhhcyBiZWVuIGludGVyYWN0ZWQgd2l0aCAqL1xyXG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIHNob3VsZCBiZSB0cnVlIGlmIHRoZSBzY2hlZHVsZXIgYmVjYW1lIGludmFsaWQgYWZ0ZXIgYmVpbmcgaW5pdGlhbGl6ZWQgKi9cclxuICBwdWJsaWMgaW52YWxpZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIHNob3VsZCBiZSB0cnVlIGlmIHRoZSBzY2hlZHVsZXIgd2FzICoqaW5pdGlhbGl6ZWQqKiB3aXRoIGludmFsaWQgdmFsdWVzICovXHJcbiAgcHVibGljIHN0YXJ0ZWRXaXRoSW52YWxpZFNjaGVkdWxlOiBib29sZWFuO1xyXG4gIHB1YmxpYyBob3ZlckNsYXNzOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PjtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PiA9IHtcclxuICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4gYW5ndWxhci5ub29wKClcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdmFsaWRhdGlvbkVycm9yczogVmFsaWRhdGlvbkVycm9yW107XHJcblxyXG4gICRkb0NoZWNrKCkge1xyXG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyZSh0aGlzLm9wdGlvbnMpO1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKTtcclxuICAgIHRoaXMuc3RhcnRlZFdpdGhJbnZhbGlkU2NoZWR1bGUgPSB0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpO1xyXG4gICAgdGhpcy53YXRjaEFkYXB0ZXIoKTtcclxuICAgIHRoaXMud2F0Y2hIb3ZlckNsYXNzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcblxyXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkNoYW5nZSgpIHtcclxuICAgIHRoaXMuY29uZmlnLm9uQ2hhbmdlKCF0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbW1pdCBuZXcgdmFsdWVzIHRvIHRoZSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICBzY2hlZHVsZS5lbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbCh0aGlzLmNvbmZpZywgdXBkYXRlLmVuZCk7XHJcblxyXG4gICAgdGhpcy5vbkNoYW5nZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZEl0ZW1zKGl0ZW1zOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSkge1xyXG4gICAgdGhpcy5pdGVtcyA9IHRoaXMuZmlsbEl0ZW1zKGl0ZW1zKTtcclxuXHJcbiAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBhZGFwdGVyIHNvIHdlIGNhbiBwdWxsIGl0IG91dCBsYXRlclxyXG4gICAgdGhpcy5hZGFwdGVyLml0ZW1zID0gdGhpcy5pdGVtcztcclxuXHJcbiAgICAvLyBrZWVwIGEgY29weSBvZiB0aGUgaXRlbXMgaW4gY2FzZSB3ZSBuZWVkIHRvIHJvbGxiYWNrXHJcbiAgICB0aGlzLl9vcmlnaW5hbEl0ZW1zID0gYW5ndWxhci5jb3B5KHRoaXMuaXRlbXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5idWlsZEl0ZW1zKHRoaXMuZ2V0SXRlbXNGcm9tQWRhcHRlcigpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0SXRlbXNGcm9tQWRhcHRlcigpIHtcclxuICAgIGxldCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBpZiAodGhpcy5hZGFwdGVyKSB7XHJcbiAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLmFkYXB0ZXIuaW5pdGlhbERhdGEubWFwKGRhdGEgPT4gdGhpcy5hZGFwdGVyLmN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShkYXRhKSk7XHJcbiAgICAgIGxldCBncm91cGVkU2NoZWR1bGVzID0gdGhpcy5ncm91cFNlcnZpY2UuZ3JvdXBTY2hlZHVsZXMoc2NoZWR1bGVzKTtcclxuXHJcbiAgICAgIGZvciAobGV0IGtleSBpbiBncm91cGVkU2NoZWR1bGVzKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmNyZWF0ZUl0ZW0ocGFyc2VJbnQoa2V5LCAxMCksIGdyb3VwZWRTY2hlZHVsZXNba2V5XSk7XHJcblxyXG4gICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VmFsaWRhdGlvbkVycm9ycygpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLml0ZW1zLm1hcChpdGVtID0+IHRoaXMuc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLmdldFZhbGlkYXRpb25FcnJvcnMoaXRlbSwgdGhpcy5jb25maWcpKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmUgdGhlIHNjaGVkdWxlci5cclxuICAgKi9cclxuICBwcml2YXRlIGNvbmZpZ3VyZShvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55Pik6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHVzZXJPcHRpb25zID0gYW5ndWxhci5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKHVzZXJPcHRpb25zLCB7XHJcbiAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50LFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlSXRlbShkYXk6IG51bWJlciwgc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSkge1xyXG4gICAgbGV0IHJlc3VsdDogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAgIGxldCBidWlsZGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IHRoaXMuY29uZmlnLmNyZWF0ZUl0ZW0oZGF5LCBzY2hlZHVsZXMpO1xyXG5cclxuICAgIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKGJ1aWxkZXIsIHsgbGFiZWw6IHRoaXMuZGF5TWFwW2RheV0gfSk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBXZWVrbHlTY2hlZHVsZXJJdGVtKHRoaXMuY29uZmlnLCByZXN1bHQsIHRoaXMub3ZlcmxhcFNlcnZpY2UpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNjaGVkdWxlciBzaG91bGQgYWx3YXlzIHNob3cgYWxsIGRheXMsIGV2ZW4gaWYgaXQgd2FzIG5vdCBwYXNzZWQgYW55IHNjaGVkdWxlcyBmb3IgdGhhdCBkYXlcclxuICAgKi9cclxuICBwcml2YXRlIGZpbGxJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdID0gW107XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZGF5TWFwLCAoZGF5OiBzdHJpbmcsIHN0cmluZ0tleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGxldCBrZXkgPSBwYXJzZUludChzdHJpbmdLZXksIDEwKTtcclxuICAgICAgbGV0IGZpbHRlcmVkSXRlbXMgPSBpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLmRheSA9PT0ga2V5KTtcclxuICAgICAgbGV0IGl0ZW06IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoID8gZmlsdGVyZWRJdGVtc1swXSA6IG51bGw7XHJcblxyXG4gICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNyZWF0ZUl0ZW0oa2V5LCBbXSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIERJRCBleGlzdCBqdXN0IHNldCB0aGUgbGFiZWxcclxuICAgICAgICBpdGVtLmxhYmVsID0gZGF5O1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGFuZ3VsYXIuY29weShyZXN1bHQpLnNvcnQoKGEsIGIpID0+IGEuZGF5ID4gYi5kYXkgPyAxIDogLTEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnNhdmVTY2hlZHVsZXIoKS50aGVuKCgpID0+IHRoaXMuZGlydHkgPSBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBBaGhhaGhhaGghIEZpZ2h0ZXIgb2YgdGhlIE5pZ2h0TWFwISAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERheU1hcCB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgdmFsdWUgPSB7XHJcbiAgICAgICAgMDogJ01vbicsXHJcbiAgICAgICAgMTogJ1R1ZScsXHJcbiAgICAgICAgMjogJ1dlZCcsXHJcbiAgICAgICAgMzogJ1RodXInLFxyXG4gICAgICAgIDQ6ICdGcmknLFxyXG4gICAgICAgIDU6ICdTYXQnLFxyXG4gICAgICAgIDY6ICdTdW4nIFxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KERheU1hcC4kbmFtZSwgRGF5TWFwLnZhbHVlKTtcclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBQcm92aWRlcyBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgYW4gaXRlbSAtLSBwYXNzIGl0IGluIGFuZCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGFsbG93IHlvdSB0byBvcGVyYXRlIG9uIGl0ICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBpbXBsZW1lbnRzIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIGVkaXRhYmxlOiBib29sZWFuO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgaXRlbTogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPixcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBpdGVtLmRheTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gaXRlbS5lZGl0YWJsZTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gaXRlbS5sYWJlbDtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlc0hhdmVNYXRjaGluZ1ZhbHVlcyhzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzLnB1c2goc2NoZWR1bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNOb1NjaGVkdWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0VkaXRhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5lZGl0YWJsZSkgfHwgdGhpcy5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmVlZHNPdmVybGFwc01lcmdlZCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kV2lkdGgge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJztcclxuXHJcbiAgICBzdGF0aWMgdmFsdWUgPSAxMjA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoTnVsbEVuZFdpZHRoLiRuYW1lLCBOdWxsRW5kV2lkdGgudmFsdWUpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyR0aW1lb3V0JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBtdWx0aXNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwcml2YXRlIHVwZGF0ZVNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pn0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG5cclxuICBwcml2YXRlIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlclxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2Ugd2FudCB0byBjYW5jZWwgdGhlIGRyYWcgb3BlcmF0aW9uIGlmIHRoZSB1c2VyIGlzIGp1c3QgY2xpY2tpbmcgb24gdGhlIGl0ZW0gb3IgaGFzIHN0YXJ0ZWQgZHJhZ2dpbmcgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgZHJhZyB0byBcImFjdGl2YXRlXCJcclxuICAgKiBIb3dldmVyLCB3ZSBzaG91bGQgZ2l2ZSB0aGVtIGEgc21hbGwgdG9sZXJhbmNlIGJlZm9yZSBjb25zaWRlcmluZyB0aGVtIHRvIGhhdmUgc3RhcnRlZCBkcmFnZ2luZyBlYXJseSwgYXMgaXQgaXMgdmVyeSBlYXN5IHRvIGFjY2lkZW50YWxseSBtb3ZlIGEgZmV3IHBpeGVscy5cclxuICAgKi9cclxuICBwcml2YXRlIGNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmIChwaXhlbCA+IDMpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbmNlbERyYWcoKSB7XHJcbiAgICB0aGlzLiR0aW1lb3V0LmNhbmNlbCh0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnU3RhcnRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkYXk6IHRoaXMuc2NoZWR1bGUuZGF5LFxyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmNvbmZpZy5udWxsRW5kcyA/XHJcbiAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZS5zdGFydCArIHRoaXMubnVsbEVuZFdpZHRoKSA6XHJcbiAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZS5lbmQpLFxyXG4gICAgICB2YWx1ZTogdGhpcy5zY2hlZHVsZS52YWx1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG5cclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuICAgIGxldCBkdXJhdGlvbiA9IHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgbmV3RW5kID0gdGhpcy5jb25maWcubnVsbEVuZHMgPyBudWxsIDogTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiB1aS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiB1aS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcclxuICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmNhbkFkZCA9IHRydWU7XHJcblxyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIG5nLWNsaWNrIGZyb20gYWNjaWRlbnRhbGx5IGZpcmluZyBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LCAyMDApLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5zZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5tZXJnZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZShwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAoIXRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZ0lmVGhyZXNob2xkRXhjZWVkZWQocGl4ZWwpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICBcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgIHRoaXMucmVzaXplU3RhcnQodWksIGRlbHRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzaXplRW5kKHVpLCBkZWx0YSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplU3RhcnQoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IHN0YXJ0Q2hhbmdlZCA9IHNjaGVkdWxlLnN0YXJ0ICE9PSBuZXdTdGFydDtcclxuICAgIGxldCBuZXdTdGFydEJlZm9yZU9yQXRFbmQgPSBuZXdTdGFydCA8PSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCBzY2hlZHVsZS5lbmQpIC0gMTtcclxuICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0ID0gbmV3U3RhcnQgPj0gMDtcclxuXHJcbiAgICBpZiAoc3RhcnRDaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCAmJiBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG4gICAgbGV0IGVuZENoYW5nZWQgPSBzY2hlZHVsZS5lbmQgIT09IG5ld0VuZDtcclxuICAgIGxldCBuZXdFbmRCZWZvcmVPckF0RW5kID0gbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgbGV0IG5ld0VuZEFmdGVyT3JBdFN0YXJ0ID0gbmV3RW5kID49IHNjaGVkdWxlLnN0YXJ0ICsgMTtcclxuXHJcbiAgICBpZiAoZW5kQ2hhbmdlZCAmJiBuZXdFbmRBZnRlck9yQXRTdGFydCAmJiBuZXdFbmRCZWZvcmVPckF0RW5kKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSwgdXBkYXRlOiB1cGRhdGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIHJlbW92ZVNjaGVkdWxlOiAnJicsXHJcbiAgICB1cGRhdGVTY2hlZHVsZTogJyYnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUmVzaXplU2VydmljZSB7XHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQ7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlUHJvdmlkZXIgZXh0ZW5kcyBhbmd1bGFyLklTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgICAgIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIERheXMge1xyXG4gICAgICAgIE1vbmRheSA9IDAsXHJcbiAgICAgICAgVHVlc2RheSA9IDEsXHJcbiAgICAgICAgV2VkbmVzZGF5LFxyXG4gICAgICAgIFRodXJzZGF5LFxyXG4gICAgICAgIEZyaWRheSxcclxuICAgICAgICBTYXR1cmRheSxcclxuICAgICAgICBTdW5kYXlcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgICAgIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShjdXN0b206IFRDdXN0b20pOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFRWYWx1ZT47XHJcblxyXG4gICAgICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgICAgICBnZXRTbmFwc2hvdCgpOiBUQ3VzdG9tW107XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICAgICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICAgICAgaW5pdGlhbERhdGE6IFRDdXN0b21bXTtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZSBleHRlbmRzIGFuZ3VsYXIuSUZpbHRlclNlcnZpY2Uge1xyXG4gICAgKG5hbWU6ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKTogKG1pbnV0ZXM6IG51bWJlcikgPT4gc3RyaW5nXHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPFQ+IHtcclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlIHNjaGVkdWxlcyB3aWxsIGJlIGFsbG93ZWQgJiByZXF1aXJlZCB0byBoYXZlIG5vIHNldCBlbmQgdGltZSAqL1xyXG4gICAgICAgIG51bGxFbmRzPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoZXNlIGNsYXNzZXMgd2lsbCBiZSBhcHBsaWVkIGRpcmVjdGx5IHRvIHRoZSBidXR0b25zICovXHJcbiAgICAgICAgYnV0dG9uQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgICAgICBjcmVhdGVJdGVtOiAoZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cywgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXSkgPT4gYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgICAgICAvKiogZGVmYXVsdFZhbHVlIHNob3VsZCBiZSBhc3NpZ25lZCBwZXIgc2V0IG9mIG9wdGlvbnMsIG5vdCBwZXIgaXRlbS4gRG8gbm90IGFzc2lnbiBmb3Igbm8gZGVmYXVsdCAqL1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZT86IFQ7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhbiBpdGVtIGlzIGNsaWNrZWQgaW4gb3JkZXIgdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBpdCAqL1xyXG4gICAgICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+PjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSwgQUxMIHNsb3RzIGluIHRoZSBjYWxlbmRhciBtdXN0IGJlIGZpbGxlZCBpbiBvcmRlciBmb3IgaXQgdG8gYmUgdmFsaWQgKi9cclxuICAgICAgICBmdWxsQ2FsZW5kYXI/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBhIHRpbWUgc2xvdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGJlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbWludXRlcyBsb25nICovXHJcbiAgICAgICAgbWF4VGltZVNsb3Q/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gdGhlIHNjaGVkdWxlciBjaGFuZ2VzLiBVc2UgaXQgdG8gaG9vayBpbnRvIGFuZ3VsYXIgZm9ybXNcclxuICAgICAgICAgKiBmb3Igc2V0dGluZyAkZGlydHkgb3IgdXBkYXRpbmcgdmFsaWRhdGlvbiBpbiBjYXNlcyB3aGVyZSBpdCBpcyBub3QgZGVzaXJhYmxlIHRvIHNhdmUgc2NoZWR1bGVzIGluZGl2aWR1YWxseS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkNoYW5nZT86IChpc1ZhbGlkOiBib29sZWFuKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgICAgICBpbnRlcnZhbD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3ZW4gdGhlIHNhdmUgYnV0dG9uIGlzIGNsaWNrZWQuIElmIHRoaXMgaXMgbm90IHBhc3NlZCwgbm8gc2F2ZSBidXR0b24gd2lsbCBiZSBwcmVzZW50LiAqL1xyXG4gICAgICAgIHNhdmVTY2hlZHVsZXI/OiAoKSA9PiBhbmd1bGFyLklQcm9taXNlPGFueT47XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAgICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAgICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIE5vdCBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IG1ha2VzIHRoaW5ncyBhIHdob29vbGUgbG90IGVhc2llciAqL1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHZhbHVlOiBUO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()">Save</button><br-weekly-scheduler adapter="adapter" options="model.options"></br-weekly-scheduler><code>Dirty: {{ isDirty }}</code> <code>Valid: {{ isValid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" options="model2.options"></br-weekly-scheduler><hr>Result: {{ result }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<br-ghost-slot ng-show="multiSliderCtrl.canRenderGhost()">+</br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 nullEnd: schedule.end === null,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.updateSchedule(schedule, update)"></br-weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" item="item"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.dirty || schedulerCtrl.validationErrors.length" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);
angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()">Save</button><br-weekly-scheduler adapter="adapter" options="model.options"></br-weekly-scheduler><code>Dirty: {{ isDirty }}</code> <code>Valid: {{ isValid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" options="model2.options"></br-weekly-scheduler><hr>Result: {{ result }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<br-ghost-slot ng-show="multiSliderCtrl.canRenderGhost()">+</br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 nullEnd: schedule.end === null,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.schedulerCtrl.updateSchedule(schedule, update)"></br-weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" item="item"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.dirty || schedulerCtrl.validationErrors.length" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);