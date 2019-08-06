import { IWeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
/** @internal */
export declare class AdapterService {
    private groupService;
    private itemFactory;
    static $name: string;
    static $inject: string[];
    private constructor();
    getItemsFromAdapter(config: IWeeklySchedulerConfig<any>, adapter: IWeeklySchedulerAdapter<any, any>): any[];
}
