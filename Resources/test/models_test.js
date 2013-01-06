'use strict';

define([
  'models'
], function(models) {

  module('File', {
    setup: function() {
      this.tempDir = Ti.Filesystem.createTempDirectory();
      this.file1 = Ti.Filesystem.getFile(this.tempDir, 'file1.md');
    },
    teardown: function() {
      this.tempDir.deleteDirectory(true);
    }
  });

  test('Defaults',
    function() {
      var path1 = this.file1.nativePath();
      var file1 = new models.File({ path: path1 });

      equal(file1.get('current'), false);
      equal(file1.get('hidden'), false);
      equal(file1.get('name'), path1.split('/').pop());
      equal(file1.get('text'), '#' + path1.split('/').pop());
      equal(file1.get('summary'), this.file1.read().toString().slice(0, 20) + '...');
    }
  );

  test('Edit and save',
    function() {
      var path1 = this.file1.nativePath();
      var file1 = new models.File({ path: path1 });
      file1.set('text', 'Edited');
      file1.save();

      equal(Ti.Filesystem.getFile(path1).read().toString(), 'Edited');
    }
  );

  module('FileList', {
    setup: function() {
      console.log('setup filelist');
      this.tempDir = Ti.Filesystem.createTempDirectory();
      this.file1 = Ti.Filesystem.getFile(this.tempDir, 'file1.md');
      this.file2 = Ti.Filesystem.getFile(this.tempDir, 'file2.markdown');
    },
    teardown: function() {
      this.tempDir.deleteDirectory(true);
    }
  });

  test("Save and load",
    function() {
      var fileList = new models.FileList();
      fileList.add(new models.File({ path: this.file1.nativePath() }));
      fileList.add(new models.File({ path: this.file2.nativePath() }));
      fileList.save();
      ok(true, 'successfully saved');

      var fileList = new models.FileList();
      fileList.load();
      equal(fileList.models[0].get('path'), this.file1.nativePath())
      equal(fileList.models[1].get('path'), this.file2.nativePath());
    }
  );

  test('Load with deleted file',
    function() {
      var fileList = new models.FileList();
      fileList.add(new models.File({ path: this.file1.nativePath() }));
      fileList.add(new models.File({ path: this.file2.nativePath() }));
      fileList.save();
      ok(true, 'successfully saved');

      this.file1.deleteFile();

      var fileList = new models.FileList();
      fileList.load();
      equal(1, fileList.length);
      equal(fileList.models[0].get('path'), this.file2.nativePath())
    }
  );

});

