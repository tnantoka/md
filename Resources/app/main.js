'use strict';

require.config({
  shim: {
    'jquery': {
      exports: 'jQuery'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'showdown': {
      exports: 'Showdown'
    },
    'moment': {
      exports: 'moment'
    }
  },
  paths: {
    'jquery': '../lib/jquery-1.8.3.min',
    'underscore': '../lib/underscore-min',
    'backbone': '../lib/backbone-min',
    'showdown': '../lib/showdown/showdown',
    'moment': '../lib/moment.min',
    'text': '../lib/text'
  }
});

require([
  'jquery',
  'models',
  'views'
], function ($, models, views) {

  var DEBUG;
  //DEBUG = true;

  var TEST;
  TEST = true;

  $(function() {
    if (DEBUG) {
      Ti.UI.getCurrentWindow().showInspector();
    }

    if (TEST) {
      if(!/test/.test(location.href)) {
        var win = Ti.UI.getCurrentWindow().createWindow('app://test/index.html');
        win.open();
      }
    }

    var fileList = new models.FileList();
    var fileListView = new views.FileListView({
      collection: fileList,
      el: $('#fileList').get(0)
    });

    var editorView = new views.EditorView({
      el: $('#editor').get(0)
    });

    fileListView.bind('select', function(view) {
      $('head title').text(view.model.get('name') + ' - ' + view.model.get('path'));
      editorView.setModel(view.model);
    });
    fileListView.bind('deselect', function() {
      $('head title').text('.md');
      editorView.setModel(null);
    });

    fileList.load();

  });


});
