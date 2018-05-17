/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'brWeeklySchedulerController';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    'brWeeklySchedulerGroupService',
    'brWeeklySchedulerDayMap',
    'brWeeklySchedulerValidationService',
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private groupService: GroupService,
    private dayMap: { [key: number]: string },
    private scheduleValidatorService: ScheduleValidationService
  ) {
  }

  private _originalItems: IInternalWeeklySchedulerItem<any>[];

  private adapter: br.weeklyScheduler.IWeeklySchedulerAdapter<any, any>;
  private rangeAdapter: br.weeklyScheduler.IWeeklySchedulerRangeAdapter<any, any>;

  /** should be true if the scheduler has been interacted with */
  public dirty: boolean;

  /** should be true if the scheduler became invalid after being initialized */
  public invalid: boolean;

  /** should be true if the scheduler was **initialized** with invalid values */
  public startedWithInvalidSchedule: boolean;
  public hoverClass: string;

  public config: IWeeklySchedulerConfig<any>
  public items: IInternalWeeklySchedulerItem<any>[];
  public options: br.weeklyScheduler.IWeeklySchedulerOptions<any>;

  public onChange: (options: { itemIndex: number, scheduleIndex: number, scheduleValue: br.weeklyScheduler.IWeeklySchedulerRange<any> }) => void;

  public defaultOptions: br.weeklyScheduler.IWeeklySchedulerOptions<any> = {
    createItem: (day, schedules) => { return { day: day, schedules: schedules } },
    defaultValue: null,
    monoSchedule: false
  };

  public validationErrors: ValidationError[];

  $doCheck() {
    let validationErrors = this.getValidationErrors();

    if (validationErrors) {
      this.validationErrors = validationErrors;
    }
  }

  $onInit() {
    this.config = this.configure(this.options);
    this.buildItemsFromAdapter();
    this.startedWithInvalidSchedule = this.hasInvalidSchedule();
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

  private getValidationErrors() {
    return Array.prototype.concat.apply([], this.items.map(item => this.scheduleValidatorService.getValidationErrors(item, this.config)));
  }

  private hasInvalidSchedule() {
    let validationErrors: ValidationError[] = this.getValidationErrors();

    return validationErrors.length > 0;
  }

  /**
   * Configure the scheduler.
   */
  private configure(options: br.weeklyScheduler.IWeeklySchedulerOptions<any>): IWeeklySchedulerConfig<any> {
    var interval = options.interval || 15; // minutes
    var hoursInDay = 24;
    var minutesInDay = hoursInDay * 60;
    var intervalCount = minutesInDay / interval;

    var userOptions = angular.extend(this.defaultOptions, options);

    var result = angular.extend(userOptions, {
      interval: interval,
      maxValue: minutesInDay,
      hourCount: hoursInDay,
      intervalCount: intervalCount,
    });

    return result;
  }

  private createItem(day: number, schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[]) {
    let result: IInternalWeeklySchedulerItem<any>;

    let builder: br.weeklyScheduler.IWeeklySchedulerItem<any> = this.config.createItem(day, schedules);

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
}

/** @internal */
class WeeklySchedulerComponent implements angular.IComponentOptions {
  static $name = 'brWeeklyScheduler';

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

angular.module('br.weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
