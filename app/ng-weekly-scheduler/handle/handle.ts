class HandleDirective implements angular.IDirective {
  static $name = 'handle';
  restrict = 'A';

  scope = {
    ondrag: '=',
    ondragstop: '=',
    ondragstart: '='
  };

  link = (scope, element: angular.IAugmentedJQuery) => {
    var $document = this.$document;
    var x = 0;
    
    element.on('mousedown', (event) => {
      // Prevent default dragging of selected content
      event.preventDefault();

      x = event.pageX;

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);

      if (scope.ondragstart) {
        scope.ondragstart();
      }
    });

    function mousemove(event) {
      var delta = event.pageX - x;
      if (scope.ondrag) {
        scope.ondrag(delta);
      }
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);

      if (scope.ondragstop) {
        scope.ondragstop();
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
