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
angular.module('weeklyScheduler')
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9kZW1vLWFwcC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL21vZHVsZS50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL2hhbmRsZS9oYW5kbGUudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci9pbmplY3QvaW5qZWN0LnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbG9jYWxlL2xvY2FsZS1zZXJ2aWNlLnRzIiwiYXBwL25nLXdlZWtseS1zY2hlZHVsZXIvbXVsdGlzbGlkZXIvbXVsdGlzbGlkZXIudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci90aW1lL3RpbWUtc2VydmljZXMudHMiLCJhcHAvbmctd2Vla2x5LXNjaGVkdWxlci93ZWVrbHktZ3JpZC93ZWVrbHktZ3JpZC50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci50cyIsImFwcC9uZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7S0FFL0UsTUFBTSxDQUFDLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxxQkFBcUI7UUFDOUUscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBQzlCLElBQUksRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUM7WUFDbEIsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsRUFBQztZQUNsRSxxQkFBcUIsRUFBRSwrQkFBK0I7U0FDdkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7S0FFRixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLDhC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QUMsQ0FBQyxDQUFDO2dCQUVILFdBQVcsQ0FBQyxPQUFPLEdBQUc7b0JBQ3BCLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7b0JBQ2hDLElBQUksR0FBRyxHQUFHO3dCQUNSLElBQUksRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUc7d0JBQ3pDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUc7cUJBQ3RELENBQUM7b0JBRUYsbURBQW1EO29CQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRTtvQkFDeEMsaUZBQWlGO29CQUNqRixLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJuZy13ZWVrbHktc2NoZWR1bGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSB2YXIgbW9tZW50O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RlbW9BcHAnLCBbJ25nQW5pbWF0ZScsICd3ZWVrbHlTY2hlZHVsZXInLCAnd2Vla2x5U2NoZWR1bGVySTE4TiddKVxyXG5cclxuICAuY29uZmlnKFsnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZVByb3ZpZGVyJywgZnVuY3Rpb24gKGxvY2FsZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgbG9jYWxlU2VydmljZVByb3ZpZGVyLmNvbmZpZ3VyZSh7XHJcbiAgICAgIGRveXM6IHsnZXMtZXMnOiA0fSxcclxuICAgICAgbGFuZzogeydlcy1lcyc6IHt3ZWVrTmI6ICduw7ptZXJvIGRlIGxhIHNlbWFuYScsIGFkZE5ldzogJ0HDsWFkaXInfX0sXHJcbiAgICAgIGxvY2FsZUxvY2F0aW9uUGF0dGVybjogJy9hbmd1bGFyLWxvY2FsZV97e2xvY2FsZX19LmpzJ1xyXG4gICAgfSk7XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdEZW1vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCAnJGxvZycsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkdGltZW91dCwgbG9jYWxlU2VydmljZSwgJGxvZykge1xyXG5cclxuICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgIGxvY2FsZTogbG9jYWxlU2VydmljZS4kbG9jYWxlLmlkLFxyXG4gICAgICAgIG9wdGlvbnM6IHsvKm1vbm9TY2hlZHVsZTogdHJ1ZSovfSxcclxuICAgICAgICBpdGVtczogW3tcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAxJyxcclxuICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNS0xMi0yNycpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNi0wOC0wMScpLnRvRGF0ZSgpfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1dXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHNjb3BlLm1vZGVsLml0ZW1zID0gJHNjb3BlLm1vZGVsLml0ZW1zLmNvbmNhdChbe1xyXG4gICAgICAgICAgbGFiZWw6ICdJdGVtIDInLFxyXG4gICAgICAgICAgc2NoZWR1bGVzOiBbXHJcbiAgICAgICAgICAgIHtzdGFydDogbW9tZW50KCcyMDE2LTA1LTAzJykudG9EYXRlKCksIGVuZDogbW9tZW50KCcyMDE3LTAyLTAxJykudG9EYXRlKCl9LFxyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNS0xMS0yMCcpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNi0wMi0wMScpLnRvRGF0ZSgpfVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIGxhYmVsOiAnSXRlbSAzJyxcclxuICAgICAgICAgIHNjaGVkdWxlczogW1xyXG4gICAgICAgICAgICB7c3RhcnQ6IG1vbWVudCgnMjAxNy0wOC0wOScpLnRvRGF0ZSgpLCBlbmQ6IG1vbWVudCgnMjAxNy0wOC0yMScpLnRvRGF0ZSgpfSxcclxuICAgICAgICAgICAge3N0YXJ0OiBtb21lbnQoJzIwMTctMDktMTInKS50b0RhdGUoKSwgZW5kOiBtb21lbnQoJzIwMTctMTAtMTInKS50b0RhdGUoKX1cclxuICAgICAgICAgIF1cclxuICAgICAgICB9XSk7XHJcbiAgICAgIH0sIDEwMDApO1xyXG5cclxuICAgICAgdGhpcy5kb1NvbWV0aGluZyA9IGZ1bmN0aW9uIChpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpIHtcclxuICAgICAgICAkbG9nLmRlYnVnKCdUaGUgbW9kZWwgaGFzIGNoYW5nZWQhJywgaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMub25Mb2NhbGVDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJGxvZy5kZWJ1ZygnVGhlIGxvY2FsZSBpcyBjaGFuZ2luZyB0bycsICRzY29wZS5tb2RlbC5sb2NhbGUpO1xyXG4gICAgICAgIGxvY2FsZVNlcnZpY2Uuc2V0KCRzY29wZS5tb2RlbC5sb2NhbGUpLnRoZW4oZnVuY3Rpb24gKCRsb2NhbGUpIHtcclxuICAgICAgICAgICRsb2cuZGVidWcoJ1RoZSBsb2NhbGUgY2hhbmdlZCB0bycsICRsb2NhbGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInLCBbJ25nV2Vla2x5U2NoZWR1bGVyVGVtcGxhdGVzJ10pO1xyXG5cclxudmFyIEdSSURfVEVNUExBVEUgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgY2xhc3M9XCJncmlkLWl0ZW1cIj48L2Rpdj4nKTtcclxudmFyIENMSUNLX09OX0FfQ0VMTCA9ICdjbGlja09uQUNlbGwnO1xyXG5cclxudmFyIGlzQ3RybDtcclxuXHJcbmZ1bmN0aW9uIGN0cmxDaGVjayhlKSB7XHJcbiAgaWYgKGUud2hpY2ggPT09IDE3KSB7XHJcbiAgICBpc0N0cmwgPSBlLnR5cGUgPT09ICdrZXlkb3duJztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlU2Nyb2xsKGVsLCBkZWx0YSkge1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGN0cmxDaGVjayk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgY3RybENoZWNrKTtcclxuXHJcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGlmIChpc0N0cmwpIHtcclxuICAgICAgdmFyIHN0eWxlID0gZWwuZmlyc3RDaGlsZC5zdHlsZSwgY3VycmVudFdpZHRoID0gcGFyc2VJbnQoc3R5bGUud2lkdGgpO1xyXG4gICAgICBpZiAoKGUud2hlZWxEZWx0YSB8fCBlLmRldGFpbCkgPiAwKSB7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAoY3VycmVudFdpZHRoICsgMiAqIGRlbHRhKSArICclJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgd2lkdGggPSBjdXJyZW50V2lkdGggLSAyICogZGVsdGE7XHJcbiAgICAgICAgc3R5bGUud2lkdGggPSAod2lkdGggPiAxMDAgPyB3aWR0aCA6IDEwMCkgKyAnJSc7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgoZS53aGVlbERlbHRhIHx8IGUuZGV0YWlsKSA+IDApIHtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0IC09IGRlbHRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgKz0gZGVsdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gem9vbUluQUNlbGwoZWwsIGV2ZW50LCBkYXRhKSB7XHJcblxyXG4gIHZhciBuYkVsZW1lbnRzID0gZGF0YS5uYkVsZW1lbnRzO1xyXG4gIHZhciBpZHggPSBkYXRhLmlkeDtcclxuICAvLyBwZXJjZW50V2lkdGhGcm9tQmVnaW5uaW5nIGlzIHVzZWQgd2hlbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZ3JpZCBpcyBub3QgZnVsbFxyXG4gIC8vIEZvciBpbnN0YW5jZSwgaW4gdGhlIGV4YW1wbGUgYmVsb3cgYGZlYiAxN2AgaXMgbm90IGZ1bGxcclxuICAvLyBmZWIgMTcgICAgICAgICAgbWFyY2ggMTdcclxuICAvLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgdmFyIHBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmcgPSBkYXRhLnBlcmNlbnRXaWR0aEZyb21CZWdpbm5pbmc7XHJcblxyXG4gIHZhciBjb250YWluZXJXaWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG5cclxuICAvLyBsZWF2ZSAoMS8zKSBlYWNoIHNpZGVcclxuICAvLyAxLzMgfCAgICAzLzMgICB8IDEvM1xyXG4gIHZhciBib3hXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gKDUgLyAzKTtcclxuICB2YXIgZ3V0dGVyU2l6ZSA9IGJveFdpZHRoIC8gMztcclxuXHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUHggPSBuYkVsZW1lbnRzICogYm94V2lkdGg7XHJcbiAgdmFyIHNjaGVkdWxlQXJlYVdpZHRoUGVyY2VudCA9IChzY2hlZHVsZUFyZWFXaWR0aFB4IC8gY29udGFpbmVyV2lkdGgpICogMTAwO1xyXG5cclxuICBlbC5maXJzdENoaWxkLnN0eWxlLndpZHRoID0gc2NoZWR1bGVBcmVhV2lkdGhQZXJjZW50ICsgJyUnO1xyXG5cclxuICBpZiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAvLyBBbGwgY2VsbHMgb2YgYSBsaW5lIGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IGlkeCAqIGJveFdpZHRoIC0gZ3V0dGVyU2l6ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gU2l6ZXMgb2YgY2VsbHMgaW4gYSBsaW5lIGNvdWxkIGRpZmZlcmVudCAoZXNwZWNpYWxseSB0aGUgZmlyc3Qgb25lKVxyXG4gICAgZWwuc2Nyb2xsTGVmdCA9IHNjaGVkdWxlQXJlYVdpZHRoUHggKiAocGVyY2VudFdpZHRoRnJvbUJlZ2lubmluZyAvIDEwMCkgLSBndXR0ZXJTaXplO1xyXG4gIH1cclxufVxyXG4iLCJjbGFzcyBIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBhbmd1bGFyLklEaXJlY3RpdmUge1xyXG4gIHN0YXRpYyAkbmFtZSA9ICdoYW5kbGUnO1xyXG4gIHJlc3RyaWN0ID0gJ0EnO1xyXG5cclxuICBzY29wZSA9IHtcclxuICAgIG9uZHJhZzogJz0nLFxyXG4gICAgb25kcmFnc3RvcDogJz0nLFxyXG4gICAgb25kcmFnc3RhcnQ6ICc9J1xyXG4gIH07XHJcblxyXG4gIGxpbmsgPSAoc2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkgPT4ge1xyXG4gICAgdmFyICRkb2N1bWVudCA9IHRoaXMuJGRvY3VtZW50O1xyXG4gICAgdmFyIHggPSAwO1xyXG4gICAgXHJcbiAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgLy8gUHJldmVudCBkZWZhdWx0IGRyYWdnaW5nIG9mIHNlbGVjdGVkIGNvbnRlbnRcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHggPSBldmVudC5wYWdlWDtcclxuXHJcbiAgICAgICRkb2N1bWVudC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdtb3VzZXVwJywgbW91c2V1cCk7XHJcblxyXG4gICAgICBpZiAoc2NvcGUub25kcmFnc3RhcnQpIHtcclxuICAgICAgICBzY29wZS5vbmRyYWdzdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBtb3VzZW1vdmUoZXZlbnQpIHtcclxuICAgICAgdmFyIGRlbHRhID0gZXZlbnQucGFnZVggLSB4O1xyXG4gICAgICBpZiAoc2NvcGUub25kcmFnKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnKGRlbHRhKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1vdXNldXAoKSB7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XHJcbiAgICAgICRkb2N1bWVudC51bmJpbmQoJ21vdXNldXAnLCBtb3VzZXVwKTtcclxuXHJcbiAgICAgIGlmIChzY29wZS5vbmRyYWdzdG9wKSB7XHJcbiAgICAgICAgc2NvcGUub25kcmFnc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgJGRvY3VtZW50OiBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2VcclxuICApIHtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBGYWN0b3J5KCkge1xyXG4gICAgbGV0IGRpcmVjdGl2ZSA9ICgkZG9jdW1lbnQpID0+IG5ldyBIYW5kbGVEaXJlY3RpdmUoJGRvY3VtZW50KTtcclxuXHJcbiAgICBkaXJlY3RpdmUuJGluamVjdCA9IFsnJGRvY3VtZW50J107XHJcblxyXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoSGFuZGxlRGlyZWN0aXZlLiRuYW1lLCBIYW5kbGVEaXJlY3RpdmUuRmFjdG9yeSgpKTtcclxuIiwiY2xhc3MgSW5qZWN0RGlyZWN0aXZlIGltcGxlbWVudHMgYW5ndWxhci5JRGlyZWN0aXZlIHtcclxuICBzdGF0aWMgJG5hbWUgPSAnaW5qZWN0JztcclxuXHJcbiAgbGluayA9ICgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCAkYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsIGNvbnRyb2xsZXIsICR0cmFuc2NsdWRlOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24pID0+IHtcclxuICAgIGlmICghJHRyYW5zY2x1ZGUpIHtcclxuICAgICAgdGhyb3cgJ0lsbGVnYWwgdXNlIG9mIG5nVHJhbnNjbHVkZSBkaXJlY3RpdmUgaW4gdGhlIHRlbXBsYXRlISBObyBwYXJlbnQgZGlyZWN0aXZlIHRoYXQgcmVxdWlyZXMgYSB0cmFuc2NsdXNpb24gZm91bmQuJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5uZXJTY29wZSA9ICRzY29wZS4kbmV3KCk7XHJcblxyXG4gICAgJHRyYW5zY2x1ZGUoaW5uZXJTY29wZSwgZnVuY3Rpb24gKGNsb25lKSB7XHJcbiAgICAgICRlbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICRlbGVtZW50LmFwcGVuZChjbG9uZSk7XHJcbiAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbm5lclNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgRmFjdG9yeSgpIHtcclxuICAgIGxldCBkaXJlY3RpdmUgPSAoKSA9PiBuZXcgSW5qZWN0RGlyZWN0aXZlKCk7XHJcbiAgICBcclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuICAuZGlyZWN0aXZlKEluamVjdERpcmVjdGl2ZS4kbmFtZSwgSW5qZWN0RGlyZWN0aXZlLkZhY3RvcnkoKSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJywgWyd0bWguZHluYW1pY0xvY2FsZSddKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXJJMThOJylcclxuICAucHJvdmlkZXIoJ3dlZWtseVNjaGVkdWxlckxvY2FsZVNlcnZpY2UnLCBbJ3RtaER5bmFtaWNMb2NhbGVQcm92aWRlcicsIGZ1bmN0aW9uICh0bWhEeW5hbWljTG9jYWxlUHJvdmlkZXIpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgICAgZG95czogeydkZS1kZSc6IDQsICdlbi1nYic6IDQsICdlbi11cyc6IDYsICdmci1mcic6IDR9LFxyXG4gICAgICBsYW5nOiB7XHJcbiAgICAgICAgJ2RlLWRlJzoge3dlZWtOYjogJ1dvY2hlbnVtbWVyJywgYWRkTmV3OiAnSGluenVmw7xnZW4nfSxcclxuICAgICAgICAnZW4tZ2InOiB7d2Vla05iOiAnV2VlayAjJywgYWRkTmV3OiAnQWRkJ30sXHJcbiAgICAgICAgJ2VuLXVzJzoge3dlZWtOYjogJ1dlZWsgIycsIGFkZE5ldzogJ0FkZCd9LFxyXG4gICAgICAgICdmci1mcic6IHt3ZWVrTmI6ICdOwrAgZGUgc2VtYWluZScsIGFkZE5ldzogJ0Fqb3V0ZXInfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG5cclxuICAgICAgaWYgKGNvbmZpZyAmJiBhbmd1bGFyLmlzT2JqZWN0KGNvbmZpZykpIHtcclxuICAgICAgICBhbmd1bGFyLm1lcmdlKGRlZmF1bHRDb25maWcsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybikge1xyXG4gICAgICAgICAgdG1oRHluYW1pY0xvY2FsZVByb3ZpZGVyLmxvY2FsZUxvY2F0aW9uUGF0dGVybihkZWZhdWx0Q29uZmlnLmxvY2FsZUxvY2F0aW9uUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJHJvb3RTY29wZScsICckbG9jYWxlJywgJ3RtaER5bmFtaWNMb2NhbGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2FsZSwgdG1oRHluYW1pY0xvY2FsZSkge1xyXG5cclxuICAgICAgdmFyIG1vbWVudExvY2FsZUNhY2hlID0ge307XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMYW5nKCkge1xyXG4gICAgICAgIHZhciBrZXkgPSAkbG9jYWxlLmlkO1xyXG4gICAgICAgIGlmICghbW9tZW50TG9jYWxlQ2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgbW9tZW50TG9jYWxlQ2FjaGVba2V5XSA9IGdldE1vbWVudExvY2FsZShrZXkpO1xyXG4gICAgICAgICAgbW9tZW50LmxvY2FsZShtb21lbnRMb2NhbGVDYWNoZVtrZXldLmlkLCBtb21lbnRMb2NhbGVDYWNoZVtrZXldLmxvY2FsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vbWVudC5sb2NhbGUobW9tZW50TG9jYWxlQ2FjaGVba2V5XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWZhdWx0Q29uZmlnLmxhbmdba2V5XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UganVzdCBuZWVkIGZldyBtb21lbnQgbG9jYWwgaW5mb3JtYXRpb25cclxuICAgICAgZnVuY3Rpb24gZ2V0TW9tZW50TG9jYWxlKGtleSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgbG9jYWxlOiB7XHJcbiAgICAgICAgICAgIHdlZWs6IHtcclxuICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vbmRheSA9IDAgd2hlcmVhcyBNb21lbnQgbW9uZGF5ID0gMVxyXG4gICAgICAgICAgICAgIGRvdzogKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDEpICUgNyxcclxuICAgICAgICAgICAgICBkb3k6IGRlZmF1bHRDb25maWcuZG95c1trZXldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2FsZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZ2V0TGFuZygpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICRsb2NhbGU6ICRsb2NhbGUsXHJcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZyxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIHJldHVybiB0bWhEeW5hbWljTG9jYWxlLnNldChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuXHJcbiAgLmRpcmVjdGl2ZSgnbXVsdGlTbGlkZXInLCBbJ3dlZWtseVNjaGVkdWxlclRpbWVTZXJ2aWNlJywgZnVuY3Rpb24gKHRpbWVTZXJ2aWNlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICByZXF1aXJlOiAnXndlZWtseVNjaGVkdWxlcicsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnbmctd2Vla2x5LXNjaGVkdWxlci9tdWx0aXNsaWRlci9tdWx0aXNsaWRlci5odG1sJyxcclxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybCkge1xyXG4gICAgICAgIHZhciBjb25mID0gc2NoZWR1bGVyQ3RybC5jb25maWc7XHJcblxyXG4gICAgICAgIC8vIFRoZSBkZWZhdWx0IHNjaGVkdWxlciBibG9jayBzaXplIHdoZW4gYWRkaW5nIGEgbmV3IGl0ZW1cclxuICAgICAgICB2YXIgZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSA9IHBhcnNlSW50KGF0dHJzLnNpemUpIHx8IDg7XHJcblxyXG4gICAgICAgIHZhciB2YWxUb1BpeGVsID0gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgdmFyIHBlcmNlbnQgPSB2YWwgLyAoY29uZi5uYldlZWtzKTtcclxuICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHBlcmNlbnQgKiBlbGVtZW50WzBdLmNsaWVudFdpZHRoICsgMC41KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcGl4ZWxUb1ZhbCA9IGZ1bmN0aW9uIChwaXhlbCkge1xyXG4gICAgICAgICAgdmFyIHBlcmNlbnQgPSBwaXhlbCAvIGVsZW1lbnRbMF0uY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogKGNvbmYubmJXZWVrcykgKyAwLjUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBhZGRTbG90ID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICAgICAgICAgIHN0YXJ0ID0gc3RhcnQgPj0gMCA/IHN0YXJ0IDogMDtcclxuICAgICAgICAgIGVuZCA9IGVuZCA8PSBjb25mLm5iV2Vla3MgPyBlbmQgOiBjb25mLm5iV2Vla3M7XHJcblxyXG4gICAgICAgICAgdmFyIHN0YXJ0RGF0ZSA9IHRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCBzdGFydCk7XHJcbiAgICAgICAgICB2YXIgZW5kRGF0ZSA9IHRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCBlbmQpO1xyXG5cclxuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gc2NvcGUuaXRlbTtcclxuICAgICAgICAgICAgaWYgKCFpdGVtLnNjaGVkdWxlcykge1xyXG4gICAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlbS5zY2hlZHVsZXMucHVzaCh7c3RhcnQ6IHN0YXJ0RGF0ZS50b0RhdGUoKSwgZW5kOiBlbmREYXRlLnRvRGF0ZSgpfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgaG92ZXJFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnQuZmluZCgnZGl2JylbMF0pO1xyXG4gICAgICAgIHZhciBob3ZlckVsZW1lbnRXaWR0aCA9IHZhbFRvUGl4ZWwoZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZSk7XHJcblxyXG4gICAgICAgIGhvdmVyRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgd2lkdGg6IGhvdmVyRWxlbWVudFdpZHRoICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgdmFyIGVsT2ZmWCA9IGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuXHJcbiAgICAgICAgICBob3ZlckVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogZS5wYWdlWCAtIGVsT2ZmWCAtIGhvdmVyRWxlbWVudFdpZHRoIC8gMiArICdweCdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBob3ZlckVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICBpZiAoIWVsZW1lbnQuYXR0cignbm8tYWRkJykpIHtcclxuICAgICAgICAgICAgdmFyIGVsT2ZmWCA9IGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICAgICAgdmFyIHBpeGVsT25DbGljayA9IGV2ZW50LnBhZ2VYIC0gZWxPZmZYO1xyXG4gICAgICAgICAgICB2YXIgdmFsT25DbGljayA9IHBpeGVsVG9WYWwocGl4ZWxPbkNsaWNrKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdGFydCA9IE1hdGgucm91bmQodmFsT25DbGljayAtIGRlZmF1bHROZXdTY2hlZHVsZVNpemUgLyAyKTtcclxuICAgICAgICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgZGVmYXVsdE5ld1NjaGVkdWxlU2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGFkZFNsb3Qoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5zZXJ2aWNlKCd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZScsIFsnJGZpbHRlcicsIGZ1bmN0aW9uICgkZmlsdGVyKSB7XHJcblxyXG4gICAgdmFyIE1PTlRIID0gJ21vbnRoJztcclxuICAgIHZhciBXRUVLID0gJ3dlZWsnO1xyXG4gICAgdmFyIERBWSA9ICdkYXknO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnN0OiB7XHJcbiAgICAgICAgTU9OVEg6IE1PTlRILFxyXG4gICAgICAgIFdFRUs6IFdFRUssXHJcbiAgICAgICAgRk9STUFUOiAnWVlZWS1NTS1ERCdcclxuICAgICAgfSxcclxuICAgICAgZEY6ICRmaWx0ZXIoJ2RhdGUnKSxcclxuICAgICAgY29tcGFyZTogZnVuY3Rpb24gKGRhdGUsIG1ldGhvZCwgbGFzdE1pbikge1xyXG4gICAgICAgIGlmIChkYXRlKSB7XHJcbiAgICAgICAgICB2YXIgZGF0ZUFzTW9tZW50O1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGRhdGUpKSB7XHJcbiAgICAgICAgICAgIGRhdGVBc01vbWVudCA9IG1vbWVudChkYXRlKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZGF0ZS5faXNBTW9tZW50T2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGRhdGVBc01vbWVudCA9IGRhdGU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ291bGQgbm90IHBhcnNlIGRhdGUgWycgKyBkYXRlICsgJ10nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGRhdGVBc01vbWVudFttZXRob2RdKGxhc3RNaW4pID8gZGF0ZUFzTW9tZW50IDogbGFzdE1pbjtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGFkZFdlZWs6IGZ1bmN0aW9uIChtb21lbnQsIG5iV2Vlaykge1xyXG4gICAgICAgIHJldHVybiBtb21lbnQuY2xvbmUoKS5hZGQobmJXZWVrLCBXRUVLKTtcclxuICAgICAgfSxcclxuICAgICAgd2Vla1ByZWNpc2VEaWZmOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiBlbmQuY2xvbmUoKS5kaWZmKHN0YXJ0LmNsb25lKCksIFdFRUssIHRydWUpO1xyXG4gICAgICB9LFxyXG4gICAgICB3ZWVrRGlmZjogZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICAgICAgICByZXR1cm4gZW5kLmNsb25lKCkuZW5kT2YoV0VFSykuZGlmZihzdGFydC5jbG9uZSgpLnN0YXJ0T2YoV0VFSyksIFdFRUspICsgMTtcclxuICAgICAgfSxcclxuICAgICAgbW9udGhEaWZmOiBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiBlbmQuY2xvbmUoKS5lbmRPZihNT05USCkuZGlmZihzdGFydC5jbG9uZSgpLnN0YXJ0T2YoTU9OVEgpLCBNT05USCkgKyAxO1xyXG4gICAgICB9LFxyXG4gICAgICBtb250aERpc3RyaWJ1dGlvbjogZnVuY3Rpb24gKG1pbkRhdGUsIG1heERhdGUpIHtcclxuICAgICAgICB2YXIgaSwgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIHN0YXJ0RGF0ZSA9IG1pbkRhdGUuY2xvbmUoKTtcclxuICAgICAgICB2YXIgZW5kRGF0ZSA9IG1heERhdGUuY2xvbmUoKTtcclxuICAgICAgICB2YXIgbW9udGhEaWZmID0gdGhpcy5tb250aERpZmYoc3RhcnREYXRlLCBlbmREYXRlKTtcclxuICAgICAgICB2YXIgZGF5RGlmZiA9IGVuZERhdGUuZGlmZihzdGFydERhdGUsIERBWSk7XHJcblxyXG4gICAgICAgIC8vdmFyIHRvdGFsID0gMCwgdG90YWxEYXlzID0gMDtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhzdGFydERhdGUudG9EYXRlKCksIGVuZERhdGUudG9EYXRlKCksIG1vbnRoRGlmZiwgZGF5RGlmZik7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG1vbnRoRGlmZjsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgc3RhcnRPZk1vbnRoID0gaSA9PT0gMCA/IHN0YXJ0RGF0ZSA6IHN0YXJ0RGF0ZS5hZGQoMSwgTU9OVEgpLnN0YXJ0T2YoTU9OVEgpO1xyXG4gICAgICAgICAgdmFyIGVuZE9mTW9udGggPSBpID09PSBtb250aERpZmYgLSAxID8gZW5kRGF0ZSA6IHN0YXJ0RGF0ZS5jbG9uZSgpLmVuZE9mKE1PTlRIKTtcclxuICAgICAgICAgIHZhciBkYXlJbk1vbnRoID0gZW5kT2ZNb250aC5kaWZmKHN0YXJ0T2ZNb250aCwgREFZKSArIChpICE9PSBtb250aERpZmYgLSAxICYmIDEpO1xyXG4gICAgICAgICAgdmFyIHdpZHRoID0gTWF0aC5mbG9vcihkYXlJbk1vbnRoIC8gZGF5RGlmZiAqIDFFOCkgLyAxRTY7XHJcblxyXG4gICAgICAgICAgcmVzdWx0LnB1c2goe3N0YXJ0OiBzdGFydE9mTW9udGguY2xvbmUoKSwgZW5kOiBlbmRPZk1vbnRoLmNsb25lKCksIHdpZHRoOiB3aWR0aH0pO1xyXG5cclxuICAgICAgICAgIC8vIHRvdGFsRGF5cyArPSBkYXlJbk1vbnRoOyB0b3RhbCArPSB3aWR0aDtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0T2ZNb250aCwgZW5kT2ZNb250aCwgZGF5SW5Nb250aCwgZGF5RGlmZiwgd2lkdGgsIHRvdGFsLCB0b3RhbERheXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuICAiLCIvKiBnbG9iYWwgR1JJRF9URU1QTEFURSwgQ0xJQ0tfT05fQV9DRUxMICovXHJcbmFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG4gIC5kaXJlY3RpdmUoJ3dlZWtseUdyaWQnLCBbZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIG5iV2Vla3MsIGlkeCwgc2NvcGUpIHtcclxuICAgICAgY2hpbGQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2NvcGUuJGJyb2FkY2FzdChDTElDS19PTl9BX0NFTEwsIHtcclxuICAgICAgICAgIG5iRWxlbWVudHM6IG5iV2Vla3MsXHJcbiAgICAgICAgICBpZHg6IGlkeFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBtb2RlbCkge1xyXG4gICAgICB2YXIgaTtcclxuICAgICAgLy8gQ2FsY3VsYXRlIHdlZWsgd2lkdGggZGlzdHJpYnV0aW9uXHJcbiAgICAgIHZhciB0aWNrY291bnQgPSBtb2RlbC5uYldlZWtzO1xyXG4gICAgICB2YXIgdGlja3NpemUgPSAxMDAgLyB0aWNrY291bnQ7XHJcbiAgICAgIHZhciBncmlkSXRlbUVsID0gR1JJRF9URU1QTEFURS5jc3Moe3dpZHRoOiB0aWNrc2l6ZSArICclJ30pO1xyXG4gICAgICB2YXIgbm93ID0gbW9kZWwubWluRGF0ZS5jbG9uZSgpLnN0YXJ0T2YoJ3dlZWsnKTtcclxuXHJcbiAgICAgIC8vIENsZWFuIGVsZW1lbnRcclxuICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IHRpY2tjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JpZEl0ZW1FbC5jbG9uZSgpO1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLm5vVGV4dCkpIHtcclxuICAgICAgICAgIGhhbmRsZUNsaWNrRXZlbnQoY2hpbGQsIHRpY2tjb3VudCwgaSwgc2NvcGUpO1xyXG4gICAgICAgICAgY2hpbGQudGV4dChub3cuYWRkKGkgJiYgMSwgJ3dlZWsnKS53ZWVrKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFwcGVuZChjaGlsZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgcmVxdWlyZTogJ153ZWVrbHlTY2hlZHVsZXInLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsKSB7XHJcbiAgICAgICAgaWYgKHNjaGVkdWxlckN0cmwuY29uZmlnKSB7XHJcbiAgICAgICAgICBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzY2hlZHVsZXJDdHJsLmNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24gKG5ld01vZGVsKSB7XHJcbiAgICAgICAgICBkb0dyaWQoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZXdNb2RlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pOyIsIi8qIGdsb2JhbCBtb3VzZVNjcm9sbCwgQ0xJQ0tfT05fQV9DRUxMLCB6b29tSW5BQ2VsbCAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnd2Vla2x5U2NoZWR1bGVyJylcclxuXHJcbiAgLmRpcmVjdGl2ZSgnd2Vla2x5U2NoZWR1bGVyJywgWyckcGFyc2UnLCAnd2Vla2x5U2NoZWR1bGVyVGltZVNlcnZpY2UnLCAnJGxvZycsIGZ1bmN0aW9uICgkcGFyc2UsIHRpbWVTZXJ2aWNlLCAkbG9nKSB7XHJcblxyXG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgICBtb25vU2NoZWR1bGU6IGZhbHNlLFxyXG4gICAgICBzZWxlY3RvcjogJy5zY2hlZHVsZS1hcmVhLWNvbnRhaW5lcidcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25maWd1cmUgdGhlIHNjaGVkdWxlci5cclxuICAgICAqIEBwYXJhbSBzY2hlZHVsZXNcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJucyB7e21pbkRhdGU6ICosIG1heERhdGU6ICosIG5iV2Vla3M6ICp9fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjb25maWcoc2NoZWR1bGVzLCBvcHRpb25zKSB7XHJcbiAgICAgIHZhciBub3cgPSBtb21lbnQoKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBtaW4gZGF0ZSBvZiBhbGwgc2NoZWR1bGVkIGV2ZW50c1xyXG4gICAgICB2YXIgbWluRGF0ZSA9IChzY2hlZHVsZXMgPyBzY2hlZHVsZXMucmVkdWNlKGZ1bmN0aW9uIChtaW5EYXRlLCBzbG90KSB7XHJcbiAgICAgICAgcmV0dXJuIHRpbWVTZXJ2aWNlLmNvbXBhcmUoc2xvdC5zdGFydCwgJ2lzQmVmb3JlJywgbWluRGF0ZSk7XHJcbiAgICAgIH0sIG5vdykgOiBub3cpLnN0YXJ0T2YoJ3dlZWsnKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBtYXggZGF0ZSBvZiBhbGwgc2NoZWR1bGVkIGV2ZW50c1xyXG4gICAgICB2YXIgbWF4RGF0ZSA9IChzY2hlZHVsZXMgPyBzY2hlZHVsZXMucmVkdWNlKGZ1bmN0aW9uIChtYXhEYXRlLCBzbG90KSB7XHJcbiAgICAgICAgcmV0dXJuIHRpbWVTZXJ2aWNlLmNvbXBhcmUoc2xvdC5lbmQsICdpc0FmdGVyJywgbWF4RGF0ZSk7XHJcbiAgICAgIH0sIG5vdykgOiBub3cpLmNsb25lKCkuYWRkKDEsICd5ZWFyJykuZW5kT2YoJ3dlZWsnKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBuYiBvZiB3ZWVrcyBjb3ZlcmVkIGJ5IG1pbkRhdGUgPT4gbWF4RGF0ZVxyXG4gICAgICB2YXIgbmJXZWVrcyA9IHRpbWVTZXJ2aWNlLndlZWtEaWZmKG1pbkRhdGUsIG1heERhdGUpO1xyXG5cclxuICAgICAgdmFyIHJlc3VsdCA9IGFuZ3VsYXIuZXh0ZW5kKG9wdGlvbnMsIHttaW5EYXRlOiBtaW5EYXRlLCBtYXhEYXRlOiBtYXhEYXRlLCBuYldlZWtzOiBuYldlZWtzfSk7XHJcbiAgICAgIC8vIExvZyBjb25maWd1cmF0aW9uXHJcbiAgICAgICRsb2cuZGVidWcoJ1dlZWtseSBTY2hlZHVsZXIgY29uZmlndXJhdGlvbjonLCByZXN1bHQpO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICByZXF1aXJlOiAnd2Vla2x5U2NoZWR1bGVyJyxcclxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgdGVtcGxhdGVVcmw6ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zY2hlZHVsZXIvd2Vla2x5LXNjaGVkdWxlci5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogWyckaW5qZWN0b3InLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgLy8gVHJ5IHRvIGdldCB0aGUgaTE4biBzZXJ2aWNlXHJcbiAgICAgICAgdmFyIG5hbWUgPSAnd2Vla2x5U2NoZWR1bGVyTG9jYWxlU2VydmljZSc7XHJcbiAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMobmFtZSkpIHtcclxuICAgICAgICAgICRsb2cuaW5mbygnVGhlIEkxOE4gc2VydmljZSBoYXMgc3VjY2Vzc2Z1bGx5IGJlZW4gaW5pdGlhbGl6ZWQhJyk7XHJcbiAgICAgICAgICB2YXIgbG9jYWxlU2VydmljZSA9ICRpbmplY3Rvci5nZXQobmFtZSk7XHJcbiAgICAgICAgICBkZWZhdWx0T3B0aW9ucy5sYWJlbHMgPSBsb2NhbGVTZXJ2aWNlLmdldExhbmcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGxvZy5pbmZvKCdObyBJMThOIGZvdW5kIGZvciB0aGlzIG1vZHVsZSwgY2hlY2sgdGhlIG5nIG1vZHVsZSBbd2Vla2x5U2NoZWR1bGVySTE4Tl0gaWYgeW91IG5lZWQgaTE4bi4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdpbGwgaGFuZyBvdXIgbW9kZWwgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgICAgIHRoaXMuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzID0gW107XHJcbiAgICAgIH1dLFxyXG4gICAgICBjb250cm9sbGVyQXM6ICdzY2hlZHVsZXJDdHJsJyxcclxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2NoZWR1bGVyQ3RybCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zRm4gPSAkcGFyc2UoYXR0cnMub3B0aW9ucyksXHJcbiAgICAgICAgICBvcHRpb25zID0gYW5ndWxhci5leHRlbmQoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnNGbihzY29wZSkgfHwge30pO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHNjaGVkdWxlIGNvbnRhaW5lciBlbGVtZW50XHJcbiAgICAgICAgdmFyIGVsID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKGRlZmF1bHRPcHRpb25zLnNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25Nb2RlbENoYW5nZShpdGVtcykge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIHByZXNlbnRcclxuICAgICAgICAgIGlmIChpdGVtcykge1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaXRlbXMgYXJlIGluIGFuIEFycmF5XHJcbiAgICAgICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xyXG4gICAgICAgICAgICAgIHRocm93ICdZb3Ugc2hvdWxkIHVzZSB3ZWVrbHktc2NoZWR1bGVyIGRpcmVjdGl2ZSB3aXRoIGFuIEFycmF5IG9mIGl0ZW1zJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgbW9kZWwgKHVzZSBpdCBpbiB0ZW1wbGF0ZSlcclxuICAgICAgICAgICAgc2NoZWR1bGVyQ3RybC5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgICAgICAgICAgLy8gRmlyc3QgY2FsY3VsYXRlIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICAgICAgc2NoZWR1bGVyQ3RybC5jb25maWcgPSBjb25maWcoaXRlbXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICB2YXIgc2NoZWR1bGVzID0gaXRlbS5zY2hlZHVsZXM7XHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KHNjaGVkdWxlcyAmJiBzY2hlZHVsZXMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgIC8vIElmIGluIG11bHRpU2xpZGVyIG1vZGUsIGVuc3VyZSBhIHNjaGVkdWxlIGFycmF5IGlzIHByZXNlbnQgb24gZWFjaCBpdGVtXHJcbiAgICAgICAgICAgICAgICAvLyBFbHNlIG9ubHkgdXNlIGZpcnN0IGVsZW1lbnQgb2Ygc2NoZWR1bGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIChvcHRpb25zLm1vbm9TY2hlZHVsZSA/IGl0ZW0uc2NoZWR1bGVzID0gW3NjaGVkdWxlc1swXV0gOiBzY2hlZHVsZXMpIDpcclxuICAgICAgICAgICAgICAgIGl0ZW0uc2NoZWR1bGVzID0gW11cclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LCBbXSksIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiByZXNpemUgc2NoZWR1bGUgYXJlYSBrbm93aW5nIHRoZSBudW1iZXIgb2Ygd2Vla3MgaW4gc2NvcGVcclxuICAgICAgICAgICAgZWwuZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IHNjaGVkdWxlckN0cmwuY29uZmlnLm5iV2Vla3MgLyA1MyAqIDIwMCArICclJztcclxuXHJcbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHJ1biB0aGUgc3ViIGRpcmVjdGl2ZXMgbGlzdGVuZXJzXHJcbiAgICAgICAgICAgIHNjaGVkdWxlckN0cmwuJG1vZGVsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIoc2NoZWR1bGVyQ3RybC5jb25maWcpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbCkge1xyXG4gICAgICAgICAgLy8gSW5zdGFsbCBtb3VzZSBzY3JvbGxpbmcgZXZlbnQgbGlzdGVuZXIgZm9yIEggc2Nyb2xsaW5nXHJcbiAgICAgICAgICBtb3VzZVNjcm9sbChlbCwgMjApO1xyXG5cclxuICAgICAgICAgIHNjb3BlLiRvbihDTElDS19PTl9BX0NFTEwsIGZ1bmN0aW9uKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgem9vbUluQUNlbGwoZWwsIGUsIGRhdGEpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgc2NoZWR1bGVyQ3RybC5vbiA9IHtcclxuICAgICAgICAgICAgY2hhbmdlOiBmdW5jdGlvbiAoaXRlbUluZGV4LCBzY2hlZHVsZUluZGV4LCBzY2hlZHVsZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgdmFyIG9uQ2hhbmdlRnVuY3Rpb24gPSAkcGFyc2UoYXR0cnMub25DaGFuZ2UpKHNjb3BlKTtcclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKG9uQ2hhbmdlRnVuY3Rpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb25DaGFuZ2VGdW5jdGlvbihpdGVtSW5kZXgsIHNjaGVkdWxlSW5kZXgsIHNjaGVkdWxlVmFsdWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIFdhdGNoIHRoZSBtb2RlbCBpdGVtc1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKGF0dHJzLml0ZW1zLCBvbk1vZGVsQ2hhbmdlKTtcclxuXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIExpc3RlbiB0byAkbG9jYWxlIGNoYW5nZSAoYnJvdWdodCBieSBleHRlcm5hbCBtb2R1bGUgd2Vla2x5U2NoZWR1bGVySTE4TilcclxuICAgICAgICAgICAqL1xyXG4gICAgICAgICAgc2NvcGUuJG9uKCd3ZWVrbHlTY2hlZHVsZXJMb2NhbGVDaGFuZ2VkJywgZnVuY3Rpb24gKGUsIGxhYmVscykge1xyXG4gICAgICAgICAgICBpZiAoc2NoZWR1bGVyQ3RybC5jb25maWcpIHtcclxuICAgICAgICAgICAgICBzY2hlZHVsZXJDdHJsLmNvbmZpZy5sYWJlbHMgPSBsYWJlbHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25Nb2RlbENoYW5nZShhbmd1bGFyLmNvcHkoJHBhcnNlKGF0dHJzLml0ZW1zKShzY29wZSksIFtdKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pOyIsImFuZ3VsYXIubW9kdWxlKCd3ZWVrbHlTY2hlZHVsZXInKVxyXG5cclxuICAuZGlyZWN0aXZlKCd3ZWVrbHlTbG90JywgWyd3ZWVrbHlTY2hlZHVsZXJUaW1lU2VydmljZScsIGZ1bmN0aW9uICh0aW1lU2VydmljZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgcmVxdWlyZTogWyded2Vla2x5U2NoZWR1bGVyJywgJ25nTW9kZWwnXSxcclxuICAgICAgdGVtcGxhdGVVcmw6ICduZy13ZWVrbHktc2NoZWR1bGVyL3dlZWtseS1zbG90L3dlZWtseS1zbG90Lmh0bWwnLFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICAgIHZhciBzY2hlZHVsZXJDdHJsID0gY3RybHNbMF0sIG5nTW9kZWxDdHJsID0gY3RybHNbMV07XHJcbiAgICAgICAgdmFyIGNvbmYgPSBzY2hlZHVsZXJDdHJsLmNvbmZpZztcclxuICAgICAgICB2YXIgaW5kZXggPSBzY29wZS4kcGFyZW50LiRpbmRleDtcclxuICAgICAgICB2YXIgY29udGFpbmVyRWwgPSBlbGVtZW50LnBhcmVudCgpO1xyXG4gICAgICAgIHZhciByZXNpemVEaXJlY3Rpb25Jc1N0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB2YXIgdmFsdWVzT25EcmFnU3RhcnQgPSB7c3RhcnQ6IHNjb3BlLnNjaGVkdWxlLnN0YXJ0LCBlbmQ6IHNjb3BlLnNjaGVkdWxlLmVuZH07XHJcblxyXG4gICAgICAgIHZhciBwaXhlbFRvVmFsID0gZnVuY3Rpb24gKHBpeGVsKSB7XHJcbiAgICAgICAgICB2YXIgcGVyY2VudCA9IHBpeGVsIC8gY29udGFpbmVyRWxbMF0uY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihwZXJjZW50ICogY29uZi5uYldlZWtzICsgMC41KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbWVyZ2VPdmVybGFwcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciBzY2hlZHVsZSA9IHNjb3BlLnNjaGVkdWxlO1xyXG4gICAgICAgICAgdmFyIHNjaGVkdWxlcyA9IHNjb3BlLml0ZW0uc2NoZWR1bGVzO1xyXG4gICAgICAgICAgc2NoZWR1bGVzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIGlmIChlbCAhPT0gc2NoZWR1bGUpIHtcclxuICAgICAgICAgICAgICAvLyBtb2RlbCBpcyBpbnNpZGUgYW5vdGhlciBzbG90XHJcbiAgICAgICAgICAgICAgaWYgKGVsLmVuZCA+PSBzY2hlZHVsZS5lbmQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuc3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlLmVuZCA9IGVsLmVuZDtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlLnN0YXJ0ID0gZWwuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIG1vZGVsIGNvbXBsZXRlbHkgY292ZXJzIGFub3RoZXIgc2xvdFxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKHNjaGVkdWxlLmVuZCA+PSBlbC5lbmQgJiYgc2NoZWR1bGUuc3RhcnQgPD0gZWwuc3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gYW5vdGhlciBzbG90J3MgZW5kIGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgICAgICAgZWxzZSBpZiAoZWwuZW5kID49IHNjaGVkdWxlLnN0YXJ0ICYmIGVsLmVuZCA8PSBzY2hlZHVsZS5lbmQpIHtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlcy5zcGxpY2Uoc2NoZWR1bGVzLmluZGV4T2YoZWwpLCAxKTtcclxuICAgICAgICAgICAgICAgIHNjaGVkdWxlLnN0YXJ0ID0gZWwuc3RhcnQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIGFub3RoZXIgc2xvdCdzIHN0YXJ0IGlzIGluc2lkZSBjdXJyZW50IG1vZGVsXHJcbiAgICAgICAgICAgICAgZWxzZSBpZiAoZWwuc3RhcnQgPj0gc2NoZWR1bGUuc3RhcnQgJiYgZWwuc3RhcnQgPD0gc2NoZWR1bGUuZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZXMuc3BsaWNlKHNjaGVkdWxlcy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgICAgICAgICBzY2hlZHVsZS5lbmQgPSBlbC5lbmQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWxldGUgb24gcmlnaHQgY2xpY2sgb24gc2xvdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBkZWxldGVTZWxmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5yZW1vdmVDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgICAgICAgc2NvcGUuaXRlbS5zY2hlZHVsZXMuc3BsaWNlKHNjb3BlLml0ZW0uc2NoZWR1bGVzLmluZGV4T2Yoc2NvcGUuc2NoZWR1bGUpLCAxKTtcclxuICAgICAgICAgIGNvbnRhaW5lckVsLmZpbmQoJ3dlZWtseS1zbG90JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBlbGVtZW50LmZpbmQoJ3NwYW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZGVsZXRlU2VsZigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb250YWluZXJFbC5hZGRDbGFzcygnc2xvdC1ob3ZlcicpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ3Nsb3QtaG92ZXInKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGlmIChzY29wZS5pdGVtLmVkaXRhYmxlICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgc2NvcGUuc3RhcnRSZXNpemVTdGFydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNjb3BlLnN0YXJ0RHJhZygpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzY29wZS5zdGFydFJlc2l6ZUVuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVzaXplRGlyZWN0aW9uSXNTdGFydCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzY29wZS5zdGFydERyYWcoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2NvcGUuc3RhcnREcmFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLmFkZENsYXNzKCdkcmFnZ2luZycpO1xyXG4gICAgICAgICAgICBjb250YWluZXJFbC5hdHRyKCduby1hZGQnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlc09uRHJhZ1N0YXJ0ID0ge3N0YXJ0OiBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlLnN0YXJ0LCBlbmQ6IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUuZW5kfTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2NvcGUuZW5kRHJhZyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgcHJldmVudHMgdXNlciBmcm9tIGFjY2lkZW50YWxseVxyXG4gICAgICAgICAgICAvLyBhZGRpbmcgbmV3IHNsb3QgYWZ0ZXIgcmVzaXppbmcgb3IgZHJhZ2dpbmdcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQXR0cignbm8tYWRkJyk7XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgY29udGFpbmVyRWwucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XHJcblxyXG4gICAgICAgICAgICBtZXJnZU92ZXJsYXBzKCk7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzY29wZS5yZXNpemUgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBwaXhlbFRvVmFsKGQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc2l6ZURpcmVjdGlvbklzU3RhcnQpIHtcclxuICAgICAgICAgICAgICB2YXIgbmV3U3RhcnQgPSBNYXRoLnJvdW5kKHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0ICsgZGVsdGEpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0IDw9IHVpLmVuZCAtIDEgJiYgbmV3U3RhcnQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydCxcclxuICAgICAgICAgICAgICAgICAgZW5kOiB1aS5lbmRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2YXIgbmV3RW5kID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5lbmQgKyBkZWx0YSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh1aS5lbmQgIT09IG5ld0VuZCAmJiBuZXdFbmQgPj0gdWkuc3RhcnQgKyAxICYmIG5ld0VuZCA8PSBjb25mLm5iV2Vla3MpIHtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgICAgICBzdGFydDogdWkuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgIGVuZDogbmV3RW5kXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2NvcGUuZHJhZyA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHZhciB1aSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IHBpeGVsVG9WYWwoZCk7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHZhbHVlc09uRHJhZ1N0YXJ0LmVuZCAtIHZhbHVlc09uRHJhZ1N0YXJ0LnN0YXJ0O1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld1N0YXJ0ID0gTWF0aC5yb3VuZCh2YWx1ZXNPbkRyYWdTdGFydC5zdGFydCArIGRlbHRhKTtcclxuICAgICAgICAgICAgdmFyIG5ld0VuZCA9IE1hdGgucm91bmQobmV3U3RhcnQgKyBkdXJhdGlvbik7XHJcblxyXG4gICAgICAgICAgICBpZiAodWkuc3RhcnQgIT09IG5ld1N0YXJ0ICYmIG5ld1N0YXJ0ID49IDAgJiYgbmV3RW5kIDw9IGNvbmYubmJXZWVrcykge1xyXG4gICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoe1xyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LFxyXG4gICAgICAgICAgICAgICAgZW5kOiBuZXdFbmRcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbiBpbml0LCBtZXJnZSBvdmVybGFwc1xyXG4gICAgICAgIG1lcmdlT3ZlcmxhcHModHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vLy8gVUkgLT4gbW9kZWwgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHBhcnNlcnMucHVzaChmdW5jdGlvbiBvblVJQ2hhbmdlKHVpKSB7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5zdGFydCA9IHRpbWVTZXJ2aWNlLmFkZFdlZWsoY29uZi5taW5EYXRlLCB1aS5zdGFydCkudG9EYXRlKCk7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS5lbmQgPSB0aW1lU2VydmljZS5hZGRXZWVrKGNvbmYubWluRGF0ZSwgdWkuZW5kKS50b0RhdGUoKTtcclxuICAgICAgICAgIC8vJGxvZy5kZWJ1ZygnUEFSU0VSIDonLCBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZS4kJGhhc2hLZXksIGluZGV4LCBzY29wZS4kaW5kZXgsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKTtcclxuICAgICAgICAgIHNjaGVkdWxlckN0cmwub24uY2hhbmdlKGluZGV4LCBzY29wZS4kaW5kZXgsIG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKTtcclxuICAgICAgICAgIHJldHVybiBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8vLyBtb2RlbCAtPiBVSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uIG9uTW9kZWxDaGFuZ2UobW9kZWwpIHtcclxuICAgICAgICAgIHZhciB1aSA9IHtcclxuICAgICAgICAgICAgc3RhcnQ6IHRpbWVTZXJ2aWNlLndlZWtQcmVjaXNlRGlmZihjb25mLm1pbkRhdGUsIG1vbWVudChtb2RlbC5zdGFydCksIHRydWUpLFxyXG4gICAgICAgICAgICBlbmQ6IHRpbWVTZXJ2aWNlLndlZWtQcmVjaXNlRGlmZihjb25mLm1pbkRhdGUsIG1vbWVudChtb2RlbC5lbmQpLCB0cnVlKVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIC8vJGxvZy5kZWJ1ZygnRk9STUFUVEVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCB1aSk7XHJcbiAgICAgICAgICByZXR1cm4gdWk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgdWkgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgICAgdmFyIGNzcyA9IHtcclxuICAgICAgICAgICAgbGVmdDogdWkuc3RhcnQgLyBjb25mLm5iV2Vla3MgKiAxMDAgKyAnJScsXHJcbiAgICAgICAgICAgIHdpZHRoOiAodWkuZW5kIC0gdWkuc3RhcnQpIC8gY29uZi5uYldlZWtzICogMTAwICsgJyUnXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vJGxvZy5kZWJ1ZygnUkVOREVSIDonLCBpbmRleCwgc2NvcGUuJGluZGV4LCBjc3MpO1xyXG4gICAgICAgICAgZWxlbWVudC5jc3MoY3NzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS4kb24oJ3dlZWtseVNjaGVkdWxlckxvY2FsZUNoYW5nZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAvLyBTaW1wbGUgY2hhbmdlIG9iamVjdCByZWZlcmVuY2Ugc28gdGhhdCBuZ01vZGVsIHRyaWdnZXJzIGZvcm1hdHRpbmcgJiByZW5kZXJpbmdcclxuICAgICAgICAgIHNjb3BlLnNjaGVkdWxlID0gYW5ndWxhci5jb3B5KHNjb3BlLnNjaGVkdWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSk7Il19

