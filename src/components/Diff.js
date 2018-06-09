import React, { Component } from 'react';
import FileChange from './FileChange';

export default class Diff extends Component {
  render () {
    return (
      <div>
        {this.props.fileChanges.map((file, i) => {
          return <FileChange key={i} file={file} />;
        })}
      </div>
    )
  }
}
