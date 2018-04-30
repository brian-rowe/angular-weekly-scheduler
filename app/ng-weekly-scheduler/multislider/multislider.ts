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
  private schedulerCtrl: WeeklySchedulerController;
  
  public isDragging: boolean = false;

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
      end: end
    });

    this.schedulerCtrl.onAdd();
  }

  public getElementOffsetX(elem: angular.IAugmentedJQuery) {
    return elem[0].getBoundingClientRect().left;
  }

  private compensateForBorder(elem: HTMLElement, val: number) {
    let borderWidth = this.$window.getComputedStyle(elem).getPropertyValue('border-right');

    // There are double borders at the beginnings and ends of hours, so we don't need to worry about it
    let onHour = val % 60 === 0;

    return onHour ? elem.offsetLeft : elem.offsetLeft - parseInt(borderWidth, 10);
  }

  private getSlotLeft(start: number) {
    let underlyingInterval: HTMLElement = this.getUnderlyingInterval(start);

    return this.compensateForBorder(underlyingInterval, start) + 'px';
  }

  private getSlotRight(end: number) {
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
    if (!this.$element.attr('no-add')) {
      var elOffX = this.getElementOffsetX(this.$element);
      var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
      
      var start = this.pixelToVal(hoverElOffX);
      var end = start + this.size;

      this.addSlot(start, end);
    }
  }

  private onWeeklySlotMouseOver() {
    this.$element.addClass('slot-hover');
  }

  private onWeeklySlotMouseLeave() {
    this.$element.removeClass('slot-hover');
  }

  private resize() {
    /* Since we have changed the width of the element via plain js +
     * the ng-styles for the individual slots are computed in this controller,
     * we must call $apply() manually so they will all update their positions to match the zoom level
     */
    this.$scope.$apply();
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
