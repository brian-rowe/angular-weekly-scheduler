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

    fill(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>): br.weeklyScheduler.IWeeklySchedulerRange<any>[] {
        let schedules = item.schedules;

        if (!schedules.length) {
            return [this.getEmptySchedule(item, config)];
        }

        if (schedules.length === 1) {
            let schedule = schedules[0];
            return [schedule, this.getEndSchedule(schedule, config)];
        }

        return this.getFilledSchedules(schedules, config);
    }

    private getEmptySchedule(item: br.weeklyScheduler.IWeeklySchedulerItem<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: item.day,
            start: 0,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        }
    }

    private getEndSchedule(lastSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: lastSchedule.day,
            start: lastSchedule.end,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        }
    }

    private getFilledSchedules(schedules: br.weeklyScheduler.IWeeklySchedulerRange<any>[], config: IWeeklySchedulerConfig<any>) {
        let len = schedules.length - 1;
        
        let newSchedules = [];
        
        // 2 at a time
        for (let i = 0; i < len; i++) {
            let currentSchedule = schedules[i];
            let nextSchedule = schedules[i + 1];

            if (currentSchedule.end !== nextSchedule.start) {
                let newSchedule = this.getNewSchedule(currentSchedule, nextSchedule, config);

                newSchedules.push(currentSchedule);
                newSchedules.push(newSchedule);
                newSchedules.push(nextSchedule);
            } else {
                newSchedules.push(currentSchedule);
                newSchedules.push(nextSchedule);
            }

            let isLastLoop = i == len - 1;

            if (isLastLoop && nextSchedule.end !== this.endAdjusterService.adjustEndForModel(config, config.maxValue)) {
                let endSchedule = this.getEndSchedule(nextSchedule, config);

                newSchedules.push(endSchedule);
            }
        }

        // remove duplicates
        let result = [];

        for (let schedule of newSchedules) {
            if (result.indexOf(schedule) === -1) {
                result.push(schedule);
            }
        }

        return result; 
    }

    private getNewSchedule(currentSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, nextSchedule: br.weeklyScheduler.IWeeklySchedulerRange<any>, config: IWeeklySchedulerConfig<any>) {
        return {
            day: currentSchedule.day,
            start: currentSchedule.end,
            end: nextSchedule.start,
            value: config.defaultValue
        }
    }
}

angular
    .module('br.weeklyScheduler')
    .service(FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService);
