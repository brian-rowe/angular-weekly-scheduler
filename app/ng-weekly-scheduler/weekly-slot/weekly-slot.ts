class WeeklySlotController implements angular.IComponentController {
  static $name = 'weeklySlotController';
  static $controllerAs = 'weeklySlotCtrl';

  static $inject = [
    '$element',
    '$scope'
  ];

  private ngModelCtrl: angular.INgModelController;
  private schedulerCtrl: WeeklySchedulerController;

  private $containerEl: angular.IAugmentedJQuery;
  private config: IWeeklySchedulerConfig;

  private item: IWeeklySchedulerItem<number>;
  private itemIndex: number;

  private resizeDirectionIsStart: boolean = true;

  private schedule: IWeeklySchedulerRange<number>;
  private scheduleIndex: number;

  private valuesOnDragStart: IWeeklySchedulerRange<number>;

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope
  ) {
    this.$containerEl = this.$element.parent();
  }

  $onInit() {
    this.valuesOnDragStart = {
      start: this.schedule.start,
      end: this.schedule.end
    };

    this.mergeOverlaps();

    this.ngModelCtrl.$parsers.push((ui) => {
      this.ngModelCtrl.$modelValue.start = ui.start;
      this.ngModelCtrl.$modelValue.end = ui.end;

      return this.ngModelCtrl.$modelValue;
    });

    this.$scope.$on(WeeklySchedulerEvents.LOCALE_CHANGED, () => {
      // Simple change object reference so that ngModel triggers formatting & rendering
      this.schedule = angular.copy(this.schedule);
    });
  }

  public canRemove() {
    return !angular.isDefined(this.item.editable) || this.item.editable;
  }

  public deleteSelf() {
    this.$containerEl.removeClass('dragging');
    this.$containerEl.removeClass('slot-hover');
    this.removeSchedule(this.schedule);
  }

  public drag(pixel: number) {
    let ui = this.schedule;
    let delta = this.pixelToVal(pixel);
    let duration = this.valuesOnDragStart.end - this.valuesOnDragStart.start;

    let newStart = Math.round(this.valuesOnDragStart.start + delta);
    let newEnd = Math.round(newStart + duration);

    if (ui.start !== newStart && newStart >= 0 && newEnd <= this.config.maxValue) {
      this.updateSelf({
        start: newStart,
        end: newEnd
      });
    }
  }

  public endDrag() {
    // this prevents user from accidentally
    // adding new slot after resizing or dragging
    setTimeout(() => {
      this.$containerEl.removeAttr('no-add');
    }, 500);

    this.$element.removeClass('active');
    this.$containerEl.removeClass('dragging');

    this.mergeOverlaps();
  }

  public mergeOverlaps() {
    let schedule = this.schedule;
    let schedules = this.item.schedules;

    schedules.forEach((el) => {
      if (el !== schedule) {
        // model is inside another slot
        if (el.end >= schedule.end && el.start <= schedule.start) {
          this.removeSchedule(el);

          this.updateSelf({
            start: el.start,
            end: el.end
          });
        }
        // model completely covers another slot
        else if (schedule.end >= el.end && schedule.start <= el.start) {
          this.removeSchedule(el);
        }
        // another slot's end is inside current model
        else if (el.end >= schedule.start && el.end <= schedule.end) {
          this.removeSchedule(el);

          this.updateSelf({
            start: el.start,
            end: schedule.end
          });
        }
        // another slot's start is inside current model
        else if (el.start >= schedule.start && el.start <= schedule.end) {
          this.removeSchedule(el);

          this.updateSelf({
            start: schedule.start,
            end: el.end
          });
        }
      }
    });
  }

  public pixelToVal(pixel: number) {
    let percent = pixel / this.$containerEl[0].clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }

  public removeSchedule(schedule: IWeeklySchedulerRange<number>) {
    let schedules = this.item.schedules;

    schedules.splice(schedules.indexOf(schedule), 1);
  }

  public resize(pixel: number) {
    let ui = this.schedule;
    let delta = this.pixelToVal(pixel);

    if (this.resizeDirectionIsStart) {
      let newStart = Math.round(this.valuesOnDragStart.start + delta);

      if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
        this.updateSelf({
          start: newStart,
          end: ui.end
        });
      }
    } else {
      let newEnd = Math.round(this.valuesOnDragStart.end + delta);

      if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= this.config.maxValue) {
        this.updateSelf({
          start: ui.start,
          end: newEnd
        });
      }
    }
  }

  public startDrag() {
    this.$element.addClass('active');

    this.$containerEl.addClass('dragging');
    this.$containerEl.attr('no-add', 'true');

    this.valuesOnDragStart = {
      start: this.schedule.start,
      end: this.schedule.end
    };
  }

  public startResizeStart() {
    this.resizeDirectionIsStart = true;
    this.startDrag();
  }

  public startResizeEnd() {
    this.resizeDirectionIsStart = false;
    this.startDrag();
  }

  public updateSelf(update: IWeeklySchedulerRange<number>) {
    this.schedule.start = update.start;
    this.schedule.end = update.end;

    this.ngModelCtrl.$setViewValue(this.schedule);

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
    schedulerCtrl: '^weeklyScheduler',
    ngModelCtrl: 'ngModel'
  };

  templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';
}

angular
  .module('weeklyScheduler')
  .controller(WeeklySlotController.$name, WeeklySlotController)
  .component(WeeklySlotComponent.$name, new WeeklySlotComponent());
