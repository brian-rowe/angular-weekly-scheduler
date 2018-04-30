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
                {
                    label: 'Sun',
                    //editable: false,
                    schedules: [
                        { start: 315, end: 375 }
                    ]
                },
                {
                    label: 'Mon',
                    //editable: false,
                    schedules: [
                        { start: 300, end: 1140 }
                    ]
                },
                {
                    label: 'Tue',
                    schedules: [
                        { start: 0, end: 240 },
                        { start: 300, end: 360 }
                    ]
                },
                {
                    label: 'Wed',
                    schedules: [
                        { start: 120, end: 720 }
                    ]
                },
                {
                    label: 'Thur',
                    editable: false,
                    schedules: [
                        { start: 300, end: 1140 }
                    ]
                },
                {
                    label: 'Fri',
                    schedules: [
                        { start: 720, end: 780 }
                    ]
                },
                {
                    label: 'Sat',
                    schedules: []
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
            schedulerCtrl.$modelChangeListeners.push(function (newConfig) {
                _this.doGrid(scope, element, attrs, newConfig);
            });
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
        var i;
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = this.GRID_TEMPLATE.clone();
        // Clean element
        element.empty();
        for (i = 0; i < tickcount; i++) {
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
        if (!this.$element.attr('no-add')) {
            var elOffX = this.getElementOffsetX(this.$element);
            var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
            var start = this.pixelToVal(hoverElOffX);
            var end = start + this.size;
            this.addSlot(start, end);
        }
    };
    MultiSliderController.prototype.onWeeklySlotMouseOver = function () {
        this.$element.addClass('slot-hover');
    };
    MultiSliderController.prototype.onWeeklySlotMouseLeave = function () {
        this.$element.removeClass('slot-hover');
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
            var meridiem = hours > 11 ? 'P' : 'A';
            if (remainingMinutes.length == 1) {
                remainingMinutes = '0' + remainingMinutes;
            }
            return (hours % 12 || 12) + ":" + remainingMinutes + meridiem;
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
            monoSchedule: false,
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        var _this = this;
        // Will hang our model change listeners
        this.$modelChangeListeners = [];
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
            // Calculate configuration
            this.config = this.configure(this.options);
            // Finally, run the sub directives listeners
            this.$modelChangeListeners.forEach(function (listener) {
                listener(_this.config);
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
            onChange: '&'
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
    function WeeklySlotController($element, $scope) {
        this.$element = $element;
        this.$scope = $scope;
        this.resizeDirectionIsStart = true;
        this.$containerEl = this.$element.parent();
    }
    WeeklySlotController.prototype.$onInit = function () {
        this.valuesOnDragStart = {
            start: this.schedule.start,
            end: this.schedule.end
        };
        this.mergeOverlaps();
    };
    WeeklySlotController.prototype.canRemove = function () {
        return !angular.isDefined(this.item.editable) || this.item.editable;
    };
    WeeklySlotController.prototype.deleteSelf = function () {
        this.$containerEl.removeClass('dragging');
        this.$containerEl.removeClass('slot-hover');
        this.removeSchedule(this.schedule);
    };
    WeeklySlotController.prototype.editSelf = function () {
        if (angular.isFunction(this.schedulerCtrl.config.editSlot)) {
            this.schedulerCtrl.config.editSlot(this.schedule);
        }
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        var ui = this.schedule;
        var delta = this.pixelToVal(pixel);
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
        // this prevents user from accidentally
        // adding new slot after resizing or dragging
        setTimeout(function () {
            _this.$containerEl.removeAttr('no-add');
        }, 500);
        this.$element.removeClass('active');
        this.$containerEl.removeClass('dragging');
        this.mergeOverlaps();
    };
    WeeklySlotController.prototype.mergeOverlaps = function () {
        var _this = this;
        var schedule = this.schedule;
        var schedules = this.item.schedules;
        schedules.forEach(function (el) {
            if (el !== schedule) {
                // model is inside another slot
                if (el.end >= schedule.end && el.start <= schedule.start) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: el.end
                    });
                }
                // model completely covers another slot
                else if (schedule.end >= el.end && schedule.start <= el.start) {
                    _this.removeSchedule(el);
                }
                // another slot's end is inside current model
                else if (el.end >= schedule.start && el.end <= schedule.end) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: el.start,
                        end: schedule.end
                    });
                }
                // another slot's start is inside current model
                else if (el.start >= schedule.start && el.start <= schedule.end) {
                    _this.removeSchedule(el);
                    _this.updateSelf({
                        start: schedule.start,
                        end: el.end
                    });
                }
            }
        });
    };
    WeeklySlotController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.$containerEl[0].clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    WeeklySlotController.prototype.removeSchedule = function (schedule) {
        var schedules = this.item.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
    };
    WeeklySlotController.prototype.resize = function (pixel) {
        var ui = this.schedule;
        var delta = this.pixelToVal(pixel);
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
        this.$element.addClass('active');
        this.$containerEl.addClass('dragging');
        this.$containerEl.attr('no-add', 'true');
        this.valuesOnDragStart = {
            start: this.schedule.start,
            end: this.schedule.end
        };
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
        this.schedule.end = update.end;
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
        '$element',
        '$scope'
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
    ZoomService.prototype.resetZoom = function (element) {
        element.querySelector(this.selector).style.width = '100%';
        this.broadcastZoomedOutEvent();
    };
    ZoomService.prototype.zoomInACell = function (element, event, data) {
        var elementCount = data.nbElements;
        var i = data.idx;
        // percentWidthFromBeginning is used when the first element of the grid is not full
        // For instance, in the example below `feb 17` is not full
        // feb 17          march 17
        //       |    
        var percentWidthFromBeginning = data.percentWidthFromBeginning;
        var containerWidth = element.offsetWidth;
        var boxesToDisplay = 5;
        var boxWidth = containerWidth / boxesToDisplay;
        var boxesToSkip = 2;
        var gutterSize = boxWidth * boxesToSkip;
        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
        element.querySelector(this.selector).style.width = scheduleAreaWidthPercent + '%';
        if (percentWidthFromBeginning === undefined) {
            // All cells of a line have the same size
            element.scrollLeft = i * boxWidth - gutterSize;
        }
        else {
            // Sizes of cells in a line could different (especially the first one)
            element.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
        }
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomByScroll = function (element, event, delta) {
        var style = element.querySelector(this.selector).style;
        var currentWidth = parseInt(style.width, 10);
        if ((event.wheelDelta || event.detail) > 0) {
            style.width = (currentWidth + 2 * delta) + '%';
            this.broadcastZoomedInEvent();
        }
        else {
            var width = currentWidth - 2 * delta;
            style.width = (width > 100 ? width : 100) + '%';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlck9wdGlvbnMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLWNvbmZpZy9JV2Vla2x5U2NoZWR1bGVyUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUs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aUIsRUFBRSxLQUFhO1FBQzlELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN2RCxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUUvQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ0gsSUFBSSxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBRWhELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQXhFTSxpQkFBSyxHQUFHLGFBQWEsQ0FBQztJQUV0QixtQkFBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUF1RXBDLGtCQUFDO0NBMUVELEFBMEVDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnd2Vla2x5U2NoZWR1bGVyJ10pXHJcbiAgLmNvbnRyb2xsZXIoJ0RlbW9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgIGVkaXRTbG90OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ0VkaXRpbmcgc2xvdCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTdW4nLFxyXG4gICAgICAgICAgICAvL2VkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMzE1LCBlbmQ6IDM3NSB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnTW9uJyxcclxuICAgICAgICAgICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdUdWUnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAwLCBlbmQ6IDI0MCB9LFxyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAzNjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1dlZCcsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDEyMCwgZW5kOiA3MjAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1RodXInLFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMwMCwgZW5kOiAxMTQwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdGcmknLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiA3MjAsIGVuZDogNzgwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdTYXQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMuZG9Tb21ldGhpbmcgPSBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJyYnLFxyXG4gICAgb25kcmFnc3RvcDogJyYnLFxyXG4gICAgb25kcmFnc3RhcnQ6ICcmJ1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0YXJ0KSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNlbW92ZShldmVudCkge1xyXG4gICAgICB2YXIgZGVsdGEgPSBldmVudC5wYWdlWCAtIHg7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZykpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWcoeyBkZWx0YTogZGVsdGEgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNjb3BlLm9uZHJhZ3N0b3ApKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBIb3VybHlHcmlkRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdob3VybHlHcmlkJztcclxuXHJcbiAgICByZXN0cmljdCA9ICdFJztcclxuICAgIHJlcXVpcmUgPSAnXndlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gICAgcHJpdmF0ZSBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBob3VyQ291bnQsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHNjb3BlLiRlbWl0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5DTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgICAgbmJFbGVtZW50czogaG91ckNvdW50LFxyXG4gICAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWcpIHtcclxuICAgICAgICB2YXIgaTtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gY29uZmlnLmhvdXJDb3VudDtcclxuICAgICAgICB2YXIgZ3JpZEl0ZW1FbCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG5cclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SG91ciA9IGkgJSAxMjtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaSA+PSAxMiA/ICdwJyA6ICdhJztcclxuXHJcbiAgICAgICAgICAgIGNoaWxkLnRleHQoYCR7Y3VycmVudEhvdXIgfHwgJzEyJ30ke21lcmlkaWVtfWApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbm8tdGV4dCBvbmVzIHdpbGwgZ2V0IHN0cmlwZWQgaW50ZXJ2YWxzXHJcbiAgICAgICAgICAgIGNoaWxkLmFkZENsYXNzKCdzdHJpcGVkJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbnVtSW50ZXJ2YWxzSW5UaWNrID0gNjAgLyBjb25maWcuaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbFBlcmNlbnRhZ2UgPSAxMDAgLyBudW1JbnRlcnZhbHNJblRpY2s7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bUludGVydmFsc0luVGljazsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JhbmRDaGlsZCA9IHRoaXMuR1JJRF9URU1QTEFURS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hdHRyKCdyZWwnLCAoKGkgKiBudW1JbnRlcnZhbHNJblRpY2spICsgaikgKiBjb25maWcuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgZ3JhbmRDaGlsZC5hZGRDbGFzcygnaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuY3NzKCd3aWR0aCcsIGludGVydmFsUGVyY2VudGFnZSArICclJyk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcHBlbmQoZ3JhbmRDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMucHVzaCgobmV3Q29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmV3Q29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdtdWx0aVNsaWRlckNvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ211bHRpU2xpZGVyQ3RybCc7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRlbGVtZW50JyxcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyR3aW5kb3cnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlICRob3ZlckVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuXHJcbiAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPjtcclxuICBwdWJsaWMgc2l6ZTogbnVtYmVyID0gNjA7IC8vIG1pbnV0ZXNcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy4kc2NvcGUuJG9uKFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfSU4sICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICRwb3N0TGluaygpIHtcclxuICAgIHRoaXMuJGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLiRlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGxlZnQgPSBlLnBhZ2VYIC0gZWxPZmZYIC0gdGhpcy4kaG92ZXJFbGVtZW50WzBdLmNsaWVudFdpZHRoIC8gMjtcclxuXHJcbiAgICAgIHZhciB2YWwgPSB0aGlzLnBpeGVsVG9WYWwobGVmdCk7XHJcblxyXG4gICAgICB0aGlzLiRob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiB0aGlzLmdldFNsb3RMZWZ0KHZhbCksXHJcbiAgICAgICAgcmlnaHQ6IHRoaXMuZ2V0U2xvdFJpZ2h0KHZhbCArIHRoaXMuc2l6ZSlcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRTbG90KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XHJcbiAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgIHN0YXJ0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZW5kID4gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgZW5kID0gdGhpcy5jb25maWcubWF4VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW07XHJcblxyXG4gICAgaWYgKCFpdGVtLnNjaGVkdWxlcykge1xyXG4gICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe1xyXG4gICAgICBzdGFydDogc3RhcnQsXHJcbiAgICAgIGVuZDogZW5kXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRFbGVtZW50T2Zmc2V0WChlbGVtOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcclxuICAgIHJldHVybiBlbGVtWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbXBlbnNhdGVGb3JCb3JkZXIoZWxlbTogSFRNTEVsZW1lbnQsIHZhbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgYm9yZGVyV2lkdGggPSB0aGlzLiR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKS5nZXRQcm9wZXJ0eVZhbHVlKCdib3JkZXItcmlnaHQnKTtcclxuXHJcbiAgICAvLyBUaGVyZSBhcmUgZG91YmxlIGJvcmRlcnMgYXQgdGhlIGJlZ2lubmluZ3MgYW5kIGVuZHMgb2YgaG91cnMsIHNvIHdlIGRvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgaXRcclxuICAgIGxldCBvbkhvdXIgPSB2YWwgJSA2MCA9PT0gMDtcclxuXHJcbiAgICByZXR1cm4gb25Ib3VyID8gZWxlbS5vZmZzZXRMZWZ0IDogZWxlbS5vZmZzZXRMZWZ0IC0gcGFyc2VJbnQoYm9yZGVyV2lkdGgsIDEwKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2xvdExlZnQoc3RhcnQ6IG51bWJlcikge1xyXG4gICAgbGV0IHVuZGVybHlpbmdJbnRlcnZhbDogSFRNTEVsZW1lbnQgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChzdGFydCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIHN0YXJ0KSArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RSaWdodChlbmQ6IG51bWJlcikge1xyXG4gICAgLy8gV2Ugd2FudCB0aGUgcmlnaHQgc2lkZSB0byBnbyAvdXAgdG8vIHRoZSBpbnRlcnZhbCBpdCByZXByZXNlbnRzLCBub3QgY292ZXIgaXQsIHNvIHdlIG11c3Qgc3Vic3RyYWN0IDEgaW50ZXJ2YWxcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWwgPSB0aGlzLmdldFVuZGVybHlpbmdJbnRlcnZhbChlbmQgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbCk7XHJcblxyXG4gICAgbGV0IG9mZnNldFJpZ2h0ID0gdGhpcy5jb21wZW5zYXRlRm9yQm9yZGVyKHVuZGVybHlpbmdJbnRlcnZhbCwgZW5kKSArIHVuZGVybHlpbmdJbnRlcnZhbC5vZmZzZXRXaWR0aDtcclxuICAgIGxldCBjb250YWluZXJMZWZ0ID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KVxyXG4gICAgbGV0IGNvbnRhaW5lclJpZ2h0ID0gdGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodDtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmVyUmlnaHQgLSBjb250YWluZXJMZWZ0IC0gb2Zmc2V0UmlnaHQgKyAncHgnO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGdldFVuZGVybHlpbmdJbnRlcnZhbCh2YWw6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcclxuICAgIC8vIFNsaWdodGx5IGhhY2t5IGJ1dCBkb2VzIHRoZSBqb2IuIFRPRE8gP1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIG5vIGludGVydmFsIHRvIHRoZSBsZWZ0IG9mIHRoZSBsZWZ0bW9zdCBpbnRlcnZhbCwgc28gcmV0dXJuIHRoYXQgaW5zdGVhZFxyXG4gICAgaWYgKHZhbCA8IDApIHtcclxuICAgICAgdmFsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgcmlnaHQgb2YgdGhlIHJpZ2h0bW9zdCBpbnRlcnZhbCAtLSB0aGUgbGFzdCBpbnRlcnZhbCB3aWxsIG5vdCBhY3R1YWxseSByZW5kZXIgd2l0aCBhIFwicmVsXCIgdmFsdWVcclxuICAgIGxldCByaWdodG1vc3QgPSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSAtIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG5cclxuICAgIGlmICh2YWwgPiByaWdodG1vc3QpIHtcclxuICAgICAgdmFsID0gcmlnaHRtb3N0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnBhcmVudCgpWzBdLnF1ZXJ5U2VsZWN0b3IoYFtyZWw9JyR7dmFsfSddYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uSG92ZXJFbGVtZW50Q2xpY2soZXZlbnQpIHtcclxuICAgIGlmICghdGhpcy4kZWxlbWVudC5hdHRyKCduby1hZGQnKSkge1xyXG4gICAgICB2YXIgZWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRlbGVtZW50KTtcclxuICAgICAgdmFyIGhvdmVyRWxPZmZYID0gdGhpcy5nZXRFbGVtZW50T2Zmc2V0WCh0aGlzLiRob3ZlckVsZW1lbnQpIC0gZWxPZmZYO1xyXG4gICAgICBcclxuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5waXhlbFRvVmFsKGhvdmVyRWxPZmZYKTtcclxuICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgdGhpcy5zaXplO1xyXG5cclxuICAgICAgdGhpcy5hZGRTbG90KHN0YXJ0LCBlbmQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZU92ZXIoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uV2Vla2x5U2xvdE1vdXNlTGVhdmUoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2l6ZSgpIHtcclxuICAgIC8qIFNpbmNlIHdlIGhhdmUgY2hhbmdlZCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgdmlhIHBsYWluIGpzICtcclxuICAgICAqIHRoZSBuZy1zdHlsZXMgZm9yIHRoZSBpbmRpdmlkdWFsIHNsb3RzIGFyZSBjb21wdXRlZCBpbiB0aGlzIGNvbnRyb2xsZXIsXHJcbiAgICAgKiB3ZSBtdXN0IGNhbGwgJGFwcGx5KCkgbWFudWFsbHkgc28gdGhleSB3aWxsIGFsbCB1cGRhdGUgdGhlaXIgcG9zaXRpb25zIHRvIG1hdGNoIHRoZSB6b29tIGxldmVsXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiRhcHBseSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAodGhpcy5jb25maWcuaW50ZXJ2YWxDb3VudCkgKyAwLjUpICogdGhpcy5jb25maWcuaW50ZXJ2YWw7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIE11bHRpU2xpZGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgaXRlbTogJz0nLFxyXG4gICAgaW5kZXg6ICc8JyxcclxuICAgIHNpemU6ICc8PydcclxuICB9XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKE11bHRpU2xpZGVyQ29udHJvbGxlci4kbmFtZSwgTXVsdGlTbGlkZXJDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoTXVsdGlTbGlkZXJDb21wb25lbnQuJG5hbWUsIG5ldyBNdWx0aVNsaWRlckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBSZXNpemVTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdyZXNpemVTZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJHJvb3RTY29wZScsXHJcbiAgICAgICAgJyR3aW5kb3cnXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSxcclxuICAgICAgICBwcml2YXRlICR3aW5kb3c6IGFuZ3VsYXIuSVdpbmRvd1NlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5SRVNJWkVEKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShSZXNpemVTZXJ2aWNlLiRuYW1lLCBSZXNpemVTZXJ2aWNlKVxyXG4gICAgLnJ1bihbUmVzaXplU2VydmljZS4kbmFtZSwgKHJlc2l6ZVNlcnZpY2U6IFJlc2l6ZVNlcnZpY2UpID0+IHJlc2l6ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXInO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICckZWxlbWVudCcsXHJcbiAgICAgICAgJyRzY29wZScsXHJcbiAgICAgICAgJ3Njcm9sbFNlcnZpY2UnLFxyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZSxcclxuICAgICAgICBwcml2YXRlIHNjcm9sbFNlcnZpY2U6IFNjcm9sbFNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tU2VydmljZTogWm9vbVNlcnZpY2VcclxuICAgICkge1xyXG4gICAgfVxyXG5cclxuICAgICRwb3N0TGluaygpIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRbMF07IC8vIGdyYWIgcGxhaW4ganMsIG5vdCBqcWxpdGVcclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxTZXJ2aWNlLmhpamFja1Njcm9sbChlbGVtZW50LCAyMCk7XHJcblxyXG4gICAgICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21JbkFDZWxsKGVsZW1lbnQsIGUsIGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3NjaGVkdWxlQXJlYUNvbnRhaW5lcic7XHJcblxyXG4gICAgY29udHJvbGxlciA9IFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuXHJcbiAgICB0ZW1wbGF0ZSA9IGA8bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+YDtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuY29udHJvbGxlcihTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lLCBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyKVxyXG4gICAgLmNvbXBvbmVudChTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQuJG5hbWUsIG5ldyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgU2Nyb2xsU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnc2Nyb2xsU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJ3pvb21TZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlqYWNrU2Nyb2xsKGVsZW1lbnQsIGRlbHRhKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbVNlcnZpY2Uuem9vbUJ5U2Nyb2xsKGVsZW1lbnQsIGV2ZW50LCBkZWx0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoU2Nyb2xsU2VydmljZS4kbmFtZSwgU2Nyb2xsU2VydmljZSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgVGltZU9mRGF5RmlsdGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd0aW1lT2ZEYXknO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWludXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nTWludXRlcyA9IChtaW51dGVzIC0gKGhvdXJzICogNjApKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBsZXQgbWVyaWRpZW0gPSBob3VycyA+IDExID8gJ1AnIDogJ0EnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ01pbnV0ZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ01pbnV0ZXMgPSAnMCcgKyByZW1haW5pbmdNaW51dGVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7aG91cnMgJSAxMiB8fCAxMn06JHtyZW1haW5pbmdNaW51dGVzfSR7bWVyaWRpZW19YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZmlsdGVyKFRpbWVPZkRheUZpbHRlci4kbmFtZSwgW1RpbWVPZkRheUZpbHRlci5GYWN0b3J5XSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnO1xyXG4gIHB1YmxpYyBpdGVtczogSVdlZWtseVNjaGVkdWxlckl0ZW08bnVtYmVyPltdO1xyXG4gIHB1YmxpYyBvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucztcclxuICBwdWJsaWMgb25DaGFuZ2U6IChvcHRpb25zOiB7IGl0ZW1JbmRleDogbnVtYmVyLCBzY2hlZHVsZUluZGV4OiBudW1iZXIsIHNjaGVkdWxlVmFsdWU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+IH0pID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBkZWZhdWx0T3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnMgPSB7XHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyAkbW9kZWxDaGFuZ2VMaXN0ZW5lcnM6ICgoY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKSA9PiB2b2lkKVtdO1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgLy8gV2lsbCBoYW5nIG91ciBtb2RlbCBjaGFuZ2UgbGlzdGVuZXJzXHJcbiAgICB0aGlzLiRtb2RlbENoYW5nZUxpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIG1vZGVsIGl0ZW1zXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oKCkgPT4gdGhpcy5pdGVtcywgKG5ld0l0ZW1zKSA9PiB0aGlzLm9uTW9kZWxDaGFuZ2UobmV3SXRlbXMpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uZmlndXJlKG9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zKTogSVdlZWtseVNjaGVkdWxlckNvbmZpZyB7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDE1OyAvLyBtaW51dGVzXHJcbiAgICB2YXIgaG91cnNJbkRheSA9IDI0O1xyXG4gICAgdmFyIG1pbnV0ZXNJbkRheSA9IGhvdXJzSW5EYXkgKiA2MDtcclxuICAgIHZhciBpbnRlcnZhbENvdW50ID0gbWludXRlc0luRGF5IC8gaW50ZXJ2YWw7XHJcblxyXG4gICAgdmFyIHJlc3VsdDogSVdlZWtseVNjaGVkdWxlckNvbmZpZyA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHtcclxuICAgICAgZWRpdFNsb3Q6IG9wdGlvbnMuZWRpdFNsb3QsXHJcbiAgICAgIGludGVydmFsOiBpbnRlcnZhbCxcclxuICAgICAgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSxcclxuICAgICAgaG91ckNvdW50OiBob3Vyc0luRGF5LFxyXG4gICAgICBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vZGVsQ2hhbmdlKGl0ZW1zOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxudW1iZXI+W10pIHtcclxuICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBwcmVzZW50XHJcbiAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgIC8vIENoZWNrIGl0ZW1zIGFyZSBpbiBhbiBBcnJheVxyXG4gICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShpdGVtcykpIHtcclxuICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEtlZXAgdHJhY2sgb2Ygb3VyIG1vZGVsICh1c2UgaXQgaW4gdGVtcGxhdGUpXHJcbiAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAgIC8vIElmIGluIG11bHRpU2xpZGVyIG1vZGUsIGVuc3VyZSBhIHNjaGVkdWxlIGFycmF5IGlzIHByZXNlbnQgb24gZWFjaCBpdGVtXHJcbiAgICAgIC8vIEVsc2Ugb25seSB1c2UgZmlyc3QgZWxlbWVudCBvZiBzY2hlZHVsZSBhcnJheVxyXG4gICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlcyA9IGl0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgICAgICBpZiAoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9ub1NjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW3NjaGVkdWxlc1swXV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBjb25maWd1cmF0aW9uXHJcbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5jb25maWd1cmUodGhpcy5vcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgIHRoaXMuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XHJcbiAgICAgICAgbGlzdGVuZXIodGhpcy5jb25maWcpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgaXRlbXM6ICc9JyxcclxuICAgIG9wdGlvbnM6ICc9JyxcclxuICAgIG9uQ2hhbmdlOiAnJidcclxuICB9O1xyXG4gIFxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJGNvbnRyb2xsZXJBcztcclxuXHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmNvbXBvbmVudChXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdENvbnRyb2xsZXInO1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3dlZWtseVNsb3RDdHJsJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGVsZW1lbnQnLFxyXG4gICAgJyRzY29wZSdcclxuICBdO1xyXG5cclxuICBwcml2YXRlIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcjtcclxuICBwcml2YXRlIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXI7XHJcblxyXG4gIHByaXZhdGUgJGNvbnRhaW5lckVsOiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcblxyXG4gIHByaXZhdGUgaXRlbTogSVdlZWtseVNjaGVkdWxlckl0ZW08YW55PjtcclxuICBwcml2YXRlIGl0ZW1JbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICBwcml2YXRlIHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuICBwcml2YXRlIHNjaGVkdWxlSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSB2YWx1ZXNPbkRyYWdTdGFydDogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlXHJcbiAgKSB7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XHJcbiAgfVxyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5zY2hlZHVsZS5lbmRcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2FuUmVtb3ZlKCkge1xyXG4gICAgcmV0dXJuICFhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLml0ZW0uZWRpdGFibGUpIHx8IHRoaXMuaXRlbS5lZGl0YWJsZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWxmKCkge1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgdGhpcy5yZW1vdmVTY2hlZHVsZSh0aGlzLnNjaGVkdWxlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlZGl0U2VsZigpIHtcclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24odGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCkpIHtcclxuICAgICAgdGhpcy5zY2hlZHVsZXJDdHJsLmNvbmZpZy5lZGl0U2xvdCh0aGlzLnNjaGVkdWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkcmFnKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIGxldCB1aSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnBpeGVsVG9WYWwocGl4ZWwpO1xyXG4gICAgbGV0IGR1cmF0aW9uID0gdGhpcy52YWx1ZXNPbkRyYWdTdGFydC5lbmQgLSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gdGhpcy5jb25maWcubWF4VmFsdWUpIHtcclxuICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kRHJhZygpIHtcclxuICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQXR0cignbm8tYWRkJyk7XHJcbiAgICB9LCA1MDApO1xyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgdGhpcy4kY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcblxyXG4gICAgdGhpcy5tZXJnZU92ZXJsYXBzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWVyZ2VPdmVybGFwcygpIHtcclxuICAgIGxldCBzY2hlZHVsZSA9IHRoaXMuc2NoZWR1bGU7XHJcbiAgICBsZXQgc2NoZWR1bGVzID0gdGhpcy5pdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICBzY2hlZHVsZXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICBpZiAoZWwuZW5kID49IHNjaGVkdWxlLmVuZCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5zdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IGVsLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG1vZGVsIGNvbXBsZXRlbHkgY292ZXJzIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGVsc2UgaWYgKHNjaGVkdWxlLmVuZCA+PSBlbC5lbmQgJiYgc2NoZWR1bGUuc3RhcnQgPD0gZWwuc3RhcnQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBlbmQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuZW5kIDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcblxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgICAgc3RhcnQ6IGVsLnN0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IHNjaGVkdWxlLmVuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIHN0YXJ0IGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgZWxzZSBpZiAoZWwuc3RhcnQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBpeGVsVG9WYWwocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHBlcmNlbnQgPSBwaXhlbCAvIHRoaXMuJGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqICh0aGlzLmNvbmZpZy5pbnRlcnZhbENvdW50KSArIDAuNSkgKiB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVTY2hlZHVsZShzY2hlZHVsZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2Yoc2NoZWR1bGUpLCAxKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMucGl4ZWxUb1ZhbChwaXhlbCk7XHJcblxyXG4gICAgaWYgKHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICBsZXQgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0IDw9IHVpLmVuZCAtIDEgJiYgbmV3U3RhcnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgbmV3RW5kID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5lbmQgIT09IG5ld0VuZCAmJiBuZXdFbmQgPj0gdWkuc3RhcnQgKyAxICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnREcmFnKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgdGhpcy4kY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5hdHRyKCduby1hZGQnLCAndHJ1ZScpO1xyXG5cclxuICAgIHRoaXMudmFsdWVzT25EcmFnU3RhcnQgPSB7XHJcbiAgICAgIHN0YXJ0OiB0aGlzLnNjaGVkdWxlLnN0YXJ0LFxyXG4gICAgICBlbmQ6IHRoaXMuc2NoZWR1bGUuZW5kXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplU3RhcnQoKSB7XHJcbiAgICB0aGlzLnJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydFJlc2l6ZUVuZCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdGFydERyYWcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTZWxmKHVwZGF0ZTogSVdlZWtseVNjaGVkdWxlclJhbmdlPGFueT4pIHtcclxuICAgIHRoaXMuc2NoZWR1bGUuc3RhcnQgPSB1cGRhdGUuc3RhcnQ7XHJcbiAgICB0aGlzLnNjaGVkdWxlLmVuZCA9IHVwZGF0ZS5lbmQ7XHJcblxyXG4gICAgdGhpcy5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHRoaXMuc2NoZWR1bGUpO1xyXG5cclxuICAgIHRoaXMub25DaGFuZ2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25DaGFuZ2UoKSB7XHJcbiAgICB0aGlzLnNjaGVkdWxlckN0cmwub25DaGFuZ2Uoe1xyXG4gICAgICBpdGVtSW5kZXg6IHRoaXMuaXRlbUluZGV4LFxyXG4gICAgICBzY2hlZHVsZUluZGV4OiB0aGlzLnNjaGVkdWxlSW5kZXgsXHJcbiAgICAgIHNjaGVkdWxlVmFsdWU6IHRoaXMuc2NoZWR1bGVcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29tcG9uZW50IGltcGxlbWVudHMgYW5ndWxhci5JQ29tcG9uZW50T3B0aW9ucyB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNsb3QnO1xyXG4gIFxyXG4gIGJpbmRpbmdzID0ge1xyXG4gICAgY29uZmlnOiAnPCcsXHJcbiAgICBzY2hlZHVsZTogJz1uZ01vZGVsJyxcclxuICAgIGl0ZW1JbmRleDogJzwnLFxyXG4gICAgc2NoZWR1bGVJbmRleDogJzwnLFxyXG4gICAgaXRlbTogJz0nXHJcbiAgfTtcclxuXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IFdlZWtseVNsb3RDb250cm9sbGVyLiRjb250cm9sbGVyQXM7XHJcblxyXG4gIHJlcXVpcmUgPSB7XHJcbiAgICBzY2hlZHVsZXJDdHJsOiAnXndlZWtseVNjaGVkdWxlcicsXHJcbiAgICBuZ01vZGVsQ3RybDogJ25nTW9kZWwnXHJcbiAgfTtcclxuXHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC5odG1sJztcclxufVxyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2xvdENvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNsb3RDb250cm9sbGVyKVxyXG4gIC5jb21wb25lbnQoV2Vla2x5U2xvdENvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNsb3RDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgWm9vbVNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3pvb21TZXJ2aWNlJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZSddO1xyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSAkcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdG9yOiBzdHJpbmcgPSAnLnNjaGVkdWxlLWFyZWEnO1xyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuJHJvb3RTY29wZS4kYnJvYWRjYXN0KFdlZWtseVNjaGVkdWxlckV2ZW50cy5aT09NRURfT1VUKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVzZXRab29tKGVsZW1lbnQ6IGFueSkge1xyXG4gICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZS53aWR0aCA9ICcxMDAlJztcclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZE91dEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHpvb21JbkFDZWxsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IGFuZ3VsYXIuSUFuZ3VsYXJFdmVudCwgZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRDb3VudCA9IGRhdGEubmJFbGVtZW50cztcclxuICAgICAgICBsZXQgaSA9IGRhdGEuaWR4O1xyXG5cclxuICAgICAgICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gICAgICAgIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAgICAgICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAgICAgICAvLyAgICAgICB8ICAgIFxyXG4gICAgICAgIGxldCBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID0gZGF0YS5wZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nO1xyXG5cclxuICAgICAgICBsZXQgY29udGFpbmVyV2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYm94ZXNUb0Rpc3BsYXkgPSA1O1xyXG4gICAgICAgIGxldCBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYm94ZXNUb0Rpc3BsYXk7XHJcblxyXG4gICAgICAgIGxldCBib3hlc1RvU2tpcCA9IDI7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAqIGJveGVzVG9Ta2lwO1xyXG5cclxuICAgICAgICB2YXIgc2NoZWR1bGVBcmVhV2lkdGhQeCA9IGVsZW1lbnRDb3VudCAqIGJveFdpZHRoO1xyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpLnN0eWxlLndpZHRoID0gc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnO1xyXG5cclxuICAgICAgICBpZiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gaSAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gU2l6ZXMgb2YgY2VsbHMgaW4gYSBsaW5lIGNvdWxkIGRpZmZlcmVudCAoZXNwZWNpYWxseSB0aGUgZmlyc3Qgb25lKVxyXG4gICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gc2NoZWR1bGVBcmVhV2lkdGhQeCAqIChwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIC8gMTAwKSAtIGd1dHRlclNpemU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgem9vbUJ5U2Nyb2xsKGVsZW1lbnQ6IGFueSwgZXZlbnQ6IFdoZWVsRXZlbnQsIGRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc3R5bGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGU7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRXaWR0aCA9IHBhcnNlSW50KHN0eWxlLndpZHRoLCAxMCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgICAgICBzdHlsZS53aWR0aCA9IChjdXJyZW50V2lkdGggKyAyICogZGVsdGEpICsgJyUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRJbkV2ZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgICAgICBzdHlsZS53aWR0aCA9ICh3aWR0aCA+IDEwMCA/IHdpZHRoIDogMTAwKSArICclJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkT3V0RXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuc2VydmljZShab29tU2VydmljZS4kbmFtZSwgWm9vbVNlcnZpY2UpO1xyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlckl0ZW08VD4ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGVkaXRhYmxlPzogYm9vbGVhbjtcclxuICAgIHNjaGVkdWxlczogSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+W107XHJcbn1cclxuIiwiaW50ZXJmYWNlIElXZWVrbHlTY2hlZHVsZXJPcHRpb25zIHtcclxuICAgIGVkaXRTbG90PzogKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PikgPT4gdm9pZDtcclxuICAgIG1vbm9TY2hlZHVsZT86IGJvb2xlYW47XHJcbiAgICBpbnRlcnZhbD86IG51bWJlcjtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxufVxyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><div class="dark"><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html.</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/brian-rowe/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">+</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ng-click="weeklySlotCtrl.editSelf()" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()">\u2716</div></div>');}]);