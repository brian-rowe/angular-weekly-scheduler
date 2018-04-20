class IntervalGridDirective implements angular.IDirective {
    static $name = 'intervalGrid';

    restrict = 'E';
    require = '^weeklyScheduler';

    private doGrid(scope, element, attrs, model) {
        var i;
        // Calculate interval width distribution
        var tickcount = model.nbIntervals;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});

        // Clean element
        element.empty();
  
        for (i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          element.append(child);
        }
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.doGrid(scope, element, attrs, schedulerCtrl.config);
        }

        schedulerCtrl.$modelChangeListeners.push((newModel) => {
            this.doGrid(scope, element, attrs, newModel);
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
