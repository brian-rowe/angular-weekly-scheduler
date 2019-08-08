import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { WeeklySchedulerEvents } from '../weekly-scheduler-config/WeeklySchedulerEvents';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { DayMap } from '../weekly-scheduler-config/DayMap';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { TimeConstantsService } from '../time/TimeConstantsService';

/** @internal */
export class DailyGridDirective implements angular.IDirective {
    static $name = 'brDailyGrid';

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

    private generateDayText(day: number) {
        return this.dayMap[day];
    }

    private doGrid(scope, element, attrs) {
        // Stripe it by hour
        element.addClass('striped');

        var strategy = angular.isUndefined(attrs.noText) ?
            this.createDayGenerationStrategy(scope) :
            this.intevalGenerationService.createIntervalGenerationStrategy({
                cssDimensionProperty: 'height',
                interval: 1,
                intervalsInTick: this.timeConstants.SECONDS_IN_HOUR / this.config.interval,
                getRel: (options, tick, subtick) => {
                    if (scope.item) {
                        var baseRel = ((scope.item.index * this.config.interval) + subtick) * this.config.interval;
                        return baseRel;
                    }

                    return -1;
                }
            });

        this.gridGeneratorService.generateGrid(element, this.tickCount, strategy);
    }

    private createDayGenerationStrategy(scope) {
        return (child, i) => {
            this.handleClickEvent(child, this.tickCount, i, scope);
            let dayText = this.generateDayText(i);
            child.text(dayText);
            return child;
        };
    }

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.config = schedulerCtrl.config;
            this.tickCount = 7;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private dayMap: DayMap,
        private gridGeneratorService: GridGeneratorService,
        private intevalGenerationService: IntervalGenerationService,
        private timeConstants: TimeConstantsService
    ) {
    }

    static Factory() {
        let directive = (dayMap, gridGeneratorService, intervalGenerationService, timeConstants) => new DailyGridDirective(dayMap, gridGeneratorService, intervalGenerationService, timeConstants);

        directive.$inject = [DayMap.$name, GridGeneratorService.$name, IntervalGenerationService.$name, TimeConstantsService.$name];

        return directive;
    }
}
