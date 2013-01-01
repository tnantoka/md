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

      if (!file.exists()) {
        this.save();
        file = Ti.Filesystem.getFile(path);
      }

      this.set('text', file.open().read().toString());
      this.set('name', path.split('/').pop());
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
    },
    destroy: function() {
      this.trigger("destroy", this);
    }
  });

  var FileList = Backbone.Collection.extend({
    model: File
  });

  return {
    File: File,
    FileList: FileList
  }

});
