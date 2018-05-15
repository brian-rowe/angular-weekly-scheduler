/** @internal */
class HourlyGridDirective implements angular.IDirective {
    static $name = 'brHourlyGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

    private GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');

    private handleClickEvent(child, hourCount, idx, scope) {
        child.bind('click', function () {
            scope.$apply(() => {
                scope.$emit(WeeklySchedulerEvents.CLICK_ON_A_CELL, {
                    nbElements: hourCount,
                    idx: idx
                });
            });
        });
    }

    private doGrid(scope, element, attrs, config: IWeeklySchedulerConfig<any>) {
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = this.GRID_TEMPLATE.clone();
  
        // Clean element
        element.empty();

        // Stripe it by hour
        element.addClass('striped');

        for (let i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();

          if (angular.isUndefined(attrs.noText)) {
            this.handleClickEvent(child, tickcount, i, scope);

            let currentHour = i % 12;
            let meridiem = i >= 12 ? 'p' : 'a';

            child.text(`${currentHour || '12'}${meridiem}`);
          } else {
            let numIntervalsInTick = 60 / config.interval;
            let intervalPercentage = 100 / numIntervalsInTick;

            for (let j = 0; j < numIntervalsInTick; j++) {
                let grandChild = this.GRID_TEMPLATE.clone();
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
    }

    static Factory() {
        let directive = () => new HourlyGridDirective();

        return directive;
    }
}

angular
    .module('br.weeklyScheduler')
    .directive(HourlyGridDirective.$name, HourlyGridDirective.Factory());
