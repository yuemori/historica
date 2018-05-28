import React, { Component } from 'react';
import { Button, Alert } from 'reactstrap';
const { dialog } = window.require('electron').remote;

export default class RepositorySelector extends Component {
  constructor() {
    super();
    this.state = { repositoryPath: 'NotSelected', isSelected: false };
  }

  openDialog = () => {
    dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Gitリポジトリを選択', }, (folderName) => {
      this.setState({ repositoryPath: folderName, isSelected: true });
    });
  }

  render () {
    return (
      <div>
        <Alert color={this.state.isSelected ? 'primary' : 'warning'}>
          <Button color="info" size="sm" onClick={this.openDialog} className="mr-2">Open</Button>
          <span>RepositoryPath: {this.state.repositoryPath}</span>
        </Alert>
      </div>
    )
  }
}
