import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Menu from './Menu.js'
import { Container, Row, Col } from 'reactstrap'
import RepositorySelector from './RepositorySelector';
import Repository from './Repository';

class App extends Component {
  constructor() {
    super();
    this.state = { folderName: '.' };
  }

  async onRepositoryOpen(folderName) {
    this.setState({ folderName: folderName });
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
        <Repository path={this.state.folderName} />
      </Container>
    );
  }
}

export default App;
