/** @internal */
class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    '$scope',
    '$timeout'
  ];

  private multisliderCtrl: MultiSliderController;
  private ngModelCtrl: angular.INgModelController;
  private schedulerCtrl: WeeklySchedulerController;

  private config: IWeeklySchedulerConfig;

  private item: IWeeklySchedulerItem<any>;
  private itemIndex: number;

  private resizeDirectionIsStart: boolean = true;

  private schedule: IWeeklySchedulerRange<any>;
  private scheduleIndex: number;

  private valuesOnDragStart: IWeeklySchedulerRange<any>;

  constructor(
    private $scope: angular.IScope,
    private $timeout: angular.ITimeoutService
  ) {
  }

  $onInit() {
    this.valuesOnDragStart = this.getDragStartValues();

    this.mergeOverlaps();
  }

  private adjustEndForModel(end: number) {
    if (end === this.config.maxValue) {
      end = 0;
    }

    return end;
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

  public canEdit() {
    let isEditable = !angular.isDefined(this.item.editable) || this.item.editable;
    let hasEditFunction = angular.isFunction(this.schedulerCtrl.config.editSlot);
    let isNotActive = !this.schedule.$isActive;
    let isNotDragging = !this.multisliderCtrl.isDragging;

    return isEditable && hasEditFunction && isNotActive && isNotDragging;
  }

  public canRemove() {
    let isRemovable = !angular.isDefined(this.item.editable) || this.item.editable;

    return isRemovable;
  }

  public deleteSelf() {
    this.multisliderCtrl.isDragging = false;
    this.multisliderCtrl.isHoveringSlot = false;

    this.removeSchedule(this.schedule);
    this.schedulerCtrl.onDelete();
  }

  public editSelf() {
    if (this.canEdit()) {
        this.schedulerCtrl.config.editSlot(this.schedule);
      }
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
        let currentStart = schedule.start;
        let currentEnd = this.adjustEndForView(schedule.end);
        let currentVal = schedule.value;

        let otherStart = el.start;
        let otherEnd = this.adjustEndForView(el.end);
        let otherVal = el.value;

        let valuesMatch = currentVal === otherVal;

        let currentIsInsideOther = otherEnd >= currentEnd && otherStart <= currentStart;
        let currentCoversOther = currentEnd >= otherEnd && currentStart <= otherStart;
        let otherEndIsInsideCurrent = otherEnd >= currentStart && otherEnd <= currentEnd;
        let otherStartIsInsideCurrent = otherStart >= currentStart && otherStart <= currentEnd;

        if (currentIsInsideOther) {
          this.removeSchedule(el);

          this.updateSelf({
            start: el.start,
            end: el.end,
            value: el.value
          });
        }
        else if (currentCoversOther) {
          this.removeSchedule(el);
        }
        else if (otherEndIsInsideCurrent) {
          this.removeSchedule(el);

          this.updateSelf({
            start: el.start,
            end: schedule.end,
            value: el.value
          });
        }
        else if (otherStartIsInsideCurrent) {
          this.removeSchedule(el);

          this.updateSelf({
            start: schedule.start,
            end: el.end,
            value: el.value
          });
        }
      }
    });
  }

  public removeSchedule(schedule: IWeeklySchedulerRange<any>) {
    let schedules = this.item.schedules;

    schedules.splice(schedules.indexOf(schedule), 1);
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
    this.schedule.start = update.start;
    this.schedule.end = this.adjustEndForModel(update.end);

    this.ngModelCtrl.$setViewValue(this.schedule);

    this.onChange();
  }

  private onChange() {
    this.schedulerCtrl.onChange({
      itemIndex: this.itemIndex,
      scheduleIndex: this.scheduleIndex,
      scheduleValue: this.schedule
    });
  }
}

/** @internal */
class WeeklySlotComponent implements angular.IComponentOptions {
  static $name = 'weeklySlot';
  
  bindings = {
    config: '<',
    schedule: '=ngModel',
    itemIndex: '<',
    scheduleIndex: '<',
    item: '='
  };

  controller = WeeklySlotController.$name;
  controllerAs = WeeklySlotController.$controllerAs;

  require = {
    multisliderCtrl: '^multiSlider',
    schedulerCtrl: '^weeklyScheduler',
    ngModelCtrl: 'ngModel'
  };

  templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
}

angular
  .module('weeklyScheduler')
  .controller(WeeklySlotController.$name, WeeklySlotController)
  .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
