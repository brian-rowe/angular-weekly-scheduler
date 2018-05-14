/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'weeklySchedulerController';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    'groupService',
    'dayMap',
    'scheduleValidatorService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private groupService: GroupService,
    private dayMap: { [key: number]: string },
    private scheduleValidatorService: ScheduleValidatorService
  ) {
  }

  private _originalItems: IInternalWeeklySchedulerItem<any>[];

  private adapter: IWeeklySchedulerAdapter<any, any>;
  private rangeAdapter: IWeeklySchedulerRangeAdapter<any, any>;

  /** should be true if the scheduler has been interacted with */
  public dirty: boolean;
  
  public hasInvalidSchedule: boolean;
  public hoverClass: string;

  public config: IWeeklySchedulerConfig<any>
  public items: IInternalWeeklySchedulerItem<any>[];
  public options: IWeeklySchedulerOptions<any>;

  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: IWeeklySchedulerRange<any> }) => void;

  public defaultOptions: IWeeklySchedulerOptions<any> = {
    createItem: (day, schedules) => { return { day: day, schedules: schedules } },
    saveScheduler: () => {
      console.log('saved');
      return this.$q.when();
    },
    defaultValue: null,
    monoSchedule: false
  };

  $onInit() {
    this.config = this.configure(this.options);
    this.buildItemsFromAdapter();
    this.updateScheduleValidity();
    this.watchAdapter();
    this.watchHoverClass();
  }

  private buildItems(items: IInternalWeeklySchedulerItem<any>[]) {
    this.items = this.fillItems(items);

    // keep a reference on the adapter so we can pull it out later
    this.adapter.items = this.items;

    // keep a copy of the items in case we need to rollback
    this._originalItems = angular.copy(this.items);
  }

  private buildItemsFromAdapter() {
    return this.buildItems(this.getItemsFromAdapter());
  }

  private getItemsFromAdapter() {
    let result = [];

    if (this.adapter && this.rangeAdapter) {
      let schedules = this.rangeAdapter.adapt(this.adapter.initialData);
      let groupedSchedules = this.groupService.groupSchedules(schedules);

      for (let key in groupedSchedules) {
        let item = this.createItem(parseInt(key, 10), groupedSchedules[key]);

        result.push(item);
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
      buttonClasses: options.buttonClasses,
      createItem: options.createItem,
      editSlot: options.editSlot,
      fullCalendar: options.fullCalendar,
      interval: interval,
      maxValue: minutesInDay,
      hourCount: hoursInDay,
      intervalCount: intervalCount,
      saveScheduler: options.saveScheduler
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

  private resetZoom() {
    this.$scope.$broadcast(WeeklySchedulerEvents.RESET_ZOOM);
  }

  private zoomIn() {
    this.$scope.$broadcast(WeeklySchedulerEvents.ZOOM_IN);
  }

  private rollback() {
    this.buildItems(this._originalItems);
    this.dirty = false;
  }

  private save() {
    return this.config.saveScheduler().then(() => this.dirty = false);
  }

  private watchAdapter() {
    this.$scope.$watch(() => {
      return this.adapter;
    }, () => {
      this.buildItemsFromAdapter();
    });
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
    onChange: '&',
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
