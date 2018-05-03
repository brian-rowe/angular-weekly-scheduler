class TotalHoursServiceProvider implements angular.IServiceProvider {
    static $name: string = 'totalHoursService';

    private totalHours: number = 24;

    public setTotalHours(newVal: number) {
        this.totalHours = newVal;
    }

    public $get(): TotalHoursService {
        return {
            totalHours: this.totalHours
        }
    }
}

angular
    .module('weeklyScheduler')
    .provider(TotalHoursServiceProvider.$name, TotalHoursServiceProvider);