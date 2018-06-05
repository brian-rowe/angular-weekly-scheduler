/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'brMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerNullEndWidth',
    'brWeeklySchedulerOverlapService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private endAdjusterService: EndAdjusterService,
    private nullEndWidth: number,
    private overlapService: OverlapService
  ) {
    this.element = this.$element[0];
  }

  private overlapHandlers: { [key: number]: (current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>) => void; } = {
    [OverlapState.NoOverlap]: (current, other) => this.handleNoOverlap(current, other),
    [OverlapState.CurrentIsInsideOther]: (current, other) => this.handleCurrentIsInsideOther(current, other),
    [OverlapState.CurrentCoversOther]: (current, other) => this.handleCurrentCoversOther(current, other),
    [OverlapState.OtherEndIsInsideCurrent]: (current, other) => this.handleOtherEndIsInsideCurrent(current, other),
    [OverlapState.OtherStartIsInsideCurrent]: (current, other) => this.handleOtherStartIsInsideCurrent(current, other),
    [OverlapState.OtherEndIsCurrentStart]: (current, other) => this.handleOtherEndIsCurrentStart(current, other),
    [OverlapState.OtherStartIsCurrentEnd]: (current, other) => this.handleOtherStartIsCurrentEnd(current, other)
  };
  
  private schedulerCtrl: WeeklySchedulerController;
  
  public $hoverElement: angular.IAugmentedJQuery;

  public canAdd: boolean = true;
  public isAdding: boolean = false;
  public isDragging: boolean = false;
  public isHoveringSlot: boolean = false;

  public element: Element;
  public config: IWeeklySchedulerConfig<any>;
  public item: WeeklySchedulerItem<any>;

  $onInit() {
    this.mergeAllOverlaps();
  }

  $postLink() {
    if (this.$hoverElement.length) {
      this.element.addEventListener('mousemove', (e: MouseEvent) => {
        const primary = 1;
        const defaultSize = 60;

        // must use 'buttons' not 'button'
        let isDragging = e.buttons === primary;

        let val = this.getGhostLeftVal(e);

        if (!isDragging) {
          let updatedLeft = this.getSlotLeft(val);
          let updatedRight = this.config.nullEnds ? this.getSlotRight(val, val + this.nullEndWidth) : this.getSlotRight(val, val + defaultSize);

          this.$hoverElement.css({
            left: updatedLeft,
            right: updatedRight
          });
        }
      });
    }
  }

  public addSlot(start: number, end: number): angular.IPromise<void> {
    if (start < 0) {
      start = 0;
    }

    if (end > this.config.maxValue) {
      end = this.config.maxValue;
    }

    // Sanity check -- don't add a slot with an end before the start
    if (end <= start) {
      return this.$q.when();
    }

    let schedule = {
      day: this.item.day,
      start: start,
      end: end,
      value: this.config.defaultValue
    };

    if (angular.isFunction(this.schedulerCtrl.config.editSlot)) {
      return this.schedulerCtrl.config.editSlot(schedule).then((editedSchedule) => {
        this.addScheduleToItem(editedSchedule);
      });
    } else {
      return this.$q.when(this.addScheduleToItem(schedule));
    }
  }

  /** Expand ghost while dragging in it */
  public adjustGhost(event: MouseEvent) {
    let currentLeftVal: number = this.getGhostLeftVal(event);

    // Make right edge adjust to new mouse position
    let updatedRightVal: number = this.pixelToVal(event.pageX);
    let updatedRightPx: string = this.getSlotRight(currentLeftVal, updatedRightVal);
    
    // Lock left edge in place, only update right
    this.$hoverElement.css({
      right: updatedRightPx
    });
  }

  public setDirty() {
    this.schedulerCtrl.dirty = true;
  }

  private addScheduleToItem(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.item.addSchedule(schedule);
    this.merge(schedule);

    this.setDirty();
  }

  public getElementOffsetX(elem: angular.IAugmentedJQuery) {
    return elem[0].getBoundingClientRect().left;
  }

  public onHoverElementClick() {
    if (this.canAdd) {
      let elementOffsetX = this.getElementOffsetX(this.$element);
      let hoverElementOffsetX = this.getElementOffsetX(this.$hoverElement) - elementOffsetX;

      let start = this.pixelToVal(hoverElementOffsetX);
      let width = this.pixelToVal(this.$hoverElement[0].clientWidth);
      let end = this.config.nullEnds ? null : this.endAdjusterService.adjustEndForModel(this.config, start + width);

      this.isAdding = true;

      this.addSlot(start, end).then(() => {
        this.schedulerCtrl.onChange();
        this.isAdding = false;
      });
    }
  }

  /**
   * Determine if the schedule is able to be edited
   */
  private canEdit(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let isEditable = this.item.isEditable();
    let hasEditFunction = angular.isFunction(this.schedulerCtrl.config.editSlot);
    let isNotActive = !schedule.$isActive;
    let isNotDragging = !this.isDragging;

    return isEditable && hasEditFunction && isNotActive && isNotDragging;
  }

  /**
   * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
   * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
   */
  private canRenderGhost(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    if (this.config.nullEnds) {
      return this.item.hasNoSchedules();
    }

    if (!this.item.isEditable()) {
      return false;
    }

    if (this.isAdding) {
      return false;
    }

    if (this.isDragging) {
      return false;
    }

    if (this.isHoveringSlot) {
      return false;
    }

    return true;
  }

  private getGhostLeftPixel(event: MouseEvent) {
    let elementOffsetX = this.getElementOffsetX(this.$element);
    let left = event.pageX - elementOffsetX - 4; // give a little tolerance to make sure the mouse pointer is always inside the ghost

    return left;
  }

  private getGhostLeftVal(event: MouseEvent) {
    return this.pixelToVal(this.getGhostLeftPixel(event));
  }

  /**
   * Perform an external action to bring up an editor for a schedule
   */
  private editSchedule(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    if (this.canEdit(schedule)) {
      schedule.$isEditing = true;

      this.schedulerCtrl.config.editSlot(schedule).then((newSchedule) => {
        if (newSchedule.$isDeleting) {
          this.removeSchedule(schedule);
        }
        else {
          let premergeSchedule = angular.copy(newSchedule);

          this.merge(newSchedule);

          // If merging mutated the schedule further, then schedulerCtrl.updateSchedule would have already been called
          // This is so that edits that don't trigger merges still trigger onChange,
          // but edits that do trigger merges don't trigger it twice
          if (angular.equals(premergeSchedule, newSchedule)) {
            this.schedulerCtrl.updateSchedule(schedule, newSchedule);
          }
        }
      }).finally(() => {
        this.setDirty();
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
    let containerLeft = this.getElementOffsetX(this.$element)
    let containerRight = this.$element[0].getBoundingClientRect().right;

    let result = containerRight - containerLeft - offsetRight;

    return result + 'px';
  }

  private getUnderlyingInterval(val: number): HTMLElement {
    // Slightly hacky but does the job. TODO ?

    // There is no interval to the left of the leftmost interval, so return that instead
    if (val < 0) {
      val = 0;
    }

    // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
    let rightmost = this.config.maxValue - this.config.interval;

    if (val > rightmost) {
      val = rightmost;
    }

    return this.$element.parent()[0].querySelector(`[rel='${val}']`);
  }

  private handleCurrentCoversOther(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    // Here, it doesn't matter if the values match -- the covering slot can always "eat" the other one
    this.removeSchedule(other);
  }

  private handleCurrentIsInsideOther(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    if (this.valuesMatch(current, other)) {
      // Remove 'other' & make current expand to fit the other slot
      this.removeSchedule(other);

      this.schedulerCtrl.updateSchedule(current, {
        day: other.day,
        start: other.start,
        end: other.end,
        value: other.value
      });
    } else {
      // Just remove 'current'
      this.removeSchedule(current);
    }
  }

  private handleNoOverlap(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    // Do nothing
  }

  private handleOtherEndIsInsideCurrent(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    if (this.valuesMatch(current, other)) {
      this.removeSchedule(other);

      this.schedulerCtrl.updateSchedule(current, {
        day: current.day,
        start: other.start,
        end: current.end,
        value: other.value
      });
    } else {
      this.schedulerCtrl.updateSchedule(other, {
        day: other.day,
        start: other.start,
        end: current.start,
        value: current.value
      });
    }
  }

  private handleOtherStartIsInsideCurrent(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    if (this.valuesMatch(current, other)) {
      this.removeSchedule(other);

      this.schedulerCtrl.updateSchedule(current, {
        day: current.day,
        start: current.start,
        end: other.end,
        value: other.value
      });
    } else {
      this.schedulerCtrl.updateSchedule(other, {
        day: other.day,
        start: current.end,
        end: other.end,
        value: other.value
      })
    }
  }

  private handleOtherEndIsCurrentStart(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    if (this.valuesMatch(current, other)) {
      this.handleOtherEndIsInsideCurrent(current, other);
    } else {
      // DO NOTHING, this is okay if the values don't match
    }
  }

  private handleOtherStartIsCurrentEnd(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): void {
    if (this.valuesMatch(current, other)) {
      this.handleOtherStartIsInsideCurrent(current, other);
    } else {
      // DO NOTHING, this is okay if the values don't match
    }
  }

  private mergeAllOverlaps() {
    do {
      this.item.schedules.forEach(s => this.mergeOverlaps(s));
    } while (this.item.needsOverlapsMerged());
  }

  private mergeOverlaps(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let schedules = this.item.schedules;

    schedules.forEach((el => {
      if (el !== schedule) {
        let overlapState = this.overlapService.getOverlapState(this.config, schedule, el);
        let overlapHandler = this.overlapHandlers[overlapState];

        overlapHandler(schedule, el);
      }
    }));
  }

  private onWeeklySlotMouseOver() {
    this.isHoveringSlot = true;
  }

  private onWeeklySlotMouseLeave() {
    this.isHoveringSlot = false;
  }

  /**
   * Actually remove the schedule from both the screen and the model
   */
  private removeSchedule(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.isDragging = false;
    this.isHoveringSlot = false;

    this.item.removeSchedule(schedule);

    this.setDirty();
  }

  private valuesMatch(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    return schedule.value === other.value;
  }

  public merge(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    // We consider the schedule we were working with to be the most important, so handle its overlaps first.
    this.mergeOverlaps(schedule);
    this.mergeAllOverlaps();
  }

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }
}

/** @internal */
class MultiSliderComponent implements angular.IComponentOptions {
  static $name = 'brMultiSlider';

  bindings = {
    config: '<',
    item: '='
  };

  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  require = {
    schedulerCtrl: '^brWeeklyScheduler'
  };

  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
}

angular.module('br.weeklyScheduler')
  .controller(MultiSliderController.$name, MultiSliderController)
  .component(MultiSliderComponent.$name, new MultiSliderComponent());
