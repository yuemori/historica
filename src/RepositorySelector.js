import React, { Component } from 'react';
import { Button, Alert, ListGroup, ListGroupItem, Badge } from 'reactstrap';
const NodeGit = require('nodegit');

const { dialog } = window.require('electron').remote;

export default class RepositorySelector extends Component {
  constructor() {
    super();
    this.state = { repositoryPath: 'NotSelected', isSelected: false, commits: [] };
  }

  onOpenDialog() {
    const folderName = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Gitリポジトリを選択', })[0];
    this.setState({ repositoryPath: folderName, isSelected: true });
    NodeGit.Repository.open(folderName + '/.git').then((repository) => {
      console.log(repository);
      return repository;
    })
    .then((repository) => {
      return repository.getHeadCommit();
    })
    .then((firstCommit) => {
      const history = firstCommit.history();
      history.on('end', async (commits) => {
        this.setState({ commits: commits });
      });
      history.start();
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render () {
    return (
      <div>
        <Alert color={this.state.isSelected ? 'primary' : 'warning'}>
          <Button color="info" size="sm" onClick={(e) => this.onOpenDialog(e)} className="mr-2">Open</Button>
          <span>RepositoryPath: {this.state.repositoryPath}</span>
        </Alert>
        <ListGroup>
        {this.state.commits.map((commit) => {
          return <ListGroupItem key={commit.sha()}><Badge pill>{commit.sha().slice(0, 6)}</Badge> {commit.message()}</ListGroupItem>
        })}
        </ListGroup>
      </div>
    )
  }
}
