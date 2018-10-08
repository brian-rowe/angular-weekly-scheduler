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
    'brWeeklySchedulerMouseTrackerService',
    'brWeeklySchedulerNullEndWidth',
    'brWeeklySchedulerRangeFactory',
    'brWeeklySchedulerValueNormalizationService'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $q: angular.IQService,
    private $scope: angular.IScope,
    private elementOffsetService: ElementOffsetService,
    private endAdjusterService: EndAdjusterService,
    private mouseTrackerService: MouseTrackerService,
    private nullEndWidth: number,
    private rangeFactory: WeeklySchedulerRangeFactory,
    private valueNormalizationService: ValueNormalizationService
  ) {
    this.element = this.$element[0];
  }

  private dragSchedule: WeeklySchedulerRange<any>;
  private pendingSchedule: WeeklySchedulerRange<any>;

  private startingGhostValues: { left: number, right: number };
  private readonly ghostValues: { left: number, right: number };
  private setGhostValues: (options: { ghostValues: { left: number, right: number } }) => void;

  private ngModelCtrl: angular.INgModelController;
  
  public element: Element;
  public config: IWeeklySchedulerConfig<any>;

  private item: WeeklySchedulerItem<any>;

  public $postLink() {
    this.$element.on('mouseenter', () => {
      this.onMouseEnter();
    });

    this.$element.on('mouseleave', () => {
      this.onMouseLeave();
    });

    this.$element.on('mouseup', () => {
       this.onMouseUp();
    });

    this.$scope.$on(WeeklySchedulerEvents.COMMIT_GHOST, (event: angular.IAngularEvent, ghostSchedule: WeeklySchedulerRange<any>) => {
      if (this.item.$renderGhost) {
        this.commitGhost(ghostSchedule);
      }
    });

    this.$scope.$on(WeeklySchedulerEvents.REMOVE_GHOST, (event: angular.IAngularEvent, day: number) => {
      if (!this.item.$isGhostOrigin && this.item.day === day) {
        this.item.$renderGhost = false;
      }
    });

    this.$scope.$on(WeeklySchedulerEvents.REMOVE_ALL_GHOSTS, () => {
      this.item.$renderGhost = false;
    });
  }

  private onMouseEnter() {
    // If the cursor is moving BACK into an item that ALREADY has a ghost rendered, we'll want to remove the ghost from the item that was left
    if (this.item.$renderGhost) {
      this.$scope.$emit(WeeklySchedulerEvents.REMOVE_LAST_GHOST);
    }

    if (this.dragSchedule) {
      this.addDragSchedule();
    }

    if (this.ghostValues && !this.item.$renderGhost) {
      this.createGhost();
    }
  }

  private onMouseLeave() {
    if (this.dragSchedule) {
      this.removeDragSchedule();
    }
  }

  private onMouseUp() {
    if (this.pendingSchedule) {
      this.commitDragSchedule();
    }
  }

  private addDragSchedule() {
    this.dragSchedule.day = this.item.day;
    this.pendingSchedule = this.item.addSchedule(this.dragSchedule);
    this.pendingSchedule.$isActive = true;
  }

  private removeDragSchedule() {
    this.item.removeSchedule(this.dragSchedule);
    this.pendingSchedule = null;
  }

  private commitDragSchedule() {
    this.pendingSchedule.$isActive = false;

    this.ngModelCtrl.$setDirty();
    this.item.mergeSchedule(this.pendingSchedule);
    this.pendingSchedule = null;
  }

  private getScheduleForAdd(start: number, end: number) {
    start = this.valueNormalizationService.normalizeValue(start, 0, end);
    end = this.valueNormalizationService.normalizeValue(end, start, this.config.maxValue);

    if (this.config.nullEnds) {
      end = null;
    }

    let schedule = {
      day: this.item.day,
      start: start,
      end: end,
      value: this.config.defaultValue
    };

    return schedule;
  }

  private openEditorForAdd(schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>): angular.IPromise<br.weeklyScheduler.IWeeklySchedulerRange<any>> {
    if (this.item.canEdit()) {
      return this.config.editSlot(schedule);
    } else {
      return this.$q.when(schedule);
    }
  }

  /** Expand ghost while dragging in it */
  public adjustGhost() {
    let point = this.mouseTrackerService.getMousePosition();
    let mouseValue: number = this.getValAtMousePosition(point.x);

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

    let ghostValues = {
      left: this.normalizeGhostValue(updatedLeftValue),
      right: this.normalizeGhostValue(updatedRightValue)
    };

    this.setGhostValues({ 
      ghostValues: ghostValues
    });
  }
  
  /** Move ghost around while not dragging */
  public positionGhost() {
    let point = this.mouseTrackerService.getMousePosition();
    let val = this.getValAtMousePosition(point.x);

    this.startingGhostValues = {
      left: val,
      right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
    };

    this.setGhostValues({
      ghostValues: angular.copy(this.startingGhostValues)
    });
  }

  public onGhostWrapperMouseDown() {
    if (!this.item.isEditable()) {
      return;
    }

    this.item.$isGhostOrigin = true;
    this.createGhost();
  }

  public onGhostWrapperMouseMove() {
    // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
    if (this.config.nullEnds) {
      this.positionGhost();
      return;
    }

    if (this.item.$renderGhost) {
      this.adjustGhost();
    }
  }

  public onGhostWrapperMouseUp() {
    let ghostSchedule = this.getScheduleForAdd(this.ghostValues.left, this.ghostValues.right);

    this.openEditorForAdd(ghostSchedule).then(editedGhostSchedule => {
      this.$scope.$emit(WeeklySchedulerEvents.GHOST_DRAG_ENDED, editedGhostSchedule);
    }).catch(() => {
      this.$scope.$emit(WeeklySchedulerEvents.CANCEL_GHOST);
    });
  }

  private createGhost() {
    this.item.$renderGhost = true;
    this.positionGhost();
  }

  private commitGhost(ghostSchedule: WeeklySchedulerRange<any>) {
    this.item.$renderGhost = false;
    this.item.$isGhostOrigin = false;

    if (this.item.canAddSchedule()) {
      this.item.addScheduleAndMerge(ghostSchedule);
      this.ngModelCtrl.$setDirty();
      this.config.onChange();
      this.setGhostValues(null);
    }
  }

  private getMousePosition(pageX: number) {
    let elementOffsetX = this.elementOffsetService.left(this.$element);
    let left = pageX - elementOffsetX;

    return left;
  }

  private getValAtMousePosition(pageX: number) {
    return this.pixelToVal(this.getMousePosition(pageX));
  }

  /**
   * Perform an external action to bring up an editor for a schedule
   */
  private editSchedule(schedule: WeeklySchedulerRange<any>) {
    if (this.item.canEdit()) {
      schedule.$isEditing = true;

      this.config.editSlot(schedule).then((newSchedule) => {
        let range = this.rangeFactory.createRange(this.config, newSchedule);

        if (this.shouldDelete(range)) {
          this.item.removeSchedule(schedule);
        } else {
          let premergeSchedule = angular.copy(range);

          this.item.mergeSchedule(range);

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

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }

  private normalizeIntervalValue(value: number) {
    // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
    let rightmost = this.config.maxValue - this.config.interval;

    return this.valueNormalizationService.normalizeValue(value, 0, rightmost);
  }

  private normalizeGhostValue(value: number) {
    return this.valueNormalizationService.normalizeValue(value, 0, this.config.maxValue);
  }
}

/** @internal */
class MultiSliderComponent implements angular.IComponentOptions {
  static $name = 'brMultiSlider';

  bindings = {
    config: '<',
    dragSchedule: '<',
    ghostValues: '<',
    item: '=ngModel',
    setGhostValues: '&'
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
