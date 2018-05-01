angular.module('demoApp', ['weeklyScheduler'])
    .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {
        $scope.model = {
            options: {
                editSlot: function () {
                    alert('Editing slot');
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
                // {
                //   label: 'Fri',
                //   schedules: [
                //     { start: 720, end: 780 }
                //   ]
                // },
                {
                    label: 'Sat',
                    schedules: [
                        { start: 360, end: 480 },
                        { start: 1380, end: 0 }
                    ]
                }
            ]
        };
        this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
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
                    scope.ondragstart();
                }
            });
            function mousemove(event) {
                var delta = event.pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.ondrag({ delta: delta });
                }
            }
            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                if (angular.isFunction(scope.ondragstop)) {
                    scope.ondragstop();
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
        for (var i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                var currentHour = i % 12;
                var meridiem = i >= 12 ? 'p' : 'a';
                child.text("" + (currentHour || '12') + meridiem);
            }
            else {
                // no-text ones will get striped intervals
                child.addClass('striped');
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
    function MultiSliderController($element, $scope, $window) {
        this.$element = $element;
        this.$scope = $scope;
        this.$window = $window;
        this.canAdd = true;
        this.isDragging = false;
        this.isHoveringSlot = false;
        this.size = 60; // minutes
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.$onInit = function () {
        var _this = this;
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
        this.$element.on('mousemove', function (e) {
            var elOffX = _this.getElementOffsetX(_this.$element);
            var left = e.pageX - elOffX - _this.$hoverElement[0].clientWidth / 2;
            var val = _this.pixelToVal(left);
            _this.$hoverElement.css({
                left: _this.getSlotLeft(val),
                right: _this.getSlotRight(val + _this.size)
            });
        });
    };
    MultiSliderController.prototype.addSlot = function (start, end) {
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
        item.schedules.push({
            start: start,
            end: end
        });
        this.schedulerCtrl.onAdd();
    };
    MultiSliderController.prototype.getElementOffsetX = function (elem) {
        return elem[0].getBoundingClientRect().left;
    };
    MultiSliderController.prototype.compensateForBorder = function (elem, val) {
        var borderWidth = this.$window.getComputedStyle(elem).getPropertyValue('border-right');
        // There are double borders at the beginnings and ends of hours, so we don't need to worry about it
        var onHour = val % 60 === 0;
        return onHour ? elem.offsetLeft : elem.offsetLeft - parseInt(borderWidth, 10);
    };
    MultiSliderController.prototype.getSlotLeft = function (start) {
        var underlyingInterval = this.getUnderlyingInterval(start);
        return this.compensateForBorder(underlyingInterval, start) + 'px';
    };
    MultiSliderController.prototype.getSlotRight = function (end) {
        // An end of 0 should display allll the way to the right, up to the edge
        if (end === 0) {
            end = this.config.maxValue;
        }
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
    MultiSliderController.prototype.onHoverElementClick = function (event) {
        if (this.canAdd) {
            var elOffX = this.getElementOffsetX(this.$element);
            var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
            var start = this.pixelToVal(hoverElOffX);
            var end = start + this.size;
            this.addSlot(start, end);
        }
    };
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.isHoveringSlot = true;
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.isHoveringSlot = false;
    };
    MultiSliderController.prototype.resize = function () {
        /* Since we have changed the width of the element via plain js +
         * the ng-styles for the individual slots are computed in this controller,
         * we must call $apply() manually so they will all update their positions to match the zoom level
         */
        this.$scope.$apply();
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
        '$window'
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
    function WeeklySchedulerController($scope) {
        this.$scope = $scope;
        this.defaultOptions = {
            monoSchedule: false
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        var _this = this;
        this.config = this.configure(this.options);
        /**
         * Watch the model items
         */
        this.$scope.$watchCollection(function () { return _this.items; }, function (newItems) { return _this.onModelChange(newItems); });
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
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'weeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$scope'
    ];
    return WeeklySchedulerController;
}());
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
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
    function WeeklySlotController($scope, $timeout) {
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.resizeDirectionIsStart = true;
    }
    WeeklySlotController.prototype.$onInit = function () {
        this.valuesOnDragStart = this.getDragStartValues();
        this.mergeOverlaps();
    };
    WeeklySlotController.prototype.adjustEndForModel = function (end) {
        if (end === this.config.maxValue) {
            end = 0;
        }
        return end;
    };
    WeeklySlotController.prototype.adjustEndForView = function (end) {
        if (end === 0) {
            end = this.config.maxValue;
        }
        return end;
    };
    WeeklySlotController.prototype.getDragStartValues = function () {
        return {
            start: this.schedule.start,
            end: this.adjustEndForView(this.schedule.end)
        };
    };
    WeeklySlotController.prototype.canEdit = function () {
        var isEditable = !angular.isDefined(this.item.editable) || this.item.editable;
        var hasEditFunction = angular.isFunction(this.schedulerCtrl.config.editSlot);
        var isNotActive = !this.schedule.$isActive;
        var isNotDragging = !this.multisliderCtrl.isDragging;
        return isEditable && hasEditFunction && isNotActive && isNotDragging;
    };
    WeeklySlotController.prototype.canRemove = function () {
        var isRemovable = !angular.isDefined(this.item.editable) || this.item.editable;
        return isRemovable;
    };
    WeeklySlotController.prototype.deleteSelf = function () {
        this.multisliderCtrl.isDragging = false;
        this.multisliderCtrl.isHoveringSlot = false;
        this.removeSchedule(this.schedule);
        this.schedulerCtrl.onDelete();
    };
    WeeklySlotController.prototype.editSelf = function () {
        if (this.canEdit()) {
            this.schedulerCtrl.config.editSlot(this.schedule);
        }
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        this.multisliderCtrl.isDragging = true;
        var ui = this.schedule;
        var delta = this.multisliderCtrl.pixelToVal(pixel);
        var duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var newEnd = Math.round(newStart + duration);
        if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
            this.updateSelf({
                start: newStart,
                end: newEnd
            });
        }
    };
    WeeklySlotController.prototype.endDrag = function () {
        var _this = this;
        this.$scope.$apply(function () {
            // this prevents user from accidentally
            // adding new slot after resizing or dragging
            _this.multisliderCtrl.canAdd = true;
            _this.schedule.$isActive = false;
        });
        /**
         * When ending a drag there needs to be a small delay before setting isDragging back to false.
         * This is so that the ng-click event will not fire
         */
        this.$timeout(function () {
            _this.multisliderCtrl.isDragging = false;
        }, 200);
        this.mergeOverlaps();
    };
    WeeklySlotController.prototype.mergeOverlaps = function () {
        var _this = this;
        var schedule = this.schedule;
        var schedules = this.item.schedules;
        schedules.forEach(function (el) {
            if (el !== schedule) {
                var currentStart = schedule.start;
                var currentEnd = _this.adjustEndForView(schedule.end);
                var otherStart = el.start;
                var otherEnd = _this.adjustEndForView(el.end);
                // model is inside another slot
                if (otherEnd >= currentEnd && otherStart <= currentStart) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: el.end
                    });
                }
                // model completely covers another slot
                else if (currentEnd >= otherEnd && currentStart <= otherStart) {
                    _this.removeSchedule(el);
                }
                // another slot's end is inside current model
                else if (otherEnd >= currentStart && otherEnd <= currentEnd) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: schedule.end
                    });
                }
                // another slot's start is inside current model
                else if (otherStart >= currentStart && otherStart <= currentEnd) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: schedule.start,
                        end: el.end
                    });
                }
            }
        });
    };
    WeeklySlotController.prototype.removeSchedule = function (schedule) {
        var schedules = this.item.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
    };
    WeeklySlotController.prototype.resize = function (pixel) {
        this.multisliderCtrl.isDragging = true;
        var ui = this.schedule;
        var delta = this.multisliderCtrl.pixelToVal(pixel);
        if (this.resizeDirectionIsStart) {
            var newStart = Math.round(this.valuesOnDragStart.start + delta);
            if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                this.updateSelf({
                    start: newStart,
                    end: ui.end
                });
            }
        }
        else {
            var newEnd = Math.round(this.valuesOnDragStart.end + delta);
            if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= this.config.maxValue) {
                this.updateSelf({
                    start: ui.start,
                    end: newEnd
                });
            }
        }
    };
    WeeklySlotController.prototype.startDrag = function () {
        var _this = this;
        this.$scope.$apply(function () {
            _this.schedule.$isActive = true;
            _this.multisliderCtrl.canAdd = false;
        });
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
        this.schedule.start = update.start;
        this.schedule.end = this.adjustEndForModel(update.end);
        this.ngModelCtrl.$setViewValue(this.schedule);
        this.onChange();
    };
    WeeklySlotController.prototype.onChange = function () {
        this.schedulerCtrl.onChange({
            itemIndex: this.itemIndex,
            scheduleIndex: this.scheduleIndex,
            scheduleValue: this.schedule
        });
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        '$scope',
        '$timeout'
    ];
    return WeeklySlotController;
}());
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            schedule: '=ngModel',
            itemIndex: '<',
            scheduleIndex: '<',
            item: '='
        };
        this.controller = WeeklySlotController.$name;
        this.controllerAs = WeeklySlotController.$controllerAs;
        this.require = {
            multisliderCtrl: '^multiSlider',
            schedulerCtrl: '^weeklyScheduler',
            ngModelCtrl: 'ngModel'
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUs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QUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQWxFTSxpQkFBSyxHQUFHLGFBQWEsQ0FBQztJQUV0QixtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFpRXBDLGtCQUFDO0NBcEVELEFBb0VDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnd2Vla2x5U2NoZWR1bGVyJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGVkaXRTbG90OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ0VkaXRpbmcgc2xvdCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdTdW4nLFxyXG4gICAgICAgICAgLy8gICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIC8vICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAvLyAgICAgeyBzdGFydDogMzE1LCBlbmQ6IDM3NSB9XHJcbiAgICAgICAgICAvLyAgIF1cclxuICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAvLyB7XHJcbiAgICAgICAgICAvLyAgIGxhYmVsOiAnTW9uJyxcclxuICAgICAgICAgIC8vICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdUdWUnLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiAwLCBlbmQ6IDI0MCB9LFxyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAzNjAgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ1dlZCcsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDEyMCwgZW5kOiA3MjAgfVxyXG4gICAgICAgICAgLy8gICBdXHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgLy8gICBsYWJlbDogJ1RodXInLFxyXG4gICAgICAgICAgLy8gICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAvLyAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgLy8gICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIHtcclxuICAgICAgICAgIC8vICAgbGFiZWw6ICdGcmknLFxyXG4gICAgICAgICAgLy8gICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgIC8vICAgICB7IHN0YXJ0OiA3MjAsIGVuZDogNzgwIH1cclxuICAgICAgICAgIC8vICAgXVxyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTYXQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzNjAsIGVuZDogNDgwIH0sXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMTM4MCwgZW5kOiAwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZG9Tb21ldGhpbmcgPSBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlbW92ZShldmVudCkge1xyXG4gICAgICB2YXIgZGVsdGEgPSBldmVudC5wYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWcoeyBkZWx0YTogZGVsdGEgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0b3ApKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIb3VybHlHcmlkRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdob3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXndlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgbmJFbGVtZW50czogaG91ckNvdW50LFxyXG4gICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudEhvdXIgPSBpICUgMTI7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGkgPj0gMTIgPyAncCcgOiAnYSc7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC50ZXh0KGAke2N1cnJlbnRIb3VyIHx8ICcxMid9JHttZXJpZGllbX1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG5vLXRleHQgb25lcyB3aWxsIGdldCBzdHJpcGVkIGludGVydmFsc1xyXG4gICAgICAgICAgICBjaGlsZC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IDYwIC8gY29uZmlnLmludGVydmFsO1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWxQZXJjZW50YWdlID0gMTAwIC8gbnVtSW50ZXJ2YWxzSW5UaWNrO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1JbnRlcnZhbHNJblRpY2s7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyYW5kQ2hpbGQgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckd2luZG93J1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyO1xyXG4gIFxyXG4gIHB1YmxpYyBjYW5BZGQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIHB1YmxpYyBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHVibGljIGlzSG92ZXJpbmdTbG90OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcbiAgXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4sICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGxlZnQgPSBlLnBhZ2VYIC0gZWxPZmZYIC0gdGhpcy4kaG92ZXJFbGVtZW50WzBdLmNsaWVudFdpZHRoIC8gMjtcclxuXHJcbiAgICAgIHZhciB2YWwgPSB0aGlzLnBpeGVsVG9WYWwobGVmdCk7XHJcblxyXG4gICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiB0aGlzLmdldFNsb3RMZWZ0KHZhbCksXHJcbiAgICAgICAgcmlnaHQ6IHRoaXMuZ2V0U2xvdFJpZ2h0KHZhbCArIHRoaXMuc2l6ZSlcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRTbG90KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgIHN0YXJ0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5kID4gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW07XHJcblxyXG4gICAgaWYgKCFpdGVtLnNjaGVkdWxlcykge1xyXG4gICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe1xyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25BZGQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtZW50T2Zmc2V0WChlbGVtOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgIHJldHVybiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbXBlbnNhdGVGb3JCb3JkZXIoZWxlbTogSFRNTEVsZW1lbnQsIHZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgYm9yZGVyV2lkdGggPSB0aGlzLiR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKS5nZXRQcm9wZXJ0eVZhbHVlKCdib3JkZXItcmlnaHQnKTtcclxuXHJcbiAgICAvLyBUaGVyZSBhcmUgZG91YmxlIGJvcmRlcnMgYXQgdGhlIGJlZ2lubmluZ3MgYW5kIGVuZHMgb2YgaG91cnMsIHNvIHdlIGRvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgaXRcclxuICAgIGxldCBvbkhvdXIgPSB2YWwgJSA2MCA9PT0gMDtcclxuXHJcbiAgICByZXR1cm4gb25Ib3VyID8gZWxlbS5vZmZzZXRMZWZ0IDogZWxlbS5vZmZzZXRMZWZ0IC0gcGFyc2VJbnQoYm9yZGVyV2lkdGgsIDEwKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIHN0YXJ0KSArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gQW4gZW5kIG9mIDAgc2hvdWxkIGRpc3BsYXkgYWxsbGwgdGhlIHdheSB0byB0aGUgcmlnaHQsIHVwIHRvIHRoZSBlZGdlXHJcbiAgICBpZiAoZW5kID09PSAwKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlIHdhbnQgdGhlIHJpZ2h0IHNpZGUgdG8gZ28gL3VwIHRvLyB0aGUgaW50ZXJ2YWwgaXQgcmVwcmVzZW50cywgbm90IGNvdmVyIGl0LCBzbyB3ZSBtdXN0IHN1YnN0cmFjdCAxIGludGVydmFsXHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoZW5kIC0gdGhpcy5jb25maWcuaW50ZXJ2YWwpO1xyXG5cclxuICAgIGxldCBvZmZzZXRSaWdodCA9IHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIGVuZCkgKyB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0V2lkdGg7XHJcbiAgICBsZXQgY29udGFpbmVyTGVmdCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudClcclxuICAgIGxldCBjb250YWluZXJSaWdodCA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lclJpZ2h0IC0gY29udGFpbmVyTGVmdCAtIG9mZnNldFJpZ2h0ICsgJ3B4JztcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAvLyBTbGlnaHRseSBoYWNreSBidXQgZG9lcyB0aGUgam9iLiBUT0RPID9cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgbGVmdCBvZiB0aGUgbGVmdG1vc3QgaW50ZXJ2YWwsIHNvIHJldHVybiB0aGF0IGluc3RlYWRcclxuICAgIGlmICh2YWwgPCAwKSB7XHJcbiAgICAgIHZhbCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIHJpZ2h0IG9mIHRoZSByaWdodG1vc3QgaW50ZXJ2YWwgLS0gdGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBub3QgYWN0dWFsbHkgcmVuZGVyIHdpdGggYSBcInJlbFwiIHZhbHVlXHJcbiAgICBsZXQgcmlnaHRtb3N0ID0gdGhpcy5jb25maWcubWF4VmFsdWUgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuXHJcbiAgICBpZiAodmFsID4gcmlnaHRtb3N0KSB7XHJcbiAgICAgIHZhbCA9IHJpZ2h0bW9zdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5wYXJlbnQoKVswXS5xdWVyeVNlbGVjdG9yKGBbcmVsPScke3ZhbH0nXWApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy5jYW5BZGQpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHRoaXMuc2l6ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy5pc0hvdmVyaW5nU2xvdCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlTGVhdmUoKSB7XHJcbiAgICB0aGlzLmlzSG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2l6ZSgpIHtcclxuICAgIC8qIFNpbmNlIHdlIGhhdmUgY2hhbmdlZCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgdmlhIHBsYWluIGpzICtcclxuICAgICAqIHRoZSBuZy1zdHlsZXMgZm9yIHRoZSBpbmRpdmlkdWFsIHNsb3RzIGFyZSBjb21wdXRlZCBpbiB0aGlzIGNvbnRyb2xsZXIsXHJcbiAgICAgKiB3ZSBtdXN0IGNhbGwgJGFwcGx5KCkgbWFudWFsbHkgc28gdGhleSB3aWxsIGFsbCB1cGRhdGUgdGhlaXIgcG9zaXRpb25zIHRvIG1hdGNoIHRoZSB6b29tIGxldmVsXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBzY2hlZHVsZXJDdHJsOiAnXndlZWtseVNjaGVkdWxlcidcclxuICB9O1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAncmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICckd2luZG93J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUmVzaXplU2VydmljZS4kbmFtZSwgUmVzaXplU2VydmljZSlcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2UuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdzY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3Njcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAndGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSAmJiBob3VycyA8IDI0ID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlzcGxheUhvdXJzID0gaG91cnMgJSAxMiB8fCAxMjtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtkaXNwbGF5SG91cnN9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM7XHJcblxyXG4gIHB1YmxpYyBvbkFkZDogKCkgPT4gdm9pZDtcclxuICBwdWJsaWMgb25DaGFuZ2U6IChvcHRpb25zOiB7IGl0ZW1JbmRleDogbnVtYmVyLCBzY2hlZHVsZUluZGV4OiBudW1iZXIsIHNjaGVkdWxlVmFsdWU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcbiAgcHVibGljIG9uRGVsZXRlOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zID0ge1xyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuY29uZmlndXJlKHRoaXMub3B0aW9ucyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgbW9kZWwgaXRlbXNcclxuICAgICAqL1xyXG4gICAgdGhpcy4kc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigoKSA9PiB0aGlzLml0ZW1zLCAobmV3SXRlbXMpID0+IHRoaXMub25Nb2RlbENoYW5nZShuZXdJdGVtcykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWd1cmUob3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnMpOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnIHtcclxuICAgIHZhciBpbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgMTU7IC8vIG1pbnV0ZXNcclxuICAgIHZhciBob3Vyc0luRGF5ID0gMjQ7XHJcbiAgICB2YXIgbWludXRlc0luRGF5ID0gaG91cnNJbkRheSAqIDYwO1xyXG4gICAgdmFyIGludGVydmFsQ291bnQgPSBtaW51dGVzSW5EYXkgLyBpbnRlcnZhbDtcclxuXHJcbiAgICB2YXIgcmVzdWx0OiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnID0gYW5ndWxhci5leHRlbmQodGhpcy5kZWZhdWx0T3B0aW9ucywge1xyXG4gICAgICBlZGl0U2xvdDogb3B0aW9ucy5lZGl0U2xvdCxcclxuICAgICAgaW50ZXJ2YWw6IGludGVydmFsLFxyXG4gICAgICBtYXhWYWx1ZTogbWludXRlc0luRGF5LFxyXG4gICAgICBob3VyQ291bnQ6IGhvdXJzSW5EYXksXHJcbiAgICAgIGludGVydmFsQ291bnQ6IGludGVydmFsQ291bnRcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW9kZWxDaGFuZ2UoaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXSkge1xyXG4gICAgLy8gQ2hlY2sgaXRlbXMgYXJlIHByZXNlbnRcclxuICAgIGlmIChpdGVtcykge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xyXG4gICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHVzZSB3ZWVrbHktc2NoZWR1bGVyIGRpcmVjdGl2ZSB3aXRoIGFuIEFycmF5IG9mIGl0ZW1zJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgbW9kZWwgKHVzZSBpdCBpbiB0ZW1wbGF0ZSlcclxuICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgICAgLy8gSWYgaW4gbXVsdGlTbGlkZXIgbW9kZSwgZW5zdXJlIGEgc2NoZWR1bGUgYXJyYXkgaXMgcHJlc2VudCBvbiBlYWNoIGl0ZW1cclxuICAgICAgLy8gRWxzZSBvbmx5IHVzZSBmaXJzdCBlbGVtZW50IG9mIHNjaGVkdWxlIGFycmF5XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIGlmIChzY2hlZHVsZXMgJiYgc2NoZWR1bGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBpdGVtczogJz0nLFxyXG4gICAgb3B0aW9uczogJz0nLFxyXG4gICAgb25BZGQ6ICcmJyxcclxuICAgIG9uQ2hhbmdlOiAnJicsXHJcbiAgICBvbkRlbGV0ZTogJyYnXHJcbiAgfTtcclxuICBcclxuICBjb250cm9sbGVyID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRyYW5zY2x1ZGUgPSB0cnVlO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNsb3RDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50Q29udHJvbGxlciB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3RDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICd3ZWVrbHlTbG90Q3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJHRpbWVvdXQnXHJcbiAgXTtcclxuXHJcbiAgcHJpdmF0ZSBtdWx0aXNsaWRlckN0cmw6IE11bHRpU2xpZGVyQ29udHJvbGxlcjtcclxuICBwcml2YXRlIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcjtcclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG5cclxuICBwcml2YXRlIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPGFueT47XHJcbiAgcHJpdmF0ZSBpdGVtSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgcHJpdmF0ZSBzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcbiAgcHJpdmF0ZSBzY2hlZHVsZUluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgdmFsdWVzT25EcmFnU3RhcnQ6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgIHByaXZhdGUgJHRpbWVvdXQ6IGFuZ3VsYXIuSVRpbWVvdXRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHRoaXMuZ2V0RHJhZ1N0YXJ0VmFsdWVzKCk7XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkanVzdEVuZEZvck1vZGVsKGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoZW5kID09PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICBlbmQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbmQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkanVzdEVuZEZvclZpZXcoZW5kOiBudW1iZXIpIHtcclxuICAgIGlmIChlbmQgPT09IDApIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVuZDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RHJhZ1N0YXJ0VmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5hZGp1c3RFbmRGb3JWaWV3KHRoaXMuc2NoZWR1bGUuZW5kKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhbkVkaXQoKSB7XHJcbiAgICBsZXQgaXNFZGl0YWJsZSA9ICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICAgIGxldCBoYXNFZGl0RnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCk7XHJcbiAgICBsZXQgaXNOb3RBY3RpdmUgPSAhdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmU7XHJcbiAgICBsZXQgaXNOb3REcmFnZ2luZyA9ICF0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nO1xyXG5cclxuICAgIHJldHVybiBpc0VkaXRhYmxlICYmIGhhc0VkaXRGdW5jdGlvbiAmJiBpc05vdEFjdGl2ZSAmJiBpc05vdERyYWdnaW5nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNhblJlbW92ZSgpIHtcclxuICAgIGxldCBpc1JlbW92YWJsZSA9ICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuXHJcbiAgICByZXR1cm4gaXNSZW1vdmFibGU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVsZXRlU2VsZigpIHtcclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzSG92ZXJpbmdTbG90ID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICAgIHRoaXMuc2NoZWR1bGVyQ3RybC5vbkRlbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVkaXRTZWxmKCkge1xyXG4gICAgaWYgKHRoaXMuY2FuRWRpdCgpKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCh0aGlzLnNjaGVkdWxlKTtcclxuICAgICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdGhpcy5tdWx0aXNsaWRlckN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XHJcblxyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMubXVsdGlzbGlkZXJDdHJsLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG4gICAgbGV0IGR1cmF0aW9uID0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgLSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIFxyXG4gICAgdGhpcy4kc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNjaGVkdWxlLiRpc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBlbmRpbmcgYSBkcmFnIHRoZXJlIG5lZWRzIHRvIGJlIGEgc21hbGwgZGVsYXkgYmVmb3JlIHNldHRpbmcgaXNEcmFnZ2luZyBiYWNrIHRvIGZhbHNlLlxyXG4gICAgICogVGhpcyBpcyBzbyB0aGF0IHRoZSBuZy1jbGljayBldmVudCB3aWxsIG5vdCBmaXJlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5pc0RyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB9LCAyMDApO1xyXG5cclxuICAgIHRoaXMubWVyZ2VPdmVybGFwcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG1lcmdlT3ZlcmxhcHMoKSB7XHJcbiAgICBsZXQgc2NoZWR1bGUgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICBsZXQgY3VycmVudFN0YXJ0ID0gc2NoZWR1bGUuc3RhcnQ7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRFbmQgPSB0aGlzLmFkanVzdEVuZEZvclZpZXcoc2NoZWR1bGUuZW5kKTtcclxuXHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnQgPSBlbC5zdGFydDtcclxuICAgICAgICBsZXQgb3RoZXJFbmQgPSB0aGlzLmFkanVzdEVuZEZvclZpZXcoZWwuZW5kKTtcclxuXHJcbiAgICAgICAgLy8gbW9kZWwgaXMgaW5zaWRlIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGlmIChvdGhlckVuZCA+PSBjdXJyZW50RW5kICYmIG90aGVyU3RhcnQgPD0gY3VycmVudFN0YXJ0KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgZWxzZSBpZiAoY3VycmVudEVuZCA+PSBvdGhlckVuZCAmJiBjdXJyZW50U3RhcnQgPD0gb3RoZXJTdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgIGVsc2UgaWYgKG90aGVyRW5kID49IGN1cnJlbnRTdGFydCAmJiBvdGhlckVuZCA8PSBjdXJyZW50RW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChvdGhlclN0YXJ0ID49IGN1cnJlbnRTdGFydCAmJiBvdGhlclN0YXJ0IDw9IGN1cnJlbnRFbmQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBlbC5lbmRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlU2NoZWR1bGUoc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+KSB7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKHNjaGVkdWxlKSwgMSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzaXplKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHRoaXMubXVsdGlzbGlkZXJDdHJsLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5tdWx0aXNsaWRlckN0cmwucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0IDw9IHVpLmVuZCAtIDEgJiYgbmV3U3RhcnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5lbmQgIT09IG5ld0VuZCAmJiBuZXdFbmQgPj0gdWkuc3RhcnQgKyAxICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy4kc2NvcGUuJGFwcGx5KCgpID0+IHtcclxuICAgICAgdGhpcy5zY2hlZHVsZS4kaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm11bHRpc2xpZGVyQ3RybC5jYW5BZGQgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB0aGlzLmdldERyYWdTdGFydFZhbHVlcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICB0aGlzLnNjaGVkdWxlLmVuZCA9IHRoaXMuYWRqdXN0RW5kRm9yTW9kZWwodXBkYXRlLmVuZCk7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHRoaXMuc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25DaGFuZ2UoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2Uoe1xyXG4gICAgICBpdGVtSW5kZXg6IHRoaXMuaXRlbUluZGV4LFxyXG4gICAgICBzY2hlZHVsZUluZGV4OiB0aGlzLnNjaGVkdWxlSW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlVmFsdWU6IHRoaXMuc2NoZWR1bGVcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGl0ZW1JbmRleDogJzwnLFxyXG4gICAgc2NoZWR1bGVJbmRleDogJzwnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBtdWx0aXNsaWRlckN0cmw6ICdebXVsdGlTbGlkZXInLFxyXG4gICAgc2NoZWR1bGVyQ3RybDogJ153ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd6b29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Wm9vbVdpZHRoKGVsZW1lbnQ6IGFueSwgd2lkdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXNldFpvb20oZWxlbWVudDogYW55KSB7XHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgJzEwMCUnKTtcclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gdGhpcy5nZXRDdXJyZW50Wm9vbVdpZHRoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRab29tV2lkdGgoZWxlbWVudCwgKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJScpO1xyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Wm9vbVdpZHRoKGVsZW1lbnQsICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zIHtcclxuICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4gdm9pZDtcclxuICAgIG1vbm9TY2hlZHVsZT86IGJvb2xlYW47XHJcbiAgICBpbnRlcnZhbD86IG51bWJlcjtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgIC8qKiBUaGlzIHdpbGwgaW5kaWNhdGUgd2hldGhlciB0aGUgaXRlbSBpcyBjdXJyZW50bHkgY29uc2lkZXJlZCBhY3RpdmUgdG8gdGhlIFVJICovXHJcbiAgICAkaXNBY3RpdmU/OiBib29sZWFuO1xyXG5cclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxufVxyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><div class="dark"><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html.</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/brian-rowe/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length) && !multiSliderCtrl.isDragging && !multiSliderCtrl.isHoveringSlot">+</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{active: schedule.$isActive, disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()">\u2716</div></div>');}]);