angular.module('security.login.toolbar', [
  'ui.bootstrap',
  'services.page',
  'security'
  ])

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
.directive('loginToolbar', function(Page, security) {
  var directive = {
    templateUrl: 'security/login/toolbar.tpl.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
      $scope.login = security.showLogin;
      $scope.logout = security.logout;
      $scope.page = Page  // so toolbar can change when you're on  landing page.

      $scope.$watch(function() {
        return security.getCurrentUser();
      }, function(currentUser) {
        $scope.currentUser = currentUser;
      });
    }
  };
  return directive;
});