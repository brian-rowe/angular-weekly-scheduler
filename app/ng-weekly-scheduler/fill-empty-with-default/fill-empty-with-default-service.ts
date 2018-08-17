/** When using the 'fillEmptyWithDefault' option, this service will be used to construct the correct calendar for server submission */
/** @internal */
class FillEmptyWithDefaultService {
    static $name = 'brWeeklySchedulerFillEmptyWithDefaultService';

    static $inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    fill(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>): br.weeklyScheduler.IWeeklySchedulerRange<any>[] {
        if (schedules.length === 1) {
            let schedule = schedules[0];
            return [schedule, this.getEndSchedule(schedule, config)];
        }

        let len = schedules.length - 1;
        
        let newSchedules = [];
        
        // 2 at a time
        for (let i = 0; i < len; i++) {
            let currentSchedule = schedules[i];
            let nextSchedule = schedules[i + 1];

            if (currentSchedule.end !== nextSchedule.start) {
                let newSchedule = {
                    day: currentSchedule.day,
                    start: currentSchedule.end,
                    end: nextSchedule.start,
                    value: config.defaultValue
                }

                newSchedules.push(currentSchedule);
                newSchedules.push(newSchedule);
                newSchedules.push(nextSchedule);
            } else {
                newSchedules.push(currentSchedule);
                newSchedules.push(nextSchedule);
            }

            let isLastLoop = i == len - 1;

            if (isLastLoop && nextSchedule.end !== config.maxTimeSlot) {
                let endSchedule = this.getEndSchedule(nextSchedule, config);

                newSchedules.push(endSchedule);
            }
        }

        return newSchedules;
    }

    private getEndSchedule(lastSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: lastSchedule.day,
            start: lastSchedule.end,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        }
    }
}

angular
    .module('br.weeklyScheduler')
    .service(FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService);
