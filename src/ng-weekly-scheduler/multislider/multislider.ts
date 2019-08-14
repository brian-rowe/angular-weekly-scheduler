import * as angular from 'angular';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { NullEndWidth } from '../weekly-scheduler-config/NullEndWidth';
import { SlotStyleFactory } from '../slot-style/SlotStyleFactory';
import { PixelToValService } from '../pixel-to-val/PixelToValService';
import { MousePositionService } from '../mouse-position/MousePositionService';
import { IRange } from '../range/IRange';
import { TouchService } from '../touch/TouchService';

/** @internal */
export class MultiSliderController implements angular.IComponentController {
  static $name = 'rrMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    MousePositionService.$name,
    MouseTrackerService.$name,
    NullEndWidth.$name,
    PixelToValService.$name,
    SlotStyleFactory.$name,
    TouchService.$name,
    WeeklySchedulerRangeFactory.$name,
    ValueNormalizationService.$name
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private mousePositionService: MousePositionService,
    private mouseTrackerService: MouseTrackerService,
    private nullEndWidth: number,
    private pixelToValService: PixelToValService,
    private slotStyleFactory: SlotStyleFactory,
    private touchService: TouchService,
    private rangeFactory: WeeklySchedulerRangeFactory,
    private valueNormalizationService: ValueNormalizationService
  ) {
    this.element = this.$element[0];
  }

  private dragSchedule: WeeklySchedulerRange<any>;
  private pendingSchedule: WeeklySchedulerRange<any>;

  private startingGhostValues: IRange;
  private readonly ghostValues: IRange;
  private setGhostValues: (options: { ghostValues: IRange }) => void;

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

  private getScheduleForAdd(range: IRange) {
    let start = this.valueNormalizationService.normalizeValue(range.start, 0, range.end);
    let end = this.valueNormalizationService.normalizeValue(range.end, start, this.config.maxValue);

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

  private getGhostSlotStyle() {
    return this.getSlotStyle(this.ghostValues);
  }

  private getSlotStyle(schedule: IRange) {
    if (!schedule.start && !schedule.end) {
      return {};
    }

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
    let mouseValue: number = this.getValAtMousePosition();

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
  public positionGhost(event: Event = null) {
    let val = this.getValAtMousePosition(event);

    this.startingGhostValues = {
      start: val,
      end: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
    };

    this.setGhostValues({
      ghostValues: angular.copy(this.startingGhostValues)
    });
  }

  public onGhostWrapperMouseDown(event: Event) {
    if (!this.item.editable) {
      return;
    }

    this.item.$isGhostOrigin = true;
    this.createGhost(event);
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
    let ghostSchedule = this.getScheduleForAdd(this.ghostValues);

    this.openEditorForAdd(ghostSchedule).then(editedGhostSchedule => {
      this.$scope.$emit(WeeklySchedulerEvents.GHOST_DRAG_ENDED, editedGhostSchedule);
    }).catch(() => {
      this.$scope.$emit(WeeklySchedulerEvents.CANCEL_GHOST);
    });
  }

  private createGhost(event: Event = null) {
    this.item.$renderGhost = true;
    this.positionGhost(event);
  }

  private commitGhost(ghostSchedule: WeeklySchedulerRange<any>) {
    if (this.item.canAddSchedule()) {
      this.item.addScheduleAndMerge(ghostSchedule);
      this.ngModelCtrl.$setDirty();
      this.config.onChange();
    }

    this.removeGhost();
  }

  private getValAtMousePosition(event = null) {
    let point;

    if (event) {
      if (event.pageX && event.pageY) {
        point = { x: event.pageX, y: event.pageY }
      } else {
        point = this.touchService.getPoint(event);
      }
    } else {
      point = this.mouseTrackerService.getMousePosition();
    }

    let mousePosition = this.mousePositionService.getMousePosition(this.config, this.$element, point);

    return this.pixelToVal(mousePosition); 
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
    return this.pixelToValService.pixelToVal(this.config, this.element, pixel);
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
  static $name = 'rrMultiSlider';

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
