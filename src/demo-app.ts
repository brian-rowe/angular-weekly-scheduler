import * as angular from 'angular'
import AppModule from './ng-weekly-scheduler/app/module';
import { DemoController } from './ng-weekly-scheduler/demo/DemoController';

function application() {
  angular.module('demoApp', [AppModule])
    .controller(DemoController.$name, DemoController);

  angular.element(document).ready(() => {
    angular.bootstrap(document, ['demoApp']);
  });
}

application();
