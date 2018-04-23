/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$scope',
    'weeklySchedulerLocaleService'
  ];

  constructor(
    private $scope: angular.IScope,
    private localeService: any  /* TODO type */
  ) {
  }

  public config: IWeeklySchedulerConfig;
  public items: IWeeklySchedulerItem<number>[];
  public options: IWeeklySchedulerOptions;
  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: IWeeklySchedulerRange<number> }) => void;

  public defaultOptions: IWeeklySchedulerOptions = {
    monoSchedule: false,
    selector: '.schedule-area-container'
  };

  public $modelChangeListeners: ((config: IWeeklySchedulerConfig) => void)[];

  $onInit() {
    this.defaultOptions.labels = this.localeService.getLang();

    // Will hang our model change listeners
    this.$modelChangeListeners = [];

    /**
     * Watch the model items
     */
    this.$scope.$watchCollection(() => this.items, (newItems) => this.onModelChange(newItems));

    /**
     * Listen to $locale change (brought by external module weeklySchedulerI18N)
     */
    this.$scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
      if (this.config) {
        this.config.labels = labels;
      }
      this.onModelChange(angular.copy(this.items, []));
    });
  }

  /**
   * Configure the scheduler.
   */
  private configure(options: IWeeklySchedulerOptions): IWeeklySchedulerConfig {
    var interval = options.interval || 15; // minutes
    var hoursInDay = 24;
    var minutesInDay = hoursInDay * 60;
    var intervalCount = minutesInDay / interval;

    var result: IWeeklySchedulerConfig = angular.extend(options, { interval: interval, maxValue: minutesInDay, hourCount: hoursInDay, intervalCount: intervalCount });

    return result;
  }

  private onModelChange(items: IWeeklySchedulerItem<number>[]) {
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
      items.forEach((item) => {
        var schedules = item.schedules;

        if (schedules && schedules.length) {
          if (this.options.monoSchedule) {
            item.schedules = [schedules[0]];
          }
        } else {
          item.schedules = [];
        }
      });

      // Calculate configuration
      this.config = this.configure(this.options);

      // Finally, run the sub directives listeners
      this.$modelChangeListeners.forEach((listener) => {
        listener(this.config);
      });
    }
  }
}

/** @internal */
class WeeklySchedulerDirective implements angular.IDirective {
  static $name = 'weeklyScheduler';

  bindToController = true;
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
    var scheduleContainer = element[0].querySelector(schedulerCtrl.defaultOptions.selector);

    if (scheduleContainer) {
      // Install mouse scrolling event listener for H scrolling
      mouseScroll(scheduleContainer, 20);

      scope.$on(WeeklySchedulerEvents.CLICK_ON_A_CELL, function (e, data) {
        zoomInACell(scheduleContainer, e, data);
      });
    }
  }

  static Factory() {
    let directive = () => new WeeklySchedulerDirective();

    return directive;
  }
}

angular.module('weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .directive(WeeklySchedulerDirective.$name, WeeklySchedulerDirective.Factory());
