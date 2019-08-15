import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalElementOffsetProvider } from './HorizontalElementOffsetProvider';
import { VerticalElementOffsetProvider } from './VerticalElementOffsetProvider';
import { IElementOffsetProvider } from './IElementOffsetProvider';

export class ElementOffsetProviderFactory {
    static $name = 'rrWeeklySchedulerElementOffsetProvider';

    getElementOffsetProvider(config: IWeeklySchedulerConfig<any>): IElementOffsetProvider {
        if (config.orientation === 'horizontal') {
            return new HorizontalElementOffsetProvider();
        } else {
            return new VerticalElementOffsetProvider();
        }
    }
}
