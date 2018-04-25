/** @internal */
class IntervalGridDirective implements angular.IDirective {
    static $name = 'intervalGrid';

    restrict = 'E';
    require = '^weeklyScheduler';

    private doGrid(scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, config: IWeeklySchedulerConfig) {
        // Calculate interval width distribution
        var tickcount = config.intervalCount;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.clone().css({width: ticksize + '%'});

        // Clean element
        element.empty();
  
        for (let i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          if (this.shouldAddBorder(i, tickcount, config)) {
              child.addClass('weekly-schedule-border');
          }

          element.append(child);
        }
    }

    private shouldAddBorder(index: number, tickcount: number, config: IWeeklySchedulerConfig) {
        let position = index + 1;

        if (position === tickcount) {
            return false;
        }

        if ((position * config.interval) % 60 === 0) {
            return true;
        }

        return false;
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
