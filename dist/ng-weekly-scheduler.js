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
                        { start: moment('2015-12-27').toDate(), end: moment('2016-08-01').toDate() }
                    ]
                }]
        };
        $timeout(function () {
            $scope.model.items = $scope.model.items.concat([{
                    label: 'Item 2',
                    schedules: [
                        { start: moment('2016-05-03').toDate(), end: moment('2017-02-01').toDate() },
                        { start: moment('2015-11-20').toDate(), end: moment('2016-02-01').toDate() }
                    ]
                }, {
                    label: 'Item 3',
                    schedules: [
                        { start: moment('2017-08-09').toDate(), end: moment('2017-08-21').toDate() },
                        { start: moment('2017-09-12').toDate(), end: moment('2017-10-12').toDate() }
                    ]
                }]);
        }, 1000);
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
                var startDate = this.timeService.addWeek(conf.minDate, start);
                var endDate = this.timeService.addWeek(conf.minDate, end);
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
angular.module('weeklyScheduler')
    .service('weeklySchedulerTimeService', ['$filter', function ($filter) {
        var MONTH = 'month';
        var WEEK = 'week';
        var DAY = 'day';
        return {
            const: {
                MONTH: MONTH,
                WEEK: WEEK,
                FORMAT: 'YYYY-MM-DD'
            },
            dF: $filter('date'),
            compare: function (date, method, lastMin) {
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
            },
            addWeek: function (moment, nbWeek) {
                return moment.clone().add(nbWeek, WEEK);
            },
            weekPreciseDiff: function (start, end) {
                return end.clone().diff(start.clone(), WEEK, true);
            },
            weekDiff: function (start, end) {
                return end.clone().endOf(WEEK).diff(start.clone().startOf(WEEK), WEEK) + 1;
            },
            monthDiff: function (start, end) {
                return end.clone().endOf(MONTH).diff(start.clone().startOf(MONTH), MONTH) + 1;
            },
            monthDistribution: function (minDate, maxDate) {
                var i, result = [];
                var startDate = minDate.clone();
                var endDate = maxDate.clone();
                var monthDiff = this.monthDiff(startDate, endDate);
                var dayDiff = endDate.diff(startDate, DAY);
                //var total = 0, totalDays = 0;
                // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
                for (i = 0; i < monthDiff; i++) {
                    var startOfMonth = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
                    var endOfMonth = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
                    var dayInMonth = endOfMonth.diff(startOfMonth, DAY) + (i !== monthDiff - 1 && 1);
                    var width = Math.floor(dayInMonth / dayDiff * 1E8) / 1E6;
                    result.push({ start: startOfMonth.clone(), end: endOfMonth.clone(), width: width });
                    // totalDays += dayInMonth; total += width;
                    // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
                }
                return result;
            }
        };
    }]);
/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
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
/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')
    .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
    .directive('weeklyScheduler', ['$parse', 'weeklySchedulerTimeService', '$log', function ($parse, timeService, $log) {
        /**
         * Configure the scheduler.
         * @param schedules
         * @param options
         * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
         */
        function config(schedules, options) {
            var now = moment();
            // Calculate min date of all scheduled events
            var minDate = (schedules ? schedules.reduce(function (minDate, slot) {
                return timeService.compare(slot.start, 'isBefore', minDate);
            }, now) : now).startOf('week');
            // Calculate max date of all scheduled events
            var maxDate = (schedules ? schedules.reduce(function (maxDate, slot) {
                return timeService.compare(slot.end, 'isAfter', maxDate);
            }, now) : now).clone().add(1, 'year').endOf('week');
            // Calculate nb of weeks covered by minDate => maxDate
            var nbWeeks = timeService.weekDiff(minDate, maxDate);
            var result = angular.extend(options, { minDate: minDate, maxDate: maxDate, nbWeeks: nbWeeks });
            // Log configuration
            $log.debug('Weekly Scheduler configuration:', result);
            return result;
        }
        return {
            restrict: 'E',
            require: 'weeklyScheduler',
            transclude: true,
            templateUrl: 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html',
            controller: WeeklySchedulerController.$name,
            controllerAs: WeeklySchedulerController.$controllerAs,
            link: function (scope, element, attrs, schedulerCtrl) {
                var optionsFn = $parse(attrs.options), options = angular.extend(schedulerCtrl.defaultOptions, optionsFn(scope) || {});
                // Get the schedule container element
                var el = element[0].querySelector(schedulerCtrl.defaultOptions.selector);
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
                        schedulerCtrl.config = config(items.reduce(function (result, item) {
                            var schedules = item.schedules;
                            return result.concat(schedules && schedules.length ?
                                // If in multiSlider mode, ensure a schedule array is present on each item
                                // Else only use first element of schedule array
                                (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
                                item.schedules = []);
                        }, []), options);
                        // Then resize schedule area knowing the number of weeks in scope
                        el.firstChild.style.width = schedulerCtrl.config.nbWeeks / 53 * 200 + '%';
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
                            var onChangeFunction = $parse(attrs.onChange)(scope);
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
                        onModelChange(angular.copy($parse(attrs.items)(scope), []));
                    });
                }
            }
        };
    }]);
