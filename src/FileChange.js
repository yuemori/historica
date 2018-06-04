import React, { Component } from 'react';
import { Diff } from 'react-diff-view';

export default class FileChange extends Component {
  render() {
    const {file} = this.props;

    return (
      <article className="diff-file">
        <header className="diff-file-header">
            <strong className="filename">{file.newPath}</strong>
            <span className="addition-count">+++ {0}</span>
            <span className="deletion-count">--- {10}</span>
        </header>
        <div>
          <Diff viewType="split" hunks={file.hunks} />
        </div>
      </article>
    )
  }
}

