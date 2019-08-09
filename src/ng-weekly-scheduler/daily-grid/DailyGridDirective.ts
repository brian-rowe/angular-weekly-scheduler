import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
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

    private doGrid(scope, element, attrs) {
        var strategy = this.intevalGenerationService.createIntervalGenerationStrategy({
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

    link = (scope, element, attrs, schedulerCtrl: WeeklySchedulerController) => {
        if (schedulerCtrl.config) {
            this.config = schedulerCtrl.config;
            this.tickCount = this.config.hourCount;
            this.doGrid(scope, element, attrs);
        }
    }

    constructor(
        private gridGeneratorService: GridGeneratorService,
        private intevalGenerationService: IntervalGenerationService,
        private timeConstants: TimeConstantsService
    ) {
    }

    static Factory() {
        let directive = (gridGeneratorService, intervalGenerationService, timeConstants) => new DailyGridDirective(gridGeneratorService, intervalGenerationService, timeConstants);

        directive.$inject = [GridGeneratorService.$name, IntervalGenerationService.$name, TimeConstantsService.$name];

        return directive;
    }
}
