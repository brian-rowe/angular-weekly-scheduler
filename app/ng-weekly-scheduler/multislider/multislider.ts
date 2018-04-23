/** @internal */
class MultiSliderController implements angular.IComponentController {
  static $name = 'multiSliderController';
  static $controllerAs = 'multiSliderCtrl';

  static $inject = [
    '$element'
  ];

  constructor(
    private $element: angular.IAugmentedJQuery
  ) {
    this.element = this.$element[0];
  }

  private $hoverElement: angular.IAugmentedJQuery;

  public element: Element;
  public config: IWeeklySchedulerConfig;
  public defaultNewScheduleSize: number = 60; // minutes
  public item: IWeeklySchedulerItem<number>;
  public size?: number;

  $onInit() {
    if (this.size) {
      this.defaultNewScheduleSize = this.size;
    }
  }

  $postLink() {
    this.$hoverElement = angular.element(this.$element.find('div')[0]);
    let hoverElementWidth = this.valToPixel(this.defaultNewScheduleSize);

    this.$hoverElement.css({
      width: `${hoverElementWidth}px`
    });

    this.$element.on('mousemove', (e) => {
      var elOffX = this.getElementOffsetX(this.$element);
      var left = e.pageX - elOffX - hoverElementWidth / 2;
      var snapped = this.valToPixel(this.pixelToVal(left));

      this.$hoverElement.css({
        left: snapped + 'px'
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
  }

  public getElementOffsetX(elem: angular.IAugmentedJQuery) {
    return elem[0].getBoundingClientRect().left;
  }

  private getSlotLeft(schedule: IWeeklySchedulerRange<number>) {
    return schedule.start / this.config.maxValue * 100 + '%';
  }
  
  private getSlotWidth(schedule: IWeeklySchedulerRange<number>) {
    return (schedule.end - schedule.start) / this.config.maxValue * 100 + '%';
  }

  private onHoverElementClick(event) {
    if (!this.$element.attr('no-add')) {
      var elOffX = this.getElementOffsetX(this.$element);
      var hoverElOffX = this.getElementOffsetX(this.$hoverElement) - elOffX;
      
      var start = this.pixelToVal(hoverElOffX);
      var end = start + this.defaultNewScheduleSize;

      this.addSlot(start, end);
    }
  }

  private onWeeklySlotMouseOver() {
    this.$element.addClass('slot-hover');
  }

  private onWeeklySlotMouseLeave() {
    this.$element.removeClass('slot-hover');
  }

  public valToPixel(val: number) {
    let percent = val / this.config.intervalCount / this.config.interval;
    return Math.floor(percent * this.element.clientWidth + 0.5);
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
    size: '<?'
  }

  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';
}

angular.module('weeklyScheduler')
  .controller(MultiSliderController.$name, MultiSliderController)
  .component(MultiSliderComponent.$name, new MultiSliderComponent());
