import * as angular from 'angular';
import { DragService } from '../drag/DragService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';

/** @internal */
export class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    '$element',
    '$rootScope',
    '$scope',
    'brWeeklySchedulerDragService'
  ];

  private config: IWeeklySchedulerConfig<any>;
  private ngModelCtrl: angular.INgModelController;

  private editSchedule: (options: { schedule: IWeeklySchedulerRange<any> }) => void;
  private getDelta: (options: { pixel: number }) => number;

  private item: WeeklySchedulerItem<any>;
  private dragSchedule: WeeklySchedulerRange<any>;
  private schedule: WeeklySchedulerRange<any>;

  private valuesOnDragStart: WeeklySchedulerRange<any>;

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $rootScope: angular.IRootScopeService,
    private $scope: angular.IScope,
    private dragService: DragService,
  ) {
  }

  get hasDragSchedule() {
    return angular.isDefined(this.dragSchedule) && this.dragSchedule != null;
  }

  private getDragStartValues() {
    return this.dragService.getDragRangeFromSchedule(this.config, this.schedule);
  }

  public editSelf() {
    this.editSchedule({ schedule: this.schedule });
  }

  public drag(pixel: number) {
    let ui = this.schedule;
    let delta = this.getDelta({ pixel: pixel });

    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let newEnd = this.config.nullEnds ? null : Math.round(newStart + this.valuesOnDragStart.duration);

    this.schedule.update({
      day: ui.day,
      start: newStart,
      end: newEnd,
      value: ui.value
    });
  }

  public endDrag() {
    // If the schedule was moved to another item, the $scope hierarchy will have been broken, so we need to broadcast this to the whole app
    this.$rootScope.$broadcast(WeeklySchedulerEvents.DRAG_ENDED);
    
    // Was the schedule moved to another item??
    if (!this.item.hasSchedule(this.schedule)) {
      return;
    }

    // Did the user actually move or resize the slot??
    var changed: boolean = !this.valuesOnDragStart.equals(this.getDragStartValues());

    this.schedule.$isActive = false;

    if (changed) {
      this.ngModelCtrl.$setDirty();
      this.item.mergeSchedule(this.schedule);
    } else {
      this.editSelf();
    }
  }

  public endResize() {
    // Did the user actually move or resize the slot??
    var changed: boolean = !this.valuesOnDragStart.equals(this.getDragStartValues());

    this.schedule.$isActive = false;

    if (changed) {
      this.ngModelCtrl.$setDirty();
      this.item.mergeSchedule(this.schedule);
    } else {
      this.editSelf();
    }
  }

  public resizeStart(pixel: number) {
    let delta = this.getDelta({ pixel: pixel });
    let newStart = Math.round(this.valuesOnDragStart.start + delta);

    if (this.schedule.updateStart(newStart)) {
      this.config.onChange();
    }
  }

  public resizeEnd(pixel: number) {
    let delta = this.getDelta({ pixel: pixel });
    let newEnd = Math.round(this.valuesOnDragStart.end + delta);

    if (this.schedule.updateEnd(newEnd)) {
      this.config.onChange();
    }
  }

  public startDrag() {
    if (!this.item.canEditSchedule(this.schedule)){
      return;
    }

    this.$scope.$emit(WeeklySchedulerEvents.SLOT_DRAGGED, this.schedule);
    this.schedule.$isActive = true;
    this.valuesOnDragStart = this.getDragStartValues();
  }

  public startResize() {
    if (!this.item.canEditSchedule(this.schedule)) {
      return;
    }
    
    this.schedule.$isActive = true;
    this.valuesOnDragStart = this.getDragStartValues();
  }
}

/** @internal */
export class WeeklySlotComponent implements angular.IComponentOptions {
  static $name = 'brWeeklySlot';
  
  bindings = {
    config: '<',
    dragSchedule: '<',
    item: '<',
    schedule: '=ngModel',
    editSchedule: '&',
    getDelta: '&'
  };

  controller = WeeklySlotController.$name;
  controllerAs = WeeklySlotController.$controllerAs;

  require = {
    ngModelCtrl: 'ngModel'
  };

  template = require('./weekly-slot.html');
}
