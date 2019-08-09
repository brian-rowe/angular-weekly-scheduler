import * as angular from 'angular';
import { VerticalHandleProvider } from './VerticalHandleProvider';
import { HandleProviderFactory } from './HandleProviderFactory';

/** @internal */
export class HandleDirective implements angular.IDirective {
  static $name = 'brHandle';
  restrict = 'A';

  scope = {
    config: '<',
    ondrag: '&',
    ondragstop: '&',
    ondragstart: '&',
    immediate: '<'
  };

  link = (scope, element: angular.IAugmentedJQuery) => {
    var $document = this.$document;
    var provider = this.handleProviderFactory.getHandleProvider(scope.config);
    var position = 0;

    let mousedownEvent: string = 'mousedown touchstart';
    let mousemoveEvent: string = 'mousemove touchmove';
    let mouseupEvent: string = 'mouseup touchend';

    element.on(mousedownEvent, mousedown);

    function mousedown(event) {
      position = provider.getPositionFromEvent(event);

      // Prevent default dragging of selected content
      event.preventDefault();

      // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
      event.stopPropagation();

      startDrag();
    }

    function fakeMousedown() {
      position = provider.getCursorPosition();

      startDrag();
    }

    function mousemove(event) {
      let current = provider.getPositionFromEvent(event);
      var delta = current - position;

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
    private handleProviderFactory: HandleProviderFactory
  ) {
  }

  static Factory() {
    let directive = ($document, handleProviderFactory) => new HandleDirective($document, handleProviderFactory);

    directive.$inject = ['$document', HandleProviderFactory.$name];

    return directive;
  }
}