angular.module('ngWeeklySchedulerTemplates', []).run(['$templateCache', function($templateCache) {$templateCache.put('index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Angularjs weekly scheduler demo</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.min.css"><!--[if lt IE 9]>\r\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.0/gh-fork-ribbon.ie.min.css"/>\r\n  <![endif]--><link rel="stylesheet" href="testStyles.css"></head><body class="container-fluid" ng-app="demoApp"><a class="github-fork-ribbon" href="https://github.com/fmaturel/angular-weekly-scheduler" title="Fork me on GitHub">Fork me on GitHub</a><nav class="navbar navbar-default navbar-fixed-top"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">dijit</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="active"><a href="#demo">Demo <span class="sr-only">(current)</span></a></li><li><a href="#run">Run @ Home</a></li><li><a href="#install">Install</a></li><li><a href="#features">Features</a></li></ul></div></div></nav><div class="row" ng-controller="DemoController as demo"><div class="col-xs-10 col-xs-offset-1"><h1>Angularjs weekly scheduler</h1><h2 id="demo" class="page-header">1. Demo</h2><div><label for="language">Choose your language:</label><select id="language" ng-model="model.locale" ng-change="demo.onLocaleChange()"><option value="en-us" selected="selected">us</option><option value="en-gb" selected="selected">gb</option><option value="fr-fr">fr</option><option value="de-de">de</option><option value="es-es">es (lang customized in demo)</option></select></div><div><code>$scope.model</code><pre ng-bind="model | json" style="max-height: 200px"></pre></div><weekly-scheduler class="scheduler" items="model.items" on-change="demo.doSomething" on-delete="demo.doSomething" options="model.options"><div class="srow">{{::$index + 1}}. {{item.label}}</div></weekly-scheduler><div class="pull-right"><button class="btn btn-success" role="button" ng-click="model.items.push({label: \'New Item\'})">Add new item</button></div><h2 id="run" class="page-header">2. Run @ Home</h2><p>Run the demo @home with few steps (prerequisite git & node V0.10+ & npm installed):</p><pre>\r\ngit clone https://github.com/fmaturel/angular-weekly-scheduler.git && cd angular-weekly-scheduler\r\nnpm install\r\nnpm install -g grunt-cli</pre><p>Then run <code>grunt serve:dist</code></p><h2 id="install" class="page-header">3. Install</h2><p><code>bower install --save angular-weekly-scheduler</code></p><p>or</p><p><code>npm install --save angular-weekly-scheduler</code></p><p>Add the scripts and css to your index.html. The angular-locale_xx-xx.js file is your locale file</p><pre>\r\n&lt;link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"&gt;\r\n&lt;script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.10/angular.min.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.4.10/angular-locale_xx-xx.js"&gt;&lt;/script&gt;\r\n&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js"&gt;&lt;/script&gt;\r\n\r\n&lt;!-- The library to replace with your local copy of ng-weekly-scheduler --&gt;\r\n&lt;script src="https://github.com/fmaturel/angular-weekly-scheduler/blob/master/dist/js/ng-weekly-scheduler.js"&gt;&lt;/script&gt;</pre><p>Add dependency to timeline your angular module: weeklyScheduler.</p><p>Use the directive:</p><code>&lt;weekly-scheduler class="scheduler" ng-model="myScopeModel" options="options"&gt;&lt;/weekly-scheduler&gt;</code><h2 id="features" class="page-header">4. Features</h2><p>This directive displays a weekly item scheduler. You can see, add and modify items easily.</p><h3>Keyboard shortcuts</h3><ul><li>Use <kbd>mouse wheel</kbd> on schedule to scroll left and right</li><li>Use <kbd>ctrl + mouse wheel</kbd> to zoom in and out the schedule</li></ul><hr><h3>Schedules</h3><div class="alert alert-info alert-dismissible fade in" role="alert">This directive uses <a href="http://momentjs.com/"><strong>MomentJS</strong></a> to position items and calculate localized calendar weeks.</div><p>Drag the time bar start, end and body to quickly change your schedule period.</p><p>You can set an <code>editable</code> variable on each item, that will be used to disable item edition if <code>false</code>.<pre>\r\n"items": [{\r\n  "label": "Item 1",\r\n  "editable": false,\r\n  "schedules": [\r\n    {\r\n      "start": "2015-12-26T23:00:00.000Z",\r\n      "end": "2016-07-31T22:00:00.000Z"\r\n    }\r\n  ]\r\n}, ...]</pre></p><hr><h3>Transclusion</h3><p>This directive is using <code>ng-transclude</code> so that everything in <code>&lt;weekly-scheduler&gt;</code> element will be treated as the labelling object of one item.</p><pre>&lt;div class="srow"&gt;\\{\\{::$index + 1\\}\\}. \\{\\{ item.label \\}\\}&lt;/div&gt;</pre><p>On transcluded item label, the scope contains <code>item</code> attribute name containing each item model and regular <code>ng-repeat</code> scope attributes</p><h3>Internationalisation (i18n)</h3><p>I18N uses <a href="https://github.com/lgalfaso/angular-dynamic-locale">dynamic angular <code>$locale</code> change</a>.</p><p>An i18n module named <code>weeklySchedulerI18N</code> is optionally registered when using the core module :</p><pre>angular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])</pre><p>If present, core directive will retrieve current <code>$locale</code> and use it to translate labelling elements.</p><p>You can add more <code>$locale</code> translation using provider <code>weeklySchedulerLocaleServiceProvider</code>:</p><pre>\r\nangular.module(\'demoApp\', [\'weeklyScheduler\', \'weeklySchedulerI18N\'])\r\n  .config([\'weeklySchedulerLocaleServiceProvider\', function (localeServiceProvider) {\r\n    localeServiceProvider.configure({\r\n      doys: {\'es-es\': 4},\r\n      lang: {\'es-es\': {weekNb: \'n\xFAmero de la semana\', addNew: \'A\xF1adir\'}},\r\n      localeLocationPattern: \'/vendor/angular-i18n/angular-locale_{{locale}}.js\'\r\n    });\r\n  }])</pre><h3>Animation</h3><p>You can add animation to the weekly scheduler directive easily by importing angular module <code>ngAnimate</code>.<br>Your application could for instance use :</p><pre>angular.module(\'demoApp\', [\'ngAnimate\', \'weeklyScheduler\'])</pre><p>Don\'t forget to add the angular-animate javascript file to your Single Page App <code>index.html</code>.</p><pre>&lt;script src="/vendor/angular-animate/angular-animate.js"&gt;&lt;/script&gt;</pre><p>Styling can be changed to whatever you like. This is an example of fading-in items entering the DOM :</p><pre>.schedule-animate {\r\n  transition: opacity 200ms ease-out;\r\n}\r\n.schedule-animate.ng-enter, .schedule-animate.ng-hide-remove {\r\n  opacity: 0;\r\n}\r\n.schedule-animate.ng-leave, .schedule-animate.ng-hide-add {\r\n  display: none;\r\n  opacity: 1;\r\n}</pre><p>You should see your scheduler items fading in!</p></div></div><script src="testVendorScripts.js"></script><script src="testScripts.js"></script><script>(function (i, s, o, g, r, a, m) {\r\n    i[\'GoogleAnalyticsObject\'] = r;\r\n    i[r] = i[r] || function () {\r\n        (i[r].q = i[r].q || []).push(arguments)\r\n      }, i[r].l = 1 * new Date();\r\n    a = s.createElement(o),\r\n      m = s.getElementsByTagName(o)[0];\r\n    a.async = 1;\r\n    a.src = g;\r\n    m.parentNode.insertBefore(a, m)\r\n  })(window, document, \'script\', \'https://www.google-analytics.com/analytics.js\', \'ga\');\r\n\r\n  ga(\'create\', \'UA-22755333-1\', \'auto\');\r\n  ga(\'send\', \'pageview\');</script></body></html>');
$templateCache.put('ng-weekly-scheduler/multislider/multislider.html','<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class="slot" ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model="schedule" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
$templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html','<div class="labels"><div class="srow text-right">{{schedulerCtrl.config.labels.weekNb || \'Week number\'}}</div><div class="schedule-animate" ng-repeat="item in schedulerCtrl.items" inject></div></div><div class="schedule-area-container"><div class="schedule-area"><div class="srow timestamps"><weekly-grid class="grid-container"></weekly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><weekly-grid class="grid-container striped" no-text></weekly-grid><multi-slider index="{{$index}}"></multi-slider></div></div></div>');
$templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html','<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag="resize" ondragstart="startResizeStart" ondragstop="endDrag" handle></div><div ondrag="drag" ondragstart="startDrag" ondragstop="endDrag" handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag="resize" ondragstart="startResizeEnd" ondragstop="endDrag" handle></div><div class="remove"><span class="glyphicon glyphicon-remove"></span></div></div>');}]);