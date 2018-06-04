import React, { Component } from 'react';
import Git from 'nodegit';
import FileChange from './FileChange';

export default class Diff extends Component {
  constructor(props) {
    super(props);
    this.state = { fileChanges: [] };
  }

  componentWillReceiveProps(newProps) {
    this.onOpen(newProps);
  }

  async onOpen(props) {
    const {repository, ref1, ref2} = props;
    if(repository == null || ref1 == null || ref2 == null) {
      this.setState({ fileChanges: [] });
      return;
    }

    const patches = await this.getCurrentPatches(repository, ref1, ref2);
    const fileChanges = await this.generateFileChanges(patches)

    this.setState({ fileChanges: fileChanges });
  }

  async getCurrentPatches(repository, ref1, ref2) {
    const rev1 = await repository.getCommit(ref1);
    const rev2 = await repository.getCommit(ref2);
    const indexed = await Git.Diff.treeToIndex(repository, await rev1.getTree(), null).then((diff) => diff.patches());

    const flags = Git.Diff.OPTION.SHOW_UNTRACKED_CONTENT | Git.Diff.OPTION.RECURSE_UNTRACKED_DIRS;
    const unstaged = await Git.Diff.indexToWorkdir(repository, null, { flags: flags }).then((diff) => diff.patches());
    const diff = await Git.Diff.treeToTree(repository, await rev1.getTree(), await rev2.getTree()).then((diff) => diff.patches());

    return unstaged.concat(indexed).concat(diff);
  }

  async getHunksByPatch(patch) {
    const hunks = await patch.hunks();

    return await Promise.all(hunks.map(async (hunk) => {
      const changes = await this.getLineChangesByHunk(hunk);

      return {
        newStart: hunk.newStart(),
        newLines: hunk.newLines(),
        oldStart: hunk.oldStart(),
        oldLines: hunk.oldLines(),
        content: hunk.header().trim(),
        isPlain: false,
        changes: changes
      }
    }));
  }

  async getLineChangesByHunk(hunk) {
    const lines = await hunk.lines();

    return await Promise.all(lines.map(async (line) => {
      const origin = String.fromCharCode(line.origin());
      const f = function(o) {
        switch(o) {
          case '+':
            return 'insert';
          case '-':
            return 'delete';
          default:
            return 'normal';
        }
      }
      const type = f(origin);
      const isNormal = type === 'normal';
      const isInsert = type === 'insert';
      const isDelete = type === 'delete';
      return {
        type: type,
        content: line.content(),
        isNormal: isNormal,
        isInsert: isInsert,
        isDelete: isDelete,
        lineNumber: isDelete ? line.oldLineno() : line.newLineno(),
        oldLineNumber: line.oldLineno(),
        oldNewNumber: line.newLineno(),
      }
    }));
  }

  async generateFileChangeByPatch(patch) {
    const hunks = await this.getHunksByPatch(patch);

    const f = function(patch) {
      if(patch.isAdded()) {
        return 'add';
      } else if(patch.isDeleted()) {
        return 'delete';
      } else if(patch.isModified()) {
        return 'modify';
      } else {
        return null;
      }
    }

    return {
      hunks: hunks,
      newPath: patch.newFile().path(),
      newMode: patch.newFile().mode(),
      newRevision: patch.newFile().id().tostrS(),
      oldPath: patch.oldFile().path(),
      oldMode: patch.oldFile().mode(),
      oldRevision: patch.oldFile().id().tostrS(),
      type: f(patch)
    }
  }

  async generateFileChanges(patches) {
    return Promise.all(patches.map((p) => this.generateFileChangeByPatch(p)));
  }

  render () {
    return (
      <div>
        {this.state.fileChanges.map((file, i) => {
          return <FileChange key={i} file={file} />;
        })}
      </div>
    )
  }
}
