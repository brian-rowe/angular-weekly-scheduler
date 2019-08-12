import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalPixelToValProvider } from './HorizontalPixelToValProvider';
import { VerticalPixelToValProvider } from './VerticalPixelToValProvider';
export declare class PixelToValProviderFactory {
    static $name: string;
    getPixelToValProvider(config: IWeeklySchedulerConfig<any>): HorizontalPixelToValProvider | VerticalPixelToValProvider;
}
