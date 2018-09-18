/** @internal */
class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerNullEndWidth',
    'brWeeklySchedulerRangeFactory'
  ];

  private multisliderCtrl: MultiSliderController;

  private config: IWeeklySchedulerConfig<any>;
  private item: WeeklySchedulerItem<any>;
  private ngModelCtrl: angular.INgModelController;

  private editSchedule: (options: { schedule: br.weeklyScheduler.IWeeklySchedulerRange<any> }) => void;

  private schedule: WeeklySchedulerRange<any>;

  private valuesOnDragStart: WeeklySchedulerRange<any>;

  constructor(
    private endAdjusterService: EndAdjusterService,
    private nullEndWidth: number,
    private rangeFactory: WeeklySchedulerRangeFactory
  ) {
  }

  private getDragStartValues() {
    return this.rangeFactory.createRange(this.config, {
      day: this.schedule.day,
      start: this.schedule.start,
      end: this.config.nullEnds ?
           this.endAdjusterService.adjustEndForView(this.config, this.schedule.start + this.nullEndWidth) :
           this.endAdjusterService.adjustEndForView(this.config, this.schedule.end),
      value: this.schedule.value
    });
  }

  public editSelf() {
    this.editSchedule({ schedule: this.schedule });
  }

  public drag(pixel: number) {
    let ui = this.schedule;
    let delta = this.multisliderCtrl.pixelToVal(pixel);

    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let newEnd = this.config.nullEnds ? null : Math.round(newStart + this.valuesOnDragStart.duration);

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
    var changed: boolean = !this.valuesOnDragStart.equals(this.getDragStartValues());

    this.schedule.$isActive = false;

    if (changed) {
      this.ngModelCtrl.$setDirty();
      this.multisliderCtrl.merge(this.schedule);
    } else {
      this.editSelf();
    }
  }

  public resizeStart(pixel: number) {
    let delta = this.multisliderCtrl.pixelToVal(pixel);
    let schedule = this.schedule;
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

  public resizeEnd(pixel: number) {
    let delta = this.multisliderCtrl.pixelToVal(pixel);
    let schedule = this.schedule;
    let newEnd = Math.round(this.valuesOnDragStart.end + delta);

    if (schedule.canUpdateEnd(newEnd)) {
      this.updateSelf({
        day: schedule.day,
        start: schedule.start,
        end: newEnd,
        value: schedule.value
      });
    }
  }

  public startDrag() {
    this.schedule.$isActive = true;
    this.valuesOnDragStart = this.getDragStartValues();
  }

  public updateSelf(update: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.item.updateSchedule(this.schedule, update);
  }
}

/** @internal */
class WeeklySlotComponent implements angular.IComponentOptions {
  static $name = 'brWeeklySlot';
  
  bindings = {
    config: '<',
    item: '<',
    schedule: '=ngModel',
    editSchedule: '&'
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
