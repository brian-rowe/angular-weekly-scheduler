import { TimeConstantsService } from './TimeConstantsService';
/** @internal */
export declare class SecondsAsTextFilter {
    static $name: string;
    static Factory(): (timeConstants: TimeConstantsService) => (seconds: number) => string;
    private static addHoursToResult(result, hours);
    private static addMinutesToResult(result, minutes);
    private static addSecondsToResult(result, seconds);
}
