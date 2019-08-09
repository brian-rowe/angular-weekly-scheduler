import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalHandleProvider } from './HorizontalHandleProvider';
import { VerticalHandleProvider } from './VerticalHandleProvider';

export class HandleProviderFactory {
    static $name = 'rrWeeklySchedulerHandleProviderFactory';

    static $inject = [
        MouseTrackerService.$name,
        TouchService.$name
    ];

    constructor(
        private mouseTrackerService: MouseTrackerService,
        private touchService: TouchService
    ) {
    }

    public getHandleProvider(config: IWeeklySchedulerConfig<any>) {
        if (config.orientation === 'horizontal') {
            return new HorizontalHandleProvider(this.mouseTrackerService, this.touchService);
        } else {
            return new VerticalHandleProvider(this.mouseTrackerService, this.touchService);
        }
    };
}
