'use babel';
import fs from 'fs-plus';

var config = {
  confirmDelete: {
    description: 'Confirm dialog before deleting files',
    type: 'boolean',
    default: true
  }
};

var disposable;

function activate() {
  disposable = atom.commands.add('atom-workspace', 'permanent-delete:delete', deleteCommand);
}

function deactivate() {
  disposable.dispose();
  disposable = null;
}

function deleteCommand() {
  var treeView = atom.packages.getActivePackage('tree-view');
  if(!treeView) return;
  treeView = treeView.mainModule.treeView;
  selectedPaths = treeView.selectedPaths();
  if(atom.config.get('permanent-delete.confirmDelete')) {
    atom.confirm({
      message: `Are you sure you want to delete the selected ${selectedPaths > 1 ? 'items' : 'item'}?`,
      detailedMessage: `You are deleting: \n${selectedPaths.join('\n')}`,
      buttons:{
        'Delete permanently': function() {
          deletePaths(selectedPaths);
        },
        'Cancel': null
      }
    });
  } else {
    deletePaths(selectedPaths);
  }
}

function deletePaths(paths) {
  for(let path of paths) {
    fs.isDirectory(path, function(isDirectory) {
      isDirectory ? rmdir(path) : fs.unlink(path);
    });
  }
}

function rmdir(path) {
  fs.traverseTreeSync(path, function(filePath) {
    fs.unlinkSync(filePath);
  }, function(dirPath) {
    rmdir(dirPath);
  });
  fs.rmdirSync(path);
}

export {config, activate, deactivate};
