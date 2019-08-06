import { TimeConstantsService } from './TimeConstantsService';
/** @internal */
export declare class TimeOfDayFilter {
    static $name: string;
    static Factory(): (timeConstants: TimeConstantsService) => (seconds: number) => string;
}
