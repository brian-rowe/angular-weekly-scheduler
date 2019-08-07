import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { DayMap } from '../../../src/ng-weekly-scheduler/weekly-scheduler-config/DayMap';

/** @internal */
export class DailyGridDirective implements angular.IDirective {
    static $name = 'brDailyGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

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

    private generateDayText(day: number) {
        return DayMap.value[day];
    }

    private doGrid(scope, element, attrs) {
        // Stripe it by hour
        element.addClass('striped');

        var dayStrategy = (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let dayText = this.generateDayText(i);
            child.text(dayText);
            return child;
        };

        var intervalStrategy = (child, i) => {
            for (let j = 0; j < this.intervalsInTick; j++) {
                let grandChild = this.gridGeneratorService.getGridTemplate();
                grandChild.attr('rel', ((i * this.intervalsInTick) + j) * this.interval);
                grandChild.addClass('interval');
                grandChild.css('width', this.intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };

        var strategy = angular.isUndefined(attrs.noText) ? dayStrategy : intervalStrategy;
        this.gridGeneratorService.generateGrid(element, this.tickCount, strategy);
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.tickCount = 7;
            this.interval = 1;
            this.intervalsInTick = 1;
            this.intervalPercentage = 100;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private timeConstants: TimeConstantsService,
        private gridGeneratorService: GridGeneratorService
    ) {
    }

    static Factory() {
        let directive = (timeConstants, gridGeneratorService) => new DailyGridDirective(timeConstants, gridGeneratorService);

        directive.$inject = ['brWeeklySchedulerTimeConstantsService', 'rrWeeklySchedulerGridGeneratorService'];

        return directive;
    }
}
