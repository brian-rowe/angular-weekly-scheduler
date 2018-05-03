/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$scope',
    'scheduleValidatorService'
  ];

  constructor(
    private $scope: angular.IScope,
    private scheduleValidatorService: ScheduleValidatorService
  ) {
  }

  public hasInvalidSchedule: boolean;

  public config: IWeeklySchedulerConfig;
  public items: IWeeklySchedulerItem<number>[];
  public options: IWeeklySchedulerOptions;

  public onAdd: () => void;
  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: IWeeklySchedulerRange<any> }) => void;
  public onDelete: () => void;

  public defaultOptions: IWeeklySchedulerOptions = {
    monoSchedule: false
  };

  $onInit() {
    this.hasInvalidSchedule = this.checkScheduleValidity();
    this.config = this.configure(this.options);

    /**
     * Watch the model items
     */
    this.$scope.$watchCollection(() => this.items, (newItems) => this.onModelChange(newItems));
  }

  private checkScheduleValidity() {
    return this.items.some(item => !this.scheduleValidatorService.areSchedulesValid(item, this.config));
  }

  /**
   * Configure the scheduler.
   */
  private configure(options: IWeeklySchedulerOptions): IWeeklySchedulerConfig {
    var interval = options.interval || 15; // minutes
    var hoursInDay = 24;
    var minutesInDay = hoursInDay * 60;
    var intervalCount = minutesInDay / interval;

    var result: IWeeklySchedulerConfig = angular.extend(this.defaultOptions, {
      editSlot: options.editSlot,
      interval: interval,
      maxValue: minutesInDay,
      hourCount: hoursInDay,
      intervalCount: intervalCount
    });

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
    }
  }
}

/** @internal */
class WeeklySchedulerComponent implements angular.IComponentOptions {
  static $name = 'weeklyScheduler';

  bindings = {
    items: '=',
    options: '=',
    onAdd: '&',
    onChange: '&',
    onDelete: '&'
  };
  
  controller = WeeklySchedulerController.$name;
  controllerAs = WeeklySchedulerController.$controllerAs;

  transclude = true;
  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
}

angular.module('weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
