import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { IntervalGenerationOptions } from './IntervalGenerationOptions';

/**
 * Elements for the background structure of the scheduler
 * are generated as static html rather than as angular elements
 * for performance -- we don't want (SECONDS_IN_DAY / interval) watchers for every calendar
 */

export class IntervalGenerationService {
    static $name = 'rrWeeklySchedulerIntervalGenerationService';

    static $inject = [
        GridGeneratorService.$name,
    ];

    constructor(
        private gridGeneratorService: GridGeneratorService,
    ) {
    }

    public createIntervalGenerationStrategy(options: IntervalGenerationOptions) {
        let intervalPercentage = 100 / options.intervalsInTick;

        return (child, i) => {
            for (let j = 0; j < options.intervalsInTick; j++) {
                let grandChild = this.gridGeneratorService.getGridTemplate();
                grandChild.attr('rel', options.getRel(options, i, j));
                grandChild.addClass('interval');
                grandChild.css('width', intervalPercentage + '%');
                child.append(grandChild);
            }

            return child;
        };
    }
}