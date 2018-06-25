angular.module('demoApp', ['br.weeklyScheduler'])
    .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {
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
                }
            }
        };
        $scope.model2 = angular.copy($scope.model);
        $scope.model2.options.interval = 15;
        $scope.model2.options.fullCalendar = true;
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
                end: 1440,
                value: true
            },
            {
                day: 0 /* Monday */,
                start: 0,
                end: 1440,
                value: true
            },
            {
                day: 1 /* Tuesday */,
                start: 0,
                end: 1440,
                value: true
            },
            {
                day: 2 /* Wednesday */,
                start: 0,
                end: 1440,
                value: true
            },
            {
                day: 3 /* Thursday */,
                start: 0,
                end: 1440,
                value: true
            },
            {
                day: 4 /* Friday */,
                start: 0,
                end: 1440,
                value: true
            },
            {
                day: 5 /* Saturday */,
                start: 0,
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
/** @internal */
var GhostSlotController = /** @class */ (function () {
    function GhostSlotController($element) {
        this.$element = $element;
    }
    GhostSlotController.prototype.$postLink = function () {
        this.multiSliderCtrl.$hoverElement = this.$element;
    };
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
                // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
                event.stopPropagation();
                $document.on(mousemoveEvent, mousemove);
                $document.on(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$apply(scope.ondragstart({ event: event }));
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
    function MultiSliderController($element, $q, elementOffsetService, endAdjusterService, nullEndWidth) {
        this.$element = $element;
        this.$q = $q;
        this.elementOffsetService = elementOffsetService;
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
        this.isDraggingGhost = false;
        this.canAdd = true;
        this.isAdding = false;
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.addSlot = function (start, end) {
        var _this = this;
        if (start < 0) {
            start = 0;
        }
        if (end > this.config.maxValue) {
            end = this.config.maxValue;
        }
        // Sanity check -- don't add a slot with an end before the start
        // caveat: ok to continue if nullEnds is true and end is null
        if (end && !this.config.nullEnds && end <= start) {
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
        var mouseValue = this.getValAtMousePosition(event);
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
        this.ghostValues = {
            left: updatedLeftValue,
            right: updatedRightValue
        };
    };
    /** Move ghost around while not dragging */
    MultiSliderController.prototype.positionGhost = function (e) {
        var val = this.getValAtMousePosition(e);
        this.startingGhostValues = { left: val, right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval };
        this.ghostValues = angular.copy(this.startingGhostValues);
    };
    MultiSliderController.prototype.addScheduleToItem = function (schedule) {
        this.item.addSchedule(schedule);
        this.merge(schedule);
    };
    MultiSliderController.prototype.onGhostWrapperMouseDown = function (event) {
        this._renderGhost = true;
        this.isDraggingGhost = true;
        this.positionGhost(event);
    };
    MultiSliderController.prototype.onGhostWrapperMouseMove = function (event) {
        // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
        if (this.config.nullEnds) {
            return;
        }
        if (this.isDraggingGhost) {
            this.adjustGhost(event);
        }
    };
    MultiSliderController.prototype.onGhostWrapperMouseUp = function () {
        if (this.config.nullEnds) {
            this.canAdd = this.item.hasNoSchedules();
        }
        else {
            this.canAdd = true;
        }
        this._renderGhost = false;
        this.isDraggingGhost = false;
        this.onHoverElementClick();
    };
    MultiSliderController.prototype.onHoverElementClick = function () {
        var _this = this;
        if (this.canAdd) {
            var elementOffsetX = this.elementOffsetService.left(this.$element);
            var hoverElementOffsetX = this.elementOffsetService.left(this.$hoverElement) - elementOffsetX;
            var start = this.pixelToVal(hoverElementOffsetX);
            var width = this.pixelToVal(this.$hoverElement[0].clientWidth);
            var end = this.config.nullEnds ? null : this.endAdjusterService.adjustEndForModel(this.config, start + width);
            this.isAdding = true;
            this.addSlot(start, end).then(function () {
                _this.schedulerCtrl.onChange();
                _this.isAdding = false;
                _this.canAdd = false;
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
    MultiSliderController.prototype.canRenderGhost = function () {
        // This one needs to come first, otherwise isDraggingGhost being set to true would override the protection against addt'l slots in nullEnd calendars
        if (this.config.nullEnds) {
            return this._renderGhost && this.item.hasNoSchedules();
        }
        // If you're already dragging the ghost it should never disappear
        if (this.isDraggingGhost) {
            return true;
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
        return this._renderGhost;
    };
    MultiSliderController.prototype.getMousePosition = function (event) {
        var elementOffsetX = this.elementOffsetService.left(this.$element);
        var left = event.pageX - elementOffsetX;
        return left;
    };
    MultiSliderController.prototype.getValAtMousePosition = function (event) {
        return this.pixelToVal(this.getMousePosition(event));
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
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.isHoveringSlot = true;
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.isHoveringSlot = false;
    };
    MultiSliderController.prototype.merge = function (schedule) {
        this.schedulerCtrl.mergeScheduleIntoItem(this.item, schedule);
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
        'brWeeklySchedulerElementOffsetService',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth'
    ];
    return MultiSliderController;
}());
/** @internal */
var MultiSliderComponent = /** @class */ (function () {
    function MultiSliderComponent() {
        this.bindings = {
            config: '<',
            item: '=ngModel'
        };
        this.controller = MultiSliderController.$name;
        this.controllerAs = MultiSliderController.$controllerAs;
        this.require = {
            schedulerCtrl: '^brWeeklyScheduler',
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
    WeeklySchedulerController.prototype.mergeScheduleIntoItem = function (item, schedule) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlaps(item, schedule);
        this.mergeAllOverlapsForItem(item);
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
        var _this = this;
        this.items = this.fillItems(items);
        this.items.forEach(function (item) { return _this.mergeAllOverlapsForItem(item); });
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
    WeeklySchedulerController.prototype.mergeAllOverlapsForItem = function (item) {
        var _this = this;
        do {
            item.schedules.forEach(function (schedule) { return _this.mergeOverlaps(item, schedule); });
        } while (item.needsOverlapsMerged());
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
    WeeklySchedulerController.prototype.resetZoom = function () {
        this.$scope.$broadcast("resetZoom" /* RESET_ZOOM */);
    };
    WeeklySchedulerController.prototype.zoomIn = function () {
        this.$scope.$broadcast("zoomIn" /* ZOOM_IN */);
    };
    WeeklySchedulerController.prototype.rollback = function () {
        this.buildItems(this._originalItems);
        this.formController.$setPristine();
    };
    WeeklySchedulerController.prototype.save = function () {
        return this.config.saveScheduler();
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
        this.require = {
            formController: 'form'
        };
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
        var len = this.schedules.length;
        // Compare two at a time
        for (var i = 0; i < len - 1; i += 1) {
            var current = this.schedules[i];
            var next = this.schedules[i + 1];
            if (this.schedulesHaveMatchingValues(current, next)) {
                var overlapState = this.overlapService.getOverlapState(this.config, current, next);
                return [5 /* OtherEndIsCurrentStart */, 6 /* OtherStartIsCurrentEnd */].indexOf(overlapState) > -1;
            }
        }
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
            _this.ngModelCtrl.$setDirty();
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
            multisliderCtrl: '^brMultiSlider',
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2VsZW1lbnQtb2Zmc2V0L2VsZW1lbnQtb2Zmc2V0LXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9lbmQtYWRqdXN0ZXIvZW5kLWFkanVzdGVyLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9naG9zdC1zbG90L2dob3N0LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ncm91cC1ieS9ncm91cC1ieS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvaGFuZGxlL2hhbmRsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hvdXJseS1ncmlkL2hvdXJseS1ncmlkLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9vdmVybGFwL292ZXJsYXAtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc2l6ZS9yZXNpemUtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Jlc3RyaWN0aW9uLWV4cGxhbmF0aW9ucy9yZXN0cmljdGlvbi1leHBsYW5hdGlvbnMtY29tcG9uZW50LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvZnVsbC1jYWxlbmRhci12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9tYXgtdGltZS1zbG90LXZhbGlkYXRvci1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtdmFsaWRhdG9yL21vbm8tc2NoZWR1bGUtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3IvbnVsbC1lbmQtdmFsaWRhdG9yLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY2hlZHVsZS12YWxpZGF0b3Ivb3ZlcmxhcC12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3NjaGVkdWxlLXZhbGlkYXRvci9zY2hlZHVsZS12YWxpZGF0b3Itc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3Njcm9sbC9zY3JvbGwtc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvbWludXRlcy1hcy10ZXh0LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS90aW1lLW9mLWRheS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUtcmFuZ2UvdGltZS1yYW5nZS1jb21wb25lbnQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9EYXlNYXAudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVySXRlbS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL051bGxFbmRXaWR0aC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvem9vbS96b29tLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9yZXNpemUvSVJlc2l6ZVNlcnZpY2VQcm92aWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0RheXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyQWRhcHRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzlDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU07SUFDL0QsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJO1FBRWxDLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUN2QixVQUFVLEVBQUUsVUFBQyxHQUFHLEVBQUUsU0FBUztvQkFDekIsT0FBTzt3QkFDTCxHQUFHLEVBQUUsR0FBRzt3QkFDUixTQUFTLEVBQUUsU0FBUztxQkFDckIsQ0FBQTtnQkFDSCxDQUFDO2dCQUNELFlBQVksRUFBRSxJQUFJO2dCQUNsQixRQUFRLEVBQUUsVUFBVSxRQUFRO29CQUMxQixPQUFPLFFBQVEsQ0FBQyxj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QyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQW5GTSxpQkFBSyxHQUFHLDhCQUE4QixDQUFDO0lBRXZDLG1CQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQWtGcEMsa0JBQUM7Q0FyRkQsQUFxRkMsSUFBQTtBQUVELE9BQU87S0FDRixNQUFNLENBQUMsb0JBQW9CLENBQUM7S0FDNUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWydici53ZWVrbHlTY2hlZHVsZXInXSlcclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRxJywgJyRzY29wZScsICckdGltZW91dCcsICckbG9nJyxcclxuICAgIGZ1bmN0aW9uICgkcSwgJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGJ1dHRvbkNsYXNzZXM6IFsnd293ISddLFxyXG4gICAgICAgICAgY3JlYXRlSXRlbTogKGRheSwgc2NoZWR1bGVzKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgZGF5OiBkYXksXHJcbiAgICAgICAgICAgICAgc2NoZWR1bGVzOiBzY2hlZHVsZXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcclxuICAgICAgICAgIGVkaXRTbG90OiBmdW5jdGlvbiAoc2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICR0aW1lb3V0KCgpID0+IHNjaGVkdWxlLCAwKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBpbnRlcnZhbDogMSxcclxuICAgICAgICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4ge1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gYXMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT5cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsMiA9IGFuZ3VsYXIuY29weSgkc2NvcGUubW9kZWwpO1xyXG4gICAgICAkc2NvcGUubW9kZWwyLm9wdGlvbnMuaW50ZXJ2YWwgPSAxNTtcclxuICAgICAgJHNjb3BlLm1vZGVsMi5vcHRpb25zLmZ1bGxDYWxlbmRhciA9IHRydWU7XHJcblxyXG4gICAgICAkc2NvcGUubW9kZWwub3B0aW9ucy5udWxsRW5kcyA9IHRydWU7XHJcblxyXG4gICAgICAkc2NvcGUuYWRhcHRlciA9IG5ldyBEZW1vQWRhcHRlcihbXHJcbiAgICAgICAgLy8ge1xyXG4gICAgICAgIC8vICAgZGF5OiBEYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgIC8vICAgc3RhcnQ6IDEzODAsXHJcbiAgICAgICAgLy8gICBlbmQ6IG51bGwsXHJcbiAgICAgICAgLy8gICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5TdW5kYXksXHJcbiAgICAgICAgICBzdGFydDogNjAwLFxyXG4gICAgICAgICAgZW5kOiBudWxsLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuTW9uZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDcyMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlR1ZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogNjAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMzAsXHJcbiAgICAgICAgICBlbmQ6IG51bGwsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5GcmlkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogbnVsbCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgICRzY29wZS5hZGFwdGVyVHdvID0gbmV3IERlbW9BZGFwdGVyKFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlN1bmRheSxcclxuICAgICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgICAgZW5kOiAxNDQwLFxyXG4gICAgICAgICAgdmFsdWU6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGRheTogYnIud2Vla2x5U2NoZWR1bGVyLkRheXMuTW9uZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDE0NDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5UdWVzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDE0NDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5XZWRuZXNkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogMTQ0MCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlRodXJzZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDE0NDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cy5GcmlkYXksXHJcbiAgICAgICAgICBzdGFydDogMCxcclxuICAgICAgICAgIGVuZDogMTQ0MCxcclxuICAgICAgICAgIHZhbHVlOiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLlNhdHVyZGF5LFxyXG4gICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICBlbmQ6IDE0NDAsXHJcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxyXG4gICAgICAgIH0gXHJcbiAgICAgIF0pO1xyXG4gICAgICBcclxuICAgICAgJHNjb3BlLnNhdmVBbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHNjb3BlLnJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS5hZGFwdGVyLmdldFNuYXBzaG90KCkpICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmFkYXB0ZXJUd28uZ2V0U25hcHNob3QoKSk7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbi8qKiBUaGUgZGF0YSBpcyBhbHJlYWR5IGluIGFuIGFjY2VwdGFibGUgZm9ybWF0IGZvciB0aGUgZGVtbyBzbyBqdXN0IHBhc3MgaXQgdGhyb3VnaCAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERlbW9BZGFwdGVyIGltcGxlbWVudHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJBZGFwdGVyPGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8Ym9vbGVhbj4sIGJvb2xlYW4+IHtcclxuICBwdWJsaWMgaXRlbXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVySXRlbTxib29sZWFuPltdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIGluaXRpYWxEYXRhOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGJvb2xlYW4+W10sXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U25hcHNob3QoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiBpdGVtLnNjaGVkdWxlcy5tYXAoc2NoZWR1bGUgPT4gc2NoZWR1bGUpKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKHJhbmdlKSB7XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfVxyXG59XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG4iLCIvKipcclxuICogVGhpcyBoZWxwcyByZWR1Y2UgY29kZSBkdXBsaWNhdGlvblxyXG4gKiBUaGlzIGlzIHVzZWQgYXMgYSBzdWJzdGl0dXRlIGZvciBqUXVlcnkgdG8ga2VlcCBkZXBlbmRlbmNpZXMgbWluaW1hbFxyXG4gKi9cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRWxlbWVudE9mZnNldFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyRWxlbWVudE9mZnNldFNlcnZpY2UnO1xyXG5cclxuICAgIHB1YmxpYyBsZWZ0KCRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgICAgICByZXR1cm4gJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmlnaHQoJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xyXG4gICAgICAgIHJldHVybiAkZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEVsZW1lbnRPZmZzZXRTZXJ2aWNlLiRuYW1lLCBFbGVtZW50T2Zmc2V0U2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgRW5kQWRqdXN0ZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZSc7XHJcblxyXG4gICAgcHVibGljIGFkanVzdEVuZEZvck1vZGVsKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+LCBlbmQ6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChlbmQgPT09IGNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkanVzdEVuZEZvclZpZXcoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4sIGVuZDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGVuZCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVuZDtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKEVuZEFkanVzdGVyU2VydmljZS4kbmFtZSwgRW5kQWRqdXN0ZXJTZXJ2aWNlKTsiLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIEdob3N0U2xvdENvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickdob3N0U2xvdENvbnRyb2xsZXInO1xyXG4gICAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnZ2hvc3RTbG90Q3RybCc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRlbGVtZW50J1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnlcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbXVsdGlTbGlkZXJDdHJsOiBNdWx0aVNsaWRlckNvbnRyb2xsZXI7XHJcblxyXG4gICAgcHVibGljICRwb3N0TGluaygpIHtcclxuICAgICAgICB0aGlzLm11bHRpU2xpZGVyQ3RybC4kaG92ZXJFbGVtZW50ID0gdGhpcy4kZWxlbWVudDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBHaG9zdFNsb3RDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdickdob3N0U2xvdCc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IEdob3N0U2xvdENvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBHaG9zdFNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgcmVxdWlyZSA9IHtcclxuICAgICAgICBtdWx0aVNsaWRlckN0cmw6ICdeYnJNdWx0aVNsaWRlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPG5nLXRyYW5zY2x1ZGUgY2xhc3M9XCJmdWxsV2lkdGhcIj48L25nLXRyYW5zY2x1ZGU+XHJcbiAgICBgO1xyXG5cclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG59XHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihHaG9zdFNsb3RDb250cm9sbGVyLiRuYW1lLCBHaG9zdFNsb3RDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChHaG9zdFNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBHaG9zdFNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKlxyXG4gKiBXZSBzaG91bGQgYmUgYWJsZSB0byBjb252ZXJ0IHRoZSBzY2hlZHVsZXMgYmVmb3JlaGFuZCwgcGFzcyBqdXN0IHRoZSBzY2hlZHVsZXMgaW4gYW5kIGhhdmUgdGhpcyBwYWNrYWdlIGJ1aWxkIHRoZSBpdGVtc1xyXG4gKiBUaGlzIGhlbHBzIHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGluIGNsaWVudHMuXHJcbiAqIFRoaXMgaXMgdXNlZCBhcyBhIHN1YnN0aXR1dGUgZm9yIGxvZGFzaC5ncm91cEJ5IHRvIGtlZXAgdGhlIGZvb3RwcmludCBzbWFsbCBcclxuICovXHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIEdyb3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJHcm91cFNlcnZpY2UnO1xyXG5cclxuICAgIGdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0ge1xyXG4gICAgICAgIGxldCBzZWVkOiB7IFtrZXk6IG51bWJlcl06IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHNjaGVkdWxlcy5yZWR1Y2UoKHJlZHVjZXIsIGN1cnJlbnRTY2hlZHVsZSwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBjdXJyZW50U2NoZWR1bGUuZGF5O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZWR1Y2VyW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHJlZHVjZXJba2V5XSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZWR1Y2VyW2tleV0ucHVzaChjdXJyZW50U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlZHVjZXI7XHJcbiAgICAgICAgfSwgc2VlZCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShHcm91cFNlcnZpY2UuJG5hbWUsIEdyb3VwU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJIYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG5cclxuICAgIGxldCBtb3VzZWRvd25FdmVudDogc3RyaW5nID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0JztcclxuICAgIGxldCBtb3VzZW1vdmVFdmVudDogc3RyaW5nID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUnO1xyXG4gICAgbGV0IG1vdXNldXBFdmVudDogc3RyaW5nID0gJ21vdXNldXAgdG91Y2hlbmQnO1xyXG5cclxuICAgIGVsZW1lbnQub24obW91c2Vkb3duRXZlbnQsIChldmVudCkgPT4ge1xyXG4gICAgICB4ID0gZ2V0UGFnZVgoZXZlbnQpO1xyXG5cclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgaGFuZGxlcnMgZnJvbSBiZWluZyBmaXJlZCBpZiB0aGV5IGFyZSBuZXN0ZWQgKG9ubHkgdGhlIG9uZSB5b3UgZGlyZWN0bHkgaW50ZXJhY3RlZCB3aXRoIHNob3VsZCBmaXJlKVxyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbihtb3VzZW1vdmVFdmVudCwgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKG1vdXNldXBFdmVudCwgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShzY29wZS5vbmRyYWdzdGFydCh7IGV2ZW50OiBldmVudCB9KSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFBhZ2VYKGV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBldmVudC5wYWdlWCB8fCBnZXRUb3VjaGVzKGV2ZW50KVswXS5wYWdlWDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUb3VjaGVzKGV2ZW50OiBhbnkpOiBhbnkgeyAvLyB0b2RvXHJcbiAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmV0dXJuIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIGlmICghZXZlbnQudG91Y2hlcykge1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXMgPSBbZXZlbnQub3JpZ2luYWxFdmVudF07XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgcmV0dXJuIGV2ZW50LnRvdWNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIGxldCBwYWdlWCA9IGdldFBhZ2VYKGV2ZW50KTtcclxuICAgICAgdmFyIGRlbHRhID0gcGFnZVggLSB4O1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWcpKSB7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KHNjb3BlLm9uZHJhZyh7IGRlbHRhOiBkZWx0YSwgZXZlbnQ6IGV2ZW50IH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2Vtb3ZlRXZlbnQsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQobW91c2V1cEV2ZW50LCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2NvcGUub25kcmFnc3RvcCkpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoc2NvcGUub25kcmFnc3RvcCgpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJIb3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXmJyV2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIGhvdXJDb3VudCwgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vIFN0cmlwZSBpdCBieSBob3VyXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRIb3VyID0gaSAlIDEyO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBpID49IDEyID8gJ3AnIDogJ2EnO1xyXG5cclxuICAgICAgICAgICAgY2hpbGQudGV4dChgJHtjdXJyZW50SG91ciB8fCAnMTInfSR7bWVyaWRpZW19YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdick11bHRpU2xpZGVyQ29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnbXVsdGlTbGlkZXJDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRxJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVsZW1lbnRPZmZzZXRTZXJ2aWNlJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kV2lkdGgnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgZWxlbWVudE9mZnNldFNlcnZpY2U6IEVsZW1lbnRPZmZzZXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXJcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzRHJhZ2dpbmdHaG9zdDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgc3RhcnRpbmdHaG9zdFZhbHVlczogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfTtcclxuICBwcml2YXRlIGdob3N0VmFsdWVzOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9O1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcbiAgXHJcbiAgcHVibGljICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuXHJcbiAgcHVibGljIGNhbkFkZDogYm9vbGVhbiA9IHRydWU7XHJcbiAgcHVibGljIGlzQWRkaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG5cclxuICBwcml2YXRlIF9yZW5kZXJHaG9zdDogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGFkZFNsb3Qoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBhbmd1bGFyLklQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgc3RhcnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbmQgPiB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTYW5pdHkgY2hlY2sgLS0gZG9uJ3QgYWRkIGEgc2xvdCB3aXRoIGFuIGVuZCBiZWZvcmUgdGhlIHN0YXJ0XHJcbiAgICAvLyBjYXZlYXQ6IG9rIHRvIGNvbnRpbnVlIGlmIG51bGxFbmRzIGlzIHRydWUgYW5kIGVuZCBpcyBudWxsXHJcbiAgICBpZiAoZW5kICYmICF0aGlzLmNvbmZpZy5udWxsRW5kcyAmJiBlbmQgPD0gc3RhcnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHEud2hlbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzY2hlZHVsZSA9IHtcclxuICAgICAgZGF5OiB0aGlzLml0ZW0uZGF5LFxyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kLFxyXG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuZGVmYXVsdFZhbHVlXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyQ3RybC5jb25maWcuZWRpdFNsb3Qoc2NoZWR1bGUpLnRoZW4oKGVkaXRlZFNjaGVkdWxlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRTY2hlZHVsZVRvSXRlbShlZGl0ZWRTY2hlZHVsZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuJHEud2hlbih0aGlzLmFkZFNjaGVkdWxlVG9JdGVtKHNjaGVkdWxlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogRXhwYW5kIGdob3N0IHdoaWxlIGRyYWdnaW5nIGluIGl0ICovXHJcbiAgcHVibGljIGFkanVzdEdob3N0KGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICBsZXQgbW91c2VWYWx1ZTogbnVtYmVyID0gdGhpcy5nZXRWYWxBdE1vdXNlUG9zaXRpb24oZXZlbnQpO1xyXG5cclxuICAgIGxldCBleGlzdGluZ0xlZnRWYWx1ZTogbnVtYmVyID0gdGhpcy5zdGFydGluZ0dob3N0VmFsdWVzLmxlZnQ7XHJcblxyXG4gICAgbGV0IHVwZGF0ZWRMZWZ0VmFsdWU6IG51bWJlcjtcclxuICAgIGxldCB1cGRhdGVkUmlnaHRWYWx1ZTogbnVtYmVyO1xyXG4gICAgXHJcbiAgICBpZiAobW91c2VWYWx1ZSA8IGV4aXN0aW5nTGVmdFZhbHVlKSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgbGVmdFxyXG4gICAgICB1cGRhdGVkTGVmdFZhbHVlID0gbW91c2VWYWx1ZTtcclxuICAgICAgdXBkYXRlZFJpZ2h0VmFsdWUgPSBleGlzdGluZ0xlZnRWYWx1ZTtcclxuICAgIH0gZWxzZSB7IC8vIHVzZXIgaXMgZHJhZ2dpbmcgcmlnaHRcclxuICAgICAgdXBkYXRlZExlZnRWYWx1ZSA9IGV4aXN0aW5nTGVmdFZhbHVlO1xyXG4gICAgICB1cGRhdGVkUmlnaHRWYWx1ZSA9IG1vdXNlVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5naG9zdFZhbHVlcyA9IHtcclxuICAgICAgbGVmdDogdXBkYXRlZExlZnRWYWx1ZSxcclxuICAgICAgcmlnaHQ6IHVwZGF0ZWRSaWdodFZhbHVlXHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKiBNb3ZlIGdob3N0IGFyb3VuZCB3aGlsZSBub3QgZHJhZ2dpbmcgKi9cclxuICBwdWJsaWMgcG9zaXRpb25HaG9zdChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICBsZXQgdmFsID0gdGhpcy5nZXRWYWxBdE1vdXNlUG9zaXRpb24oZSk7XHJcblxyXG4gICAgdGhpcy5zdGFydGluZ0dob3N0VmFsdWVzID0geyBsZWZ0OiB2YWwsIHJpZ2h0OiB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IHZhbCArIHRoaXMubnVsbEVuZFdpZHRoIDogdmFsICsgdGhpcy5jb25maWcuaW50ZXJ2YWwgfTtcclxuICAgIHRoaXMuZ2hvc3RWYWx1ZXMgPSBhbmd1bGFyLmNvcHkodGhpcy5zdGFydGluZ0dob3N0VmFsdWVzKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkU2NoZWR1bGVUb0l0ZW0oc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5pdGVtLmFkZFNjaGVkdWxlKHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2Uoc2NoZWR1bGUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VEb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICB0aGlzLl9yZW5kZXJHaG9zdCA9IHRydWU7XHJcbiAgICB0aGlzLmlzRHJhZ2dpbmdHaG9zdCA9IHRydWU7XHJcbiAgICB0aGlzLnBvc2l0aW9uR2hvc3QoZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uR2hvc3RXcmFwcGVyTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICAvLyBudWxsRW5kcyBjYWxlbmRhcnMgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBiZWNhdXNlIHRoZSBzaXplIG9mIHRoZSBzbG90IGRvZXNuJ3QgcmVhbGx5IG1hdHRlclxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc0RyYWdnaW5nR2hvc3QpIHtcclxuICAgICAgdGhpcy5hZGp1c3RHaG9zdChldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25HaG9zdFdyYXBwZXJNb3VzZVVwKCkge1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHRoaXMuY2FuQWRkID0gdGhpcy5pdGVtLmhhc05vU2NoZWR1bGVzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmNhbkFkZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcmVuZGVyR2hvc3QgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNEcmFnZ2luZ0dob3N0ID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5vbkhvdmVyRWxlbWVudENsaWNrKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25Ib3ZlckVsZW1lbnRDbGljaygpIHtcclxuICAgIGlmICh0aGlzLmNhbkFkZCkge1xyXG4gICAgICBsZXQgZWxlbWVudE9mZnNldFggPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLmxlZnQodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIGxldCBob3ZlckVsZW1lbnRPZmZzZXRYID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGhvdmVyRWxlbWVudCkgLSBlbGVtZW50T2Zmc2V0WDtcclxuXHJcbiAgICAgIGxldCBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsZW1lbnRPZmZzZXRYKTtcclxuICAgICAgbGV0IHdpZHRoID0gdGhpcy5waXhlbFRvVmFsKHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCk7XHJcbiAgICAgIGxldCBlbmQgPSB0aGlzLmNvbmZpZy5udWxsRW5kcyA/IG51bGwgOiB0aGlzLmVuZEFkanVzdGVyU2VydmljZS5hZGp1c3RFbmRGb3JNb2RlbCh0aGlzLmNvbmZpZywgc3RhcnQgKyB3aWR0aCk7XHJcblxyXG4gICAgICB0aGlzLmlzQWRkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2UoKTtcclxuICAgICAgICB0aGlzLmlzQWRkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jYW5BZGQgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIHNjaGVkdWxlIGlzIGFibGUgdG8gYmUgZWRpdGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5FZGl0KHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBpc0VkaXRhYmxlID0gdGhpcy5pdGVtLmlzRWRpdGFibGUoKTtcclxuICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCk7XHJcbiAgICBsZXQgaXNOb3RBY3RpdmUgPSAhc2NoZWR1bGUuJGlzQWN0aXZlO1xyXG4gICAgbGV0IGlzTm90RHJhZ2dpbmcgPSAhdGhpcy5pc0RyYWdnaW5nO1xyXG5cclxuICAgIHJldHVybiBpc0VkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbiAmJiBpc05vdEFjdGl2ZSAmJiBpc05vdERyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmF0aGVyIHRoYW4gaGF2aW5nIHRvIGRlYWwgd2l0aCBtb2RpZnlpbmcgbWVyZ2VPdmVybGFwcyB0byBoYW5kbGUgbnVsbEVuZHMgY2FsZW5kYXJzLFxyXG4gICAqIGp1c3QgcHJldmVudCB0aGUgdXNlciBmcm9tIGNyZWF0aW5nIGFkZGl0aW9uYWwgc2xvdHMgaW4gbnVsbEVuZHMgY2FsZW5kYXJzIHVubGVzcyB0aGVyZSBhcmUgbm8gc2xvdHMgdGhlcmUgYWxyZWFkeS5cclxuICAgKi9cclxuICBwcml2YXRlIGNhblJlbmRlckdob3N0KCkge1xyXG4gICAgLy8gVGhpcyBvbmUgbmVlZHMgdG8gY29tZSBmaXJzdCwgb3RoZXJ3aXNlIGlzRHJhZ2dpbmdHaG9zdCBiZWluZyBzZXQgdG8gdHJ1ZSB3b3VsZCBvdmVycmlkZSB0aGUgcHJvdGVjdGlvbiBhZ2FpbnN0IGFkZHQnbCBzbG90cyBpbiBudWxsRW5kIGNhbGVuZGFyc1xyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9yZW5kZXJHaG9zdCAmJiB0aGlzLml0ZW0uaGFzTm9TY2hlZHVsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB5b3UncmUgYWxyZWFkeSBkcmFnZ2luZyB0aGUgZ2hvc3QgaXQgc2hvdWxkIG5ldmVyIGRpc2FwcGVhclxyXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZ0dob3N0KSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5pdGVtLmlzRWRpdGFibGUoKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNBZGRpbmcpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzSG92ZXJpbmdTbG90KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyR2hvc3Q7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldE1vdXNlUG9zaXRpb24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgIGxldCBlbGVtZW50T2Zmc2V0WCA9IHRoaXMuZWxlbWVudE9mZnNldFNlcnZpY2UubGVmdCh0aGlzLiRlbGVtZW50KTtcclxuICAgIGxldCBsZWZ0ID0gZXZlbnQucGFnZVggLSBlbGVtZW50T2Zmc2V0WDtcclxuXHJcbiAgICByZXR1cm4gbGVmdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VmFsQXRNb3VzZVBvc2l0aW9uKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICByZXR1cm4gdGhpcy5waXhlbFRvVmFsKHRoaXMuZ2V0TW91c2VQb3NpdGlvbihldmVudCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybSBhbiBleHRlcm5hbCBhY3Rpb24gdG8gYnJpbmcgdXAgYW4gZWRpdG9yIGZvciBhIHNjaGVkdWxlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlZGl0U2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgaWYgKHRoaXMuY2FuRWRpdChzY2hlZHVsZSkpIHtcclxuICAgICAgc2NoZWR1bGUuJGlzRWRpdGluZyA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnLmVkaXRTbG90KHNjaGVkdWxlKS50aGVuKChuZXdTY2hlZHVsZSkgPT4ge1xyXG4gICAgICAgIGlmIChuZXdTY2hlZHVsZS4kaXNEZWxldGluZykge1xyXG4gICAgICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLnJlbW92ZVNjaGVkdWxlRnJvbUl0ZW0odGhpcy5pdGVtLCBzY2hlZHVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbGV0IHByZW1lcmdlU2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkobmV3U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgIHRoaXMubWVyZ2UobmV3U2NoZWR1bGUpO1xyXG5cclxuICAgICAgICAgIC8vIElmIG1lcmdpbmcgbXV0YXRlZCB0aGUgc2NoZWR1bGUgZnVydGhlciwgdGhlbiBzY2hlZHVsZXJDdHJsLnVwZGF0ZVNjaGVkdWxlIHdvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIGNhbGxlZFxyXG4gICAgICAgICAgLy8gVGhpcyBpcyBzbyB0aGF0IGVkaXRzIHRoYXQgZG9uJ3QgdHJpZ2dlciBtZXJnZXMgc3RpbGwgdHJpZ2dlciBvbkNoYW5nZSxcclxuICAgICAgICAgIC8vIGJ1dCBlZGl0cyB0aGF0IGRvIHRyaWdnZXIgbWVyZ2VzIGRvbid0IHRyaWdnZXIgaXQgdHdpY2VcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhwcmVtZXJnZVNjaGVkdWxlLCBuZXdTY2hlZHVsZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLnVwZGF0ZVNjaGVkdWxlKHNjaGVkdWxlLCBuZXdTY2hlZHVsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICBzY2hlZHVsZS4kaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90TGVmdChzdGFydDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsOiBIVE1MRWxlbWVudCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKHN0YXJ0KTtcclxuXHJcbiAgICByZXR1cm4gdW5kZXJseWluZ0ludGVydmFsLm9mZnNldExlZnQgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIElmIHRoZXJlIGlzIGEgbnVsbCBlbmQsIHBsYWNlIHRoZSBlbmQgb2YgdGhlIHNsb3QgdHdvIGhvdXJzIGF3YXkgZnJvbSB0aGUgYmVnaW5uaW5nLlxyXG4gICAgaWYgKHRoaXMuY29uZmlnLm51bGxFbmRzICYmIGVuZCA9PT0gbnVsbCkge1xyXG4gICAgICBlbmQgPSBzdGFydCArIHRoaXMubnVsbEVuZFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuIGVuZCBvZiAwIHNob3VsZCBkaXNwbGF5IGFsbGxsIHRoZSB3YXkgdG8gdGhlIHJpZ2h0LCB1cCB0byB0aGUgZWRnZVxyXG4gICAgZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgZW5kKTtcclxuXHJcbiAgICAvLyBXZSB3YW50IHRoZSByaWdodCBzaWRlIHRvIGdvIC91cCB0by8gdGhlIGludGVydmFsIGl0IHJlcHJlc2VudHMsIG5vdCBjb3ZlciBpdCwgc28gd2UgbXVzdCBzdWJzdHJhY3QgMSBpbnRlcnZhbFxyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbCA9IHRoaXMuZ2V0VW5kZXJseWluZ0ludGVydmFsKGVuZCAtIHRoaXMuY29uZmlnLmludGVydmFsKTtcclxuXHJcbiAgICBsZXQgb2Zmc2V0UmlnaHQgPSB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0TGVmdCArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5lbGVtZW50T2Zmc2V0U2VydmljZS5sZWZ0KHRoaXMuJGVsZW1lbnQpXHJcbiAgICBsZXQgY29udGFpbmVyUmlnaHQgPSB0aGlzLmVsZW1lbnRPZmZzZXRTZXJ2aWNlLnJpZ2h0KHRoaXMuJGVsZW1lbnQpO1xyXG5cclxuICAgIGxldCByZXN1bHQgPSBjb250YWluZXJSaWdodCAtIGNvbnRhaW5lckxlZnQgLSBvZmZzZXRSaWdodDtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0ICsgJ3B4JztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VW5kZXJseWluZ0ludGVydmFsKHZhbDogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xyXG4gICAgLy8gU2xpZ2h0bHkgaGFja3kgYnV0IGRvZXMgdGhlIGpvYi4gVE9ETyA/XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIGxlZnQgb2YgdGhlIGxlZnRtb3N0IGludGVydmFsLCBzbyByZXR1cm4gdGhhdCBpbnN0ZWFkXHJcbiAgICBpZiAodmFsIDwgMCkge1xyXG4gICAgICB2YWwgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSByaWdodCBvZiB0aGUgcmlnaHRtb3N0IGludGVydmFsIC0tIHRoZSBsYXN0IGludGVydmFsIHdpbGwgbm90IGFjdHVhbGx5IHJlbmRlciB3aXRoIGEgXCJyZWxcIiB2YWx1ZVxyXG4gICAgbGV0IHJpZ2h0bW9zdCA9IHRoaXMuY29uZmlnLm1heFZhbHVlIC0gdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcblxyXG4gICAgaWYgKHZhbCA+IHJpZ2h0bW9zdCkge1xyXG4gICAgICB2YWwgPSByaWdodG1vc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQucGFyZW50KClbMF0ucXVlcnlTZWxlY3RvcihgW3JlbD0nJHt2YWx9J11gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlTGVhdmUoKSB7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2Uoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5zY2hlZHVsZXJDdHJsLm1lcmdlU2NoZWR1bGVJbnRvSXRlbSh0aGlzLml0ZW0sIHNjaGVkdWxlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzRHJhZ2dpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXJDdHJsLmRyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgc2V0IGlzRHJhZ2dpbmcodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5kcmFnZ2luZyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzSG92ZXJpbmdTbG90KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyQ3RybC5ob3ZlcmluZ1Nsb3Q7XHJcbiAgfVxyXG5cclxuICBzZXQgaXNIb3ZlcmluZ1Nsb3QodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5ob3ZlcmluZ1Nsb3QgPSB2YWx1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTXVsdGlTbGlkZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJNdWx0aVNsaWRlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBpdGVtOiAnPW5nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIHNjaGVkdWxlckN0cmw6ICdeYnJXZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBPdmVybGFwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyRW5kQWRqdXN0ZXJTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIGdldE92ZXJsYXBTdGF0ZShjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogT3ZlcmxhcFN0YXRlIHtcclxuICAgICAgICBsZXQgY3VycmVudFN0YXJ0ID0gY3VycmVudC5zdGFydDtcclxuICAgICAgICBsZXQgY3VycmVudEVuZCA9IHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcoY29uZmlnLCBjdXJyZW50LmVuZCk7XHJcblxyXG4gICAgICAgIGxldCBvdGhlclN0YXJ0ID0gb3RoZXIuc3RhcnQ7XHJcbiAgICAgICAgbGV0IG90aGVyRW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyhjb25maWcsIG90aGVyLmVuZCk7XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLkN1cnJlbnRDb3ZlcnNPdGhlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA+PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJTdGFydCA8IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyRW5kID09PSBjdXJyZW50U3RhcnQgJiYgb3RoZXJFbmQgPD0gY3VycmVudEVuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT3ZlcmxhcFN0YXRlLk90aGVyRW5kSXNDdXJyZW50U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3RoZXJTdGFydCA9PT0gY3VycmVudEVuZCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE92ZXJsYXBTdGF0ZS5Ob092ZXJsYXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwU2VydmljZS4kbmFtZSwgT3ZlcmxhcFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc2l6ZVNlcnZpY2VQcm92aWRlciBpbXBsZW1lbnRzIGJyLndlZWtseVNjaGVkdWxlci5JUmVzaXplU2VydmljZVByb3ZpZGVyIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgJG5hbWUgPSAnYnIud2Vla2x5U2NoZWR1bGVyLnJlc2l6ZVNlcnZpY2UnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuJGdldC4kaW5qZWN0ID0gW1xyXG4gICAgICAgICAgICAnJHJvb3RTY29wZScsXHJcbiAgICAgICAgICAgICckd2luZG93J1xyXG4gICAgICAgIF1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGN1c3RvbVJlc2l6ZUV2ZW50czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIHNlcnZpY2VJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBzZXRDdXN0b21SZXNpemVFdmVudHMoZXZlbnRzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tUmVzaXplRXZlbnRzID0gZXZlbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyAkZ2V0KFxyXG4gICAgICAgICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgJHdpbmRvdzogYW5ndWxhci5JV2luZG93U2VydmljZVxyXG4gICAgKTogSVJlc2l6ZVNlcnZpY2Uge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlcnZpY2VJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZEV2ZW50TGlzdGVuZXIgZXhpc3RzIG91dHNpZGUgb2YgYW5ndWxhciBzbyB3ZSBoYXZlIHRvICRhcHBseSB0aGUgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXN0b21SZXNpemVFdmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbVJlc2l6ZUV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihldmVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlSW5pdGlhbGl6ZWQgPSB0cnVlOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAucHJvdmlkZXIoUmVzaXplU2VydmljZVByb3ZpZGVyLiRuYW1lLCBSZXNpemVTZXJ2aWNlUHJvdmlkZXIpXHJcbiAgICAucnVuKFtSZXNpemVTZXJ2aWNlUHJvdmlkZXIuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBJUmVzaXplU2VydmljZSkgPT4gcmVzaXplU2VydmljZS5pbml0aWFsaXplKCldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3Jlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybCc7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJSZXN0cmljdGlvbkV4cGxhbmF0aW9uc0NvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckZmlsdGVyJ107XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG5cclxuICAgIHByaXZhdGUgZXhwbGFuYXRpb25zOiB7IFtrZXkgaW4gVmFsaWRhdGlvbkVycm9yXT86IHN0cmluZyB9ID0ge307XHJcbiAgICBwcml2YXRlIHZpb2xhdGlvbnM6IHsgW2tleSBpbiBWYWxpZGF0aW9uRXJyb3JdPzogYm9vbGVhbiB9ID0ge307XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZmlsdGVyOiBJV2Vla2x5U2NoZWR1bGVyRmlsdGVyU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJGRvQ2hlY2soKSB7XHJcbiAgICAgICAgbGV0IGVycm9ycyA9IHRoaXMuc2NoZWR1bGVyQ3RybC52YWxpZGF0aW9uRXJyb3JzO1xyXG5cclxuICAgICAgICB0aGlzLnZpb2xhdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIFtWYWxpZGF0aW9uRXJyb3IuRnVsbENhbGVuZGFyVmlvbGF0aW9uXTogZXJyb3JzLmluZGV4T2YoVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbikgPiAtMSxcclxuICAgICAgICAgICAgW1ZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbl06IGVycm9ycy5pbmRleE9mKFZhbGlkYXRpb25FcnJvci5NYXhUaW1lU2xvdFZpb2xhdGlvbikgPiAtMSxcclxuICAgICAgICAgICAgW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb25dOiBlcnJvcnMuaW5kZXhPZihWYWxpZGF0aW9uRXJyb3IuTW9ub1NjaGVkdWxlVmlvbGF0aW9uKSA+IC0xXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAkb25Jbml0KCkge1xyXG4gICAgICAgIGxldCBjb25maWcgPSB0aGlzLnNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1heFRpbWVTbG90KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IHRoaXMuJGZpbHRlcignYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JykoY29uZmlnLm1heFRpbWVTbG90KTtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90VmlvbGF0aW9uXSA9IGBNYXggdGltZSBzbG90IGxlbmd0aDogJHttYXhUaW1lU2xvdH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5mdWxsQ2FsZW5kYXIpIHtcclxuICAgICAgICAgICAgdGhpcy5leHBsYW5hdGlvbnNbVmFsaWRhdGlvbkVycm9yLkZ1bGxDYWxlbmRhclZpb2xhdGlvbl0gPSAnRm9yIHRoaXMgY2FsZW5kYXIsIGV2ZXJ5IGRheSBtdXN0IGJlIGNvbXBsZXRlbHkgZnVsbCBvZiBzY2hlZHVsZXMuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb25maWcubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwbGFuYXRpb25zW1ZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb25dID0gJ1RoaXMgY2FsZW5kYXIgbWF5IG9ubHkgaGF2ZSBvbmUgdGltZSBzbG90IHBlciBkYXknO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5udWxsRW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLmV4cGxhbmF0aW9uc1tWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZFZpb2xhdGlvbl0gPSAnSXRlbXMgaW4gdGhpcyBjYWxlbmRhciBkbyBub3QgaGF2ZSBlbmQgdGltZXMuIFNjaGVkdWxlZCBldmVudHMgYmVnaW4gYXQgdGhlIHN0YXJ0IHRpbWUgYW5kIGVuZCB3aGVuIHRoZXkgYXJlIGZpbmlzaGVkLic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJSZXN0cmljdGlvbkV4cGxhbmF0aW9ucyc7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZTtcclxuICAgIGNvbnRyb2xsZXJBcyA9IFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICAgIHJlcXVpcmUgPSB7XHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybDogJ15icldlZWtseVNjaGVkdWxlcidcclxuICAgIH07XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNyb3cgZXhwbGFuYXRpb25zXCIgbmctY2xhc3M9XCJ7IHZpb2xhdGlvbjogcmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDdHJsLnZpb2xhdGlvbnNba2V5XSB9XCIgbmctcmVwZWF0PVwiKGtleSwgZXhwbGFuYXRpb24pIGluIHJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ3RybC5leHBsYW5hdGlvbnNcIj5cclxuICAgICAgICAgICAge3sgZXhwbGFuYXRpb24gfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29tcG9uZW50LiRuYW1lLCBuZXcgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb21wb25lbnQoKSlcclxuICAgIC5jb250cm9sbGVyKFJlc3RyaWN0aW9uRXhwbGFuYXRpb25zQ29udHJvbGxlci4kbmFtZSwgUmVzdHJpY3Rpb25FeHBsYW5hdGlvbnNDb250cm9sbGVyKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICAgICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgICAgIHByaXZhdGUgc2Nyb2xsU2VydmljZTogU2Nyb2xsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgJHBvc3RMaW5rKCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFswXTsgLy8gZ3JhYiBwbGFpbiBqcywgbm90IGpxbGl0ZVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFNlcnZpY2UuaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIDIwKTtcclxuICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnJlc2V0Wm9vbShlbGVtZW50KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0VUX1pPT00sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2UucmVzZXRab29tKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01fSU4sIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUluKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyU2NoZWR1bGVBcmVhQ29udGFpbmVyJztcclxuXHJcbiAgICBjb250cm9sbGVyID0gU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZTtcclxuICAgIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG5cclxuICAgIHRlbXBsYXRlID0gYDxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT5gO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5jb250cm9sbGVyKFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWUsIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIpXHJcbiAgICAuY29tcG9uZW50KFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudC4kbmFtZSwgbmV3IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJGdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5GdWxsQ2FsZW5kYXJWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHZhbGlkYXRlKHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZnVsbENhbGVuZGFyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2hlbiB0aGlzIG9wdGlvbiBpcyB0cnVlIHdlIHNob3VsZCBlbmZvcmNlIHRoYXQgdGhlcmUgYXJlIG5vIGdhcHMgaW4gdGhlIHNjaGVkdWxlc1xyXG4gICAgICAgIGxldCBsZW4gPSBzY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc2NoZWR1bGVzLCBpdCBhdXRvbWF0aWNhbGx5IGZhaWxzLlxyXG4gICAgICAgIGlmICghbGVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG9ubHkgb25lIGl0ZW0gd2Ugc2hvdWxkIGNoZWNrIHRoYXQgaXQgc3BhbnMgdGhlIHdob2xlIHJhbmdlXHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICBsZXQgc2NoZWR1bGUgPSBzY2hlZHVsZXNbMF07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHNjaGVkdWxlLnN0YXJ0KSAmJiB0aGlzLnZhbGlkYXRlRW5kQXRNYXhWYWx1ZShzY2hlZHVsZS5lbmQsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBtb3JlLCBjb21wYXJlIHR3byBhdCBhIHRpbWUgdW50aWwgdGhlIGVuZFxyXG4gICAgICAgIGxldCBsb29wTGVuID0gbGVuIC0gMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gU29ydCBieSBzdGFydCB0aW1lIGZpcnN0XHJcbiAgICAgICAgbGV0IHNvcnRlZFNjaGVkdWxlcyA9IHNjaGVkdWxlcy5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0ID4gYi5zdGFydCA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9vcExlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBmaXJzdCBpdGVtIGxhbmRzIGF0IDBcclxuICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgIXRoaXMudmFsaWRhdGVTdGFydEF0TWluVmFsdWUoY3VycmVudC5zdGFydCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgbGFzdCBpdGVtIGxhbmRzIGF0IG1heFZhbHVlXHJcbiAgICAgICAgICAgIGlmIChpID09PSBsb29wTGVuIC0gMSAmJiAhdGhpcy52YWxpZGF0ZUVuZEF0TWF4VmFsdWUobmV4dC5lbmQsIGNvbmZpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIGN1cnJlbnQuZW5kID09PSBuZXh0LnN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZhbGlkYXRlU3RhcnRBdE1pblZhbHVlKHN0YXJ0OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gc3RhcnQgPT09IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZUVuZEF0TWF4VmFsdWUoZW5kOiBudW1iZXIsIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KSB7XHJcbiAgICAgICAgcmV0dXJuIChlbmQgfHwgY29uZmlnLm1heFZhbHVlKSA9PT0gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgRnVsbENhbGVuZGFyVmFsaWRhdG9yU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNYXhUaW1lU2xvdFZhbGlkYXRvclNlcnZpY2UnO1xyXG5cclxuICAgIGdldCBlcnJvcigpIHtcclxuICAgICAgICByZXR1cm4gVmFsaWRhdGlvbkVycm9yLk1heFRpbWVTbG90VmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBtYXhUaW1lU2xvdCA9IGNvbmZpZy5tYXhUaW1lU2xvdDtcclxuXHJcbiAgICAgICAgaWYgKCFtYXhUaW1lU2xvdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAhc2NoZWR1bGVzLnNvbWUocyA9PiBzLnZhbHVlICE9PSBjb25maWcuZGVmYXVsdFZhbHVlICYmIHMuZW5kIC0gcy5zdGFydCA+IG1heFRpbWVTbG90KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZS4kbmFtZSwgTWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlJztcclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5Nb25vU2NoZWR1bGVWaW9sYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEltcG9ydGFudCBub3RlIC0tIHRoaXMgZG9lcyBub3QgdmFsaWRhdGUgdGhhdCBvbmx5IG9uZSBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0sIGJ1dCByYXRoZXIgdGhhdCBvbmx5IG9uZSBOT04tREVGQVVMVCBzY2hlZHVsZSBleGlzdHMgcGVyIGl0ZW0uICovXHJcbiAgICBwdWJsaWMgdmFsaWRhdGUoc2NoZWR1bGVzOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT5bXSwgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhIGRlZmF1bHQgdmFsdWUgaXMgZGVmaW5lZCwgc2NoZWR1bGVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgZG9uJ3QgY291bnQgLS0gb25lIG5vbi1kZWZhdWx0IHNjaGVkdWxlIHBlciBpdGVtLlxyXG4gICAgICAgIGxldCBzY2hlZHVsZXNUb1ZhbGlkYXRlO1xyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoY29uZmlnLmRlZmF1bHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzVG9WYWxpZGF0ZSA9IHNjaGVkdWxlcy5maWx0ZXIoc2NoZWR1bGUgPT4gc2NoZWR1bGUudmFsdWUgIT09IGNvbmZpZy5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlc1RvVmFsaWRhdGUgPSBzY2hlZHVsZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGFsbG93ZWQgZW1wdHkgb3IgMSBzY2hlZHVsZSBwZXIgaXRlbVxyXG4gICAgICAgIHJldHVybiAhc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggfHwgc2NoZWR1bGVzVG9WYWxpZGF0ZS5sZW5ndGggPT09IDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlLiRuYW1lLCBNb25vU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBOdWxsRW5kU2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJOdWxsRW5kVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgZ2V0IGVycm9yKCkge1xyXG4gICAgICAgIHJldHVybiBWYWxpZGF0aW9uRXJyb3IuTnVsbEVuZFZpb2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChjb25maWcubnVsbEVuZHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlcy5sZW5ndGggPD0gMSAmJiBzY2hlZHVsZXMuZXZlcnkoc2NoZWR1bGUgPT4gc2NoZWR1bGUuZW5kID09PSBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVzLmV2ZXJ5KHNjaGVkdWxlID0+IHNjaGVkdWxlLmVuZCAhPT0gbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UuJG5hbWUsIE51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlIGltcGxlbWVudHMgVmFsaWRhdG9yU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwVmFsaWRhdG9yU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyT3ZlcmxhcFNlcnZpY2UnXHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgb3ZlcmxhcFNlcnZpY2U6IE92ZXJsYXBTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZXJyb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIFZhbGlkYXRpb25FcnJvci5PdmVybGFwVmlvbGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2YWxpZGF0ZShzY2hlZHVsZXM6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PltdLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55Pik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmUgdHdvIGF0IGEgdGltZSB1bnRpbCB0aGUgZW5kXHJcbiAgICAgICAgbGV0IGxlbiA9IHNjaGVkdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNjaGVkdWxlc1tpICsgMV07XHJcblxyXG4gICAgICAgICAgICBsZXQgdmFsdWVzTWF0Y2ggPSBjdXJyZW50LnZhbHVlID09PSBuZXh0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXNNYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heFZhbHVlID0gY29uZmlnLm1heFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKGNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXAsIE92ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kLCBPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydF0uaW5kZXhPZihvdmVybGFwU3RhdGUpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShPdmVybGFwVmFsaWRhdG9yU2VydmljZS4kbmFtZSwgT3ZlcmxhcFZhbGlkYXRvclNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlVmFsaWRhdGlvblNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVmFsaWRhdGlvblNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlckZ1bGxDYWxlbmRhclZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck1heFRpbWVTbG90VmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZScsXHJcbiAgICAgICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFZhbGlkYXRvclNlcnZpY2UnLFxyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlck92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlJ1xyXG4gICAgXVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBmdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlOiBWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbW9ub1NjaGVkdWxlVmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIG51bGxFbmRTY2hlZHVsZVZhbGlkYXRvclNlcnZpY2U6IFZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBvdmVybGFwVmFsaWRhdG9yU2VydmljZTogVmFsaWRhdG9yU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFZhbGlkYXRpb25FcnJvcnMoaXRlbTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZzxhbnk+KTogVmFsaWRhdGlvbkVycm9yW10ge1xyXG4gICAgICAgIGxldCB2YWxpZGF0b3JzOiBWYWxpZGF0b3JTZXJ2aWNlW10gPSBbXHJcbiAgICAgICAgICAgIHRoaXMubWF4VGltZVNsb3RWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgICAgICB0aGlzLm1vbm9TY2hlZHVsZVZhbGlkYXRvclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHRoaXMubnVsbEVuZFNjaGVkdWxlVmFsaWRhdG9yU2VydmljZSxcclxuICAgICAgICAgICAgdGhpcy5mdWxsQ2FsZW5kYXJWYWxpZGF0b3JTZXJ2aWNlLFxyXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXBWYWxpZGF0b3JTZXJ2aWNlXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcclxuXHJcbiAgICAgICAgdmFsaWRhdG9ycy5mb3JFYWNoKHZhbGlkYXRvciA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdmFsaWRhdG9yLnZhbGlkYXRlKGl0ZW0uc2NoZWR1bGVzLCBjb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWxpZGF0b3IuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlLiRuYW1lLCBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY3JvbGxTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclNjcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTWludXRlc0FzVGV4dEZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJNaW51dGVzQXNUZXh0JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBgYDtcclxuXHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IGhhc0hvdXJzID0gaG91cnMgPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc0hvdXJzKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gYCR7aG91cnN9IGhvdXJzYDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1pbiA9IG1pbnV0ZXMgJSA2MDtcclxuICAgICAgICAgICAgbGV0IGhhc01pbnV0ZXMgPSBtaW4gPiAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhhc01pbnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNIb3Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAke21pbn0gbWludXRlJHttaW4gPiAxID8gJ3MnIDogJyd9YDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKE1pbnV0ZXNBc1RleHRGaWx0ZXIuJG5hbWUsIFtNaW51dGVzQXNUZXh0RmlsdGVyLkZhY3RvcnldKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lT2ZEYXlGaWx0ZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSAmJiBob3VycyA8IDI0ID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVSYW5nZUNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2JyVGltZVJhbmdlJztcclxuXHJcbiAgICBiaW5kaW5ncyA9IHtcclxuICAgICAgICBzY2hlZHVsZTogJzwnXHJcbiAgICB9XHJcblxyXG4gICAgY29udHJvbGxlciA9IFRpbWVSYW5nZUNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICBjb250cm9sbGVyQXMgPSBUaW1lUmFuZ2VDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgXHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmIHRpbWVSYW5nZUN0cmwuaGFzRW5kXCI+e3sgdGltZVJhbmdlQ3RybC5zY2hlZHVsZS5zdGFydCB8IGJyV2Vla2x5U2NoZWR1bGVyVGltZU9mRGF5IH19LXt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuZW5kIHwgYnJXZWVrbHlTY2hlZHVsZXJUaW1lT2ZEYXkgfX08L3NwYW4+XHJcbiAgICAgICAgPHNwYW4gbmctaWY9XCJ0aW1lUmFuZ2VDdHJsLmhhc1N0YXJ0ICYmICF0aW1lUmFuZ2VDdHJsLmhhc0VuZFwiPnt7IHRpbWVSYW5nZUN0cmwuc2NoZWR1bGUuc3RhcnQgfCBicldlZWtseVNjaGVkdWxlclRpbWVPZkRheSB9fSB1bnRpbDwvc3Bhbj5cclxuICAgIGBcclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBUaW1lUmFuZ2VDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd0aW1lUmFuZ2VDdHJsJztcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdiclRpbWVSYW5nZUNvbnRyb2xsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFzU3RhcnQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGhhc0VuZDogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gICAgJG9uSW5pdCgpIHtcclxuICAgICAgICB0aGlzLmhhc1N0YXJ0ID0gYW5ndWxhci5pc0RlZmluZWQodGhpcy5zY2hlZHVsZS5zdGFydCk7XHJcbiAgICAgICAgdGhpcy5oYXNFbmQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLnNjaGVkdWxlLmVuZCkgJiYgdGhpcy5zY2hlZHVsZS5lbmQgIT09IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2JyLndlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29tcG9uZW50KFRpbWVSYW5nZUNvbXBvbmVudC4kbmFtZSwgbmV3IFRpbWVSYW5nZUNvbXBvbmVudCgpKVxyXG4gICAgLmNvbnRyb2xsZXIoVGltZVJhbmdlQ29udHJvbGxlci4kbmFtZSwgVGltZVJhbmdlQ29udHJvbGxlcik7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHEnLFxyXG4gICAgJyRzY29wZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJHcm91cFNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyRGF5TWFwJyxcclxuICAgICdicldlZWtseVNjaGVkdWxlckVuZEFkanVzdGVyU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJPdmVybGFwU2VydmljZScsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJWYWxpZGF0aW9uU2VydmljZScsXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSxcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgZ3JvdXBTZXJ2aWNlOiBHcm91cFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGRheU1hcDogeyBba2V5OiBudW1iZXJdOiBzdHJpbmcgfSxcclxuICAgIHByaXZhdGUgZW5kQWRqdXN0ZXJTZXJ2aWNlOiBFbmRBZGp1c3RlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZSxcclxuICAgIHByaXZhdGUgc2NoZWR1bGVWYWxpZGF0b3JTZXJ2aWNlOiBTY2hlZHVsZVZhbGlkYXRpb25TZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9vcmlnaW5hbEl0ZW1zOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXTtcclxuXHJcbiAgcHJpdmF0ZSBvdmVybGFwSGFuZGxlcnM6IHsgW2tleTogbnVtYmVyXTogKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSA9PiB2b2lkOyB9ID0ge1xyXG4gICAgW092ZXJsYXBTdGF0ZS5Ob092ZXJsYXBdOiAoaXRlbSwgY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlTm9PdmVybGFwKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuQ3VycmVudElzSW5zaWRlT3RoZXJdOiAoaXRlbSwgY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudElzSW5zaWRlT3RoZXIoaXRlbSwgY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5DdXJyZW50Q292ZXJzT3RoZXJdOiAoaXRlbSwgY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlQ3VycmVudENvdmVyc090aGVyKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSxcclxuICAgIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0luc2lkZUN1cnJlbnRdOiAoaXRlbSwgY3VycmVudCwgb3RoZXIpID0+IHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoaXRlbSwgY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50XTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0luc2lkZUN1cnJlbnQoaXRlbSwgY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlckVuZElzQ3VycmVudFN0YXJ0XTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyRW5kSXNDdXJyZW50U3RhcnQoaXRlbSwgY3VycmVudCwgb3RoZXIpLFxyXG4gICAgW092ZXJsYXBTdGF0ZS5PdGhlclN0YXJ0SXNDdXJyZW50RW5kXTogKGl0ZW0sIGN1cnJlbnQsIG90aGVyKSA9PiB0aGlzLmhhbmRsZU90aGVyU3RhcnRJc0N1cnJlbnRFbmQoaXRlbSwgY3VycmVudCwgb3RoZXIpXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBhZGFwdGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8YW55LCBhbnk+O1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IGhvbGRpbmcgZG93biB0aGUgcHJpbWFyeSBtb3VzZSBidXR0b24gb24gYSBzbG90ICovXHJcbiAgcHVibGljIGRyYWdnaW5nOiBib29sZWFuO1xyXG5cclxuICAvKiogc2hvdWxkIGJlIHRydWUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IGhvbGRpbmcgdGhlIG1vdXNlIHBvaW50ZXIgb3ZlciBhIHNsb3QgKi9cclxuICBwdWJsaWMgaG92ZXJpbmdTbG90OiBib29sZWFuO1xyXG5cclxuICAvKiogdGhpcyBpcyByZXF1aXJlZCB0byBiZSBwYXJ0IG9mIGEgZm9ybSBmb3IgZGlydHkvdmFsaWQgY2hlY2tzICovXHJcbiAgcHVibGljIGZvcm1Db250cm9sbGVyOiBhbmd1bGFyLklGb3JtQ29udHJvbGxlcjtcclxuXHJcbiAgLyoqIHNob3VsZCBiZSB0cnVlIGlmIHRoZSBzY2hlZHVsZXIgd2FzICoqaW5pdGlhbGl6ZWQqKiB3aXRoIGludmFsaWQgdmFsdWVzICovXHJcbiAgcHVibGljIHN0YXJ0ZWRXaXRoSW52YWxpZFNjaGVkdWxlOiBib29sZWFuO1xyXG4gIHB1YmxpYyBob3ZlckNsYXNzOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc8YW55PjtcclxuICBwdWJsaWMgaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PjtcclxuXHJcbiAgcHVibGljIGRlZmF1bHRPcHRpb25zOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8YW55PiA9IHtcclxuICAgIGNyZWF0ZUl0ZW06IChkYXksIHNjaGVkdWxlcykgPT4geyByZXR1cm4geyBkYXk6IGRheSwgc2NoZWR1bGVzOiBzY2hlZHVsZXMgfSB9LFxyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICAgIG9uQ2hhbmdlOiAoaXNWYWxpZCkgPT4gYW5ndWxhci5ub29wKClcclxuICB9O1xyXG5cclxuICBwdWJsaWMgdmFsaWRhdGlvbkVycm9yczogVmFsaWRhdGlvbkVycm9yW107XHJcblxyXG4gICRkb0NoZWNrKCkge1xyXG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyZSh0aGlzLm9wdGlvbnMpO1xyXG4gICAgdGhpcy5idWlsZEl0ZW1zRnJvbUFkYXB0ZXIoKTtcclxuICAgIHRoaXMuc3RhcnRlZFdpdGhJbnZhbGlkU2NoZWR1bGUgPSB0aGlzLmhhc0ludmFsaWRTY2hlZHVsZSgpO1xyXG4gICAgdGhpcy53YXRjaEFkYXB0ZXIoKTtcclxuICAgIHRoaXMud2F0Y2hIb3ZlckNsYXNzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzSW52YWxpZFNjaGVkdWxlKCkge1xyXG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gdGhpcy5nZXRWYWxpZGF0aW9uRXJyb3JzKCk7XHJcblxyXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtZXJnZVNjaGVkdWxlSW50b0l0ZW0oaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICAvLyBXZSBjb25zaWRlciB0aGUgc2NoZWR1bGUgd2Ugd2VyZSB3b3JraW5nIHdpdGggdG8gYmUgdGhlIG1vc3QgaW1wb3J0YW50LCBzbyBoYW5kbGUgaXRzIG92ZXJsYXBzIGZpcnN0LlxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKGl0ZW0sIHNjaGVkdWxlKTtcclxuICAgIHRoaXMubWVyZ2VBbGxPdmVybGFwc0Zvckl0ZW0oaXRlbSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25DaGFuZ2UoKSB7XHJcbiAgICB0aGlzLmNvbmZpZy5vbkNoYW5nZSghdGhpcy5oYXNJbnZhbGlkU2NoZWR1bGUoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBY3R1YWxseSByZW1vdmUgdGhlIHNjaGVkdWxlIGZyb20gYm90aCB0aGUgc2NyZWVuIGFuZCB0aGUgbW9kZWxcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuaG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcblxyXG4gICAgaXRlbS5yZW1vdmVTY2hlZHVsZShzY2hlZHVsZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21taXQgbmV3IHZhbHVlcyB0byB0aGUgc2NoZWR1bGVcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlU2NoZWR1bGUoc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHNjaGVkdWxlLnN0YXJ0ID0gdXBkYXRlLnN0YXJ0O1xyXG4gICAgc2NoZWR1bGUuZW5kID0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yTW9kZWwodGhpcy5jb25maWcsIHVwZGF0ZS5lbmQpO1xyXG5cclxuICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtcyhpdGVtczogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+W10pIHtcclxuICAgIHRoaXMuaXRlbXMgPSB0aGlzLmZpbGxJdGVtcyhpdGVtcyk7XHJcblxyXG4gICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5tZXJnZUFsbE92ZXJsYXBzRm9ySXRlbShpdGVtKSk7XHJcblxyXG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgYWRhcHRlciBzbyB3ZSBjYW4gcHVsbCBpdCBvdXQgbGF0ZXJcclxuICAgIHRoaXMuYWRhcHRlci5pdGVtcyA9IHRoaXMuaXRlbXM7XHJcblxyXG4gICAgLy8ga2VlcCBhIGNvcHkgb2YgdGhlIGl0ZW1zIGluIGNhc2Ugd2UgbmVlZCB0byByb2xsYmFja1xyXG4gICAgdGhpcy5fb3JpZ2luYWxJdGVtcyA9IGFuZ3VsYXIuY29weSh0aGlzLml0ZW1zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRJdGVtc0Zyb21BZGFwdGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVpbGRJdGVtcyh0aGlzLmdldEl0ZW1zRnJvbUFkYXB0ZXIoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEl0ZW1zRnJvbUFkYXB0ZXIoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuYWRhcHRlcikge1xyXG4gICAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5hZGFwdGVyLmluaXRpYWxEYXRhLm1hcChkYXRhID0+IHRoaXMuYWRhcHRlci5jdXN0b21Nb2RlbFRvV2Vla2x5U2NoZWR1bGVyUmFuZ2UoZGF0YSkpO1xyXG4gICAgICBsZXQgZ3JvdXBlZFNjaGVkdWxlcyA9IHRoaXMuZ3JvdXBTZXJ2aWNlLmdyb3VwU2NoZWR1bGVzKHNjaGVkdWxlcyk7XHJcblxyXG4gICAgICBmb3IgKGxldCBrZXkgaW4gZ3JvdXBlZFNjaGVkdWxlcykge1xyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5jcmVhdGVJdGVtKHBhcnNlSW50KGtleSwgMTApLCBncm91cGVkU2NoZWR1bGVzW2tleV0pO1xyXG5cclxuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZhbGlkYXRpb25FcnJvcnMoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5pdGVtcy5tYXAoaXRlbSA9PiB0aGlzLnNjaGVkdWxlVmFsaWRhdG9yU2VydmljZS5nZXRWYWxpZGF0aW9uRXJyb3JzKGl0ZW0sIHRoaXMuY29uZmlnKSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWd1cmUob3B0aW9uczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJPcHRpb25zPGFueT4pOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT4ge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciB1c2VyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZCh1c2VyT3B0aW9ucywge1xyXG4gICAgICBpbnRlcnZhbDogaW50ZXJ2YWwsXHJcbiAgICAgIG1heFZhbHVlOiBtaW51dGVzSW5EYXksXHJcbiAgICAgIGhvdXJDb3VudDogaG91cnNJbkRheSxcclxuICAgICAgaW50ZXJ2YWxDb3VudDogaW50ZXJ2YWxDb3VudCxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUl0ZW0oZGF5OiBudW1iZXIsIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+W10pIHtcclxuICAgIGxldCByZXN1bHQ6IElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuXHJcbiAgICBsZXQgYnVpbGRlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSB0aGlzLmNvbmZpZy5jcmVhdGVJdGVtKGRheSwgc2NoZWR1bGVzKTtcclxuXHJcbiAgICByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChidWlsZGVyLCB7IGxhYmVsOiB0aGlzLmRheU1hcFtkYXldIH0pO1xyXG5cclxuICAgIHJldHVybiBuZXcgV2Vla2x5U2NoZWR1bGVySXRlbSh0aGlzLmNvbmZpZywgcmVzdWx0LCB0aGlzLm92ZXJsYXBTZXJ2aWNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzY2hlZHVsZXIgc2hvdWxkIGFsd2F5cyBzaG93IGFsbCBkYXlzLCBldmVuIGlmIGl0IHdhcyBub3QgcGFzc2VkIGFueSBzY2hlZHVsZXMgZm9yIHRoYXQgZGF5XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBmaWxsSXRlbXMoaXRlbXM6IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PltdKSB7XHJcbiAgICBsZXQgcmVzdWx0OiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT5bXSA9IFtdO1xyXG5cclxuICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmRheU1hcCwgKGRheTogc3RyaW5nLCBzdHJpbmdLZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICBsZXQga2V5ID0gcGFyc2VJbnQoc3RyaW5nS2V5LCAxMCk7XHJcbiAgICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gaXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5kYXkgPT09IGtleSk7XHJcbiAgICAgIGxldCBpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4gPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCA/IGZpbHRlcmVkSXRlbXNbMF0gOiBudWxsO1xyXG5cclxuICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5jcmVhdGVJdGVtKGtleSwgW10pKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJZiB0aGUgaXRlbSBESUQgZXhpc3QganVzdCBzZXQgdGhlIGxhYmVsXHJcbiAgICAgICAgaXRlbS5sYWJlbCA9IGRheTtcclxuXHJcbiAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBhbmd1bGFyLmNvcHkocmVzdWx0KS5zb3J0KChhLCBiKSA9PiBhLmRheSA+IGIuZGF5ID8gMSA6IC0xKTtcclxuICB9XHJcblxyXG4gIC8vIE92ZXJsYXAgaGFuZGxlcnNcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVDdXJyZW50Q292ZXJzT3RoZXIoaXRlbTogV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+LCBjdXJyZW50OiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIG90aGVyOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pOiB2b2lkIHtcclxuICAgIC8vIEhlcmUsIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHRoZSB2YWx1ZXMgbWF0Y2ggLS0gdGhlIGNvdmVyaW5nIHNsb3QgY2FuIGFsd2F5cyBcImVhdFwiIHRoZSBvdGhlciBvbmVcclxuICAgIHRoaXMucmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtLCBvdGhlcik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUN1cnJlbnRJc0luc2lkZU90aGVyKGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgLy8gUmVtb3ZlICdvdGhlcicgJiBtYWtlIGN1cnJlbnQgZXhwYW5kIHRvIGZpdCB0aGUgb3RoZXIgc2xvdFxyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlRnJvbUl0ZW0oaXRlbSwgb3RoZXIpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShjdXJyZW50LCB7XHJcbiAgICAgICAgZGF5OiBvdGhlci5kYXksXHJcbiAgICAgICAgc3RhcnQ6IG90aGVyLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogb3RoZXIuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEp1c3QgcmVtb3ZlICdjdXJyZW50J1xyXG4gICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlRnJvbUl0ZW0oaXRlbSwgY3VycmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZU5vT3ZlcmxhcChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgLy8gRG8gbm90aGluZ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlckVuZElzSW5zaWRlQ3VycmVudChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGVGcm9tSXRlbShpdGVtLCBvdGhlcik7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKGN1cnJlbnQsIHtcclxuICAgICAgICBkYXk6IGN1cnJlbnQuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBvdGhlci5zdGFydCxcclxuICAgICAgICBlbmQ6IGN1cnJlbnQuZW5kLFxyXG4gICAgICAgIHZhbHVlOiBvdGhlci52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUob3RoZXIsIHtcclxuICAgICAgICBkYXk6IG90aGVyLmRheSxcclxuICAgICAgICBzdGFydDogb3RoZXIuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBjdXJyZW50LnN0YXJ0LFxyXG4gICAgICAgIHZhbHVlOiBjdXJyZW50LnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVPdGhlclN0YXJ0SXNJbnNpZGVDdXJyZW50KGl0ZW06IFdlZWtseVNjaGVkdWxlckl0ZW08YW55PiwgY3VycmVudDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNNYXRjaChjdXJyZW50LCBvdGhlcikpIHtcclxuICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZUZyb21JdGVtKGl0ZW0sIG90aGVyKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlU2NoZWR1bGUoY3VycmVudCwge1xyXG4gICAgICAgIGRheTogY3VycmVudC5kYXksXHJcbiAgICAgICAgc3RhcnQ6IGN1cnJlbnQuc3RhcnQsXHJcbiAgICAgICAgZW5kOiBvdGhlci5lbmQsXHJcbiAgICAgICAgdmFsdWU6IG90aGVyLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVTY2hlZHVsZShvdGhlciwge1xyXG4gICAgICAgIGRheTogb3RoZXIuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LmVuZCxcclxuICAgICAgICBlbmQ6IG90aGVyLmVuZCxcclxuICAgICAgICB2YWx1ZTogb3RoZXIudmFsdWVcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJFbmRJc0N1cnJlbnRTdGFydChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJFbmRJc0luc2lkZUN1cnJlbnQoaXRlbSwgY3VycmVudCwgb3RoZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRE8gTk9USElORywgdGhpcyBpcyBva2F5IGlmIHRoZSB2YWx1ZXMgZG9uJ3QgbWF0Y2hcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlT3RoZXJTdGFydElzQ3VycmVudEVuZChpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIGN1cnJlbnQ6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Piwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMudmFsdWVzTWF0Y2goY3VycmVudCwgb3RoZXIpKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlT3RoZXJTdGFydElzSW5zaWRlQ3VycmVudChpdGVtLCBjdXJyZW50LCBvdGhlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBETyBOT1RISU5HLCB0aGlzIGlzIG9rYXkgaWYgdGhlIHZhbHVlcyBkb24ndCBtYXRjaFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRW5kIG92ZXJsYXAgaGFuZGxlcnNcclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUFsbE92ZXJsYXBzRm9ySXRlbShpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4pIHtcclxuICAgIGRvIHtcclxuICAgICAgaXRlbS5zY2hlZHVsZXMuZm9yRWFjaChzY2hlZHVsZSA9PiB0aGlzLm1lcmdlT3ZlcmxhcHMoaXRlbSwgc2NoZWR1bGUpKTtcclxuICAgIH0gd2hpbGUgKGl0ZW0ubmVlZHNPdmVybGFwc01lcmdlZCgpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VPdmVybGFwcyhpdGVtOiBXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT4sIHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwgPT4ge1xyXG4gICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgbGV0IG92ZXJsYXBTdGF0ZSA9IHRoaXMub3ZlcmxhcFNlcnZpY2UuZ2V0T3ZlcmxhcFN0YXRlKHRoaXMuY29uZmlnLCBzY2hlZHVsZSwgZWwpO1xyXG4gICAgICAgIGxldCBvdmVybGFwSGFuZGxlciA9IHRoaXMub3ZlcmxhcEhhbmRsZXJzW292ZXJsYXBTdGF0ZV07XHJcblxyXG4gICAgICAgIG92ZXJsYXBIYW5kbGVyKGl0ZW0sIHNjaGVkdWxlLCBlbCk7XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRab29tKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTRVRfWk9PTSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHpvb21JbigpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01fSU4pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByb2xsYmFjaygpIHtcclxuICAgIHRoaXMuYnVpbGRJdGVtcyh0aGlzLl9vcmlnaW5hbEl0ZW1zKTtcclxuICAgIHRoaXMuZm9ybUNvbnRyb2xsZXIuJHNldFByaXN0aW5lKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNhdmUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2F2ZVNjaGVkdWxlcigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB3YXRjaEFkYXB0ZXIoKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2goKCkgPT4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5hZGFwdGVyO1xyXG4gICAgfSwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmJ1aWxkSXRlbXNGcm9tQWRhcHRlcigpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHdhdGNoSG92ZXJDbGFzcygpIHtcclxuICAgIGNvbnN0IHB1bHNlQ2xhc3MgPSAncHVsc2UnO1xyXG4gICAgY29uc3QgcHVsc2VTZWxlY3RvciA9IGAuJHtwdWxzZUNsYXNzfWA7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoKCgpID0+IHRoaXMuaG92ZXJDbGFzcywgKCkgPT4ge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmZpbmQocHVsc2VTZWxlY3RvcikucmVtb3ZlQ2xhc3MocHVsc2VDbGFzcyk7XHJcblxyXG4gICAgICBpZiAodGhpcy5ob3ZlckNsYXNzKSB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKGAuJHt0aGlzLmhvdmVyQ2xhc3N9YCkuYWRkQ2xhc3MocHVsc2VDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNNYXRjaChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBvdGhlcjogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICByZXR1cm4gc2NoZWR1bGUudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGFkYXB0ZXI6ICc8JyxcclxuICAgIGhvdmVyQ2xhc3M6ICc8JyxcclxuICAgIG9wdGlvbnM6ICc9J1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgcmVxdWlyZSA9IHtcclxuICAgIGZvcm1Db250cm9sbGVyOiAnZm9ybSdcclxuICB9O1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBBaGhhaGhhaGghIEZpZ2h0ZXIgb2YgdGhlIE5pZ2h0TWFwISAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIERheU1hcCB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnYnJXZWVrbHlTY2hlZHVsZXJEYXlNYXAnO1xyXG4gICAgXHJcbiAgICBzdGF0aWMgdmFsdWUgPSB7XHJcbiAgICAgICAgMDogJ01vbicsXHJcbiAgICAgICAgMTogJ1R1ZScsXHJcbiAgICAgICAgMjogJ1dlZCcsXHJcbiAgICAgICAgMzogJ1RodXInLFxyXG4gICAgICAgIDQ6ICdGcmknLFxyXG4gICAgICAgIDU6ICdTYXQnLFxyXG4gICAgICAgIDY6ICdTdW4nIFxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KERheU1hcC4kbmFtZSwgRGF5TWFwLnZhbHVlKTtcclxuIiwibmFtZXNwYWNlIGJyLndlZWtseVNjaGVkdWxlciB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgICAgICBkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzO1xyXG4gICAgICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgICAgICBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogVXNlIHRoaXMgZm9yIHByb3BlcnRpZXMgeW91IG5lZWQgYWNjZXNzIHRvIGJ1dCBkb24ndCB3YW50IGV4cG9zZWQgdG8gY2xpZW50cyAqL1xyXG4vKiogQGludGVybmFsICovXHJcbmludGVyZmFjZSBJSW50ZXJuYWxXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IGV4dGVuZHMgYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJJdGVtPFQ+IHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBQcm92aWRlcyBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgYW4gaXRlbSAtLSBwYXNzIGl0IGluIGFuZCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGFsbG93IHlvdSB0byBvcGVyYXRlIG9uIGl0ICovXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVySXRlbTxUPiBpbXBsZW1lbnRzIElJbnRlcm5hbFdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuICAgIGVkaXRhYmxlOiBib29sZWFuO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIHNjaGVkdWxlczogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPFQ+LFxyXG4gICAgICAgIHByaXZhdGUgaXRlbTogSUludGVybmFsV2Vla2x5U2NoZWR1bGVySXRlbTxUPixcclxuICAgICAgICBwcml2YXRlIG92ZXJsYXBTZXJ2aWNlOiBPdmVybGFwU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5kYXkgPSBpdGVtLmRheTtcclxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gaXRlbS5lZGl0YWJsZTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gaXRlbS5sYWJlbDtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcml2YXRlIHNjaGVkdWxlc0hhdmVNYXRjaGluZ1ZhbHVlcyhzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPiwgb3RoZXI6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4pIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGUudmFsdWUgPT09IG90aGVyLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVzLnB1c2goc2NoZWR1bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNOb1NjaGVkdWxlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0VkaXRhYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhYW5ndWxhci5pc0RlZmluZWQodGhpcy5lZGl0YWJsZSkgfHwgdGhpcy5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmVlZHNPdmVybGFwc01lcmdlZCgpIHtcclxuICAgICAgICBsZXQgbGVuID0gdGhpcy5zY2hlZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHR3byBhdCBhIHRpbWVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuc2NoZWR1bGVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuc2NoZWR1bGVzW2krMV07XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zY2hlZHVsZXNIYXZlTWF0Y2hpbmdWYWx1ZXMoY3VycmVudCwgbmV4dCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdmVybGFwU3RhdGUgPSB0aGlzLm92ZXJsYXBTZXJ2aWNlLmdldE92ZXJsYXBTdGF0ZSh0aGlzLmNvbmZpZywgY3VycmVudCwgbmV4dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtPdmVybGFwU3RhdGUuT3RoZXJFbmRJc0N1cnJlbnRTdGFydCwgT3ZlcmxhcFN0YXRlLk90aGVyU3RhcnRJc0N1cnJlbnRFbmRdLmluZGV4T2Yob3ZlcmxhcFN0YXRlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikge1xyXG4gICAgICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgTnVsbEVuZFdpZHRoIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlck51bGxFbmRXaWR0aCc7XHJcblxyXG4gICAgc3RhdGljIHZhbHVlID0gMTIwO1xyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnN0YW50KE51bGxFbmRXaWR0aC4kbmFtZSwgTnVsbEVuZFdpZHRoLnZhbHVlKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckdGltZW91dCcsXHJcbiAgICAnYnJXZWVrbHlTY2hlZHVsZXJFbmRBZGp1c3RlclNlcnZpY2UnLFxyXG4gICAgJ2JyV2Vla2x5U2NoZWR1bGVyTnVsbEVuZFdpZHRoJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbXVsdGlzbGlkZXJDdHJsOiBNdWx0aVNsaWRlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnPGFueT47XHJcbiAgcHJpdmF0ZSBuZ01vZGVsQ3RybDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgZWRpdFNjaGVkdWxlOiAob3B0aW9uczogeyBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSB1cGRhdGVTY2hlZHVsZTogKG9wdGlvbnM6IHsgc2NoZWR1bGU6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiwgdXBkYXRlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT59KSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgcmVtb3ZlU2NoZWR1bGU6IChvcHRpb25zOiB7IHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4gfSkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBwcml2YXRlIHN0YXJ0RHJhZ1RpbWVvdXQ6IGFuZ3VsYXIuSVByb21pc2U8dm9pZD47XHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbmRBZGp1c3RlclNlcnZpY2U6IEVuZEFkanVzdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgbnVsbEVuZFdpZHRoOiBudW1iZXJcclxuICApIHtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0gdGhpcy5nZXREcmFnU3RhcnRWYWx1ZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdlIHdhbnQgdG8gY2FuY2VsIHRoZSBkcmFnIG9wZXJhdGlvbiBpZiB0aGUgdXNlciBpcyBqdXN0IGNsaWNraW5nIG9uIHRoZSBpdGVtIG9yIGhhcyBzdGFydGVkIGRyYWdnaW5nIHdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIGRyYWcgdG8gXCJhY3RpdmF0ZVwiXHJcbiAgICogSG93ZXZlciwgd2Ugc2hvdWxkIGdpdmUgdGhlbSBhIHNtYWxsIHRvbGVyYW5jZSBiZWZvcmUgY29uc2lkZXJpbmcgdGhlbSB0byBoYXZlIHN0YXJ0ZWQgZHJhZ2dpbmcgZWFybHksIGFzIGl0IGlzIHZlcnkgZWFzeSB0byBhY2NpZGVudGFsbHkgbW92ZSBhIGZldyBwaXhlbHMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBpZiAocGl4ZWwgPiAzKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYW5jZWxEcmFnKCkge1xyXG4gICAgdGhpcy4kdGltZW91dC5jYW5jZWwodGhpcy5zdGFydERyYWdUaW1lb3V0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RHJhZ1N0YXJ0VmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGF5OiB0aGlzLnNjaGVkdWxlLmRheSxcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5jb25maWcubnVsbEVuZHMgP1xyXG4gICAgICAgICAgIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIHRoaXMuc2NoZWR1bGUuc3RhcnQgKyB0aGlzLm51bGxFbmRXaWR0aCkgOlxyXG4gICAgICAgICAgIHRoaXMuZW5kQWRqdXN0ZXJTZXJ2aWNlLmFkanVzdEVuZEZvclZpZXcodGhpcy5jb25maWcsIHRoaXMuc2NoZWR1bGUuZW5kKSxcclxuICAgICAgdmFsdWU6IHRoaXMuc2NoZWR1bGUudmFsdWVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh7IHNjaGVkdWxlOiB0aGlzLnNjaGVkdWxlIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgdGhpcy5lZGl0U2NoZWR1bGUoeyBzY2hlZHVsZTogdGhpcy5zY2hlZHVsZSB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgdGhpcy5jYW5jZWxEcmFnSWZUaHJlc2hvbGRFeGNlZWRlZChwaXhlbCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IHRoaXMuY29uZmlnLm51bGxFbmRzID8gbnVsbCA6IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogdWkuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogdWkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIHRoaXMuY2FuY2VsRHJhZygpO1xyXG5cclxuICAgIGlmICghdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZWRpdFNlbGYoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyBuZy1jbGljayBmcm9tIGFjY2lkZW50YWxseSBmaXJpbmcgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgfSwgMjAwKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwubWVyZ2UodGhpcy5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgaWYgKCF0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSkge1xyXG4gICAgICB0aGlzLmNhbmNlbERyYWdJZlRocmVzaG9sZEV4Y2VlZGVkKHBpeGVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICB0aGlzLnJlc2l6ZVN0YXJ0KHVpLCBkZWx0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc2l6ZUVuZCh1aSwgZGVsdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZVN0YXJ0KHNjaGVkdWxlOiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4sIGRlbHRhOiBudW1iZXIpIHtcclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBzdGFydENoYW5nZWQgPSBzY2hlZHVsZS5zdGFydCAhPT0gbmV3U3RhcnQ7XHJcbiAgICBsZXQgbmV3U3RhcnRCZWZvcmVPckF0RW5kID0gbmV3U3RhcnQgPD0gdGhpcy5lbmRBZGp1c3RlclNlcnZpY2UuYWRqdXN0RW5kRm9yVmlldyh0aGlzLmNvbmZpZywgc2NoZWR1bGUuZW5kKSAtIDE7XHJcbiAgICBsZXQgbmV3U3RhcnRBZnRlck9yQXRTdGFydCA9IG5ld1N0YXJ0ID49IDA7XHJcblxyXG4gICAgaWYgKHN0YXJ0Q2hhbmdlZCAmJiBuZXdTdGFydEJlZm9yZU9yQXRFbmQgJiYgbmV3U3RhcnRBZnRlck9yQXRTdGFydCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogc2NoZWR1bGUuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IHNjaGVkdWxlLmVuZCxcclxuICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZUVuZChzY2hlZHVsZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+LCBkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuICAgIGxldCBlbmRDaGFuZ2VkID0gc2NoZWR1bGUuZW5kICE9PSBuZXdFbmQ7XHJcbiAgICBsZXQgbmV3RW5kQmVmb3JlT3JBdEVuZCA9IG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZTtcclxuICAgIGxldCBuZXdFbmRBZnRlck9yQXRTdGFydCA9IG5ld0VuZCA+PSBzY2hlZHVsZS5zdGFydCArIDE7XHJcblxyXG4gICAgaWYgKGVuZENoYW5nZWQgJiYgbmV3RW5kQWZ0ZXJPckF0U3RhcnQgJiYgbmV3RW5kQmVmb3JlT3JBdEVuZCkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIGRheTogc2NoZWR1bGUuZGF5LFxyXG4gICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZCxcclxuICAgICAgICB2YWx1ZTogc2NoZWR1bGUudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy5zdGFydERyYWdUaW1lb3V0ID0gdGhpcy4kdGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHRoaXMuc2NoZWR1bGUuJGlzQWN0aXZlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuY2FuQWRkID0gZmFsc2U7XHJcbiAgICB9LCA1MDApO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogYnIud2Vla2x5U2NoZWR1bGVyLklXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlKHsgc2NoZWR1bGU6IHRoaXMuc2NoZWR1bGUsIHVwZGF0ZTogdXBkYXRlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ2JyV2Vla2x5U2xvdCc7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIHNjaGVkdWxlOiAnPW5nTW9kZWwnLFxyXG4gICAgZWRpdFNjaGVkdWxlOiAnJicsXHJcbiAgICByZW1vdmVTY2hlZHVsZTogJyYnLFxyXG4gICAgdXBkYXRlU2NoZWR1bGU6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgbXVsdGlzbGlkZXJDdHJsOiAnXmJyTXVsdGlTbGlkZXInLFxyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCdici53ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdicldlZWtseVNjaGVkdWxlclpvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudDogYW55KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRab29tRWxlbWVudChjb250YWluZXI6IGFueSkge1xyXG4gICAgICAgIHJldHVybiBjb250YWluZXIucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFpvb21XaWR0aChlbGVtZW50OiBhbnksIHdpZHRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgIHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGggPSB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICcxMDAlJyk7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgem9vbUluKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIC8vIGdldCBjdXJyZW50IHpvb20gbGV2ZWwgZnJvbSB6b29tZWQgZWxlbWVudCBhcyBhIHBlcmNlbnRhZ2VcclxuICAgICAgICBsZXQgem9vbSA9IHRoaXMuZ2V0Wm9vbUVsZW1lbnQoZWxlbWVudCkuc3R5bGUud2lkdGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gcGFyc2UgdG8gaW50ZWdlciAmIGRvdWJsZVxyXG4gICAgICAgIGxldCBsZXZlbCA9IHBhcnNlSW50KHpvb20sIDEwKSAqIDI7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgYmFjayB0byBwZXJjZW50YWdlXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgbGV2ZWwgKyAnJScpO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUluQUNlbGwoZWxlbWVudDogYW55LCBldmVudDogYW5ndWxhci5JQW5ndWxhckV2ZW50LCBkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgZWxlbWVudENvdW50ID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gICAgICAgIGxldCBpID0gZGF0YS5pZHg7XHJcblxyXG4gICAgICAgIGxldCBjb250YWluZXJXaWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvRGlzcGxheSA9IDU7XHJcbiAgICAgICAgbGV0IGJveFdpZHRoID0gY29udGFpbmVyV2lkdGggLyBib3hlc1RvRGlzcGxheTtcclxuXHJcbiAgICAgICAgbGV0IGJveGVzVG9Ta2lwID0gMjtcclxuICAgICAgICBsZXQgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoICogYm94ZXNUb1NraXA7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJScpO1xyXG5cclxuICAgICAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IGkgKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tQnlTY3JvbGwoZWxlbWVudDogYW55LCBldmVudDogV2hlZWxFdmVudCwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBjdXJyZW50V2lkdGggPSB0aGlzLmdldEN1cnJlbnRab29tV2lkdGgoZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFpvb21XaWR0aChlbGVtZW50LCAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN1cnJlbnRXaWR0aCAtIDIgKiBkZWx0YTtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnKTtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYnIud2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFpvb21TZXJ2aWNlLiRuYW1lLCBab29tU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElSZXNpemVTZXJ2aWNlIHtcclxuICAgIGluaXRpYWxpemUoKTogdm9pZDtcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZVNlcnZpY2VQcm92aWRlciBleHRlbmRzIGFuZ3VsYXIuSVNlcnZpY2VQcm92aWRlciB7XHJcbiAgICAgICAgc2V0Q3VzdG9tUmVzaXplRXZlbnRzKGV2ZW50czogc3RyaW5nW10pO1xyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRGF5cyB7XHJcbiAgICAgICAgTW9uZGF5ID0gMCxcclxuICAgICAgICBUdWVzZGF5ID0gMSxcclxuICAgICAgICBXZWRuZXNkYXksXHJcbiAgICAgICAgVGh1cnNkYXksXHJcbiAgICAgICAgRnJpZGF5LFxyXG4gICAgICAgIFNhdHVyZGF5LFxyXG4gICAgICAgIFN1bmRheVxyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBici53ZWVrbHlTY2hlZHVsZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBsZW1lbnQgdGhpcyBvbiBhIGNsaWVudCBhbmQgdGhlbiBwYXNzIGl0IGluIHRvIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckFkYXB0ZXI8VEN1c3RvbSwgVFZhbHVlPiB7XHJcbiAgICAgICAgY3VzdG9tTW9kZWxUb1dlZWtseVNjaGVkdWxlclJhbmdlKGN1c3RvbTogVEN1c3RvbSk6IGJyLndlZWtseVNjaGVkdWxlci5JV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VFZhbHVlPjtcclxuXHJcbiAgICAgICAgLyoqIFRyYW5zZm9ybSB0aGUgZGF0YSBoZWxkIHdpdGhpbiB0aGUgY29tcG9uZW50IHRvIHRoZSBmb3JtYXQgeW91IG5lZWQgaXQgb3V0c2lkZSBvZiB0aGUgY29tcG9uZW50LiAqL1xyXG4gICAgICAgIGdldFNuYXBzaG90KCk6IFRDdXN0b21bXTtcclxuXHJcbiAgICAgICAgLyoqIFRoaXMganVzdCBuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBjbGFzcywgd2UnbGwgc2V0IGl0IGludGVybmFsbHkgKi9cclxuICAgICAgICBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08VFZhbHVlPltdO1xyXG5cclxuICAgICAgICBpbml0aWFsRGF0YTogVEN1c3RvbVtdO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJGaWx0ZXJTZXJ2aWNlIGV4dGVuZHMgYW5ndWxhci5JRmlsdGVyU2VydmljZSB7XHJcbiAgICAobmFtZTogJ2JyV2Vla2x5U2NoZWR1bGVyTWludXRlc0FzVGV4dCcpOiAobWludXRlczogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlck9wdGlvbnM8VD4ge1xyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIHRydWUgc2NoZWR1bGVzIHdpbGwgYmUgYWxsb3dlZCAmIHJlcXVpcmVkIHRvIGhhdmUgbm8gc2V0IGVuZCB0aW1lICovXHJcbiAgICAgICAgbnVsbEVuZHM/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhlc2UgY2xhc3NlcyB3aWxsIGJlIGFwcGxpZWQgZGlyZWN0bHkgdG8gdGhlIGJ1dHRvbnMgKi9cclxuICAgICAgICBidXR0b25DbGFzc2VzPzogc3RyaW5nW107XHJcblxyXG4gICAgICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHJldHVybiBhbiBpdGVtIC0tIHRoaXMgaXMgUkVRVUlSRUQgc28gdGhhdCBhZGFwdGVycyB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBuZXcgaXRlbXMsIGV2ZW4gaWYgdGhleSB3ZXJlbid0IHBhc3NlZCBpbiAqL1xyXG4gICAgICAgIGNyZWF0ZUl0ZW06IChkYXk6IGJyLndlZWtseVNjaGVkdWxlci5EYXlzLCBzY2hlZHVsZXM6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPltdKSA9PiBici53ZWVrbHlTY2hlZHVsZXIuSVdlZWtseVNjaGVkdWxlckl0ZW08VD47XHJcblxyXG4gICAgICAgIC8qKiBkZWZhdWx0VmFsdWUgc2hvdWxkIGJlIGFzc2lnbmVkIHBlciBzZXQgb2Ygb3B0aW9ucywgbm90IHBlciBpdGVtLiBEbyBub3QgYXNzaWduIGZvciBubyBkZWZhdWx0ICovXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlPzogVDtcclxuXHJcbiAgICAgICAgLyoqIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZCBpbiBvcmRlciB0byBicmluZyB1cCBhbiBlZGl0b3IgZm9yIGl0ICovXHJcbiAgICAgICAgZWRpdFNsb3Q/OiAoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxUPikgPT4gYW5ndWxhci5JUHJvbWlzZTxJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD4+O1xyXG5cclxuICAgICAgICAvKiogSWYgdGhpcyBpcyB0cnVlLCBBTEwgc2xvdHMgaW4gdGhlIGNhbGVuZGFyIG11c3QgYmUgZmlsbGVkIGluIG9yZGVyIGZvciBpdCB0byBiZSB2YWxpZCAqL1xyXG4gICAgICAgIGZ1bGxDYWxlbmRhcj86IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKiBJZiB0aGlzIGlzIGRlZmluZWQsIGEgdGltZSBzbG90IHdpbGwgbm90IGJlIGFibGUgdG8gYmUgbW9yZSB0aGFuIHRoaXMgbWFueSBtaW51dGVzIGxvbmcgKi9cclxuICAgICAgICBtYXhUaW1lU2xvdD86IG51bWJlcjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgdHJ1ZSwgdGhlIGNhbGVuZGFyIHdpbGwgZW5mb3JjZSB0aGF0IG9ubHkgb25lIHNjaGVkdWxlIHBlciBpdGVtIGlzIGFsbG93ZWQgKi9cclxuICAgICAgICBtb25vU2NoZWR1bGU/OiBib29sZWFuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIGFjY2VzcyBiYWNrIHRvIHRoZSBjbGllbnQgc2NvcGUgd2hlbiB0aGUgc2NoZWR1bGVyIGNoYW5nZXMuIFVzZSBpdCB0byBob29rIGludG8gYW5ndWxhciBmb3Jtc1xyXG4gICAgICAgICAqIGZvciBzZXR0aW5nICRkaXJ0eSBvciB1cGRhdGluZyB2YWxpZGF0aW9uIGluIGNhc2VzIHdoZXJlIGl0IGlzIG5vdCBkZXNpcmFibGUgdG8gc2F2ZSBzY2hlZHVsZXMgaW5kaXZpZHVhbGx5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ2hhbmdlPzogKGlzVmFsaWQ6IGJvb2xlYW4pID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIG1pbnV0ZXMgZWFjaCBkaXZpc2lvbiBvZiB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIC0tIHZhbHVlcyB3aWxsIHNuYXAgdG8gdGhpcyAqL1xyXG4gICAgICAgIGludGVydmFsPzogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKiogQSBmdW5jdGlvbiB0byBjYWxsIHdlbiB0aGUgc2F2ZSBidXR0b24gaXMgY2xpY2tlZC4gSWYgdGhpcyBpcyBub3QgcGFzc2VkLCBubyBzYXZlIGJ1dHRvbiB3aWxsIGJlIHByZXNlbnQuICovXHJcbiAgICAgICAgc2F2ZVNjaGVkdWxlcj86ICgpID0+IGFuZ3VsYXIuSVByb21pc2U8YW55PjtcclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgYnIud2Vla2x5U2NoZWR1bGVyIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgICAgICAvKiogQSBjc3MgY2xhc3MgdG8gYXBwbHkgKi9cclxuICAgICAgICAkY2xhc3M/OiBzdHJpbmc7XHJcblxyXG4gICAgICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgY29uc2lkZXJlZCBhY3RpdmUgdG8gdGhlIFVJICovXHJcbiAgICAgICAgJGlzQWN0aXZlPzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUgd2hpbGUgdGhlIHVzZXIgaXMgZWRpdGluZyBhbiBleGlzdGluZyBpdGVtLCBpdCB3aWxsIGJlIHJlbW92ZWQgd2hlbiB0aGUgZWRpdCBwcm9taXNlIGlzIHJlc29sdmVkICovXHJcbiAgICAgICAgJGlzRGVsZXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogVGhpcyB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGJlaW5nIGVkaXRlZCBieSB0aGUgdXNlciAqL1xyXG4gICAgICAgICRpc0VkaXRpbmc/OiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKiogTm90IHN0cmljdGx5IG5lY2Vzc2FyeSBidXQgbWFrZXMgdGhpbmdzIGEgd2hvb29sZSBsb3QgZWFzaWVyICovXHJcbiAgICAgICAgZGF5OiBici53ZWVrbHlTY2hlZHVsZXIuRGF5cztcclxuXHJcbiAgICAgICAgc3RhcnQ6IG51bWJlcjtcclxuICAgICAgICBlbmQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgdmFsdWU6IFQ7XHJcbiAgICB9XHJcbn1cclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo" ng-form="testWrapper"><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><button ng-click="saveAll()" ng-disabled="!testWrapper.$dirty || !testWrapper.$valid">Save</button><br-weekly-scheduler adapter="adapter" ng-form="test" options="model.options"></br-weekly-scheduler><code>Valid: {{ test.$valid }}</code><hr><br-weekly-scheduler adapter="adapterTwo" ng-form="test2" options="model2.options"></br-weekly-scheduler><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></div></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="ghost-wrapper" br-handle ondragstart="multiSliderCtrl.onGhostWrapperMouseDown(event)" ondragstop="multiSliderCtrl.onGhostWrapperMouseUp()" ondrag="multiSliderCtrl.onGhostWrapperMouseMove(event)"><br-ghost-slot class="slot" ng-if="multiSliderCtrl.canRenderGhost()" ng-class="{\r\n                      active: multiSliderCtrl.isDraggingGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }" ng-style="{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }"><div class="slotWrapper"><div class="middle fullWidth"><span ng-if="!multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span> <span ng-if="multiSliderCtrl.config.nullEnds">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span></div></div></br-ghost-slot><br-weekly-slot class="slot {{ schedule.$class }}" config="multiSliderCtrl.config" item="multiSliderCtrl.item" ng-class="{\r\n                    active: schedule.$isActive,\r\n                    disable: multiSliderCtrl.item.editable === false,\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }" edit-schedule="multiSliderCtrl.editSchedule(schedule)" remove-schedule="multiSliderCtrl.removeSchedule(schedule)" update-schedule="multiSliderCtrl.schedulerCtrl.updateSchedule(schedule, update)"></br-weekly-slot></div>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div ng-if="!schedulerCtrl.startedWithInvalidSchedule"><div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day">{{ item.label }}</div></div><br-schedule-area-container><div class="schedule-area"><div class="srow timestamps"><br-hourly-grid></br-hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items track by item.day"><br-hourly-grid no-text></br-hourly-grid><br-multi-slider config="schedulerCtrl.config" ng-model="item"></br-multi-slider></div></div></br-schedule-area-container><br-restriction-explanations></br-restriction-explanations><div class="srow buttons"><button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.rollback()" ng-disabled="!schedulerCtrl.formController.$dirty">Reset</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.save()" ng-disabled="!schedulerCtrl.formController.$dirty || schedulerCtrl.validationErrors.length" ng-if="schedulerCtrl.config.saveScheduler">Save</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.resetZoom()">Zoom Out</button> <button ng-class="schedulerCtrl.config.buttonClasses" type="button" ng-click="schedulerCtrl.zoomIn()">Zoom In</button></div></div><div class="srow" ng-if="schedulerCtrl.startedWithInvalidSchedule">One or more of the schedules is invalid! Please contact service.</div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div class="slotWrapper" title="{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" br-handle><br-time-range schedule="weeklySlotCtrl.schedule"></br-time-range></div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" br-handle ng-if="!weeklySlotCtrl.config.nullEnds"></div></div>');}]);