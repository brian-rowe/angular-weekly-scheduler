/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'brMultiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$q',
    'brWeeklySchedulerElementOffsetService',
    'brWeeklySchedulerEndAdjusterService',
    'brWeeklySchedulerNullEndWidth'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private elementOffsetService: ElementOffsetService,
    private endAdjusterService: EndAdjusterService,
    private nullEndWidth: number
  ) {
    this.element = this.$element[0];
  }

  private isDraggingGhost: boolean = false;
  private startingGhostValues: { left: number, right: number };
  private ghostValues: { left: number, right: number };

  private schedulerCtrl: WeeklySchedulerController;
  
  public $hoverElement: angular.IAugmentedJQuery;

  public canAdd: boolean = true;
  public isAdding: boolean = false;

  public element: Element;
  public config: IWeeklySchedulerConfig<any>;
  public item: WeeklySchedulerItem<any>;

  private _renderGhost: boolean;

  public addSlot(start: number, end: number): angular.IPromise<void> {
    if (start < 0) {
      start = 0;
    }

    if (end > this.config.maxValue) {
      end = this.config.maxValue;
    }

    // Sanity check -- don't add a slot with an end before the start
    // caveat: ok to continue if nullEnds is true and end is null
    if (end && !this.config.nullEnds && end <= start) {
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
      left: updatedLeftValue,
      right: updatedRightValue
    }
  }
  
  /** Move ghost around while not dragging */
  public positionGhost(e: MouseEvent) {
    let val = this.getValAtMousePosition(e);

    this.startingGhostValues = { left: val, right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval };
    this.ghostValues = angular.copy(this.startingGhostValues);
  }

  public setDirty() {
    this.schedulerCtrl.dirty = true;
  }

  private addScheduleToItem(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.item.addSchedule(schedule);
    this.merge(schedule);

    this.setDirty();
  }

  public onGhostWrapperMouseDown(event: MouseEvent) {
    this._renderGhost = true;
    this.isDraggingGhost = true;
    this.positionGhost(event);
  }

  public onGhostWrapperMouseMove(event: MouseEvent) {
    // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
    if (this.config.nullEnds) {
      return;
    }

    if (this.isDraggingGhost) {
      this.adjustGhost(event);
    }
  }

  public onGhostWrapperMouseUp() {
    if (this.config.nullEnds) {
      this.canAdd = this.item.hasNoSchedules();
    }

    this._renderGhost = false;
    this.isDraggingGhost = false;

    this.onHoverElementClick();
  }

  public onHoverElementClick() {
    if (this.canAdd) {
      let elementOffsetX = this.elementOffsetService.left(this.$element);
      let hoverElementOffsetX = this.elementOffsetService.left(this.$hoverElement) - elementOffsetX;

      let start = this.pixelToVal(hoverElementOffsetX);
      let width = this.pixelToVal(this.$hoverElement[0].clientWidth);
      let end = this.config.nullEnds ? null : this.endAdjusterService.adjustEndForModel(this.config, start + width);

      this.isAdding = true;

      this.addSlot(start, end).then(() => {
        this.schedulerCtrl.onChange();
        this.isAdding = false;
        this.canAdd = false;
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
  private canRenderGhost() {
    // This one needs to come first, otherwise isDraggingGhost being set to true would override the protection against addt'l slots in nullEnd calendars
    if (this.config.nullEnds) {
      return this._renderGhost && this.item.hasNoSchedules();
    }

    // If you're already dragging the ghost it should never disappear
    if (this.isDraggingGhost) {
      return true;
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

    return this._renderGhost;
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
  private editSchedule(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    if (this.canEdit(schedule)) {
      schedule.$isEditing = true;

      this.schedulerCtrl.config.editSlot(schedule).then((newSchedule) => {
        if (newSchedule.$isDeleting) {
          this.schedulerCtrl.removeScheduleFromItem(this.item, schedule);
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
    let containerLeft = this.elementOffsetService.left(this.$element)
    let containerRight = this.elementOffsetService.right(this.$element);

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

  private onWeeklySlotMouseOver() {
    this.isHoveringSlot = true;
  }

  private onWeeklySlotMouseLeave() {
    this.isHoveringSlot = false;
  }

  public merge(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
    this.schedulerCtrl.mergeScheduleIntoItem(this.item, schedule);
  }

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }

  get isDragging() {
    return this.schedulerCtrl.dragging;
  }

  set isDragging(value: boolean) {
    this.schedulerCtrl.dragging = value;
  }

  get isHoveringSlot() {
    return this.schedulerCtrl.hoveringSlot;
  }

  set isHoveringSlot(value: boolean) {
    this.schedulerCtrl.hoveringSlot = value;
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
