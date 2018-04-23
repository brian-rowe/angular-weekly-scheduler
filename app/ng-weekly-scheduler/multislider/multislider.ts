/** @internal */
class MultiSliderController implements angular.IController {
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
class MultiSliderDirective implements angular.IDirective {
  static $name = 'multiSlider';

  bindToController = true;
  controller = MultiSliderController.$name;
  controllerAs = MultiSliderController.$controllerAs;

  scope = {
    config: '<',
    item: '=',
    size: '<?'
  }

  restrict = 'E';
  require = 'multiSlider';
  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';

  link = (scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ctrl: MultiSliderController) => {
    var hoverElement = angular.element(element.find('div')[0]);
    var hoverElementWidth = ctrl.valToPixel(ctrl.defaultNewScheduleSize);

    hoverElement.css({
      width: hoverElementWidth + 'px'
    });

    element.on('mousemove', function (e) {
      var elOffX = ctrl.getElementOffsetX(element);
      var left = e.pageX - elOffX - hoverElementWidth / 2;
      var snapped = ctrl.valToPixel(ctrl.pixelToVal(left));

      hoverElement.css({
        left: snapped + 'px'
      });
    });

    scope.onHoverElementClick = function(event) {
      if (!element.attr('no-add')) {
        var elOffX = ctrl.getElementOffsetX(element);
        var hoverElOffX = ctrl.getElementOffsetX(hoverElement) - elOffX;
        
        var start = ctrl.pixelToVal(hoverElOffX);
        var end = start + ctrl.defaultNewScheduleSize;

        ctrl.addSlot(start, end);
      }
    }
  }

  static Factory() {
    let directive = () => new MultiSliderDirective();

    return directive;
  }
}

angular.module('weeklyScheduler')
  .controller(MultiSliderController.$name, MultiSliderController)
  .directive(MultiSliderDirective.$name, MultiSliderDirective.Factory());
