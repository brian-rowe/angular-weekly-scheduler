import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
/** @internal */
export declare class ConfigurationService {
    private timeConstants;
    static $name: string;
    static $inject: string[];
    private constructor();
    getConfiguration(options: IWeeklySchedulerOptions<any>): any;
    private getDefaultOptions();
}
