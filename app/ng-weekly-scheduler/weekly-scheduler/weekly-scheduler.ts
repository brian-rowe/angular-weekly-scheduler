class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$injector',
    '$log'
  ];

  constructor(
    private $injector: angular.auto.IInjectorService,
    private $log: angular.ILogService
  ) {
  }

  public config: any; /* TODO type */
  public items: any[]; /* TODO type */

  public defaultOptions: any /* TODO type */ = {
    monoSchedule: false,
    selector: '.schedule-area-container'
  };

  public on: {
    change: (itemIndex, scheduleIndex, scheduleValue) => Function;
  };

  public $modelChangeListeners: Function[]; /* TODO type */

  $onInit() {
    // Try to get the i18n service
    var name = 'weeklySchedulerLocaleService';

    if (this.$injector.has(name)) {
      this.$log.info('The I18N service has successfully been initialized!');

      var localeService: any = this.$injector.get(name); /* TODO type */
      this.defaultOptions.labels = localeService.getLang();
    } else {
      this.$log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
    }

    // Will hang our model change listeners
    this.$modelChangeListeners = [];
  }
}

class WeeklySchedulerDirective implements angular.IDirective {
  static $name = 'weeklyScheduler';

  constructor(
    private $log: angular.ILogService,
    private $parse: angular.IParseService,
    private timeService
  ) {
  }

  restrict = 'E';
  require = 'weeklyScheduler';
  transclude = true;
  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
  controller = WeeklySchedulerController.$name;
  controllerAs = WeeklySchedulerController.$controllerAs;

  link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
    var optionsFn = this.$parse(attrs.options),
      options = angular.extend(schedulerCtrl.defaultOptions, optionsFn(scope) || {});

    // Get the schedule container element
    var el = element[0].querySelector(schedulerCtrl.defaultOptions.selector);
    var self: WeeklySchedulerDirective = this;

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
        schedulerCtrl.config = self.config(items.reduce((result, item) => {
          var schedules = item.schedules;

          return result.concat(schedules && schedules.length ?
            // If in multiSlider mode, ensure a schedule array is present on each item
            // Else only use first element of schedule array
            (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
            item.schedules = []
          );
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
        change: (itemIndex, scheduleIndex, scheduleValue) => {
          var onChangeFunction = this.$parse(attrs.onChange)(scope);
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
  }

  /**
   * Configure the scheduler.
   * @param schedules
   * @param options
   * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
   */
  private config(schedules, options) {
    var now = moment();

    // Calculate min date of all scheduled events
    var minDate = (schedules ? schedules.reduce((minDate, slot) => {
      return this.timeService.compare(slot.start, 'isBefore', minDate);
    }, now) : now).startOf('week');

    // Calculate max date of all scheduled events
    var maxDate = (schedules ? schedules.reduce((maxDate, slot) => {
      return this.timeService.compare(slot.end, 'isAfter', maxDate);
    }, now) : now).clone().add(1, 'year').endOf('week');

    // Calculate nb of weeks covered by minDate => maxDate
    var nbWeeks = this.timeService.weekDiff(minDate, maxDate);

    var result = angular.extend(options, { minDate: minDate, maxDate: maxDate, nbWeeks: nbWeeks });
    // Log configuration
    this.$log.debug('Weekly Scheduler configuration:', result);

    return result;
  }

  static Factory() {
    let directive = ($log, $parse, timeService) => new WeeklySchedulerDirective($log, $parse, timeService);

    directive.$inject = [
      '$log',
      '$parse',
      'weeklySchedulerTimeService'
    ];

    return directive;
  }
}

/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .directive(WeeklySchedulerDirective.$name, WeeklySchedulerDirective.Factory());
