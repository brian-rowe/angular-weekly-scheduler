/** @internal */
class MultiSliderDirective implements angular.IDirective {
  static $name = 'multiSlider';

  restrict = 'E';
  require = '^weeklyScheduler';
  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';

  link = (scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, schedulerCtrl: WeeklySchedulerController) => {
    var conf = schedulerCtrl.config;

    // The default scheduler block size when adding a new item (in minutes)
    var defaultNewScheduleSize = (parseInt(attrs.size, 10) || 60);

    var valToPixel = function (val) {
      var percent = val / conf.intervalCount / conf.interval;
      return Math.floor(percent * element[0].clientWidth + 0.5);;
    };

    var pixelToVal = function (pixel) {
      var percent = pixel / element[0].clientWidth;
      return Math.floor(percent * (conf.intervalCount) + 0.5) * conf.interval;
    };

    var addSlot = (start, end) => {
      start = start >= 0 ? start : 0;
      end = end <= conf.maxValue ? end : conf.maxValue;

      var item = scope.item;

      if (!item.schedules) {
        item.schedules = [];
      }

      item.schedules.push({start: start, end: end});
    };

    var getElementOffsetX = (elem) => elem[0].getBoundingClientRect().left;

    var hoverElement = angular.element(element.find('div')[0]);
    var hoverElementWidth = valToPixel(defaultNewScheduleSize);

    hoverElement.css({
      width: hoverElementWidth + 'px'
    });

    element.on('mousemove', function (e) {
      var elOffX = getElementOffsetX(element);
      var left = e.pageX - elOffX - hoverElementWidth / 2;
      var snapped = valToPixel(pixelToVal(left));

      hoverElement.css({
        left: snapped + 'px'
      });
    });

    scope.getSlotLeft = function(schedule: IWeeklySchedulerRange<number>) {
      return schedule.start / conf.maxValue * 100 + '%';
    }

    scope.getSlotWidth = function(schedule: IWeeklySchedulerRange<number>) {
      return (schedule.end - schedule.start) / conf.maxValue * 100 + '%';
    }

    scope.onHoverElementClick = function(event) {
      if (!element.attr('no-add')) {
        var elOffX = getElementOffsetX(element);
        var hoverElOffX = getElementOffsetX(hoverElement) - elOffX;
        
        var start = pixelToVal(hoverElOffX);
        var end = start + defaultNewScheduleSize;

        addSlot(start, end);
      }
    }

    scope.onWeeklySlotMouseOver = function() {
      element.addClass('slot-hover');
    }

    scope.onWeeklySlotMouseLeave = function() {
      element.removeClass('slot-hover');
    }
  }

  static Factory() {
    let directive = () => new MultiSliderDirective();

    return directive;
  }
}

angular.module('weeklyScheduler')
  .directive(MultiSliderDirective.$name, MultiSliderDirective.Factory());
