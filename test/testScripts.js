angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])
    .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
        localeServiceProvider.configure({
            doys: { 'es-es': 4 },
            lang: { 'es-es': { weekNb: 'número de la semana', addNew: 'Añadir' } },
            localeLocationPattern: '/angular-locale_{{locale}}.js'
        });
    }])
    .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {
        $scope.model = {
            locale: localeService.$locale.id,
            options: { /*monoSchedule: true*/},
            items: [{
                    label: 'Item 1',
                    editable: false,
                    schedules: [
                        { start: moment('2015-12-27').startOf('day').toDate(), end: moment('2015-12-27').endOf('day').toDate() }
                    ]
                },
                {
                    label: 'Item 2',
                    schedules: [
                        { start: moment('2015-12-27').startOf('day').add(5, 'hours').toDate(), end: moment('2015-12-27').endOf('day').add(-5, 'hours').toDate() }
                    ]
                }, {
                    label: 'Item 3',
                    schedules: [
                        { start: moment('2015-12-27').startOf('day').add(2, 'hours').toDate(), end: moment('2015-12-27').endOf('day').add(-2, 'hours').toDate() }
                    ]
                }]
        };
        this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
            $log.debug('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
        };
        this.onLocaleChange = function () {
            $log.debug('The locale is changing to', $scope.model.locale);
            localeService.set($scope.model.locale).then(function ($locale) {
                $log.debug('The locale changed to', $locale.id);
            });
        };
    }]);
angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);
var GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
var CLICK_ON_A_CELL = 'clickOnACell';
var isCtrl;
function ctrlCheck(e) {
    if (e.which === 17) {
        isCtrl = e.type === 'keydown';
    }
}
function mouseScroll(el, delta) {
    window.addEventListener('keydown', ctrlCheck);
    window.addEventListener('keyup', ctrlCheck);
    el.addEventListener('mousewheel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isCtrl) {
            var style = el.firstChild.style, currentWidth = parseInt(style.width);
            if ((e.wheelDelta || e.detail) > 0) {
                style.width = (currentWidth + 2 * delta) + '%';
            }
            else {
                var width = currentWidth - 2 * delta;
                style.width = (width > 100 ? width : 100) + '%';
            }
        }
        else {
            if ((e.wheelDelta || e.detail) > 0) {
                el.scrollLeft -= delta;
            }
            else {
                el.scrollLeft += delta;
            }
        }
        return false;
    });
}
function zoomInACell(el, event, data) {
    var nbElements = data.nbElements;
    var idx = data.idx;
    // percentWidthFromBeginning is used when the first element of the grid is not full
    // For instance, in the example below `feb 17` is not full
    // feb 17          march 17
    //       |                          |
    var percentWidthFromBeginning = data.percentWidthFromBeginning;
    var containerWidth = el.offsetWidth;
    // leave (1/3) each side
    // 1/3 |    3/3   | 1/3
    var boxWidth = containerWidth / (5 / 3);
    var gutterSize = boxWidth / 3;
    var scheduleAreaWidthPx = nbElements * boxWidth;
    var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
    el.firstChild.style.width = scheduleAreaWidthPercent + '%';
    if (percentWidthFromBeginning === undefined) {
        // All cells of a line have the same size
        el.scrollLeft = idx * boxWidth - gutterSize;
    }
    else {
        // Sizes of cells in a line could different (especially the first one)
        el.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
    }
}
var HandleDirective = /** @class */ (function () {
    function HandleDirective($document) {
        var _this = this;
        this.$document = $document;
        this.restrict = 'A';
        this.scope = {
            ondrag: '=',
            ondragstop: '=',
            ondragstart: '='
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
                if (scope.ondragstart) {
                    scope.ondragstart();
                }
            });
            function mousemove(event) {
                var delta = event.pageX - x;
                if (scope.ondrag) {
                    scope.ondrag(delta);
                }
            }
            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                if (scope.ondragstop) {
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
var HourlyGridDirective = /** @class */ (function () {
    function HourlyGridDirective() {
        var _this = this;
        this.restrict = 'E';
        this.require = '^weeklyScheduler';
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
            schedulerCtrl.$modelChangeListeners.push(function (newModel) {
                _this.doGrid(scope, element, attrs, newModel);
            });
        };
    }
    HourlyGridDirective.prototype.handleClickEvent = function (child, nbHours, idx, scope) {
        // child.bind('click', function () {
        //   scope.$broadcast(CLICK_ON_A_CELL, {
        //     nbElements: nbHours,
        //     idx: idx
        //   });
        // });
    };
    HourlyGridDirective.prototype.doGrid = function (scope, element, attrs, model) {
        var i;
        // Calculate hour width distribution
        var tickcount = model.nbHours;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({ width: ticksize + '%' });
        var now = model.minDate.clone().startOf('week');
        // Clean element
        element.empty();
        for (i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                //child.text(i % 12);
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
var InjectDirective = /** @class */ (function () {
    function InjectDirective() {
        this.link = function ($scope, $element, $attrs, controller, $transclude) {
            if (!$transclude) {
                throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
            }
            var innerScope = $scope.$new();
            $transclude(innerScope, function (clone) {
                $element.empty();
                $element.append(clone);
                $element.on('$destroy', function () {
                    innerScope.$destroy();
                });
            });
        };
    }
    InjectDirective.Factory = function () {
        var directive = function () { return new InjectDirective(); };
        return directive;
    };
    InjectDirective.$name = 'inject';
    return InjectDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(InjectDirective.$name, InjectDirective.Factory());
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);
angular.module('weeklySchedulerI18N')
    .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
        var defaultConfig = {
            doys: { 'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4 },
            lang: {
                'de-de': { weekNb: 'Wochenummer', addNew: 'Hinzufügen' },
                'en-gb': { weekNb: 'Week #', addNew: 'Add' },
                'en-us': { weekNb: 'Week #', addNew: 'Add' },
                'fr-fr': { weekNb: 'N° de semaine', addNew: 'Ajouter' }
            }
        };
        this.configure = function (config) {
            if (config && angular.isObject(config)) {
                angular.merge(defaultConfig, config);
                if (defaultConfig.localeLocationPattern) {
                    tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
                }
            }
        };
        this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {
                var momentLocaleCache = {};
                function getLang() {
                    var key = $locale.id;
                    if (!momentLocaleCache[key]) {
                        momentLocaleCache[key] = getMomentLocale(key);
                        moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
                    }
                    else {
                        moment.locale(momentLocaleCache[key].id);
                    }
                    return defaultConfig.lang[key];
                }
                // We just need few moment local information
                function getMomentLocale(key) {
                    return {
                        id: key,
                        locale: {
                            week: {
                                // Angular monday = 0 whereas Moment monday = 1
                                dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
                                doy: defaultConfig.doys[key]
                            }
                        }
                    };
                }
                $rootScope.$on('$localeChangeSuccess', function () {
                    $rootScope.$broadcast('weeklySchedulerLocaleChanged', getLang());
                });
                return {
                    $locale: $locale,
                    getLang: getLang,
                    set: function (key) {
                        return tmhDynamicLocale.set(key);
                    }
                };
            }];
    }]);
var MultiSliderDirective = /** @class */ (function () {
    function MultiSliderDirective(timeService) {
        var _this = this;
        this.timeService = timeService;
        this.restrict = 'E';
        this.require = '^weeklyScheduler';
        this.templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
        this.link = function (scope, element, attrs, schedulerCtrl) {
            var conf = schedulerCtrl.config;
            // The default scheduler block size when adding a new item
            var defaultNewScheduleSize = parseInt(attrs.size) || 8;
            var valToPixel = function (val) {
                var percent = val / (conf.nbWeeks);
                return Math.floor(percent * element[0].clientWidth + 0.5);
            };
            var pixelToVal = function (pixel) {
                var percent = pixel / element[0].clientWidth;
                return Math.floor(percent * (conf.nbWeeks) + 0.5);
            };
            var addSlot = function (start, end) {
                start = start >= 0 ? start : 0;
                end = end <= conf.nbWeeks ? end : conf.nbWeeks;
                var startDate = _this.timeService.addWeek(conf.minDate, start);
                var endDate = _this.timeService.addWeek(conf.minDate, end);
                scope.$apply(function () {
                    var item = scope.item;
                    if (!item.schedules) {
                        item.schedules = [];
                    }
                    item.schedules.push({ start: startDate.toDate(), end: endDate.toDate() });
                });
            };
            var hoverElement = angular.element(element.find('div')[0]);
            var hoverElementWidth = valToPixel(defaultNewScheduleSize);
            hoverElement.css({
                width: hoverElementWidth + 'px'
            });
            element.on('mousemove', function (e) {
                var elOffX = element[0].getBoundingClientRect().left;
                hoverElement.css({
                    left: e.pageX - elOffX - hoverElementWidth / 2 + 'px'
                });
            });
            hoverElement.on('click', function (event) {
                if (!element.attr('no-add')) {
                    var elOffX = element[0].getBoundingClientRect().left;
                    var pixelOnClick = event.pageX - elOffX;
                    var valOnClick = pixelToVal(pixelOnClick);
                    var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
                    var end = start + defaultNewScheduleSize;
                    addSlot(start, end);
                }
            });
        };
    }
    MultiSliderDirective.Factory = function () {
        var directive = function (timeService) { return new MultiSliderDirective(timeService); };
        directive.$inject = [
            'weeklySchedulerTimeService'
        ];
        return directive;
    };
    MultiSliderDirective.$name = 'multiSlider';
    return MultiSliderDirective;
}());
angular.module('weeklyScheduler')
    .directive(MultiSliderDirective.$name, MultiSliderDirective.Factory());
var WeeklySchedulerTimeService = /** @class */ (function () {
    function WeeklySchedulerTimeService() {
        this.WEEK = 'week';
    }
    WeeklySchedulerTimeService.prototype.addWeek = function (moment, nbWeek) {
        return moment.clone().add(nbWeek, this.WEEK);
    };
    WeeklySchedulerTimeService.prototype.compare = function (date, method, lastMin) {
        if (date) {
            var dateAsMoment;
            if (angular.isDate(date)) {
                dateAsMoment = moment(date);
            }
            else if (date._isAMomentObject) {
                dateAsMoment = date;
            }
            else {
                throw 'Could not parse date [' + date + ']';
            }
            return dateAsMoment[method](lastMin) ? dateAsMoment : lastMin;
        }
    };
    WeeklySchedulerTimeService.prototype.weekPreciseDiff = function (start, end) {
        return end.clone().diff(start.clone(), this.WEEK, true);
    };
    WeeklySchedulerTimeService.$name = 'weeklySchedulerTimeService';
    return WeeklySchedulerTimeService;
}());
angular.module('weeklyScheduler')
    .service(WeeklySchedulerTimeService.$name, WeeklySchedulerTimeService);
/* global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('weeklyGrid', [function () {
        function handleClickEvent(child, nbWeeks, idx, scope) {
            child.bind('click', function () {
                scope.$broadcast(CLICK_ON_A_CELL, {
                    nbElements: nbWeeks,
                    idx: idx
                });
            });
        }
        function doGrid(scope, element, attrs, model) {
            var i;
            // Calculate week width distribution
            var tickcount = model.nbWeeks;
            var ticksize = 100 / tickcount;
            var gridItemEl = GRID_TEMPLATE.css({ width: ticksize + '%' });
            var now = model.minDate.clone().startOf('week');
            // Clean element
            element.empty();
            for (i = 0; i < tickcount; i++) {
                var child = gridItemEl.clone();
                if (angular.isUndefined(attrs.noText)) {
                    handleClickEvent(child, tickcount, i, scope);
                    child.text(now.add(i && 1, 'week').week());
                }
                element.append(child);
            }
        }
        return {
            restrict: 'E',
            require: '^weeklyScheduler',
            link: function (scope, element, attrs, schedulerCtrl) {
                if (schedulerCtrl.config) {
                    doGrid(scope, element, attrs, schedulerCtrl.config);
                }
                schedulerCtrl.$modelChangeListeners.push(function (newModel) {
                    doGrid(scope, element, attrs, newModel);
                });
            }
        };
    }]);
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($injector, $log) {
        this.$injector = $injector;
        this.$log = $log;
        this.defaultOptions = {
            monoSchedule: false,
            selector: '.schedule-area-container'
        };
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        // Try to get the i18n service
        var name = 'weeklySchedulerLocaleService';
        if (this.$injector.has(name)) {
            this.$log.info('The I18N service has successfully been initialized!');
            var localeService = this.$injector.get(name); /* TODO type */
            this.defaultOptions.labels = localeService.getLang();
        }
        else {
            this.$log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
        }
        // Will hang our model change listeners
        this.$modelChangeListeners = [];
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'weeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$injector',
        '$log'
    ];
    return WeeklySchedulerController;
}());
var WeeklySchedulerDirective = /** @class */ (function () {
    function WeeklySchedulerDirective($log, $parse, timeService) {
        var _this = this;
        this.$log = $log;
        this.$parse = $parse;
        this.timeService = timeService;
        this.restrict = 'E';
        this.require = 'weeklyScheduler';
        this.transclude = true;
        this.templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.link = function (scope, element, attrs, schedulerCtrl) {
            var optionsFn = _this.$parse(attrs.options), options = angular.extend(schedulerCtrl.defaultOptions, optionsFn(scope) || {});
            // Get the schedule container element
            var el = element[0].querySelector(schedulerCtrl.defaultOptions.selector);
            var self = _this;
            function onModelChange(items) {
                // Check items are present
                if (items) {
                    // Check items are in an Array
                    if (!angular.isArray(items)) {
                        throw 'You should use weekly-scheduler directive with an Array of items';
                    }
                    // Keep track of our model (use it in template)
                    schedulerCtrl.items = items;
                    // First calculate configuration
                    schedulerCtrl.config = self.config(items.reduce(function (result, item) {
                        var schedules = item.schedules;
                        return result.concat(schedules && schedules.length ?
                            // If in multiSlider mode, ensure a schedule array is present on each item
                            // Else only use first element of schedule array
                            (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
                            item.schedules = []);
                    }, []), options);
                    // Finally, run the sub directives listeners
                    schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
                        listener(schedulerCtrl.config);
                    });
                }
            }
            if (el) {
                // Install mouse scrolling event listener for H scrolling
                mouseScroll(el, 20);
                scope.$on(CLICK_ON_A_CELL, function (e, data) {
                    zoomInACell(el, e, data);
                });
                schedulerCtrl.on = {
                    change: function (itemIndex, scheduleIndex, scheduleValue) {
                        var onChangeFunction = _this.$parse(attrs.onChange)(scope);
                        if (angular.isFunction(onChangeFunction)) {
                            return onChangeFunction(itemIndex, scheduleIndex, scheduleValue);
                        }
                    }
                };
                /**
                 * Watch the model items
                 */
                scope.$watchCollection(attrs.items, onModelChange);
                /**
                 * Listen to $locale change (brought by external module weeklySchedulerI18N)
                 */
                scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
                    if (schedulerCtrl.config) {
                        schedulerCtrl.config.labels = labels;
                    }
                    onModelChange(angular.copy(this.$parse(attrs.items)(scope), []));
                });
            }
        };
    }
    /**
     * Configure the scheduler.
     * @param schedules
     * @param options
     * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
     */
    WeeklySchedulerDirective.prototype.config = function (schedules, options) {
        var _this = this;
        var now = moment();
        // Calculate min date of all scheduled events
        var minDate = (schedules ? schedules.reduce(function (minDate, slot) {
            return _this.timeService.compare(slot.start, 'isBefore', minDate);
        }, now) : now).startOf('week');
        // Calculate max date of all scheduled events
        var maxDate = (schedules ? schedules.reduce(function (maxDate, slot) {
            return _this.timeService.compare(slot.end, 'isAfter', maxDate);
        }, minDate) : now).clone().add(1, 'day').endOf('day');
        // Calculate nb of weeks covered by minDate => maxDate
        var nbWeeks = 1;
        var result = angular.extend(options, { minDate: minDate, maxDate: maxDate, nbWeeks: nbWeeks, nbHours: nbWeeks * 168 });
        // Log configuration
        this.$log.debug('Weekly Scheduler configuration:', result);
        return result;
    };
    WeeklySchedulerDirective.Factory = function () {
        var directive = function ($log, $parse, timeService) { return new WeeklySchedulerDirective($log, $parse, timeService); };
        directive.$inject = [
            '$log',
            '$parse',
            'weeklySchedulerTimeService'
        ];
        return directive;
    };
    WeeklySchedulerDirective.$name = 'weeklyScheduler';
    return WeeklySchedulerDirective;
}());
/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .directive(WeeklySchedulerDirective.$name, WeeklySchedulerDirective.Factory());
var WeeklySlotDirective = /** @class */ (function () {
    function WeeklySlotDirective(timeService) {
        var _this = this;
        this.timeService = timeService;
        this.restrict = 'E';
        this.require = ['^weeklyScheduler', 'ngModel'];
        this.templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
        this.link = function (scope, element, attrs, ctrls) {
            var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
            var conf = schedulerCtrl.config;
            var index = scope.$parent.$index;
            var containerEl = element.parent();
            var resizeDirectionIsStart = true;
            var valuesOnDragStart = { start: scope.schedule.start, end: scope.schedule.end };
            var pixelToVal = function (pixel) {
                var percent = pixel / containerEl[0].clientWidth;
                return Math.floor(percent * conf.nbWeeks + 0.5);
            };
            var mergeOverlaps = function () {
                var schedule = scope.schedule;
                var schedules = scope.item.schedules;
                schedules.forEach(function (el) {
                    if (el !== schedule) {
                        // model is inside another slot
                        if (el.end >= schedule.end && el.start <= schedule.start) {
                            schedules.splice(schedules.indexOf(el), 1);
                            schedule.end = el.end;
                            schedule.start = el.start;
                        }
                        // model completely covers another slot
                        else if (schedule.end >= el.end && schedule.start <= el.start) {
                            schedules.splice(schedules.indexOf(el), 1);
                        }
                        // another slot's end is inside current model
                        else if (el.end >= schedule.start && el.end <= schedule.end) {
                            schedules.splice(schedules.indexOf(el), 1);
                            schedule.start = el.start;
                        }
                        // another slot's start is inside current model
                        else if (el.start >= schedule.start && el.start <= schedule.end) {
                            schedules.splice(schedules.indexOf(el), 1);
                            schedule.end = el.end;
                        }
                    }
                });
            };
            /**
             * Delete on right click on slot
             */
            var deleteSelf = function () {
                containerEl.removeClass('dragging');
                containerEl.removeClass('slot-hover');
                scope.item.schedules.splice(scope.item.schedules.indexOf(scope.schedule), 1);
                containerEl.find('weekly-slot').remove();
                scope.$apply();
            };
            element.find('span').on('click', function (e) {
                e.preventDefault();
                deleteSelf();
            });
            element.on('mouseover', function () {
                containerEl.addClass('slot-hover');
            });
            element.on('mouseleave', function () {
                containerEl.removeClass('slot-hover');
            });
            if (scope.item.editable !== false) {
                scope.startResizeStart = function () {
                    resizeDirectionIsStart = true;
                    scope.startDrag();
                };
                scope.startResizeEnd = function () {
                    resizeDirectionIsStart = false;
                    scope.startDrag();
                };
                scope.startDrag = function () {
                    element.addClass('active');
                    containerEl.addClass('dragging');
                    containerEl.attr('no-add', 'true');
                    valuesOnDragStart = { start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end };
                };
                scope.endDrag = function () {
                    // this prevents user from accidentally
                    // adding new slot after resizing or dragging
                    setTimeout(function () {
                        containerEl.removeAttr('no-add');
                    }, 500);
                    element.removeClass('active');
                    containerEl.removeClass('dragging');
                    mergeOverlaps();
                    scope.$apply();
                };
                scope.resize = function (d) {
                    var ui = ngModelCtrl.$viewValue;
                    var delta = pixelToVal(d);
                    if (resizeDirectionIsStart) {
                        var newStart = Math.round(valuesOnDragStart.start + delta);
                        if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                            ngModelCtrl.$setViewValue({
                                start: newStart,
                                end: ui.end
                            });
                            ngModelCtrl.$render();
                        }
                    }
                    else {
                        var newEnd = Math.round(valuesOnDragStart.end + delta);
                        if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= conf.nbWeeks) {
                            ngModelCtrl.$setViewValue({
                                start: ui.start,
                                end: newEnd
                            });
                            ngModelCtrl.$render();
                        }
                    }
                };
                scope.drag = function (d) {
                    var ui = ngModelCtrl.$viewValue;
                    var delta = pixelToVal(d);
                    var duration = valuesOnDragStart.end - valuesOnDragStart.start;
                    var newStart = Math.round(valuesOnDragStart.start + delta);
                    var newEnd = Math.round(newStart + duration);
                    if (ui.start !== newStart && newStart >= 0 && newEnd <= conf.nbWeeks) {
                        ngModelCtrl.$setViewValue({
                            start: newStart,
                            end: newEnd
                        });
                        ngModelCtrl.$render();
                    }
                };
            }
            // on init, merge overlaps
            mergeOverlaps();
            //// UI -> model ////////////////////////////////////
            ngModelCtrl.$parsers.push(function (ui) {
                ngModelCtrl.$modelValue.start = _this.timeService.addWeek(conf.minDate, ui.start).toDate();
                ngModelCtrl.$modelValue.end = _this.timeService.addWeek(conf.minDate, ui.end).toDate();
                //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
                schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
                return ngModelCtrl.$modelValue;
            });
            //// model -> UI ////////////////////////////////////
            ngModelCtrl.$formatters.push(function (model) {
                var ui = {
                    start: _this.timeService.weekPreciseDiff(conf.minDate, moment(model.start)),
                    end: _this.timeService.weekPreciseDiff(conf.minDate, moment(model.end))
                };
                //$log.debug('FORMATTER :', index, scope.$index, ui);
                return ui;
            });
            ngModelCtrl.$render = function () {
                var ui = ngModelCtrl.$viewValue;
                var css = {
                    left: ui.start / conf.nbWeeks * 100 + '%',
                    width: (ui.end - ui.start) / conf.nbWeeks * 100 + '%'
                };
                //$log.debug('RENDER :', index, scope.$index, css);
                element.css(css);
            };
            scope.$on('weeklySchedulerLocaleChanged', function () {
                // Simple change object reference so that ngModel triggers formatting & rendering
                scope.schedule = angular.copy(scope.schedule);
            });
        };
    }
    WeeklySlotDirective.Factory = function () {
        var directive = function (timeService) { return new WeeklySlotDirective(timeService); };
        directive.$inject = ['weeklySchedulerTimeService'];
        return directive;
    };
    WeeklySlotDirective.$name = 'weeklySlot';
    return WeeklySlotDirective;
}());
angular
    .module('weeklyScheduler')
    .directive(WeeklySlotDirective.$name, WeeklySlotDirective.Factory());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2luamVjdC9pbmplY3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sb2NhbGUvbG9jYWxlLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvdGltZS1zZXJ2aWNlcy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1ncmlkL3dlZWtseS1ncmlkLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztLQUUvRSxNQUFNLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxVQUFVLHFCQUFxQjtRQUM5RSxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFDOUIsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtZQUNwQixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQ3RFLHFCQUFxQixFQUFFLCtCQUErQjtTQUN2RCxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztL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QyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSB2YXIgbW9tZW50O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ25nQW5pbWF0ZScsICd3ZWVrbHlTY2hlZHVsZXInLCAnd2Vla2x5U2NoZWR1bGVySTE4TiddKVxyXG5cclxuICAuY29uZmlnKFsnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZVByb3ZpZGVyJywgZnVuY3Rpb24gKGxvY2FsZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgbG9jYWxlU2VydmljZVByb3ZpZGVyLmNvbmZpZ3VyZSh7XHJcbiAgICAgIGRveXM6IHsgJ2VzLWVzJzogNCB9LFxyXG4gICAgICBsYW5nOiB7ICdlcy1lcyc6IHsgd2Vla05iOiAnbsO6bWVybyBkZSBsYSBzZW1hbmEnLCBhZGROZXc6ICdBw7FhZGlyJyB9IH0sXHJcbiAgICAgIGxvY2FsZUxvY2F0aW9uUGF0dGVybjogJy9hbmd1bGFyLWxvY2FsZV97e2xvY2FsZX19LmpzJ1xyXG4gICAgfSk7XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgbG9jYWxlU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlU2VydmljZS4kbG9jYWxlLmlkLFxyXG4gICAgICAgIG9wdGlvbnM6IHsvKm1vbm9TY2hlZHVsZTogdHJ1ZSovIH0sXHJcbiAgICAgICAgaXRlbXM6IFt7XHJcbiAgICAgICAgICBsYWJlbDogJ0l0ZW0gMScsXHJcbiAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgeyBzdGFydDogbW9tZW50KCcyMDE1LTEyLTI3Jykuc3RhcnRPZignZGF5JykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE1LTEyLTI3JykuZW5kT2YoJ2RheScpLnRvRGF0ZSgpIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAyJyxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7IHN0YXJ0OiBtb21lbnQoJzIwMTUtMTItMjcnKS5zdGFydE9mKCdkYXknKS5hZGQoNSwgJ2hvdXJzJykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE1LTEyLTI3JykuZW5kT2YoJ2RheScpLmFkZCgtNSwgJ2hvdXJzJykudG9EYXRlKCkgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAzJyxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7IHN0YXJ0OiBtb21lbnQoJzIwMTUtMTItMjcnKS5zdGFydE9mKCdkYXknKS5hZGQoMiwgJ2hvdXJzJykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE1LTEyLTI3JykuZW5kT2YoJ2RheScpLmFkZCgtMiwgJ2hvdXJzJykudG9EYXRlKCkgfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1dXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLmRvU29tZXRoaW5nID0gZnVuY3Rpb24gKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSkge1xyXG4gICAgICAgICRsb2cuZGVidWcoJ1RoZSBtb2RlbCBoYXMgY2hhbmdlZCEnLCBpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5vbkxvY2FsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGlzIGNoYW5naW5nIHRvJywgJHNjb3BlLm1vZGVsLmxvY2FsZSk7XHJcbiAgICAgICAgbG9jYWxlU2VydmljZS5zZXQoJHNjb3BlLm1vZGVsLmxvY2FsZSkudGhlbihmdW5jdGlvbiAoJGxvY2FsZSkge1xyXG4gICAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBjaGFuZ2VkIHRvJywgJGxvY2FsZS5pZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG5cclxudmFyIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxudmFyIENMSUNLX09OX0FfQ0VMTCA9ICdjbGlja09uQUNlbGwnO1xyXG5cclxudmFyIGlzQ3RybDtcclxuXHJcbmZ1bmN0aW9uIGN0cmxDaGVjayhlKSB7XHJcbiAgaWYgKGUud2hpY2ggPT09IDE3KSB7XHJcbiAgICBpc0N0cmwgPSBlLnR5cGUgPT09ICdrZXlkb3duJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlU2Nyb2xsKGVsLCBkZWx0YSkge1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGN0cmxDaGVjayk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgY3RybENoZWNrKTtcclxuXHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGlmIChpc0N0cmwpIHtcclxuICAgICAgdmFyIHN0eWxlID0gZWwuZmlyc3RDaGlsZC5zdHlsZSwgY3VycmVudFdpZHRoID0gcGFyc2VJbnQoc3R5bGUud2lkdGgpO1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgoZS53aGVlbERlbHRhIHx8IGUuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gem9vbUluQUNlbGwoZWwsIGV2ZW50LCBkYXRhKSB7XHJcblxyXG4gIHZhciBuYkVsZW1lbnRzID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gIHZhciBpZHggPSBkYXRhLmlkeDtcclxuICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAvLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgdmFyIHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPSBkYXRhLnBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmc7XHJcblxyXG4gIHZhciBjb250YWluZXJXaWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG5cclxuICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gIHZhciBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICB2YXIgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBuYkVsZW1lbnRzICogYm94V2lkdGg7XHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICBlbC5maXJzdENoaWxkLnN0eWxlLndpZHRoID0gc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnO1xyXG5cclxuICBpZiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IGlkeCAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gU2l6ZXMgb2YgY2VsbHMgaW4gYSBsaW5lIGNvdWxkIGRpZmZlcmVudCAoZXNwZWNpYWxseSB0aGUgZmlyc3Qgb25lKVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gIH1cclxufVxyXG4iLCJjbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJz0nLFxyXG4gICAgb25kcmFnc3RvcDogJz0nLFxyXG4gICAgb25kcmFnc3RhcnQ6ICc9J1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RhcnQpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgdmFyIGRlbHRhID0gZXZlbnQucGFnZVggLSB4O1xyXG4gICAgICBpZiAoc2NvcGUub25kcmFnKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnKGRlbHRhKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChzY29wZS5vbmRyYWdzdG9wKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiY2xhc3MgSG91cmx5R3JpZERpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgICBzdGF0aWMgJG5hbWUgPSAnaG91cmx5R3JpZCc7XHJcblxyXG4gICAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgbmJIb3VycywgaWR4LCBzY29wZSkge1xyXG4gICAgICAgIC8vIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vICAgc2NvcGUuJGJyb2FkY2FzdChDTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAvLyAgICAgbmJFbGVtZW50czogbmJIb3VycyxcclxuICAgICAgICAvLyAgICAgaWR4OiBpZHhcclxuICAgICAgICAvLyAgIH0pO1xyXG4gICAgICAgIC8vIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbW9kZWwpIHtcclxuICAgICAgICB2YXIgaTtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgaG91ciB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgICB2YXIgdGlja2NvdW50ID0gbW9kZWwubmJIb3VycztcclxuICAgICAgICB2YXIgdGlja3NpemUgPSAxMDAgLyB0aWNrY291bnQ7XHJcbiAgICAgICAgdmFyIGdyaWRJdGVtRWwgPSBHUklEX1RFTVBMQVRFLmNzcyh7d2lkdGg6IHRpY2tzaXplICsgJyUnfSk7XHJcbiAgICAgICAgdmFyIG5vdyA9IG1vZGVsLm1pbkRhdGUuY2xvbmUoKS5zdGFydE9mKCd3ZWVrJyk7XHJcbiAgXHJcbiAgICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuICBcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcbiAgICAgICAgICAgIC8vY2hpbGQudGV4dChpICUgMTIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGluayA9IChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmw6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpID0+IHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLiRtb2RlbENoYW5nZUxpc3RlbmVycy5wdXNoKChuZXdNb2RlbCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld01vZGVsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlID0gKCkgPT4gbmV3IEhvdXJseUdyaWREaXJlY3RpdmUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgIH1cclxufVxyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAgIC5kaXJlY3RpdmUoSG91cmx5R3JpZERpcmVjdGl2ZS4kbmFtZSwgSG91cmx5R3JpZERpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJjbGFzcyBJbmplY3REaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdpbmplY3QnO1xyXG5cclxuICBsaW5rID0gKCRzY29wZTogYW5ndWxhci5JU2NvcGUsICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksICRhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcywgY29udHJvbGxlciwgJHRyYW5zY2x1ZGU6IGFuZ3VsYXIuSVRyYW5zY2x1ZGVGdW5jdGlvbikgPT4ge1xyXG4gICAgaWYgKCEkdHJhbnNjbHVkZSkge1xyXG4gICAgICB0aHJvdyAnSWxsZWdhbCB1c2Ugb2YgbmdUcmFuc2NsdWRlIGRpcmVjdGl2ZSBpbiB0aGUgdGVtcGxhdGUhIE5vIHBhcmVudCBkaXJlY3RpdmUgdGhhdCByZXF1aXJlcyBhIHRyYW5zY2x1c2lvbiBmb3VuZC4nO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbm5lclNjb3BlID0gJHNjb3BlLiRuZXcoKTtcclxuXHJcbiAgICAkdHJhbnNjbHVkZShpbm5lclNjb3BlLCBmdW5jdGlvbiAoY2xvbmUpIHtcclxuICAgICAgJGVsZW1lbnQuZW1wdHkoKTtcclxuICAgICAgJGVsZW1lbnQuYXBwZW5kKGNsb25lKTtcclxuICAgICAgJGVsZW1lbnQub24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlubmVyU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBJbmplY3REaXJlY3RpdmUoKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSW5qZWN0RGlyZWN0aXZlLiRuYW1lLCBJbmplY3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nLCBbJ3RtaC5keW5hbWljTG9jYWxlJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlckkxOE4nKVxyXG4gIC5wcm92aWRlcignd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZScsIFsndG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyJywgZnVuY3Rpb24gKHRtaER5bmFtaWNMb2NhbGVQcm92aWRlcikge1xyXG5cclxuICAgIHZhciBkZWZhdWx0Q29uZmlnOiBhbnkgLyogVE9ETyB0eXBlICovID0ge1xyXG4gICAgICBkb3lzOiB7J2RlLWRlJzogNCwgJ2VuLWdiJzogNCwgJ2VuLXVzJzogNiwgJ2ZyLWZyJzogNH0sXHJcbiAgICAgIGxhbmc6IHtcclxuICAgICAgICAnZGUtZGUnOiB7d2Vla05iOiAnV29jaGVudW1tZXInLCBhZGROZXc6ICdIaW56dWbDvGdlbid9LFxyXG4gICAgICAgICdlbi1nYic6IHt3ZWVrTmI6ICdXZWVrICMnLCBhZGROZXc6ICdBZGQnfSxcclxuICAgICAgICAnZW4tdXMnOiB7d2Vla05iOiAnV2VlayAjJywgYWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2ZyLWZyJzoge3dlZWtOYjogJ07CsCBkZSBzZW1haW5lJywgYWRkTmV3OiAnQWpvdXRlcid9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jb25maWd1cmUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XHJcblxyXG4gICAgICBpZiAoY29uZmlnICYmIGFuZ3VsYXIuaXNPYmplY3QoY29uZmlnKSkge1xyXG4gICAgICAgIGFuZ3VsYXIubWVyZ2UoZGVmYXVsdENvbmZpZywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgaWYgKGRlZmF1bHRDb25maWcubG9jYWxlTG9jYXRpb25QYXR0ZXJuKSB7XHJcbiAgICAgICAgICB0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIubG9jYWxlTG9jYXRpb25QYXR0ZXJuKGRlZmF1bHRDb25maWcubG9jYWxlTG9jYXRpb25QYXR0ZXJuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy4kZ2V0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhbGUnLCAndG1oRHluYW1pY0xvY2FsZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYWxlLCB0bWhEeW5hbWljTG9jYWxlKSB7XHJcblxyXG4gICAgICB2YXIgbW9tZW50TG9jYWxlQ2FjaGUgPSB7fTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldExhbmcoKSB7XHJcbiAgICAgICAgdmFyIGtleSA9ICRsb2NhbGUuaWQ7XHJcbiAgICAgICAgaWYgKCFtb21lbnRMb2NhbGVDYWNoZVtrZXldKSB7XHJcbiAgICAgICAgICBtb21lbnRMb2NhbGVDYWNoZVtrZXldID0gZ2V0TW9tZW50TG9jYWxlKGtleSk7XHJcbiAgICAgICAgICBtb21lbnQubG9jYWxlKG1vbWVudExvY2FsZUNhY2hlW2tleV0uaWQsIG1vbWVudExvY2FsZUNhY2hlW2tleV0ubG9jYWxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRDb25maWcubGFuZ1trZXldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXZSBqdXN0IG5lZWQgZmV3IG1vbWVudCBsb2NhbCBpbmZvcm1hdGlvblxyXG4gICAgICBmdW5jdGlvbiBnZXRNb21lbnRMb2NhbGUoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGlkOiBrZXksXHJcbiAgICAgICAgICBsb2NhbGU6IHtcclxuICAgICAgICAgICAgd2Vlazoge1xyXG4gICAgICAgICAgICAgIC8vIEFuZ3VsYXIgbW9uZGF5ID0gMCB3aGVyZWFzIE1vbWVudCBtb25kYXkgPSAxXHJcbiAgICAgICAgICAgICAgZG93OiAoJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkZJUlNUREFZT0ZXRUVLICsgMSkgJSA3LFxyXG4gICAgICAgICAgICAgIGRveTogZGVmYXVsdENvbmZpZy5kb3lzW2tleV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRyb290U2NvcGUuJG9uKCckbG9jYWxlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3dlZWtseVNjaGVkdWxlckxvY2FsZUNoYW5nZWQnLCBnZXRMYW5nKCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgJGxvY2FsZTogJGxvY2FsZSxcclxuICAgICAgICBnZXRMYW5nOiBnZXRMYW5nLFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRtaER5bmFtaWNMb2NhbGUuc2V0KGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfV07XHJcbiAgfV0pOyIsImNsYXNzIE11bHRpU2xpZGVyRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnbXVsdGlTbGlkZXInO1xyXG5cclxuICByZXN0cmljdCA9ICdFJztcclxuICByZXF1aXJlID0gJ153ZWVrbHlTY2hlZHVsZXInO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIuaHRtbCc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSB0aW1lU2VydmljZTogV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIHNjaGVkdWxlckN0cmwpID0+IHtcclxuICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgc2NoZWR1bGVyIGJsb2NrIHNpemUgd2hlbiBhZGRpbmcgYSBuZXcgaXRlbVxyXG4gICAgdmFyIGRlZmF1bHROZXdTY2hlZHVsZVNpemUgPSBwYXJzZUludChhdHRycy5zaXplKSB8fCA4O1xyXG5cclxuICAgIHZhciB2YWxUb1BpeGVsID0gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICB2YXIgcGVyY2VudCA9IHZhbCAvIChjb25mLm5iV2Vla3MpO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogZWxlbWVudFswXS5jbGllbnRXaWR0aCArIDAuNSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBwaXhlbFRvVmFsID0gZnVuY3Rpb24gKHBpeGVsKSB7XHJcbiAgICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyBlbGVtZW50WzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKGNvbmYubmJXZWVrcykgKyAwLjUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgYWRkU2xvdCA9IChzdGFydCwgZW5kKSA9PiB7XHJcbiAgICAgIHN0YXJ0ID0gc3RhcnQgPj0gMCA/IHN0YXJ0IDogMDtcclxuICAgICAgZW5kID0gZW5kIDw9IGNvbmYubmJXZWVrcyA/IGVuZCA6IGNvbmYubmJXZWVrcztcclxuXHJcbiAgICAgIHZhciBzdGFydERhdGUgPSB0aGlzLnRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCBzdGFydCk7XHJcbiAgICAgIHZhciBlbmREYXRlID0gdGhpcy50aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgZW5kKTtcclxuXHJcbiAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe3N0YXJ0OiBzdGFydERhdGUudG9EYXRlKCksIGVuZDogZW5kRGF0ZS50b0RhdGUoKX0pO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuICAgIHZhciBob3ZlckVsZW1lbnRXaWR0aCA9IHZhbFRvUGl4ZWwoZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSk7XHJcblxyXG4gICAgaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgIHdpZHRoOiBob3ZlckVsZW1lbnRXaWR0aCArICdweCdcclxuICAgIH0pO1xyXG5cclxuICAgIGVsZW1lbnQub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBlbE9mZlggPSBlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcblxyXG4gICAgICBob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiBlLnBhZ2VYIC0gZWxPZmZYIC0gaG92ZXJFbGVtZW50V2lkdGggLyAyICsgJ3B4J1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGhvdmVyRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKCFlbGVtZW50LmF0dHIoJ25vLWFkZCcpKSB7XHJcbiAgICAgICAgdmFyIGVsT2ZmWCA9IGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICB2YXIgcGl4ZWxPbkNsaWNrID0gZXZlbnQucGFnZVggLSBlbE9mZlg7XHJcbiAgICAgICAgdmFyIHZhbE9uQ2xpY2sgPSBwaXhlbFRvVmFsKHBpeGVsT25DbGljayk7XHJcblxyXG4gICAgICAgIHZhciBzdGFydCA9IE1hdGgucm91bmQodmFsT25DbGljayAtIGRlZmF1bHROZXdTY2hlZHVsZVNpemUgLyAyKTtcclxuICAgICAgICB2YXIgZW5kID0gc3RhcnQgKyBkZWZhdWx0TmV3U2NoZWR1bGVTaXplO1xyXG5cclxuICAgICAgICBhZGRTbG90KHN0YXJ0LCBlbmQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICh0aW1lU2VydmljZSkgPT4gbmV3IE11bHRpU2xpZGVyRGlyZWN0aXZlKHRpbWVTZXJ2aWNlKTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFtcclxuICAgICAgJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShNdWx0aVNsaWRlckRpcmVjdGl2ZS4kbmFtZSwgTXVsdGlTbGlkZXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiY2xhc3MgV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2Uge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZSc7XHJcblxyXG4gIHByaXZhdGUgV0VFSyA9ICd3ZWVrJztcclxuXHJcbiAgcHVibGljIGFkZFdlZWsobW9tZW50LCBuYldlZWspIHtcclxuICAgIHJldHVybiBtb21lbnQuY2xvbmUoKS5hZGQobmJXZWVrLCB0aGlzLldFRUspO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbXBhcmUoZGF0ZSwgbWV0aG9kLCBsYXN0TWluKSB7XHJcbiAgICBpZiAoZGF0ZSkge1xyXG4gICAgICB2YXIgZGF0ZUFzTW9tZW50O1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICBkYXRlQXNNb21lbnQgPSBtb21lbnQoZGF0ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGF0ZS5faXNBTW9tZW50T2JqZWN0KSB7XHJcbiAgICAgICAgZGF0ZUFzTW9tZW50ID0gZGF0ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyAnQ291bGQgbm90IHBhcnNlIGRhdGUgWycgKyBkYXRlICsgJ10nO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBkYXRlQXNNb21lbnRbbWV0aG9kXShsYXN0TWluKSA/IGRhdGVBc01vbWVudCA6IGxhc3RNaW47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgd2Vla1ByZWNpc2VEaWZmKHN0YXJ0LCBlbmQpIHtcclxuICAgIHJldHVybiBlbmQuY2xvbmUoKS5kaWZmKHN0YXJ0LmNsb25lKCksIHRoaXMuV0VFSywgdHJ1ZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuc2VydmljZShXZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZS4kbmFtZSwgV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UpO1xyXG4iLCIvKiBnbG9iYWwgR1JJRF9URU1QTEFURSAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKCd3ZWVrbHlHcmlkJywgW2Z1bmN0aW9uICgpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCBuYldlZWtzLCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNjb3BlLiRicm9hZGNhc3QoQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICBuYkVsZW1lbnRzOiBuYldlZWtzLFxyXG4gICAgICAgICAgaWR4OiBpZHhcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbW9kZWwpIHtcclxuICAgICAgdmFyIGk7XHJcbiAgICAgIC8vIENhbGN1bGF0ZSB3ZWVrIHdpZHRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICB2YXIgdGlja2NvdW50ID0gbW9kZWwubmJXZWVrcztcclxuICAgICAgdmFyIHRpY2tzaXplID0gMTAwIC8gdGlja2NvdW50O1xyXG4gICAgICB2YXIgZ3JpZEl0ZW1FbCA9IEdSSURfVEVNUExBVEUuY3NzKHt3aWR0aDogdGlja3NpemUgKyAnJSd9KTtcclxuICAgICAgdmFyIG5vdyA9IG1vZGVsLm1pbkRhdGUuY2xvbmUoKS5zdGFydE9mKCd3ZWVrJyk7XHJcblxyXG4gICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aWNrY291bnQ7IGkrKykge1xyXG4gICAgICAgIHZhciBjaGlsZCA9IGdyaWRJdGVtRWwuY2xvbmUoKTtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5ub1RleHQpKSB7XHJcbiAgICAgICAgICBoYW5kbGVDbGlja0V2ZW50KGNoaWxkLCB0aWNrY291bnQsIGksIHNjb3BlKTtcclxuICAgICAgICAgIGNoaWxkLnRleHQobm93LmFkZChpICYmIDEsICd3ZWVrJykud2VlaygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgIHJlcXVpcmU6ICded2Vla2x5U2NoZWR1bGVyJyxcclxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLiRtb2RlbENoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uIChuZXdNb2RlbCkge1xyXG4gICAgICAgICAgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmV3TW9kZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuIiwiY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGluamVjdG9yJyxcclxuICAgICckbG9nJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuYXV0by5JSW5qZWN0b3JTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkbG9nOiBhbmd1bGFyLklMb2dTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29uZmlnOiBhbnk7IC8qIFRPRE8gdHlwZSAqL1xyXG4gIHB1YmxpYyBpdGVtczogYW55W107IC8qIFRPRE8gdHlwZSAqL1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IGFueSAvKiBUT0RPIHR5cGUgKi8gPSB7XHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgc2VsZWN0b3I6ICcuc2NoZWR1bGUtYXJlYS1jb250YWluZXInXHJcbiAgfTtcclxuXHJcbiAgcHVibGljIG9uOiB7XHJcbiAgICBjaGFuZ2U6IChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpID0+IEZ1bmN0aW9uO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyAkbW9kZWxDaGFuZ2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW107IC8qIFRPRE8gdHlwZSAqL1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgaTE4biBzZXJ2aWNlXHJcbiAgICB2YXIgbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJztcclxuXHJcbiAgICBpZiAodGhpcy4kaW5qZWN0b3IuaGFzKG5hbWUpKSB7XHJcbiAgICAgIHRoaXMuJGxvZy5pbmZvKCdUaGUgSTE4TiBzZXJ2aWNlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBpbml0aWFsaXplZCEnKTtcclxuXHJcbiAgICAgIHZhciBsb2NhbGVTZXJ2aWNlOiBhbnkgPSB0aGlzLiRpbmplY3Rvci5nZXQobmFtZSk7IC8qIFRPRE8gdHlwZSAqL1xyXG4gICAgICB0aGlzLmRlZmF1bHRPcHRpb25zLmxhYmVscyA9IGxvY2FsZVNlcnZpY2UuZ2V0TGFuZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kbG9nLmluZm8oJ05vIEkxOE4gZm91bmQgZm9yIHRoaXMgbW9kdWxlLCBjaGVjayB0aGUgbmcgbW9kdWxlIFt3ZWVrbHlTY2hlZHVsZXJJMThOXSBpZiB5b3UgbmVlZCBpMThuLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkbG9nOiBhbmd1bGFyLklMb2dTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSxcclxuICAgIHByaXZhdGUgdGltZVNlcnZpY2U6IFdlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICByZXN0cmljdCA9ICdFJztcclxuICByZXF1aXJlID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgdmFyIG9wdGlvbnNGbiA9IHRoaXMuJHBhcnNlKGF0dHJzLm9wdGlvbnMpLFxyXG4gICAgICBvcHRpb25zID0gYW5ndWxhci5leHRlbmQoc2NoZWR1bGVyQ3RybC5kZWZhdWx0T3B0aW9ucywgb3B0aW9uc0ZuKHNjb3BlKSB8fCB7fSk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBzY2hlZHVsZSBjb250YWluZXIgZWxlbWVudFxyXG4gICAgdmFyIGVsID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKHNjaGVkdWxlckN0cmwuZGVmYXVsdE9wdGlvbnMuc2VsZWN0b3IpO1xyXG4gICAgdmFyIHNlbGY6IFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSA9IHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gb25Nb2RlbENoYW5nZShpdGVtcykge1xyXG4gICAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAgICAgLy8gRmlyc3QgY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZyA9IHNlbGYuY29uZmlnKGl0ZW1zLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGggP1xyXG4gICAgICAgICAgICAvLyBJZiBpbiBtdWx0aVNsaWRlciBtb2RlLCBlbnN1cmUgYSBzY2hlZHVsZSBhcnJheSBpcyBwcmVzZW50IG9uIGVhY2ggaXRlbVxyXG4gICAgICAgICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgICAgICAgKG9wdGlvbnMubW9ub1NjaGVkdWxlID8gaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXSA6IHNjaGVkdWxlcykgOlxyXG4gICAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0sIFtdKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcclxuICAgICAgICAgIGxpc3RlbmVyKHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbCkge1xyXG4gICAgICAvLyBJbnN0YWxsIG1vdXNlIHNjcm9sbGluZyBldmVudCBsaXN0ZW5lciBmb3IgSCBzY3JvbGxpbmdcclxuICAgICAgbW91c2VTY3JvbGwoZWwsIDIwKTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbihDTElDS19PTl9BX0NFTEwsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgem9vbUluQUNlbGwoZWwsIGUsIGRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjaGVkdWxlckN0cmwub24gPSB7XHJcbiAgICAgICAgY2hhbmdlOiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgb25DaGFuZ2VGdW5jdGlvbiA9IHRoaXMuJHBhcnNlKGF0dHJzLm9uQ2hhbmdlKShzY29wZSk7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKG9uQ2hhbmdlRnVuY3Rpb24pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvbkNoYW5nZUZ1bmN0aW9uKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICAgKi9cclxuICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbihhdHRycy5pdGVtcywgb25Nb2RlbENoYW5nZSk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTGlzdGVuIHRvICRsb2NhbGUgY2hhbmdlIChicm91Z2h0IGJ5IGV4dGVybmFsIG1vZHVsZSB3ZWVrbHlTY2hlZHVsZXJJMThOKVxyXG4gICAgICAgKi9cclxuICAgICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKGUsIGxhYmVscykge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgc2NoZWR1bGVyQ3RybC5jb25maWcubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvbk1vZGVsQ2hhbmdlKGFuZ3VsYXIuY29weSh0aGlzLiRwYXJzZShhdHRycy5pdGVtcykoc2NvcGUpLCBbXSkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqIEBwYXJhbSBzY2hlZHVsZXNcclxuICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAqIEByZXR1cm5zIHt7bWluRGF0ZTogKiwgbWF4RGF0ZTogKiwgbmJXZWVrczogKn19XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWcoc2NoZWR1bGVzOiBhbnlbXSwgb3B0aW9ucykge1xyXG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBtaW4gZGF0ZSBvZiBhbGwgc2NoZWR1bGVkIGV2ZW50c1xyXG4gICAgdmFyIG1pbkRhdGUgPSAoc2NoZWR1bGVzID8gc2NoZWR1bGVzLnJlZHVjZSgobWluRGF0ZSwgc2xvdCkgPT4ge1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lU2VydmljZS5jb21wYXJlKHNsb3Quc3RhcnQsICdpc0JlZm9yZScsIG1pbkRhdGUpO1xyXG4gICAgfSwgbm93KSA6IG5vdykuc3RhcnRPZignd2VlaycpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBtYXggZGF0ZSBvZiBhbGwgc2NoZWR1bGVkIGV2ZW50c1xyXG4gICAgdmFyIG1heERhdGUgPSAoc2NoZWR1bGVzID8gc2NoZWR1bGVzLnJlZHVjZSgobWF4RGF0ZSwgc2xvdCkgPT4ge1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lU2VydmljZS5jb21wYXJlKHNsb3QuZW5kLCAnaXNBZnRlcicsIG1heERhdGUpO1xyXG4gICAgfSwgbWluRGF0ZSkgOiBub3cpLmNsb25lKCkuYWRkKDEsICdkYXknKS5lbmRPZignZGF5Jyk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIG5iIG9mIHdlZWtzIGNvdmVyZWQgYnkgbWluRGF0ZSA9PiBtYXhEYXRlXHJcbiAgICB2YXIgbmJXZWVrcyA9IDE7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKG9wdGlvbnMsIHsgbWluRGF0ZTogbWluRGF0ZSwgbWF4RGF0ZTogbWF4RGF0ZSwgbmJXZWVrczogbmJXZWVrcywgbmJIb3VyczogbmJXZWVrcyAqIDE2OCB9KTtcclxuICAgIC8vIExvZyBjb25maWd1cmF0aW9uXHJcbiAgICB0aGlzLiRsb2cuZGVidWcoJ1dlZWtseSBTY2hlZHVsZXIgY29uZmlndXJhdGlvbjonLCByZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGxvZywgJHBhcnNlLCB0aW1lU2VydmljZSkgPT4gbmV3IFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSgkbG9nLCAkcGFyc2UsIHRpbWVTZXJ2aWNlKTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFtcclxuICAgICAgJyRsb2cnLFxyXG4gICAgICAnJHBhcnNlJyxcclxuICAgICAgJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuLyogZ2xvYmFsIG1vdXNlU2Nyb2xsLCBDTElDS19PTl9BX0NFTEwsIHpvb21JbkFDZWxsICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmRpcmVjdGl2ZShXZWVrbHlTY2hlZHVsZXJEaXJlY3RpdmUuJG5hbWUsIFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJjbGFzcyBXZWVrbHlTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdCc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSB0aW1lU2VydmljZTogV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHJlc3RyaWN0ID0gJ0UnO1xyXG4gIHJlcXVpcmUgPSBbJ153ZWVrbHlTY2hlZHVsZXInLCAnbmdNb2RlbCddO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGN0cmxzKSA9PiB7XHJcbiAgICB2YXIgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciA9IGN0cmxzWzBdLFxyXG4gICAgICAgIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IGN0cmxzWzFdO1xyXG5cclxuICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcbiAgICB2YXIgaW5kZXggPSBzY29wZS4kcGFyZW50LiRpbmRleDtcclxuICAgIHZhciBjb250YWluZXJFbCA9IGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICB2YXIgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB2YXIgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IHNjb3BlLnNjaGVkdWxlLnN0YXJ0LCBlbmQ6IHNjb3BlLnNjaGVkdWxlLmVuZH07XHJcblxyXG4gICAgdmFyIHBpeGVsVG9WYWwgPSBmdW5jdGlvbiAocGl4ZWwpIHtcclxuICAgICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogY29uZi5uYldlZWtzICsgMC41KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1lcmdlT3ZlcmxhcHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBzY2hlZHVsZSA9IHNjb3BlLnNjaGVkdWxlO1xyXG4gICAgICB2YXIgc2NoZWR1bGVzID0gc2NvcGUuaXRlbS5zY2hlZHVsZXM7XHJcbiAgICAgIHNjaGVkdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICAgIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuZW5kICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgc2NoZWR1bGUuZW5kID0gZWwuZW5kO1xyXG4gICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgICBlbHNlIGlmIChzY2hlZHVsZS5lbmQgPj0gZWwuZW5kICYmIHNjaGVkdWxlLnN0YXJ0IDw9IGVsLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgICAgZWxzZSBpZiAoZWwuZW5kID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLmVuZCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICAgIGVsc2UgaWYgKGVsLnN0YXJ0ID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLmVuZCA9IGVsLmVuZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZSBvbiByaWdodCBjbGljayBvbiBzbG90XHJcbiAgICAgKi9cclxuICAgIHZhciBkZWxldGVTZWxmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgICAgc2NvcGUuaXRlbS5zY2hlZHVsZXMuc3BsaWNlKHNjb3BlLml0ZW0uc2NoZWR1bGVzLmluZGV4T2Yoc2NvcGUuc2NoZWR1bGUpLCAxKTtcclxuICAgICAgY29udGFpbmVyRWwuZmluZCgnd2Vla2x5LXNsb3QnKS5yZW1vdmUoKTtcclxuICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVsZW1lbnQuZmluZCgnc3BhbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGVsZXRlU2VsZigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb250YWluZXJFbC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBpZiAoc2NvcGUuaXRlbS5lZGl0YWJsZSAhPT0gZmFsc2UpIHtcclxuICAgICAgc2NvcGUuc3RhcnRSZXNpemVTdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0UmVzaXplRW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgY29udGFpbmVyRWwuYXR0cignbm8tYWRkJywgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUuc3RhcnQsIGVuZDogbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZS5lbmR9O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuZW5kRHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICAgICAgbWVyZ2VPdmVybGFwcygpO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUucmVzaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcblxyXG4gICAgICAgIGlmIChyZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgbmV3RW5kID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IGNvbmYubmJXZWVrcykge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzY29wZS5kcmFnID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gdmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IE1hdGgucm91bmQodmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICAgICAgdmFyIG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gY29uZi5uYldlZWtzKSB7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9uIGluaXQsIG1lcmdlIG92ZXJsYXBzXHJcbiAgICBtZXJnZU92ZXJsYXBzKCk7XHJcblxyXG4gICAgLy8vLyBVSSAtPiBtb2RlbCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIG5nTW9kZWxDdHJsLiRwYXJzZXJzLnB1c2goKHVpKSA9PiB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLnN0YXJ0ID0gdGhpcy50aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgdWkuc3RhcnQpLnRvRGF0ZSgpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5lbmQgPSB0aGlzLnRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCB1aS5lbmQpLnRvRGF0ZSgpO1xyXG4gICAgICAvLyRsb2cuZGVidWcoJ1BBUlNFUiA6JywgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuJCRoYXNoS2V5LCBpbmRleCwgc2NvcGUuJGluZGV4LCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSk7XHJcbiAgICAgIHNjaGVkdWxlckN0cmwub24uY2hhbmdlKGluZGV4LCBzY29wZS4kaW5kZXgsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKTtcclxuICAgICAgcmV0dXJuIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8vLyBtb2RlbCAtPiBVSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goKG1vZGVsKSA9PiB7XHJcbiAgICAgIHZhciB1aSA9IHtcclxuICAgICAgICBzdGFydDogdGhpcy50aW1lU2VydmljZS53ZWVrUHJlY2lzZURpZmYoY29uZi5taW5EYXRlLCBtb21lbnQobW9kZWwuc3RhcnQpKSxcclxuICAgICAgICBlbmQ6IHRoaXMudGltZVNlcnZpY2Uud2Vla1ByZWNpc2VEaWZmKGNvbmYubWluRGF0ZSwgbW9tZW50KG1vZGVsLmVuZCkpXHJcbiAgICAgIH07XHJcbiAgICAgIC8vJGxvZy5kZWJ1ZygnRk9STUFUVEVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCB1aSk7XHJcbiAgICAgIHJldHVybiB1aTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB1aSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgIHZhciBjc3MgPSB7XHJcbiAgICAgICAgbGVmdDogdWkuc3RhcnQgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJScsXHJcbiAgICAgICAgd2lkdGg6ICh1aS5lbmQgLSB1aS5zdGFydCkgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJSdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vJGxvZy5kZWJ1ZygnUkVOREVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCBjc3MpO1xyXG4gICAgICBlbGVtZW50LmNzcyhjc3MpO1xyXG4gICAgfTtcclxuXHJcbiAgICBzY29wZS4kb24oJ3dlZWtseVNjaGVkdWxlckxvY2FsZUNoYW5nZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIFNpbXBsZSBjaGFuZ2Ugb2JqZWN0IHJlZmVyZW5jZSBzbyB0aGF0IG5nTW9kZWwgdHJpZ2dlcnMgZm9ybWF0dGluZyAmIHJlbmRlcmluZ1xyXG4gICAgICBzY29wZS5zY2hlZHVsZSA9IGFuZ3VsYXIuY29weShzY29wZS5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICh0aW1lU2VydmljZSkgPT4gbmV3IFdlZWtseVNsb3REaXJlY3RpdmUodGltZVNlcnZpY2UpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZSddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKFdlZWtseVNsb3REaXJlY3RpdmUuJG5hbWUsIFdlZWtseVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default navbar-fixed-top"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"><div class="srow">{{::$index + 1}}. {{item.label}}</div></weekly-scheduler><div class="pull-right"><button class="btn btn-success" role="button" ng-click="model.items.push({label: \'New Item\'})">Add new item</button></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right"></div><div class="schedule-animate" ng-repeat="item in schedulerCtrl.items" inject></div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><hourly-grid class="grid-container"></hourly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid class="grid-container striped" no-text></hourly-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);