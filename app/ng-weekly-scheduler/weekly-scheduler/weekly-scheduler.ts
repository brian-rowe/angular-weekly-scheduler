/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'brWeeklySchedulerController';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    '$timeout',
    'brWeeklySchedulerFillEmptyWithDefaultService',
    'brWeeklySchedulerGroupService',
    'brWeeklySchedulerDayMap',
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerOverlapService',
    'brWeeklySchedulerPurgeDefaultService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private fillEmptyWithDefaultService: FillEmptyWithDefaultService,
    private groupService: GroupService,
    private dayMap: { [key: number]: string },
    private endAdjusterService: EndAdjusterService,
    private overlapService: OverlapService,
    private purgeDefaultService: PurgeDefaultService
  ) {
  }

  private _originalItems: WeeklySchedulerItem<any>[];

  private adapter: br.weeklyScheduler.IWeeklySchedulerAdapter<any, any>;

  public invalidMessage: string = '';
  public isReady: boolean = false;

  /** this is required to be part of a form for dirty/valid checks */
  public formController: angular.IFormController;

  public hoverClass: string;

  public config: IWeeklySchedulerConfig<any>;
  public items: WeeklySchedulerItem<any>[];
  public options: br.weeklyScheduler.IWeeklySchedulerOptions<any>;

  public defaultOptions: br.weeklyScheduler.IWeeklySchedulerOptions<any> = {
    createItem: (day, schedules) => { return { day: day, schedules: schedules } },
    monoSchedule: false,
    onChange: () => angular.noop(),
    onRemove: () => angular.noop(),
    restrictionExplanations: {
      maxTimeSlot: (value) => `Max time slot length: ${value}`,
      fullCalendar: 'For this calendar, every day must be completely full of schedules.',
      monoSchedule: 'This calendar may only have one time slot per day',
      nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.'
    }
  };

  $onInit() {
    this.config = this.configure(this.options);
    this.buildItemsFromAdapter();
    this.watchAdapter();
    this.watchHoverClass();
  }

  $postLink() {
    this.$timeout(() => {
      this.invalidMessage = this.getInvalidMessage();
      this.isReady = true;
    });
  }

  public getConflictingOptions() {
    if (this.options.fullCalendar && this.options.fillEmptyWithDefault) {
      return `Options 'fullCalendar' & 'fillEmptyWithDefault' are mutually exclusive.`;
    }

    if (this.options.fillEmptyWithDefault && !angular.isDefined(this.options.defaultValue)) {
      return `If using option 'fillEmptyWithDefault', you must also provide 'defaultValue.'`;
    }

    return '';
  }

  public getInvalidMessage() {
    let conflictingOptions = this.getConflictingOptions();

    if (conflictingOptions) {
      return conflictingOptions;
    }

    if (this.hasInvalidSchedule()) {
      return 'One or more of the schedules is invalid! Please contact service.';
    }
  }

  public hasInvalidSchedule() {
    return this.formController.$invalid;
  }

  public mergeScheduleIntoItem(item: WeeklySchedulerItem<any>, schedule: WeeklySchedulerRange<any>) {
    item.mergeOverlaps();
  }

  private buildItems(items: WeeklySchedulerItem<any>[]) {
    this.items = this.fillItems(items);

    this.items.forEach(item => item.mergeOverlaps());

    this.items = this.purgeItems(this.items);

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

    if (this.adapter) {
      let schedules = this.adapter.initialData.map(data => this.adapter.customModelToWeeklySchedulerRange(data));
      let groupedSchedules = this.groupService.groupSchedules(schedules);

      for (let key in groupedSchedules) {
        let item = this.createItem(parseInt(key, 10), groupedSchedules[key]);

        result.push(item);
      }
    }

    return result;
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

    return new WeeklySchedulerItem(this.config, result, this.endAdjusterService, this.overlapService);
  }

  /**
   * The scheduler should always show all days, even if it was not passed any schedules for that day
   */
  private fillItems(items: WeeklySchedulerItem<any>[]) {
    let result: WeeklySchedulerItem<any>[] = [];

    angular.forEach(this.dayMap, (day: string, stringKey: string) => {
      let key = parseInt(stringKey, 10);
      let filteredItems = items.filter(item => item.day === key);
      let item: WeeklySchedulerItem<any> = filteredItems.length ? filteredItems[0] : null;

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
 
  private purgeItems(items: WeeklySchedulerItem<any>[]) {
    if (this.config.fillEmptyWithDefault) {
      for (let item of items) {
        item.schedules = this.purgeDefaultService.purge(item.schedules, this.config);
      }
    }

    return items;
  }

  private prepareItems(items: WeeklySchedulerItem<any>[]) {
    if (this.config.fillEmptyWithDefault) {
      for (let item of items) {
        item.schedules = this.fillEmptyWithDefaultService.fill(item, this.config);
      }
    }

    return items;
  }

  private resetZoom() {
    this.$scope.$broadcast(WeeklySchedulerEvents.RESET_ZOOM);
  }

  private zoomIn() {
    this.$scope.$broadcast(WeeklySchedulerEvents.ZOOM_IN);
  }

  private rollback() {
    this.buildItems(this._originalItems);
    this.formController.$setPristine();
  }

  private save() {
    this.items = this.prepareItems(this.items);

    return this.config.saveScheduler().then(() => {
      this.items = this.purgeItems(this.items);
      this.formController.$setPristine();
    });
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
    options: '='
  };

  controller = WeeklySchedulerController.$name;
  controllerAs = WeeklySchedulerController.$controllerAs;

  require = {
    formController: 'form'
  };

  transclude = true;

  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
}

angular.module('br.weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
