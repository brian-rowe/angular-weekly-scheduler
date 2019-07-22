import * as angular from 'angular';
import { AdapterService } from '../adapter/AdapterService';
import { ConfigurationService } from '../configuration/ConfigurationService';
import { ConflictingOptionsService } from '../conflicting-options/ConflictingOptionsService';
import { LastGhostDayService } from '../last-ghost-day/LastGhostDayService';
import { MissingDaysService } from '../missing-days/MissingDaysService';
import { IWeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import template from 'html-loader!./weekly-scheduler.html';

/** @internal */
export class WeeklySchedulerController implements angular.IController {
  static $controllerAs = 'schedulerCtrl';
  static $name = 'brWeeklySchedulerController';

  static $inject = [
    '$element',
    '$scope',
    '$timeout',
    'brWeeklySchedulerAdapterService',
    'brWeeklySchedulerConfigurationService',
    'brWeeklySchedulerConflictingOptionsService',
    'brWeeklySchedulerLastGhostDayService',
    'brWeeklySchedulerMissingDaysService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private adapterService: AdapterService,
    private configurationService: ConfigurationService,
    private conflictingOptionsService: ConflictingOptionsService,
    private lastGhostDayService: LastGhostDayService,
    private missingDaysService: MissingDaysService,
  ) {
  }

  private _originalItems: WeeklySchedulerItem<any>[];

  private adapter: IWeeklySchedulerAdapter<any, any>;

  public invalidMessage: string = '';

  private dragSchedule: WeeklySchedulerRange<any>;

  private ghostValues: { left: number, right: number };

  /** this is required to be part of a form for dirty/valid checks */
  public formController: angular.IFormController;

  public hoverClass: string;

  public config: IWeeklySchedulerConfig<any>;
  public items: WeeklySchedulerItem<any>[];
  public options: IWeeklySchedulerOptions<any>;

  $onInit() {
    this.config = this.configurationService.getConfiguration(this.options);
    this.buildItemsFromAdapter();
    this.watchAdapter();
    this.watchHoverClass();
  }

  $postLink() {
    this.$scope.$on(WeeklySchedulerEvents.SLOT_DRAGGED, (event: angular.IAngularEvent, schedule: WeeklySchedulerRange<any>) => {
      this.dragSchedule = schedule;
    });

    this.$scope.$on(WeeklySchedulerEvents.DRAG_ENDED, () => {
      this.dragSchedule = null;
    });

    this.$scope.$on(WeeklySchedulerEvents.GHOST_DRAG_ENDED, (event: angular.IAngularEvent, ghostSchedule: WeeklySchedulerRange<any>) => {
      this.$scope.$broadcast(WeeklySchedulerEvents.COMMIT_GHOST, ghostSchedule);
    });

    this.$scope.$on(WeeklySchedulerEvents.REMOVE_LAST_GHOST, () => {
      let lastGhostDay = this.lastGhostDayService.getLastGhostDay(this.items);

      this.$scope.$broadcast(WeeklySchedulerEvents.REMOVE_GHOST, lastGhostDay);
    });

    this.$scope.$on(WeeklySchedulerEvents.CANCEL_GHOST, () => {
      this.$scope.$broadcast(WeeklySchedulerEvents.REMOVE_ALL_GHOSTS);
    });

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

    this.items = this.purgeItems(this.items);

    this.items.forEach(item => item.mergeOverlaps());

    // keep a reference on the adapter so we can pull it out later
    this.adapter.items = this.items;

    // keep a copy of the items in case we need to rollback
    this._originalItems = angular.copy(this.items);
  }

  private buildItemsFromAdapter() {
    let items = this.adapterService.getItemsFromAdapter(this.config, this.adapter);

    return this.buildItems(items);
  }

  private purgeItems(items: WeeklySchedulerItem<any>[]) {
    if (this.config.fillEmptyWithDefault) {
      for (let item of items) {
        item.purgeDefaultSchedules();

        if(this.config.nullEnds) {
          item.forceNullEnds();
        }
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

  private setGhostValues(ghostValues: { left: number, right: number }) {
    this.ghostValues = ghostValues;
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
export class WeeklySchedulerComponent implements angular.IComponentOptions {
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

  template = template;
}