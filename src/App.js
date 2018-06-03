import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Menu from './Menu.js'
import { Container, Row, Col, ListGroup, ListGroupItem, Badge } from 'reactstrap'
import RepositorySelector from './RepositorySelector';
const NodeGit = require('nodegit');

class App extends Component {
  constructor() {
    super();
    this.state = { commits: [] };
  }

  onRepositoryOpen(folderName) {
    NodeGit.Repository.open(folderName + '/.git').then((repository) => {
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

  render() {
    return (
      <Container fluid={true}>
        <Menu></Menu>
        <Row className="mt-4">
          <Col>
            <RepositorySelector onRepositoryOpen={(folderName) => this.onRepositoryOpen(folderName)}/>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <ListGroup>
            {this.state.commits.map((commit) => {
              return <ListGroupItem key={commit.sha()}><Badge pill>{commit.sha().slice(0, 6)}</Badge> {commit.message()}</ListGroupItem>
            })}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
