import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { ElementOffsetService } from '../element-offset/ElementOffsetService';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { NullEndWidth } from '../weekly-scheduler-config/NullEndWidth';
import { SlotStyleFactory } from '../slot-style/SlotStyleFactory';

/** @internal */
export class MultiSliderController implements angular.IComponentController {
  static $name = 'brMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    ElementOffsetService.$name,
    MouseTrackerService.$name,
    NullEndWidth.$name,
    SlotStyleFactory.$name,
    WeeklySchedulerRangeFactory.$name,
    ValueNormalizationService.$name
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private elementOffsetService: ElementOffsetService,
    private mouseTrackerService: MouseTrackerService,
    private nullEndWidth: number,
    private slotStyleFactory: SlotStyleFactory,
    private rangeFactory: WeeklySchedulerRangeFactory,
    private valueNormalizationService: ValueNormalizationService
  ) {
    this.element = this.$element[0];
  }

  private dragSchedule: WeeklySchedulerRange<any>;
  private pendingSchedule: WeeklySchedulerRange<any>;

  private startingGhostValues: { start: number, end: number };
  private readonly ghostValues: { start: number, end: number };
  private setGhostValues: (options: { ghostValues: { start: number, end: number } }) => void;

  private ngModelCtrl: angular.INgModelController;
  
  public element: Element;
  public config: IWeeklySchedulerConfig<any>;

  private item: WeeklySchedulerItem<any>;

  public $postLink() {
    this.$element.on('mouseenter', () => {
      this.onMouseEnter();
    });

    this.$element.on('mouseleave', () => {
      this.onMouseLeave();
    });

    this.$element.on('mouseup', () => {
       this.onMouseUp();
    });

    this.$scope.$on(WeeklySchedulerEvents.COMMIT_GHOST, (event: angular.IAngularEvent, ghostSchedule: WeeklySchedulerRange<any>) => {
      if (this.item.$renderGhost) {
        this.commitGhost(ghostSchedule);
      }
    });

    this.$scope.$on(WeeklySchedulerEvents.REMOVE_GHOST, (event: angular.IAngularEvent, day: number) => {
      if (!this.item.$isGhostOrigin && this.item.day === day) {
        this.removeGhost();
      }
    });

    this.$scope.$on(WeeklySchedulerEvents.REMOVE_ALL_GHOSTS, () => {
      this.removeGhost();
    });
  }

  private onMouseEnter() {
    // If the cursor is moving BACK into an item that ALREADY has a ghost rendered, we'll want to remove the ghost from the item that was left
    if (this.item.$renderGhost) {
      this.$scope.$emit(WeeklySchedulerEvents.REMOVE_LAST_GHOST);
    }

    if (this.dragSchedule) {
      this.addDragSchedule();
    }

    if (this.ghostValues && !this.item.$renderGhost) {
      this.createGhost();
    }
  }

  private onMouseLeave() {
    if (this.dragSchedule) {
      this.removeDragSchedule();
    }
  }

  private onMouseUp() {
    if (this.pendingSchedule) {
      this.commitDragSchedule();
    }
  }

  private addDragSchedule() {
    this.dragSchedule.day = this.item.day;
    this.pendingSchedule = this.item.addSchedule(this.dragSchedule);
    this.pendingSchedule.$isActive = true;
  }

  private removeDragSchedule() {
    this.item.removeSchedule(this.dragSchedule);
    this.ngModelCtrl.$setDirty();
    this.pendingSchedule = null;
  }

  private commitDragSchedule() {
    this.pendingSchedule.$isActive = false;

    this.ngModelCtrl.$setDirty();
    this.item.mergeSchedule(this.pendingSchedule);
    this.pendingSchedule = null;
  }

  private getScheduleForAdd(start: number, end: number) {
    start = this.valueNormalizationService.normalizeValue(start, 0, end);
    end = this.valueNormalizationService.normalizeValue(end, start, this.config.maxValue);

    if (this.config.nullEnds) {
      end = null;
    }

    let schedule = {
      day: this.item.day,
      start: start,
      end: end,
      value: this.config.defaultValue
    };

    return schedule;
  }

  private getSlotStyle(schedule: IWeeklySchedulerRange<any>) {
    return this.slotStyleFactory.getSlotStyle(this.config, this.$element).getCss(schedule);
  }

  private openEditorForAdd(schedule: IWeeklySchedulerRange<any>): angular.IPromise<IWeeklySchedulerRange<any>> {
    if (this.item.canEdit()) {
      return this.config.editSlot(schedule);
    } else {
      return this.$q.when(schedule);
    }
  }

  /** Expand ghost while dragging in it */
  public adjustGhost() {
    let point = this.mouseTrackerService.getMousePosition();
    let mouseValue: number = this.getValAtMousePosition(point.x);

    let existingStartValue: number = this.startingGhostValues.start;

    let updatedStartValue;
    let updatedEndValue: number;
    
    if (mouseValue < existingStartValue) { // user is dragging towards start
      updatedStartValue = mouseValue;
      updatedEndValue = existingStartValue;
    } else { // user is dragging towards end
      updatedStartValue = existingStartValue;
      updatedEndValue = mouseValue;
    }

    let ghostValues = {
      start: this.normalizeGhostValue(updatedStartValue),
      end: this.normalizeGhostValue(updatedEndValue)
    };

    this.setGhostValues({ 
      ghostValues: ghostValues
    });
  }
  
  /** Move ghost around while not dragging */
  public positionGhost() {
    let point = this.mouseTrackerService.getMousePosition();
    let val = this.getValAtMousePosition(point.x);

    this.startingGhostValues = {
      start: val,
      end: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
    };

    this.setGhostValues({
      ghostValues: angular.copy(this.startingGhostValues)
    });
  }

  public onGhostWrapperMouseDown() {
    if (!this.item.editable) {
      return;
    }

    this.item.$isGhostOrigin = true;
    this.createGhost();
  }

  public onGhostWrapperMouseMove() {
    // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
    if (this.config.nullEnds) {
      this.positionGhost();
      return;
    }

    if (this.item.$renderGhost) {
      this.adjustGhost();
    }
  }

  public onGhostWrapperMouseUp() {
    let ghostSchedule = this.getScheduleForAdd(this.ghostValues.start, this.ghostValues.end);

    this.openEditorForAdd(ghostSchedule).then(editedGhostSchedule => {
      this.$scope.$emit(WeeklySchedulerEvents.GHOST_DRAG_ENDED, editedGhostSchedule);
    }).catch(() => {
      this.$scope.$emit(WeeklySchedulerEvents.CANCEL_GHOST);
    });
  }

  private createGhost() {
    this.item.$renderGhost = true;
    this.positionGhost();
  }

  private commitGhost(ghostSchedule: WeeklySchedulerRange<any>) {
    if (this.item.canAddSchedule()) {
      this.item.addScheduleAndMerge(ghostSchedule);
      this.ngModelCtrl.$setDirty();
      this.config.onChange();
    }

    this.removeGhost();
  }

  private getMousePosition(pageX: number) {
    let elementOffsetX = this.elementOffsetService.left(this.$element);
    let left = pageX - elementOffsetX;

    return left;
  }

  private getValAtMousePosition(pageX: number) {
    return this.pixelToVal(this.getMousePosition(pageX));
  }

  /**
   * Perform an external action to bring up an editor for a schedule
   */
  private editSchedule(schedule: WeeklySchedulerRange<any>) {
    if (this.item.canEdit()) {
      schedule.$isEditing = true;

      let originalSchedule = angular.copy(schedule);

      this.config.editSlot(schedule).then((newSchedule) => {
        let range = this.rangeFactory.createRange(this.config, newSchedule);

        if (this.shouldDelete(range)) {
          this.item.removeSchedule(schedule);
        } else {
          let premergeSchedule = angular.copy(range);

          this.item.mergeSchedule(range);

          // If merging mutated the schedule further, then updateSchedule would have already been called
          // This is so that edits that don't trigger merges still trigger onChange,
          // but edits that do trigger merges don't trigger it twice
          if (angular.equals(premergeSchedule, range)) {
            // The 'schedule' variable has already been updated with the correct values.
            // The range should be applied as an update to the originalSchedule so that onChange is triggered if necessary
            originalSchedule.update(range);
          }
        }

        this.ngModelCtrl.$setDirty();
      }).catch(() => {
        // do nothing except eat the unhandled rejection error
      }).finally(() => {
        schedule.$isEditing = false;
      });
    }
  }

  private shouldDelete(schedule: IWeeklySchedulerRange<any>) {
    if (schedule.$isDeleting) {
      return true;
    }

    if (this.config.fillEmptyWithDefault && schedule.value === this.config.defaultValue) {
      return true;
    }

    return false;
  }

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }

  private normalizeGhostValue(value: number) {
    return this.valueNormalizationService.normalizeValue(value, 0, this.config.maxValue);
  }

  private removeGhost() {
    this.item.$isGhostOrigin = false;
    this.item.$renderGhost = false;
    this.setGhostValues(null);
  }
}

/** @internal */
export class MultiSliderComponent implements angular.IComponentOptions {
  static $name = 'brMultiSlider';

  bindings = {
    config: '<',
    dragSchedule: '<',
    ghostValues: '<',
    item: '=ngModel',
    setGhostValues: '&'
  };

  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  require = {
    ngModelCtrl: 'ngModel'
  };

  template = require('./multislider.html');
}
