import * as angular from 'angular';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';

/** @internal */
export class HandleDirective implements angular.IDirective {
  static $name = 'brHandle';
  restrict = 'A';

  scope = {
    ondrag: '&',
    ondragstop: '&',
    ondragstart: '&',
    immediate: '<'
  };

  link = (scope, element: angular.IAugmentedJQuery) => {
    var $document = this.$document;
    var mouseTrackerService = this.mouseTrackerService;
    var touchService = this.touchService;
    var x = 0;

    let mousedownEvent: string = 'mousedown touchstart';
    let mousemoveEvent: string = 'mousemove touchmove';
    let mouseupEvent: string = 'mouseup touchend';

    element.on(mousedownEvent, mousedown);

    function mousedown(event) {
      x = getPageX(event);

      // Prevent default dragging of selected content
      event.preventDefault();

      // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
      event.stopPropagation();

      startDrag();
    }

    function fakeMousedown() {
      x = mouseTrackerService.getMousePosition().x;

      startDrag();
    }

    function getPageX(event) {
      return event.pageX || touchService.getPageX(event);
    }

    function mousemove(event) {
      let pageX = getPageX(event);
      var delta = pageX - x;

      if (angular.isFunction(scope.ondrag)) {
        scope.$apply(scope.ondrag({ delta: delta }));
      }
    }

    function mouseup() {
      $document.unbind(mousemoveEvent, mousemove);
      $document.unbind(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstop)) {
        scope.$apply(scope.ondragstop());
      }
    }

    function startDrag() {
      $document.on(mousemoveEvent, mousemove);
      $document.on(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstart)) {
        scope.$applyAsync(scope.ondragstart());
      }
    }

    if (scope.immediate) {
      fakeMousedown();
    }
  }

  constructor(
    private $document: angular.IDocumentService,
    private mouseTrackerService: MouseTrackerService,
    private touchService: TouchService
  ) {
  }

  static Factory() {
    let directive = ($document, mouseTrackerService, touchService) => new HandleDirective($document, mouseTrackerService, touchService);

    directive.$inject = ['$document', 'brWeeklySchedulerMouseTrackerService', 'brWeeklySchedulerTouchService'];

    return directive;
  }
}
