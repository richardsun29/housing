"use strict";
angular.module('ngRangeSlider', []).directive('rangeSlider',
function ngRangeSlider() {

  return {

    restrict: 'EA',
    controller: ['$scope', function controller($scope) {

      $scope.iter = function iter(max) {
        var iterator = [];
        for (var index = 0; index <= max; index++) {
          iterator.push(index);
        }
        return iterator;
      };

      $scope._notInRunLoop = function _notInRunLoop() {
        return !$scope.$root.$$phase;
      };

      /*
       * Determines whether Underscore/Lo-Dash is available, and the
       * `throttle` method is available on the object.
       */
      $scope._supportThrottle = function _supportThrottle() {
        return (angular.isDefined(_) && typeof _.throttle === 'function');
      };

    }],

    template: '<section class="range-slider"><datalist id="numbers"><option ng-repeat="index in iter(max)">{{index}}</option></datalist><input list="numbers" type="range" ng-change="_which = 0" ng-model="_model[0]" min="{{_values.min}}" max="{{_values.max}}" step="{{_step}}" /><input type="range" ng-change="_which = 1" ng-model="_model[1]" min="{{_values.min}}" max="{{_values.max}}" step="{{_step}}" /></section>',

    replace: true,
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      throttle: '=',
      step: '=',
      max: '=',
      min: '='
    },

    link: function link(scope, element) {
      scope._model = [scope.model.from, scope.model.to];
      scope._values = { min: scope.min || 0, max: scope.max || 100 };
      scope._step = scope.step || 1;

      // Force the re-evaluation of the input slider values.
      var _reevaluateInputs = function _reevaluateInputs() {
        var inputElements = element.find('input');
        angular.forEach(inputElements, function(inputElement, index) {
          inputElement = angular.element(inputElement);
          inputElement.val('');
          inputElement.val(scope._model[index]);
        });
      };

      // Listen for any changes to the original model.
      scope.$watch('model', function alteredValues() {
        scope._model = [scope.model.from, scope.model.to];
        _reevaluateInputs();
      }, true);

      // Listen for when the min or max are altered.
      var updateMinMax = function updateMinMax() {
        scope._values[this] = scope[this];
        _reevaluateInputs();
      };

      // Listen for changes to the min/max models.
      scope.$watch('min', updateMinMax.bind('min'));
      scope.$watch('max', updateMinMax.bind('max'));

      /*
       * Responsible for determining which slider the user was moving,
       * which help us resolve occurrences of sliders overlapping.
       */
      scope._which = 0;

      var _updateModel = function _updateModel(model) {
        if (angular.isArray(scope.model)) {
          // Developer defined an array.
          scope.model = [model[0], model[1]];
        } else {
          // Otherwise it's an object.
          scope.model = { from: model[0], to: model[1] };
        }

        if (scope._notInRunLoop()) {
          try {
            // Sometimes we're outside of the Angular run-loop, and
            // therefore need to manually invoke the `apply` method!
            scope.$apply();
          } catch(e) {}
        }
      };

      if (scope.throttle && scope._supportThrottle()) {
        // Use the throttled version if we support it, and the developer
        // has defined the throttle attribute.
        _updateModel = _.throttle(_updateModel, parseFloat(scope.throttle));
      }

      // Observe the `_model` for any changes.
      scope.$watchCollection('_model', function modelChanged() {

        scope._model[0] = parseFloat(scope._model[0]);
        scope._model[1] = parseFloat(scope._model[1]);

        // User was moving the first slider.
        if (scope._which === 0 &&
            scope._model[1] < scope._model[0]) {
          scope._model[1] = scope._model[0];
        }

        // Otherwise they were moving the second slider.
        if (scope._which === 1 &&
            scope._model[0] > scope._model[1]) {
          scope._model[0] = scope._model[1];
        }

        // Constrain to the min/max values.
        (function constrainMinMax() {

          if (scope._model[0] < scope._values.min) {
            scope._model[0] = scope._values.min;
          }

          if (scope._model[1] < scope._values.min) {
            scope._model[1] = scope._values.min;
          }

          if (scope._model[0] > scope._values.max) {
            scope._model[0] = scope._values.max;
          }

          if (scope._model[1] > scope._values.max) {
            scope._model[1] = scope._values.max;
          }

        })();

        // Update the model!
        _updateModel(scope._model);

      });
    }
  };
});
