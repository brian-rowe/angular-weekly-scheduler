/** @internal */
class HandleDirective implements angular.IDirective {
  static $name = 'handle';
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
      // Prevent default dragging of selected content
      event.preventDefault();

      x = event.pageX;

      $document.on(mousemoveEvent, mousemove);
      $document.on(mouseupEvent, mouseup);

      if (angular.isFunction(scope.ondragstart)) {
        scope.$apply(scope.ondragstart());
      }
    });

    function mousemove(event) {
      var delta = event.pageX - x;

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

angular.module('weeklyScheduler')
  .directive(HandleDirective.$name, HandleDirective.Factory());
