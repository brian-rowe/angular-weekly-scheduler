/** @internal */
class HourlyGridDirective implements angular.IDirective {
    static $name = 'hourlyGrid';

    restrict = 'E';
    require = '^weeklyScheduler';

    private handleClickEvent(child, hourCount, idx, scope) {
        child.bind('click', function () {
          scope.$emit(WeeklySchedulerEvents.CLICK_ON_A_CELL, {
            nbElements: hourCount,
            idx: idx
          });
        });
    }

    private doGrid(scope, element, attrs, config: IWeeklySchedulerConfig) {
        var i;
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = GRID_TEMPLATE.clone();
  
        // Clean element
        element.empty();

        for (i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          if (angular.isUndefined(attrs.noText)) {
            this.handleClickEvent(child, tickcount, i, scope);

            let currentHour = i % 12;
            let meridiem = i >= 12 ? 'p' : 'a';

            child.text(`${currentHour || '12'}${meridiem}`);
          } else {
            // no-text ones will get striped intervals
            child.addClass('striped');
            
            let numIntervalsInTick = 60 / config.interval;
            let intervalPercentage = 100 / numIntervalsInTick;

            for (let j = 0; j < numIntervalsInTick; j++) {
                let grandChild = GRID_TEMPLATE.clone();
                grandChild.attr('rel', ((i * numIntervalsInTick) + j) * config.interval);
                grandChild.addClass('interval');
                grandChild.css('width', intervalPercentage + '%');
                child.append(grandChild);
            }
          }

          element.append(child);
        }
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
        let directive = () => new HourlyGridDirective();

        return directive;
    }
}

angular
    .module('weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
