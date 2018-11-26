/** @internal */
class ConfigurationService {
    static $name = 'brWeeklySchedulerConfigurationService';

    static $inject = [
        'brWeeklySchedulerTimeConstantsService'
    ];

    private constructor(
        private timeConstants: TimeConstantsService
    ) {
    }

    public getConfiguration(options: br.weeklyScheduler.IWeeklySchedulerOptions<any>) {
        var interval = options.interval || 900; // seconds
        var intervalCount = this.timeConstants.SECONDS_IN_DAY / interval;

        const defaultOptions = this.getDefaultOptions();

        var userOptions = angular.merge(defaultOptions, options);

        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: this.timeConstants.SECONDS_IN_DAY,
            hourCount: this.timeConstants.HOURS_IN_DAY,
            intervalCount: intervalCount,
        });

        return result;
    }

    private getDefaultOptions(): br.weeklyScheduler.IWeeklySchedulerOptions<any> {
        return {
            createItem: (day, schedules) => { return { day: day, schedules: schedules } },
            monoSchedule: false,
            onChange: () => angular.noop(),
            onRemove: () => angular.noop(),
            restrictionExplanations: {
                maxTimeSlot: (value) => `Max time slot length: ${value}`,
                minimumSeparation: (value) => `Slots must be at least ${value} apart!`,
                fullCalendar: 'For this calendar, every day must be completely full of schedules.',
                monoSchedule: 'This calendar may only have one time slot per day',
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.',
                scheduleCount: (options) => {
                    let pluralizedSlot = 'slot' + (options.count === 1 ? '' : 's');

                    if (options.exact) {
                        return `This calendar must have exactly ${options.count} ${pluralizedSlot} per day`;
                    } else {
                        return `This calendar may only have a maximum of ${options.count} ${pluralizedSlot} per day`;
                    }
                }
            },
            scheduleCountOptions: {
                count: null,
                exact: false
            }
        };
    }
}

angular
    .module('br.weeklyScheduler')
    .service(ConfigurationService.$name, ConfigurationService);
