/** @internal */
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

  public config: IWeeklySchedulerConfig;
  public items: IWeeklySchedulerItem<number>[];

  public defaultOptions: IWeeklySchedulerOptions = {
    monoSchedule: false,
    selector: '.schedule-area-container'
  };

  public on: {
    change: (itemIndex, scheduleIndex, scheduleValue) => Function;
  };

  public $modelChangeListeners: ((config: IWeeklySchedulerConfig) => void)[];

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

/** @internal */
class WeeklySchedulerDirective implements angular.IDirective {
  static $name = 'weeklyScheduler';

  constructor(
    private $log: angular.ILogService
  ) {
  }

  controller = WeeklySchedulerController.$name;
  controllerAs = WeeklySchedulerController.$controllerAs;

  restrict = 'E';
  require = 'weeklyScheduler';

  scope = {
    items: '=',
    options: '=',
    onChange: '&'
  };

  transclude = true;
  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';

  link = (scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, schedulerCtrl: WeeklySchedulerController) => {
    let options = angular.extend(schedulerCtrl.defaultOptions, scope.options || {});

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
        
        // If in multiSlider mode, ensure a schedule array is present on each item
        // Else only use first element of schedule array
        items.forEach((item) => {
          var schedules = item.schedules;

          if (schedules && schedules.length) {
            if (options.monoSchedule) {
              item.schedules = [schedules[0]];
            }
          } else {
            item.schedules = [];
          }
        });

        // Calculate configuration
        schedulerCtrl.config = self.config(options);

        // Finally, run the sub directives listeners
        schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
          listener(schedulerCtrl.config);
        });
      }
    }

    if (el) {
      // Install mouse scrolling event listener for H scrolling
      mouseScroll(el, 20);

      scope.$on(WeeklySchedulerEvents.CLICK_ON_A_CELL, function (e, data) {
        zoomInACell(el, e, data);
      });

      schedulerCtrl.on = {
        change: (itemIndex, scheduleIndex, scheduleValue) => {
          if (angular.isFunction(scope.onChange)) {
            return scope.onChange({
              itemIndex: itemIndex,
              scheduleIndex: scheduleIndex,
              scheduleValue: scheduleValue
            });
          }
        }
      };

      /**
       * Watch the model items
       */
      scope.$watchCollection(() => scope.items, onModelChange);

      /**
       * Listen to $locale change (brought by external module weeklySchedulerI18N)
       */
      scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
        if (schedulerCtrl.config) {
          schedulerCtrl.config.labels = labels;
        }
        onModelChange(angular.copy(scope.items, []));
      });
    }
  }

  /**
   * Configure the scheduler.
   */
  private config(options: IWeeklySchedulerOptions): IWeeklySchedulerConfig {
    var interval = options.interval || 15; // minutes
    var hoursInDay = 24;
    var minutesInDay = hoursInDay * 60;
    var intervalCount = minutesInDay / interval;

    var result: IWeeklySchedulerConfig = angular.extend(options, { interval: interval, maxValue: minutesInDay, hourCount: hoursInDay, intervalCount: intervalCount });

    // Log configuration
    this.$log.debug('Weekly Scheduler configuration:', result);

    return result;
  }

  static Factory() {
    let directive = ($log) => new WeeklySchedulerDirective($log);

    directive.$inject = [
      '$log'
    ];

    return directive;
  }
}

angular.module('weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .directive(WeeklySchedulerDirective.$name, WeeklySchedulerDirective.Factory());
