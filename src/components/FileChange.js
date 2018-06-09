import React, { Component } from 'react';
import { Diff } from 'react-diff-view';

const sum  = function(arr) {
  return arr.reduce(function(prev, current, i, arr) {
    return prev + current;
  }, 0);
};

export default class FileChange extends Component {
  render() {
    const {file} = this.props;

    const addition = sum(file.hunks.map((hunk) => {
      return hunk.changes.filter((c) => c.isInsert).length
    }));
    const deletion = sum(file.hunks.map((hunk) => {
      return hunk.changes.filter((c) => c.isDelete).length
    }));

    return (
      <article className="diff-file">
        <header className="diff-file-header">
            <strong className="filename">{file.newPath}</strong>
            <span className="addition-count">+++ {addition}</span>
            <span className="deletion-count">--- {deletion}</span>
        </header>
        <div>
          <Diff viewType="split" hunks={file.hunks} />
        </div>
      </article>
    )
  }
}

