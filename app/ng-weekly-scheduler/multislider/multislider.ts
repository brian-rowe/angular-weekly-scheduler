/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'brMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    '$scope',
    '$window',
    'brWeeklySchedulerNullEndWidth',
    'brWeeklySchedulerOverlapService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private $window: angular.IWindowService,
    private nullEndWidth: number,
    private overlapService: OverlapService
  ) {
    this.element = this.$element[0];
  }

  private index: number;
  
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
  public item: br.weeklyScheduler.IWeeklySchedulerItem<any>;

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

        let elementOffsetX = this.getElementOffsetX(this.$element);
        let left = e.pageX - elementOffsetX - this.$hoverElement[0].clientWidth / 2;

        let val = this.pixelToVal(left);

        if (isDragging) {
        } else {
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

    let item = this.item;

    if (!item.schedules) {
      item.schedules = [];
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
  public expandGhost(event: MouseEvent) {
    let elementOffsetX = this.getElementOffsetX(this.$element);
    let left = event.pageX - elementOffsetX - this.$hoverElement[0].clientWidth / 2;
    let val = this.pixelToVal(left);

    this.$hoverElement.css({
      left: this.$hoverElement.css('left'),
      right: this.getSlotRight(val, this.pixelToVal(event.pageX))
    });
  }

  public setDirty() {
    this.schedulerCtrl.dirty = true;
  }

  private addScheduleToItem(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.item.schedules.push(schedule);
    this.merge(schedule);

    this.setDirty();
  }

  public getElementOffsetX(elem: angular.IAugmentedJQuery) {
    return elem[0].getBoundingClientRect().left;
  }

  private adjustEndForModel(end: number) {
    if (end === this.config.maxValue) {
      end = 0;
    }

    return end;
  }

  /**
   * Determine if the schedule is able to be edited
   */
  private canEdit(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let isEditable = !angular.isDefined(this.item.editable) || this.item.editable;
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
      return this.item.schedules.length === 0;
    }

    if (angular.isDefined(this.item.editable) && !this.item.editable) {
      return false;
    }

    if (this.isAdding) {
      return false;
    }

    if (this.isDragging) {
      return false;
    }

    if (this.isHoveringSlot) {
      return false
    }

    return true;
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

          // If merging mutated the schedule further, then updateSchedule would have already been called
          // This is so that edits that don't trigger merges still trigger onChange,
          // but edits that do trigger merges don't trigger it twice
          if (angular.equals(premergeSchedule, newSchedule)) {
            this.updateSchedule(schedule, newSchedule);
          }
        }
      }).finally(() => {
        this.setDirty();
        schedule.$isEditing = false;
      });
    }
  }

  private getOverlapState(current: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>): OverlapState {
    let overlapState = this.overlapService.getOverlapState(current.start, this.adjustEndForView(current.end), other.start, this.adjustEndForView(other.end));

    return overlapState;
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
    end = this.adjustEndForView(end);

    // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
    let underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);

    let offsetRight = underlyingInterval.offsetLeft + underlyingInterval.offsetWidth;
    let containerLeft = this.getElementOffsetX(this.$element)
    let containerRight = this.$element[0].getBoundingClientRect().right;

    return containerRight - containerLeft - offsetRight + 'px';
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

      this.updateSchedule(current, {
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

      this.updateSchedule(current, {
        day: current.day,
        start: other.start,
        end: current.end,
        value: other.value
      });
    } else {
      this.updateSchedule(other, {
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

      this.updateSchedule(current, {
        day: current.day,
        start: current.start,
        end: other.end,
        value: other.value
      });
    } else {
      this.updateSchedule(other, {
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

  /**
   * If the schedules are highly fragmented from the source, the overlaps might not be fully merged the first time.
   * This function should determine whether additional passes are needed.
   */
  private needsOverlapsMerged(): boolean {
    let len = this.item.schedules.length;
    
    // Compare two at a time
    for (let i = 0; i < len - 1; i += 1) {
      let currentSchedule = this.item.schedules[i];
      let nextSchedule = this.item.schedules[i + 1];

      let valuesMatch = currentSchedule.value === nextSchedule.value;
      
      if (valuesMatch) {
        let overlapState = this.getOverlapState(currentSchedule, nextSchedule);

        return [OverlapState.OtherEndIsCurrentStart, OverlapState.OtherStartIsCurrentEnd].indexOf(overlapState) > -1;
      }
    }

    return false;
  }

  private mergeAllOverlaps() {
    do {
      this.item.schedules.forEach(s => this.mergeOverlaps(s));
    } while (this.needsOverlapsMerged());
  }

  private mergeOverlaps(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    let schedules = this.item.schedules;

    schedules.forEach((el => {
      if (el !== schedule) {
        let overlapState = this.getOverlapState(schedule, el);
        let overlapHandler = this.overlapHandlers[overlapState];

        overlapHandler(schedule, el);
      }
    }));
  }

  private onChange() {
    this.schedulerCtrl.config.onChange(!this.schedulerCtrl.hasInvalidSchedule());
  }

  private onHoverElementClick(event) {
    if (this.canAdd) {
      let elementOffsetX = this.getElementOffsetX(this.$element);
      let hoverElementOffsetX = this.getElementOffsetX(this.$hoverElement) - elementOffsetX;

      let start = this.pixelToVal(hoverElementOffsetX);
      let width = this.pixelToVal(this.$hoverElement[0].clientWidth);
      let end = this.config.nullEnds ? null : this.adjustEndForModel(start + width);

      this.isAdding = true;

      this.addSlot(start, end).then(() => {
        this.onChange();
        this.isAdding = false;
      });
    }
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

    let schedules = this.item.schedules;

    schedules.splice(schedules.indexOf(schedule), 1);

    this.setDirty();
  }

  /**
   * Commit new values to the schedule
   */
  private updateSchedule(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, update: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    schedule.start = update.start;
    schedule.end = this.adjustEndForModel(update.end);

    this.onChange();
  }

  private valuesMatch(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, other: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    return schedule.value === other.value;
  }

  public adjustEndForView(end: number) {
    if (end === 0) {
      end = this.config.maxValue;
    }

    return end;
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
    item: '=',
    index: '<',
    size: '<?'
  }

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
