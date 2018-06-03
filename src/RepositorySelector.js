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
    const folderName = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Gitリポジトリを選択', })[0];
    this.setState({ repositoryPath: folderName, isSelected: true });
    console.log(this.props);
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
