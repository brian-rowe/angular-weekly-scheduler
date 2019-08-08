import { GridGeneratorService } from '../grid-generator/GridGeneratorService';
import { IntervalGenerationOptions } from './IntervalGenerationOptions';
/**
 * Elements for the background structure of the scheduler
 * are generated as static html rather than as angular elements
 * for performance -- we don't want (SECONDS_IN_DAY / interval) watchers for every calendar
 */
export declare class IntervalGenerationService {
    private gridGeneratorService;
    static $name: string;
    static $inject: string[];
    constructor(gridGeneratorService: GridGeneratorService);
    createIntervalGenerationStrategy(options: IntervalGenerationOptions): (child: any, i: any) => any;
}
