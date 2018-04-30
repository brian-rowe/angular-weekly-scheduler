angular.module('demoApp', ['weeklyScheduler'])
    .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {
        $scope.model = {
            options: { /*monoSchedule: true*/},
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
        var result = angular.extend(this.defaultOptions, { interval: interval, maxValue: minutesInDay, hourCount: hoursInDay, intervalCount: intervalCount });
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
        // leave (1/3) each side
        // 1/3 |    3/3   | 1/3
        var boxWidth = containerWidth / (5 / 3);
        var gutterSize = boxWidth / 3;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvcmVzaXplL3Jlc2l6ZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIvc2NoZWR1bGUtYXJlYS1jb250YWluZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9zY3JvbGwvc2Nyb2xsLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtb2YtZGF5LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci96b29tL3pvb20tc2VydmljZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXItY29uZmlnL0lXZWVrbHlTY2hlZHVsZXJJdGVtLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci1jb25maWcvSVdlZWtseVNjaGVkdWxlclJhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMzQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE1B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QyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUVoRCxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztTQUNsQztJQUNMLENBQUM7SUF2RU0saUJBQUssR0FBRyxhQUFhLENBQUM7SUFFdEIsbUJBQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBc0VwQyxrQkFBQztDQXpFRCxBQXlFQyxJQUFBO0FBRUQsT0FBTztLQUNGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUN6QixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ3dlZWtseVNjaGVkdWxlciddKVxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBvcHRpb25zOiB7Lyptb25vU2NoZWR1bGU6IHRydWUqLyB9LFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnU3VuJyxcclxuICAgICAgICAgICAgLy9lZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICAgIHsgc3RhcnQ6IDMxNSwgZW5kOiAzNzUgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ01vbicsXHJcbiAgICAgICAgICAgIC8vZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnVHVlJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogMCwgZW5kOiAyNDAgfSxcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMzYwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdXZWQnLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAxMjAsIGVuZDogNzIwIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdUaHVyJyxcclxuICAgICAgICAgICAgZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgICB7IHN0YXJ0OiAzMDAsIGVuZDogMTE0MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnRnJpJyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgICAgeyBzdGFydDogNzIwLCBlbmQ6IDc4MCB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnU2F0JyxcclxuICAgICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmRvU29tZXRoaW5nID0gZnVuY3Rpb24gKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicsIFsnbmdXZWVrbHlTY2hlZHVsZXJUZW1wbGF0ZXMnXSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICcmJyxcclxuICAgIG9uZHJhZ3N0b3A6ICcmJyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnJidcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdGFydCkpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgdmFyIGRlbHRhID0gZXZlbnQucGFnZVggLSB4O1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWcpKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnKHsgZGVsdGE6IGRlbHRhIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2V1cCgpIHtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50LnVuYmluZCgnbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzY29wZS5vbmRyYWdzdG9wKSkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgR1JJRF9URU1QTEFURSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cImdyaWQtaXRlbVwiPjwvZGl2PicpO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgaG91ckNvdW50LCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBzY29wZS4kZW1pdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgIG5iRWxlbWVudHM6IGhvdXJDb3VudCxcclxuICAgICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29uZmlnOiBJV2Vla2x5U2NoZWR1bGVyQ29uZmlnKSB7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IGNvbmZpZy5ob3VyQ291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICBcclxuICAgICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudEhvdXIgPSBpICUgMTI7XHJcbiAgICAgICAgICAgIGxldCBtZXJpZGllbSA9IGkgPj0gMTIgPyAncCcgOiAnYSc7XHJcblxyXG4gICAgICAgICAgICBjaGlsZC50ZXh0KGAke2N1cnJlbnRIb3VyIHx8ICcxMid9JHttZXJpZGllbX1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG5vLXRleHQgb25lcyB3aWxsIGdldCBzdHJpcGVkIGludGVydmFsc1xyXG4gICAgICAgICAgICBjaGlsZC5hZGRDbGFzcygnc3RyaXBlZCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG51bUludGVydmFsc0luVGljayA9IDYwIC8gY29uZmlnLmludGVydmFsO1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWxQZXJjZW50YWdlID0gMTAwIC8gbnVtSW50ZXJ2YWxzSW5UaWNrO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1JbnRlcnZhbHNJblRpY2s7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyYW5kQ2hpbGQgPSB0aGlzLkdSSURfVEVNUExBVEUuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYXR0cigncmVsJywgKChpICogbnVtSW50ZXJ2YWxzSW5UaWNrKSArIGopICogY29uZmlnLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGdyYW5kQ2hpbGQuYWRkQ2xhc3MoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgICAgICAgICBncmFuZENoaWxkLmNzcygnd2lkdGgnLCBpbnRlcnZhbFBlcmNlbnRhZ2UgKyAnJScpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwZW5kKGdyYW5kQ2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goKG5ld0NvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld0NvbmZpZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXJDb250cm9sbGVyJztcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdtdWx0aVNsaWRlckN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckd2luZG93J1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LFxyXG4gICAgcHJpdmF0ZSAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLFxyXG4gICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSAkaG92ZXJFbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XHJcblxyXG4gIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50O1xyXG4gIHB1YmxpYyBjb25maWc6IElXZWVrbHlTY2hlZHVsZXJDb25maWc7XHJcbiAgcHVibGljIGl0ZW06IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj47XHJcbiAgcHVibGljIHNpemU6IG51bWJlciA9IDYwOyAvLyBtaW51dGVzXHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlJFU0laRUQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuJHNjb3BlLiRvbihXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX0lOLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9PVVQsICgpID0+IHtcclxuICAgICAgdGhpcy5yZXNpemUoKTtcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkcG9zdExpbmsoKSB7XHJcbiAgICB0aGlzLiRob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy4kZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBsZWZ0ID0gZS5wYWdlWCAtIGVsT2ZmWCAtIHRoaXMuJGhvdmVyRWxlbWVudFswXS5jbGllbnRXaWR0aCAvIDI7XHJcblxyXG4gICAgICB2YXIgdmFsID0gdGhpcy5waXhlbFRvVmFsKGxlZnQpO1xyXG5cclxuICAgICAgdGhpcy4kaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgbGVmdDogdGhpcy5nZXRTbG90TGVmdCh2YWwpLFxyXG4gICAgICAgIHJpZ2h0OiB0aGlzLmdldFNsb3RSaWdodCh2YWwgKyB0aGlzLnNpemUpXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkU2xvdChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xyXG4gICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICBzdGFydCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuZCA+IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgIGVuZCA9IHRoaXMuY29uZmlnLm1heFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpdGVtID0gdGhpcy5pdGVtO1xyXG5cclxuICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpdGVtLnNjaGVkdWxlcy5wdXNoKHtcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0RWxlbWVudE9mZnNldFgoZWxlbTogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XHJcbiAgICByZXR1cm4gZWxlbVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb21wZW5zYXRlRm9yQm9yZGVyKGVsZW06IEhUTUxFbGVtZW50LCB2YWw6IG51bWJlcikge1xyXG4gICAgbGV0IGJvcmRlcldpZHRoID0gdGhpcy4kd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXJpZ2h0Jyk7XHJcblxyXG4gICAgLy8gVGhlcmUgYXJlIGRvdWJsZSBib3JkZXJzIGF0IHRoZSBiZWdpbm5pbmdzIGFuZCBlbmRzIG9mIGhvdXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGl0XHJcbiAgICBsZXQgb25Ib3VyID0gdmFsICUgNjAgPT09IDA7XHJcblxyXG4gICAgcmV0dXJuIG9uSG91ciA/IGVsZW0ub2Zmc2V0TGVmdCA6IGVsZW0ub2Zmc2V0TGVmdCAtIHBhcnNlSW50KGJvcmRlcldpZHRoLCAxMCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNsb3RMZWZ0KHN0YXJ0OiBudW1iZXIpIHtcclxuICAgIGxldCB1bmRlcmx5aW5nSW50ZXJ2YWw6IEhUTUxFbGVtZW50ID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoc3RhcnQpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvbXBlbnNhdGVGb3JCb3JkZXIodW5kZXJseWluZ0ludGVydmFsLCBzdGFydCkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTbG90UmlnaHQoZW5kOiBudW1iZXIpIHtcclxuICAgIC8vIFdlIHdhbnQgdGhlIHJpZ2h0IHNpZGUgdG8gZ28gL3VwIHRvLyB0aGUgaW50ZXJ2YWwgaXQgcmVwcmVzZW50cywgbm90IGNvdmVyIGl0LCBzbyB3ZSBtdXN0IHN1YnN0cmFjdCAxIGludGVydmFsXHJcbiAgICBsZXQgdW5kZXJseWluZ0ludGVydmFsID0gdGhpcy5nZXRVbmRlcmx5aW5nSW50ZXJ2YWwoZW5kIC0gdGhpcy5jb25maWcuaW50ZXJ2YWwpO1xyXG5cclxuICAgIGxldCBvZmZzZXRSaWdodCA9IHRoaXMuY29tcGVuc2F0ZUZvckJvcmRlcih1bmRlcmx5aW5nSW50ZXJ2YWwsIGVuZCkgKyB1bmRlcmx5aW5nSW50ZXJ2YWwub2Zmc2V0V2lkdGg7XHJcbiAgICBsZXQgY29udGFpbmVyTGVmdCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudClcclxuICAgIGxldCBjb250YWluZXJSaWdodCA9IHRoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQ7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lclJpZ2h0IC0gY29udGFpbmVyTGVmdCAtIG9mZnNldFJpZ2h0ICsgJ3B4JztcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBnZXRVbmRlcmx5aW5nSW50ZXJ2YWwodmFsOiBudW1iZXIpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAvLyBTbGlnaHRseSBoYWNreSBidXQgZG9lcyB0aGUgam9iLiBUT0RPID9cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBubyBpbnRlcnZhbCB0byB0aGUgbGVmdCBvZiB0aGUgbGVmdG1vc3QgaW50ZXJ2YWwsIHNvIHJldHVybiB0aGF0IGluc3RlYWRcclxuICAgIGlmICh2YWwgPCAwKSB7XHJcbiAgICAgIHZhbCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgbm8gaW50ZXJ2YWwgdG8gdGhlIHJpZ2h0IG9mIHRoZSByaWdodG1vc3QgaW50ZXJ2YWwgLS0gdGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBub3QgYWN0dWFsbHkgcmVuZGVyIHdpdGggYSBcInJlbFwiIHZhbHVlXHJcbiAgICBsZXQgcmlnaHRtb3N0ID0gdGhpcy5jb25maWcubWF4VmFsdWUgLSB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcclxuXHJcbiAgICBpZiAodmFsID4gcmlnaHRtb3N0KSB7XHJcbiAgICAgIHZhbCA9IHJpZ2h0bW9zdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5wYXJlbnQoKVswXS5xdWVyeVNlbGVjdG9yKGBbcmVsPScke3ZhbH0nXWApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkhvdmVyRWxlbWVudENsaWNrKGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuYXR0cignbm8tYWRkJykpIHtcclxuICAgICAgdmFyIGVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kZWxlbWVudCk7XHJcbiAgICAgIHZhciBob3ZlckVsT2ZmWCA9IHRoaXMuZ2V0RWxlbWVudE9mZnNldFgodGhpcy4kaG92ZXJFbGVtZW50KSAtIGVsT2ZmWDtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucGl4ZWxUb1ZhbChob3ZlckVsT2ZmWCk7XHJcbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHRoaXMuc2l6ZTtcclxuXHJcbiAgICAgIHRoaXMuYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25XZWVrbHlTbG90TW91c2VPdmVyKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbldlZWtseVNsb3RNb3VzZUxlYXZlKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNpemUoKSB7XHJcbiAgICAvKiBTaW5jZSB3ZSBoYXZlIGNoYW5nZWQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50IHZpYSBwbGFpbiBqcyArXHJcbiAgICAgKiB0aGUgbmctc3R5bGVzIGZvciB0aGUgaW5kaXZpZHVhbCBzbG90cyBhcmUgY29tcHV0ZWQgaW4gdGhpcyBjb250cm9sbGVyLFxyXG4gICAgICogd2UgbXVzdCBjYWxsICRhcHBseSgpIG1hbnVhbGx5IHNvIHRoZXkgd2lsbCBhbGwgdXBkYXRlIHRoZWlyIHBvc2l0aW9ucyB0byBtYXRjaCB0aGUgem9vbSBsZXZlbFxyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kYXBwbHkoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwaXhlbFRvVmFsKHBpeGVsOiBudW1iZXIpIHtcclxuICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBNdWx0aVNsaWRlckNvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdtdWx0aVNsaWRlcic7XHJcbiAgXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBjb25maWc6ICc8JyxcclxuICAgIGl0ZW06ICc9JyxcclxuICAgIGluZGV4OiAnPCcsXHJcbiAgICBzaXplOiAnPD8nXHJcbiAgfVxyXG5cclxuICBjb250cm9sbGVyID0gTXVsdGlTbGlkZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gIGNvbnRyb2xsZXJBcyA9IE11bHRpU2xpZGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihNdWx0aVNsaWRlckNvbnRyb2xsZXIuJG5hbWUsIE11bHRpU2xpZGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KE11bHRpU2xpZGVyQ29tcG9uZW50LiRuYW1lLCBuZXcgTXVsdGlTbGlkZXJDb21wb25lbnQoKSk7XHJcbiIsIi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgUmVzaXplU2VydmljZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAncmVzaXplU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAgICAgJyRyb290U2NvcGUnLFxyXG4gICAgICAgICckd2luZG93J1xyXG4gICAgXTtcclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlICRyb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSAkd2luZG93OiBhbmd1bGFyLklXaW5kb3dTZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLiR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuUkVTSVpFRCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLnNlcnZpY2UoUmVzaXplU2VydmljZS4kbmFtZSwgUmVzaXplU2VydmljZSlcclxuICAgIC5ydW4oW1Jlc2l6ZVNlcnZpY2UuJG5hbWUsIChyZXNpemVTZXJ2aWNlOiBSZXNpemVTZXJ2aWNlKSA9PiByZXNpemVTZXJ2aWNlLmluaXRpYWxpemUoKV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjaGVkdWxlQXJlYUNvbnRhaW5lckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRDb250cm9sbGVyIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyJztcclxuXHJcbiAgICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICAgICAnJGVsZW1lbnQnLFxyXG4gICAgICAgICckc2NvcGUnLFxyXG4gICAgICAgICdzY3JvbGxTZXJ2aWNlJyxcclxuICAgICAgICAnem9vbVNlcnZpY2UnXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSxcclxuICAgICAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGUsXHJcbiAgICAgICAgcHJpdmF0ZSBzY3JvbGxTZXJ2aWNlOiBTY3JvbGxTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgem9vbVNlcnZpY2U6IFpvb21TZXJ2aWNlXHJcbiAgICApIHtcclxuICAgIH1cclxuXHJcbiAgICAkcG9zdExpbmsoKSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50WzBdOyAvLyBncmFiIHBsYWluIGpzLCBub3QganFsaXRlXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsU2VydmljZS5oaWphY2tTY3JvbGwoZWxlbWVudCwgMjApO1xyXG5cclxuICAgICAgICB0aGlzLiRzY29wZS4kb24oV2Vla2x5U2NoZWR1bGVyRXZlbnRzLkNMSUNLX09OX0FfQ0VMTCwgKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b29tU2VydmljZS56b29tSW5BQ2VsbChlbGVtZW50LCBlLCBkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBTY2hlZHVsZUFyZWFDb250YWluZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICdzY2hlZHVsZUFyZWFDb250YWluZXInO1xyXG5cclxuICAgIGNvbnRyb2xsZXIgPSBTY2hlZHVsZUFyZWFDb250YWluZXJDb250cm9sbGVyLiRuYW1lO1xyXG4gICAgdHJhbnNjbHVkZSA9IHRydWU7XHJcblxyXG4gICAgdGVtcGxhdGUgPSBgPG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPmA7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmNvbnRyb2xsZXIoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlci4kbmFtZSwgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29udHJvbGxlcilcclxuICAgIC5jb21wb25lbnQoU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50LiRuYW1lLCBuZXcgU2NoZWR1bGVBcmVhQ29udGFpbmVyQ29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFNjcm9sbFNlcnZpY2Uge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ3Njcm9sbFNlcnZpY2UnO1xyXG5cclxuICAgIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgICAgICd6b29tU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHpvb21TZXJ2aWNlOiBab29tU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpamFja1Njcm9sbChlbGVtZW50LCBkZWx0YSkge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvb21TZXJ2aWNlLnpvb21CeVNjcm9sbChlbGVtZW50LCBldmVudCwgZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFNjcm9sbFNlcnZpY2UuJG5hbWUsIFNjcm9sbFNlcnZpY2UpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFRpbWVPZkRheUZpbHRlciB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAndGltZU9mRGF5JztcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1pbnV0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ01pbnV0ZXMgPSAobWludXRlcyAtIChob3VycyAqIDYwKSkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbGV0IG1lcmlkaWVtID0gaG91cnMgPiAxMSA/ICdQJyA6ICdBJztcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdNaW51dGVzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdNaW51dGVzID0gJzAnICsgcmVtYWluaW5nTWludXRlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke2hvdXJzICUgMTIgfHwgMTJ9OiR7cmVtYWluaW5nTWludXRlc30ke21lcmlkaWVtfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gICAgLmZpbHRlcihUaW1lT2ZEYXlGaWx0ZXIuJG5hbWUsIFtUaW1lT2ZEYXlGaWx0ZXIuRmFjdG9yeV0pO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIgaW1wbGVtZW50cyBhbmd1bGFyLklDb250cm9sbGVyIHtcclxuICBzdGF0aWMgJGNvbnRyb2xsZXJBcyA9ICdzY2hlZHVsZXJDdHJsJztcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcic7XHJcblxyXG4gIHN0YXRpYyAkaW5qZWN0ID0gW1xyXG4gICAgJyRzY29wZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJHNjb3BlOiBhbmd1bGFyLklTY29wZVxyXG4gICkge1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuICBwdWJsaWMgaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXTtcclxuICBwdWJsaWMgb3B0aW9uczogSVdlZWtseVNjaGVkdWxlck9wdGlvbnM7XHJcbiAgcHVibGljIG9uQ2hhbmdlOiAob3B0aW9uczogeyBpdGVtSW5kZXg6IG51bWJlciwgc2NoZWR1bGVJbmRleDogbnVtYmVyLCBzY2hlZHVsZVZhbHVlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PiB9KSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IElXZWVrbHlTY2hlZHVsZXJPcHRpb25zID0ge1xyXG4gICAgbW9ub1NjaGVkdWxlOiBmYWxzZSxcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJG1vZGVsQ2hhbmdlTGlzdGVuZXJzOiAoKGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZykgPT4gdm9pZClbXTtcclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICovXHJcbiAgICB0aGlzLiRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCgpID0+IHRoaXMuaXRlbXMsIChuZXdJdGVtcykgPT4gdGhpcy5vbk1vZGVsQ2hhbmdlKG5ld0l0ZW1zKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmUgdGhlIHNjaGVkdWxlci5cclxuICAgKi9cclxuICBwcml2YXRlIGNvbmZpZ3VyZShvcHRpb25zOiBJV2Vla2x5U2NoZWR1bGVyT3B0aW9ucyk6IElXZWVrbHlTY2hlZHVsZXJDb25maWcge1xyXG4gICAgdmFyIGludGVydmFsID0gb3B0aW9ucy5pbnRlcnZhbCB8fCAxNTsgLy8gbWludXRlc1xyXG4gICAgdmFyIGhvdXJzSW5EYXkgPSAyNDtcclxuICAgIHZhciBtaW51dGVzSW5EYXkgPSBob3Vyc0luRGF5ICogNjA7XHJcbiAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IG1pbnV0ZXNJbkRheSAvIGludGVydmFsO1xyXG5cclxuICAgIHZhciByZXN1bHQ6IElXZWVrbHlTY2hlZHVsZXJDb25maWcgPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCB7IGludGVydmFsOiBpbnRlcnZhbCwgbWF4VmFsdWU6IG1pbnV0ZXNJbkRheSwgaG91ckNvdW50OiBob3Vyc0luRGF5LCBpbnRlcnZhbENvdW50OiBpbnRlcnZhbENvdW50IH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW9kZWxDaGFuZ2UoaXRlbXM6IElXZWVrbHlTY2hlZHVsZXJJdGVtPG51bWJlcj5bXSkge1xyXG4gICAgLy8gQ2hlY2sgaXRlbXMgYXJlIHByZXNlbnRcclxuICAgIGlmIChpdGVtcykge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xyXG4gICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHVzZSB3ZWVrbHktc2NoZWR1bGVyIGRpcmVjdGl2ZSB3aXRoIGFuIEFycmF5IG9mIGl0ZW1zJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgbW9kZWwgKHVzZSBpdCBpbiB0ZW1wbGF0ZSlcclxuICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgICAgLy8gSWYgaW4gbXVsdGlTbGlkZXIgbW9kZSwgZW5zdXJlIGEgc2NoZWR1bGUgYXJyYXkgaXMgcHJlc2VudCBvbiBlYWNoIGl0ZW1cclxuICAgICAgLy8gRWxzZSBvbmx5IHVzZSBmaXJzdCBlbGVtZW50IG9mIHNjaGVkdWxlIGFycmF5XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgIGlmIChzY2hlZHVsZXMgJiYgc2NoZWR1bGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb25vU2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbmZpZ3VyZSh0aGlzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gRmluYWxseSwgcnVuIHRoZSBzdWIgZGlyZWN0aXZlcyBsaXN0ZW5lcnNcclxuICAgICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcclxuICAgICAgICBsaXN0ZW5lcih0aGlzLmNvbmZpZyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTY2hlZHVsZXJDb21wb25lbnQgaW1wbGVtZW50cyBhbmd1bGFyLklDb21wb25lbnRPcHRpb25zIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgYmluZGluZ3MgPSB7XHJcbiAgICBpdGVtczogJz0nLFxyXG4gICAgb3B0aW9uczogJz0nLFxyXG4gICAgb25DaGFuZ2U6ICcmJ1xyXG4gIH07XHJcbiAgXHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICB0cmFuc2NsdWRlID0gdHJ1ZTtcclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci5odG1sJztcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmNvbnRyb2xsZXIoV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kbmFtZSwgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNjaGVkdWxlckNvbXBvbmVudC4kbmFtZSwgbmV3IFdlZWtseVNjaGVkdWxlckNvbXBvbmVudCgpKTtcclxuIiwiLyoqIEBpbnRlcm5hbCAqL1xyXG5jbGFzcyBXZWVrbHlTbG90Q29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudENvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90Q29udHJvbGxlcic7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnd2Vla2x5U2xvdEN0cmwnO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckZWxlbWVudCcsXHJcbiAgICAnJHNjb3BlJ1xyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgbmdNb2RlbEN0cmw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcjtcclxuXHJcbiAgcHJpdmF0ZSAkY29udGFpbmVyRWw6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcclxuICBwcml2YXRlIGNvbmZpZzogSVdlZWtseVNjaGVkdWxlckNvbmZpZztcclxuXHJcbiAgcHJpdmF0ZSBpdGVtOiBJV2Vla2x5U2NoZWR1bGVySXRlbTxhbnk+O1xyXG4gIHByaXZhdGUgaXRlbUluZGV4OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgcmVzaXplRGlyZWN0aW9uSXNTdGFydDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIHByaXZhdGUgc2NoZWR1bGU6IElXZWVrbHlTY2hlZHVsZXJSYW5nZTxhbnk+O1xyXG4gIHByaXZhdGUgc2NoZWR1bGVJbmRleDogbnVtYmVyO1xyXG5cclxuICBwcml2YXRlIHZhbHVlc09uRHJhZ1N0YXJ0OiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksXHJcbiAgICBwcml2YXRlICRzY29wZTogYW5ndWxhci5JU2NvcGVcclxuICApIHtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcclxuICB9XHJcblxyXG4gICRvbkluaXQoKSB7XHJcbiAgICB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0ID0ge1xyXG4gICAgICBzdGFydDogdGhpcy5zY2hlZHVsZS5zdGFydCxcclxuICAgICAgZW5kOiB0aGlzLnNjaGVkdWxlLmVuZFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjYW5SZW1vdmUoKSB7XHJcbiAgICByZXR1cm4gIWFuZ3VsYXIuaXNEZWZpbmVkKHRoaXMuaXRlbS5lZGl0YWJsZSkgfHwgdGhpcy5pdGVtLmVkaXRhYmxlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlbGV0ZVNlbGYoKSB7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKHRoaXMuc2NoZWR1bGUpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRyYWcocGl4ZWw6IG51bWJlcikge1xyXG4gICAgbGV0IHVpID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBkZWx0YSA9IHRoaXMucGl4ZWxUb1ZhbChwaXhlbCk7XHJcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHRoaXMudmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgbGV0IG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgbGV0IG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSB0aGlzLmNvbmZpZy5tYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmREcmFnKCkge1xyXG4gICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAvLyBhZGRpbmcgbmV3IHNsb3QgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgIH0sIDUwMCk7XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICB0aGlzLm1lcmdlT3ZlcmxhcHMoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBtZXJnZU92ZXJsYXBzKCkge1xyXG4gICAgbGV0IHNjaGVkdWxlID0gdGhpcy5zY2hlZHVsZTtcclxuICAgIGxldCBzY2hlZHVsZXMgPSB0aGlzLml0ZW0uc2NoZWR1bGVzO1xyXG5cclxuICAgIHNjaGVkdWxlcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgLy8gbW9kZWwgaXMgaW5zaWRlIGFub3RoZXIgc2xvdFxyXG4gICAgICAgIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuZW5kICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLnN0YXJ0KSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogZWwuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgZWxzZSBpZiAoc2NoZWR1bGUuZW5kID49IGVsLmVuZCAmJiBzY2hlZHVsZS5zdGFydCA8PSBlbC5zdGFydCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVTY2hlZHVsZShlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgIGVsc2UgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5lbmQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZVNjaGVkdWxlKGVsKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGYoe1xyXG4gICAgICAgICAgICBzdGFydDogZWwuc3RhcnQsXHJcbiAgICAgICAgICAgIGVuZDogc2NoZWR1bGUuZW5kXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICBlbHNlIGlmIChlbC5zdGFydCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlU2NoZWR1bGUoZWwpO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VsZih7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBzY2hlZHVsZS5zdGFydCxcclxuICAgICAgICAgICAgZW5kOiBlbC5lbmRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGl4ZWxUb1ZhbChwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgcGVyY2VudCA9IHBpeGVsIC8gdGhpcy4kY29udGFpbmVyRWxbMF0uY2xpZW50V2lkdGg7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKHRoaXMuY29uZmlnLmludGVydmFsQ291bnQpICsgMC41KSAqIHRoaXMuY29uZmlnLmludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbW92ZVNjaGVkdWxlKHNjaGVkdWxlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgbGV0IHNjaGVkdWxlcyA9IHRoaXMuaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihzY2hlZHVsZSksIDEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2l6ZShwaXhlbDogbnVtYmVyKSB7XHJcbiAgICBsZXQgdWkgPSB0aGlzLnNjaGVkdWxlO1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5waXhlbFRvVmFsKHBpeGVsKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgIGxldCBuZXdTdGFydCA9IE1hdGgucm91bmQodGhpcy52YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuXHJcbiAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgIGVuZDogdWkuZW5kXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBuZXdFbmQgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG5cclxuICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IHRoaXMuY29uZmlnLm1heFZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKHtcclxuICAgICAgICAgIHN0YXJ0OiB1aS5zdGFydCxcclxuICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydERyYWcoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICB0aGlzLiRjb250YWluZXJFbC5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgIHRoaXMuJGNvbnRhaW5lckVsLmF0dHIoJ25vLWFkZCcsICd0cnVlJyk7XHJcblxyXG4gICAgdGhpcy52YWx1ZXNPbkRyYWdTdGFydCA9IHtcclxuICAgICAgc3RhcnQ6IHRoaXMuc2NoZWR1bGUuc3RhcnQsXHJcbiAgICAgIGVuZDogdGhpcy5zY2hlZHVsZS5lbmRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRSZXNpemVTdGFydCgpIHtcclxuICAgIHRoaXMucmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0UmVzaXplRW5kKCkge1xyXG4gICAgdGhpcy5yZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0YXJ0RHJhZygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZVNlbGYodXBkYXRlOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8YW55Pikge1xyXG4gICAgdGhpcy5zY2hlZHVsZS5zdGFydCA9IHVwZGF0ZS5zdGFydDtcclxuICAgIHRoaXMuc2NoZWR1bGUuZW5kID0gdXBkYXRlLmVuZDtcclxuXHJcbiAgICB0aGlzLm5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUodGhpcy5zY2hlZHVsZSk7XHJcblxyXG4gICAgdGhpcy5zY2hlZHVsZXJDdHJsLm9uQ2hhbmdlKHtcclxuICAgICAgaXRlbUluZGV4OiB0aGlzLml0ZW1JbmRleCxcclxuICAgICAgc2NoZWR1bGVJbmRleDogdGhpcy5zY2hlZHVsZUluZGV4LFxyXG4gICAgICBzY2hlZHVsZVZhbHVlOiB0aGlzLnNjaGVkdWxlXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBAaW50ZXJuYWwgKi9cclxuY2xhc3MgV2Vla2x5U2xvdENvbXBvbmVudCBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbXBvbmVudE9wdGlvbnMge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTbG90JztcclxuICBcclxuICBiaW5kaW5ncyA9IHtcclxuICAgIGNvbmZpZzogJzwnLFxyXG4gICAgc2NoZWR1bGU6ICc9bmdNb2RlbCcsXHJcbiAgICBpdGVtSW5kZXg6ICc8JyxcclxuICAgIHNjaGVkdWxlSW5kZXg6ICc8JyxcclxuICAgIGl0ZW06ICc9J1xyXG4gIH07XHJcblxyXG4gIGNvbnRyb2xsZXIgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kbmFtZTtcclxuICBjb250cm9sbGVyQXMgPSBXZWVrbHlTbG90Q29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICByZXF1aXJlID0ge1xyXG4gICAgc2NoZWR1bGVyQ3RybDogJ153ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgbmdNb2RlbEN0cmw6ICduZ01vZGVsJ1xyXG4gIH07XHJcblxyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNsb3RDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTbG90Q29udHJvbGxlcilcclxuICAuY29tcG9uZW50KFdlZWtseVNsb3RDb21wb25lbnQuJG5hbWUsIG5ldyBXZWVrbHlTbG90Q29tcG9uZW50KCkpO1xyXG4iLCIvKiogQGludGVybmFsICovXHJcbmNsYXNzIFpvb21TZXJ2aWNlIHtcclxuICAgIHN0YXRpYyAkbmFtZSA9ICd6b29tU2VydmljZSc7XHJcblxyXG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRyb290U2NvcGUnXTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgJHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZVxyXG4gICAgKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rvcjogc3RyaW5nID0gJy5zY2hlZHVsZS1hcmVhJztcclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdFpvb21lZEluRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy4kcm9vdFNjb3BlLiRicm9hZGNhc3QoV2Vla2x5U2NoZWR1bGVyRXZlbnRzLlpPT01FRF9JTik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3Rab29tZWRPdXRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLiRyb290U2NvcGUuJGJyb2FkY2FzdChXZWVrbHlTY2hlZHVsZXJFdmVudHMuWk9PTUVEX09VVCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0Wm9vbShlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tSW5BQ2VsbChlbGVtZW50OiBhbnksIGV2ZW50OiBhbmd1bGFyLklBbmd1bGFyRXZlbnQsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBkYXRhLm5iRWxlbWVudHM7XHJcbiAgICAgICAgbGV0IGkgPSBkYXRhLmlkeDtcclxuXHJcbiAgICAgICAgLy8gcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyBpcyB1c2VkIHdoZW4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGdyaWQgaXMgbm90IGZ1bGxcclxuICAgICAgICAvLyBGb3IgaW5zdGFuY2UsIGluIHRoZSBleGFtcGxlIGJlbG93IGBmZWIgMTdgIGlzIG5vdCBmdWxsXHJcbiAgICAgICAgLy8gZmViIDE3ICAgICAgICAgIG1hcmNoIDE3XHJcbiAgICAgICAgLy8gICAgICAgfCAgICBcclxuICAgICAgICBsZXQgcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9IGRhdGEucGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZztcclxuXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lcldpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgLy8gbGVhdmUgKDEvMykgZWFjaCBzaWRlXHJcbiAgICAgICAgLy8gMS8zIHwgICAgMy8zICAgfCAxLzNcclxuICAgICAgICBsZXQgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvICg1IC8gMyk7XHJcbiAgICAgICAgbGV0IGd1dHRlclNpemUgPSBib3hXaWR0aCAvIDM7XHJcblxyXG4gICAgICAgIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gZWxlbWVudENvdW50ICogYm94V2lkdGg7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3Rvcikuc3R5bGUud2lkdGggPSBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgKyAnJSc7XHJcblxyXG4gICAgICAgIGlmIChwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIC8vIEFsbCBjZWxscyBvZiBhIGxpbmUgaGF2ZSB0aGUgc2FtZSBzaXplXHJcbiAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBpICogYm94V2lkdGggLSBndXR0ZXJTaXplO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBTaXplcyBvZiBjZWxscyBpbiBhIGxpbmUgY291bGQgZGlmZmVyZW50IChlc3BlY2lhbGx5IHRoZSBmaXJzdCBvbmUpXHJcbiAgICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgPSBzY2hlZHVsZUFyZWFXaWR0aFB4ICogKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgLyAxMDApIC0gZ3V0dGVyU2l6ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0Wm9vbWVkSW5FdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB6b29tQnlTY3JvbGwoZWxlbWVudDogYW55LCBldmVudDogV2hlZWxFdmVudCwgZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBzdHlsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9yKS5zdHlsZTtcclxuICAgICAgICBsZXQgY3VycmVudFdpZHRoID0gcGFyc2VJbnQoc3R5bGUud2lkdGgsIDEwKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHN0eWxlLndpZHRoID0gKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdFpvb21lZEluRXZlbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgICAgIHN0eWxlLndpZHRoID0gKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3Rab29tZWRPdXRFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5zZXJ2aWNlKFpvb21TZXJ2aWNlLiRuYW1lLCBab29tU2VydmljZSk7XHJcbiIsImludGVyZmFjZSBJV2Vla2x5U2NoZWR1bGVySXRlbTxUPiB7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZWRpdGFibGU/OiBib29sZWFuO1xyXG4gICAgc2NoZWR1bGVzOiBJV2Vla2x5U2NoZWR1bGVyUmFuZ2U8VD5bXTtcclxufVxyXG4iLCJpbnRlcmZhY2UgSVdlZWtseVNjaGVkdWxlclJhbmdlPFQ+IHtcclxuICAgIHN0YXJ0OiBudW1iZXI7XHJcbiAgICBlbmQ6IG51bWJlcjtcclxufVxyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><div class="row" ng-controller="DemoController as demo"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px; overflow-y: auto"></pre></div><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler><div class="dark"><weekly-scheduler items="model.items" on-change="demo.doSomething(itemIndex, scheduleIndex, scheduleValue)" on-delete="demo.doSomething()" options="model.options"></weekly-scheduler></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/brian-rowe/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\n</pre><p>Then run <code>gulp server</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html.</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/brian-rowe/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong> </a>to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-click="multiSliderCtrl.onHoverElementClick()" ng-show="multiSliderCtrl.item.editable !== false && (!multiSliderCtrl.config.monoSchedule || !multiSliderCtrl.item.schedules.length)">+</div><weekly-slot class="slot" config="multiSliderCtrl.config" item="multiSliderCtrl.item" item-index="multiSliderCtrl.index" ng-class="{disable: multiSliderCtrl.item.editable === false}" ng-repeat="schedule in multiSliderCtrl.item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\' }" ng-mouseleave="multiSliderCtrl.onWeeklySlotMouseLeave()" ng-mouseover="multiSliderCtrl.onWeeklySlotMouseOver()" ng-style="{\r\n                 left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                 right: multiSliderCtrl.getSlotRight(schedule.end) \r\n             }" schedule-index="$index"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow dummy"></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items">{{ item.label }}</div></div><schedule-area-container><div class="schedule-area"><div class="srow timestamps"><hourly-grid></hourly-grid></div><div class="srow calendar schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid no-text></hourly-grid><multi-slider config="schedulerCtrl.config" item="item" index="$index"></multi-slider></div></div></schedule-area-container>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{weeklySlotCtrl.schedule.start | timeOfDay}} - {{weeklySlotCtrl.schedule.end | timeOfDay}}"><div class="handle left" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeStart()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="middle" ondrag="weeklySlotCtrl.drag(delta)" ondragstart="weeklySlotCtrl.startDrag()" ondragstop="weeklySlotCtrl.endDrag()" handle>{{weeklySlotCtrl.schedule.start | timeOfDay}}-{{weeklySlotCtrl.schedule.end | timeOfDay}}</div><div class="handle right" ondrag="weeklySlotCtrl.resize(delta)" ondragstart="weeklySlotCtrl.startResizeEnd()" ondragstop="weeklySlotCtrl.endDrag()" handle></div><div class="remove" ng-click="weeklySlotCtrl.deleteSelf()" ng-if="::weeklySlotCtrl.canRemove()"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);