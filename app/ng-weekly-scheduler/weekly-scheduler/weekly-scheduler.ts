/** @internal */
class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'brWeeklySchedulerController';

  static $inject = [
    '$element',
    '$scope',
    '$timeout',
    'brWeeklySchedulerAdapterService',
    'brWeeklySchedulerConfigurationService',
    'brWeeklySchedulerConflictingOptionsService',
    'brWeeklySchedulerFillEmptyWithDefaultService',
    'brWeeklySchedulerGroupService',
    'brWeeklySchedulerDayMap',
    'brWeeklySchedulerItemFactory',
    'brWeeklySchedulerPurgeDefaultService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private adapterService: AdapterService,
    private configurationService: ConfigurationService,
    private conflictingOptionsService: ConflictingOptionsService,
    private fillEmptyWithDefaultService: FillEmptyWithDefaultService,
    private groupService: GroupService,
    private dayMap: { [key: number]: string },
    private itemFactory: WeeklySchedulerItemFactory,
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

  $onInit() {
    this.config = this.configurationService.getConfiguration(this.options);
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

  public getInvalidMessage() {
    let conflictingOptions = this.conflictingOptionsService.getConflictingOptions(this.options);

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
    return this.buildItems(this.adapterService.getItemsFromAdapter(this.config, this.adapter));
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
        result.push(this.itemFactory.createItem(this.config, key, []));
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
