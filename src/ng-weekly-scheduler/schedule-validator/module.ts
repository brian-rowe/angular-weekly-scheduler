import * as angular from 'angular';
import { FullCalendarValidatorService } from './FullCalendarValidatorService';
import { MaxTimeSlotValidatorService } from './MaxTimeSlotValidatorService';
import { MinimumSeparationValidatorService } from './MinimumSeparationValidatorService';
import { MonoScheduleValidatorService } from './MonoScheduleValidatorService';
import { NullEndScheduleValidatorService } from './NullEndValidatorService';
import { OverlapValidatorService } from './OverlapValidatorService';
import { ScheduleCountValidatorService } from './ScheduleCountValidatorService';

export default angular
    .module('rr.weeklyScheduler.scheduleValidation', [])
    .service(FullCalendarValidatorService.$name, FullCalendarValidatorService)
    .service(MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService)
    .service(MinimumSeparationValidatorService.$name, MinimumSeparationValidatorService)
    .service(MonoScheduleValidatorService.$name, MonoScheduleValidatorService)
    .service(NullEndScheduleValidatorService.$name, NullEndScheduleValidatorService)
    .service(OverlapValidatorService.$name, OverlapValidatorService)
    .service(ScheduleCountValidatorService.$name, ScheduleCountValidatorService)
    .name;
