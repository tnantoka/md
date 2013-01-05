'use strict';

define([
  'backbone',
  'moment'
], function(Backbone, moment) {

  var File = Backbone.Model.extend({
    defaults: {
      hidden: false,
      current: false,
      text: ' ',
      date: '',
      summary: ''
    },
    initialize: function() {
      var path = this.get('path');
      var file = Ti.Filesystem.getFile(path);
      var name = path.split('/').pop();

      if (!file.exists()) {
        this.set('text', '#' + name);
        this.save();
        file = Ti.Filesystem.getFile(path);
      }

      this.set('text', file.open().read().toString());
      this.set('name', name);
      this.set('date', moment(file.modificationTimestamp() / 1000).fromNow());
      this.setSummray();
    },
    setSummray: function() {
      this.set('summary', this.get('text').slice(0, 20) + '...');
    },
    save: function() {
      this.setSummray();
      var document = Ti.Filesystem.getFileStream(this.get('path'));
      document.open(Ti.Filesystem.MODE_WRITE);
      document.write(this.get('text'));
      document.close();
    }
  });

  var FileList = Backbone.Collection.extend({
    model: File,
    save: function() {
      var paths = this.map(function(model) {
        return model.get('path');
      });
      localStorage.setItem('fileList', JSON.stringify(paths));
    },
    load: function() {
      var paths = JSON.parse(localStorage.getItem('fileList'));
      if (!paths) return;
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var file = Ti.Filesystem.getFile(path);
        if (file.exists()) {
          var model = new File({
            path: path
          });
          this.add(model);
        }
      }
      this.save(); // Update for sync with filesystem
    }

  });

  return {
    File: File,
    FileList: FileList
  }

});
