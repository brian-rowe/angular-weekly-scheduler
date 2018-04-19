class WeeklySchedulerTimeService {
  static $name = 'weeklySchedulerTimeService';

  public addHour(moment, nbHour) {
    return moment.clone().add(nbHour, 'hour');
  }
}

angular.module('weeklyScheduler')
  .service(WeeklySchedulerTimeService.$name, WeeklySchedulerTimeService);
