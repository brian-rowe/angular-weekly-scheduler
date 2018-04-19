class WeeklySchedulerTimeService {
  static $name = 'weeklySchedulerTimeService';

  private WEEK = 'week';
  private HOUR = 'hour';

  public addHour(moment, nbHour) {
    return moment.clone().add(nbHour, 'hour');
  }

  public compare(date, method, lastMin) {
    if (date) {
      var dateAsMoment;
      if (angular.isDate(date)) {
        dateAsMoment = moment(date);
      } else if (date._isAMomentObject) {
        dateAsMoment = date;
      } else {
        throw 'Could not parse date [' + date + ']';
      }
      return dateAsMoment[method](lastMin) ? dateAsMoment : lastMin;
    }
  }

  public hourPreciseDiff(start, end) {
    return end.clone().diff(start.clone(), this.HOUR, true);
  }
}

angular.module('weeklyScheduler')
  .service(WeeklySchedulerTimeService.$name, WeeklySchedulerTimeService);
