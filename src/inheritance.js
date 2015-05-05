// inheritance.js v1.0 -
// An AngularJS application, developed as a tool for determining class
// and skill inheritance for all possible deterministic pairings available
// to the player in Fire Emblem: Awakening.

// raw data taken from Serenes Forest <http://serenesforest.net/fe13/>

'use strict';

angular.module('directive', []).
  directive('tree', function () {
    return {
      restrict: 'A',
      template: '<div ng-repeat="class in [tree.base].concat(tree.branches)">' +
                  '<div>' +
                    '<span class="clickable" ng-click="tryToggle(class)" ng-class="{selected: enabled && class == selected}">{{class.name}}</span>' +
                  '</div>' +
                  '<div ng-repeat="skill in class.skills">{{skill}}</div>' +
                '</div>',
      link: function (scope, element, attrs) {
        var enabled = scope.enabled = (attrs.disabled !== '');

        if (enabled === false) {
          element.addClass('disabled');
        };

        element.addClass('tree');

        scope.tryToggle = function (clas) {
          if (enabled === true) {
            scope.toggle(clas);
          };
        };
      }
    };
  });

angular.module('filter', []).
  filter('compatible', function () {
    return function (cast, selected) {
      if (angular.isObject(selected) === false) {
        return;
      };

      var spouses = [];

      function valid(suitor) {
        var allow = true, spouse;

        if (suitor.name === 'Chrom' || selected.name === 'Chrom') {
          allow = false;
          spouse = (suitor.name === 'Chrom')? selected.name : suitor.name;

          angular.forEach(['Sumia', 'Sully', 'Maribelle', 'Olivia'], function (named) {
            if (spouse === named) {
              allow = true;
            };
          });
        } else if (suitor.name === 'Sumia' || selected.name === 'Sumia') {
          allow = false;
          spouse = (suitor.name === 'Sumia')? selected.name : suitor.name;

          angular.forEach(['Chrom', 'Frederick', 'Gaius', 'Henry'], function (named) {
            if (spouse === named) {
              allow = true;
            };
          });
        };

        return allow;
      };

      angular.forEach(cast, function (suitor) {
        if (suitor.generation === 1 && suitor.gender !== selected.gender && valid(suitor)) {
          spouses.push(suitor);
        };
      });

      return spouses;
    };
  }).
  filter('labeled', function () {
    return function (mods) {
      var result = [], labels = ['Str', 'Mag', 'Skl', 'Spd', 'Lck', 'Def', 'Res'];

      angular.forEach(mods, function (mod, i) {
        var sep = '+';

        if (mod < 0) {
          sep = ''; // already will have negative symbol
        } else if (mod > 9) {
          sep = ':'; // no mod will be > 9 unless we're really looking for caps
        };

        result.push(labels[i] + sep + mod);
      });

      return result.join(', ');
    };
  });

angular.module('service', []).
  service('Cast', function () {
    var cast = FEA.characters;

    // Reconfigure 'Lord M' tree
    var lordm = cast[0].classes[0];

    lordm.base = lordm.branches[0];
    lordm.base.name = 'Great Lord';
    lordm.branches = [];

    // Reconfigure 'Taguel' tree
    cast[14].classes[0].branches.push({
      name: 'Beaststone+',
      caps: [80, 40, 30, 48, 48, 51, 39, 32],
      skills: []
    });

    // Reconfigure 'Manakete' tree
    cast[18].classes[0].branches.push({
      name: 'Dragonstone+', 
      caps: [80, 51, 41, 40, 39, 45, 53, 49],
      skills: []
    });

    // Reconfigure 'Dancer' tree
    cast[21].classes[0].base.skills.pop();

    // Reconfigure 'Lord F' tree
    var lordf = cast[24].classes[0];

    lordf.base.name = 'Lord';
    lordf.branches[0].name = 'Great Lord';

    return cast; // from data.js
  });

angular.module('inheritance', ['directive', 'filter', 'service']).
  controller('InheritanceCtrl', ['$scope', 'Cast', function ($scope, Cast) {
      $scope.cast = Cast;
  
      $scope.select = function (character) {
        if ($scope.parent !== character) {
          $scope.parent = character;
        };
      };
  
      $scope.toggle = function (clas) {
        if ($scope.selected === clas) {
          delete $scope.selected;
        } else {
          $scope.selected = clas;
        };
      };
    }]).
  controller('ChildCtrl', ['$scope', function ($scope) {
      $scope.$watch('parent', function (parent) {
        var child, static_parent, dynamic_parent, spouse = $scope.spouse;
  
        if (parent.child) {
          child = parent.child;
          static_parent = parent;
          dynamic_parent = spouse;
        } else {
          child = spouse.child;
          static_parent = spouse;
          dynamic_parent = parent;
        };

        $scope.child = child;
  
        $scope.classes = {
          default: child.classes.slice(0), // shallow copy
          additional: [],
          default_restricted: [],
          additional_restricted: []
        };
  
        inheritFrom(static_parent);
        inheritFrom(dynamic_parent, true);
      });
  
      function inheritFrom(source, dynamic) {
  
        var dest = dynamic? $scope.classes.additional : $scope.classes.default;
        var restricted = dynamic? $scope.classes.additional_restricted : $scope.classes.default_restricted;
        var child = $scope.child;
  
        function inherit(tree) {
          if ((tree.gender && tree.gender !== child.gender) || tree.inheritable === false || (source.name === 'Panne' && tree.base.name === 'Wyvern Rider')) {
            if (tree.base.name !== 'Priest' && tree.base.name !== 'Cleric') {
              if (tree.base.name === 'Great Lord') {
                var clone = angular.copy(tree);
  
                if (child.gender === 'm') {
                  clone.base.skills.shift();
                } else {
                  clone.base.skills.pop();
                };
  
                clone.base.skills.push('(Automatic)');
                restricted.push(clone);
              } else {
                restricted.push(tree);
              };
            };
          } else if (hasTree(tree) === false) {
            dest.push(tree);
  
            if (child.name === 'Yarne' && tree.base.name === 'Wyvern Rider') {
              $scope.classes.default_restricted.pop();
            };
          };
        };
  
        angular.forEach(source.classes, inherit);
  
        if (source.gender !== child.gender) {
          angular.forEach(source.alternates, inherit);
        };
      };
  
      function hasTree(tree) {
        var classes = $scope.classes.default;
  
        for (var i=0; i<classes.length; i++) {
          if (classes[i] === tree) {
            return true;
          };
        };
  
        return false;
      };
  
      $scope.mods = function () {
        var result = [];
        var caps = $scope.hasClass($scope.selected)? $scope.selected.caps.slice(1) : [0, 0, 0, 0, 0, 0, 0];
  
        for (var i=0; i<7; i++) {
          result.push(caps[i] + $scope.parent.mods[i] + $scope.spouse.mods[i] + 1);
        };
  
        return result;
      };
  
      $scope.hasClass = function (clas) {
        if (!clas) {
          return false;
        };

        var classes = $scope.classes.default.concat($scope.classes.additional);
  
        for (var i=0; i<classes.length; i++) {
          var cur = classes[i];
  
          if (cur.base === clas) {
            return true;
          } else {
            for (var j=0; j<cur.branches.length; j++) {
              if (cur.branches[j] === clas) {
                return true;
              };
            };
          };
        };
  
        return false;
      };
    }]);
