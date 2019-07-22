import * as angular from 'angular';
import { SecondsAsTextFilter } from './SecondsAsTextFilter';
import { TimeConstantsService } from './TimeConstantsService';
import { TimeOfDayFilter } from './TimeOfDayFilter';

export default angular
    .module('rr.weeklyScheduler.time', [])
    .filter(SecondsAsTextFilter.$name, SecondsAsTextFilter.Factory()) 
    .filter(TimeOfDayFilter.$name, TimeOfDayFilter.Factory())
    .service(TimeConstantsService.$name, TimeConstantsService)
    .name;
