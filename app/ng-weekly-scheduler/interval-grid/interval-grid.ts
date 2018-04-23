/** @internal */
class IntervalGridDirective implements angular.IDirective {
    static $name = 'intervalGrid';

    restrict = 'E';
    require = '^weeklyScheduler';

    private doGrid(scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, config: IWeeklySchedulerConfig) {
        // Calculate interval width distribution
        var tickcount = config.intervalCount;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});

        // Clean element
        element.empty();
  
        for (let i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          // Add border-right at ends of hours
          if (this.shouldAddBorder(i, tickcount, config)) {
              child.addClass('weekly-schedule-border');
          }

          element.append(child);
        }
    }

    private shouldAddBorder(index: number, tickcount: number, config: IWeeklySchedulerConfig) {
        if (index === tickcount - 1) {
            return false;
        }

        return (index + 1) * config.interval % 60 === 0;
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.doGrid(scope, element, attrs, schedulerCtrl.config);
        }

        schedulerCtrl.$modelChangeListeners.push((newConfig) => {
            this.doGrid(scope, element, attrs, newConfig);
        });
    }

    static Factory() {
        let directive = () => new IntervalGridDirective();

        return directive;
    }
}
angular
    .module('weeklyScheduler')
    .directive(IntervalGridDirective.$name, IntervalGridDirective.Factory());
