import * as angular from 'angular';
import 'angular-mocks';
import DemoModule from '../src/ng-weekly-scheduler/demo/module';

import { DemoTests } from './spec/demo_test';
import { FillEmptyWithDefaultServiceTests } from './spec/fill_empty_with_default_service_test';
import { FullCalendarValidatorServiceTests } from './spec/full_calendar_validator_service_test';
import { LastGhostDayServiceTests } from './spec/last_ghost_day_service_test';
import { MaxTimeSlotValidatorServiceTests } from './spec/max_time_slot_validator_service_test';
import { MinimumSeparationValidatorServiceTests } from './spec/minimum_separation_validator_service_test';

class TestModule {
    static run() {
        beforeEach(angular.mock.module(DemoModule));

        var tests = [
            DemoTests,
            FillEmptyWithDefaultServiceTests,
            FullCalendarValidatorServiceTests,
            LastGhostDayServiceTests,
            MaxTimeSlotValidatorServiceTests,
            MinimumSeparationValidatorServiceTests
        ];

        tests.forEach(test => test.run());
    }
}

TestModule.run();
