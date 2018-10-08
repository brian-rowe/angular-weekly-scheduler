class MinimumSeparationValidatorService implements ValidatorService {
    static $name = 'brWeeklySchedulerMinimumSeparationValidatorService';

    get error() {
        return ValidationError.MinimumSeparation;
    }

    public validate(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): boolean {
        if (!config.minimumSeparation) {
            return true;
        }

        const len = schedules.length;

        if (len <= 1) {
            return true;
        }

        const loopLen = len - 1;

        for (let i = 0; i < loopLen; i++) {
            let currentSchedule = schedules[i];
            let nextSchedule = schedules[i + 1];

            if (nextSchedule.start - currentSchedule.end < config.minimumSeparation) {
                return false;
            }
        }

        return true;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(MinimumSeparationValidatorService.$name, MinimumSeparationValidatorService);