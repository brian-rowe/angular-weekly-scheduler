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
    'brWeeklySchedulerMissingDaysService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private adapterService: AdapterService,
    private configurationService: ConfigurationService,
    private conflictingOptionsService: ConflictingOptionsService,
    private missingDaysService: MissingDaysService,
  ) {
  }

  private _originalItems: WeeklySchedulerItem<any>[];

  private adapter: br.weeklyScheduler.IWeeklySchedulerAdapter<any, any>;

  public invalidMessage: string = '';

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
    this.items = this.missingDaysService.fillItems(this.config, items);

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

  private purgeItems(items: WeeklySchedulerItem<any>[]) {
    if (this.config.fillEmptyWithDefault) {
      for (let item of items) {
        item.purgeDefaultSchedules();
      }
    }

    return items;
  }

  private prepareItems(items: WeeklySchedulerItem<any>[]) {
    if (this.config.fillEmptyWithDefault) {
      for (let item of items) {
        item.fillEmptySlotsWithDefaultSchedules();
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

  templateUrl = 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html';
}

angular.module('br.weeklyScheduler')
  .controller(WeeklySchedulerController.$name, WeeklySchedulerController)
  .component(WeeklySchedulerComponent.$name, new WeeklySchedulerComponent());
