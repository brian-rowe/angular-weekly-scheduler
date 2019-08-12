import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IElementOffsetProvider } from './IElementOffsetProvider';
export declare class ElementOffsetProviderFactory {
    static $name: string;
    getElementOffsetProvider(config: IWeeklySchedulerConfig<any>): IElementOffsetProvider;
}
