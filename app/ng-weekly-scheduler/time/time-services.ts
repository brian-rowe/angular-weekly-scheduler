class WeeklySchedulerTimeService {
  static $name = 'weeklySchedulerTimeService';

  private WEEK = 'week';

  public addHour(moment, nbHour) {
    return moment.clone().add(nbHour, 'hour');
  }

  public addWeek(moment, nbWeek) {
    return moment.clone().add(nbWeek, this.WEEK);
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

  public weekPreciseDiff(start, end) {
    return end.clone().diff(start.clone(), this.WEEK, true);
  }
}

angular.module('weeklyScheduler')
  .service(WeeklySchedulerTimeService.$name, WeeklySchedulerTimeService);
