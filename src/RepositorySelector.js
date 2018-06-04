import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Alert } from 'reactstrap';

const { dialog } = window.require('electron').remote;

export default class RepositorySelector extends Component {
  constructor() {
    super();
    this.state = { repositoryPath: 'NotSelected', isSelected: false, commits: [] };
  }

  onOpenDialog() {
    const folderNames = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Gitリポジトリを選択', });
    if(folderNames == null) {
      return;
    }
    const folderName = folderNames[0];
    this.setState({ repositoryPath: folderName, isSelected: true });
    this.props.onRepositoryOpen(folderName);
  }

  render () {
    return (
      <div>
        <Alert color={this.state.isSelected ? 'primary' : 'warning'}>
          <Button color="info" size="sm" onClick={(e) => this.onOpenDialog(e)} className="mr-2">Open</Button>
          <span>RepositoryPath: {this.state.repositoryPath}</span>
        </Alert>
      </div>
    )
  }
}

RepositorySelector.propTypes = {
  onRepositoryOpen: PropTypes.func.isRequired
}
