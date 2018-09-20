/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'brMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    'brWeeklySchedulerElementOffsetService',
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerNullEndWidth',
    'brWeeklySchedulerRangeFactory'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private elementOffsetService: ElementOffsetService,
    private endAdjusterService: EndAdjusterService,
    private nullEndWidth: number,
    private rangeFactory: WeeklySchedulerRangeFactory
  ) {
    this.element = this.$element[0];
  }

  private dragSchedule: WeeklySchedulerRange<any>;
  private pendingSchedule: WeeklySchedulerRange<any>;

  private startingGhostValues: { left: number, right: number };
  private ghostValues: { left: number, right: number };

  private ngModelCtrl: angular.INgModelController;
  
  public $hoverElement: angular.IAugmentedJQuery;

  public element: Element;
  public config: IWeeklySchedulerConfig<any>;

  private renderGhost: boolean;
  private item: WeeklySchedulerItem<any>;

  public $postLink() {
    this.$element.on('mouseenter', () => this.addDragSchedule());
    this.$element.on('mouseleave', () => this.removeDragSchedule());
    this.$element.on('mouseup', () => this.commitDragSchedule());
  }

  private addDragSchedule() {
    if (this.dragSchedule) {
      this.pendingSchedule = this.addSchedule(this.dragSchedule);
      this.pendingSchedule.$isActive = true;
    }
  }

  private removeDragSchedule() {
    if (this.dragSchedule) {
      this.item.removeSchedule(this.dragSchedule);
    }
  }

  private commitDragSchedule() {
    if (this.pendingSchedule) {
      this.pendingSchedule.$isActive = false;

      this.ngModelCtrl.$setDirty();
      this.merge(this.pendingSchedule);
    }
  }

  public addSlot(start: number, end: number): angular.IPromise<WeeklySchedulerRange<any>> {
    start = this.normalizeValue(start, 0, end);
    end = this.normalizeValue(end, start, this.config.maxValue);

    // Sanity check -- don't add a slot with an end before the start
    // caveat: ok to continue if nullEnds is true and end is null
    if (end && !this.config.nullEnds && end <= start) {
      return this.$q.when(null);
    }

    if (this.config.nullEnds) {
      end = null;
    }

    let schedule = {
      day: this.item.day,
      start: start,
      end: end,
      value: this.config.defaultValue
    };

    if (angular.isFunction(this.config.editSlot)) {
      return this.config.editSlot(schedule).then((editedSchedule) => {
        return this.addScheduleAndMerge(editedSchedule);
      });
    } else {
      return this.$q.when(this.addScheduleAndMerge(schedule));
    }
  }

  /** Expand ghost while dragging in it */
  public adjustGhost(event: MouseEvent) {
    let mouseValue: number = this.getValAtMousePosition(event);

    let existingLeftValue: number = this.startingGhostValues.left;

    let updatedLeftValue: number;
    let updatedRightValue: number;
    
    if (mouseValue < existingLeftValue) { // user is dragging left
      updatedLeftValue = mouseValue;
      updatedRightValue = existingLeftValue;
    } else { // user is dragging right
      updatedLeftValue = existingLeftValue;
      updatedRightValue = mouseValue;
    }

    this.ghostValues = {
      left: this.normalizeGhostValue(updatedLeftValue),
      right: this.normalizeGhostValue(updatedRightValue)
    }
  }
  
  /** Move ghost around while not dragging */
  public positionGhost(e: MouseEvent) {
    let val = this.getValAtMousePosition(e);

    this.startingGhostValues = {
      left: val,
      right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
    };

    this.ghostValues = angular.copy(this.startingGhostValues);
  }

  private addSchedule(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    const range = this.rangeFactory.createRange(this.config, schedule);
    this.item.addSchedule(range);

    return range;
  }

  private addScheduleAndMerge(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let range = this.addSchedule(schedule);
    this.merge(range);

    return range;
  }

  public onGhostWrapperMouseDown(event: MouseEvent) {
    this.renderGhost = true;
    this.positionGhost(event);
  }

  public onGhostWrapperMouseMove(event: MouseEvent) {
    // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
    if (this.config.nullEnds) {
      return;
    }

    if (this.renderGhost) {
      this.adjustGhost(event);
    }
  }

  public onGhostWrapperMouseUp() {
    this.renderGhost = false;

    if (this.item.canAddSchedule()) {
      this.addSlot(this.ghostValues.left, this.ghostValues.right).then(() => {
        this.ngModelCtrl.$setDirty();
        this.config.onChange();
      });
    }
  }

  /**
   * Determine if the schedule is able to be edited
   */
  private canEdit(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let isEditable = this.item.isEditable();
    let hasEditFunction = angular.isFunction(this.config.editSlot);

    return isEditable && hasEditFunction;
  }

  /**
   * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
   * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
   */
  private canRenderGhost() {
    // This one needs to come first, otherwise renderGhost being set to true would override the protection against addt'l slots in nullEnd calendars
    if (this.config.nullEnds) {
      return this.renderGhost && this.item.hasNoSchedules();
    }

    // If you're already dragging the ghost it should never disappear
    if (this.renderGhost) {
      return true;
    }

    if (!this.item.isEditable()) {
      return false;
    }

    return this.renderGhost;
  }

  private getMousePosition(event: MouseEvent) {
    let elementOffsetX = this.elementOffsetService.left(this.$element);
    let left = event.pageX - elementOffsetX;

    return left;
  }

  private getValAtMousePosition(event: MouseEvent) {
    return this.pixelToVal(this.getMousePosition(event));
  }

  /**
   * Perform an external action to bring up an editor for a schedule
   */
  private editSchedule(schedule: WeeklySchedulerRange<any>) {
    if (this.canEdit(schedule)) {
      schedule.$isEditing = true;

      this.config.editSlot(schedule).then((newSchedule) => {
        let range = this.rangeFactory.createRange(this.config, newSchedule);

        if (this.shouldDelete(range)) {
          this.item.removeSchedule(schedule);
        } else {
          let premergeSchedule = angular.copy(range);

          this.merge(range);

          // If merging mutated the schedule further, then updateSchedule would have already been called
          // This is so that edits that don't trigger merges still trigger onChange,
          // but edits that do trigger merges don't trigger it twice
          if (angular.equals(premergeSchedule, range)) {
            schedule.update(range);
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

  private getSlotLeft(start: number) {
    let underlyingInterval: HTMLElement = this.getUnderlyingInterval(start);

    return underlyingInterval.offsetLeft + 'px';
  }

  private getSlotRight(start: number, end: number) {
    // If there is a null end, place the end of the slot two hours away from the beginning.
    if (this.config.nullEnds && end === null) {
      end = start + this.nullEndWidth;
    }

    // An end of 0 should display allll the way to the right, up to the edge
    end = this.endAdjusterService.adjustEndForView(this.config, end);

    // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
    let underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);

    let offsetRight = underlyingInterval.offsetLeft + underlyingInterval.offsetWidth;
    let containerLeft = this.elementOffsetService.left(this.$element)
    let containerRight = this.elementOffsetService.right(this.$element);

    let result = containerRight - containerLeft - offsetRight;

    return result + 'px';
  }

  private getUnderlyingInterval(val: number): HTMLElement {
    // Slightly hacky but does the job. TODO ?
    val = this.normalizeIntervalValue(val);

    return this.element.parentElement.querySelector(`[rel='${val}']`);
  }

  private shouldDelete(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    if (schedule.$isDeleting) {
      return true;
    }

    if (this.config.fillEmptyWithDefault && schedule.value === this.config.defaultValue) {
      return true;
    }

    return false;
  }

  public merge(schedule: WeeklySchedulerRange<any>) {
    this.item.mergeSchedule(schedule);
  }

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }

  private normalizeIntervalValue(value: number) {
    // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
    let rightmost = this.config.maxValue - this.config.interval;

    return this.normalizeValue(value, 0, rightmost);
  }

  private normalizeGhostValue(value: number) {
    return this.normalizeValue(value, 0, this.config.maxValue);
  }

  private normalizeValue(value: number, minValue: number, maxValue: number) {
    if (value < minValue) {
      return minValue;
    }

    if (value > maxValue) {
      return maxValue;
    }

    return value;
  }
}

/** @internal */
class MultiSliderComponent implements angular.IComponentOptions {
  static $name = 'brMultiSlider';

  bindings = {
    config: '<',
    dragSchedule: '<',
    item: '=ngModel'
  };

  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  require = {
    ngModelCtrl: 'ngModel'
  };

  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
}

angular.module('br.weeklyScheduler')
  .controller(MultiSliderController.$name, MultiSliderController)
  .component(MultiSliderComponent.$name, new MultiSliderComponent());
