import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ValidatorService } from '../schedule-validator/ValidatorService';
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';

/** @internal */
export class MaxTimeSlotValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerMaxTimeSlotValidatorService';

    static $inject = [EndAdjusterService.$name];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    get error() {
        return ValidationError.MaxTimeSlot;
    }

    public validate(schedules: IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        let maxTimeSlot = config.maxTimeSlot;

        if (!maxTimeSlot) {
            return true;
        }

        return !schedules.some(s => s.value !== config.defaultValue && this.endAdjusterService.adjustEndForView(config, s.end) - s.start > maxTimeSlot);
    }
}
