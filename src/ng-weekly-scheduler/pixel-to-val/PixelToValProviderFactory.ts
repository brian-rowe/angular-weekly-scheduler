import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalPixelToValProvider } from './HorizontalPixelToValProvider';
import { VerticalPixelToValProvider } from './VerticalPixelToValProvider';

export class PixelToValProviderFactory {
    static $name = 'rrWeeklySchedulerPixelToValProviderFactory';

    getPixelToValProvider(config: IWeeklySchedulerConfig<any>) {
        if (config.orientation === 'horizontal') {
            return new HorizontalPixelToValProvider();
        } else {
            return new VerticalPixelToValProvider();
        }
    }
}
