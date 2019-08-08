import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { TimeConstantsService } from '../time/TimeConstantsService';
/**
 * Elements for the background structure of the scheduler
 * are generated as static html rather than as angular elements
 * for performance -- we don't want (SECONDS_IN_DAY / interval) watchers for every calendar
 */
export declare class IntervalGenerationService {
    private gridGeneratorService;
    private timeConstants;
    static $name: string;
    static $inject: string[];
    constructor(gridGeneratorService: GridGeneratorService, timeConstants: TimeConstantsService);
    createIntervalGenerationStrategy(config: IWeeklySchedulerConfig<any>): (child: any, i: any) => any;
}
