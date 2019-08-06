import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { OverlapState } from '../weekly-scheduler-config/OverlapStates';
/** @internal */
export declare class OverlapService {
    private endAdjusterService;
    static $name: string;
    static $inject: string[];
    private constructor();
    getOverlapState(config: IWeeklySchedulerConfig<any>, current: IWeeklySchedulerRange<any>, other: IWeeklySchedulerRange<any>): OverlapState;
}
