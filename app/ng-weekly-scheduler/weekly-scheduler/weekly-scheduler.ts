/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$scope',
    'overlapService'
  ];

  constructor(
    private $scope: angular.IScope,
    private overlapService: OverlapService
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
    this.hasInvalidSchedule = !this.checkScheduleValidity();
    this.config = this.configure(this.options);

    /**
     * Watch the model items
     */
    this.$scope.$watchCollection(() => this.items, (newItems) => this.onModelChange(newItems));
  }

  private checkScheduleValidity() {
    for (let itemKey in this.items) {
      let currentItem = this.items[itemKey];
      let scheduleCount = currentItem.schedules.length;

      if (scheduleCount) {
        // Compare two at a time until the end
        for (let i = 0; i < scheduleCount - 1; i++) {
          let currentSchedule = currentItem.schedules[i];
          let nextSchedule = currentItem.schedules[i+1];

          if (this.overlapService.getOverlapState(currentSchedule.start, currentSchedule.end || this.config.maxValue, nextSchedule.start, nextSchedule.end || this.config.maxValue) !== OverlapState.NoOverlap) {
            return false;
          }
        }

        return false;
      }
    }

    return true;
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
