'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'models',
  'showdown',
  'text!html/file.html'
], function($, _, Backbone, models, Showdown, fileHtml) {

  var FileView = Backbone.View.extend({
    tagName: 'li',
    events: {
        'click' : 'onClick'
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind("destroy", this.onDestroy, this);
    },
    onClick: function(e) {
      this.trigger('select', this);
    },
    onDestroy: function () {
      $(this.el).remove();
    },
    render: function() {
      var visibility = this.model.get('hidden') ? 'hidden' : 'visible';
      var current = this.model.get('current') ? 'current' : '';
      $(this.el)
        .html(_.template(fileHtml, this.model.attributes))
        .css('visibility', visibility)
        .removeClass('current')
        .addClass(current)
      ;
      return this;
    }
  });

  var FileListView = Backbone.View.extend({
    events: {
      'click .add': 'add',
      'click .open': 'open',
      'click .remove': 'remove',
      'keyup .search': 'search',
      'click .search': 'search',
      'click .source': 'source'
    },
    initialize: function() {
      this.collection.bind('add', this.onAdd, this);
      this.collection.bind("remove", this.onRemove, this);

      this.collection.load();
    },
    onAdd: function(model) {
      var view = new FileView({ model: model });
      $(this.el).find('.list').append(view.render().el);
      view.bind('select', this.onSelect, this);
      $(view.el).click();
      this.collection.save();
    },
    onRemove: function(model) {
      this.collection.save();
    },
    onSelect: function(view) {
      this.trigger('select', view);
      this.currentItem = view.model;

      this.collection.each(function(model) {
        model.set('current', model == view.model);
      });
    },
    add: function () {
      this.openDialog('openSaveAsDialog', 'Create File');
    },
    open: function () {
      this.openDialog('openFileChooserDialog');
    },
    remove: function() {
      if (!this.currentItem) return;
      if (!confirm('Remove item from list?\n(Real file is not deleted.)')) return;

      this.currentItem.destroy();
      delete this.currentItem;
      this.trigger('deselect');
    },
    search: function() {
      var queries = $(this.el).find('.search').val().split(/\s/);
      this.collection.each(function(model) {
        var hidden = false;
        for (var i = 0; i < queries.length; i++) {
          var query = queries[i];
          if (query && model.get('path').indexOf(query) == -1) {
            hidden = true;
          }
        }
        model.set('hidden', hidden);
      });
    },
    source: function() {
      var source = _.escape(makeHtml(this.currentItem.get('text')));
      var sourceWindow = Ti.UI.getCurrentWindow().createWindow({
        title: this.currentItem.name,
        contents: '<body style="background: white; overflow: hidden;"><pre>' + source + '</pre></body>'
   		});
      sourceWindow.open();
    },
    openDialog: function(func, title) {
      var options = {
        multiple: false,
        directories: false,
        files: true,
        types: ['md', 'markdown']
      };
      if (title) {
        options.title = title;
      }
    	Ti.UI[func](_.bind(function(f) {
    		if (f.length) {
          var path = f[0];

          var paths = this.collection.each(function(model) {
            if (model.get('path') == path) {
              model.destroy();
            }
          });

          var model = new models.File({
            path: path
          });
          this.collection.add(model);
    		}
    	}, this), options);
    }
  });

  var EditorView = Backbone.View.extend({
    events: {
      "keyup .source": "updateSource"
    },
    initialize: function() {
      this.setModel(null);
    },
    updateSource: function () {
      var source = $(this.el).find('.source').val();

      $(this.el).find('.result').html(makeHtml(source));

      if (this.model && this.model.get('text') != source) {
        this.model.set('text', source);
        this.model.save();
      }
    },
    setModel: function(model) {
      this.model = model;

      var text;
      if (this.model) {
        text = this.model.get('text');
      } else {
        text = '';
      }

      $(this.el).find('.source')
        .prop('disabled', !this.model)
        .val(text)
      ;

      this.updateSource();
    }
  });

  var converter = new Showdown.converter();
  function makeHtml(md) {
    return converter.makeHtml(md);
  }

  return {
    FileView: FileView,
    FileListView: FileListView,
    EditorView: EditorView
  }

});
