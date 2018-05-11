/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$element',
    '$scope',
    'dayMap',
    'scheduleValidatorService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private dayMap: { [key: number]: string },
    private scheduleValidatorService: ScheduleValidatorService
  ) {
  }

  /* We need to modify the items that are being watched inside the watcher, so we'll have to cancel and readd the watcher to prevent infdig */
  private itemsWatcherCanceller: () => void;

  public hasInvalidSchedule: boolean;
  public hoverClass: string;

  public config: IWeeklySchedulerConfig;
  public items: IInternalWeeklySchedulerItem<number>[];
  public options: IWeeklySchedulerOptions;

  public onAdd: () => void;
  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: IWeeklySchedulerRange<any> }) => void;
  public onDelete: () => void;

  public defaultOptions: IWeeklySchedulerOptions = {
    monoSchedule: false
  };

  $onInit() {
    this.config = this.configure(this.options);
    this.updateScheduleValidity();
    this.items = this.fillItems(this.items);

    this.watchHoverClass();
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
      fullCalendar: options.fullCalendar,
      interval: interval,
      maxValue: minutesInDay,
      hourCount: hoursInDay,
      intervalCount: intervalCount
    });

    return result;
  }

  /**
   * The scheduler should always show all days, even if it was not passed any schedules for that day
   */
  private fillItems(items: IInternalWeeklySchedulerItem<any>[]) {
    let result: IInternalWeeklySchedulerItem<any>[] = [];

    angular.forEach(this.dayMap, (day: string, stringKey: string) => {
      let key = parseInt(stringKey, 10);
      let filteredItems = items.filter(item => item.day === key);
      let item: IInternalWeeklySchedulerItem<any> = filteredItems.length ? filteredItems[0] : null;

      if (!item) {
        result.push({
          defaultValue: items.filter(x => x.defaultValue).map(x => x.defaultValue)[0], // grab first defaultValue, they should all be the same -- this shouldn't be defined per item, TODO!
          day: key,
          label: day,
          schedules: []
        });
      } else {
        // If the item DID exist just set the label
        item.label = day;

        result.push(item);
      }
    });

    return angular.copy(result).sort((a, b) => a.day > b.day ? 1 : -1);
  }

  private watchHoverClass() {
    const pulseClass = 'pulse';
    const pulseSelector = `.${pulseClass}`;

    this.$scope.$watch(() => this.hoverClass, () => {
      this.$element.find(pulseSelector).removeClass(pulseClass);

      if (this.hoverClass) {
        this.$element.find(`.${this.hoverClass}`).addClass(pulseClass);
      }
    });
  }

  public updateScheduleValidity() {
    this.hasInvalidSchedule = this.checkScheduleValidity();
  }
}

/** @internal */
class WeeklySchedulerComponent implements angular.IComponentOptions {
  static $name = 'weeklyScheduler';

  bindings = {
    hoverClass: '<',
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
