class InjectDirective implements angular.IDirective {
  static $name = 'inject';

  link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, controller, $transclude: angular.ITranscludeFunction) => {
    if (!$transclude) {
      throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
    }

    var innerScope = $scope.$new();

    $transclude(innerScope, function (clone) {
      $element.empty();
      $element.append(clone);
      $element.on('$destroy', function () {
        innerScope.$destroy();
      });
    });
  }

  static Factory() {
    let directive = () => new InjectDirective();
    
    return directive;
  }
}

angular
  .module('weeklyScheduler')
  .directive(InjectDirective.$name, InjectDirective.Factory());
