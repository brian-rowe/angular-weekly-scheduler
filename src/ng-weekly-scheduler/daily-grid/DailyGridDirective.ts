import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { IntervalGenerationService } from '../interval-generation/IntervalGenerationService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';

/** @internal */
export class DailyGridDirective implements angular.IDirective {
    static $name = 'brDailyGrid';

    restrict = 'E';
    require = '^brWeeklyScheduler';

    private config: IWeeklySchedulerConfig<any>;
    private tickCount: number;

    private doGrid(scope, element, attrs) {
        var strategy = this.intevalGenerationService.createIntervalGenerationStrategy(this.config, {
            cssDimensionProperty: 'height'
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
    ) {
    }

    static Factory() {
        let directive = (gridGeneratorService, intervalGenerationService) => new DailyGridDirective(gridGeneratorService, intervalGenerationService);

        directive.$inject = [GridGeneratorService.$name, IntervalGenerationService.$name];

        return directive;
    }
}
