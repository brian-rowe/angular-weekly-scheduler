import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from "../grid-generator/GridGeneratorService";

/** @internal */
export class HourlyGridDirective implements angular.IDirective {
    static $name = 'brHourlyGrid';

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
                let grandChild = this.gridGeneratorService.getGridTemplate();
                grandChild.attr('rel', ((i * this.intervalsInTick) + j) * this.interval);
                grandChild.addClass('interval');
                grandChild.css('width', this.intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };

        var strategy = angular.isUndefined(attrs.noText) ? hourStrategy : intervalStrategy;
        this.gridGeneratorService.generateGrid(element, this.tickCount, strategy);
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
        private timeConstants: TimeConstantsService,
        private gridGeneratorService: GridGeneratorService
    ) {
    }

    static Factory() {
        let directive = (timeConstants, gridGeneratorService) => new HourlyGridDirective(timeConstants, gridGeneratorService);

        directive.$inject = ['brWeeklySchedulerTimeConstantsService', 'rrWeeklySchedulerGridGeneratorService'];

        return directive;
    }
}
