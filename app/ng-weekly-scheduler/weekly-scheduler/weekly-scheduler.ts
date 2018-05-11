/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$element',
    '$scope',
    'groupService',
    'dayMap',
    'scheduleValidatorService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private groupService: GroupService,
    private dayMap: { [key: number]: string },
    private scheduleValidatorService: ScheduleValidatorService
  ) {
  }

  private adapter: IWeeklySchedulerAdapter<any, any>;
  private rangeAdapter: IWeeklySchedulerRangeAdapter<any, any>;

  /* We need to modify the items that are being watched inside the watcher, so we'll have to cancel and readd the watcher to prevent infdig */
  private itemsWatcherCanceller: () => void;

  public hasInvalidSchedule: boolean;
  public hoverClass: string;

  public config: IWeeklySchedulerConfig<any>
  public items: IInternalWeeklySchedulerItem<any>[];
  public previousItems: IInternalWeeklySchedulerItem<any>[];
  public options: IWeeklySchedulerOptions<any>;

  public onAdd: () => void;
  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: IWeeklySchedulerRange<any> }) => void;
  public onDelete: () => void;

  public defaultOptions: IWeeklySchedulerOptions<any> = {
    createItem: (day, schedules) => { return { day: day, schedules: schedules } },
    defaultValue: null,
    monoSchedule: false
  };

  $doCheck() {
    // Check for reference equality, not object equality.
    // This should only rerun if the whole set of items is replaced on the client.
    if(this.items !== this.previousItems) {
      this.items = this.fillItems(this.items);
      this.previousItems = this.items;
    }
  }

  $onInit() {
    this.config = this.configure(this.options);
    this.items = this.fillItems(this.buildItemsFromAdapter());
    this.updateScheduleValidity();
    
    let test = this.buildItemsFromAdapter();

    this.previousItems = this.items;

    this.buildItemsFromAdapter();

    this.watchHoverClass();
  }

  private buildItemsFromAdapter() {
    let result = [];
    
    if (this.adapter && this.rangeAdapter) {
      let schedules = this.rangeAdapter.adapt(this.adapter.initialData);
      let groupedSchedules = this.groupService.groupSchedules(schedules);

      for (let key in groupedSchedules) {
        result.push(this.createItem(parseInt(key, 10), groupedSchedules[key]));
      }
    }

    return result;
  }

  private checkScheduleValidity() {
    return this.items.some(item => !this.scheduleValidatorService.areSchedulesValid(item, this.config));
  }

  /**
   * Configure the scheduler.
   */
  private configure(options: IWeeklySchedulerOptions<any>): IWeeklySchedulerConfig<any> {
    var interval = options.interval || 15; // minutes
    var hoursInDay = 24;
    var minutesInDay = hoursInDay * 60;
    var intervalCount = minutesInDay / interval;

    var result: IWeeklySchedulerConfig<any> = angular.extend(this.defaultOptions, {
      createItem: options.createItem,
      editSlot: options.editSlot,
      fullCalendar: options.fullCalendar,
      interval: interval,
      maxValue: minutesInDay,
      hourCount: hoursInDay,
      intervalCount: intervalCount
    });

    return result;
  }

  private createItem(day: number, schedules: IWeeklySchedulerRange<any>[]) {
    let result: IInternalWeeklySchedulerItem<any>;

    let builder: IWeeklySchedulerItem<any> = this.config.createItem(day, schedules);

    result = angular.extend(builder, { label: this.dayMap[day] });

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
        result.push(this.createItem(key, []));
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
    adapter: '<',
    hoverClass: '<',
    options: '=',
    onAdd: '&',
    onChange: '&',
    onDelete: '&',
    rangeAdapter: '<',
  };

  controller = WeeklySchedulerController.$name;
  controllerAs = WeeklySchedulerController.$controllerAs;

  transclude = true;
  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
}

angular.module('weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
