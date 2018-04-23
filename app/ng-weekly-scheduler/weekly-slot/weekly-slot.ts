/** @internal */
class WeeklySlotDirective implements angular.IDirective {
  static $name = 'weeklySlot';

  restrict = 'E';
  require = ['^weeklyScheduler', 'ngModel'];
  templateUrl = 'ng-weekly-scheduler/weekly-slot/weekly-slot.html';

  link = (scope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ctrls) => {
    var schedulerCtrl: WeeklySchedulerController = ctrls[0],
        ngModelCtrl: angular.INgModelController = ctrls[1];

    var conf = schedulerCtrl.config;
    var index = scope.$parent.$index;
    var containerEl = element.parent();
    var resizeDirectionIsStart = true;
    var valuesOnDragStart = {start: scope.schedule.start, end: scope.schedule.end};

    var pixelToVal = function (pixel) {
      var percent = pixel / containerEl[0].clientWidth;
      return Math.floor(percent * (conf.intervalCount) + 0.5) * conf.interval;
    };

    var removeSchedule = function(schedule) {
      var schedules = scope.item.schedules;

      schedules.splice(schedules.indexOf(schedule), 1);
    }

    var mergeOverlaps = function () {
      var schedule = scope.schedule;
      var schedules = scope.item.schedules;
      schedules.forEach(function (el) {
        if (el !== schedule) {
          // model is inside another slot
          if (el.end >= schedule.end && el.start <= schedule.start) {
            removeSchedule(el);

            updateSelf({
              start: el.start,
              end: el.end
            });
          }
          // model completely covers another slot
          else if (schedule.end >= el.end && schedule.start <= el.start) {
            removeSchedule(el);
          }
          // another slot's end is inside current model
          else if (el.end >= schedule.start && el.end <= schedule.end) {
            removeSchedule(el);

            updateSelf({
              start: el.start,
              end: schedule.end
            });
          }
          // another slot's start is inside current model
          else if (el.start >= schedule.start && el.start <= schedule.end) {
            removeSchedule(el);

            updateSelf({
              start: schedule.start,
              end: el.end
            });
          }
        }
      });
    };

    var updateSelf = (update: IWeeklySchedulerRange<number>) => {
      ngModelCtrl.$setViewValue(update);
      ngModelCtrl.$render();
    }

    element.on('mouseover', function () {
      containerEl.addClass('slot-hover');
    });

    element.on('mouseleave', function () {
      containerEl.removeClass('slot-hover');
    });


    if (scope.item.editable !== false) {
      /**
       * Delete on right click on slot
       */
      scope.deleteSelf = function () {
        containerEl.removeClass('dragging');
        containerEl.removeClass('slot-hover');
        removeSchedule(scope.schedule);
      };

      scope.startResizeStart = function () {
        resizeDirectionIsStart = true;
        scope.startDrag();
      };

      scope.startResizeEnd = function () {
        resizeDirectionIsStart = false;
        scope.startDrag();
      };

      scope.startDrag = function () {
        element.addClass('active');

        containerEl.addClass('dragging');
        containerEl.attr('no-add', 'true');

        valuesOnDragStart = {start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end};
      };

      scope.endDrag = function () {

        // this prevents user from accidentally
        // adding new slot after resizing or dragging
        setTimeout(function () {
          containerEl.removeAttr('no-add');
        }, 500);

        element.removeClass('active');
        containerEl.removeClass('dragging');

        mergeOverlaps();
      };

      scope.resize = function (d) {
        var ui = ngModelCtrl.$viewValue;
        var delta = pixelToVal(d);

        if (resizeDirectionIsStart) {
          var newStart = Math.round(valuesOnDragStart.start + delta);

          if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
            updateSelf({
              start: newStart,
              end: ui.end
            });
          }
        } else {
          var newEnd = Math.round(valuesOnDragStart.end + delta);

          if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= conf.maxValue) {
            updateSelf({
              start: ui.start,
              end: newEnd
            });
          }
        }
      };

      scope.drag = function (d) {
        var ui = ngModelCtrl.$viewValue;
        var delta = pixelToVal(d);
        var duration = valuesOnDragStart.end - valuesOnDragStart.start;

        var newStart = Math.round(valuesOnDragStart.start + delta);
        var newEnd = Math.round(newStart + duration);

        if (ui.start !== newStart && newStart >= 0 && newEnd <= conf.maxValue) {
          updateSelf({
            start: newStart,
            end: newEnd
          })
        }
      };
    }

    // on init, merge overlaps
    mergeOverlaps();

    //// UI -> model ////////////////////////////////////
    ngModelCtrl.$parsers.push((ui) => {
      ngModelCtrl.$modelValue.start = ui.start;
      ngModelCtrl.$modelValue.end = ui.end;
      //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
      schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
      return ngModelCtrl.$modelValue;
    });

    ngModelCtrl.$render = function () {
      var ui = ngModelCtrl.$viewValue;
      var minutes = conf.maxValue;

      var css = {
        left: ui.start / minutes * 100 + '%',
        width: (ui.end - ui.start) / minutes * 100 + '%'
      };

      //$log.debug('RENDER :', index, scope.$index, css);
      element.css(css);
    };

    scope.$on('weeklySchedulerLocaleChanged', function () {
      // Simple change object reference so that ngModel triggers formatting & rendering
      scope.schedule = angular.copy(scope.schedule);
    });
  }

  static Factory() {
    let directive = () => new WeeklySlotDirective();

    return directive;
  }
}

angular
  .module('weeklyScheduler')
  .directive(WeeklySlotDirective.$name, WeeklySlotDirective.Factory());
