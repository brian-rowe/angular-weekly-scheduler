class HourlyGridDirective implements angular.IDirective {
    static $name = 'hourlyGrid';

    restrict = 'E';
    require = '^weeklyScheduler';

    private handleClickEvent(child, nbHours, idx, scope) {
        child.bind('click', function () {
          scope.$broadcast(CLICK_ON_A_CELL, {
            nbElements: nbHours,
            idx: idx
          });
        });
    }

    private doGrid(scope, element, attrs, model) {
        var i;
        // Calculate hour width distribution
        var tickcount = model.nbHours;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});
  
        // Clean element
        element.empty();
  
        for (i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          if (angular.isUndefined(attrs.noText)) {
            this.handleClickEvent(child, tickcount, i, scope);

            let currentHour = i % 12;
            let meridiem = i >= 12 ? 'pm' : 'am';

            child.text(`${currentHour || '12'}${meridiem}`);
          }

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
        let directive = () => new HourlyGridDirective();

        return directive;
    }
}

angular
    .module('weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
