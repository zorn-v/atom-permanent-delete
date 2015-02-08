fs = require 'fs-plus'
{CompositeDisposable} = require 'atom'

module.exports = AtomPermanentDelete =
  subs: null

  activate: (state) ->
    @subs = new CompositeDisposable
    @subs.add atom.commands.add 'atom-workspace', 'permanent-delete:delete': => @delete()

  deactivate: ->
    @subs.dispose()

  serialize: ->

  delete: ->
    treeView = atom.packages.getActivePackage 'tree-view'
    return unless treeView?
    treeView = treeView.mainModule.treeView
    selectedPaths = treeView.selectedPaths()
    atom.confirm
      message: "Are you sure you want to delete the selected #{if selectedPaths.length > 1 then 'items' else 'item'}?"
      detailedMessage: "You are deleting:\n#{selectedPaths.join('\n')}"
      buttons:
        'Delete permanently': ->
          rmdirR = (dirPath) ->
            fs.traverseTreeSync dirPath, (filePath) ->
              fs.unlinkSync filePath
            , (subDirPath) ->
              rmdirR subDirPath
            fs.rmdirSync dirPath
          for selectedPath in selectedPaths
            fs.isDirectory selectedPath, (isDirectory) ->
              return fs.unlinkSync selectedPath unless isDirectory
              rmdirR selectedPath
        'Cancel': null