import * as angular from 'angular';

import { FillEmptyWithDefaultServiceTests } from './spec/fill_empty_with_default_service_test';

class TestModule {
    static run() {
        FillEmptyWithDefaultServiceTests.run();
    }
}

TestModule.run();
