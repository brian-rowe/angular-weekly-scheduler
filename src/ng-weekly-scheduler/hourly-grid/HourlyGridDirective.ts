import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { TimeConstantsService } from '../time/TimeConstantsService';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { HourTextService } from '../hour-text/HourTextService';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';

/** @internal */
export class HourlyGridDirective implements angular.IDirective {
    static $name = 'brHourlyGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

    private config: IWeeklySchedulerConfig<any>;
    private tickCount: number;

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
                       this.intervalGenerationService.createIntervalGenerationStrategy({
                           cssDimensionProperty: 'width',
                           interval: this.config.interval,
                           intervalsInTick: this.timeConstants.SECONDS_IN_HOUR / this.config.interval,
                           getRel: (options, tick, subtick) => {
                               return ((tick * options.intervalsInTick) + subtick) * options.interval;
                           }
                       });

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

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.config = schedulerCtrl.config;
            this.tickCount = schedulerCtrl.config.hourCount;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private timeConstants: TimeConstantsService,
        private gridGeneratorService: GridGeneratorService,
        private hourTextService: HourTextService,
        private intervalGenerationService: IntervalGenerationService
    ) {
    }

    static Factory() {
        let directive = (timeConstants, gridGeneratorService, hourTextService, intervalGenerationService) =>{
            return new HourlyGridDirective(timeConstants, gridGeneratorService, hourTextService, intervalGenerationService);
        }

        directive.$inject = [
            TimeConstantsService.$name,
            GridGeneratorService.$name,
            HourTextService.$name,
            IntervalGenerationService.$name
        ];

        return directive;
    }
}