angular.module('weeklyScheduler')
    .directive('weeklySlot', ['weeklySchedulerTimeService', function (timeService) {
        return {
            restrict: 'E',
            require: ['^weeklyScheduler', 'ngModel'],
            templateUrl: 'ng-weekly-scheduler/weekly-slot/weekly-slot.html',
            link: function (scope, element, attrs, ctrls) {
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
                        containerEl.attr('no-add', true);
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
                mergeOverlaps(true);
                //// UI -> model ////////////////////////////////////
                ngModelCtrl.$parsers.push(function onUIChange(ui) {
                    ngModelCtrl.$modelValue.start = timeService.addWeek(conf.minDate, ui.start).toDate();
                    ngModelCtrl.$modelValue.end = timeService.addWeek(conf.minDate, ui.end).toDate();
                    //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
                    schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
                    return ngModelCtrl.$modelValue;
                });
                //// model -> UI ////////////////////////////////////
                ngModelCtrl.$formatters.push(function onModelChange(model) {
                    var ui = {
                        start: timeService.weekPreciseDiff(conf.minDate, moment(model.start), true),
                        end: timeService.weekPreciseDiff(conf.minDate, moment(model.end), true)
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
            }
        };
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9pbmplY3QvaW5qZWN0LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbG9jYWxlL2xvY2FsZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtc2VydmljZXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktZ3JpZC93ZWVrbHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FFL0UsTUFBTSxDQUFDLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxxQkFBcUI7UUFDOUUscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBQzlCLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7WUFDbEIsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsRUFBQztZQUNsRSxxQkFBcUIsRUFBRSwrQkFBK0I7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7S0FFRixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLDhC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QUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUc7cUJBQ3RELENBQUM7b0JBRUYsbURBQW1EO29CQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRTtvQkFDeEMsaUZBQWlGO29CQUNqRixLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSB2YXIgbW9tZW50O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ25nQW5pbWF0ZScsICd3ZWVrbHlTY2hlZHVsZXInLCAnd2Vla2x5U2NoZWR1bGVySTE4TiddKVxyXG5cclxuICAuY29uZmlnKFsnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZVByb3ZpZGVyJywgZnVuY3Rpb24gKGxvY2FsZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgbG9jYWxlU2VydmljZVByb3ZpZGVyLmNvbmZpZ3VyZSh7XHJcbiAgICAgIGRveXM6IHsnZXMtZXMnOiA0fSxcclxuICAgICAgbGFuZzogeydlcy1lcyc6IHt3ZWVrTmI6ICduw7ptZXJvIGRlIGxhIHNlbWFuYScsIGFkZE5ldzogJ0HDsWFkaXInfX0sXHJcbiAgICAgIGxvY2FsZUxvY2F0aW9uUGF0dGVybjogJy9hbmd1bGFyLWxvY2FsZV97e2xvY2FsZX19LmpzJ1xyXG4gICAgfSk7XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgbG9jYWxlU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlU2VydmljZS4kbG9jYWxlLmlkLFxyXG4gICAgICAgIG9wdGlvbnM6IHsvKm1vbm9TY2hlZHVsZTogdHJ1ZSovfSxcclxuICAgICAgICBpdGVtczogW3tcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAxJyxcclxuICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNi0wOC0wMScpLnRvRGF0ZSgpfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1dXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHNjb3BlLm1vZGVsLml0ZW1zID0gJHNjb3BlLm1vZGVsLml0ZW1zLmNvbmNhdChbe1xyXG4gICAgICAgICAgbGFiZWw6ICdJdGVtIDInLFxyXG4gICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIHtzdGFydDogbW9tZW50KCcyMDE2LTA1LTAzJykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE3LTAyLTAxJykudG9EYXRlKCl9LFxyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNS0xMS0yMCcpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNi0wMi0wMScpLnRvRGF0ZSgpfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAzJyxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNy0wOC0wOScpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNy0wOC0yMScpLnRvRGF0ZSgpfSxcclxuICAgICAgICAgICAge3N0YXJ0OiBtb21lbnQoJzIwMTctMDktMTInKS50b0RhdGUoKSwgZW5kOiBtb21lbnQoJzIwMTctMTAtMTInKS50b0RhdGUoKX1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XSk7XHJcbiAgICAgIH0sIDEwMDApO1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMub25Mb2NhbGVDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBpcyBjaGFuZ2luZyB0bycsICRzY29wZS5tb2RlbC5sb2NhbGUpO1xyXG4gICAgICAgIGxvY2FsZVNlcnZpY2Uuc2V0KCRzY29wZS5tb2RlbC5sb2NhbGUpLnRoZW4oZnVuY3Rpb24gKCRsb2NhbGUpIHtcclxuICAgICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgY2hhbmdlZCB0bycsICRsb2NhbGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG5cclxudmFyIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxudmFyIENMSUNLX09OX0FfQ0VMTCA9ICdjbGlja09uQUNlbGwnO1xyXG5cclxudmFyIGlzQ3RybDtcclxuXHJcbmZ1bmN0aW9uIGN0cmxDaGVjayhlKSB7XHJcbiAgaWYgKGUud2hpY2ggPT09IDE3KSB7XHJcbiAgICBpc0N0cmwgPSBlLnR5cGUgPT09ICdrZXlkb3duJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlU2Nyb2xsKGVsLCBkZWx0YSkge1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGN0cmxDaGVjayk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgY3RybENoZWNrKTtcclxuXHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGlmIChpc0N0cmwpIHtcclxuICAgICAgdmFyIHN0eWxlID0gZWwuZmlyc3RDaGlsZC5zdHlsZSwgY3VycmVudFdpZHRoID0gcGFyc2VJbnQoc3R5bGUud2lkdGgpO1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgoZS53aGVlbERlbHRhIHx8IGUuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gem9vbUluQUNlbGwoZWwsIGV2ZW50LCBkYXRhKSB7XHJcblxyXG4gIHZhciBuYkVsZW1lbnRzID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gIHZhciBpZHggPSBkYXRhLmlkeDtcclxuICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAvLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgdmFyIHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPSBkYXRhLnBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmc7XHJcblxyXG4gIHZhciBjb250YWluZXJXaWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG5cclxuICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gIHZhciBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICB2YXIgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBuYkVsZW1lbnRzICogYm94V2lkdGg7XHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICBlbC5maXJzdENoaWxkLnN0eWxlLndpZHRoID0gc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnO1xyXG5cclxuICBpZiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IGlkeCAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gU2l6ZXMgb2YgY2VsbHMgaW4gYSBsaW5lIGNvdWxkIGRpZmZlcmVudCAoZXNwZWNpYWxseSB0aGUgZmlyc3Qgb25lKVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gIH1cclxufVxyXG4iLCJjbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJz0nLFxyXG4gICAgb25kcmFnc3RvcDogJz0nLFxyXG4gICAgb25kcmFnc3RhcnQ6ICc9J1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RhcnQpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgdmFyIGRlbHRhID0gZXZlbnQucGFnZVggLSB4O1xyXG4gICAgICBpZiAoc2NvcGUub25kcmFnKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnKGRlbHRhKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChzY29wZS5vbmRyYWdzdG9wKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiY2xhc3MgSW5qZWN0RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaW5qZWN0JztcclxuXHJcbiAgbGluayA9ICgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCAkYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGNvbnRyb2xsZXIsICR0cmFuc2NsdWRlOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24pID0+IHtcclxuICAgIGlmICghJHRyYW5zY2x1ZGUpIHtcclxuICAgICAgdGhyb3cgJ0lsbGVnYWwgdXNlIG9mIG5nVHJhbnNjbHVkZSBkaXJlY3RpdmUgaW4gdGhlIHRlbXBsYXRlISBObyBwYXJlbnQgZGlyZWN0aXZlIHRoYXQgcmVxdWlyZXMgYSB0cmFuc2NsdXNpb24gZm91bmQuJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5uZXJTY29wZSA9ICRzY29wZS4kbmV3KCk7XHJcblxyXG4gICAgJHRyYW5zY2x1ZGUoaW5uZXJTY29wZSwgZnVuY3Rpb24gKGNsb25lKSB7XHJcbiAgICAgICRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICRlbGVtZW50LmFwcGVuZChjbG9uZSk7XHJcbiAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbm5lclNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSW5qZWN0RGlyZWN0aXZlKCk7XHJcbiAgICBcclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEluamVjdERpcmVjdGl2ZS4kbmFtZSwgSW5qZWN0RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJywgWyd0bWguZHluYW1pY0xvY2FsZSddKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJylcclxuICAucHJvdmlkZXIoJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCBbJ3RtaER5bmFtaWNMb2NhbGVQcm92aWRlcicsIGZ1bmN0aW9uICh0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgICAgZG95czogeydkZS1kZSc6IDQsICdlbi1nYic6IDQsICdlbi11cyc6IDYsICdmci1mcic6IDR9LFxyXG4gICAgICBsYW5nOiB7XHJcbiAgICAgICAgJ2RlLWRlJzoge3dlZWtOYjogJ1dvY2hlbnVtbWVyJywgYWRkTmV3OiAnSGluenVmw7xnZW4nfSxcclxuICAgICAgICAnZW4tZ2InOiB7d2Vla05iOiAnV2VlayAjJywgYWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2VuLXVzJzoge3dlZWtOYjogJ1dlZWsgIycsIGFkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdmci1mcic6IHt3ZWVrTmI6ICdOwrAgZGUgc2VtYWluZScsIGFkZE5ldzogJ0Fqb3V0ZXInfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG5cclxuICAgICAgaWYgKGNvbmZpZyAmJiBhbmd1bGFyLmlzT2JqZWN0KGNvbmZpZykpIHtcclxuICAgICAgICBhbmd1bGFyLm1lcmdlKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybikge1xyXG4gICAgICAgICAgdG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyLmxvY2FsZUxvY2F0aW9uUGF0dGVybihkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJHJvb3RTY29wZScsICckbG9jYWxlJywgJ3RtaER5bmFtaWNMb2NhbGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2FsZSwgdG1oRHluYW1pY0xvY2FsZSkge1xyXG5cclxuICAgICAgdmFyIG1vbWVudExvY2FsZUNhY2hlID0ge307XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMYW5nKCkge1xyXG4gICAgICAgIHZhciBrZXkgPSAkbG9jYWxlLmlkO1xyXG4gICAgICAgIGlmICghbW9tZW50TG9jYWxlQ2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgbW9tZW50TG9jYWxlQ2FjaGVba2V5XSA9IGdldE1vbWVudExvY2FsZShrZXkpO1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkLCBtb21lbnRMb2NhbGVDYWNoZVtrZXldLmxvY2FsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UganVzdCBuZWVkIGZldyBtb21lbnQgbG9jYWwgaW5mb3JtYXRpb25cclxuICAgICAgZnVuY3Rpb24gZ2V0TW9tZW50TG9jYWxlKGtleSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTsiLCJjbGFzcyBNdWx0aVNsaWRlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIGFuZ3VsYXIuSURpcmVjdGl2ZSB7XHJcbiAgc3RhdGljICRuYW1lID0gJ211bHRpU2xpZGVyJztcclxuXHJcbiAgcmVzdHJpY3QgPSAnRSc7XHJcbiAgcmVxdWlyZSA9ICded2Vla2x5U2NoZWR1bGVyJztcclxuICB0ZW1wbGF0ZVVybCA9ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgdGltZVNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIHNjaGVkdWxlckN0cmwpID0+IHtcclxuICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgc2NoZWR1bGVyIGJsb2NrIHNpemUgd2hlbiBhZGRpbmcgYSBuZXcgaXRlbVxyXG4gICAgdmFyIGRlZmF1bHROZXdTY2hlZHVsZVNpemUgPSBwYXJzZUludChhdHRycy5zaXplKSB8fCA4O1xyXG5cclxuICAgIHZhciB2YWxUb1BpeGVsID0gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICB2YXIgcGVyY2VudCA9IHZhbCAvIChjb25mLm5iV2Vla3MpO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogZWxlbWVudFswXS5jbGllbnRXaWR0aCArIDAuNSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBwaXhlbFRvVmFsID0gZnVuY3Rpb24gKHBpeGVsKSB7XHJcbiAgICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyBlbGVtZW50WzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKGNvbmYubmJXZWVrcykgKyAwLjUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgYWRkU2xvdCA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgICAgIHN0YXJ0ID0gc3RhcnQgPj0gMCA/IHN0YXJ0IDogMDtcclxuICAgICAgZW5kID0gZW5kIDw9IGNvbmYubmJXZWVrcyA/IGVuZCA6IGNvbmYubmJXZWVrcztcclxuXHJcbiAgICAgIHZhciBzdGFydERhdGUgPSB0aGlzLnRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCBzdGFydCk7XHJcbiAgICAgIHZhciBlbmREYXRlID0gdGhpcy50aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgZW5kKTtcclxuXHJcbiAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICAgIGlmICghaXRlbS5zY2hlZHVsZXMpIHtcclxuICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uc2NoZWR1bGVzLnB1c2goe3N0YXJ0OiBzdGFydERhdGUudG9EYXRlKCksIGVuZDogZW5kRGF0ZS50b0RhdGUoKX0pO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGhvdmVyRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50LmZpbmQoJ2RpdicpWzBdKTtcclxuICAgIHZhciBob3ZlckVsZW1lbnRXaWR0aCA9IHZhbFRvUGl4ZWwoZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSk7XHJcblxyXG4gICAgaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgIHdpZHRoOiBob3ZlckVsZW1lbnRXaWR0aCArICdweCdcclxuICAgIH0pO1xyXG5cclxuICAgIGVsZW1lbnQub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBlbE9mZlggPSBlbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcblxyXG4gICAgICBob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICBsZWZ0OiBlLnBhZ2VYIC0gZWxPZmZYIC0gaG92ZXJFbGVtZW50V2lkdGggLyAyICsgJ3B4J1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGhvdmVyRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgaWYgKCFlbGVtZW50LmF0dHIoJ25vLWFkZCcpKSB7XHJcbiAgICAgICAgdmFyIGVsT2ZmWCA9IGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICB2YXIgcGl4ZWxPbkNsaWNrID0gZXZlbnQucGFnZVggLSBlbE9mZlg7XHJcbiAgICAgICAgdmFyIHZhbE9uQ2xpY2sgPSBwaXhlbFRvVmFsKHBpeGVsT25DbGljayk7XHJcblxyXG4gICAgICAgIHZhciBzdGFydCA9IE1hdGgucm91bmQodmFsT25DbGljayAtIGRlZmF1bHROZXdTY2hlZHVsZVNpemUgLyAyKTtcclxuICAgICAgICB2YXIgZW5kID0gc3RhcnQgKyBkZWZhdWx0TmV3U2NoZWR1bGVTaXplO1xyXG5cclxuICAgICAgICBhZGRTbG90KHN0YXJ0LCBlbmQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICh0aW1lU2VydmljZSkgPT4gbmV3IE11bHRpU2xpZGVyRGlyZWN0aXZlKHRpbWVTZXJ2aWNlKTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFtcclxuICAgICAgJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJ1xyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gIH1cclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZShNdWx0aVNsaWRlckRpcmVjdGl2ZS4kbmFtZSwgTXVsdGlTbGlkZXJEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLnNlcnZpY2UoJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJywgWyckZmlsdGVyJywgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcclxuXHJcbiAgICB2YXIgTU9OVEggPSAnbW9udGgnO1xyXG4gICAgdmFyIFdFRUsgPSAnd2Vlayc7XHJcbiAgICB2YXIgREFZID0gJ2RheSc7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29uc3Q6IHtcclxuICAgICAgICBNT05USDogTU9OVEgsXHJcbiAgICAgICAgV0VFSzogV0VFSyxcclxuICAgICAgICBGT1JNQVQ6ICdZWVlZLU1NLUREJ1xyXG4gICAgICB9LFxyXG4gICAgICBkRjogJGZpbHRlcignZGF0ZScpLFxyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoZGF0ZSwgbWV0aG9kLCBsYXN0TWluKSB7XHJcbiAgICAgICAgaWYgKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBkYXRlQXNNb21lbnQ7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgICAgZGF0ZUFzTW9tZW50ID0gbW9tZW50KGRhdGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRlLl9pc0FNb21lbnRPYmplY3QpIHtcclxuICAgICAgICAgICAgZGF0ZUFzTW9tZW50ID0gZGF0ZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDb3VsZCBub3QgcGFyc2UgZGF0ZSBbJyArIGRhdGUgKyAnXSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUFzTW9tZW50W21ldGhvZF0obGFzdE1pbikgPyBkYXRlQXNNb21lbnQgOiBsYXN0TWluO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgYWRkV2VlazogZnVuY3Rpb24gKG1vbWVudCwgbmJXZWVrKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vbWVudC5jbG9uZSgpLmFkZChuYldlZWssIFdFRUspO1xyXG4gICAgICB9LFxyXG4gICAgICB3ZWVrUHJlY2lzZURpZmY6IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZC5jbG9uZSgpLmRpZmYoc3RhcnQuY2xvbmUoKSwgV0VFSywgdHJ1ZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHdlZWtEaWZmOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiBlbmQuY2xvbmUoKS5lbmRPZihXRUVLKS5kaWZmKHN0YXJ0LmNsb25lKCkuc3RhcnRPZihXRUVLKSwgV0VFSykgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgICBtb250aERpZmY6IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZC5jbG9uZSgpLmVuZE9mKE1PTlRIKS5kaWZmKHN0YXJ0LmNsb25lKCkuc3RhcnRPZihNT05USCksIE1PTlRIKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vbnRoRGlzdHJpYnV0aW9uOiBmdW5jdGlvbiAobWluRGF0ZSwgbWF4RGF0ZSkge1xyXG4gICAgICAgIHZhciBpLCByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgc3RhcnREYXRlID0gbWluRGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgIHZhciBlbmREYXRlID0gbWF4RGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgIHZhciBtb250aERpZmYgPSB0aGlzLm1vbnRoRGlmZihzdGFydERhdGUsIGVuZERhdGUpO1xyXG4gICAgICAgIHZhciBkYXlEaWZmID0gZW5kRGF0ZS5kaWZmKHN0YXJ0RGF0ZSwgREFZKTtcclxuXHJcbiAgICAgICAgLy92YXIgdG90YWwgPSAwLCB0b3RhbERheXMgPSAwO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0RGF0ZS50b0RhdGUoKSwgZW5kRGF0ZS50b0RhdGUoKSwgbW9udGhEaWZmLCBkYXlEaWZmKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbW9udGhEaWZmOyBpKyspIHtcclxuICAgICAgICAgIHZhciBzdGFydE9mTW9udGggPSBpID09PSAwID8gc3RhcnREYXRlIDogc3RhcnREYXRlLmFkZCgxLCBNT05USCkuc3RhcnRPZihNT05USCk7XHJcbiAgICAgICAgICB2YXIgZW5kT2ZNb250aCA9IGkgPT09IG1vbnRoRGlmZiAtIDEgPyBlbmREYXRlIDogc3RhcnREYXRlLmNsb25lKCkuZW5kT2YoTU9OVEgpO1xyXG4gICAgICAgICAgdmFyIGRheUluTW9udGggPSBlbmRPZk1vbnRoLmRpZmYoc3RhcnRPZk1vbnRoLCBEQVkpICsgKGkgIT09IG1vbnRoRGlmZiAtIDEgJiYgMSk7XHJcbiAgICAgICAgICB2YXIgd2lkdGggPSBNYXRoLmZsb29yKGRheUluTW9udGggLyBkYXlEaWZmICogMUU4KSAvIDFFNjtcclxuXHJcbiAgICAgICAgICByZXN1bHQucHVzaCh7c3RhcnQ6IHN0YXJ0T2ZNb250aC5jbG9uZSgpLCBlbmQ6IGVuZE9mTW9udGguY2xvbmUoKSwgd2lkdGg6IHdpZHRofSk7XHJcblxyXG4gICAgICAgICAgLy8gdG90YWxEYXlzICs9IGRheUluTW9udGg7IHRvdGFsICs9IHdpZHRoO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coc3RhcnRPZk1vbnRoLCBlbmRPZk1vbnRoLCBkYXlJbk1vbnRoLCBkYXlEaWZmLCB3aWR0aCwgdG90YWwsIHRvdGFsRGF5cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG4iLCIvKiBnbG9iYWwgR1JJRF9URU1QTEFURSwgQ0xJQ0tfT05fQV9DRUxMICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoJ3dlZWtseUdyaWQnLCBbZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIG5iV2Vla3MsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2NvcGUuJGJyb2FkY2FzdChDTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgIG5iRWxlbWVudHM6IG5iV2Vla3MsXHJcbiAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBtb2RlbCkge1xyXG4gICAgICB2YXIgaTtcclxuICAgICAgLy8gQ2FsY3VsYXRlIHdlZWsgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgIHZhciB0aWNrY291bnQgPSBtb2RlbC5uYldlZWtzO1xyXG4gICAgICB2YXIgdGlja3NpemUgPSAxMDAgLyB0aWNrY291bnQ7XHJcbiAgICAgIHZhciBncmlkSXRlbUVsID0gR1JJRF9URU1QTEFURS5jc3Moe3dpZHRoOiB0aWNrc2l6ZSArICclJ30pO1xyXG4gICAgICB2YXIgbm93ID0gbW9kZWwubWluRGF0ZS5jbG9uZSgpLnN0YXJ0T2YoJ3dlZWsnKTtcclxuXHJcbiAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG4gICAgICAgICAgY2hpbGQudGV4dChub3cuYWRkKGkgJiYgMSwgJ3dlZWsnKS53ZWVrKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgcmVxdWlyZTogJ153ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsKSB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24gKG5ld01vZGVsKSB7XHJcbiAgICAgICAgICBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZXdNb2RlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG4iLCJjbGFzcyBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyIGltcGxlbWVudHMgYW5ndWxhci5JQ29udHJvbGxlciB7XHJcbiAgc3RhdGljICRjb250cm9sbGVyQXMgPSAnc2NoZWR1bGVyQ3RybCc7XHJcbiAgc3RhdGljICRuYW1lID0gJ3dlZWtseVNjaGVkdWxlckNvbnRyb2xsZXInO1xyXG5cclxuICBzdGF0aWMgJGluamVjdCA9IFtcclxuICAgICckaW5qZWN0b3InLFxyXG4gICAgJyRsb2cnXHJcbiAgXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRpbmplY3RvcjogYW5ndWxhci5hdXRvLklJbmplY3RvclNlcnZpY2UsXHJcbiAgICBwcml2YXRlICRsb2c6IGFuZ3VsYXIuSUxvZ1NlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWZhdWx0T3B0aW9uczogYW55IC8qIFRPRE8gdHlwZSAqLyA9IHtcclxuICAgIG1vbm9TY2hlZHVsZTogZmFsc2UsXHJcbiAgICBzZWxlY3RvcjogJy5zY2hlZHVsZS1hcmVhLWNvbnRhaW5lcidcclxuICB9O1xyXG5cclxuICBwdWJsaWMgJG1vZGVsQ2hhbmdlTGlzdGVuZXJzOiBGdW5jdGlvbltdOyAvKiBUT0RPIHR5cGUgKi9cclxuXHJcbiAgJG9uSW5pdCgpIHtcclxuICAgLy8gVHJ5IHRvIGdldCB0aGUgaTE4biBzZXJ2aWNlXHJcbiAgIHZhciBuYW1lID0gJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnO1xyXG5cclxuICAgaWYgKHRoaXMuJGluamVjdG9yLmhhcyhuYW1lKSkge1xyXG4gICAgIHRoaXMuJGxvZy5pbmZvKCdUaGUgSTE4TiBzZXJ2aWNlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBpbml0aWFsaXplZCEnKTtcclxuXHJcbiAgICAgdmFyIGxvY2FsZVNlcnZpY2U6IGFueSA9IHRoaXMuJGluamVjdG9yLmdldChuYW1lKTsgLyogVE9ETyB0eXBlICovXHJcbiAgICAgdGhpcy5kZWZhdWx0T3B0aW9ucy5sYWJlbHMgPSBsb2NhbGVTZXJ2aWNlLmdldExhbmcoKTtcclxuICAgfSBlbHNlIHtcclxuICAgICB0aGlzLiRsb2cuaW5mbygnTm8gSTE4TiBmb3VuZCBmb3IgdGhpcyBtb2R1bGUsIGNoZWNrIHRoZSBuZyBtb2R1bGUgW3dlZWtseVNjaGVkdWxlckkxOE5dIGlmIHlvdSBuZWVkIGkxOG4uJyk7XHJcbiAgIH1cclxuXHJcbiAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICB0aGlzLiRtb2RlbENoYW5nZUxpc3RlbmVycyA9IFtdOyBcclxuICB9XHJcbn1cclxuXHJcbi8qIGdsb2JhbCBtb3VzZVNjcm9sbCwgQ0xJQ0tfT05fQV9DRUxMLCB6b29tSW5BQ2VsbCAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuY29udHJvbGxlcihXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyLiRuYW1lLCBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKVxyXG4gIC5kaXJlY3RpdmUoJ3dlZWtseVNjaGVkdWxlcicsIFsnJHBhcnNlJywgJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJywgJyRsb2cnLCBmdW5jdGlvbiAoJHBhcnNlLCB0aW1lU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uZmlndXJlIHRoZSBzY2hlZHVsZXIuXHJcbiAgICAgKiBAcGFyYW0gc2NoZWR1bGVzXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICogQHJldHVybnMge3ttaW5EYXRlOiAqLCBtYXhEYXRlOiAqLCBuYldlZWtzOiAqfX1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29uZmlnKHNjaGVkdWxlcywgb3B0aW9ucykge1xyXG4gICAgICB2YXIgbm93ID0gbW9tZW50KCk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbWluIGRhdGUgb2YgYWxsIHNjaGVkdWxlZCBldmVudHNcclxuICAgICAgdmFyIG1pbkRhdGUgPSAoc2NoZWR1bGVzID8gc2NoZWR1bGVzLnJlZHVjZShmdW5jdGlvbiAobWluRGF0ZSwgc2xvdCkge1xyXG4gICAgICAgIHJldHVybiB0aW1lU2VydmljZS5jb21wYXJlKHNsb3Quc3RhcnQsICdpc0JlZm9yZScsIG1pbkRhdGUpO1xyXG4gICAgICB9LCBub3cpIDogbm93KS5zdGFydE9mKCd3ZWVrJyk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbWF4IGRhdGUgb2YgYWxsIHNjaGVkdWxlZCBldmVudHNcclxuICAgICAgdmFyIG1heERhdGUgPSAoc2NoZWR1bGVzID8gc2NoZWR1bGVzLnJlZHVjZShmdW5jdGlvbiAobWF4RGF0ZSwgc2xvdCkge1xyXG4gICAgICAgIHJldHVybiB0aW1lU2VydmljZS5jb21wYXJlKHNsb3QuZW5kLCAnaXNBZnRlcicsIG1heERhdGUpO1xyXG4gICAgICB9LCBub3cpIDogbm93KS5jbG9uZSgpLmFkZCgxLCAneWVhcicpLmVuZE9mKCd3ZWVrJyk7XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgbmIgb2Ygd2Vla3MgY292ZXJlZCBieSBtaW5EYXRlID0+IG1heERhdGVcclxuICAgICAgdmFyIG5iV2Vla3MgPSB0aW1lU2VydmljZS53ZWVrRGlmZihtaW5EYXRlLCBtYXhEYXRlKTtcclxuXHJcbiAgICAgIHZhciByZXN1bHQgPSBhbmd1bGFyLmV4dGVuZChvcHRpb25zLCB7bWluRGF0ZTogbWluRGF0ZSwgbWF4RGF0ZTogbWF4RGF0ZSwgbmJXZWVrczogbmJXZWVrc30pO1xyXG4gICAgICAvLyBMb2cgY29uZmlndXJhdGlvblxyXG4gICAgICAkbG9nLmRlYnVnKCdXZWVrbHkgU2NoZWR1bGVyIGNvbmZpZ3VyYXRpb246JywgcmVzdWx0KTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgcmVxdWlyZTogJ3dlZWtseVNjaGVkdWxlcicsXHJcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6IFdlZWtseVNjaGVkdWxlckNvbnRyb2xsZXIuJG5hbWUsXHJcbiAgICAgIGNvbnRyb2xsZXJBczogV2Vla2x5U2NoZWR1bGVyQ29udHJvbGxlci4kY29udHJvbGxlckFzLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsOiBXZWVrbHlTY2hlZHVsZXJDb250cm9sbGVyKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnNGbiA9ICRwYXJzZShhdHRycy5vcHRpb25zKSxcclxuICAgICAgICAgIG9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZChzY2hlZHVsZXJDdHJsLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zRm4oc2NvcGUpIHx8IHt9KTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBzY2hlZHVsZSBjb250YWluZXIgZWxlbWVudFxyXG4gICAgICAgIHZhciBlbCA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcihzY2hlZHVsZXJDdHJsLmRlZmF1bHRPcHRpb25zLnNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25Nb2RlbENoYW5nZShpdGVtcykge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIHByZXNlbnRcclxuICAgICAgICAgIGlmIChpdGVtcykge1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xyXG4gICAgICAgICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHVzZSB3ZWVrbHktc2NoZWR1bGVyIGRpcmVjdGl2ZSB3aXRoIGFuIEFycmF5IG9mIGl0ZW1zJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgbW9kZWwgKHVzZSBpdCBpbiB0ZW1wbGF0ZSlcclxuICAgICAgICAgICAgc2NoZWR1bGVyQ3RybC5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgICAgICAgICAgLy8gRmlyc3QgY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICAgICAgc2NoZWR1bGVyQ3RybC5jb25maWcgPSBjb25maWcoaXRlbXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHNjaGVkdWxlcyAmJiBzY2hlZHVsZXMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgIC8vIElmIGluIG11bHRpU2xpZGVyIG1vZGUsIGVuc3VyZSBhIHNjaGVkdWxlIGFycmF5IGlzIHByZXNlbnQgb24gZWFjaCBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIChvcHRpb25zLm1vbm9TY2hlZHVsZSA/IGl0ZW0uc2NoZWR1bGVzID0gW3NjaGVkdWxlc1swXV0gOiBzY2hlZHVsZXMpIDpcclxuICAgICAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW11cclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LCBbXSksIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiByZXNpemUgc2NoZWR1bGUgYXJlYSBrbm93aW5nIHRoZSBudW1iZXIgb2Ygd2Vla3MgaW4gc2NvcGVcclxuICAgICAgICAgICAgZWwuZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IHNjaGVkdWxlckN0cmwuY29uZmlnLm5iV2Vla3MgLyA1MyAqIDIwMCArICclJztcclxuXHJcbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIoc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbCkge1xyXG4gICAgICAgICAgLy8gSW5zdGFsbCBtb3VzZSBzY3JvbGxpbmcgZXZlbnQgbGlzdGVuZXIgZm9yIEggc2Nyb2xsaW5nXHJcbiAgICAgICAgICBtb3VzZVNjcm9sbChlbCwgMjApO1xyXG5cclxuICAgICAgICAgIHNjb3BlLiRvbihDTElDS19PTl9BX0NFTEwsIGZ1bmN0aW9uKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgem9vbUluQUNlbGwoZWwsIGUsIGRhdGEpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgc2NoZWR1bGVyQ3RybC5vbiA9IHtcclxuICAgICAgICAgICAgY2hhbmdlOiBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgdmFyIG9uQ2hhbmdlRnVuY3Rpb24gPSAkcGFyc2UoYXR0cnMub25DaGFuZ2UpKHNjb3BlKTtcclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKG9uQ2hhbmdlRnVuY3Rpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb25DaGFuZ2VGdW5jdGlvbihpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKGF0dHJzLml0ZW1zLCBvbk1vZGVsQ2hhbmdlKTtcclxuXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIExpc3RlbiB0byAkbG9jYWxlIGNoYW5nZSAoYnJvdWdodCBieSBleHRlcm5hbCBtb2R1bGUgd2Vla2x5U2NoZWR1bGVySTE4TilcclxuICAgICAgICAgICAqL1xyXG4gICAgICAgICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKGUsIGxhYmVscykge1xyXG4gICAgICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZy5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25Nb2RlbENoYW5nZShhbmd1bGFyLmNvcHkoJHBhcnNlKGF0dHJzLml0ZW1zKShzY29wZSksIFtdKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuXHJcbiAgLmRpcmVjdGl2ZSgnd2Vla2x5U2xvdCcsIFsnd2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UnLCBmdW5jdGlvbiAodGltZVNlcnZpY2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgIHJlcXVpcmU6IFsnXndlZWtseVNjaGVkdWxlcicsICduZ01vZGVsJ10sXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC5odG1sJyxcclxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgICB2YXIgc2NoZWR1bGVyQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG4gICAgICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gc2NvcGUuJHBhcmVudC4kaW5kZXg7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckVsID0gZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICB2YXIgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICAgICAgdmFyIHZhbHVlc09uRHJhZ1N0YXJ0ID0ge3N0YXJ0OiBzY29wZS5zY2hlZHVsZS5zdGFydCwgZW5kOiBzY29wZS5zY2hlZHVsZS5lbmR9O1xyXG5cclxuICAgICAgICB2YXIgcGl4ZWxUb1ZhbCA9IGZ1bmN0aW9uIChwaXhlbCkge1xyXG4gICAgICAgICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIGNvbnRhaW5lckVsWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqIGNvbmYubmJXZWVrcyArIDAuNSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIG1lcmdlT3ZlcmxhcHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgc2NoZWR1bGUgPSBzY29wZS5zY2hlZHVsZTtcclxuICAgICAgICAgIHZhciBzY2hlZHVsZXMgPSBzY29wZS5pdGVtLnNjaGVkdWxlcztcclxuICAgICAgICAgIHNjaGVkdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICBpZiAoZWwgIT09IHNjaGVkdWxlKSB7XHJcbiAgICAgICAgICAgICAgLy8gbW9kZWwgaXMgaW5zaWRlIGFub3RoZXIgc2xvdFxyXG4gICAgICAgICAgICAgIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuZW5kICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZS5lbmQgPSBlbC5lbmQ7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBtb2RlbCBjb21wbGV0ZWx5IGNvdmVycyBhbm90aGVyIHNsb3RcclxuICAgICAgICAgICAgICBlbHNlIGlmIChzY2hlZHVsZS5lbmQgPj0gZWwuZW5kICYmIHNjaGVkdWxlLnN0YXJ0IDw9IGVsLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIGVuZCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5lbmQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZS5zdGFydCA9IGVsLnN0YXJ0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBzdGFydCBpcyBpbnNpZGUgY3VycmVudCBtb2RlbFxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKGVsLnN0YXJ0ID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLnN0YXJ0IDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGUuZW5kID0gZWwuZW5kO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlIG9uIHJpZ2h0IGNsaWNrIG9uIHNsb3RcclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgZGVsZXRlU2VsZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xyXG4gICAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgICAgICAgIHNjb3BlLml0ZW0uc2NoZWR1bGVzLnNwbGljZShzY29wZS5pdGVtLnNjaGVkdWxlcy5pbmRleE9mKHNjb3BlLnNjaGVkdWxlKSwgMSk7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5maW5kKCd3ZWVrbHktc2xvdCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZWxlbWVudC5maW5kKCdzcGFuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGRlbGV0ZVNlbGYoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZWxlbWVudC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZWxlbWVudC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICBpZiAoc2NvcGUuaXRlbS5lZGl0YWJsZSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHNjb3BlLnN0YXJ0UmVzaXplU3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2NvcGUuc3RhcnRSZXNpemVFbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2NvcGUuc3RhcnREcmFnKCk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNjb3BlLnN0YXJ0RHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXJFbC5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgICAgICAgICAgY29udGFpbmVyRWwuYXR0cignbm8tYWRkJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZXNPbkRyYWdTdGFydCA9IHtzdGFydDogbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZS5zdGFydCwgZW5kOiBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlLmVuZH07XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNjb3BlLmVuZERyYWcgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzIHByZXZlbnRzIHVzZXIgZnJvbSBhY2NpZGVudGFsbHlcclxuICAgICAgICAgICAgLy8gYWRkaW5nIG5ldyBzbG90IGFmdGVyIHJlc2l6aW5nIG9yIGRyYWdnaW5nXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUF0dHIoJ25vLWFkZCcpO1xyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xyXG5cclxuICAgICAgICAgICAgbWVyZ2VPdmVybGFwcygpO1xyXG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2NvcGUucmVzaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgdmFyIHVpID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICAgICAgICAgdmFyIGRlbHRhID0gcGl4ZWxUb1ZhbChkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNpemVEaXJlY3Rpb25Jc1N0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgdmFyIG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA8PSB1aS5lbmQgLSAxICYmIG5ld1N0YXJ0ID49IDApIHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgIGVuZDogdWkuZW5kXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdmFyIG5ld0VuZCA9IE1hdGgucm91bmQodmFsdWVzT25EcmFnU3RhcnQuZW5kICsgZGVsdGEpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodWkuZW5kICE9PSBuZXdFbmQgJiYgbmV3RW5kID49IHVpLnN0YXJ0ICsgMSAmJiBuZXdFbmQgPD0gY29uZi5uYldlZWtzKSB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgICAgICAgc3RhcnQ6IHVpLnN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNjb3BlLmRyYWcgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBwaXhlbFRvVmFsKGQpO1xyXG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSB2YWx1ZXNPbkRyYWdTdGFydC5lbmQgLSB2YWx1ZXNPbkRyYWdTdGFydC5zdGFydDtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXdTdGFydCA9IE1hdGgucm91bmQodmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcbiAgICAgICAgICAgIHZhciBuZXdFbmQgPSBNYXRoLnJvdW5kKG5ld1N0YXJ0ICsgZHVyYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVpLnN0YXJ0ICE9PSBuZXdTdGFydCAmJiBuZXdTdGFydCA+PSAwICYmIG5ld0VuZCA8PSBjb25mLm5iV2Vla3MpIHtcclxuICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb24gaW5pdCwgbWVyZ2Ugb3ZlcmxhcHNcclxuICAgICAgICBtZXJnZU92ZXJsYXBzKHRydWUpO1xyXG5cclxuICAgICAgICAvLy8vIFVJIC0+IG1vZGVsIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIG5nTW9kZWxDdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24gb25VSUNoYW5nZSh1aSkge1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuc3RhcnQgPSB0aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgdWkuc3RhcnQpLnRvRGF0ZSgpO1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuZW5kID0gdGltZVNlcnZpY2UuYWRkV2Vlayhjb25mLm1pbkRhdGUsIHVpLmVuZCkudG9EYXRlKCk7XHJcbiAgICAgICAgICAvLyRsb2cuZGVidWcoJ1BBUlNFUiA6JywgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUuJCRoYXNoS2V5LCBpbmRleCwgc2NvcGUuJGluZGV4LCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSk7XHJcbiAgICAgICAgICBzY2hlZHVsZXJDdHJsLm9uLmNoYW5nZShpbmRleCwgc2NvcGUuJGluZGV4LCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSk7XHJcbiAgICAgICAgICByZXR1cm4gbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vLy8gbW9kZWwgLT4gVUkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiBvbk1vZGVsQ2hhbmdlKG1vZGVsKSB7XHJcbiAgICAgICAgICB2YXIgdWkgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aW1lU2VydmljZS53ZWVrUHJlY2lzZURpZmYoY29uZi5taW5EYXRlLCBtb21lbnQobW9kZWwuc3RhcnQpLCB0cnVlKSxcclxuICAgICAgICAgICAgZW5kOiB0aW1lU2VydmljZS53ZWVrUHJlY2lzZURpZmYoY29uZi5taW5EYXRlLCBtb21lbnQobW9kZWwuZW5kKSwgdHJ1ZSlcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICAvLyRsb2cuZGVidWcoJ0ZPUk1BVFRFUiA6JywgaW5kZXgsIHNjb3BlLiRpbmRleCwgdWkpO1xyXG4gICAgICAgICAgcmV0dXJuIHVpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmFyIHVpID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICAgICAgIHZhciBjc3MgPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6IHVpLnN0YXJ0IC8gY29uZi5uYldlZWtzICogMTAwICsgJyUnLFxyXG4gICAgICAgICAgICB3aWR0aDogKHVpLmVuZCAtIHVpLnN0YXJ0KSAvIGNvbmYubmJXZWVrcyAqIDEwMCArICclJ1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyRsb2cuZGVidWcoJ1JFTkRFUiA6JywgaW5kZXgsIHNjb3BlLiRpbmRleCwgY3NzKTtcclxuICAgICAgICAgIGVsZW1lbnQuY3NzKGNzcyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgLy8gU2ltcGxlIGNoYW5nZSBvYmplY3QgcmVmZXJlbmNlIHNvIHRoYXQgbmdNb2RlbCB0cmlnZ2VycyBmb3JtYXR0aW5nICYgcmVuZGVyaW5nXHJcbiAgICAgICAgICBzY29wZS5zY2hlZHVsZSA9IGFuZ3VsYXIuY29weShzY29wZS5zY2hlZHVsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG4iXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default navbar-fixed-top"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"><div class="srow">{{::$index + 1}}. {{item.label}}</div></weekly-scheduler><div class="pull-right"><button class="btn btn-success" role="button" ng-click="model.items.push({label: \'New Item\'})">Add new item</button></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right">{{schedulerCtrl.config.labels.weekNb || \'Week number\'}}</div><div class="schedule-animate" ng-repeat="item in schedulerCtrl.items" inject></div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><weekly-grid class="grid-container"></weekly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><weekly-grid class="grid-container striped" no-text></weekly-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);