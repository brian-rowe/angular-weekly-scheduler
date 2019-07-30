import * as angular from 'angular';
import 'angular-mocks';
import DemoModule from '../src/ng-weekly-scheduler/demo/module';

import { FillEmptyWithDefaultServiceTests } from './spec/fill_empty_with_default_service_test';

class TestModule {
    static run() {
        beforeEach(angular.mock.module(DemoModule));

        FillEmptyWithDefaultServiceTests.run();
    }
}

TestModule.run();
