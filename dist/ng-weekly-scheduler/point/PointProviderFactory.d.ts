import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IPointProvider } from './IPointProvider';
export declare class PointProviderFactory {
    static $name: string;
    getPointProvider(config: IWeeklySchedulerConfig<any>): IPointProvider;
}
