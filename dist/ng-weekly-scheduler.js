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
        this.$element = $element;
        this.$q = $q;
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
        this.overlapService = overlapService;
        this.canAdd = true;
        this.isAdding = false;
        this.element = this.$element[0];
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
                    _this.schedulerCtrl.removeScheduleFromItem(_this.item, schedule);
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
    MultiSliderController.prototype.mergeAllOverlaps = function () {
        var _this = this;
        do {
            this.item.schedules.forEach(function (s) { return _this.mergeOverlaps(_this.item, s); });
        } while (this.item.needsOverlapsMerged());
    };
    MultiSliderController.prototype.mergeOverlaps = function (item, schedule) {
        this.schedulerCtrl.mergeOverlaps(item, schedule);
    };
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.isHoveringSlot = true;
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.isHoveringSlot = false;
    };
    MultiSliderController.prototype.merge = function (schedule) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlaps(this.item, schedule);
        this.mergeAllOverlaps();
    };
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    Object.defineProperty(MultiSliderController.prototype, "isDragging", {
        get: function () {
            return this.schedulerCtrl.dragging;
        },
        set: function (value) {
            this.schedulerCtrl.dragging = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiSliderController.prototype, "isHoveringSlot", {
        get: function () {
            return this.schedulerCtrl.hoveringSlot;
        },
        set: function (value) {
            this.schedulerCtrl.hoveringSlot = value;
        },
        enumerable: true,
        configurable: true
    });
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
        var _this = this;
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.groupService = groupService;
        this.dayMap = dayMap;
        this.endAdjusterService = endAdjusterService;
        this.overlapService = overlapService;
        this.scheduleValidatorService = scheduleValidatorService;
        this.overlapHandlers = (_a = {},
            _a[0 /* NoOverlap */] = function (item, current, other) { return _this.handleNoOverlap(item, current, other); },
            _a[1 /* CurrentIsInsideOther */] = function (item, current, other) { return _this.handleCurrentIsInsideOther(item, current, other); },
            _a[2 /* CurrentCoversOther */] = function (item, current, other) { return _this.handleCurrentCoversOther(item, current, other); },
            _a[3 /* OtherEndIsInsideCurrent */] = function (item, current, other) { return _this.handleOtherEndIsInsideCurrent(item, current, other); },
            _a[4 /* OtherStartIsInsideCurrent */] = function (item, current, other) { return _this.handleOtherStartIsInsideCurrent(item, current, other); },
            _a[5 /* OtherEndIsCurrentStart */] = function (item, current, other) { return _this.handleOtherEndIsCurrentStart(item, current, other); },
            _a[6 /* OtherStartIsCurrentEnd */] = function (item, current, other) { return _this.handleOtherStartIsCurrentEnd(item, current, other); },
            _a);
        this.defaultOptions = {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            monoSchedule: false,
            onChange: function (isValid) { return angular.noop(); }
        };
        var _a;
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
    WeeklySchedulerController.prototype.mergeOverlaps = function (item, schedule) {
        var _this = this;
        var schedules = item.schedules;
        schedules.forEach((function (el) {
            if (el !== schedule) {
                var overlapState = _this.overlapService.getOverlapState(_this.config, schedule, el);
                var overlapHandler = _this.overlapHandlers[overlapState];
                overlapHandler(item, schedule, el);
            }
        }));
    };
    WeeklySchedulerController.prototype.onChange = function () {
        this.config.onChange(!this.hasInvalidSchedule());
    };
    /**
     * Actually remove the schedule from both the screen and the model
     */
    WeeklySchedulerController.prototype.removeScheduleFromItem = function (item, schedule) {
        this.dragging = false;
        this.hoveringSlot = false;
        item.removeSchedule(schedule);
        this.dirty = true;
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
    // Overlap handlers
    WeeklySchedulerController.prototype.handleCurrentCoversOther = function (item, current, other) {
        // Here, it doesn't matter if the values match -- the covering slot can always "eat" the other one
        this.removeScheduleFromItem(item, other);
    };
    WeeklySchedulerController.prototype.handleCurrentIsInsideOther = function (item, current, other) {
        if (this.valuesMatch(current, other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeScheduleFromItem(item, other);
            this.updateSchedule(current, {
                day: other.day,
                start: other.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            // Just remove 'current'
            this.removeScheduleFromItem(item, current);
        }
    };
    WeeklySchedulerController.prototype.handleNoOverlap = function (item, current, other) {
        // Do nothing
    };
    WeeklySchedulerController.prototype.handleOtherEndIsInsideCurrent = function (item, current, other) {
        if (this.valuesMatch(current, other)) {
            this.removeScheduleFromItem(item, other);
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
    WeeklySchedulerController.prototype.handleOtherStartIsInsideCurrent = function (item, current, other) {
        if (this.valuesMatch(current, other)) {
            this.removeScheduleFromItem(item, other);
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
    WeeklySchedulerController.prototype.handleOtherEndIsCurrentStart = function (item, current, other) {
        if (this.valuesMatch(current, other)) {
            this.handleOtherEndIsInsideCurrent(item, current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    WeeklySchedulerController.prototype.handleOtherStartIsCurrentEnd = function (item, current, other) {
        if (this.valuesMatch(current, other)) {
            this.handleOtherStartIsInsideCurrent(item, current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    // End overlap handlers
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
    WeeklySchedulerController.prototype.valuesMatch = function (schedule, other) {
        return schedule.value === other.value;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VuZC1hZGp1c3Rlci9lbmQtYWRqdXN0ZXItc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dob3N0LXNsb3QvZ2hvc3Qtc2xvdC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2dyb3VwLWJ5L2dyb3VwLWJ5LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9oYW5kbGUvaGFuZGxlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaG91cmx5LWdyaWQvaG91cmx5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL292ZXJsYXAvb3ZlcmxhcC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzdHJpY3Rpb24tZXhwbGFuYXRpb25zL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy1jb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci9zY2hlZHVsZS1hcmVhLWNvbnRhaW5lci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9mdWxsLWNhbGVuZGFyLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21heC10aW1lLXNsb3QtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvbW9uby1zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9udWxsLWVuZC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9vdmVybGFwLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL3NjaGVkdWxlLXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2Nyb2xsL3Njcm9sbC1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS9taW51dGVzLWFzLXRleHQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS1yYW5nZS90aW1lLXJhbmdlLWNvbXBvbmVudC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheU1hcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvTnVsbEVuZFdpZHRoLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9JUmVzaXplU2VydmljZVByb3ZpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvRGF5cy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJBZGFwdGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyT3B0aW9ucy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDOUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTTtJQUMvRCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUk7UUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFdkIsTUFBTSxDQUFDLEtBQUssR0FBRztZQUNiLE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLFVBQVUsRUFBRSxVQUFDLEdBQUcsRUFBRSxTQUFTO29CQUN6QixPQUFPO3dCQUNMLEdBQUcsRUFBRSxHQUFHO3dCQUNSLFNBQVMsRUFBRSxTQUFTO3FCQUNyQixDQUFBO2dCQUNILENBQUM7Z0JBQ0QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFFBQVEsRUFBRSxVQUFVLFFBQVE7b0JBQzFCLE9BQU8sUUFBUSxDQUFDLGNBQU0sT0FBQSxRQUFRLEVBQVIsQ0FBUSxFQUFFLENB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QztJQUNsQyxDQUFDO0lBRU0sa0NBQVksR0FBbkIsVUFBb0IsT0FBWSxFQUFFLEtBQWlCLEVBQUUsS0FBYTtRQUM5RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7U0FDakM7YUFBTTtZQUNILElBQUksS0FBSyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFuRk0saUJBQUssR0FBRyw4QkFBOEIsQ0FBQztJQUV2QyxtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFrRnBDLGtCQUFDO0NBckZELEFBcUZDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0tBQzVCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnYnIud2Vla2x5U2NoZWR1bGVyJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckcScsICckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHEsICRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5pc0RpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgYnV0dG9uQ2xhc3NlczogWyd3b3chJ10sXHJcbiAgICAgICAgICBjcmVhdGVJdGVtOiAoZGF5LCBzY2hlZHVsZXMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBkYXk6IGRheSxcclxuICAgICAgICAgICAgICBzY2hlZHVsZXM6IHNjaGVkdWxlc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgZWRpdFNsb3Q6IGZ1bmN0aW9uIChzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gc2NoZWR1bGUsIDApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGludGVydmFsOiAxLFxyXG4gICAgICAgICAgb25DaGFuZ2U6IChpc1ZhbGlkKSA9PiB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0RpcnR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLmlzVmFsaWQgPSBpc1ZhbGlkO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGFzIGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5tb2RlbDIgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLm1vZGVsKTtcclxuICAgICAgJHNjb3BlLm1vZGVsMi5vcHRpb25zLmludGVydmFsID0gMTU7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlciA9IG5ldyBEZW1vQWRhcHRlcihbXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBEYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDEzODAsXHJcbiAgICAgICAgLy8gICBlbmQ6IG51bGwsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogNjAwLFxyXG4gICAgICAgICAgZW5kOiA5MDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5Nb25kYXksXHJcbiAgICAgICAgICBzdGFydDogNzIwLFxyXG4gICAgICAgICAgZW5kOiAxMDIwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuVHVlc2RheSxcclxuICAgICAgICAgIHN0YXJ0OiA2MCxcclxuICAgICAgICAgIGVuZDogMTgwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuV2VkbmVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDMwLFxyXG4gICAgICAgICAgZW5kOiAzMDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5GcmlkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogNjAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgXSk7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlclR3byA9IG5ldyBEZW1vQWRhcHRlcihKU09OLnBhcnNlKCdbe1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjowLFwiZW5kXCI6MTM1LFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJTZXRwb2ludGQwZjFkZlwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6MTM1LFwiZW5kXCI6MTk1LFwidmFsdWVcIjpcIlNldHBvaW50ZDBmMWRmXCJ9LHtcIiRjbGFzc1wiOlwiVW5vY2N1cGllZFwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6MTk1LFwiZW5kXCI6MjI1LFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjoyMjUsXCJlbmRcIjoyNzAsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlNldHBvaW50ZDBmMWRmXCIsXCJkYXlcIjozLFwic3RhcnRcIjoyNzAsXCJlbmRcIjozMzAsXCJ2YWx1ZVwiOlwiU2V0cG9pbnRkMGYxZGZcIn0se1wiJGNsYXNzXCI6XCJTZXRwb2ludGQwZjFkZlwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6MzMwLFwiZW5kXCI6MzYwLFwidmFsdWVcIjpcIlNldHBvaW50ZDBmMWRmXCJ9LHtcIiRjbGFzc1wiOlwiU2V0cG9pbnRkMGYxZGZcIixcImRheVwiOjMsXCJzdGFydFwiOjM2MCxcImVuZFwiOjUxMCxcInZhbHVlXCI6XCJTZXRwb2ludGQwZjFkZlwifSx7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjUxMCxcImVuZFwiOjU4NSxcInZhbHVlXCI6XCJVbm9jY3VwaWVkXCJ9LHtcIiRjbGFzc1wiOlwiVW5vY2N1cGllZFwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6NTg1LFwiZW5kXCI6NjMwLFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjo2MzAsXCJlbmRcIjo2NzUsXCJ2YWx1ZVwiOlwiVW5vY2N1cGllZFwifSx7XCIkY2xhc3NcIjpcIlVub2NjdXBpZWRcIixcImRheVwiOjMsXCJzdGFydFwiOjY3NSxcImVuZFwiOjY5MCxcInZhbHVlXCI6XCJVbm9jY3VwaWVkXCJ9LHtcIiRjbGFzc1wiOlwiVW5vY2N1cGllZFwiLFwiZGF5XCI6MyxcInN0YXJ0XCI6NjkwLFwiZW5kXCI6ODEwLFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn0se1wiJGNsYXNzXCI6XCJVbm9jY3VwaWVkXCIsXCJkYXlcIjozLFwic3RhcnRcIjo4MTAsXCJlbmRcIjowLFwidmFsdWVcIjpcIlVub2NjdXBpZWRcIn1dJykpO1xyXG5cclxuICAgICAgJHNjb3BlLnNhdmVBbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHNjb3BlLnJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyLmdldFNuYXBzaG90KCkpICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmFkYXB0ZXJUd28uZ2V0U25hcHNob3QoKSk7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbi8qKiBUaGUgZGF0YSBpcyBhbHJlYWR5IGluIGFuIGFjY2VwdGFibGUgZm9ybWF0IGZvciB0aGUgZGVtbyBzbyBqdXN0IHBhc3MgaXQgdGhyb3VnaCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9BZGFwdGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj4sIGJvb2xlYW4+IHtcclxuICBwdWJsaWMgaXRlbXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxib29sZWFuPltdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGluaXRpYWxEYXRhOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+W10sXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U25hcHNob3QoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4gc2NoZWR1bGUpKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKHJhbmdlKSB7XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfVxyXG59XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEVuZEFkanVzdGVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JNb2RlbChjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgZW5kOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZW5kID09PSBjb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGp1c3RFbmRGb3JWaWV3KGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShFbmRBZGp1c3RlclNlcnZpY2UuJG5hbWUsIEVuZEFkanVzdGVyU2VydmljZSk7IiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJHaG9zdFNsb3RDb250cm9sbGVyJztcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ2dob3N0U2xvdEN0cmwnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyR0aW1lb3V0J1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBtdWx0aVNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxuICAgIHByaXZhdGUgZHJhZ1RpbWVvdXQ6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD47XHJcblxyXG4gICAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdzbG90Jyk7XHJcbiAgICAgICAgdGhpcy5tdWx0aVNsaWRlckN0cmwuJGhvdmVyRWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRyYWcoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0RyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXVsdGlTbGlkZXJDdHJsLmFkanVzdEdob3N0KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXJ0RHJhZygpIHtcclxuICAgICAgICAvLyBEZWxheSBzdGFydCBvZiBkcmFnXHJcbiAgICAgICAgdGhpcy5kcmFnVGltZW91dCA9IHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICB9LCAyNTApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdG9wRHJhZygpIHtcclxuICAgICAgICAvLyBDYW5jZWwgdGltZW91dCBpZiBhcHBsaWNhYmxlXHJcbiAgICAgICAgdGhpcy4kdGltZW91dC5jYW5jZWwodGhpcy5kcmFnVGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIHRoaXMubXVsdGlTbGlkZXJDdHJsLm9uSG92ZXJFbGVtZW50Q2xpY2soKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickdob3N0U2xvdCc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBHaG9zdFNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBtdWx0aVNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPGRpdiBici1oYW5kbGVcclxuICAgICAgICAgICAgIG9uZHJhZ3N0YXJ0PVwiZ2hvc3RTbG90Q3RybC5zdGFydERyYWcoKVwiXHJcbiAgICAgICAgICAgICBvbmRyYWc9XCJnaG9zdFNsb3RDdHJsLmRyYWcoZXZlbnQpXCJcclxuICAgICAgICAgICAgIG9uZHJhZ3N0b3A9XCJnaG9zdFNsb3RDdHJsLnN0b3BEcmFnKClcIlxyXG4gICAgICAgID5cclxuICAgICAgICArXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihHaG9zdFNsb3RDb250cm9sbGVyLiRuYW1lLCBHaG9zdFNsb3RDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChHaG9zdFNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBHaG9zdFNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKlxyXG4gKiBXZSBzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IHRoZSBzY2hlZHVsZXMgYmVmb3JlaGFuZCwgcGFzcyBqdXN0IHRoZSBzY2hlZHVsZXMgaW4gYW5kIGhhdmUgdGhpcyBwYWNrYWdlIGJ1aWxkIHRoZSBpdGVtc1xyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGluIGNsaWVudHMuXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGxvZGFzaC5ncm91cEJ5IHRvIGtlZXAgdGhlIGZvb3RwcmludCBzbWFsbCBcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdyb3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJHcm91cFNlcnZpY2UnO1xyXG5cclxuICAgIGdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0ge1xyXG4gICAgICAgIGxldCBzZWVkOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHNjaGVkdWxlcy5yZWR1Y2UoKHJlZHVjZXIsIGN1cnJlbnRTY2hlZHVsZSwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBjdXJyZW50U2NoZWR1bGUuZGF5O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZWR1Y2VyW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHJlZHVjZXJba2V5XSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZWR1Y2VyW2tleV0ucHVzaChjdXJyZW50U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlZHVjZXI7XHJcbiAgICAgICAgfSwgc2VlZCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShHcm91cFNlcnZpY2UuJG5hbWUsIEdyb3VwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJIYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG5cclxuICAgIGxldCBtb3VzZWRvd25FdmVudDogc3RyaW5nID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0JztcclxuICAgIGxldCBtb3VzZW1vdmVFdmVudDogc3RyaW5nID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUnO1xyXG4gICAgbGV0IG1vdXNldXBFdmVudDogc3RyaW5nID0gJ21vdXNldXAgdG91Y2hlbmQnO1xyXG5cclxuICAgIGVsZW1lbnQub24obW91c2Vkb3duRXZlbnQsIChldmVudCkgPT4ge1xyXG4gICAgICB4ID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblxyXG4gICAgICAkZG9jdW1lbnQub24obW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZXVwRXZlbnQsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RhcnQoKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFBhZ2VYKGV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBldmVudC5wYWdlWCB8fCBnZXRUb3VjaGVzKGV2ZW50KVswXS5wYWdlWDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUb3VjaGVzKGV2ZW50OiBhbnkpOiBhbnkgeyAvLyB0b2RvXHJcbiAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmV0dXJuIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIGlmICghZXZlbnQudG91Y2hlcykge1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXMgPSBbZXZlbnQub3JpZ2luYWxFdmVudF07XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgcmV0dXJuIGV2ZW50LnRvdWNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIGxldCBwYWdlWCA9IGdldFBhZ2VYKGV2ZW50KTtcclxuICAgICAgdmFyIGRlbHRhID0gcGFnZVggLSB4O1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWcpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSwgZXZlbnQ6IGV2ZW50IH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJIb3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXmJyV2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vIFN0cmlwZSBpdCBieSBob3VyXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRxJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG51bGxFbmRXaWR0aDogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcbiAgXHJcbiAgcHVibGljICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuXHJcbiAgcHVibGljIGNhbkFkZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgcHVibGljIGlzQWRkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5tZXJnZUFsbE92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICBpZiAodGhpcy4kaG92ZXJFbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICBjb25zdCBwcmltYXJ5ID0gMTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0U2l6ZSA9IDYwO1xyXG5cclxuICAgICAgICAvLyBtdXN0IHVzZSAnYnV0dG9ucycgbm90ICdidXR0b24nXHJcbiAgICAgICAgbGV0IGlzRHJhZ2dpbmcgPSBlLmJ1dHRvbnMgPT09IHByaW1hcnk7XHJcblxyXG4gICAgICAgIGxldCB2YWwgPSB0aGlzLmdldEdob3N0TGVmdFZhbChlKTtcclxuXHJcbiAgICAgICAgaWYgKCFpc0RyYWdnaW5nKSB7XHJcbiAgICAgICAgICBsZXQgdXBkYXRlZExlZnQgPSB0aGlzLmdldFNsb3RMZWZ0KHZhbCk7XHJcbiAgICAgICAgICBsZXQgdXBkYXRlZFJpZ2h0ID0gdGhpcy5jb25maWcubnVsbEVuZHMgPyB0aGlzLmdldFNsb3RSaWdodCh2YWwsIHZhbCArIHRoaXMubnVsbEVuZFdpZHRoKSA6IHRoaXMuZ2V0U2xvdFJpZ2h0KHZhbCwgdmFsICsgZGVmYXVsdFNpemUpO1xyXG5cclxuICAgICAgICAgIHRoaXMuJGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiB1cGRhdGVkTGVmdCxcclxuICAgICAgICAgICAgcmlnaHQ6IHVwZGF0ZWRSaWdodFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRTbG90KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogYW5ndWxhci5JUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgIHN0YXJ0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5kID4gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2FuaXR5IGNoZWNrIC0tIGRvbid0IGFkZCBhIHNsb3Qgd2l0aCBhbiBlbmQgYmVmb3JlIHRoZSBzdGFydFxyXG4gICAgaWYgKGVuZCA8PSBzdGFydCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcS53aGVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNjaGVkdWxlID0ge1xyXG4gICAgICBkYXk6IHRoaXMuaXRlbS5kYXksXHJcbiAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgZW5kOiBlbmQsXHJcbiAgICAgIHZhbHVlOiB0aGlzLmNvbmZpZy5kZWZhdWx0VmFsdWVcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigoZWRpdGVkU2NoZWR1bGUpID0+IHtcclxuICAgICAgICB0aGlzLmFkZFNjaGVkdWxlVG9JdGVtKGVkaXRlZFNjaGVkdWxlKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy4kcS53aGVuKHRoaXMuYWRkU2NoZWR1bGVUb0l0ZW0oc2NoZWR1bGUpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBFeHBhbmQgZ2hvc3Qgd2hpbGUgZHJhZ2dpbmcgaW4gaXQgKi9cclxuICBwdWJsaWMgYWRqdXN0R2hvc3QoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgIGxldCBjdXJyZW50TGVmdFZhbDogbnVtYmVyID0gdGhpcy5nZXRHaG9zdExlZnRWYWwoZXZlbnQpO1xyXG5cclxuICAgIC8vIE1ha2UgcmlnaHQgZWRnZSBhZGp1c3QgdG8gbmV3IG1vdXNlIHBvc2l0aW9uXHJcbiAgICBsZXQgdXBkYXRlZFJpZ2h0VmFsOiBudW1iZXIgPSB0aGlzLnBpeGVsVG9WYWwoZXZlbnQucGFnZVgpO1xyXG4gICAgbGV0IHVwZGF0ZWRSaWdodFB4OiBzdHJpbmcgPSB0aGlzLmdldFNsb3RSaWdodChjdXJyZW50TGVmdFZhbCwgdXBkYXRlZFJpZ2h0VmFsKTtcclxuICAgIFxyXG4gICAgLy8gTG9jayBsZWZ0IGVkZ2UgaW4gcGxhY2UsIG9ubHkgdXBkYXRlIHJpZ2h0XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgcmlnaHQ6IHVwZGF0ZWRSaWdodFB4XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXREaXJ0eSgpIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5kaXJ0eSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuaXRlbS5hZGRTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlKHNjaGVkdWxlKTtcclxuXHJcbiAgICB0aGlzLnNldERpcnR5KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RWxlbWVudE9mZnNldFgoZWxlbTogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICByZXR1cm4gZWxlbVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uSG92ZXJFbGVtZW50Q2xpY2soKSB7XHJcbiAgICBpZiAodGhpcy5jYW5BZGQpIHtcclxuICAgICAgbGV0IGVsZW1lbnRPZmZzZXRYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgbGV0IGhvdmVyRWxlbWVudE9mZnNldFggPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGhvdmVyRWxlbWVudCkgLSBlbGVtZW50T2Zmc2V0WDtcclxuXHJcbiAgICAgIGxldCBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsZW1lbnRPZmZzZXRYKTtcclxuICAgICAgbGV0IHdpZHRoID0gdGhpcy5waXhlbFRvVmFsKHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIGxldCBlbmQgPSB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IG51bGwgOiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbCh0aGlzLmNvbmZpZywgc3RhcnQgKyB3aWR0aCk7XHJcblxyXG4gICAgICB0aGlzLmlzQWRkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2UoKTtcclxuICAgICAgICB0aGlzLmlzQWRkaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSBzY2hlZHVsZSBpcyBhYmxlIHRvIGJlIGVkaXRlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuRWRpdChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgaXNFZGl0YWJsZSA9IHRoaXMuaXRlbS5pc0VkaXRhYmxlKCk7XHJcbiAgICBsZXQgaGFzRWRpdEZ1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uKHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3QpO1xyXG4gICAgbGV0IGlzTm90QWN0aXZlID0gIXNjaGVkdWxlLiRpc0FjdGl2ZTtcclxuICAgIGxldCBpc05vdERyYWdnaW5nID0gIXRoaXMuaXNEcmFnZ2luZztcclxuXHJcbiAgICByZXR1cm4gaXNFZGl0YWJsZSAmJiBoYXNFZGl0RnVuY3Rpb24gJiYgaXNOb3RBY3RpdmUgJiYgaXNOb3REcmFnZ2luZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJhdGhlciB0aGFuIGhhdmluZyB0byBkZWFsIHdpdGggbW9kaWZ5aW5nIG1lcmdlT3ZlcmxhcHMgdG8gaGFuZGxlIG51bGxFbmRzIGNhbGVuZGFycyxcclxuICAgKiBqdXN0IHByZXZlbnQgdGhlIHVzZXIgZnJvbSBjcmVhdGluZyBhZGRpdGlvbmFsIHNsb3RzIGluIG51bGxFbmRzIGNhbGVuZGFycyB1bmxlc3MgdGhlcmUgYXJlIG5vIHNsb3RzIHRoZXJlIGFscmVhZHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5SZW5kZXJHaG9zdChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXRlbS5oYXNOb1NjaGVkdWxlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5pdGVtLmlzRWRpdGFibGUoKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNBZGRpbmcpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzSG92ZXJpbmdTbG90KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0R2hvc3RMZWZ0UGl4ZWwoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgIGxldCBlbGVtZW50T2Zmc2V0WCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICBsZXQgbGVmdCA9IGV2ZW50LnBhZ2VYIC0gZWxlbWVudE9mZnNldFggLSA0OyAvLyBnaXZlIGEgbGl0dGxlIHRvbGVyYW5jZSB0byBtYWtlIHN1cmUgdGhlIG1vdXNlIHBvaW50ZXIgaXMgYWx3YXlzIGluc2lkZSB0aGUgZ2hvc3RcclxuXHJcbiAgICByZXR1cm4gbGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0R2hvc3RMZWZ0VmFsKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICByZXR1cm4gdGhpcy5waXhlbFRvVmFsKHRoaXMuZ2V0R2hvc3RMZWZ0UGl4ZWwoZXZlbnQpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm0gYW4gZXh0ZXJuYWwgYWN0aW9uIHRvIGJyaW5nIHVwIGFuIGVkaXRvciBmb3IgYSBzY2hlZHVsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGlmICh0aGlzLmNhbkVkaXQoc2NoZWR1bGUpKSB7XHJcbiAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdChzY2hlZHVsZSkudGhlbigobmV3U2NoZWR1bGUpID0+IHtcclxuICAgICAgICBpZiAobmV3U2NoZWR1bGUuJGlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5yZW1vdmVTY2hlZHVsZUZyb21JdGVtKHRoaXMuaXRlbSwgc2NoZWR1bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxldCBwcmVtZXJnZVNjaGVkdWxlID0gYW5ndWxhci5jb3B5KG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICB0aGlzLm1lcmdlKG5ld1NjaGVkdWxlKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiBtZXJnaW5nIG11dGF0ZWQgdGhlIHNjaGVkdWxlIGZ1cnRoZXIsIHRoZW4gc2NoZWR1bGVyQ3RybC51cGRhdGVTY2hlZHVsZSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYWxsZWRcclxuICAgICAgICAgIC8vIFRoaXMgaXMgc28gdGhhdCBlZGl0cyB0aGF0IGRvbid0IHRyaWdnZXIgbWVyZ2VzIHN0aWxsIHRyaWdnZXIgb25DaGFuZ2UsXHJcbiAgICAgICAgICAvLyBidXQgZWRpdHMgdGhhdCBkbyB0cmlnZ2VyIG1lcmdlcyBkb24ndCB0cmlnZ2VyIGl0IHR3aWNlXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMocHJlbWVyZ2VTY2hlZHVsZSwgbmV3U2NoZWR1bGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyQ3RybC51cGRhdGVTY2hlZHVsZShzY2hlZHVsZSwgbmV3U2NoZWR1bGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSkuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZXREaXJ0eSgpO1xyXG4gICAgICAgIHNjaGVkdWxlLiRpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gSWYgdGhlcmUgaXMgYSBudWxsIGVuZCwgcGxhY2UgdGhlIGVuZCBvZiB0aGUgc2xvdCB0d28gaG91cnMgYXdheSBmcm9tIHRoZSBiZWdpbm5pbmcuXHJcbiAgICBpZiAodGhpcy5jb25maWcubnVsbEVuZHMgJiYgZW5kID09PSBudWxsKSB7XHJcbiAgICAgIGVuZCA9IHN0YXJ0ICsgdGhpcy5udWxsRW5kV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQW4gZW5kIG9mIDAgc2hvdWxkIGRpc3BsYXkgYWxsbGwgdGhlIHdheSB0byB0aGUgcmlnaHQsIHVwIHRvIHRoZSBlZGdlXHJcbiAgICBlbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCBlbmQpO1xyXG5cclxuICAgIC8vIFdlIHdhbnQgdGhlIHJpZ2h0IHNpZGUgdG8gZ28gL3VwIHRvLyB0aGUgaW50ZXJ2YWwgaXQgcmVwcmVzZW50cywgbm90IGNvdmVyIGl0LCBzbyB3ZSBtdXN0IHN1YnN0cmFjdCAxIGludGVydmFsXHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoZW5kIC0gdGhpcy5jb25maWcuaW50ZXJ2YWwpO1xyXG5cclxuICAgIGxldCBvZmZzZXRSaWdodCA9IHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRMZWZ0ICsgdW5kZXJseWluZ0ludGVydmFsLm9mZnNldFdpZHRoO1xyXG4gICAgbGV0IGNvbnRhaW5lckxlZnQgPSB0aGlzLmdldEVsZW1lbnRPZmZzZXRYKHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLiRlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0O1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodDtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHZhbDogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xyXG4gICAgLy8gU2xpZ2h0bHkgaGFja3kgYnV0IGRvZXMgdGhlIGpvYi4gVE9ETyA/XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIGxlZnQgb2YgdGhlIGxlZnRtb3N0IGludGVydmFsLCBzbyByZXR1cm4gdGhhdCBpbnN0ZWFkXHJcbiAgICBpZiAodmFsIDwgMCkge1xyXG4gICAgICB2YWwgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSByaWdodCBvZiB0aGUgcmlnaHRtb3N0IGludGVydmFsIC0tIHRoZSBsYXN0IGludGVydmFsIHdpbGwgbm90IGFjdHVhbGx5IHJlbmRlciB3aXRoIGEgXCJyZWxcIiB2YWx1ZVxyXG4gICAgbGV0IHJpZ2h0bW9zdCA9IHRoaXMuY29uZmlnLm1heFZhbHVlIC0gdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcblxyXG4gICAgaWYgKHZhbCA+IHJpZ2h0bW9zdCkge1xyXG4gICAgICB2YWwgPSByaWdodG1vc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQucGFyZW50KClbMF0ucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VBbGxPdmVybGFwcygpIHtcclxuICAgIGRvIHtcclxuICAgICAgdGhpcy5pdGVtLnNjaGVkdWxlcy5mb3JFYWNoKHMgPT4gdGhpcy5tZXJnZU92ZXJsYXBzKHRoaXMuaXRlbSwgcykpO1xyXG4gICAgfSB3aGlsZSAodGhpcy5pdGVtLm5lZWRzT3ZlcmxhcHNNZXJnZWQoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1lcmdlT3ZlcmxhcHMoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwubWVyZ2VPdmVybGFwcyhpdGVtLCBzY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlT3ZlcigpIHtcclxuICAgIHRoaXMuaXNIb3ZlcmluZ1Nsb3QgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzY2hlZHVsZSB3ZSB3ZXJlIHdvcmtpbmcgd2l0aCB0byBiZSB0aGUgbW9zdCBpbXBvcnRhbnQsIHNvIGhhbmRsZSBpdHMgb3ZlcmxhcHMgZmlyc3QuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHModGhpcy5pdGVtLCBzY2hlZHVsZSk7XHJcbiAgICB0aGlzLm1lcmdlQWxsT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzRHJhZ2dpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXJDdHJsLmRyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgc2V0IGlzRHJhZ2dpbmcodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5kcmFnZ2luZyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzSG92ZXJpbmdTbG90KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyQ3RybC5ob3ZlcmluZ1Nsb3Q7XHJcbiAgfVxyXG5cclxuICBzZXQgaXNIb3ZlcmluZ1Nsb3QodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5ob3ZlcmluZ1Nsb3QgPSB2YWx1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBpdGVtOiAnPSdcclxuICB9O1xyXG5cclxuICBjb250cm9sbGVyID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgT3ZlcmxhcFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXRPdmVybGFwU3RhdGUoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IE92ZXJsYXBTdGF0ZSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRTdGFydCA9IGN1cnJlbnQuc3RhcnQ7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRFbmQgPSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KGNvbmZpZywgY3VycmVudC5lbmQpO1xyXG5cclxuICAgICAgICBsZXQgb3RoZXJTdGFydCA9IG90aGVyLnN0YXJ0O1xyXG4gICAgICAgIGxldCBvdGhlckVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBvdGhlci5lbmQpO1xyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPj0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbmQgPj0gb3RoZXJFbmQgJiYgY3VycmVudFN0YXJ0IDw9IG90aGVyU3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJFbmQgPiBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPj0gY3VycmVudFN0YXJ0ICYmIG90aGVyU3RhcnQgPCBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA9PT0gY3VycmVudFN0YXJ0ICYmIG90aGVyRW5kIDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyU3RhcnQgPT09IGN1cnJlbnRFbmQgJiYgb3RoZXJTdGFydCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuTm9PdmVybGFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFNlcnZpY2UuJG5hbWUsIE92ZXJsYXBTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlUHJvdmlkZXIgaW1wbGVtZW50cyBici53ZWVrbHlTY2hlZHVsZXIuSVJlc2l6ZVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICBwdWJsaWMgc3RhdGljICRuYW1lID0gJ2JyLndlZWtseVNjaGVkdWxlci5yZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLiRnZXQuJGluamVjdCA9IFtcclxuICAgICAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICAgICAnJHdpbmRvdydcclxuICAgICAgICBdXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjdXN0b21SZXNpemVFdmVudHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzZXJ2aWNlSW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cyA9IGV2ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgJGdldChcclxuICAgICAgICAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlLFxyXG4gICAgICAgICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICk6IElSZXNpemVTZXJ2aWNlIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbml0aWFsaXplOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGV4aXN0cyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gd2UgaGF2ZSB0byAkYXBwbHkgdGhlIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21SZXNpemVFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oZXZlbnQsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUluaXRpYWxpemVkID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnByb3ZpZGVyKFJlc2l6ZVNlcnZpY2VQcm92aWRlci4kbmFtZSwgUmVzaXplU2VydmljZVByb3ZpZGVyKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCAocmVzaXplU2VydmljZTogSVJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdyZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwnO1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJGZpbHRlciddO1xyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4cGxhbmF0aW9uczogeyBba2V5IGluIFZhbGlkYXRpb25FcnJvcl0/OiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgcHJpdmF0ZSB2aW9sYXRpb25zOiB7IFtrZXkgaW4gVmFsaWRhdGlvbkVycm9yXT86IGJvb2xlYW4gfSA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGZpbHRlcjogSVdlZWtseVNjaGVkdWxlckZpbHRlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRkb0NoZWNrKCkge1xyXG4gICAgICAgIGxldCBlcnJvcnMgPSB0aGlzLnNjaGVkdWxlckN0cmwudmFsaWRhdGlvbkVycm9ycztcclxuXHJcbiAgICAgICAgdGhpcy52aW9sYXRpb25zID0ge1xyXG4gICAgICAgICAgICBbVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbl06IGVycm9ycy5pbmRleE9mKFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb24pID4gLTEsXHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb25dOiBlcnJvcnMuaW5kZXhPZihWYWxpZGF0aW9uRXJyb3IuTWF4VGltZVNsb3RWaW9sYXRpb24pID4gLTEsXHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uXTogZXJyb3JzLmluZGV4T2YoVmFsaWRhdGlvbkVycm9yLk1vbm9TY2hlZHVsZVZpb2xhdGlvbikgPiAtMVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgJG9uSW5pdCgpIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZztcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5tYXhUaW1lU2xvdCkge1xyXG4gICAgICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSB0aGlzLiRmaWx0ZXIoJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpKGNvbmZpZy5tYXhUaW1lU2xvdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbl0gPSBgTWF4IHRpbWUgc2xvdCBsZW5ndGg6ICR7bWF4VGltZVNsb3R9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb25dID0gJ0ZvciB0aGlzIGNhbGVuZGFyLCBldmVyeSBkYXkgbXVzdCBiZSBjb21wbGV0ZWx5IGZ1bGwgb2Ygc2NoZWR1bGVzLic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1vbm9TY2hlZHVsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uXSA9ICdUaGlzIGNhbGVuZGFyIG1heSBvbmx5IGhhdmUgb25lIHRpbWUgc2xvdCBwZXIgZGF5JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk51bGxFbmRWaW9sYXRpb25dID0gJ0l0ZW1zIGluIHRoaXMgY2FsZW5kYXIgZG8gbm90IGhhdmUgZW5kIHRpbWVzLiBTY2hlZHVsZWQgZXZlbnRzIGJlZ2luIGF0IHRoZSBzdGFydCB0aW1lIGFuZCBlbmQgd2hlbiB0aGV5IGFyZSBmaW5pc2hlZC4nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnMnO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgICByZXF1aXJlID0ge1xyXG4gICAgICAgIHNjaGVkdWxlckN0cmw6ICdeYnJXZWVrbHlTY2hlZHVsZXInXHJcbiAgICB9O1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcm93IGV4cGxhbmF0aW9uc1wiIG5nLWNsYXNzPVwieyB2aW9sYXRpb246IHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC52aW9sYXRpb25zW2tleV0gfVwiIG5nLXJlcGVhdD1cIihrZXksIGV4cGxhbmF0aW9uKSBpbiByZXN0cmljdGlvbkV4cGxhbmF0aW9uc0N0cmwuZXhwbGFuYXRpb25zXCI+XHJcbiAgICAgICAgICAgIHt7IGV4cGxhbmF0aW9uIH19XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbXBvbmVudC4kbmFtZSwgbmV3IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50KCkpXHJcbiAgICAuY29udHJvbGxlcihSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIuJG5hbWUsIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlcik7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcic7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50JyxcclxuICAgICAgICAnJHNjb3BlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJTY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgICBwcml2YXRlIHNjcm9sbFNlcnZpY2U6IFNjcm9sbFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRwb3N0TGluaygpIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07IC8vIGdyYWIgcGxhaW4ganMsIG5vdCBqcWxpdGVcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxTZXJ2aWNlLmhpamFja1Njcm9sbChlbGVtZW50LCAyMCk7XHJcbiAgICAgICAgdGhpcy56b29tU2VydmljZS5yZXNldFpvb20oZWxlbWVudCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NX0lOLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbihlbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclNjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLmZ1bGxDYWxlbmRhcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFdoZW4gdGhpcyBvcHRpb24gaXMgdHJ1ZSB3ZSBzaG91bGQgZW5mb3JjZSB0aGF0IHRoZXJlIGFyZSBubyBnYXBzIGluIHRoZSBzY2hlZHVsZXNcclxuICAgICAgICBsZXQgbGVuID0gc2NoZWR1bGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHNjaGVkdWxlcywgaXQgYXV0b21hdGljYWxseSBmYWlscy5cclxuICAgICAgICBpZiAoIWxlbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBvbmx5IG9uZSBpdGVtIHdlIHNob3VsZCBjaGVjayB0aGF0IGl0IHNwYW5zIHRoZSB3aG9sZSByYW5nZVxyXG4gICAgICAgIGlmIChsZW4gPT09IDEpIHtcclxuICAgICAgICAgICAgbGV0IHNjaGVkdWxlID0gc2NoZWR1bGVzWzBdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShzY2hlZHVsZS5zdGFydCkgJiYgdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUoc2NoZWR1bGUuZW5kLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbW9yZSwgY29tcGFyZSB0d28gYXQgYSB0aW1lIHVudGlsIHRoZSBlbmRcclxuICAgICAgICBsZXQgbG9vcExlbiA9IGxlbiAtIDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIFNvcnQgYnkgc3RhcnQgdGltZSBmaXJzdFxyXG4gICAgICAgIGxldCBzb3J0ZWRTY2hlZHVsZXMgPSBzY2hlZHVsZXMuc29ydCgoYSwgYikgPT4gYS5zdGFydCA+IGIuc3RhcnQgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvb3BMZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgZmlyc3QgaXRlbSBsYW5kcyBhdCAwXHJcbiAgICAgICAgICAgIGlmIChpID09PSAwICYmICF0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKGN1cnJlbnQuc3RhcnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGxhc3QgaXRlbSBsYW5kcyBhdCBtYXhWYWx1ZVxyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbG9vcExlbiAtIDEgJiYgIXRoaXMudmFsaWRhdGVFbmRBdE1heFZhbHVlKG5leHQuZW5kLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBjdXJyZW50LmVuZCA9PT0gbmV4dC5zdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVN0YXJ0QXRNaW5WYWx1ZShzdGFydDogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXJ0ID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsaWRhdGVFbmRBdE1heFZhbHVlKGVuZDogbnVtYmVyLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pikge1xyXG4gICAgICAgIHJldHVybiAoZW5kIHx8IGNvbmZpZy5tYXhWYWx1ZSkgPT09IGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIEZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgbWF4VGltZVNsb3QgPSBjb25maWcubWF4VGltZVNsb3Q7XHJcblxyXG4gICAgICAgIGlmICghbWF4VGltZVNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlcy5zb21lKHMgPT4gcy52YWx1ZSAhPT0gY29uZmlnLmRlZmF1bHRWYWx1ZSAmJiBzLmVuZCAtIHMuc3RhcnQgPiBtYXhUaW1lU2xvdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbXBvcnRhbnQgbm90ZSAtLSB0aGlzIGRvZXMgbm90IHZhbGlkYXRlIHRoYXQgb25seSBvbmUgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLCBidXQgcmF0aGVyIHRoYXQgb25seSBvbmUgTk9OLURFRkFVTFQgc2NoZWR1bGUgZXhpc3RzIHBlciBpdGVtLiAqL1xyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYSBkZWZhdWx0IHZhbHVlIGlzIGRlZmluZWQsIHNjaGVkdWxlcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGRvbid0IGNvdW50IC0tIG9uZSBub24tZGVmYXVsdCBzY2hlZHVsZSBwZXIgaXRlbS5cclxuICAgICAgICBsZXQgc2NoZWR1bGVzVG9WYWxpZGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGNvbmZpZy5kZWZhdWx0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXMuZmlsdGVyKHNjaGVkdWxlID0+IHNjaGVkdWxlLnZhbHVlICE9PSBjb25maWcuZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXNUb1ZhbGlkYXRlID0gc2NoZWR1bGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBhbGxvd2VkIGVtcHR5IG9yIDEgc2NoZWR1bGUgcGVyIGl0ZW1cclxuICAgICAgICByZXR1cm4gIXNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoIHx8IHNjaGVkdWxlc1RvVmFsaWRhdGUubGVuZ3RoID09PSAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk51bGxFbmRWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZXMubGVuZ3RoIDw9IDEgJiYgc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCA9PT0gbnVsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5ldmVyeShzY2hlZHVsZSA9PiBzY2hlZHVsZS5lbmQgIT09IG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwVmFsaWRhdG9yU2VydmljZSBpbXBsZW1lbnRzIFZhbGlkYXRvclNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBTZXJ2aWNlJ1xyXG4gICAgXTtcclxuICAgIFxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuT3ZlcmxhcFZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHNjaGVkdWxlc1tpXTtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBzY2hlZHVsZXNbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZhbHVlc01hdGNoID0gY3VycmVudC52YWx1ZSA9PT0gbmV4dC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXhWYWx1ZSA9IGNvbmZpZy5tYXhWYWx1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZShjb25maWcsIGN1cnJlbnQsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwLCBPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZCwgT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclZhbGlkYXRpb25TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck51bGxFbmRWYWxpZGF0b3JTZXJ2aWNlJyxcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSdcclxuICAgIF1cclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBudWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRWYWxpZGF0aW9uRXJyb3JzKGl0ZW06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IFZhbGlkYXRpb25FcnJvcltdIHtcclxuICAgICAgICBsZXQgdmFsaWRhdG9yczogVmFsaWRhdG9yU2VydmljZVtdID0gW1xyXG4gICAgICAgICAgICB0aGlzLm1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5tb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgICAgICB0aGlzLm51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHRoaXMuZnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5vdmVybGFwVmFsaWRhdG9yU2VydmljZVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQ6IFZhbGlkYXRpb25FcnJvcltdID0gW107XHJcblxyXG4gICAgICAgIHZhbGlkYXRvcnMuZm9yRWFjaCh2YWxpZGF0b3IgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRvci52YWxpZGF0ZShpdGVtLnNjaGVkdWxlcywgY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsaWRhdG9yLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZS4kbmFtZSwgU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2Nyb2xsU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY3JvbGxTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE1pbnV0ZXNBc1RleHRGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYGA7XHJcblxyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCBoYXNIb3VycyA9IGhvdXJzID4gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoYXNIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAke2hvdXJzfSBob3Vyc2A7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBtaW4gPSBtaW51dGVzICUgNjA7XHJcbiAgICAgICAgICAgIGxldCBoYXNNaW51dGVzID0gbWluID4gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoYXNNaW51dGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzSG91cnMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gJyAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBgJHttaW59IG1pbnV0ZSR7bWluID4gMSA/ICdzJyA6ICcnfWA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihNaW51dGVzQXNUZXh0RmlsdGVyLiRuYW1lLCBbTWludXRlc0FzVGV4dEZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtaW51dGVzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XHJcbiAgICAgICAgICAgIGxldCByZW1haW5pbmdNaW51dGVzID0gKG1pbnV0ZXMgLSAoaG91cnMgKiA2MCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGhvdXJzID4gMTEgJiYgaG91cnMgPCAyNCA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdNaW51dGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGRpc3BsYXlIb3VycyA9IGhvdXJzICUgMTIgfHwgMTI7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7ZGlzcGxheUhvdXJzfToke3JlbWFpbmluZ01pbnV0ZXN9JHttZXJpZGllbX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5maWx0ZXIoVGltZU9mRGF5RmlsdGVyLiRuYW1lLCBbVGltZU9mRGF5RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZSc7XHJcblxyXG4gICAgYmluZGluZ3MgPSB7XHJcbiAgICAgICAgc2NoZWR1bGU6ICc8J1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgY29udHJvbGxlckFzID0gVGltZVJhbmdlQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYFxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiB0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fS17eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLmVuZCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIG5nLWlmPVwidGltZVJhbmdlQ3RybC5oYXNTdGFydCAmJiAhdGltZVJhbmdlQ3RybC5oYXNFbmRcIj57eyB0aW1lUmFuZ2VDdHJsLnNjaGVkdWxlLnN0YXJ0IHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX0gdW50aWw8L3NwYW4+XHJcbiAgICBgXHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZVJhbmdlQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAndGltZVJhbmdlQ3RybCc7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJUaW1lUmFuZ2VDb250cm9sbGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhc1N0YXJ0OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBoYXNFbmQ6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICAgICRvbkluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5oYXNTdGFydCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuc2NoZWR1bGUuc3RhcnQpO1xyXG4gICAgICAgIHRoaXMuaGFzRW5kID0gYW5ndWxhci5pc0RlZmluZWQodGhpcy5zY2hlZHVsZS5lbmQpICYmIHRoaXMuc2NoZWR1bGUuZW5kICE9PSBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbXBvbmVudChUaW1lUmFuZ2VDb21wb25lbnQuJG5hbWUsIG5ldyBUaW1lUmFuZ2VDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWUsIFRpbWVSYW5nZUNvbnRyb2xsZXIpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRxJyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyR3JvdXBTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckRheU1hcCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyVmFsaWRhdGlvblNlcnZpY2UnLFxyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkcTogYW5ndWxhci5JUVNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlIGdyb3VwU2VydmljZTogR3JvdXBTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBkYXlNYXA6IHsgW2tleTogbnVtYmVyXTogc3RyaW5nIH0sXHJcbiAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBvdmVybGFwU2VydmljZTogT3ZlcmxhcFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogU2NoZWR1bGVWYWxpZGF0aW9uU2VydmljZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfb3JpZ2luYWxJdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcblxyXG4gIHByaXZhdGUgb3ZlcmxhcEhhbmRsZXJzOiB7IFtrZXk6IG51bWJlcl06IChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4gdm9pZDsgfSA9IHtcclxuICAgIFtPdmVybGFwU3RhdGUuTm9PdmVybGFwXTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU5vT3ZlcmxhcChpdGVtLCBjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLkN1cnJlbnRJc0luc2lkZU90aGVyXTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudENvdmVyc090aGVyXTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZUN1cnJlbnRDb3ZlcnNPdGhlcihpdGVtLCBjdXJyZW50LCBvdGhlciksXHJcbiAgICBbT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNJbnNpZGVDdXJyZW50XTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNJbnNpZGVDdXJyZW50KGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudF06IChpdGVtLCBjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF06IChpdGVtLCBjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlckVuZElzQ3VycmVudFN0YXJ0KGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJTdGFydElzQ3VycmVudEVuZF06IChpdGVtLCBjdXJyZW50LCBvdGhlcikgPT4gdGhpcy5oYW5kbGVPdGhlclN0YXJ0SXNDdXJyZW50RW5kKGl0ZW0sIGN1cnJlbnQsIG90aGVyKVxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgYWRhcHRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGFueSwgYW55PjtcclxuXHJcbiAgLyoqIHNob3VsZCBiZSB0cnVlIGlmIHRoZSBzY2hlZHVsZXIgaGFzIGJlZW4gaW50ZXJhY3RlZCB3aXRoICovXHJcbiAgcHVibGljIGRpcnR5OiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IGhvbGRpbmcgZG93biB0aGUgcHJpbWFyeSBtb3VzZSBidXR0b24gb24gYSBzbG90ICovXHJcbiAgcHVibGljIGRyYWdnaW5nOiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IGhvbGRpbmcgdGhlIG1vdXNlIHBvaW50ZXIgb3ZlciBhIHNsb3QgKi9cclxuICBwdWJsaWMgaG92ZXJpbmdTbG90OiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHNjaGVkdWxlciBiZWNhbWUgaW52YWxpZCBhZnRlciBiZWluZyBpbml0aWFsaXplZCAqL1xyXG4gIHB1YmxpYyBpbnZhbGlkOiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHNjaGVkdWxlciB3YXMgKippbml0aWFsaXplZCoqIHdpdGggaW52YWxpZCB2YWx1ZXMgKi9cclxuICBwdWJsaWMgc3RhcnRlZFdpdGhJbnZhbGlkU2NoZWR1bGU6IGJvb2xlYW47XHJcbiAgcHVibGljIGhvdmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+O1xyXG4gIHB1YmxpYyBpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W107XHJcbiAgcHVibGljIG9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+O1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyT3B0aW9uczxhbnk+ID0ge1xyXG4gICAgY3JlYXRlSXRlbTogKGRheSwgc2NoZWR1bGVzKSA9PiB7IHJldHVybiB7IGRheTogZGF5LCBzY2hlZHVsZXM6IHNjaGVkdWxlcyB9IH0sXHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgb25DaGFuZ2U6IChpc1ZhbGlkKSA9PiBhbmd1bGFyLm5vb3AoKVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyB2YWxpZGF0aW9uRXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXTtcclxuXHJcbiAgJGRvQ2hlY2soKSB7XHJcbiAgICB0aGlzLnZhbGlkYXRpb25FcnJvcnMgPSB0aGlzLmdldFZhbGlkYXRpb25FcnJvcnMoKTtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcbiAgICB0aGlzLmJ1aWxkSXRlbXNGcm9tQWRhcHRlcigpO1xyXG4gICAgdGhpcy5zdGFydGVkV2l0aEludmFsaWRTY2hlZHVsZSA9IHRoaXMuaGFzSW52YWxpZFNjaGVkdWxlKCk7XHJcbiAgICB0aGlzLndhdGNoQWRhcHRlcigpO1xyXG4gICAgdGhpcy53YXRjaEhvdmVyQ2xhc3MoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNJbnZhbGlkU2NoZWR1bGUoKSB7XHJcbiAgICBsZXQgdmFsaWRhdGlvbkVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSB0aGlzLmdldFZhbGlkYXRpb25FcnJvcnMoKTtcclxuXHJcbiAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlT3ZlcmxhcHMoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLmZvckVhY2goKGVsID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgc2NoZWR1bGUsIGVsKTtcclxuICAgICAgICBsZXQgb3ZlcmxhcEhhbmRsZXIgPSB0aGlzLm92ZXJsYXBIYW5kbGVyc1tvdmVybGFwU3RhdGVdO1xyXG5cclxuICAgICAgICBvdmVybGFwSGFuZGxlcihpdGVtLCBzY2hlZHVsZSwgZWwpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25DaGFuZ2UoKSB7XHJcbiAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSghdGhpcy5oYXNJbnZhbGlkU2NoZWR1bGUoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBY3R1YWxseSByZW1vdmUgdGhlIHNjaGVkdWxlIGZyb20gYm90aCB0aGUgc2NyZWVuIGFuZCB0aGUgbW9kZWxcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcblxyXG4gICAgaXRlbS5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcblxyXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21taXQgbmV3IHZhbHVlcyB0byB0aGUgc2NoZWR1bGVcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlU2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHNjaGVkdWxlLnN0YXJ0ID0gdXBkYXRlLnN0YXJ0O1xyXG4gICAgc2NoZWR1bGUuZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwodGhpcy5jb25maWcsIHVwZGF0ZS5lbmQpO1xyXG5cclxuICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtcyhpdGVtczogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyhpdGVtcyk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVpbGRJdGVtcyh0aGlzLmdldEl0ZW1zRnJvbUFkYXB0ZXIoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEl0ZW1zRnJvbUFkYXB0ZXIoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuYWRhcHRlcikge1xyXG4gICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5hZGFwdGVyLmluaXRpYWxEYXRhLm1hcChkYXRhID0+IHRoaXMuYWRhcHRlci5jdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UoZGF0YSkpO1xyXG4gICAgICBsZXQgZ3JvdXBlZFNjaGVkdWxlcyA9IHRoaXMuZ3JvdXBTZXJ2aWNlLmdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcblxyXG4gICAgICBmb3IgKGxldCBrZXkgaW4gZ3JvdXBlZFNjaGVkdWxlcykge1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5jcmVhdGVJdGVtKHBhcnNlSW50KGtleSwgMTApLCBncm91cGVkU2NoZWR1bGVzW2tleV0pO1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZhbGlkYXRpb25FcnJvcnMoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiB0aGlzLnNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS5nZXRWYWxpZGF0aW9uRXJyb3JzKGl0ZW0sIHRoaXMuY29uZmlnKSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWd1cmUob3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4ge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciB1c2VyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZCh1c2VyT3B0aW9ucywge1xyXG4gICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXHJcbiAgICAgIG1heFZhbHVlOiBtaW51dGVzSW5EYXksXHJcbiAgICAgIGhvdXJDb3VudDogaG91cnNJbkRheSxcclxuICAgICAgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudCxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUl0ZW0oZGF5OiBudW1iZXIsIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgICBsZXQgYnVpbGRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSB0aGlzLmNvbmZpZy5jcmVhdGVJdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuXHJcbiAgICByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChidWlsZGVyLCB7IGxhYmVsOiB0aGlzLmRheU1hcFtkYXldIH0pO1xyXG5cclxuICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVySXRlbSh0aGlzLmNvbmZpZywgcmVzdWx0LCB0aGlzLm92ZXJsYXBTZXJ2aWNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzY2hlZHVsZXIgc2hvdWxkIGFsd2F5cyBzaG93IGFsbCBkYXlzLCBldmVuIGlmIGl0IHdhcyBub3QgcGFzc2VkIGFueSBzY2hlZHVsZXMgZm9yIHRoYXQgZGF5XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBmaWxsSXRlbXMoaXRlbXM6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBsZXQgcmVzdWx0OiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSA9IFtdO1xyXG5cclxuICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmRheU1hcCwgKGRheTogc3RyaW5nLCBzdHJpbmdLZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICBsZXQga2V5ID0gcGFyc2VJbnQoc3RyaW5nS2V5LCAxMCk7XHJcbiAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5kYXkgPT09IGtleSk7XHJcbiAgICAgIGxldCBpdGVtOiBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCA/IGZpbHRlcmVkSXRlbXNbMF0gOiBudWxsO1xyXG5cclxuICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5jcmVhdGVJdGVtKGtleSwgW10pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJZiB0aGUgaXRlbSBESUQgZXhpc3QganVzdCBzZXQgdGhlIGxhYmVsXHJcbiAgICAgICAgaXRlbS5sYWJlbCA9IGRheTtcclxuXHJcbiAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBhbmd1bGFyLmNvcHkocmVzdWx0KS5zb3J0KChhLCBiKSA9PiBhLmRheSA+IGIuZGF5ID8gMSA6IC0xKTtcclxuICB9XHJcblxyXG4gIC8vIE92ZXJsYXAgaGFuZGxlcnNcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIC8vIEhlcmUsIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHRoZSB2YWx1ZXMgbWF0Y2ggLS0gdGhlIGNvdmVyaW5nIHNsb3QgY2FuIGFsd2F5cyBcImVhdFwiIHRoZSBvdGhlciBvbmVcclxuICAgIHRoaXMucmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtLCBvdGhlcik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgLy8gUmVtb3ZlICdvdGhlcicgJiBtYWtlIGN1cnJlbnQgZXhwYW5kIHRvIGZpdCB0aGUgb3RoZXIgc2xvdFxyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlRnJvbUl0ZW0oaXRlbSwgb3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEp1c3QgcmVtb3ZlICdjdXJyZW50J1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlRnJvbUl0ZW0oaXRlbSwgY3VycmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gRG8gbm90aGluZ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtLCBvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZUZyb21JdGVtKGl0ZW0sIG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LmVuZCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoaXRlbSwgY3VycmVudCwgb3RoZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChpdGVtLCBjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRW5kIG92ZXJsYXAgaGFuZGxlcnNcclxuXHJcbiAgcHJpdmF0ZSByZXNldFpvb20oKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNFVF9aT09NKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgem9vbUluKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTV9JTik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJvbGxiYWNrKCkge1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zKHRoaXMuX29yaWdpbmFsSXRlbXMpO1xyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnNhdmVTY2hlZHVsZXIoKS50aGVuKCgpID0+IHRoaXMuZGlydHkgPSBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoQWRhcHRlcigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaCgoKSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFkYXB0ZXI7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2F0Y2hIb3ZlckNsYXNzKCkge1xyXG4gICAgY29uc3QgcHVsc2VDbGFzcyA9ICdwdWxzZSc7XHJcbiAgICBjb25zdCBwdWxzZVNlbGVjdG9yID0gYC4ke3B1bHNlQ2xhc3N9YDtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5ob3ZlckNsYXNzLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZChwdWxzZVNlbGVjdG9yKS5yZW1vdmVDbGFzcyhwdWxzZUNsYXNzKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmhvdmVyQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMuaG92ZXJDbGFzc31gKS5hZGRDbGFzcyhwdWxzZUNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZhbHVlc01hdGNoKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHJldHVybiBzY2hlZHVsZS52YWx1ZSA9PT0gb3RoZXIudmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgYWRhcHRlcjogJzwnLFxyXG4gICAgaG92ZXJDbGFzczogJzwnLFxyXG4gICAgb3B0aW9uczogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBBaGhhaGhhaGghIEZpZ2h0ZXIgb2YgdGhlIE5pZ2h0TWFwISAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERheU1hcCB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgdmFsdWUgPSB7XHJcbiAgICAgICAgMDogJ01vbicsXHJcbiAgICAgICAgMTogJ1R1ZScsXHJcbiAgICAgICAgMjogJ1dlZCcsXHJcbiAgICAgICAgMzogJ1RodXInLFxyXG4gICAgICAgIDQ6ICdGcmknLFxyXG4gICAgICAgIDU6ICdTYXQnLFxyXG4gICAgICAgIDY6ICdTdW4nIFxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KERheU1hcC4kbmFtZSwgRGF5TWFwLnZhbHVlKTtcclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBQcm92aWRlcyBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgYW4gaXRlbSAtLSBwYXNzIGl0IGluIGFuZCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGFsbG93IHlvdSB0byBvcGVyYXRlIG9uIGl0ICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBpbXBsZW1lbnRzIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIGVkaXRhYmxlOiBib29sZWFuO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgaXRlbTogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPixcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBpdGVtLmRheTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gaXRlbS5lZGl0YWJsZTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gaXRlbS5sYWJlbDtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlc0hhdmVNYXRjaGluZ1ZhbHVlcyhzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzLnB1c2goc2NoZWR1bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNOb1NjaGVkdWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0VkaXRhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5lZGl0YWJsZSkgfHwgdGhpcy5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmVlZHNPdmVybGFwc01lcmdlZCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+KSB7XHJcbiAgICAgICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kV2lkdGgge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJztcclxuXHJcbiAgICBzdGF0aWMgdmFsdWUgPSAxMjA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29uc3RhbnQoTnVsbEVuZFdpZHRoLiRuYW1lLCBOdWxsRW5kV2lkdGgudmFsdWUpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyR0aW1lb3V0JyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBtdWx0aXNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuICBwcml2YXRlIHVwZGF0ZVNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCB1cGRhdGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pn0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZW1vdmVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG5cclxuICBwcml2YXRlIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnVGltZW91dDogYW5ndWxhci5JUHJvbWlzZTx2b2lkPjtcclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkdGltZW91dDogYW5ndWxhci5JVGltZW91dFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVuZEFkanVzdGVyU2VydmljZTogRW5kQWRqdXN0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBudWxsRW5kV2lkdGg6IG51bWJlclxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2Ugd2FudCB0byBjYW5jZWwgdGhlIGRyYWcgb3BlcmF0aW9uIGlmIHRoZSB1c2VyIGlzIGp1c3QgY2xpY2tpbmcgb24gdGhlIGl0ZW0gb3IgaGFzIHN0YXJ0ZWQgZHJhZ2dpbmcgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgZHJhZyB0byBcImFjdGl2YXRlXCJcclxuICAgKiBIb3dldmVyLCB3ZSBzaG91bGQgZ2l2ZSB0aGVtIGEgc21hbGwgdG9sZXJhbmNlIGJlZm9yZSBjb25zaWRlcmluZyB0aGVtIHRvIGhhdmUgc3RhcnRlZCBkcmFnZ2luZyBlYXJseSwgYXMgaXQgaXMgdmVyeSBlYXN5IHRvIGFjY2lkZW50YWxseSBtb3ZlIGEgZmV3IHBpeGVscy5cclxuICAgKi9cclxuICBwcml2YXRlIGNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmIChwaXhlbCA+IDMpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbmNlbERyYWcoKSB7XHJcbiAgICB0aGlzLiR0aW1lb3V0LmNhbmNlbCh0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnU3RhcnRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkYXk6IHRoaXMuc2NoZWR1bGUuZGF5LFxyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLmNvbmZpZy5udWxsRW5kcyA/XHJcbiAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZS5zdGFydCArIHRoaXMubnVsbEVuZFdpZHRoKSA6XHJcbiAgICAgICAgICAgdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgdGhpcy5zY2hlZHVsZS5lbmQpLFxyXG4gICAgICB2YWx1ZTogdGhpcy5zY2hlZHVsZS52YWx1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZWRpdFNlbGYoKSB7XHJcbiAgICB0aGlzLmVkaXRTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG5cclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuICAgIGxldCBkdXJhdGlvbiA9IHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICBsZXQgbmV3RW5kID0gdGhpcy5jb25maWcubnVsbEVuZHMgPyBudWxsIDogTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiB1aS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiB1aS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgdGhpcy5jYW5jZWxEcmFnKCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5lZGl0U2VsZigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcclxuICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmNhbkFkZCA9IHRydWU7XHJcblxyXG4gICAgICAvLyB0aGlzIHByZXZlbnRzIG5nLWNsaWNrIGZyb20gYWNjaWRlbnRhbGx5IGZpcmluZyBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LCAyMDApLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5zZXREaXJ0eSgpO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5tZXJnZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZShwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAoIXRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZ0lmVGhyZXNob2xkRXhjZWVkZWQocGl4ZWwpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICBcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLm11bHRpc2xpZGVyQ3RybC5waXhlbFRvVmFsKHBpeGVsKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgIHRoaXMucmVzaXplU3RhcnQodWksIGRlbHRhKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzaXplRW5kKHVpLCBkZWx0YSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplU3RhcnQoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IHN0YXJ0Q2hhbmdlZCA9IHNjaGVkdWxlLnN0YXJ0ICE9PSBuZXdTdGFydDtcclxuICAgIGxldCBuZXdTdGFydEJlZm9yZU9yQXRFbmQgPSBuZXdTdGFydCA8PSB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuY29uZmlnLCBzY2hlZHVsZS5lbmQpIC0gMTtcclxuICAgIGxldCBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0ID0gbmV3U3RhcnQgPj0gMDtcclxuXHJcbiAgICBpZiAoc3RhcnRDaGFuZ2VkICYmIG5ld1N0YXJ0QmVmb3JlT3JBdEVuZCAmJiBuZXdTdGFydEFmdGVyT3JBdFN0YXJ0KSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgIGVuZDogc2NoZWR1bGUuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplRW5kKHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG4gICAgbGV0IGVuZENoYW5nZWQgPSBzY2hlZHVsZS5lbmQgIT09IG5ld0VuZDtcclxuICAgIGxldCBuZXdFbmRCZWZvcmVPckF0RW5kID0gbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgbGV0IG5ld0VuZEFmdGVyT3JBdFN0YXJ0ID0gbmV3RW5kID49IHNjaGVkdWxlLnN0YXJ0ICsgMTtcclxuXHJcbiAgICBpZiAoZW5kQ2hhbmdlZCAmJiBuZXdFbmRBZnRlck9yQXRTdGFydCAmJiBuZXdFbmRCZWZvcmVPckF0RW5kKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgZGF5OiBzY2hlZHVsZS5kYXksXHJcbiAgICAgICAgc3RhcnQ6IHNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogbmV3RW5kLFxyXG4gICAgICAgIHZhbHVlOiBzY2hlZHVsZS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZ1RpbWVvdXQgPSB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSBmYWxzZTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSwgdXBkYXRlOiB1cGRhdGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBlZGl0U2NoZWR1bGU6ICcmJyxcclxuICAgIHJlbW92ZVNjaGVkdWxlOiAnJicsXHJcbiAgICB1cGRhdGVTY2hlZHVsZTogJyYnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2xvdENvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTbG90Q29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2xvdENvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBab29tU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJab29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Wm9vbUVsZW1lbnQoY29udGFpbmVyOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRab29tV2lkdGgoZWxlbWVudDogYW55LCB3aWR0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoID0gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAnMTAwJScpO1xyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIHpvb21JbihlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICAvLyBnZXQgY3VycmVudCB6b29tIGxldmVsIGZyb20gem9vbWVkIGVsZW1lbnQgYXMgYSBwZXJjZW50YWdlXHJcbiAgICAgICAgbGV0IHpvb20gPSB0aGlzLmdldFpvb21FbGVtZW50KGVsZW1lbnQpLnN0eWxlLndpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHBhcnNlIHRvIGludGVnZXIgJiBkb3VibGVcclxuICAgICAgICBsZXQgbGV2ZWwgPSBwYXJzZUludCh6b29tLCAxMCkgKiAyO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdG8gcGVyY2VudGFnZVxyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsIGxldmVsICsgJyUnKTtcclxuXHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJUmVzaXplU2VydmljZSB7XHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQ7XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlUHJvdmlkZXIgZXh0ZW5kcyBhbmd1bGFyLklTZXJ2aWNlUHJvdmlkZXIge1xyXG4gICAgICAgIHNldEN1c3RvbVJlc2l6ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIERheXMge1xyXG4gICAgICAgIE1vbmRheSA9IDAsXHJcbiAgICAgICAgVHVlc2RheSA9IDEsXHJcbiAgICAgICAgV2VkbmVzZGF5LFxyXG4gICAgICAgIFRodXJzZGF5LFxyXG4gICAgICAgIEZyaWRheSxcclxuICAgICAgICBTYXR1cmRheSxcclxuICAgICAgICBTdW5kYXlcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogSW1wbGVtZW50IHRoaXMgb24gYSBjbGllbnQgYW5kIHRoZW4gcGFzcyBpdCBpbiB0byB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPFRDdXN0b20sIFRWYWx1ZT4ge1xyXG4gICAgICAgIGN1c3RvbU1vZGVsVG9XZWVrbHlTY2hlZHVsZXJSYW5nZShjdXN0b206IFRDdXN0b20pOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPFRWYWx1ZT47XHJcblxyXG4gICAgICAgIC8qKiBUcmFuc2Zvcm0gdGhlIGRhdGEgaGVsZCB3aXRoaW4gdGhlIGNvbXBvbmVudCB0byB0aGUgZm9ybWF0IHlvdSBuZWVkIGl0IG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudC4gKi9cclxuICAgICAgICBnZXRTbmFwc2hvdCgpOiBUQ3VzdG9tW107XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIGp1c3QgbmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgY2xhc3MsIHdlJ2xsIHNldCBpdCBpbnRlcm5hbGx5ICovXHJcbiAgICAgICAgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPFRWYWx1ZT5bXTtcclxuXHJcbiAgICAgICAgaW5pdGlhbERhdGE6IFRDdXN0b21bXTtcclxuICAgIH1cclxufVxyXG4iLCIvKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZSBleHRlbmRzIGFuZ3VsYXIuSUZpbHRlclNlcnZpY2Uge1xyXG4gICAgKG5hbWU6ICdicldlZWtseVNjaGVkdWxlck1pbnV0ZXNBc1RleHQnKTogKG1pbnV0ZXM6IG51bWJlcikgPT4gc3RyaW5nXHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zPFQ+IHtcclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlIHNjaGVkdWxlcyB3aWxsIGJlIGFsbG93ZWQgJiByZXF1aXJlZCB0byBoYXZlIG5vIHNldCBlbmQgdGltZSAqL1xyXG4gICAgICAgIG51bGxFbmRzPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoZXNlIGNsYXNzZXMgd2lsbCBiZSBhcHBsaWVkIGRpcmVjdGx5IHRvIHRoZSBidXR0b25zICovXHJcbiAgICAgICAgYnV0dG9uQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byByZXR1cm4gYW4gaXRlbSAtLSB0aGlzIGlzIFJFUVVJUkVEIHNvIHRoYXQgYWRhcHRlcnMgd2lsbCBhbHdheXMgYmUgdXNlZCBmb3IgbmV3IGl0ZW1zLCBldmVuIGlmIHRoZXkgd2VyZW4ndCBwYXNzZWQgaW4gKi9cclxuICAgICAgICBjcmVhdGVJdGVtOiAoZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cywgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXSkgPT4gYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+O1xyXG5cclxuICAgICAgICAvKiogZGVmYXVsdFZhbHVlIHNob3VsZCBiZSBhc3NpZ25lZCBwZXIgc2V0IG9mIG9wdGlvbnMsIG5vdCBwZXIgaXRlbS4gRG8gbm90IGFzc2lnbiBmb3Igbm8gZGVmYXVsdCAqL1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZT86IFQ7XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhbiBpdGVtIGlzIGNsaWNrZWQgaW4gb3JkZXIgdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBpdCAqL1xyXG4gICAgICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pID0+IGFuZ3VsYXIuSVByb21pc2U8SVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+PjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSwgQUxMIHNsb3RzIGluIHRoZSBjYWxlbmRhciBtdXN0IGJlIGZpbGxlZCBpbiBvcmRlciBmb3IgaXQgdG8gYmUgdmFsaWQgKi9cclxuICAgICAgICBmdWxsQ2FsZW5kYXI/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyBkZWZpbmVkLCBhIHRpbWUgc2xvdCB3aWxsIG5vdCBiZSBhYmxlIHRvIGJlIG1vcmUgdGhhbiB0aGlzIG1hbnkgbWludXRlcyBsb25nICovXHJcbiAgICAgICAgbWF4VGltZVNsb3Q/OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUsIHRoZSBjYWxlbmRhciB3aWxsIGVuZm9yY2UgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBwZXIgaXRlbSBpcyBhbGxvd2VkICovXHJcbiAgICAgICAgbW9ub1NjaGVkdWxlPzogYm9vbGVhbjtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGFsbG93cyBhY2Nlc3MgYmFjayB0byB0aGUgY2xpZW50IHNjb3BlIHdoZW4gdGhlIHNjaGVkdWxlciBjaGFuZ2VzLiBVc2UgaXQgdG8gaG9vayBpbnRvIGFuZ3VsYXIgZm9ybXNcclxuICAgICAgICAgKiBmb3Igc2V0dGluZyAkZGlydHkgb3IgdXBkYXRpbmcgdmFsaWRhdGlvbiBpbiBjYXNlcyB3aGVyZSBpdCBpcyBub3QgZGVzaXJhYmxlIHRvIHNhdmUgc2NoZWR1bGVzIGluZGl2aWR1YWxseS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbkNoYW5nZT86IChpc1ZhbGlkOiBib29sZWFuKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICAvKiogVGhlIG51bWJlciBvZiBtaW51dGVzIGVhY2ggZGl2aXNpb24gb2YgdGhlIGNhbGVuZGFyIHNob3VsZCBiZSAtLSB2YWx1ZXMgd2lsbCBzbmFwIHRvIHRoaXMgKi9cclxuICAgICAgICBpbnRlcnZhbD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3ZW4gdGhlIHNhdmUgYnV0dG9uIGlzIGNsaWNrZWQuIElmIHRoaXMgaXMgbm90IHBhc3NlZCwgbm8gc2F2ZSBidXR0b24gd2lsbCBiZSBwcmVzZW50LiAqL1xyXG4gICAgICAgIHNhdmVTY2hlZHVsZXI/OiAoKSA9PiBhbmd1bGFyLklQcm9taXNlPGFueT47XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiB7XHJcbiAgICAgICAgLyoqIEEgY3NzIGNsYXNzIHRvIGFwcGx5ICovXHJcbiAgICAgICAgJGNsYXNzPzogc3RyaW5nO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGNvbnNpZGVyZWQgYWN0aXZlIHRvIHRoZSBVSSAqL1xyXG4gICAgICAgICRpc0FjdGl2ZT86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlIHdoaWxlIHRoZSB1c2VyIGlzIGVkaXRpbmcgYW4gZXhpc3RpbmcgaXRlbSwgaXQgd2lsbCBiZSByZW1vdmVkIHdoZW4gdGhlIGVkaXQgcHJvbWlzZSBpcyByZXNvbHZlZCAqL1xyXG4gICAgICAgICRpc0RlbGV0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBiZWluZyBlZGl0ZWQgYnkgdGhlIHVzZXIgKi9cclxuICAgICAgICAkaXNFZGl0aW5nPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIE5vdCBzdHJpY3RseSBuZWNlc3NhcnkgYnV0IG1ha2VzIHRoaW5ncyBhIHdob29vbGUgbG90IGVhc2llciAqL1xyXG4gICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXM7XHJcblxyXG4gICAgICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgZW5kOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHZhbHVlOiBUO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()">Save</button><br-weekly-scheduler adapter="adapter" options="model.options"></br-weekly-scheduler><code>Dirty: {{ isDirty }}</code> <code>Valid: {{ isValid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" options="model2.options"></br-weekly-scheduler><hr>Result: {{ result }}<script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<br-ghost-slot ng-show="multiSliderCtrl.canRenderGhost()">+</br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                 active: schedule.$isActive,\r\n                 disable: multiSliderCtrl.item.editable === false,\r\n                 nullEnd: schedule.end === null,\r\n                 pending: schedule.$isEditing\r\n             }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end) \r\n             }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.schedulerCtrl.updateSchedule(schedule, update)"></br-weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" item="item"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.dirty || schedulerCtrl.validationErrors.length" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);