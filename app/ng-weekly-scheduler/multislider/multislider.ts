class MultiSliderDirective implements angular.IDirective {
  static $name = 'multiSlider';

  restrict = 'E';
  require = '^weeklyScheduler';
  templateUrl = 'ng-weekly-scheduler/multislider/multislider.html';

  constructor(
    private timeService: WeeklySchedulerTimeService
  ) {
  }

  link = (scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, schedulerCtrl) => {
    var conf = schedulerCtrl.config;

    // The default scheduler block size when adding a new item
    var defaultNewScheduleSize = parseInt(attrs.size) || 8;

    var valToPixel = function (val) {
      var percent = val / (conf.nbHours);
      return Math.floor(percent * element[0].clientWidth + 0.5);
    };

    var pixelToVal = function (pixel) {
      var percent = pixel / element[0].clientWidth;
      return Math.floor(percent * (conf.nbHours) + 0.5);
    };

    var addSlot = (start, end) => {
      start = start >= 0 ? start : 0;
      end = end <= conf.nbWeeks ? end : conf.nbWeeks;

      var startDate = this.timeService.addWeek(conf.minDate, start);
      var endDate = this.timeService.addWeek(conf.minDate, end);

      scope.$apply(function () {
        var item = scope.item;
        if (!item.schedules) {
          item.schedules = [];
        }
        item.schedules.push({start: startDate.toDate(), end: endDate.toDate()});
      });
    };

    var hoverElement = angular.element(element.find('div')[0]);
    var hoverElementWidth = valToPixel(defaultNewScheduleSize);

    hoverElement.css({
      width: hoverElementWidth + 'px'
    });

    element.on('mousemove', function (e) {
      var elOffX = element[0].getBoundingClientRect().left;

      hoverElement.css({
        left: e.pageX - elOffX - hoverElementWidth / 2 + 'px'
      });
    });

    hoverElement.on('click', function (event) {
      if (!element.attr('no-add')) {
        var elOffX = element[0].getBoundingClientRect().left;
        var pixelOnClick = event.pageX - elOffX;
        var valOnClick = pixelToVal(pixelOnClick);

        var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
        var end = start + defaultNewScheduleSize;

        addSlot(start, end);
      }
    });
  }

  static Factory() {
    let directive = (timeService) => new MultiSliderDirective(timeService);

    directive.$inject = [
      'weeklySchedulerTimeService'
    ];

    return directive;
  }
}

angular.module('weeklyScheduler')
  .directive(MultiSliderDirective.$name, MultiSliderDirective.Factory());
