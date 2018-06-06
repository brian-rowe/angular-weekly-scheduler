/** @internal */
class HandleDirective implements angular.IDirective {
  static $name = 'brHandle';
  restrict = 'A';

  scope = {
    ondrag: '&',
    ondragstop: '&',
    ondragstart: '&'
  };

  link = (scope, element: angular.IAugmentedJQuery) => {
    var $document = this.$document;
    var x = 0;

    let mousedownEvent: string = 'mousedown touchstart';
    let mousemoveEvent: string = 'mousemove touchmove';
    let mouseupEvent: string = 'mouseup touchend';

    element.on(mousedownEvent, (event) => {
      x = getPageX(event);

      // Prevent default dragging of selected content
      event.preventDefault();


      $document.on(mousemoveEvent, mousemove);
      $document.on(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstart)) {
        scope.$apply(scope.ondragstart({ event: event }));
      }
    });

    function getPageX(event) {
      return event.pageX || getTouches(event)[0].pageX;
    }

    function getTouches(event: any): any { // todo
      if (event.originalEvent) {
        if (event.originalEvent.touches && event.originalEvent.touches.length) {
          return event.originalEvent.touches;
        } else if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
          return event.originalEvent.changedTouches;
        }
      }
  
      if (!event.touches) {
        event.touches = [event.originalEvent];
      }
  
      return event.touches;
    }

    function mousemove(event) {
      let pageX = getPageX(event);
      var delta = pageX - x;

      if (angular.isFunction(scope.ondrag)) {
        scope.$apply(scope.ondrag({ delta: delta, event: event }));
      }
    }

    function mouseup() {
      $document.unbind(mousemoveEvent, mousemove);
      $document.unbind(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstop)) {
        scope.$apply(scope.ondragstop());
      }
    }
  }

  constructor(
    private $document: angular.IDocumentService
  ) {
  }

  static Factory() {
    let directive = ($document) => new HandleDirective($document);

    directive.$inject = ['$document'];

    return directive;
  }
}

angular.module('br.weeklyScheduler')
  .directive(HandleDirective.$name, HandleDirective.Factory());
