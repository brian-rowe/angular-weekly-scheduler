/** @internal */
interface IWeeklySchedulerFilterService extends angular.IFilterService {
    (name: 'brWeeklySchedulerMinutesAsText'): (minutes: number) => string
}
