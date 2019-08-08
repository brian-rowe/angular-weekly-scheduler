import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from "../hour-text/HourTextService";

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

    private doGrid(scope, element, attrs) {
        // Stripe it by hour
        element.addClass('striped');

        var strategy = angular.isUndefined(attrs.noText) ?
                       this.createHourGenerationStrategy(scope) :
                       this.createIntervalGenerationStrategy();

        this.gridGeneratorService.generateGrid(element, this.tickCount, strategy);
    }

    private createHourGenerationStrategy(scope) {
        return (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let hourText = this.hourTextService.generateHourText(i);
            child.text(hourText);
            return child;
        };
    }

    private createIntervalGenerationStrategy() {
        return (child, i) => {
            for (let j = 0; j < this.intervalsInTick; j++) {
                let grandChild = this.gridGeneratorService.getGridTemplate();
                grandChild.attr('rel', ((i * this.intervalsInTick) + j) * this.interval);
                grandChild.addClass('interval');
                grandChild.css('width', this.intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };
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
        private gridGeneratorService: GridGeneratorService,
        private hourTextService: HourTextService
    ) {
    }

    static Factory() {
        let directive = (timeConstants, gridGeneratorService, hourTextService) => new HourlyGridDirective(timeConstants, gridGeneratorService, hourTextService);

        directive.$inject = [TimeConstantsService.$name, GridGeneratorService.$name, HourTextService.$name];

        return directive;
    }
}
