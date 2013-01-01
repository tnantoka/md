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
    'github': {
      deps: ['showdown'],
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
    'github': '../lib/showdown/extensions/github',
    'moment': '../lib/moment.min',
    'text': '../lib/text'
  }
});

require([
  'jquery',
  'models',
  'views'
], function ($, models, views) {

  var DEBUG = false;
  //DEBUG = true;

  if (DEBUG) {
    Ti.UI.getCurrentWindow().showInspector();
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

  fileListView.load();

});
