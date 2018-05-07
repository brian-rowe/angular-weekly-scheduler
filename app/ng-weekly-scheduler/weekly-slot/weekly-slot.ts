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

  constructor(
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService,
    private overlapService: OverlapService
  ) {
  }

  $onInit() {
    this.valuesOnDragStart = this.getDragStartValues();

    // This is for editing the schedules via custom controls by the client
    this.$scope.$watch(() => this.schedule, (newSchedule, oldSchedule) => {
      this.multisliderCtrl.mergeOverlaps(newSchedule);
    });
  }

  private getDragStartValues() {
    return {
      start: this.schedule.start,
      end: this.multisliderCtrl.adjustEndForView(this.schedule.end),
      value: this.schedule.value
    }
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

    this.multisliderCtrl.mergeOverlaps(this.schedule);
    this.item.schedules.forEach(s => this.multisliderCtrl.mergeOverlaps(s));
  }

  public resize(pixel: number) {
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
