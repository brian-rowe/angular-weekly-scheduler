/** @internal */
class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    '$scope',
    '$timeout',
    'overlapService'
  ];

  private multisliderCtrl: MultiSliderController;

  private config: IWeeklySchedulerConfig;

  private item: IWeeklySchedulerItem<any>;

  private editSchedule: (options: { schedule: IWeeklySchedulerRange<any> }) => void;
  private updateSchedule: (options: { schedule: IWeeklySchedulerRange<any>, update: IWeeklySchedulerRange<any>}) => void;
  private removeSchedule: (options: { schedule: IWeeklySchedulerRange<any> }) => void;

  private resizeDirectionIsStart: boolean = true;

  private schedule: IWeeklySchedulerRange<any>;

  private valuesOnDragStart: IWeeklySchedulerRange<any>;

  private overlapHandlers: { [key: number]: (current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>) => void; } = {
    [OverlapState.NoOverlap]: () => {},
    [OverlapState.CurrentIsInsideOther]: (current, other) => this.handleCurrentIsInsideOther(current, other),
    [OverlapState.CurrentCoversOther]: (current, other) => this.handleCurrentCoversOther(current, other),
    [OverlapState.OtherEndIsInsideCurrent]: (current, other) => this.handleOtherEndIsInsideCurrent(current, other),
    [OverlapState.OtherStartIsInsideCurrent]: (current, other) => this.handleOtherStartIsInsideCurrent(current, other)
  };

  constructor(
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private overlapService: OverlapService
  ) {
  }

  $onInit() {
    this.valuesOnDragStart = this.getDragStartValues();

    this.mergeOverlaps();
  }

  private adjustEndForView(end: number) {
    if (end === 0) {
      end = this.config.maxValue;
    }

    return end;
  }

  private getDragStartValues() {
    return {
      start: this.schedule.start,
      end: this.adjustEndForView(this.schedule.end),
      value: this.schedule.value
    }
  }

  private getOverlapState(current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): OverlapState {
    let overlapState = this.overlapService.getOverlapState(current.start, this.adjustEndForView(current.end), other.start, this.adjustEndForView(other.end));

    return overlapState;
  }

  private handleCurrentCoversOther(current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): void {
    this.removeSchedule({ schedule: other });
  }

  private handleCurrentIsInsideOther(current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): void {
    this.removeSchedule({ schedule: other });

    this.updateSelf({
      start: other.start,
      end: other.end,
      value: other.value
    });
  }

  private handleOtherEndIsInsideCurrent(current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): void {
    this.removeSchedule({ schedule: other });

    this.updateSelf({
      start: other.start,
      end: current.end,
      value: other.value
    });
  }

  private handleOtherStartIsInsideCurrent(current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): void {
    this.removeSchedule({ schedule: other });

    this.updateSelf({
      start: current.start,
      end: other.end,
      value: other.value
    });
  }

  public canRemove() {
    let isRemovable = !angular.isDefined(this.item.editable) || this.item.editable;

    return isRemovable;
  }

  public deleteSelf() {
    this.removeSchedule({ schedule: this.schedule });
  }

  public editSelf() {
    this.editSchedule({ schedule: this.schedule });
  }

  public drag(pixel: number) {
    this.multisliderCtrl.isDragging = true;

    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);
    let duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;

    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let newEnd = Math.round(newStart + duration);

    if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
      this.updateSelf({
        start: newStart,
        end: newEnd,
        value: ui.value
      });
    }
  }

  public endDrag() {
    
    this.$scope.$apply(() => {
      // this prevents user from accidentally
      // adding new slot after resizing or dragging
      this.multisliderCtrl.canAdd = true;
      this.schedule.$isActive = false;
    });
    
    /**
     * When ending a drag there needs to be a small delay before setting isDragging back to false.
     * This is so that the ng-click event will not fire
     */
    this.$timeout(() => {
      this.multisliderCtrl.isDragging = false;
    }, 200);

    this.mergeOverlaps();
  }

  public mergeOverlaps() {
    let schedule = this.schedule;
    let schedules = this.item.schedules;

    schedules.forEach((el) => {
      if (el !== schedule) {
        let overlapState = this.getOverlapState(schedule, el);
        let overlapHandler = this.overlapHandlers[overlapState];

        overlapHandler(schedule, el);
      }
    });
  }

  public resize(pixel: number) {
    this.multisliderCtrl.isDragging = true;
    
    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);

    if (this.resizeDirectionIsStart) {
      let newStart = Math.round(this.valuesOnDragStart.start + delta);

      if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
        this.updateSelf({
          start: newStart,
          end: ui.end,
          value: ui.value
        });
      }
    } else {
      let newEnd = Math.round(this.valuesOnDragStart.end + delta);

      if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= this.config.maxValue) {
        this.updateSelf({
          start: ui.start,
          end: newEnd,
          value: ui.value
        });
      }
    }
  }

  public startDrag() {
    this.$scope.$apply(() => {
      this.schedule.$isActive = true;
      this.multisliderCtrl.canAdd = false;
    });

    this.valuesOnDragStart = this.getDragStartValues();
  }

  public startResizeStart() {
    this.resizeDirectionIsStart = true;
    this.startDrag();
  }

  public startResizeEnd() {
    this.resizeDirectionIsStart = false;
    this.startDrag();
  }

  public updateSelf(update: IWeeklySchedulerRange<any>) {
    this.updateSchedule({ schedule: this.schedule, update: update });
  }
}

/** @internal */
class WeeklySlotComponent implements angular.IComponentOptions {
  static $name = 'weeklySlot';
  
  bindings = {
    config: '<',
    schedule: '=ngModel',
    editSchedule: '&',
    removeSchedule: '&',
    updateSchedule: '&',
    item: '='
  };

  controller = WeeklySlotController.$name;
  controllerAs = WeeklySlotController.$controllerAs;

  require = {
    multisliderCtrl: '^multiSlider'
  };

  templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
}

angular
  .module('weeklyScheduler')
  .controller(WeeklySlotController.$name, WeeklySlotController)
  .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
