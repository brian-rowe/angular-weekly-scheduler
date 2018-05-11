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

  private config: IWeeklySchedulerConfig<any>;
  private item: IWeeklySchedulerItem<any>;

  private editSchedule: (options: { schedule: IWeeklySchedulerRange<any> }) => void;
  private updateSchedule: (options: { schedule: IWeeklySchedulerRange<any>, update: IWeeklySchedulerRange<any>}) => void;
  private removeSchedule: (options: { schedule: IWeeklySchedulerRange<any> }) => void;

  private resizeDirectionIsStart: boolean = true;

  private schedule: IWeeklySchedulerRange<any>;

  private startDragTimeout: angular.IPromise<void>;
  private valuesOnDragStart: IWeeklySchedulerRange<any>;

  constructor(
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private overlapService: OverlapService
  ) {
  }

  $onInit() {
    this.valuesOnDragStart = this.getDragStartValues();
  }

  /**
   * We want to cancel the drag operation if the user is just clicking on the item or has started dragging without waiting for the drag to "activate"
   * However, we should give them a small tolerance before considering them to have started dragging early, as it is very easy to accidentally move a few pixels.
   */
  private cancelDragIfThresholdExceeded(pixel: number) {
    if (pixel > 3) {
      this.cancelDrag();
    }
  }

  private cancelDrag() {
    this.$timeout.cancel(this.startDragTimeout);
  }

  private getDragStartValues() {
    return {
      start: this.schedule.start,
      end: this.multisliderCtrl.adjustEndForView(this.schedule.end),
      value: this.schedule.value
    }
  }

  public deleteSelf() {
    this.removeSchedule({ schedule: this.schedule });
  }

  public editSelf() {
    this.editSchedule({ schedule: this.schedule });
  }

  public drag(pixel: number) {
    if (!this.schedule.$isActive) {
      this.cancelDragIfThresholdExceeded(pixel);
      return;
    }

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
    this.cancelDrag();

    if (!this.schedule.$isActive) {
      return;
    }

    this.$timeout(() => {
      // this prevents user from accidentally
      // adding new slot after resizing or dragging
      this.multisliderCtrl.canAdd = true;

      // this prevents ng-click from accidentally firing after resizing or dragging
      this.schedule.$isActive = false;
      this.multisliderCtrl.isDragging = false;
    }, 200).then(() => {
      this.multisliderCtrl.merge(this.schedule);
    });
  }

  public resize(pixel: number) {
    if (!this.schedule.$isActive) {
      this.cancelDragIfThresholdExceeded(pixel);
      return;
    }

    this.multisliderCtrl.isDragging = true;
    
    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);

    if (this.resizeDirectionIsStart) {
      this.resizeStart(ui, delta);
    } else {
      this.resizeEnd(ui, delta);
    }
  }

  public resizeStart(schedule: IWeeklySchedulerRange<any>, delta: number) {
    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let startChanged = schedule.start !== newStart;
    let newStartBeforeOrAtEnd = newStart <= this.multisliderCtrl.adjustEndForView(schedule.end) - 1;
    let newStartAfterOrAtStart = newStart >= 0;

    if (startChanged && newStartBeforeOrAtEnd && newStartAfterOrAtStart) {
      this.updateSelf({
        start: newStart,
        end: schedule.end,
        value: schedule.value
      });
    } 
  }

  public resizeEnd(schedule: IWeeklySchedulerRange<any>, delta: number) {
    let newEnd = Math.round(this.valuesOnDragStart.end + delta);
    let endChanged = schedule.end !== newEnd;
    let newEndBeforeOrAtEnd = newEnd <= this.config.maxValue;
    let newEndAfterOrAtStart = newEnd >= schedule.start + 1;

    if (endChanged && newEndAfterOrAtStart && newEndBeforeOrAtEnd) {
      this.updateSelf({
        start: schedule.start,
        end: newEnd,
        value: schedule.value
      });
    }
  }

  public startDrag() {
    this.startDragTimeout = this.$timeout(() => {
      this.schedule.$isActive = true;
      this.multisliderCtrl.canAdd = false;
    }, 500);

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
