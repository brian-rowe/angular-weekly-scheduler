import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalPointProvider } from './HorizontalPointProvider';
import { VerticalPointProvider } from './VerticalPointProvider';
import { IPointProvider } from './IPointProvider';

export class PointProviderFactory {
    static $name = 'rrWeeklySchedulerPointProviderFactory';

    getPointProvider(config: IWeeklySchedulerConfig<any>): IPointProvider {
        if (config.orientation === 'horizontal') {
            return new HorizontalPointProvider();
        } else {
            return new VerticalPointProvider();
        }
    }
}
