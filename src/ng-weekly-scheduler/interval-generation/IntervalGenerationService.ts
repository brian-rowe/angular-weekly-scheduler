import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { TimeConstantsService } from '../time/TimeConstantsService';

/**
 * Elements for the background structure of the scheduler
 * are generated as static html rather than as angular elements
 * for performance -- we don't want (SECONDS_IN_DAY / interval) watchers for every calendar
 */

export class IntervalGenerationService {
    static $name = 'rrWeeklySchedulerIntervalGenerationService';

    static $inject = [
        GridGeneratorService.$name,
        TimeConstantsService.$name
    ];

    constructor(
        private gridGeneratorService: GridGeneratorService,
        private timeConstants: TimeConstantsService
    ) {
    }

    public createIntervalGenerationStrategy(config: IWeeklySchedulerConfig<any>) {
        let interval = config.interval;
        let intervalsInTick = this.timeConstants.SECONDS_IN_HOUR / interval;
        let intervalPercentage = 100 / intervalsInTick;

        return (child, i) => {
            for (let j = 0; j < intervalsInTick; j++) {
                let grandChild = this.gridGeneratorService.getGridTemplate();
                grandChild.attr('rel', ((i * intervalsInTick) + j) * interval);
                grandChild.addClass('interval');
                grandChild.css('width', intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };
    }
}