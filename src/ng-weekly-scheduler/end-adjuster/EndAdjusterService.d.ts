import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
/** @internal */
export declare class EndAdjusterService {
    static $name: string;
    adjustEndForModel(config: IWeeklySchedulerConfig<any>, end: number): number;
    adjustEndForView(config: IWeeklySchedulerConfig<any>, end: number): number;
}
