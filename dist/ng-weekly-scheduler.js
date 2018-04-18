angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])
    .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
        localeServiceProvider.configure({
            doys: { 'es-es': 4 },
            lang: { 'es-es': { month: 'Mes', weekNb: 'número de la semana', addNew: 'Añadir' } },
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
angular.module('weeklyScheduler')
    .directive('inject', [function () {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
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
            }
        };
    }]);
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);
angular.module('weeklySchedulerI18N')
    .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
        var defaultConfig = {
            doys: { 'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4 },
            lang: {
                'de-de': { month: 'Monat', weekNb: 'Wochenummer', addNew: 'Hinzufügen' },
                'en-gb': { month: 'Month', weekNb: 'Week #', addNew: 'Add' },
                'en-us': { month: 'Month', weekNb: 'Week #', addNew: 'Add' },
                'fr-fr': { month: 'Mois', weekNb: 'N° de semaine', addNew: 'Ajouter' }
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
/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
angular.module('weeklyScheduler')
    .directive('monthlyGrid', ['weeklySchedulerTimeService', function (timeService) {
        function handleClickEvent(child, totalWidth, nbMonths, idx, scope) {
            child.bind('click', function () {
                scope.$broadcast(CLICK_ON_A_CELL, {
                    nbElements: nbMonths,
                    idx: idx,
                    percentWidthFromBeginning: totalWidth
                });
            });
        }
        function doGrid(scope, element, attrs, model) {
            // Clean element
            element.empty();
            // Calculation month distribution
            var months = timeService.monthDistribution(model.minDate, model.maxDate);
            var totalWidth = 0;
            // Deploy the grid system on element
            months.forEach(function (month, idx) {
                var child = GRID_TEMPLATE.clone().css({ width: month.width + '%' });
                if (angular.isUndefined(attrs.noText)) {
                    handleClickEvent(child, totalWidth, months.length, idx, scope);
                    child.text(timeService.dF(month.start.toDate(), 'MMM yyyy'));
                }
                totalWidth += month.width;
                element.append(child);
            });
        }
        return {
            restrict: 'E',
            require: '^weeklyScheduler',
            link: function (scope, element, attrs, schedulerCtrl) {
                schedulerCtrl.$modelChangeListeners.push(function (newModel) {
                    doGrid(scope, element, attrs, newModel);
                });
            }
        };
    }]);
angular.module('weeklyScheduler')
    .filter('byIndex', [function () {
        return function (input, index) {
            var ret = [];
            angular.forEach(input, function (el) {
                if (el.index === index) {
                    ret.push(el);
                }
            });
            return ret;
        };
    }])
    .directive('multiSlider', ['weeklySchedulerTimeService', function (timeService) {
        return {
            restrict: 'E',
            require: '^weeklyScheduler',
            templateUrl: 'ng-weekly-scheduler/multislider/multislider.html',
            link: function (scope, element, attrs, schedulerCtrl) {
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
                    var startDate = timeService.addWeek(conf.minDate, start);
                    var endDate = timeService.addWeek(conf.minDate, end);
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
            }
        };
    }]);
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
/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')
    .directive('weeklyScheduler', ['$parse', 'weeklySchedulerTimeService', '$log', function ($parse, timeService, $log) {
        var defaultOptions = {
            monoSchedule: false,
            selector: '.schedule-area-container'
        };
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
            controller: ['$injector', function ($injector) {
                    // Try to get the i18n service
                    var name = 'weeklySchedulerLocaleService';
                    if ($injector.has(name)) {
                        $log.info('The I18N service has successfully been initialized!');
                        var localeService = $injector.get(name);
                        defaultOptions.labels = localeService.getLang();
                    }
                    else {
                        $log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
                    }
                    // Will hang our model change listeners
                    this.$modelChangeListeners = [];
                }],
            controllerAs: 'schedulerCtrl',
            link: function (scope, element, attrs, schedulerCtrl) {
                var optionsFn = $parse(attrs.options), options = angular.extend(defaultOptions, optionsFn(scope) || {});
                // Get the schedule container element
                var el = element[0].querySelector(defaultOptions.selector);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9pbmplY3QvaW5qZWN0LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbG9jYWxlL2xvY2FsZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbW9udGhseS1ncmlkL21vbnRobHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvdGltZS90aW1lLXNlcnZpY2VzLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LWdyaWQvd2Vla2x5LWdyaWQudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2xvdC93ZWVrbHktc2xvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBRS9FLE1BQU0sQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLFVBQVUscUJBQXFCO1FBQzlFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztZQUM5QixJQUFJLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDO1lBQ2xCLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsRUFBQztZQUNoRixxQkFBcUIsRUFBRSwrQkFBK0I7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7S0FFRixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLDhCQUE4QixFQUFFLE1BQU07SUFDekYsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJO1FBRTdDLE1BQU0sQ0FBQyxLQUFLLEdBQUc7WUFDYixNQUFNLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxFQUFDLHNCQUFzQixDQUFDO1lBQ2pDLEtBQUssRUFBRSxDQUFDO29CQUNOLEtBQUssRUFBRSxRQUFRO29CQUNmLFFBQVEsRUFBRSxLQUFLO29CQUNmLFNBQVMsRUFBRTt3QkFDVCxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQztxQkFDM0U7aUJBQ0YsQ0FBQztTQUNILENBQUM7UUFFRixRQUFRLENBQUM7WUFDUCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDOUMsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsU0FBUyxFQUFFO3dCQUNULEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO3dCQUMxRSxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQztxQkFDM0U7aUJBQ0YsRUFBRTtvQkFDRCxLQUFLLEVBQUUsUUFBUTtvQkFDZixTQUFTLEVBQUU7d0JBQ1QsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUM7d0JBQzFFLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO3FCQUMzRTtpQkFDRixDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWE7WUFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxjQUFjLEdBQUc7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdELGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxPQUFPO2dCQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7QUNyRFIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztBQUVsRSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDckUsSUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBRXJDLElBQUksTUFBTSxDQUFDO0FBRVgsbUJBQW1CLENBQUM7SUFDbEIsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUNsQixNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7S0FDL0I7QUFDSCxDQUFDO0FBRUQscUJBQXFCLEVBQUUsRUFBRSxLQUFLO0lBRTVCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUU1QyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztRQUMzQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXBCLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNMLElBQUksS0FBSyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNyQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7YUFDakQ7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsRUFBRSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7YUFDeEI7aUJBQU07Z0JBQ0wsRUFBRSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7YUFDeEI7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQscUJBQXFCLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSTtJQUVsQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ2pDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbkIsbUZBQW1GO0lBQ25GLDBEQUEwRDtJQUMxRCwyQkFBMkI7SUFDM0IscUNBQXFDO0lBQ3JDLElBQUkseUJBQXlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDO0lBRS9ELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFFcEMsd0JBQXdCO0lBQ3hCLHVCQUF1QjtJQUN2QixJQUFJLFFBQVEsR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEMsSUFBSSxVQUFVLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztJQUU5QixJQUFJLG1CQUFtQixHQUFHLFVBQVUsR0FBRyxRQUFRLENBQUM7SUFDaEQsSUFBSSx3QkFBd0IsR0FBRyxDQUFDLG1CQUFtQixHQUFHLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUU1RSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsd0JBQXdCLEdBQUcsR0FBRyxDQUFDO0lBRTNELElBQUkseUJBQXlCLEtBQUssU0FBUyxFQUFFO1FBQzNDLHlDQUF5QztRQUN6QyxFQUFFLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO0tBQzdDO1NBQU07UUFDTCxzRUFBc0U7UUFDdEUsRUFBRSxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsR0FBRyxDQUFDLHlCQUF5QixHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztLQUN0RjtBQUNILENBQUM7QUN0RUQ7SUE2Q0UseUJBQ1UsU0FBbUM7UUFEN0MsaUJBR0M7UUFGUyxjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQTVDN0MsYUFBUSxHQUFHLEdBQUcsQ0FBQztRQUVmLFVBQUssR0FBRztZQUNOLE1BQU0sRUFBRSxHQUFHO1lBQ1gsVUFBVSxFQUFFLEdBQUc7WUFDZixXQUFXLEVBQUUsR0FBRztTQUNqQixDQUFDO1FBRUYsU0FBSSxHQUFHLFVBQUMsS0FBSyxFQUFFLE9BQWlDO1lBQzlDLElBQUksU0FBUyxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRVYsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxLQUFLO2dCQUM1QiwrQ0FBK0M7Z0JBQy9DLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFFdkIsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBRWhCLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNyQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFakMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO29CQUNyQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3JCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxtQkFBbUIsS0FBSztnQkFDdEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQzVCLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtvQkFDaEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDckI7WUFDSCxDQUFDO1lBRUQ7Z0JBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVyQyxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUU7b0JBQ3BCLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztpQkFDcEI7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFBO0lBS0QsQ0FBQztJQUVNLHVCQUFPLEdBQWQ7UUFDRSxJQUFJLFNBQVMsR0FBRyxVQUFDLFNBQVMsSUFBSyxPQUFBLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUE5QixDQUE4QixDQUFDO1FBRTlELFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVsQyxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBdkRNLHFCQUFLLEdBQUcsUUFBUSxDQUFDO0lBd0QxQixzQkFBQztDQXpERCxBQXlEQyxJQUFBO0FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUM5QixTQUFTLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQzVEL0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUM5QixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFcEIsT0FBTztZQUNMLElBQUksRUFBRSxVQUFVLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXO2dCQUMvRCxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNoQixNQUFNLGdIQUFnSCxDQUFDO2lCQUN4SDtnQkFDRCxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQy9CLFdBQVcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxLQUFLO29CQUNyQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2pCLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3ZCLFFBQVEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFO3dCQUN0QixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3hCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0FDbEJOLE9BQU8sQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7QUFFN0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztLQUNsQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLHdCQUF3QjtRQUV2RyxJQUFJLGFBQWEsR0FBRztZQUNsQixJQUFJLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDO1lBQ3RELElBQUksRUFBRTtnQkFDSixPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBQztnQkFDdEUsT0FBTyxFQUFFLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7Z0JBQzFELE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO2dCQUMxRCxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBQzthQUNyRTtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsTUFBTTtZQUUvQixJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFckMsSUFBSSxhQUFhLENBQUMscUJBQXFCLEVBQUU7b0JBQ3ZDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUNyRjthQUNGO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxVQUFVLEVBQUUsT0FBTyxFQUFFLGdCQUFnQjtnQkFFdkcsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7Z0JBRTNCO29CQUNFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDM0IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDekU7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDMUM7b0JBQ0QsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2dCQUVELDRDQUE0QztnQkFDNUMseUJBQXlCLEdBQUc7b0JBQzFCLE9BQU87d0JBQ0wsRUFBRSxFQUFFLEdBQUc7d0JBQ1AsTUFBTSxFQUFFOzRCQUNOLElBQUksRUFBRTtnQ0FDSiwrQ0FBK0M7Z0NBQy9DLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQ0FDdEQsR0FBRyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDOzZCQUM3Qjt5QkFDRjtxQkFDRixDQUFDO2dCQUNKLENBQUM7Z0JBRUQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRTtvQkFDckMsVUFBVSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPO29CQUNMLE9BQU8sRUFBRSxPQUFPO29CQUNoQixPQUFPLEVBQUUsT0FBTztvQkFDaEIsR0FBRyxFQUFFLFVBQVUsR0FBRzt3QkFDaEIsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25DLENBQUM7aUJBQ0YsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQ25FTiwyQ0FBMkM7QUFDM0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUM5QixTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsNEJBQTRCLEVBQUUsVUFBVSxXQUFXO1FBRTVFLDBCQUEwQixLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSztZQUMvRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUU7b0JBQ2hDLFVBQVUsRUFBRSxRQUFRO29CQUNwQixHQUFHLEVBQUUsR0FBRztvQkFDUix5QkFBeUIsRUFBRSxVQUFVO2lCQUN0QyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxnQkFBZ0IsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSztZQUMxQyxnQkFBZ0I7WUFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWhCLGlDQUFpQztZQUNqQyxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekUsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLG9DQUFvQztZQUNwQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLEdBQUc7Z0JBQ2pDLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNyQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMvRCxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDtnQkFDRCxVQUFVLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWE7Z0JBQ2xELGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFRO29CQUN6RCxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0FDM0NOLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7S0FFOUIsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLE9BQU8sVUFBVSxLQUFLLEVBQUUsS0FBSztZQUMzQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUU7Z0JBQ2pDLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7b0JBQ3RCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2Q7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7S0FFRixTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsNEJBQTRCLEVBQUUsVUFBVSxXQUFXO1FBQzVFLE9BQU87WUFDTCxRQUFRLEVBQUUsR0FBRztZQUNiLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsV0FBVyxFQUFFLGtEQUFrRDtZQUMvRCxJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhO2dCQUNsRCxJQUFJLElBQUksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUVoQywwREFBMEQ7Z0JBQzFELElBQUksc0JBQXNCLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXZELElBQUksVUFBVSxHQUFHLFVBQVUsR0FBRztvQkFDNUIsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzVELENBQUMsQ0FBQztnQkFFRixJQUFJLFVBQVUsR0FBRyxVQUFVLEtBQUs7b0JBQzlCLElBQUksT0FBTyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsR0FBRztvQkFDaEMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQixHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFFL0MsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN6RCxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRXJELEtBQUssQ0FBQyxNQUFNLENBQUM7d0JBQ1gsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7NEJBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO3lCQUNyQjt3QkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBQyxDQUFDLENBQUM7b0JBQzFFLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQztnQkFFRixJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFFM0QsWUFBWSxDQUFDLEdBQUcsQ0FBQztvQkFDZixLQUFLLEVBQUUsaUJBQWlCLEdBQUcsSUFBSTtpQkFDaEMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztvQkFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO29CQUVyRCxZQUFZLENBQUMsR0FBRyxDQUFDO3dCQUNmLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxpQkFBaUIsR0FBRyxDQUFDLEdBQUcsSUFBSTtxQkFDdEQsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSztvQkFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQzNCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQzt3QkFDckQsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7d0JBQ3hDLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFFMUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2hFLElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxzQkFBc0IsQ0FBQzt3QkFFekMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDckI7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1NBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7QUNoRk4sT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUM5QixPQUFPLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxPQUFPO1FBRWxFLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUNwQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUM7UUFDbEIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBRWhCLE9BQU87WUFDTCxLQUFLLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsTUFBTSxFQUFFLFlBQVk7YUFDckI7WUFDRCxFQUFFLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNuQixPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU87Z0JBQ3RDLElBQUksSUFBSSxFQUFFO29CQUNSLElBQUksWUFBWSxDQUFDO29CQUNqQixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3hCLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzdCO3lCQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO3dCQUNoQyxZQUFZLEdBQUcsSUFBSSxDQUFDO3FCQUNyQjt5QkFBTTt3QkFDTCxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7cUJBQzdDO29CQUNELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztpQkFDL0Q7WUFDSCxDQUFDO1lBQ0QsT0FBTyxFQUFFLFVBQVUsTUFBTSxFQUFFLE1BQU07Z0JBQy9CLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELGVBQWUsRUFBRSxVQUFVLEtBQUssRUFBRSxHQUFHO2dCQUNuQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsUUFBUSxFQUFFLFVBQVUsS0FBSyxFQUFFLEdBQUc7Z0JBQzVCLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUNELFNBQVMsRUFBRSxVQUFVLEtBQUssRUFBRSxHQUFHO2dCQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFDRCxpQkFBaUIsRUFBRSxVQUFVLE9BQU8sRUFBRSxPQUFPO2dCQUMzQyxJQUFJLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUNuQixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ25ELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUUzQywrQkFBK0I7Z0JBQy9CLHlFQUF5RTtnQkFDekUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzlCLElBQUksWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoRixJQUFJLFVBQVUsR0FBRyxDQUFDLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoRixJQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNqRixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO29CQUV6RCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO29CQUVsRiwyQ0FBMkM7b0JBQzNDLHVGQUF1RjtpQkFDeEY7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO0FDOUROLDJDQUEyQztBQUMzQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBQzlCLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUV4QiwwQkFBMEIsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSztZQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUU7b0JBQ2hDLFVBQVUsRUFBRSxPQUFPO29CQUNuQixHQUFHLEVBQUUsR0FBRztpQkFDVCxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxnQkFBZ0IsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSztZQUMxQyxJQUFJLENBQUMsQ0FBQztZQUNOLG9DQUFvQztZQUNwQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzlCLElBQUksUUFBUSxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUM7WUFDL0IsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEdBQUcsR0FBRyxFQUFDLENBQUMsQ0FBQztZQUM1RCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoRCxnQkFBZ0I7WUFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWhCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QixJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9CLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3JDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUM3QyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QztnQkFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO1FBRUgsQ0FBQztRQUVELE9BQU87WUFDTCxRQUFRLEVBQUUsR0FBRztZQUNiLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYTtnQkFDbEQsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO29CQUN4QixNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRDtnQkFDRCxhQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTtvQkFDekQsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztBQy9DTixzREFBc0Q7QUFDdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztLQUU5QixTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxFQUFFLFVBQVUsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJO1FBRWhILElBQUksY0FBYyxHQUFHO1lBQ25CLFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSwwQkFBMEI7U0FDckMsQ0FBQztRQUVGOzs7OztXQUtHO1FBQ0gsZ0JBQWdCLFNBQVMsRUFBRSxPQUFPO1lBQ2hDLElBQUksR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDO1lBRW5CLDZDQUE2QztZQUM3QyxJQUFJLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE9BQU8sRUFBRSxJQUFJO2dCQUNqRSxPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUQsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0IsNkNBQTZDO1lBQzdDLElBQUksT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsT0FBTyxFQUFFLElBQUk7Z0JBQ2pFLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXBELHNEQUFzRDtZQUN0RCxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVyRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztZQUM3RixvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV0RCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsT0FBTztZQUNMLFFBQVEsRUFBRSxHQUFHO1lBQ2IsT0FBTyxFQUFFLGlCQUFpQjtZQUMxQixVQUFVLEVBQUUsSUFBSTtZQUNoQixXQUFXLEVBQUUsNERBQTREO1lBQ3pFLFVBQVUsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLFNBQVM7b0JBQzNDLDhCQUE4QjtvQkFDOUIsSUFBSSxJQUFJLEdBQUcsOEJBQThCLENBQUM7b0JBQzFDLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO3dCQUNqRSxJQUFJLGFBQWEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN4QyxjQUFjLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDakQ7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyw0RkFBNEYsQ0FBQyxDQUFDO3FCQUN6RztvQkFFRCx1Q0FBdUM7b0JBQ3ZDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQztZQUNGLFlBQVksRUFBRSxlQUFlO1lBQzdCLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWE7Z0JBQ2xELElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQ25DLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBRW5FLHFDQUFxQztnQkFDckMsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNELHVCQUF1QixLQUFLO29CQUMxQiwwQkFBMEI7b0JBQzFCLElBQUksS0FBSyxFQUFFO3dCQUVULDhCQUE4Qjt3QkFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQzNCLE1BQU0sa0VBQWtFLENBQUM7eUJBQzFFO3dCQUVELCtDQUErQzt3QkFDL0MsYUFBYSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7d0JBRTVCLGdDQUFnQzt3QkFDaEMsYUFBYSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE1BQU0sRUFBRSxJQUFJOzRCQUMvRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUUvQixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDbEQsMEVBQTBFO2dDQUMxRSxnREFBZ0Q7Z0NBQ2hELENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUN0RSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FDcEIsQ0FBQzt3QkFDSixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBRWpCLGlFQUFpRTt3QkFDakUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO3dCQUUxRSw0Q0FBNEM7d0JBQzVDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxRQUFROzRCQUM1RCxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNqQyxDQUFDLENBQUMsQ0FBQztxQkFDSjtnQkFDSCxDQUFDO2dCQUVELElBQUksRUFBRSxFQUFFO29CQUNOLHlEQUF5RDtvQkFDekQsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFFcEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBUyxDQUFDLEVBQUUsSUFBSTt3QkFDekMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxDQUFDO29CQUVILGFBQWEsQ0FBQyxFQUFFLEdBQUc7d0JBQ2pCLE1BQU0sRUFBRSxVQUFVLFNBQVMsRUFBRSxhQUFhLEVBQUUsYUFBYTs0QkFDdkQsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQ0FDeEMsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDOzZCQUNsRTt3QkFDSCxDQUFDO3FCQUNGLENBQUM7b0JBRUY7O3VCQUVHO29CQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUVuRDs7dUJBRUc7b0JBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUMsRUFBRSxNQUFNO3dCQUMzRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUU7NEJBQ3hCLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzt5QkFDdEM7d0JBQ0QsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM5RCxDQUFDLENBQUMsQ0FBQztpQkFDSjtZQUNILENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztBQ3RJTixPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0tBRTlCLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLFdBQVc7UUFDM0UsT0FBTztZQUNMLFFBQVEsRUFBRSxHQUFHO1lBQ2IsT0FBTyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDO1lBQ3hDLFdBQVcsRUFBRSxrREFBa0Q7WUFDL0QsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSztnQkFDMUMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ25DLElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDO2dCQUNsQyxJQUFJLGlCQUFpQixHQUFHLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxDQUFDO2dCQUUvRSxJQUFJLFVBQVUsR0FBRyxVQUFVLEtBQUs7b0JBQzlCLElBQUksT0FBTyxHQUFHLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO29CQUNqRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2xELENBQUMsQ0FBQztnQkFFRixJQUFJLGFBQWEsR0FBRztvQkFDbEIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztvQkFDOUIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ3JDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO3dCQUM1QixJQUFJLEVBQUUsS0FBSyxRQUFRLEVBQUU7NEJBQ25CLCtCQUErQjs0QkFDL0IsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO2dDQUN4RCxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzNDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQ0FDdEIsUUFBUSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDOzZCQUMzQjs0QkFDRCx1Q0FBdUM7aUNBQ2xDLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtnQ0FDN0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzZCQUM1Qzs0QkFDRCw2Q0FBNkM7aUNBQ3hDLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRTtnQ0FDM0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUMzQyxRQUFRLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7NkJBQzNCOzRCQUNELCtDQUErQztpQ0FDMUMsSUFBSSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFO2dDQUMvRCxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzNDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQzs2QkFDdkI7eUJBQ0Y7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDO2dCQUVGOzttQkFFRztnQkFDSCxJQUFJLFVBQVUsR0FBRztvQkFDZixXQUFXLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNwQyxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0UsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDekMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqQixDQUFDLENBQUM7Z0JBRUYsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQztvQkFDMUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNuQixVQUFVLEVBQUUsQ0FBQztnQkFDZixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRTtvQkFDdEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDckMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUU7b0JBQ3ZCLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUdILElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO29CQUNqQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUc7d0JBQ3ZCLHNCQUFzQixHQUFHLElBQUksQ0FBQzt3QkFDOUIsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNwQixDQUFDLENBQUM7b0JBRUYsS0FBSyxDQUFDLGNBQWMsR0FBRzt3QkFDckIsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO3dCQUMvQixLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3BCLENBQUMsQ0FBQztvQkFFRixLQUFLLENBQUMsU0FBUyxHQUFHO3dCQUNoQixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUUzQixXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNqQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFFakMsaUJBQWlCLEdBQUcsRUFBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFDLENBQUM7b0JBQzdGLENBQUMsQ0FBQztvQkFFRixLQUFLLENBQUMsT0FBTyxHQUFHO3dCQUVkLHVDQUF1Qzt3QkFDdkMsNkNBQTZDO3dCQUM3QyxVQUFVLENBQUM7NEJBQ1QsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDbkMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVSLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzlCLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBRXBDLGFBQWEsRUFBRSxDQUFDO3dCQUNoQixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pCLENBQUMsQ0FBQztvQkFFRixLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQzt3QkFDeEIsSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQzt3QkFDaEMsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUUxQixJQUFJLHNCQUFzQixFQUFFOzRCQUMxQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQzs0QkFFM0QsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxRQUFRLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtnQ0FDcEUsV0FBVyxDQUFDLGFBQWEsQ0FBQztvQ0FDeEIsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHO2lDQUNaLENBQUMsQ0FBQztnQ0FDSCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7NkJBQ3ZCO3lCQUNGOzZCQUFNOzRCQUNMLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDOzRCQUV2RCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssTUFBTSxJQUFJLE1BQU0sSUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQ0FDekUsV0FBVyxDQUFDLGFBQWEsQ0FBQztvQ0FDeEIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO29DQUNmLEdBQUcsRUFBRSxNQUFNO2lDQUNaLENBQUMsQ0FBQztnQ0FDSCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7NkJBQ3ZCO3lCQUNGO29CQUNILENBQUMsQ0FBQztvQkFFRixLQUFLLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQzt3QkFDdEIsSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQzt3QkFDaEMsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDO3dCQUUvRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQzt3QkFDM0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUM7d0JBRTdDLElBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDcEUsV0FBVyxDQUFDLGFBQWEsQ0FBQztnQ0FDeEIsS0FBSyxFQUFFLFFBQVE7Z0NBQ2YsR0FBRyxFQUFFLE1BQU07NkJBQ1osQ0FBQyxDQUFDOzRCQUNILFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzt5QkFDdkI7b0JBQ0gsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELDBCQUEwQjtnQkFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQixxREFBcUQ7Z0JBQ3JELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO29CQUM5QyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNyRixXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNqRiwwR0FBMEc7b0JBQzFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDdEUsT0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxxREFBcUQ7Z0JBQ3JELFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHVCQUF1QixLQUFLO29CQUN2RCxJQUFJLEVBQUUsR0FBRzt3QkFDUCxLQUFLLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDO3dCQUMzRSxHQUFHLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO3FCQUN4RSxDQUFDO29CQUNGLHFEQUFxRDtvQkFDckQsT0FBTyxFQUFFLENBQUM7Z0JBQ1osQ0FBQyxDQUFDLENBQUM7Z0JBRUgsV0FBVyxDQUFDLE9BQU8sR0FBRztvQkFDcEIsSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQztvQkFDaEMsSUFBSSxHQUFHLEdBQUc7d0JBQ1IsSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRzt3QkFDekMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsR0FBRztxQkFDdEQsQ0FBQztvQkFFRixtREFBbUQ7b0JBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLENBQUMsQ0FBQztnQkFFRixLQUFLLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFO29CQUN4QyxpRkFBaUY7b0JBQ2pGLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6Im5nLXdlZWtseS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWNsYXJlIHZhciBtb21lbnQ7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnZGVtb0FwcCcsIFsnbmdBbmltYXRlJywgJ3dlZWtseVNjaGVkdWxlcicsICd3ZWVrbHlTY2hlZHVsZXJJMThOJ10pXHJcblxyXG4gIC5jb25maWcoWyd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlUHJvdmlkZXInLCBmdW5jdGlvbiAobG9jYWxlU2VydmljZVByb3ZpZGVyKSB7XHJcbiAgICBsb2NhbGVTZXJ2aWNlUHJvdmlkZXIuY29uZmlndXJlKHtcclxuICAgICAgZG95czogeydlcy1lcyc6IDR9LFxyXG4gICAgICBsYW5nOiB7J2VzLWVzJzoge21vbnRoOiAnTWVzJywgd2Vla05iOiAnbsO6bWVybyBkZSBsYSBzZW1hbmEnLCBhZGROZXc6ICdBw7FhZGlyJ319LFxyXG4gICAgICBsb2NhbGVMb2NhdGlvblBhdHRlcm46ICcvYW5ndWxhci1sb2NhbGVfe3tsb2NhbGV9fS5qcydcclxuICAgIH0pO1xyXG4gIH1dKVxyXG5cclxuICAuY29udHJvbGxlcignRGVtb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckdGltZW91dCcsICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJywgJyRsb2cnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHRpbWVvdXQsIGxvY2FsZVNlcnZpY2UsICRsb2cpIHtcclxuXHJcbiAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICBsb2NhbGU6IGxvY2FsZVNlcnZpY2UuJGxvY2FsZS5pZCxcclxuICAgICAgICBvcHRpb25zOiB7Lyptb25vU2NoZWR1bGU6IHRydWUqL30sXHJcbiAgICAgICAgaXRlbXM6IFt7XHJcbiAgICAgICAgICBsYWJlbDogJ0l0ZW0gMScsXHJcbiAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAge3N0YXJ0OiBtb21lbnQoJzIwMTUtMTItMjcnKS50b0RhdGUoKSwgZW5kOiBtb21lbnQoJzIwMTYtMDgtMDEnKS50b0RhdGUoKX1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRzY29wZS5tb2RlbC5pdGVtcyA9ICRzY29wZS5tb2RlbC5pdGVtcy5jb25jYXQoW3tcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAyJyxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNi0wNS0wMycpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNy0wMi0wMScpLnRvRGF0ZSgpfSxcclxuICAgICAgICAgICAge3N0YXJ0OiBtb21lbnQoJzIwMTUtMTEtMjAnKS50b0RhdGUoKSwgZW5kOiBtb21lbnQoJzIwMTYtMDItMDEnKS50b0RhdGUoKX1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICBsYWJlbDogJ0l0ZW0gMycsXHJcbiAgICAgICAgICBzY2hlZHVsZXM6IFtcclxuICAgICAgICAgICAge3N0YXJ0OiBtb21lbnQoJzIwMTctMDgtMDknKS50b0RhdGUoKSwgZW5kOiBtb21lbnQoJzIwMTctMDgtMjEnKS50b0RhdGUoKX0sXHJcbiAgICAgICAgICAgIHtzdGFydDogbW9tZW50KCcyMDE3LTA5LTEyJykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE3LTEwLTEyJykudG9EYXRlKCl9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfV0pO1xyXG4gICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgIHRoaXMuZG9Tb21ldGhpbmcgPSBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIG1vZGVsIGhhcyBjaGFuZ2VkIScsIGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLm9uTG9jYWxlQ2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgaXMgY2hhbmdpbmcgdG8nLCAkc2NvcGUubW9kZWwubG9jYWxlKTtcclxuICAgICAgICBsb2NhbGVTZXJ2aWNlLnNldCgkc2NvcGUubW9kZWwubG9jYWxlKS50aGVuKGZ1bmN0aW9uICgkbG9jYWxlKSB7XHJcbiAgICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbG9jYWxlIGNoYW5nZWQgdG8nLCAkbG9jYWxlLmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJywgWyduZ1dlZWtseVNjaGVkdWxlclRlbXBsYXRlcyddKTtcclxuXHJcbnZhciBHUklEX1RFTVBMQVRFID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwiZ3JpZC1pdGVtXCI+PC9kaXY+Jyk7XHJcbnZhciBDTElDS19PTl9BX0NFTEwgPSAnY2xpY2tPbkFDZWxsJztcclxuXHJcbnZhciBpc0N0cmw7XHJcblxyXG5mdW5jdGlvbiBjdHJsQ2hlY2soZSkge1xyXG4gIGlmIChlLndoaWNoID09PSAxNykge1xyXG4gICAgaXNDdHJsID0gZS50eXBlID09PSAna2V5ZG93bic7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBtb3VzZVNjcm9sbChlbCwgZGVsdGEpIHtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjdHJsQ2hlY2spO1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGN0cmxDaGVjayk7XHJcblxyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICBpZiAoaXNDdHJsKSB7XHJcbiAgICAgIHZhciBzdHlsZSA9IGVsLmZpcnN0Q2hpbGQuc3R5bGUsIGN1cnJlbnRXaWR0aCA9IHBhcnNlSW50KHN0eWxlLndpZHRoKTtcclxuICAgICAgaWYgKChlLndoZWVsRGVsdGEgfHwgZS5kZXRhaWwpID4gMCkge1xyXG4gICAgICAgIHN0eWxlLndpZHRoID0gKGN1cnJlbnRXaWR0aCArIDIgKiBkZWx0YSkgKyAnJSc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gY3VycmVudFdpZHRoIC0gMiAqIGRlbHRhO1xyXG4gICAgICAgIHN0eWxlLndpZHRoID0gKHdpZHRoID4gMTAwID8gd2lkdGggOiAxMDApICsgJyUnO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgZWwuc2Nyb2xsTGVmdCAtPSBkZWx0YTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0ICs9IGRlbHRhO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHpvb21JbkFDZWxsKGVsLCBldmVudCwgZGF0YSkge1xyXG5cclxuICB2YXIgbmJFbGVtZW50cyA9IGRhdGEubmJFbGVtZW50cztcclxuICB2YXIgaWR4ID0gZGF0YS5pZHg7XHJcbiAgLy8gcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyBpcyB1c2VkIHdoZW4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGdyaWQgaXMgbm90IGZ1bGxcclxuICAvLyBGb3IgaW5zdGFuY2UsIGluIHRoZSBleGFtcGxlIGJlbG93IGBmZWIgMTdgIGlzIG5vdCBmdWxsXHJcbiAgLy8gZmViIDE3ICAgICAgICAgIG1hcmNoIDE3XHJcbiAgLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gIHZhciBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nID0gZGF0YS5wZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nO1xyXG5cclxuICB2YXIgY29udGFpbmVyV2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgLy8gbGVhdmUgKDEvMykgZWFjaCBzaWRlXHJcbiAgLy8gMS8zIHwgICAgMy8zICAgfCAxLzNcclxuICB2YXIgYm94V2lkdGggPSBjb250YWluZXJXaWR0aCAvICg1IC8gMyk7XHJcbiAgdmFyIGd1dHRlclNpemUgPSBib3hXaWR0aCAvIDM7XHJcblxyXG4gIHZhciBzY2hlZHVsZUFyZWFXaWR0aFB4ID0gbmJFbGVtZW50cyAqIGJveFdpZHRoO1xyXG4gIHZhciBzY2hlZHVsZUFyZWFXaWR0aFBlcmNlbnQgPSAoc2NoZWR1bGVBcmVhV2lkdGhQeCAvIGNvbnRhaW5lcldpZHRoKSAqIDEwMDtcclxuXHJcbiAgZWwuZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCArICclJztcclxuXHJcbiAgaWYgKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gQWxsIGNlbGxzIG9mIGEgbGluZSBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgIGVsLnNjcm9sbExlZnQgPSBpZHggKiBib3hXaWR0aCAtIGd1dHRlclNpemU7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIFNpemVzIG9mIGNlbGxzIGluIGEgbGluZSBjb3VsZCBkaWZmZXJlbnQgKGVzcGVjaWFsbHkgdGhlIGZpcnN0IG9uZSlcclxuICAgIGVsLnNjcm9sbExlZnQgPSBzY2hlZHVsZUFyZWFXaWR0aFB4ICogKHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgLyAxMDApIC0gZ3V0dGVyU2l6ZTtcclxuICB9XHJcbn1cclxuIiwiY2xhc3MgSGFuZGxlRGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaGFuZGxlJztcclxuICByZXN0cmljdCA9ICdBJztcclxuXHJcbiAgc2NvcGUgPSB7XHJcbiAgICBvbmRyYWc6ICc9JyxcclxuICAgIG9uZHJhZ3N0b3A6ICc9JyxcclxuICAgIG9uZHJhZ3N0YXJ0OiAnPSdcclxuICB9O1xyXG5cclxuICBsaW5rID0gKHNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpID0+IHtcclxuICAgIHZhciAkZG9jdW1lbnQgPSB0aGlzLiRkb2N1bWVudDtcclxuICAgIHZhciB4ID0gMDtcclxuICAgIFxyXG4gICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBkcmFnZ2luZyBvZiBzZWxlY3RlZCBjb250ZW50XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICB4ID0gZXZlbnQucGFnZVg7XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2V1cCcsIG1vdXNldXApO1xyXG5cclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZ3N0YXJ0KSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlKGV2ZW50KSB7XHJcbiAgICAgIHZhciBkZWx0YSA9IGV2ZW50LnBhZ2VYIC0geDtcclxuICAgICAgaWYgKHNjb3BlLm9uZHJhZykge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZyhkZWx0YSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZXVwKCkge1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmUpO1xyXG4gICAgICAkZG9jdW1lbnQudW5iaW5kKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RvcCkge1xyXG4gICAgICAgIHNjb3BlLm9uZHJhZ3N0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlICRkb2N1bWVudDogYW5ndWxhci5JRG9jdW1lbnRTZXJ2aWNlXHJcbiAgKSB7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoJGRvY3VtZW50KSA9PiBuZXcgSGFuZGxlRGlyZWN0aXZlKCRkb2N1bWVudCk7XHJcblxyXG4gICAgZGlyZWN0aXZlLiRpbmplY3QgPSBbJyRkb2N1bWVudCddO1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEhhbmRsZURpcmVjdGl2ZS4kbmFtZSwgSGFuZGxlRGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoJ2luamVjdCcsIFtmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGluazogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgY29udHJvbGxlciwgJHRyYW5zY2x1ZGUpIHtcclxuICAgICAgICBpZiAoISR0cmFuc2NsdWRlKSB7XHJcbiAgICAgICAgICB0aHJvdyAnSWxsZWdhbCB1c2Ugb2YgbmdUcmFuc2NsdWRlIGRpcmVjdGl2ZSBpbiB0aGUgdGVtcGxhdGUhIE5vIHBhcmVudCBkaXJlY3RpdmUgdGhhdCByZXF1aXJlcyBhIHRyYW5zY2x1c2lvbiBmb3VuZC4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaW5uZXJTY29wZSA9ICRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgJHRyYW5zY2x1ZGUoaW5uZXJTY29wZSwgZnVuY3Rpb24gKGNsb25lKSB7XHJcbiAgICAgICAgICAkZWxlbWVudC5lbXB0eSgpO1xyXG4gICAgICAgICAgJGVsZW1lbnQuYXBwZW5kKGNsb25lKTtcclxuICAgICAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaW5uZXJTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJywgWyd0bWguZHluYW1pY0xvY2FsZSddKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJylcclxuICAucHJvdmlkZXIoJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCBbJ3RtaER5bmFtaWNMb2NhbGVQcm92aWRlcicsIGZ1bmN0aW9uICh0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgICAgZG95czogeydkZS1kZSc6IDQsICdlbi1nYic6IDQsICdlbi11cyc6IDYsICdmci1mcic6IDR9LFxyXG4gICAgICBsYW5nOiB7XHJcbiAgICAgICAgJ2RlLWRlJzoge21vbnRoOiAnTW9uYXQnLCB3ZWVrTmI6ICdXb2NoZW51bW1lcicsIGFkZE5ldzogJ0hpbnp1ZsO8Z2VuJ30sXHJcbiAgICAgICAgJ2VuLWdiJzoge21vbnRoOiAnTW9udGgnLCB3ZWVrTmI6ICdXZWVrICMnLCBhZGROZXc6ICdBZGQnfSxcclxuICAgICAgICAnZW4tdXMnOiB7bW9udGg6ICdNb250aCcsIHdlZWtOYjogJ1dlZWsgIycsIGFkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdmci1mcic6IHttb250aDogJ01vaXMnLCB3ZWVrTmI6ICdOwrAgZGUgc2VtYWluZScsIGFkZE5ldzogJ0Fqb3V0ZXInfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG5cclxuICAgICAgaWYgKGNvbmZpZyAmJiBhbmd1bGFyLmlzT2JqZWN0KGNvbmZpZykpIHtcclxuICAgICAgICBhbmd1bGFyLm1lcmdlKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybikge1xyXG4gICAgICAgICAgdG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyLmxvY2FsZUxvY2F0aW9uUGF0dGVybihkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJHJvb3RTY29wZScsICckbG9jYWxlJywgJ3RtaER5bmFtaWNMb2NhbGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2FsZSwgdG1oRHluYW1pY0xvY2FsZSkge1xyXG5cclxuICAgICAgdmFyIG1vbWVudExvY2FsZUNhY2hlID0ge307XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMYW5nKCkge1xyXG4gICAgICAgIHZhciBrZXkgPSAkbG9jYWxlLmlkO1xyXG4gICAgICAgIGlmICghbW9tZW50TG9jYWxlQ2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgbW9tZW50TG9jYWxlQ2FjaGVba2V5XSA9IGdldE1vbWVudExvY2FsZShrZXkpO1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkLCBtb21lbnRMb2NhbGVDYWNoZVtrZXldLmxvY2FsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UganVzdCBuZWVkIGZldyBtb21lbnQgbG9jYWwgaW5mb3JtYXRpb25cclxuICAgICAgZnVuY3Rpb24gZ2V0TW9tZW50TG9jYWxlKGtleSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTsiLCIvKiBnbG9iYWwgR1JJRF9URU1QTEFURSwgQ0xJQ0tfT05fQV9DRUxMICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoJ21vbnRobHlHcmlkJywgWyd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZScsIGZ1bmN0aW9uICh0aW1lU2VydmljZSkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRvdGFsV2lkdGgsIG5iTW9udGhzLCBpZHgsIHNjb3BlKSB7XHJcbiAgICAgIGNoaWxkLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNjb3BlLiRicm9hZGNhc3QoQ0xJQ0tfT05fQV9DRUxMLCB7XHJcbiAgICAgICAgICBuYkVsZW1lbnRzOiBuYk1vbnRocyxcclxuICAgICAgICAgIGlkeDogaWR4LFxyXG4gICAgICAgICAgcGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZzogdG90YWxXaWR0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBtb2RlbCkge1xyXG4gICAgICAvLyBDbGVhbiBlbGVtZW50XHJcbiAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0aW9uIG1vbnRoIGRpc3RyaWJ1dGlvblxyXG4gICAgICB2YXIgbW9udGhzID0gdGltZVNlcnZpY2UubW9udGhEaXN0cmlidXRpb24obW9kZWwubWluRGF0ZSwgbW9kZWwubWF4RGF0ZSk7XHJcblxyXG4gICAgICB2YXIgdG90YWxXaWR0aCA9IDA7XHJcbiAgICAgIC8vIERlcGxveSB0aGUgZ3JpZCBzeXN0ZW0gb24gZWxlbWVudFxyXG4gICAgICBtb250aHMuZm9yRWFjaChmdW5jdGlvbiAobW9udGgsIGlkeCkge1xyXG4gICAgICAgIHZhciBjaGlsZCA9IEdSSURfVEVNUExBVEUuY2xvbmUoKS5jc3MoeyB3aWR0aDogbW9udGgud2lkdGggKyAnJScgfSk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdG90YWxXaWR0aCwgbW9udGhzLmxlbmd0aCwgaWR4LCBzY29wZSk7XHJcbiAgICAgICAgICBjaGlsZC50ZXh0KHRpbWVTZXJ2aWNlLmRGKG1vbnRoLnN0YXJ0LnRvRGF0ZSgpLCAnTU1NIHl5eXknKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gbW9udGgud2lkdGg7XHJcbiAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hpbGQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICByZXF1aXJlOiAnXndlZWtseVNjaGVkdWxlcicsXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwpIHtcclxuICAgICAgICBzY2hlZHVsZXJDdHJsLiRtb2RlbENoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uIChuZXdNb2RlbCkge1xyXG4gICAgICAgICAgZG9HcmlkKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmV3TW9kZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuXHJcbiAgLmZpbHRlcignYnlJbmRleCcsIFtmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGlucHV0LCBpbmRleCkge1xyXG4gICAgICB2YXIgcmV0ID0gW107XHJcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnB1dCwgZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgaWYgKGVsLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgICAgcmV0LnB1c2goZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuZGlyZWN0aXZlKCdtdWx0aVNsaWRlcicsIFsnd2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UnLCBmdW5jdGlvbiAodGltZVNlcnZpY2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgIHJlcXVpcmU6ICded2Vla2x5U2NoZWR1bGVyJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICduZy13ZWVrbHktc2NoZWR1bGVyL211bHRpc2xpZGVyL211bHRpc2xpZGVyLmh0bWwnLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsKSB7XHJcbiAgICAgICAgdmFyIGNvbmYgPSBzY2hlZHVsZXJDdHJsLmNvbmZpZztcclxuXHJcbiAgICAgICAgLy8gVGhlIGRlZmF1bHQgc2NoZWR1bGVyIGJsb2NrIHNpemUgd2hlbiBhZGRpbmcgYSBuZXcgaXRlbVxyXG4gICAgICAgIHZhciBkZWZhdWx0TmV3U2NoZWR1bGVTaXplID0gcGFyc2VJbnQoYXR0cnMuc2l6ZSkgfHwgODtcclxuXHJcbiAgICAgICAgdmFyIHZhbFRvUGl4ZWwgPSBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICB2YXIgcGVyY2VudCA9IHZhbCAvIChjb25mLm5iV2Vla3MpO1xyXG4gICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocGVyY2VudCAqIGVsZW1lbnRbMF0uY2xpZW50V2lkdGggKyAwLjUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBwaXhlbFRvVmFsID0gZnVuY3Rpb24gKHBpeGVsKSB7XHJcbiAgICAgICAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gZWxlbWVudFswXS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiAoY29uZi5uYldlZWtzKSArIDAuNSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGFkZFNsb3QgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgICAgc3RhcnQgPSBzdGFydCA+PSAwID8gc3RhcnQgOiAwO1xyXG4gICAgICAgICAgZW5kID0gZW5kIDw9IGNvbmYubmJXZWVrcyA/IGVuZCA6IGNvbmYubmJXZWVrcztcclxuXHJcbiAgICAgICAgICB2YXIgc3RhcnREYXRlID0gdGltZVNlcnZpY2UuYWRkV2Vlayhjb25mLm1pbkRhdGUsIHN0YXJ0KTtcclxuICAgICAgICAgIHZhciBlbmREYXRlID0gdGltZVNlcnZpY2UuYWRkV2Vlayhjb25mLm1pbkRhdGUsIGVuZCk7XHJcblxyXG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBzY29wZS5pdGVtO1xyXG4gICAgICAgICAgICBpZiAoIWl0ZW0uc2NoZWR1bGVzKSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLnNjaGVkdWxlcy5wdXNoKHtzdGFydDogc3RhcnREYXRlLnRvRGF0ZSgpLCBlbmQ6IGVuZERhdGUudG9EYXRlKCl9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBob3ZlckVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudC5maW5kKCdkaXYnKVswXSk7XHJcbiAgICAgICAgdmFyIGhvdmVyRWxlbWVudFdpZHRoID0gdmFsVG9QaXhlbChkZWZhdWx0TmV3U2NoZWR1bGVTaXplKTtcclxuXHJcbiAgICAgICAgaG92ZXJFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICB3aWR0aDogaG92ZXJFbGVtZW50V2lkdGggKyAncHgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGVsZW1lbnQub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICB2YXIgZWxPZmZYID0gZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG5cclxuICAgICAgICAgIGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiBlLnBhZ2VYIC0gZWxPZmZYIC0gaG92ZXJFbGVtZW50V2lkdGggLyAyICsgJ3B4J1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGhvdmVyRWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgIGlmICghZWxlbWVudC5hdHRyKCduby1hZGQnKSkge1xyXG4gICAgICAgICAgICB2YXIgZWxPZmZYID0gZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICAgICAgICB2YXIgcGl4ZWxPbkNsaWNrID0gZXZlbnQucGFnZVggLSBlbE9mZlg7XHJcbiAgICAgICAgICAgIHZhciB2YWxPbkNsaWNrID0gcGl4ZWxUb1ZhbChwaXhlbE9uQ2xpY2spO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gTWF0aC5yb3VuZCh2YWxPbkNsaWNrIC0gZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSAvIDIpO1xyXG4gICAgICAgICAgICB2YXIgZW5kID0gc3RhcnQgKyBkZWZhdWx0TmV3U2NoZWR1bGVTaXplO1xyXG5cclxuICAgICAgICAgICAgYWRkU2xvdChzdGFydCwgZW5kKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSk7IiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLnNlcnZpY2UoJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJywgWyckZmlsdGVyJywgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcclxuXHJcbiAgICB2YXIgTU9OVEggPSAnbW9udGgnO1xyXG4gICAgdmFyIFdFRUsgPSAnd2Vlayc7XHJcbiAgICB2YXIgREFZID0gJ2RheSc7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29uc3Q6IHtcclxuICAgICAgICBNT05USDogTU9OVEgsXHJcbiAgICAgICAgV0VFSzogV0VFSyxcclxuICAgICAgICBGT1JNQVQ6ICdZWVlZLU1NLUREJ1xyXG4gICAgICB9LFxyXG4gICAgICBkRjogJGZpbHRlcignZGF0ZScpLFxyXG4gICAgICBjb21wYXJlOiBmdW5jdGlvbiAoZGF0ZSwgbWV0aG9kLCBsYXN0TWluKSB7XHJcbiAgICAgICAgaWYgKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBkYXRlQXNNb21lbnQ7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgICAgZGF0ZUFzTW9tZW50ID0gbW9tZW50KGRhdGUpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChkYXRlLl9pc0FNb21lbnRPYmplY3QpIHtcclxuICAgICAgICAgICAgZGF0ZUFzTW9tZW50ID0gZGF0ZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDb3VsZCBub3QgcGFyc2UgZGF0ZSBbJyArIGRhdGUgKyAnXSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUFzTW9tZW50W21ldGhvZF0obGFzdE1pbikgPyBkYXRlQXNNb21lbnQgOiBsYXN0TWluO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgYWRkV2VlazogZnVuY3Rpb24gKG1vbWVudCwgbmJXZWVrKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vbWVudC5jbG9uZSgpLmFkZChuYldlZWssIFdFRUspO1xyXG4gICAgICB9LFxyXG4gICAgICB3ZWVrUHJlY2lzZURpZmY6IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZC5jbG9uZSgpLmRpZmYoc3RhcnQuY2xvbmUoKSwgV0VFSywgdHJ1ZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHdlZWtEaWZmOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiBlbmQuY2xvbmUoKS5lbmRPZihXRUVLKS5kaWZmKHN0YXJ0LmNsb25lKCkuc3RhcnRPZihXRUVLKSwgV0VFSykgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgICBtb250aERpZmY6IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuZC5jbG9uZSgpLmVuZE9mKE1PTlRIKS5kaWZmKHN0YXJ0LmNsb25lKCkuc3RhcnRPZihNT05USCksIE1PTlRIKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vbnRoRGlzdHJpYnV0aW9uOiBmdW5jdGlvbiAobWluRGF0ZSwgbWF4RGF0ZSkge1xyXG4gICAgICAgIHZhciBpLCByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgc3RhcnREYXRlID0gbWluRGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgIHZhciBlbmREYXRlID0gbWF4RGF0ZS5jbG9uZSgpO1xyXG4gICAgICAgIHZhciBtb250aERpZmYgPSB0aGlzLm1vbnRoRGlmZihzdGFydERhdGUsIGVuZERhdGUpO1xyXG4gICAgICAgIHZhciBkYXlEaWZmID0gZW5kRGF0ZS5kaWZmKHN0YXJ0RGF0ZSwgREFZKTtcclxuXHJcbiAgICAgICAgLy92YXIgdG90YWwgPSAwLCB0b3RhbERheXMgPSAwO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0RGF0ZS50b0RhdGUoKSwgZW5kRGF0ZS50b0RhdGUoKSwgbW9udGhEaWZmLCBkYXlEaWZmKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbW9udGhEaWZmOyBpKyspIHtcclxuICAgICAgICAgIHZhciBzdGFydE9mTW9udGggPSBpID09PSAwID8gc3RhcnREYXRlIDogc3RhcnREYXRlLmFkZCgxLCBNT05USCkuc3RhcnRPZihNT05USCk7XHJcbiAgICAgICAgICB2YXIgZW5kT2ZNb250aCA9IGkgPT09IG1vbnRoRGlmZiAtIDEgPyBlbmREYXRlIDogc3RhcnREYXRlLmNsb25lKCkuZW5kT2YoTU9OVEgpO1xyXG4gICAgICAgICAgdmFyIGRheUluTW9udGggPSBlbmRPZk1vbnRoLmRpZmYoc3RhcnRPZk1vbnRoLCBEQVkpICsgKGkgIT09IG1vbnRoRGlmZiAtIDEgJiYgMSk7XHJcbiAgICAgICAgICB2YXIgd2lkdGggPSBNYXRoLmZsb29yKGRheUluTW9udGggLyBkYXlEaWZmICogMUU4KSAvIDFFNjtcclxuXHJcbiAgICAgICAgICByZXN1bHQucHVzaCh7c3RhcnQ6IHN0YXJ0T2ZNb250aC5jbG9uZSgpLCBlbmQ6IGVuZE9mTW9udGguY2xvbmUoKSwgd2lkdGg6IHdpZHRofSk7XHJcblxyXG4gICAgICAgICAgLy8gdG90YWxEYXlzICs9IGRheUluTW9udGg7IHRvdGFsICs9IHdpZHRoO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coc3RhcnRPZk1vbnRoLCBlbmRPZk1vbnRoLCBkYXlJbk1vbnRoLCBkYXlEaWZmLCB3aWR0aCwgdG90YWwsIHRvdGFsRGF5cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pOyIsIi8qIGdsb2JhbCBHUklEX1RFTVBMQVRFLCBDTElDS19PTl9BX0NFTEwgKi9cclxuYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcbiAgLmRpcmVjdGl2ZSgnd2Vla2x5R3JpZCcsIFtmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgbmJXZWVrcywgaWR4LCBzY29wZSkge1xyXG4gICAgICBjaGlsZC5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzY29wZS4kYnJvYWRjYXN0KENMSUNLX09OX0FfQ0VMTCwge1xyXG4gICAgICAgICAgbmJFbGVtZW50czogbmJXZWVrcyxcclxuICAgICAgICAgIGlkeDogaWR4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG1vZGVsKSB7XHJcbiAgICAgIHZhciBpO1xyXG4gICAgICAvLyBDYWxjdWxhdGUgd2VlayB3aWR0aCBkaXN0cmlidXRpb25cclxuICAgICAgdmFyIHRpY2tjb3VudCA9IG1vZGVsLm5iV2Vla3M7XHJcbiAgICAgIHZhciB0aWNrc2l6ZSA9IDEwMCAvIHRpY2tjb3VudDtcclxuICAgICAgdmFyIGdyaWRJdGVtRWwgPSBHUklEX1RFTVBMQVRFLmNzcyh7d2lkdGg6IHRpY2tzaXplICsgJyUnfSk7XHJcbiAgICAgIHZhciBub3cgPSBtb2RlbC5taW5EYXRlLmNsb25lKCkuc3RhcnRPZignd2VlaycpO1xyXG5cclxuICAgICAgLy8gQ2xlYW4gZWxlbWVudFxyXG4gICAgICBlbGVtZW50LmVtcHR5KCk7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGlja2NvdW50OyBpKyspIHtcclxuICAgICAgICB2YXIgY2hpbGQgPSBncmlkSXRlbUVsLmNsb25lKCk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMubm9UZXh0KSkge1xyXG4gICAgICAgICAgaGFuZGxlQ2xpY2tFdmVudChjaGlsZCwgdGlja2NvdW50LCBpLCBzY29wZSk7XHJcbiAgICAgICAgICBjaGlsZC50ZXh0KG5vdy5hZGQoaSAmJiAxLCAnd2VlaycpLndlZWsoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoaWxkKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICByZXF1aXJlOiAnXndlZWtseVNjaGVkdWxlcicsXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwpIHtcclxuICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNjaGVkdWxlckN0cmwuY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMucHVzaChmdW5jdGlvbiAobmV3TW9kZWwpIHtcclxuICAgICAgICAgIGRvR3JpZChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5ld01vZGVsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSk7IiwiLyogZ2xvYmFsIG1vdXNlU2Nyb2xsLCBDTElDS19PTl9BX0NFTEwsIHpvb21JbkFDZWxsICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG5cclxuICAuZGlyZWN0aXZlKCd3ZWVrbHlTY2hlZHVsZXInLCBbJyRwYXJzZScsICd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZScsICckbG9nJywgZnVuY3Rpb24gKCRwYXJzZSwgdGltZVNlcnZpY2UsICRsb2cpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICAgIG1vbm9TY2hlZHVsZTogZmFsc2UsXHJcbiAgICAgIHNlbGVjdG9yOiAnLnNjaGVkdWxlLWFyZWEtY29udGFpbmVyJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpZ3VyZSB0aGUgc2NoZWR1bGVyLlxyXG4gICAgICogQHBhcmFtIHNjaGVkdWxlc1xyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm5zIHt7bWluRGF0ZTogKiwgbWF4RGF0ZTogKiwgbmJXZWVrczogKn19XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNvbmZpZyhzY2hlZHVsZXMsIG9wdGlvbnMpIHtcclxuICAgICAgdmFyIG5vdyA9IG1vbWVudCgpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIG1pbiBkYXRlIG9mIGFsbCBzY2hlZHVsZWQgZXZlbnRzXHJcbiAgICAgIHZhciBtaW5EYXRlID0gKHNjaGVkdWxlcyA/IHNjaGVkdWxlcy5yZWR1Y2UoZnVuY3Rpb24gKG1pbkRhdGUsIHNsb3QpIHtcclxuICAgICAgICByZXR1cm4gdGltZVNlcnZpY2UuY29tcGFyZShzbG90LnN0YXJ0LCAnaXNCZWZvcmUnLCBtaW5EYXRlKTtcclxuICAgICAgfSwgbm93KSA6IG5vdykuc3RhcnRPZignd2VlaycpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIG1heCBkYXRlIG9mIGFsbCBzY2hlZHVsZWQgZXZlbnRzXHJcbiAgICAgIHZhciBtYXhEYXRlID0gKHNjaGVkdWxlcyA/IHNjaGVkdWxlcy5yZWR1Y2UoZnVuY3Rpb24gKG1heERhdGUsIHNsb3QpIHtcclxuICAgICAgICByZXR1cm4gdGltZVNlcnZpY2UuY29tcGFyZShzbG90LmVuZCwgJ2lzQWZ0ZXInLCBtYXhEYXRlKTtcclxuICAgICAgfSwgbm93KSA6IG5vdykuY2xvbmUoKS5hZGQoMSwgJ3llYXInKS5lbmRPZignd2VlaycpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIG5iIG9mIHdlZWtzIGNvdmVyZWQgYnkgbWluRGF0ZSA9PiBtYXhEYXRlXHJcbiAgICAgIHZhciBuYldlZWtzID0gdGltZVNlcnZpY2Uud2Vla0RpZmYobWluRGF0ZSwgbWF4RGF0ZSk7XHJcblxyXG4gICAgICB2YXIgcmVzdWx0ID0gYW5ndWxhci5leHRlbmQob3B0aW9ucywge21pbkRhdGU6IG1pbkRhdGUsIG1heERhdGU6IG1heERhdGUsIG5iV2Vla3M6IG5iV2Vla3N9KTtcclxuICAgICAgLy8gTG9nIGNvbmZpZ3VyYXRpb25cclxuICAgICAgJGxvZy5kZWJ1ZygnV2Vla2x5IFNjaGVkdWxlciBjb25maWd1cmF0aW9uOicsIHJlc3VsdCk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgIHJlcXVpcmU6ICd3ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktc2NoZWR1bGVyLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiBbJyRpbmplY3RvcicsIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcclxuICAgICAgICAvLyBUcnkgdG8gZ2V0IHRoZSBpMThuIHNlcnZpY2VcclxuICAgICAgICB2YXIgbmFtZSA9ICd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVTZXJ2aWNlJztcclxuICAgICAgICBpZiAoJGluamVjdG9yLmhhcyhuYW1lKSkge1xyXG4gICAgICAgICAgJGxvZy5pbmZvKCdUaGUgSTE4TiBzZXJ2aWNlIGhhcyBzdWNjZXNzZnVsbHkgYmVlbiBpbml0aWFsaXplZCEnKTtcclxuICAgICAgICAgIHZhciBsb2NhbGVTZXJ2aWNlID0gJGluamVjdG9yLmdldChuYW1lKTtcclxuICAgICAgICAgIGRlZmF1bHRPcHRpb25zLmxhYmVscyA9IGxvY2FsZVNlcnZpY2UuZ2V0TGFuZygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkbG9nLmluZm8oJ05vIEkxOE4gZm91bmQgZm9yIHRoaXMgbW9kdWxlLCBjaGVjayB0aGUgbmcgbW9kdWxlIFt3ZWVrbHlTY2hlZHVsZXJJMThOXSBpZiB5b3UgbmVlZCBpMThuLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gV2lsbCBoYW5nIG91ciBtb2RlbCBjaGFuZ2UgbGlzdGVuZXJzXHJcbiAgICAgICAgdGhpcy4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMgPSBbXTtcclxuICAgICAgfV0sXHJcbiAgICAgIGNvbnRyb2xsZXJBczogJ3NjaGVkdWxlckN0cmwnLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnNGbiA9ICRwYXJzZShhdHRycy5vcHRpb25zKSxcclxuICAgICAgICAgIG9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZChkZWZhdWx0T3B0aW9ucywgb3B0aW9uc0ZuKHNjb3BlKSB8fCB7fSk7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgc2NoZWR1bGUgY29udGFpbmVyIGVsZW1lbnRcclxuICAgICAgICB2YXIgZWwgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoZGVmYXVsdE9wdGlvbnMuc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1vZGVsQ2hhbmdlKGl0ZW1zKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayBpdGVtcyBhcmUgcHJlc2VudFxyXG4gICAgICAgICAgaWYgKGl0ZW1zKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpdGVtcyBhcmUgaW4gYW4gQXJyYXlcclxuICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgJ1lvdSBzaG91bGQgdXNlIHdlZWtseS1zY2hlZHVsZXIgZGlyZWN0aXZlIHdpdGggYW4gQXJyYXkgb2YgaXRlbXMnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBtb2RlbCAodXNlIGl0IGluIHRlbXBsYXRlKVxyXG4gICAgICAgICAgICBzY2hlZHVsZXJDdHJsLml0ZW1zID0gaXRlbXM7XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJzdCBjYWxjdWxhdGUgY29uZmlndXJhdGlvblxyXG4gICAgICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZyA9IGNvbmZpZyhpdGVtcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgIHZhciBzY2hlZHVsZXMgPSBpdGVtLnNjaGVkdWxlcztcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoc2NoZWR1bGVzICYmIHNjaGVkdWxlcy5sZW5ndGggP1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaW4gbXVsdGlTbGlkZXIgbW9kZSwgZW5zdXJlIGEgc2NoZWR1bGUgYXJyYXkgaXMgcHJlc2VudCBvbiBlYWNoIGl0ZW1cclxuICAgICAgICAgICAgICAgIC8vIEVsc2Ugb25seSB1c2UgZmlyc3QgZWxlbWVudCBvZiBzY2hlZHVsZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgKG9wdGlvbnMubW9ub1NjaGVkdWxlID8gaXRlbS5zY2hlZHVsZXMgPSBbc2NoZWR1bGVzWzBdXSA6IHNjaGVkdWxlcykgOlxyXG4gICAgICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMgPSBbXVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sIFtdKSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVuIHJlc2l6ZSBzY2hlZHVsZSBhcmVhIGtub3dpbmcgdGhlIG51bWJlciBvZiB3ZWVrcyBpbiBzY29wZVxyXG4gICAgICAgICAgICBlbC5maXJzdENoaWxkLnN0eWxlLndpZHRoID0gc2NoZWR1bGVyQ3RybC5jb25maWcubmJXZWVrcyAvIDUzICogMjAwICsgJyUnO1xyXG5cclxuICAgICAgICAgICAgLy8gRmluYWxseSwgcnVuIHRoZSBzdWIgZGlyZWN0aXZlcyBsaXN0ZW5lcnNcclxuICAgICAgICAgICAgc2NoZWR1bGVyQ3RybC4kbW9kZWxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICBsaXN0ZW5lcihzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVsKSB7XHJcbiAgICAgICAgICAvLyBJbnN0YWxsIG1vdXNlIHNjcm9sbGluZyBldmVudCBsaXN0ZW5lciBmb3IgSCBzY3JvbGxpbmdcclxuICAgICAgICAgIG1vdXNlU2Nyb2xsKGVsLCAyMCk7XHJcblxyXG4gICAgICAgICAgc2NvcGUuJG9uKENMSUNLX09OX0FfQ0VMTCwgZnVuY3Rpb24oZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB6b29tSW5BQ2VsbChlbCwgZSwgZGF0YSk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBzY2hlZHVsZXJDdHJsLm9uID0ge1xyXG4gICAgICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAgICAgICB2YXIgb25DaGFuZ2VGdW5jdGlvbiA9ICRwYXJzZShhdHRycy5vbkNoYW5nZSkoc2NvcGUpO1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24ob25DaGFuZ2VGdW5jdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvbkNoYW5nZUZ1bmN0aW9uKGl0ZW1JbmRleCwgc2NoZWR1bGVJbmRleCwgc2NoZWR1bGVWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogV2F0Y2ggdGhlIG1vZGVsIGl0ZW1zXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oYXR0cnMuaXRlbXMsIG9uTW9kZWxDaGFuZ2UpO1xyXG5cclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogTGlzdGVuIHRvICRsb2NhbGUgY2hhbmdlIChicm91Z2h0IGJ5IGV4dGVybmFsIG1vZHVsZSB3ZWVrbHlTY2hlZHVsZXJJMThOKVxyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICBzY29wZS4kb24oJ3dlZWtseVNjaGVkdWxlckxvY2FsZUNoYW5nZWQnLCBmdW5jdGlvbiAoZSwgbGFiZWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChzY2hlZHVsZXJDdHJsLmNvbmZpZykge1xyXG4gICAgICAgICAgICAgIHNjaGVkdWxlckN0cmwuY29uZmlnLmxhYmVscyA9IGxhYmVscztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvbk1vZGVsQ2hhbmdlKGFuZ3VsYXIuY29weSgkcGFyc2UoYXR0cnMuaXRlbXMpKHNjb3BlKSwgW10pKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSk7IiwiYW5ndWxhci5tb2R1bGUoJ3dlZWtseVNjaGVkdWxlcicpXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3dlZWtseVNsb3QnLCBbJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJywgZnVuY3Rpb24gKHRpbWVTZXJ2aWNlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICByZXF1aXJlOiBbJ153ZWVrbHlTY2hlZHVsZXInLCAnbmdNb2RlbCddLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ25nLXdlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNsb3Qvd2Vla2x5LXNsb3QuaHRtbCcsXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgICAgdmFyIHNjaGVkdWxlckN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuICAgICAgICB2YXIgY29uZiA9IHNjaGVkdWxlckN0cmwuY29uZmlnO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHNjb3BlLiRwYXJlbnQuJGluZGV4O1xyXG4gICAgICAgIHZhciBjb250YWluZXJFbCA9IGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHJlc2l6ZURpcmVjdGlvbklzU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgIHZhciB2YWx1ZXNPbkRyYWdTdGFydCA9IHtzdGFydDogc2NvcGUuc2NoZWR1bGUuc3RhcnQsIGVuZDogc2NvcGUuc2NoZWR1bGUuZW5kfTtcclxuXHJcbiAgICAgICAgdmFyIHBpeGVsVG9WYWwgPSBmdW5jdGlvbiAocGl4ZWwpIHtcclxuICAgICAgICAgIHZhciBwZXJjZW50ID0gcGl4ZWwgLyBjb250YWluZXJFbFswXS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiBjb25mLm5iV2Vla3MgKyAwLjUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBtZXJnZU92ZXJsYXBzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmFyIHNjaGVkdWxlID0gc2NvcGUuc2NoZWR1bGU7XHJcbiAgICAgICAgICB2YXIgc2NoZWR1bGVzID0gc2NvcGUuaXRlbS5zY2hlZHVsZXM7XHJcbiAgICAgICAgICBzY2hlZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgaWYgKGVsICE9PSBzY2hlZHVsZSkge1xyXG4gICAgICAgICAgICAgIC8vIG1vZGVsIGlzIGluc2lkZSBhbm90aGVyIHNsb3RcclxuICAgICAgICAgICAgICBpZiAoZWwuZW5kID49IHNjaGVkdWxlLmVuZCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5zdGFydCkge1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGUuZW5kID0gZWwuZW5kO1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGUuc3RhcnQgPSBlbC5zdGFydDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gbW9kZWwgY29tcGxldGVseSBjb3ZlcnMgYW5vdGhlciBzbG90XHJcbiAgICAgICAgICAgICAgZWxzZSBpZiAoc2NoZWR1bGUuZW5kID49IGVsLmVuZCAmJiBzY2hlZHVsZS5zdGFydCA8PSBlbC5zdGFydCkge1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBhbm90aGVyIHNsb3QncyBlbmQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICAgICAgICBlbHNlIGlmIChlbC5lbmQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuZW5kIDw9IHNjaGVkdWxlLmVuZCkge1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGVzLnNwbGljZShzY2hlZHVsZXMuaW5kZXhPZihlbCksIDEpO1xyXG4gICAgICAgICAgICAgICAgc2NoZWR1bGUuc3RhcnQgPSBlbC5zdGFydDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gYW5vdGhlciBzbG90J3Mgc3RhcnQgaXMgaW5zaWRlIGN1cnJlbnQgbW9kZWxcclxuICAgICAgICAgICAgICBlbHNlIGlmIChlbC5zdGFydCA+PSBzY2hlZHVsZS5zdGFydCAmJiBlbC5zdGFydCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlLmVuZCA9IGVsLmVuZDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZSBvbiByaWdodCBjbGljayBvbiBzbG90XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGRlbGV0ZVNlbGYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuICAgICAgICAgIGNvbnRhaW5lckVsLnJlbW92ZUNsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICAgICAgICBzY29wZS5pdGVtLnNjaGVkdWxlcy5zcGxpY2Uoc2NvcGUuaXRlbS5zY2hlZHVsZXMuaW5kZXhPZihzY29wZS5zY2hlZHVsZSksIDEpO1xyXG4gICAgICAgICAgY29udGFpbmVyRWwuZmluZCgnd2Vla2x5LXNsb3QnKS5yZW1vdmUoKTtcclxuICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGVsZW1lbnQuZmluZCgnc3BhbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBkZWxldGVTZWxmKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGVsZW1lbnQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGNvbnRhaW5lckVsLmFkZENsYXNzKCdzbG90LWhvdmVyJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGVsZW1lbnQub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKHNjb3BlLml0ZW0uZWRpdGFibGUgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICBzY29wZS5zdGFydFJlc2l6ZVN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2NvcGUuc3RhcnREcmFnKCk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNjb3BlLnN0YXJ0UmVzaXplRW5kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNjb3BlLnN0YXJ0RHJhZygpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzY29wZS5zdGFydERyYWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyRWwuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLmF0dHIoJ25vLWFkZCcsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUuc3RhcnQsIGVuZDogbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZS5lbmR9O1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzY29wZS5lbmREcmFnID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyBwcmV2ZW50cyB1c2VyIGZyb20gYWNjaWRlbnRhbGx5XHJcbiAgICAgICAgICAgIC8vIGFkZGluZyBuZXcgc2xvdCBhZnRlciByZXNpemluZyBvciBkcmFnZ2luZ1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVBdHRyKCduby1hZGQnKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcclxuXHJcbiAgICAgICAgICAgIG1lcmdlT3ZlcmxhcHMoKTtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNjb3BlLnJlc2l6ZSA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHZhciB1aSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzaXplRGlyZWN0aW9uSXNTdGFydCkge1xyXG4gICAgICAgICAgICAgIHZhciBuZXdTdGFydCA9IE1hdGgucm91bmQodmFsdWVzT25EcmFnU3RhcnQuc3RhcnQgKyBkZWx0YSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPD0gdWkuZW5kIC0gMSAmJiBuZXdTdGFydCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHtcclxuICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICBlbmQ6IHVpLmVuZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHZhciBuZXdFbmQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LmVuZCArIGRlbHRhKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHVpLmVuZCAhPT0gbmV3RW5kICYmIG5ld0VuZCA+PSB1aS5zdGFydCArIDEgJiYgbmV3RW5kIDw9IGNvbmYubmJXZWVrcykge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgICAgIHN0YXJ0OiB1aS5zdGFydCxcclxuICAgICAgICAgICAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzY29wZS5kcmFnID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgdmFyIHVpID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICAgICAgICAgdmFyIGRlbHRhID0gcGl4ZWxUb1ZhbChkKTtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gdmFsdWVzT25EcmFnU3RhcnQuZW5kIC0gdmFsdWVzT25EcmFnU3RhcnQuc3RhcnQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG4gICAgICAgICAgICB2YXIgbmV3RW5kID0gTWF0aC5yb3VuZChuZXdTdGFydCArIGR1cmF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1aS5zdGFydCAhPT0gbmV3U3RhcnQgJiYgbmV3U3RhcnQgPj0gMCAmJiBuZXdFbmQgPD0gY29uZi5uYldlZWtzKSB7XHJcbiAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3U3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ld0VuZFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9uIGluaXQsIG1lcmdlIG92ZXJsYXBzXHJcbiAgICAgICAgbWVyZ2VPdmVybGFwcyh0cnVlKTtcclxuXHJcbiAgICAgICAgLy8vLyBVSSAtPiBtb2RlbCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICBuZ01vZGVsQ3RybC4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uIG9uVUlDaGFuZ2UodWkpIHtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLnN0YXJ0ID0gdGltZVNlcnZpY2UuYWRkV2Vlayhjb25mLm1pbkRhdGUsIHVpLnN0YXJ0KS50b0RhdGUoKTtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLmVuZCA9IHRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCB1aS5lbmQpLnRvRGF0ZSgpO1xyXG4gICAgICAgICAgLy8kbG9nLmRlYnVnKCdQQVJTRVIgOicsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLiQkaGFzaEtleSwgaW5kZXgsIHNjb3BlLiRpbmRleCwgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUpO1xyXG4gICAgICAgICAgc2NoZWR1bGVyQ3RybC5vbi5jaGFuZ2UoaW5kZXgsIHNjb3BlLiRpbmRleCwgbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUpO1xyXG4gICAgICAgICAgcmV0dXJuIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLy8vIG1vZGVsIC0+IFVJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24gb25Nb2RlbENoYW5nZShtb2RlbCkge1xyXG4gICAgICAgICAgdmFyIHVpID0ge1xyXG4gICAgICAgICAgICBzdGFydDogdGltZVNlcnZpY2Uud2Vla1ByZWNpc2VEaWZmKGNvbmYubWluRGF0ZSwgbW9tZW50KG1vZGVsLnN0YXJ0KSwgdHJ1ZSksXHJcbiAgICAgICAgICAgIGVuZDogdGltZVNlcnZpY2Uud2Vla1ByZWNpc2VEaWZmKGNvbmYubWluRGF0ZSwgbW9tZW50KG1vZGVsLmVuZCksIHRydWUpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgLy8kbG9nLmRlYnVnKCdGT1JNQVRURVIgOicsIGluZGV4LCBzY29wZS4kaW5kZXgsIHVpKTtcclxuICAgICAgICAgIHJldHVybiB1aTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciB1aSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgICAgICB2YXIgY3NzID0ge1xyXG4gICAgICAgICAgICBsZWZ0OiB1aS5zdGFydCAvIGNvbmYubmJXZWVrcyAqIDEwMCArICclJyxcclxuICAgICAgICAgICAgd2lkdGg6ICh1aS5lbmQgLSB1aS5zdGFydCkgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJSdcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgLy8kbG9nLmRlYnVnKCdSRU5ERVIgOicsIGluZGV4LCBzY29wZS4kaW5kZXgsIGNzcyk7XHJcbiAgICAgICAgICBlbGVtZW50LmNzcyhjc3MpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNjb3BlLiRvbignd2Vla2x5U2NoZWR1bGVyTG9jYWxlQ2hhbmdlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIC8vIFNpbXBsZSBjaGFuZ2Ugb2JqZWN0IHJlZmVyZW5jZSBzbyB0aGF0IG5nTW9kZWwgdHJpZ2dlcnMgZm9ybWF0dGluZyAmIHJlbmRlcmluZ1xyXG4gICAgICAgICAgc2NvcGUuc2NoZWR1bGUgPSBhbmd1bGFyLmNvcHkoc2NvcGUuc2NoZWR1bGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTsiXX0=

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default navbar-fixed-top"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"><div class="srow">{{::$index + 1}}. {{item.label}}</div></weekly-scheduler><div class="pull-right"><button class="btn btn-success" role="button" ng-click="model.items.push({label: \'New Item\'})">Add new item</button></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {month: \'Mes\', weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="angular.js"></script><script src="angular-animate.js"></script><script src="tmhDynamicLocale.js"></script><script src="moment.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right">{{schedulerCtrl.config.labels.month || \'Month\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.weekNb || \'Week number\'}}</div><div class="schedule-animate" ng-repeat="item in schedulerCtrl.items" inject></div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><monthly-grid class="grid-container"></monthly-grid></div><div class="srow timestamps"><weekly-grid class="grid-container"></weekly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><weekly-grid class="grid-container striped" no-text></weekly-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);