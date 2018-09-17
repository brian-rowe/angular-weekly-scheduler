/** @internal */
class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerNullEndWidth'
  ];

  private multisliderCtrl: MultiSliderController;

  private config: IWeeklySchedulerConfig<any>;
  private ngModelCtrl: angular.INgModelController;

  private editSchedule: (options: { schedule: br.weeklyScheduler.IWeeklySchedulerRange<any> }) => void;
  private updateSchedule: (options: { schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, update: br.weeklyScheduler.IWeeklySchedulerRange<any>}) => void;

  private resizeDirectionIsStart: boolean = true;

  private schedule: WeeklySchedulerRange<any>;

  private valuesOnDragStart: br.weeklyScheduler.IWeeklySchedulerRange<any>;

  constructor(
    private endAdjusterService: EndAdjusterService,
    private nullEndWidth: number
  ) {
  }

  $onInit() {
    this.valuesOnDragStart = this.getDragStartValues();
  }

  private getDragStartValues() {
    return {
      day: this.schedule.day,
      start: this.schedule.start,
      end: this.config.nullEnds ?
           this.endAdjusterService.adjustEndForView(this.config, this.schedule.start + this.nullEndWidth) :
           this.endAdjusterService.adjustEndForView(this.config, this.schedule.end),
      value: this.schedule.value
    }
  }

  private setSlotActive() {
    this.schedule.$isActive = true;
    this.multisliderCtrl.canAdd = false;
  }

  private setSlotInactive() {
    this.schedule.$isActive = false;
    this.multisliderCtrl.canAdd = true;
  }

  public editSelf() {
    this.editSchedule({ schedule: this.schedule });
  }

  public drag(pixel: number) {
    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);
    let duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;

    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let newEnd = this.config.nullEnds ? null : Math.round(newStart + duration);

    if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
      this.updateSelf({
        day: ui.day,
        start: newStart,
        end: newEnd,
        value: ui.value
      });
    }
  }

  public endDrag() {
    // Did the user actually move or resize the slot??
    var changed: boolean = !angular.equals(this.valuesOnDragStart, this.getDragStartValues());

    this.setSlotInactive();

    if (changed) {
      this.ngModelCtrl.$setDirty();
      this.multisliderCtrl.merge(this.schedule);
    } else {
      this.editSelf();
    }
  }

  public resize(pixel: number) {
    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);

    if (this.resizeDirectionIsStart) {
      this.resizeStart(ui, delta);
    } else {
      this.resizeEnd(ui, delta);
    }
  }

  public resizeStart(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, delta: number) {
    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let startChanged = schedule.start !== newStart;
    let newStartBeforeOrAtEnd = newStart <= this.endAdjusterService.adjustEndForView(this.config, schedule.end) - 1;
    let newStartAfterOrAtStart = newStart >= 0;

    if (startChanged && newStartBeforeOrAtEnd && newStartAfterOrAtStart) {
      this.updateSelf({
        day: schedule.day,
        start: newStart,
        end: schedule.end,
        value: schedule.value
      });
    } 
  }

  public resizeEnd(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, delta: number) {
    let newEnd = Math.round(this.valuesOnDragStart.end + delta);
    let endChanged = schedule.end !== newEnd;
    let newEndBeforeOrAtEnd = newEnd <= this.config.maxValue;
    let newEndAfterOrAtStart = newEnd >= schedule.start + 1;

    if (endChanged && newEndAfterOrAtStart && newEndBeforeOrAtEnd) {
      this.updateSelf({
        day: schedule.day,
        start: schedule.start,
        end: newEnd,
        value: schedule.value
      });
    }
  }

  public startDrag() {
    this.setSlotActive();
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

  public updateSelf(update: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.updateSchedule({ schedule: this.schedule, update: update });
  }
}

/** @internal */
class WeeklySlotComponent implements angular.IComponentOptions {
  static $name = 'brWeeklySlot';
  
  bindings = {
    config: '<',
    schedule: '=ngModel',
    editSchedule: '&',
    updateSchedule: '&'
  };

  controller = WeeklySlotController.$name;
  controllerAs = WeeklySlotController.$controllerAs;

  require = {
    multisliderCtrl: '^brMultiSlider',
    ngModelCtrl: 'ngModel'
  };

  templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
}

angular
  .module('br.weeklyScheduler')
  .controller(WeeklySlotController.$name, WeeklySlotController)
  .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
