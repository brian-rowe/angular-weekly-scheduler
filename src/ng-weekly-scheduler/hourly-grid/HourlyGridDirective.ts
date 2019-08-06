import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { Cipher } from "crypto";

/** @internal */
export class HourlyGridDirective implements angular.IDirective {
    static $name = 'brHourlyGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

    private GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
    
    private tickCount: number;
    private interval: number;
    private intervalsInTick: number;
    private intervalPercentage: number;

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

    private generateHourText(hour: number) {
        let currentHour = hour % 12;
        let meridiem = hour >= 12 ? 'p' : 'a';

        return `${currentHour || '12'}${meridiem}`;
    }

    private doGrid(scope, element, attrs) {
        // Clean element
        element.empty();

        // Stripe it by hour
        element.addClass('striped');

        var hourStrategy = (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let hourText = this.generateHourText(i);
            child.text(hourText);
            return child;
        };

        var intervalStrategy = (child, i) => {
            for (let j = 0; j < this.intervalsInTick; j++) {
                let grandChild = this.GRID_TEMPLATE.clone();
                grandChild.attr('rel', ((i * this.intervalsInTick) + j) * this.interval);
                grandChild.addClass('interval');
                grandChild.css('width', this.intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };

        var strategy = angular.isUndefined(attrs.noText) ? hourStrategy : intervalStrategy;
        this.generateGrid(element, strategy);
    }

    private generateGrid(element: JQLite, itemStrategy: (child: JQLite, iteration: number) => JQLite) {
        for (let i = 0; i < this.tickCount; i++) {
            var child = this.GRID_TEMPLATE.clone();
  
            child = this.generateGridItem(i, itemStrategy);
  
            element.append(child);
        }

        return element;
    }

    private generateGridItem(iteration: number, strategy: (child: JQLite, iteration: number) => JQLite): JQLite {
        var child = this.GRID_TEMPLATE.clone();

        return strategy(child, iteration);
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.tickCount = schedulerCtrl.config.hourCount;
            this.interval = schedulerCtrl.config.interval;
            this.intervalsInTick = this.timeConstants.SECONDS_IN_HOUR / this.interval;
            this.intervalPercentage = 100 / this.intervalsInTick;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private timeConstants: TimeConstantsService
    ) {
    }

    static Factory() {
        let directive = (timeConstants) => new HourlyGridDirective(timeConstants);

        directive.$inject = ['brWeeklySchedulerTimeConstantsService'];

        return directive;
    }
}
