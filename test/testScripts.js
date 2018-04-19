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
        child.bind('click', function () {
            scope.$broadcast(CLICK_ON_A_CELL, {
                nbElements: nbHours,
                idx: idx
            });
        });
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
                var percent = val / (conf.nbHours);
                return Math.floor(percent * element[0].clientWidth + 0.5);
            };
            var pixelToVal = function (pixel) {
                var percent = pixel / element[0].clientWidth;
                return Math.floor(percent * (conf.nbHours) + 0.5);
            };
            var addSlot = function (start, end) {
                start = start >= 0 ? start : 0;
                end = end <= conf.nbHours ? end : conf.nbHours;
                var startDate = _this.timeService.addHour(conf.minDate, start);
                var endDate = _this.timeService.addHour(conf.minDate, end);
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
    WeeklySchedulerTimeService.prototype.addHour = function (moment, nbHour) {
        return moment.clone().add(nbHour, 'hour');
    };
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
     * @returns {{minDate: *, nbWeeks: *}}
     */
    WeeklySchedulerDirective.prototype.config = function (schedules, options) {
        var _this = this;
        var now = moment();
        // Calculate min date of all scheduled events
        var minDate = (schedules ? schedules.reduce(function (minDate, slot) {
            return _this.timeService.compare(slot.start, 'isBefore', minDate);
        }, now) : now).startOf('week');
        var result = angular.extend(options, { minDate: minDate, nbWeeks: 1, nbHours: 168 });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9ob3VybHktZ3JpZC9ob3VybHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2luamVjdC9pbmplY3QudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9sb2NhbGUvbG9jYWxlLXNlcnZpY2UudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3RpbWUvdGltZS1zZXJ2aWNlcy50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FFL0UsTUFBTSxDQUFDLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxxQkFBcUI7UUFDOUUscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBQzlCLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDcEIsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUN0RSxxQkFBcUIsRUFBRSwrQkFBK0I7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7S0FFRixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLDhCQUE4QixFQUFFLE1BQU07SUFDekYsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJO1FBRTdDLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixNQUFNLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxFQUFDLHNCQUFzQixDQUFFO1lBQ2xDLEtBQUssRUFBRSxDQUFDO29CQUNOLEtBQUssRUFBRSxRQUFRO29CQUNmLFFBQVEsRUFBRSxLQUFLO29CQUNmLFNBQVMsRUFBRTt3QkFDVCxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3FCQUN6RztpQkFDRjtnQkFDRDtvQkFDRSxLQUFLLEVBQUUsUUFBUTtvQkFDZixTQUFTLEVBQUU7d0JBQ1QsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtxQkFDMUk7aUJBQ0YsRUFBRTtvQkFDRCxLQUFLLEVBQUUsUUFBUTtvQkFDZixTQUFTLEVBQUU7d0JBQ1QsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtxQkFDMUk7aUJBQ0YsQ0FBQztTQUNILENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhO1lBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsY0FBYyxHQUFHO1lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsT0FBTztnQkFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0FDaERSLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7QUFFbEUsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3JFLElBQUksZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUVyQyxJQUFJLE1BQU0sQ0FBQztBQUVYLG1CQUFtQixDQUFDO0lBQ2xCLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7UUFDbEIsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0tBQy9CO0FBQ0gsQ0FBQztBQUVELHFCQUFxQixFQUFFLEVBQUUsS0FBSztJQUU1QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFNUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUM7UUFDM0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVwQixJQUFJLE1BQU0sRUFBRTtZQUNWLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUNoRDtpQkFBTTtnQkFDTCxJQUFJLEtBQUssR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDckMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQ2pEO1NBQ0Y7YUFBTTtZQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLEVBQUUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNMLEVBQUUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO2FBQ3hCO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELHFCQUFxQixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUk7SUFFbEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUNqQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ25CLG1GQUFtRjtJQUNuRiwwREFBMEQ7SUFDMUQsMkJBQTJCO0lBQzNCLHFDQUFxQztJQUNyQyxJQUFJLHlCQUF5QixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztJQUUvRCxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO0lBRXBDLHdCQUF3QjtJQUN4Qix1QkFBdUI7SUFDdkIsSUFBSSxRQUFRLEdBQUcsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLElBQUksVUFBVSxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFOUIsSUFBSSxtQkFBbUIsR0FBRyxVQUFVLEdBQUcsUUFBUSxDQUFDO0lBQ2hELElBQUksd0JBQXdCLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUMsR0FBRyxHQUFHLENBQUM7SUFFNUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztJQUUzRCxJQUFJLHlCQUF5QixLQUFLLFNBQVMsRUFBRTtRQUMzQyx5Q0FBeUM7UUFDekMsRUFBRSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQztLQUM3QztTQUFNO1FBQ0wsc0VBQXNFO1FBQ3RFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7S0FDdEY7QUFDSCxDQUFDO0FDdEVEO0lBNkNFLHlCQUNVLFNBQW1DO1FBRDdDLGlCQUdDO1FBRlMsY0FBUyxHQUFULFNBQVMsQ0FBMEI7UUE1QzdDLGFBQVEsR0FBRyxHQUFHLENBQUM7UUFFZixVQUFLLEdBQUc7WUFDTixNQUFNLEVBQUUsR0FBRztZQUNYLFVBQVUsRUFBRSxHQUFHO1lBQ2YsV0FBVyxFQUFFLEdBQUc7U0FDakIsQ0FBQztRQUVGLFNBQUksR0FBRyxVQUFDLEtBQUssRUFBRSxPQUFpQztZQUM5QyxJQUFJLFNBQVMsR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDO1lBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVWLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsS0FBSztnQkFDNUIsK0NBQStDO2dCQUMvQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXZCLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUVoQixTQUFTLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDckMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRWpDLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtvQkFDckIsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUNyQjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsbUJBQW1CLEtBQUs7Z0JBQ3RCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7b0JBQ2hCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3JCO1lBQ0gsQ0FBQztZQUVEO2dCQUNFLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFckMsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO29CQUNwQixLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7aUJBQ3BCO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUtELENBQUM7SUFFTSx1QkFBTyxHQUFkO1FBQ0UsSUFBSSxTQUFTLEdBQUcsVUFBQyxTQUFTLElBQUssT0FBQSxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQztRQUU5RCxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbEMsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQXZETSxxQkFBSyxHQUFHLFFBQVEsQ0FBQztJQXdEMUIsc0JBQUM7Q0F6REQsQUF5REMsSUFBQTtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDOUIsU0FBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUM1RC9EO0lBQUE7UUFBQSxpQkFxREM7UUFsREcsYUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNmLFlBQU8sR0FBRyxrQkFBa0IsQ0FBQztRQWtDN0IsU0FBSSxHQUFHLFVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBd0M7WUFDbkUsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO2dCQUN0QixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1RDtZQUVELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO2dCQUM5QyxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFBO0lBT0wsQ0FBQztJQS9DVyw4Q0FBZ0IsR0FBeEIsVUFBeUIsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSztRQUMvQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNsQixLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRTtnQkFDaEMsVUFBVSxFQUFFLE9BQU87Z0JBQ25CLEdBQUcsRUFBRSxHQUFHO2FBQ1QsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sb0NBQU0sR0FBZCxVQUFlLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDdkMsSUFBSSxDQUFDLENBQUM7UUFDTixvQ0FBb0M7UUFDcEMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLFFBQVEsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDO1FBQy9CLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxHQUFHLEdBQUcsRUFBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFaEQsZ0JBQWdCO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVoQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0IsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxxQkFBcUI7YUFDdEI7WUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQztJQVlNLDJCQUFPLEdBQWQ7UUFDSSxJQUFJLFNBQVMsR0FBRyxjQUFNLE9BQUEsSUFBSSxtQkFBbUIsRUFBRSxFQUF6QixDQUF5QixDQUFDO1FBRWhELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFuRE0seUJBQUssR0FBRyxZQUFZLENBQUM7SUFvRGhDLDBCQUFDO0NBckRELEFBcURDLElBQUE7QUFFRCxPQUFPO0tBQ0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQ3pEekU7SUFBQTtRQUdFLFNBQUksR0FBRyxVQUFDLE1BQXNCLEVBQUUsUUFBa0MsRUFBRSxNQUEyQixFQUFFLFVBQVUsRUFBRSxXQUF3QztZQUNuSixJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixNQUFNLGdIQUFnSCxDQUFDO2FBQ3hIO1lBRUQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRS9CLFdBQVcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxLQUFLO2dCQUNyQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZCLFFBQVEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFO29CQUN0QixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUE7SUFPSCxDQUFDO0lBTFEsdUJBQU8sR0FBZDtRQUNFLElBQUksU0FBUyxHQUFHLGNBQU0sT0FBQSxJQUFJLGVBQWUsRUFBRSxFQUFyQixDQUFxQixDQUFDO1FBRTVDLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUF0Qk0scUJBQUssR0FBRyxRQUFRLENBQUM7SUF1QjFCLHNCQUFDO0NBeEJELEFBd0JDLElBQUE7QUFFRCxPQUFPO0tBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQ3pCLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FDNUIvRCxPQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBRTdELE9BQU8sQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7S0FDbEMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLENBQUMsMEJBQTBCLEVBQUUsVUFBVSx3QkFBd0I7UUFFdkcsSUFBSSxhQUFhLEdBQXdCO1lBQ3ZDLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUM7WUFDdEQsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBQztnQkFDdEQsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO2dCQUMxQyxPQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7Z0JBQzFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBQzthQUN0RDtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsTUFBTTtZQUUvQixJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFckMsSUFBSSxhQUFhLENBQUMscUJBQXFCLEVBQUU7b0JBQ3ZDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUNyRjthQUNGO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxVQUFVLEVBQUUsT0FBTyxFQUFFLGdCQUFnQjtnQkFFdkcsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7Z0JBRTNCO29CQUNFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDM0IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDekU7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDMUM7b0JBQ0QsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2dCQUVELDRDQUE0QztnQkFDNUMseUJBQXlCLEdBQUc7b0JBQzFCLE9BQU87d0JBQ0wsRUFBRSxFQUFFLEdBQUc7d0JBQ1AsTUFBTSxFQUFFOzRCQUNOLElBQUksRUFBRTtnQ0FDSiwrQ0FBK0M7Z0NBQy9DLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQ0FDdEQsR0FBRyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDOzZCQUM3Qjt5QkFDRjtxQkFDRixDQUFDO2dCQUNKLENBQUM7Z0JBRUQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRTtvQkFDckMsVUFBVSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPO29CQUNMLE9BQU8sRUFBRSxPQUFPO29CQUNoQixPQUFPLEVBQUUsT0FBTztvQkFDaEIsR0FBRyxFQUFFLFVBQVUsR0FBRzt3QkFDaEIsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25DLENBQUM7aUJBQ0YsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQ25FTjtJQU9FLDhCQUNVLFdBQXVDO1FBRGpELGlCQUdDO1FBRlMsZ0JBQVcsR0FBWCxXQUFXLENBQTRCO1FBTGpELGFBQVEsR0FBRyxHQUFHLENBQUM7UUFDZixZQUFPLEdBQUcsa0JBQWtCLENBQUM7UUFDN0IsZ0JBQVcsR0FBRyxrREFBa0QsQ0FBQztRQU9qRSxTQUFJLEdBQUcsVUFBQyxLQUFLLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUFFLGFBQWE7WUFDekYsSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUVoQywwREFBMEQ7WUFDMUQsSUFBSSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2RCxJQUFJLFVBQVUsR0FBRyxVQUFVLEdBQUc7Z0JBQzVCLElBQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzVELENBQUMsQ0FBQztZQUVGLElBQUksVUFBVSxHQUFHLFVBQVUsS0FBSztnQkFDOUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBQzdDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDcEQsQ0FBQyxDQUFDO1lBRUYsSUFBSSxPQUFPLEdBQUcsVUFBQyxLQUFLLEVBQUUsR0FBRztnQkFDdkIsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFFL0MsSUFBSSxTQUFTLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxPQUFPLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFMUQsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFDWCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7cUJBQ3JCO29CQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFDLENBQUMsQ0FBQztnQkFDMUUsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUM7WUFFRixJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxJQUFJLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRTNELFlBQVksQ0FBQyxHQUFHLENBQUM7Z0JBQ2YsS0FBSyxFQUFFLGlCQUFpQixHQUFHLElBQUk7YUFDaEMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO2dCQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBRXJELFlBQVksQ0FBQyxHQUFHLENBQUM7b0JBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxHQUFHLGlCQUFpQixHQUFHLENBQUMsR0FBRyxJQUFJO2lCQUN0RCxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSztnQkFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzNCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQztvQkFDckQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7b0JBQ3hDLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxzQkFBc0IsQ0FBQztvQkFFekMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDckI7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQTtJQTdERCxDQUFDO0lBK0RNLDRCQUFPLEdBQWQ7UUFDRSxJQUFJLFNBQVMsR0FBRyxVQUFDLFdBQVcsSUFBSyxPQUFBLElBQUksb0JBQW9CLENBQUMsV0FBVyxDQUFDLEVBQXJDLENBQXFDLENBQUM7UUFFdkUsU0FBUyxDQUFDLE9BQU8sR0FBRztZQUNsQiw0QkFBNEI7U0FDN0IsQ0FBQztRQUVGLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFoRk0sMEJBQUssR0FBRyxhQUFhLENBQUM7SUFpRi9CLDJCQUFDO0NBbEZELEFBa0ZDLElBQUE7QUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQzlCLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQ3JGekU7SUFBQTtRQUdVLFNBQUksR0FBRyxNQUFNLENBQUM7SUEyQnhCLENBQUM7SUF6QlEsNENBQU8sR0FBZCxVQUFlLE1BQU0sRUFBRSxNQUFNO1FBQzNCLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLDRDQUFPLEdBQWQsVUFBZSxNQUFNLEVBQUUsTUFBTTtRQUMzQixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU0sNENBQU8sR0FBZCxVQUFlLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTztRQUNsQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksWUFBWSxDQUFDO1lBQ2pCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEIsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3QjtpQkFBTSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDaEMsWUFBWSxHQUFHLElBQUksQ0FBQzthQUNyQjtpQkFBTTtnQkFDTCxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7YUFDN0M7WUFDRCxPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDL0Q7SUFDSCxDQUFDO0lBRU0sb0RBQWUsR0FBdEIsVUFBdUIsS0FBSyxFQUFFLEdBQUc7UUFDL0IsT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUE1Qk0sZ0NBQUssR0FBRyw0QkFBNEIsQ0FBQztJQTZCOUMsaUNBQUM7Q0E5QkQsQUE4QkMsSUFBQTtBQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FDOUIsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0FDakN6RTtJQVNFLG1DQUNVLFNBQXdDLEVBQ3hDLElBQXlCO1FBRHpCLGNBQVMsR0FBVCxTQUFTLENBQStCO1FBQ3hDLFNBQUksR0FBSixJQUFJLENBQXFCO1FBTzVCLG1CQUFjLEdBQXdCO1lBQzNDLFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSwwQkFBMEI7U0FDckMsQ0FBQztJQVJGLENBQUM7SUFnQkQsMkNBQU8sR0FBUDtRQUNFLDhCQUE4QjtRQUM5QixJQUFJLElBQUksR0FBRyw4QkFBOEIsQ0FBQztRQUUxQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7WUFFdEUsSUFBSSxhQUFhLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlO1lBQ2xFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN0RDthQUFNO1lBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNEZBQTRGLENBQUMsQ0FBQztTQUM5RztRQUVELHVDQUF1QztRQUN2QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUEzQ00sdUNBQWEsR0FBRyxlQUFlLENBQUM7SUFDaEMsK0JBQUssR0FBRywyQkFBMkIsQ0FBQztJQUVwQyxpQ0FBTyxHQUFHO1FBQ2YsV0FBVztRQUNYLE1BQU07S0FDUCxDQUFDO0lBc0NKLGdDQUFDO0NBN0NELEFBNkNDLElBQUE7QUFFRDtJQUdFLGtDQUNVLElBQXlCLEVBQ3pCLE1BQTZCLEVBQzdCLFdBQXVDO1FBSGpELGlCQUtDO1FBSlMsU0FBSSxHQUFKLElBQUksQ0FBcUI7UUFDekIsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7UUFDN0IsZ0JBQVcsR0FBWCxXQUFXLENBQTRCO1FBSWpELGFBQVEsR0FBRyxHQUFHLENBQUM7UUFDZixZQUFPLEdBQUcsaUJBQWlCLENBQUM7UUFDNUIsZUFBVSxHQUFHLElBQUksQ0FBQztRQUNsQixnQkFBVyxHQUFHLDREQUE0RCxDQUFDO1FBQzNFLGVBQVUsR0FBRyx5QkFBeUIsQ0FBQyxLQUFLLENBQUM7UUFDN0MsaUJBQVksR0FBRyx5QkFBeUIsQ0FBQyxhQUFhLENBQUM7UUFFdkQsU0FBSSxHQUFHLFVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBd0M7WUFDckUsSUFBSSxTQUFTLEdBQUcsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLHFDQUFxQztZQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekUsSUFBSSxJQUFJLEdBQTZCLEtBQUksQ0FBQztZQUUxQyx1QkFBdUIsS0FBSztnQkFDMUIsMEJBQTBCO2dCQUMxQixJQUFJLEtBQUssRUFBRTtvQkFFVCw4QkFBOEI7b0JBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUMzQixNQUFNLGtFQUFrRSxDQUFDO3FCQUMxRTtvQkFFRCwrQ0FBK0M7b0JBQy9DLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO29CQUU1QixnQ0FBZ0M7b0JBQ2hDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLElBQUk7d0JBQzNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBRS9CLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNsRCwwRUFBMEU7NEJBQzFFLGdEQUFnRDs0QkFDaEQsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ3RFLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUNwQixDQUFDO29CQUNKLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFFakIsNENBQTRDO29CQUM1QyxhQUFhLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQVUsUUFBUTt3QkFDNUQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDO1lBRUQsSUFBSSxFQUFFLEVBQUU7Z0JBQ04seURBQXlEO2dCQUN6RCxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUVwQixLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJO29CQUMxQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsYUFBYSxDQUFDLEVBQUUsR0FBRztvQkFDakIsTUFBTSxFQUFFLFVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhO3dCQUM5QyxJQUFJLGdCQUFnQixHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTs0QkFDeEMsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3lCQUNsRTtvQkFDSCxDQUFDO2lCQUNGLENBQUM7Z0JBRUY7O21CQUVHO2dCQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVuRDs7bUJBRUc7Z0JBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUMsRUFBRSxNQUFNO29CQUMzRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUU7d0JBQ3hCLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztxQkFDdEM7b0JBQ0QsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNILENBQUMsQ0FBQTtJQWhGRCxDQUFDO0lBa0ZEOzs7OztPQUtHO0lBQ0sseUNBQU0sR0FBZCxVQUFlLFNBQWdCLEVBQUUsT0FBTztRQUF4QyxpQkFhQztRQVpDLElBQUksR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBRW5CLDZDQUE2QztRQUM3QyxJQUFJLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQU8sRUFBRSxJQUFJO1lBQ3hELE9BQU8sS0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDckYsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxnQ0FBTyxHQUFkO1FBQ0UsSUFBSSxTQUFTLEdBQUcsVUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsSUFBSyxPQUFBLElBQUksd0JBQXdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQztRQUV2RyxTQUFTLENBQUMsT0FBTyxHQUFHO1lBQ2xCLE1BQU07WUFDTixRQUFRO1lBQ1IsNEJBQTRCO1NBQzdCLENBQUM7UUFFRixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBeEhNLDhCQUFLLEdBQUcsaUJBQWlCLENBQUM7SUF5SG5DLCtCQUFDO0NBMUhELEFBMEhDLElBQUE7QUFFRCxzREFBc0Q7QUFDdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUM5QixVQUFVLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDO0tBQ3RFLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQzlLakY7SUFHRSw2QkFDVSxXQUF1QztRQURqRCxpQkFHQztRQUZTLGdCQUFXLEdBQVgsV0FBVyxDQUE0QjtRQUlqRCxhQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2YsWUFBTyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUMsZ0JBQVcsR0FBRyxrREFBa0QsQ0FBQztRQUVqRSxTQUFJLEdBQUcsVUFBQyxLQUFLLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUFFLEtBQUs7WUFDakYsSUFBSSxhQUFhLEdBQThCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDbkQsV0FBVyxHQUErQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkQsSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxpQkFBaUIsR0FBRyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsQ0FBQztZQUUvRSxJQUFJLFVBQVUsR0FBRyxVQUFVLEtBQUs7Z0JBQzlCLElBQUksT0FBTyxHQUFHLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO2dCQUNqRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDO1lBRUYsSUFBSSxhQUFhLEdBQUc7Z0JBQ2xCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQzlCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNyQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDNUIsSUFBSSxFQUFFLEtBQUssUUFBUSxFQUFFO3dCQUNuQiwrQkFBK0I7d0JBQy9CLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTs0QkFDeEQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUMzQyxRQUFRLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7NEJBQ3RCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQzt5QkFDM0I7d0JBQ0QsdUNBQXVDOzZCQUNsQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7NEJBQzdELFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt5QkFDNUM7d0JBQ0QsNkNBQTZDOzZCQUN4QyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7NEJBQzNELFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsUUFBUSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO3lCQUMzQjt3QkFDRCwrQ0FBK0M7NkJBQzFDLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRTs0QkFDL0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUMzQyxRQUFRLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7eUJBQ3ZCO3FCQUNGO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDO1lBRUY7O2VBRUc7WUFDSCxJQUFJLFVBQVUsR0FBRztnQkFDZixXQUFXLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwQyxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0UsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQztZQUVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsVUFBVSxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFO2dCQUN0QixXQUFXLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFHSCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssRUFBRTtnQkFDakMsS0FBSyxDQUFDLGdCQUFnQixHQUFHO29CQUN2QixzQkFBc0IsR0FBRyxJQUFJLENBQUM7b0JBQzlCLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDO2dCQUVGLEtBQUssQ0FBQyxjQUFjLEdBQUc7b0JBQ3JCLHNCQUFzQixHQUFHLEtBQUssQ0FBQztvQkFDL0IsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwQixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLFNBQVMsR0FBRztvQkFDaEIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFM0IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDakMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBRW5DLGlCQUFpQixHQUFHLEVBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBQyxDQUFDO2dCQUM3RixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLE9BQU8sR0FBRztvQkFFZCx1Q0FBdUM7b0JBQ3ZDLDZDQUE2QztvQkFDN0MsVUFBVSxDQUFDO3dCQUNULFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25DLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFFUixPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM5QixXQUFXLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUVwQyxhQUFhLEVBQUUsQ0FBQztvQkFDaEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7b0JBQ3hCLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7b0JBQ2hDLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFMUIsSUFBSSxzQkFBc0IsRUFBRTt3QkFDMUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7d0JBRTNELElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksUUFBUSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7NEJBQ3BFLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0NBQ3hCLEtBQUssRUFBRSxRQUFRO2dDQUNmLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRzs2QkFDWixDQUFDLENBQUM7NEJBQ0gsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO3lCQUN2QjtxQkFDRjt5QkFBTTt3QkFDTCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQzt3QkFFdkQsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLE1BQU0sSUFBSSxNQUFNLElBQUksRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7NEJBQ3pFLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0NBQ3hCLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSztnQ0FDZixHQUFHLEVBQUUsTUFBTTs2QkFDWixDQUFDLENBQUM7NEJBQ0gsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO3lCQUN2QjtxQkFDRjtnQkFDSCxDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7b0JBQ3RCLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7b0JBQ2hDLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsSUFBSSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQztvQkFFL0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBQzNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDO29CQUU3QyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ3BFLFdBQVcsQ0FBQyxhQUFhLENBQUM7NEJBQ3hCLEtBQUssRUFBRSxRQUFROzRCQUNmLEdBQUcsRUFBRSxNQUFNO3lCQUNaLENBQUMsQ0FBQzt3QkFDSCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7cUJBQ3ZCO2dCQUNILENBQUMsQ0FBQzthQUNIO1lBRUQsMEJBQTBCO1lBQzFCLGFBQWEsRUFBRSxDQUFDO1lBRWhCLHFEQUFxRDtZQUNyRCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQUU7Z0JBQzNCLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEtBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMxRixXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxLQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdEYsMEdBQTBHO2dCQUMxRyxhQUFhLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RFLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztZQUVILHFEQUFxRDtZQUNyRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUs7Z0JBQ2pDLElBQUksRUFBRSxHQUFHO29CQUNQLEtBQUssRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFFLEdBQUcsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZFLENBQUM7Z0JBQ0YscURBQXFEO2dCQUNyRCxPQUFPLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1lBRUgsV0FBVyxDQUFDLE9BQU8sR0FBRztnQkFDcEIsSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQztnQkFDaEMsSUFBSSxHQUFHLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDekMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRztpQkFDdEQsQ0FBQztnQkFFRixtREFBbUQ7Z0JBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDO1lBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRTtnQkFDeEMsaUZBQWlGO2dCQUNqRixLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFBO0lBaE1ELENBQUM7SUFrTU0sMkJBQU8sR0FBZDtRQUNFLElBQUksU0FBUyxHQUFHLFVBQUMsV0FBVyxJQUFLLE9BQUEsSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQztRQUV0RSxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUVuRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBN01NLHlCQUFLLEdBQUcsWUFBWSxDQUFDO0lBOE05QiwwQkFBQztDQS9NRCxBQStNQyxJQUFBO0FBRUQsT0FBTztLQUNKLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUN6QixTQUFTLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMiLCJmaWxlIjoibmctd2Vla2x5LXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlY2xhcmUgdmFyIG1vbWVudDtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdkZW1vQXBwJywgWyduZ0FuaW1hdGUnLCAnd2Vla2x5U2NoZWR1bGVyJywgJ3dlZWtseVNjaGVkdWxlckkxOE4nXSlcclxuXHJcbiAgLmNvbmZpZyhbJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2VQcm92aWRlcicsIGZ1bmN0aW9uIChsb2NhbGVTZXJ2aWNlUHJvdmlkZXIpIHtcclxuICAgIGxvY2FsZVNlcnZpY2VQcm92aWRlci5jb25maWd1cmUoe1xyXG4gICAgICBkb3lzOiB7ICdlcy1lcyc6IDQgfSxcclxuICAgICAgbGFuZzogeyAnZXMtZXMnOiB7IHdlZWtOYjogJ27Dum1lcm8gZGUgbGEgc2VtYW5hJywgYWRkTmV3OiAnQcOxYWRpcicgfSB9LFxyXG4gICAgICBsb2NhbGVMb2NhdGlvblBhdHRlcm46ICcvYW5ndWxhci1sb2NhbGVfe3tsb2NhbGV9fS5qcydcclxuICAgIH0pO1xyXG4gIH1dKVxyXG5cclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckdGltZW91dCcsICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsIGxvY2FsZVNlcnZpY2UsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBsb2NhbGU6IGxvY2FsZVNlcnZpY2UuJGxvY2FsZS5pZCxcclxuICAgICAgICBvcHRpb25zOiB7Lyptb25vU2NoZWR1bGU6IHRydWUqLyB9LFxyXG4gICAgICAgIGl0ZW1zOiBbe1xyXG4gICAgICAgICAgbGFiZWw6ICdJdGVtIDEnLFxyXG4gICAgICAgICAgZWRpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIHsgc3RhcnQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLnN0YXJ0T2YoJ2RheScpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLmVuZE9mKCdkYXknKS50b0RhdGUoKSB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBsYWJlbDogJ0l0ZW0gMicsXHJcbiAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgeyBzdGFydDogbW9tZW50KCcyMDE1LTEyLTI3Jykuc3RhcnRPZignZGF5JykuYWRkKDUsICdob3VycycpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLmVuZE9mKCdkYXknKS5hZGQoLTUsICdob3VycycpLnRvRGF0ZSgpIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICBsYWJlbDogJ0l0ZW0gMycsXHJcbiAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAgeyBzdGFydDogbW9tZW50KCcyMDE1LTEyLTI3Jykuc3RhcnRPZignZGF5JykuYWRkKDIsICdob3VycycpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLmVuZE9mKCdkYXknKS5hZGQoLTIsICdob3VycycpLnRvRGF0ZSgpIH1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMub25Mb2NhbGVDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBpcyBjaGFuZ2luZyB0bycsICRzY29wZS5tb2RlbC5sb2NhbGUpO1xyXG4gICAgICAgIGxvY2FsZVNlcnZpY2Uuc2V0KCRzY29wZS5tb2RlbC5sb2NhbGUpLnRoZW4oZnVuY3Rpb24gKCRsb2NhbGUpIHtcclxuICAgICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgY2hhbmdlZCB0bycsICRsb2NhbGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuXHJcbnZhciBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcbnZhciBDTElDS19PTl9BX0NFTEwgPSAnY2xpY2tPbkFDZWxsJztcclxuXHJcbnZhciBpc0N0cmw7XHJcblxyXG5mdW5jdGlvbiBjdHJsQ2hlY2soZSkge1xyXG4gIGlmIChlLndoaWNoID09PSAxNykge1xyXG4gICAgaXNDdHJsID0gZS50eXBlID09PSAna2V5ZG93bic7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBtb3VzZVNjcm9sbChlbCwgZGVsdGEpIHtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjdHJsQ2hlY2spO1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGN0cmxDaGVjayk7XHJcblxyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICBpZiAoaXNDdHJsKSB7XHJcbiAgICAgIHZhciBzdHlsZSA9IGVsLmZpcnN0Q2hpbGQuc3R5bGUsIGN1cnJlbnRXaWR0aCA9IHBhcnNlSW50KHN0eWxlLndpZHRoKTtcclxuICAgICAgaWYgKChlLndoZWVsRGVsdGEgfHwgZS5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgIHN0eWxlLndpZHRoID0gKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJSc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgIHN0eWxlLndpZHRoID0gKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgZWwuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHpvb21JbkFDZWxsKGVsLCBldmVudCwgZGF0YSkge1xyXG5cclxuICB2YXIgbmJFbGVtZW50cyA9IGRhdGEubmJFbGVtZW50cztcclxuICB2YXIgaWR4ID0gZGF0YS5pZHg7XHJcbiAgLy8gcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyBpcyB1c2VkIHdoZW4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGdyaWQgaXMgbm90IGZ1bGxcclxuICAvLyBGb3IgaW5zdGFuY2UsIGluIHRoZSBleGFtcGxlIGJlbG93IGBmZWIgMTdgIGlzIG5vdCBmdWxsXHJcbiAgLy8gZmViIDE3ICAgICAgICAgIG1hcmNoIDE3XHJcbiAgLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gIHZhciBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID0gZGF0YS5wZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nO1xyXG5cclxuICB2YXIgY29udGFpbmVyV2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgLy8gbGVhdmUgKDEvMykgZWFjaCBzaWRlXHJcbiAgLy8gMS8zIHwgICAgMy8zICAgfCAxLzNcclxuICB2YXIgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvICg1IC8gMyk7XHJcbiAgdmFyIGd1dHRlclNpemUgPSBib3hXaWR0aCAvIDM7XHJcblxyXG4gIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gbmJFbGVtZW50cyAqIGJveFdpZHRoO1xyXG4gIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgZWwuZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJztcclxuXHJcbiAgaWYgKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgIGVsLnNjcm9sbExlZnQgPSBpZHggKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFNpemVzIG9mIGNlbGxzIGluIGEgbGluZSBjb3VsZCBkaWZmZXJlbnQgKGVzcGVjaWFsbHkgdGhlIGZpcnN0IG9uZSlcclxuICAgIGVsLnNjcm9sbExlZnQgPSBzY2hlZHVsZUFyZWFXaWR0aFB4ICogKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgLyAxMDApIC0gZ3V0dGVyU2l6ZTtcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICc9JyxcclxuICAgIG9uZHJhZ3N0b3A6ICc9JyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnPSdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZ3N0YXJ0KSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZykge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyhkZWx0YSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RvcCkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImNsYXNzIEhvdXJseUdyaWREaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gICAgc3RhdGljICRuYW1lID0gJ2hvdXJseUdyaWQnO1xyXG5cclxuICAgIHJlc3RyaWN0ID0gJ0UnO1xyXG4gICAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIG5iSG91cnMsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICAgIG5iRWxlbWVudHM6IG5iSG91cnMsXHJcbiAgICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG1vZGVsKSB7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGhvdXIgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgdmFyIHRpY2tjb3VudCA9IG1vZGVsLm5iSG91cnM7XHJcbiAgICAgICAgdmFyIHRpY2tzaXplID0gMTAwIC8gdGlja2NvdW50O1xyXG4gICAgICAgIHZhciBncmlkSXRlbUVsID0gR1JJRF9URU1QTEFURS5jc3Moe3dpZHRoOiB0aWNrc2l6ZSArICclJ30pO1xyXG4gICAgICAgIHZhciBub3cgPSBtb2RlbC5taW5EYXRlLmNsb25lKCkuc3RhcnRPZignd2VlaycpO1xyXG4gIFxyXG4gICAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcbiAgXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG4gICAgICAgICAgICAvL2NoaWxkLnRleHQoaSAlIDEyKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSA9PiB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMucHVzaCgobmV3TW9kZWwpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZXdNb2RlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIEZhY3RvcnkoKSB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZSA9ICgpID0+IG5ldyBIb3VybHlHcmlkRGlyZWN0aXZlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgICAuZGlyZWN0aXZlKEhvdXJseUdyaWREaXJlY3RpdmUuJG5hbWUsIEhvdXJseUdyaWREaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiY2xhc3MgSW5qZWN0RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaW5qZWN0JztcclxuXHJcbiAgbGluayA9ICgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCAkYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGNvbnRyb2xsZXIsICR0cmFuc2NsdWRlOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24pID0+IHtcclxuICAgIGlmICghJHRyYW5zY2x1ZGUpIHtcclxuICAgICAgdGhyb3cgJ0lsbGVnYWwgdXNlIG9mIG5nVHJhbnNjbHVkZSBkaXJlY3RpdmUgaW4gdGhlIHRlbXBsYXRlISBObyBwYXJlbnQgZGlyZWN0aXZlIHRoYXQgcmVxdWlyZXMgYSB0cmFuc2NsdXNpb24gZm91bmQuJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5uZXJTY29wZSA9ICRzY29wZS4kbmV3KCk7XHJcblxyXG4gICAgJHRyYW5zY2x1ZGUoaW5uZXJTY29wZSwgZnVuY3Rpb24gKGNsb25lKSB7XHJcbiAgICAgICRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICRlbGVtZW50LmFwcGVuZChjbG9uZSk7XHJcbiAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbm5lclNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSW5qZWN0RGlyZWN0aXZlKCk7XHJcbiAgICBcclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEluamVjdERpcmVjdGl2ZS4kbmFtZSwgSW5qZWN0RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJywgWyd0bWguZHluYW1pY0xvY2FsZSddKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJylcclxuICAucHJvdmlkZXIoJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCBbJ3RtaER5bmFtaWNMb2NhbGVQcm92aWRlcicsIGZ1bmN0aW9uICh0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdENvbmZpZzogYW55IC8qIFRPRE8gdHlwZSAqLyA9IHtcclxuICAgICAgZG95czogeydkZS1kZSc6IDQsICdlbi1nYic6IDQsICdlbi11cyc6IDYsICdmci1mcic6IDR9LFxyXG4gICAgICBsYW5nOiB7XHJcbiAgICAgICAgJ2RlLWRlJzoge3dlZWtOYjogJ1dvY2hlbnVtbWVyJywgYWRkTmV3OiAnSGluenVmw7xnZW4nfSxcclxuICAgICAgICAnZW4tZ2InOiB7d2Vla05iOiAnV2VlayAjJywgYWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2VuLXVzJzoge3dlZWtOYjogJ1dlZWsgIycsIGFkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdmci1mcic6IHt3ZWVrTmI6ICdOwrAgZGUgc2VtYWluZScsIGFkZE5ldzogJ0Fqb3V0ZXInfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG5cclxuICAgICAgaWYgKGNvbmZpZyAmJiBhbmd1bGFyLmlzT2JqZWN0KGNvbmZpZykpIHtcclxuICAgICAgICBhbmd1bGFyLm1lcmdlKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybikge1xyXG4gICAgICAgICAgdG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyLmxvY2FsZUxvY2F0aW9uUGF0dGVybihkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJHJvb3RTY29wZScsICckbG9jYWxlJywgJ3RtaER5bmFtaWNMb2NhbGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2FsZSwgdG1oRHluYW1pY0xvY2FsZSkge1xyXG5cclxuICAgICAgdmFyIG1vbWVudExvY2FsZUNhY2hlID0ge307XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMYW5nKCkge1xyXG4gICAgICAgIHZhciBrZXkgPSAkbG9jYWxlLmlkO1xyXG4gICAgICAgIGlmICghbW9tZW50TG9jYWxlQ2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgbW9tZW50TG9jYWxlQ2FjaGVba2V5XSA9IGdldE1vbWVudExvY2FsZShrZXkpO1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkLCBtb21lbnRMb2NhbGVDYWNoZVtrZXldLmxvY2FsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UganVzdCBuZWVkIGZldyBtb21lbnQgbG9jYWwgaW5mb3JtYXRpb25cclxuICAgICAgZnVuY3Rpb24gZ2V0TW9tZW50TG9jYWxlKGtleSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTsiLCJjbGFzcyBNdWx0aVNsaWRlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuXHJcbiAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgdGltZVNlcnZpY2U6IFdlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLCBzY2hlZHVsZXJDdHJsKSA9PiB7XHJcbiAgICB2YXIgY29uZiA9IHNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHNjaGVkdWxlciBibG9jayBzaXplIHdoZW4gYWRkaW5nIGEgbmV3IGl0ZW1cclxuICAgIHZhciBkZWZhdWx0TmV3U2NoZWR1bGVTaXplID0gcGFyc2VJbnQoYXR0cnMuc2l6ZSkgfHwgODtcclxuXHJcbiAgICB2YXIgdmFsVG9QaXhlbCA9IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgdmFyIHBlcmNlbnQgPSB2YWwgLyAoY29uZi5uYkhvdXJzKTtcclxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqIGVsZW1lbnRbMF0uY2xpZW50V2lkdGggKyAwLjUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcGl4ZWxUb1ZhbCA9IGZ1bmN0aW9uIChwaXhlbCkge1xyXG4gICAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gZWxlbWVudFswXS5jbGllbnRXaWR0aDtcclxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqIChjb25mLm5iSG91cnMpICsgMC41KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGFkZFNsb3QgPSAoc3RhcnQsIGVuZCkgPT4ge1xyXG4gICAgICBzdGFydCA9IHN0YXJ0ID49IDAgPyBzdGFydCA6IDA7XHJcbiAgICAgIGVuZCA9IGVuZCA8PSBjb25mLm5iSG91cnMgPyBlbmQgOiBjb25mLm5iSG91cnM7XHJcblxyXG4gICAgICB2YXIgc3RhcnREYXRlID0gdGhpcy50aW1lU2VydmljZS5hZGRIb3VyKGNvbmYubWluRGF0ZSwgc3RhcnQpO1xyXG4gICAgICB2YXIgZW5kRGF0ZSA9IHRoaXMudGltZVNlcnZpY2UuYWRkSG91cihjb25mLm1pbkRhdGUsIGVuZCk7XHJcblxyXG4gICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpdGVtID0gc2NvcGUuaXRlbTtcclxuICAgICAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpdGVtLnNjaGVkdWxlcy5wdXNoKHtzdGFydDogc3RhcnREYXRlLnRvRGF0ZSgpLCBlbmQ6IGVuZERhdGUudG9EYXRlKCl9KTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcbiAgICB2YXIgaG92ZXJFbGVtZW50V2lkdGggPSB2YWxUb1BpeGVsKGRlZmF1bHROZXdTY2hlZHVsZVNpemUpO1xyXG5cclxuICAgIGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICB3aWR0aDogaG92ZXJFbGVtZW50V2lkdGggKyAncHgnXHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgZWxPZmZYID0gZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG5cclxuICAgICAgaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgbGVmdDogZS5wYWdlWCAtIGVsT2ZmWCAtIGhvdmVyRWxlbWVudFdpZHRoIC8gMiArICdweCdcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBob3ZlckVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIGlmICghZWxlbWVudC5hdHRyKCduby1hZGQnKSkge1xyXG4gICAgICAgIHZhciBlbE9mZlggPSBlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgdmFyIHBpeGVsT25DbGljayA9IGV2ZW50LnBhZ2VYIC0gZWxPZmZYO1xyXG4gICAgICAgIHZhciB2YWxPbkNsaWNrID0gcGl4ZWxUb1ZhbChwaXhlbE9uQ2xpY2spO1xyXG5cclxuICAgICAgICB2YXIgc3RhcnQgPSBNYXRoLnJvdW5kKHZhbE9uQ2xpY2sgLSBkZWZhdWx0TmV3U2NoZWR1bGVTaXplIC8gMik7XHJcbiAgICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZTtcclxuXHJcbiAgICAgICAgYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAodGltZVNlcnZpY2UpID0+IG5ldyBNdWx0aVNsaWRlckRpcmVjdGl2ZSh0aW1lU2VydmljZSk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbXHJcbiAgICAgICd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZSdcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoTXVsdGlTbGlkZXJEaXJlY3RpdmUuJG5hbWUsIE11bHRpU2xpZGVyRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImNsYXNzIFdlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UnO1xyXG5cclxuICBwcml2YXRlIFdFRUsgPSAnd2Vlayc7XHJcblxyXG4gIHB1YmxpYyBhZGRIb3VyKG1vbWVudCwgbmJIb3VyKSB7XHJcbiAgICByZXR1cm4gbW9tZW50LmNsb25lKCkuYWRkKG5iSG91ciwgJ2hvdXInKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRXZWVrKG1vbWVudCwgbmJXZWVrKSB7XHJcbiAgICByZXR1cm4gbW9tZW50LmNsb25lKCkuYWRkKG5iV2VlaywgdGhpcy5XRUVLKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb21wYXJlKGRhdGUsIG1ldGhvZCwgbGFzdE1pbikge1xyXG4gICAgaWYgKGRhdGUpIHtcclxuICAgICAgdmFyIGRhdGVBc01vbWVudDtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGRhdGUpKSB7XHJcbiAgICAgICAgZGF0ZUFzTW9tZW50ID0gbW9tZW50KGRhdGUpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRhdGUuX2lzQU1vbWVudE9iamVjdCkge1xyXG4gICAgICAgIGRhdGVBc01vbWVudCA9IGRhdGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgJ0NvdWxkIG5vdCBwYXJzZSBkYXRlIFsnICsgZGF0ZSArICddJztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZGF0ZUFzTW9tZW50W21ldGhvZF0obGFzdE1pbikgPyBkYXRlQXNNb21lbnQgOiBsYXN0TWluO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHdlZWtQcmVjaXNlRGlmZihzdGFydCwgZW5kKSB7XHJcbiAgICByZXR1cm4gZW5kLmNsb25lKCkuZGlmZihzdGFydC5jbG9uZSgpLCB0aGlzLldFRUssIHRydWUpO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLnNlcnZpY2UoV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UuJG5hbWUsIFdlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlKTtcclxuIiwiY2xhc3MgV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciBpbXBsZW1lbnRzIGFuZ3VsYXIuSUNvbnRyb2xsZXIge1xyXG4gIHN0YXRpYyAkY29udHJvbGxlckFzID0gJ3NjaGVkdWxlckN0cmwnO1xyXG4gIHN0YXRpYyAkbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyJztcclxuXHJcbiAgc3RhdGljICRpbmplY3QgPSBbXHJcbiAgICAnJGluamVjdG9yJyxcclxuICAgICckbG9nJ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuYXV0by5JSW5qZWN0b3JTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkbG9nOiBhbmd1bGFyLklMb2dTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY29uZmlnOiBhbnk7IC8qIFRPRE8gdHlwZSAqL1xyXG4gIHB1YmxpYyBpdGVtczogYW55W107IC8qIFRPRE8gdHlwZSAqL1xyXG5cclxuICBwdWJsaWMgZGVmYXVsdE9wdGlvbnM6IGFueSAvKiBUT0RPIHR5cGUgKi8gPSB7XHJcbiAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgc2VsZWN0b3I6ICcuc2NoZWR1bGUtYXJlYS1jb250YWluZXInXHJcbiAgfTtcclxuXHJcbiAgcHVibGljIG9uOiB7XHJcbiAgICBjaGFuZ2U6IChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpID0+IEZ1bmN0aW9uO1xyXG4gIH07XHJcblxyXG4gIHB1YmxpYyAkbW9kZWxDaGFuZ2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW107IC8qIFRPRE8gdHlwZSAqL1xyXG5cclxuICAkb25Jbml0KCkge1xyXG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgaTE4biBzZXJ2aWNlXHJcbiAgICB2YXIgbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJztcclxuXHJcbiAgICBpZiAodGhpcy4kaW5qZWN0b3IuaGFzKG5hbWUpKSB7XHJcbiAgICAgIHRoaXMuJGxvZy5pbmZvKCdUaGUgSTE4TiBzZXJ2aWNlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBpbml0aWFsaXplZCEnKTtcclxuXHJcbiAgICAgIHZhciBsb2NhbGVTZXJ2aWNlOiBhbnkgPSB0aGlzLiRpbmplY3Rvci5nZXQobmFtZSk7IC8qIFRPRE8gdHlwZSAqL1xyXG4gICAgICB0aGlzLmRlZmF1bHRPcHRpb25zLmxhYmVscyA9IGxvY2FsZVNlcnZpY2UuZ2V0TGFuZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kbG9nLmluZm8oJ05vIEkxOE4gZm91bmQgZm9yIHRoaXMgbW9kdWxlLCBjaGVjayB0aGUgbmcgbW9kdWxlIFt3ZWVrbHlTY2hlZHVsZXJJMThOXSBpZiB5b3UgbmVlZCBpMThuLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSAkbG9nOiBhbmd1bGFyLklMb2dTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSxcclxuICAgIHByaXZhdGUgdGltZVNlcnZpY2U6IFdlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICByZXN0cmljdCA9ICdFJztcclxuICByZXF1aXJlID0gJ3dlZWtseVNjaGVkdWxlcic7XHJcbiAgdHJhbnNjbHVkZSA9IHRydWU7XHJcbiAgdGVtcGxhdGVVcmwgPSAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCc7XHJcbiAgY29udHJvbGxlciA9IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWU7XHJcbiAgY29udHJvbGxlckFzID0gV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzO1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlcikgPT4ge1xyXG4gICAgdmFyIG9wdGlvbnNGbiA9IHRoaXMuJHBhcnNlKGF0dHJzLm9wdGlvbnMpLFxyXG4gICAgICBvcHRpb25zID0gYW5ndWxhci5leHRlbmQoc2NoZWR1bGVyQ3RybC5kZWZhdWx0T3B0aW9ucywgb3B0aW9uc0ZuKHNjb3BlKSB8fCB7fSk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBzY2hlZHVsZSBjb250YWluZXIgZWxlbWVudFxyXG4gICAgdmFyIGVsID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKHNjaGVkdWxlckN0cmwuZGVmYXVsdE9wdGlvbnMuc2VsZWN0b3IpO1xyXG4gICAgdmFyIHNlbGY6IFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSA9IHRoaXM7XHJcblxyXG4gICAgZnVuY3Rpb24gb25Nb2RlbENoYW5nZShpdGVtcykge1xyXG4gICAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgICBpZiAoaXRlbXMpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgICB0aHJvdyAnWW91IHNob3VsZCB1c2Ugd2Vla2x5LXNjaGVkdWxlciBkaXJlY3RpdmUgd2l0aCBhbiBBcnJheSBvZiBpdGVtcyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAgICAgLy8gRmlyc3QgY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZyA9IHNlbGYuY29uZmlnKGl0ZW1zLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGggP1xyXG4gICAgICAgICAgICAvLyBJZiBpbiBtdWx0aVNsaWRlciBtb2RlLCBlbnN1cmUgYSBzY2hlZHVsZSBhcnJheSBpcyBwcmVzZW50IG9uIGVhY2ggaXRlbVxyXG4gICAgICAgICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgICAgICAgKG9wdGlvbnMubW9ub1NjaGVkdWxlID8gaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXSA6IHNjaGVkdWxlcykgOlxyXG4gICAgICAgICAgICBpdGVtLnNjaGVkdWxlcyA9IFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0sIFtdKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcclxuICAgICAgICAgIGxpc3RlbmVyKHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbCkge1xyXG4gICAgICAvLyBJbnN0YWxsIG1vdXNlIHNjcm9sbGluZyBldmVudCBsaXN0ZW5lciBmb3IgSCBzY3JvbGxpbmdcclxuICAgICAgbW91c2VTY3JvbGwoZWwsIDIwKTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbihDTElDS19PTl9BX0NFTEwsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgem9vbUluQUNlbGwoZWwsIGUsIGRhdGEpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjaGVkdWxlckN0cmwub24gPSB7XHJcbiAgICAgICAgY2hhbmdlOiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgb25DaGFuZ2VGdW5jdGlvbiA9IHRoaXMuJHBhcnNlKGF0dHJzLm9uQ2hhbmdlKShzY29wZSk7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKG9uQ2hhbmdlRnVuY3Rpb24pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvbkNoYW5nZUZ1bmN0aW9uKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICAgKi9cclxuICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbihhdHRycy5pdGVtcywgb25Nb2RlbENoYW5nZSk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTGlzdGVuIHRvICRsb2NhbGUgY2hhbmdlIChicm91Z2h0IGJ5IGV4dGVybmFsIG1vZHVsZSB3ZWVrbHlTY2hlZHVsZXJJMThOKVxyXG4gICAgICAgKi9cclxuICAgICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKGUsIGxhYmVscykge1xyXG4gICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgc2NoZWR1bGVyQ3RybC5jb25maWcubGFiZWxzID0gbGFiZWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvbk1vZGVsQ2hhbmdlKGFuZ3VsYXIuY29weSh0aGlzLiRwYXJzZShhdHRycy5pdGVtcykoc2NvcGUpLCBbXSkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAqIEBwYXJhbSBzY2hlZHVsZXNcclxuICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAqIEByZXR1cm5zIHt7bWluRGF0ZTogKiwgbmJXZWVrczogKn19XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb25maWcoc2NoZWR1bGVzOiBhbnlbXSwgb3B0aW9ucykge1xyXG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBtaW4gZGF0ZSBvZiBhbGwgc2NoZWR1bGVkIGV2ZW50c1xyXG4gICAgdmFyIG1pbkRhdGUgPSAoc2NoZWR1bGVzID8gc2NoZWR1bGVzLnJlZHVjZSgobWluRGF0ZSwgc2xvdCkgPT4ge1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lU2VydmljZS5jb21wYXJlKHNsb3Quc3RhcnQsICdpc0JlZm9yZScsIG1pbkRhdGUpO1xyXG4gICAgfSwgbm93KSA6IG5vdykuc3RhcnRPZignd2VlaycpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChvcHRpb25zLCB7IG1pbkRhdGU6IG1pbkRhdGUsIG5iV2Vla3M6IDEsIG5iSG91cnM6IDE2OCB9KTtcclxuICAgIC8vIExvZyBjb25maWd1cmF0aW9uXHJcbiAgICB0aGlzLiRsb2cuZGVidWcoJ1dlZWtseSBTY2hlZHVsZXIgY29uZmlndXJhdGlvbjonLCByZXN1bHQpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGxvZywgJHBhcnNlLCB0aW1lU2VydmljZSkgPT4gbmV3IFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZSgkbG9nLCAkcGFyc2UsIHRpbWVTZXJ2aWNlKTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFtcclxuICAgICAgJyRsb2cnLFxyXG4gICAgICAnJHBhcnNlJyxcclxuICAgICAgJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuLyogZ2xvYmFsIG1vdXNlU2Nyb2xsLCBDTElDS19PTl9BX0NFTEwsIHpvb21JbkFDZWxsICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5jb250cm9sbGVyKFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsIFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIpXHJcbiAgLmRpcmVjdGl2ZShXZWVrbHlTY2hlZHVsZXJEaXJlY3RpdmUuJG5hbWUsIFdlZWtseVNjaGVkdWxlckRpcmVjdGl2ZS5GYWN0b3J5KCkpO1xyXG4iLCJjbGFzcyBXZWVrbHlTbG90RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnd2Vla2x5U2xvdCc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSB0aW1lU2VydmljZTogV2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHJlc3RyaWN0ID0gJ0UnO1xyXG4gIHJlcXVpcmUgPSBbJ153ZWVrbHlTY2hlZHVsZXInLCAnbmdNb2RlbCddO1xyXG4gIHRlbXBsYXRlVXJsID0gJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCc7XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGN0cmxzKSA9PiB7XHJcbiAgICB2YXIgc2NoZWR1bGVyQ3RybDogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlciA9IGN0cmxzWzBdLFxyXG4gICAgICAgIG5nTW9kZWxDdHJsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IGN0cmxzWzFdO1xyXG5cclxuICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcbiAgICB2YXIgaW5kZXggPSBzY29wZS4kcGFyZW50LiRpbmRleDtcclxuICAgIHZhciBjb250YWluZXJFbCA9IGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICB2YXIgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICB2YXIgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IHNjb3BlLnNjaGVkdWxlLnN0YXJ0LCBlbmQ6IHNjb3BlLnNjaGVkdWxlLmVuZH07XHJcblxyXG4gICAgdmFyIHBpeGVsVG9WYWwgPSBmdW5jdGlvbiAocGl4ZWwpIHtcclxuICAgICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogY29uZi5uYldlZWtzICsgMC41KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1lcmdlT3ZlcmxhcHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBzY2hlZHVsZSA9IHNjb3BlLnNjaGVkdWxlO1xyXG4gICAgICB2YXIgc2NoZWR1bGVzID0gc2NvcGUuaXRlbS5zY2hlZHVsZXM7XHJcbiAgICAgIHNjaGVkdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICAgIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuZW5kICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgc2NoZWR1bGUuZW5kID0gZWwuZW5kO1xyXG4gICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgICBlbHNlIGlmIChzY2hlZHVsZS5lbmQgPj0gZWwuZW5kICYmIHNjaGVkdWxlLnN0YXJ0IDw9IGVsLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgICAgZWxzZSBpZiAoZWwuZW5kID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLmVuZCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICAgIGVsc2UgaWYgKGVsLnN0YXJ0ID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgIHNjaGVkdWxlLmVuZCA9IGVsLmVuZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZSBvbiByaWdodCBjbGljayBvbiBzbG90XHJcbiAgICAgKi9cclxuICAgIHZhciBkZWxldGVTZWxmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgICAgc2NvcGUuaXRlbS5zY2hlZHVsZXMuc3BsaWNlKHNjb3BlLml0ZW0uc2NoZWR1bGVzLmluZGV4T2Yoc2NvcGUuc2NoZWR1bGUpLCAxKTtcclxuICAgICAgY29udGFpbmVyRWwuZmluZCgnd2Vla2x5LXNsb3QnKS5yZW1vdmUoKTtcclxuICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVsZW1lbnQuZmluZCgnc3BhbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZGVsZXRlU2VsZigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb250YWluZXJFbC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBpZiAoc2NvcGUuaXRlbS5lZGl0YWJsZSAhPT0gZmFsc2UpIHtcclxuICAgICAgc2NvcGUuc3RhcnRSZXNpemVTdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0UmVzaXplRW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgY29udGFpbmVyRWwuYXR0cignbm8tYWRkJywgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUuc3RhcnQsIGVuZDogbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZS5lbmR9O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuZW5kRHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICAgICAgbWVyZ2VPdmVybGFwcygpO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUucmVzaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcblxyXG4gICAgICAgIGlmIChyZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgbmV3RW5kID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IGNvbmYubmJXZWVrcykge1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzY29wZS5kcmFnID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gdmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IE1hdGgucm91bmQodmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICAgICAgdmFyIG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gY29uZi5uYldlZWtzKSB7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9uIGluaXQsIG1lcmdlIG92ZXJsYXBzXHJcbiAgICBtZXJnZU92ZXJsYXBzKCk7XHJcblxyXG4gICAgLy8vLyBVSSAtPiBtb2RlbCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIG5nTW9kZWxDdHJsLiRwYXJzZXJzLnB1c2goKHVpKSA9PiB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLnN0YXJ0ID0gdGhpcy50aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgdWkuc3RhcnQpLnRvRGF0ZSgpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5lbmQgPSB0aGlzLnRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCB1aS5lbmQpLnRvRGF0ZSgpO1xyXG4gICAgICAvLyRsb2cuZGVidWcoJ1BBUlNFUiA6JywgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuJCRoYXNoS2V5LCBpbmRleCwgc2NvcGUuJGluZGV4LCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSk7XHJcbiAgICAgIHNjaGVkdWxlckN0cmwub24uY2hhbmdlKGluZGV4LCBzY29wZS4kaW5kZXgsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKTtcclxuICAgICAgcmV0dXJuIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8vLyBtb2RlbCAtPiBVSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goKG1vZGVsKSA9PiB7XHJcbiAgICAgIHZhciB1aSA9IHtcclxuICAgICAgICBzdGFydDogdGhpcy50aW1lU2VydmljZS53ZWVrUHJlY2lzZURpZmYoY29uZi5taW5EYXRlLCBtb21lbnQobW9kZWwuc3RhcnQpKSxcclxuICAgICAgICBlbmQ6IHRoaXMudGltZVNlcnZpY2Uud2Vla1ByZWNpc2VEaWZmKGNvbmYubWluRGF0ZSwgbW9tZW50KG1vZGVsLmVuZCkpXHJcbiAgICAgIH07XHJcbiAgICAgIC8vJGxvZy5kZWJ1ZygnRk9STUFUVEVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCB1aSk7XHJcbiAgICAgIHJldHVybiB1aTtcclxuICAgIH0pO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB1aSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgIHZhciBjc3MgPSB7XHJcbiAgICAgICAgbGVmdDogdWkuc3RhcnQgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJScsXHJcbiAgICAgICAgd2lkdGg6ICh1aS5lbmQgLSB1aS5zdGFydCkgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJSdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vJGxvZy5kZWJ1ZygnUkVOREVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCBjc3MpO1xyXG4gICAgICBlbGVtZW50LmNzcyhjc3MpO1xyXG4gICAgfTtcclxuXHJcbiAgICBzY29wZS4kb24oJ3dlZWtseVNjaGVkdWxlckxvY2FsZUNoYW5nZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIFNpbXBsZSBjaGFuZ2Ugb2JqZWN0IHJlZmVyZW5jZSBzbyB0aGF0IG5nTW9kZWwgdHJpZ2dlcnMgZm9ybWF0dGluZyAmIHJlbmRlcmluZ1xyXG4gICAgICBzY29wZS5zY2hlZHVsZSA9IGFuZ3VsYXIuY29weShzY29wZS5zY2hlZHVsZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICh0aW1lU2VydmljZSkgPT4gbmV3IFdlZWtseVNsb3REaXJlY3RpdmUodGltZVNlcnZpY2UpO1xyXG5cclxuICAgIGRpcmVjdGl2ZS4kaW5qZWN0ID0gWyd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZSddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKFdlZWtseVNsb3REaXJlY3RpdmUuJG5hbWUsIFdlZWtseVNsb3REaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIl19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"><div class="srow">{{::$index + 1}}. {{item.label}}</div></weekly-scheduler><div class="pull-right"><button class="btn btn-success" role="button" ng-click="model.items.push({label: \'New Item\'})">Add new item</button></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right"></div><div class="schedule-animate" ng-repeat="item in schedulerCtrl.items" inject></div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><hourly-grid class="grid-container"></hourly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><hourly-grid class="grid-container striped" no-text></hourly-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);