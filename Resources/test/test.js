'use strict';

(function () {
  QUnit.config.autostart = false;

  var tests = [
    'models_test.js',
  ];

  require(tests, QUnit.start);
})();