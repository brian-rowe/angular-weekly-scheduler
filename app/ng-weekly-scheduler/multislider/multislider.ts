/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'multiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element',
    '$scope',
    '$window'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery,
    private $scope: angular.IScope,
    private $window: angular.IWindowService
  ) {
    this.element = this.$element[0];
  }

  private $hoverElement: angular.IAugmentedJQuery;
  private index: number;
  private schedulerCtrl: WeeklySchedulerController;
  
  public canAdd: boolean = true;
  public isDragging: boolean = false;
  public isHoveringSlot: boolean = false;

  public element: Element;
  public config: IWeeklySchedulerConfig;
  public item: IWeeklySchedulerItem<number>;
  public size: number = 60; // minutes
  
  $onInit() {
    this.$scope.$on(WeeklySchedulerEvents.RESIZED, () => {
      this.resize();
    });

    this.$scope.$on(WeeklySchedulerEvents.ZOOMED_IN, () => {
      this.resize();
    });

    this.$scope.$on(WeeklySchedulerEvents.ZOOMED_OUT, () => {
      this.resize();
    })
  }

  $postLink() {
    this.$hoverElement = angular.element(this.$element.find('div')[0]);

    this.$element.on('mousemove', (e) => {
      var elOffX = this.getElementOffsetX(this.$element);
      var left = e.pageX - elOffX - this.$hoverElement[0].clientWidth / 2;

      var val = this.pixelToVal(left);

      this.$hoverElement.css({
        left: this.getSlotLeft(val),
        right: this.getSlotRight(val + this.size)
      });
    });
  }

  public addSlot(start: number, end: number) {
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

    item.schedules.push({
      start: start,
      end: end,
      value: item.defaultValue
    });

    this.schedulerCtrl.onAdd();
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
  private canEdit(schedule: IWeeklySchedulerRange<any>) {
    let isEditable = !angular.isDefined(this.item.editable) || this.item.editable;
    let hasEditFunction = angular.isFunction(this.schedulerCtrl.config.editSlot);
    let isNotActive = !schedule.$isActive;
    let isNotDragging = !this.isDragging;

    return isEditable && hasEditFunction && isNotActive && isNotDragging;
  }

  private compensateForBorder(elem: HTMLElement, val: number) {
    let borderWidth = this.$window.getComputedStyle(elem).getPropertyValue('border-right');

    // There are double borders at the beginnings and ends of hours, so we don't need to worry about it
    let onHour = val % 60 === 0;

    return onHour ? elem.offsetLeft : elem.offsetLeft - parseInt(borderWidth, 10);
  }

  /**
   * Perform an external action to bring up an editor for a schedule
   */
  private editSchedule(schedule: IWeeklySchedulerRange<any>) {
    if (this.canEdit(schedule)) {
      this.schedulerCtrl.config.editSlot(schedule);
    }
  }

  private getSlotLeft(start: number) {
    let underlyingInterval: HTMLElement = this.getUnderlyingInterval(start);

    return this.compensateForBorder(underlyingInterval, start) + 'px';
  }

  private getSlotRight(end: number) {
    // An end of 0 should display allll the way to the right, up to the edge
    if (end === 0) {
      end = this.config.maxValue;
    }

    // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
    let underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);

    let offsetRight = this.compensateForBorder(underlyingInterval, end) + underlyingInterval.offsetWidth;
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

  private onHoverElementClick(event) {
    if (this.canAdd) {
      var elOffX = this.getElementOffsetX(this.$element);
      var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
      
      var start = this.pixelToVal(hoverElOffX);
      var end = start + this.size;

      this.addSlot(start, end);
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
  private removeSchedule(schedule: IWeeklySchedulerRange<any>) {
    this.isDragging = false;
    this.isHoveringSlot = false;

    let schedules = this.item.schedules;

    schedules.splice(schedules.indexOf(schedule), 1);

    this.schedulerCtrl.onDelete();
  }

  private resize() {
    /* Since we have changed the width of the element via plain js +
     * the ng-styles for the individual slots are computed in this controller,
     * we must call $apply() manually so they will all update their positions to match the zoom level
     */
    this.$scope.$apply();
  }

  /**
   * Commit new values to the schedule
   */
  private updateSchedule(schedule: IWeeklySchedulerRange<any>, update: IWeeklySchedulerRange<any>) {
    schedule.start = update.start;
    schedule.end = this.adjustEndForModel(update.end);

    this.schedulerCtrl.onChange({
      itemIndex: this.index,
      scheduleIndex: schedule.$index,
      scheduleValue: schedule
    });
  }

  public pixelToVal(pixel: number) {
    var percent = pixel / this.element.clientWidth;
    return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
  }
}

/** @internal */
class MultiSliderComponent implements angular.IComponentOptions {
  static $name = 'multiSlider';
  
  bindings = {
    config: '<',
    item: '=',
    index: '<',
    size: '<?'
  }

  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  require = {
    schedulerCtrl: '^weeklyScheduler'
  };

  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
}

angular.module('weeklyScheduler')
  .controller(MultiSliderController.$name, MultiSliderController)
  .component(MultiSliderComponent.$name, new MultiSliderComponent());
