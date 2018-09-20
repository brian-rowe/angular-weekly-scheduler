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

      $document.on(mousemoveEvent, mousemove);
      $document.on(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstart)) {
        scope.$apply(scope.ondragstart({ event: event }));
      }
    }

    function getPageX(event) {
      return event.pageX || touchService.getPageX(event);
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
    private $document: angular.IDocumentService,
    private touchService: TouchService
  ) {
  }

  static Factory() {
    let directive = ($document, touchService) => new HandleDirective($document, touchService);

    directive.$inject = ['$document', 'brWeeklySchedulerTouchService'];

    return directive;
  }
}

angular.module('br.weeklyScheduler')
  .directive(HandleDirective.$name, HandleDirective.Factory());
