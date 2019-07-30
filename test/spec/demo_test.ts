export class DemoTests {
  static run() {

    describe('weeklyScheduler module', function () {
      'use strict';

      var scope, createController;

      beforeEach(inject(function ($rootScope, $controller, $timeout) {
        scope = $rootScope.$new();

        createController = function () {
          return $controller('DemoController', {
            '$scope': scope,
            '$timeout': $timeout
          });
        };
      }));

      describe('demo controller', function () {

        it('should be defined', inject(function () {
          //spec body
          var demoController = createController();
          expect(demoController).toBeDefined();
        }));
      });
    });
  }
}
