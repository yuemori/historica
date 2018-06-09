import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Alert } from 'reactstrap';
import Menu from './Menu.js'
import { Container, Row, Col } from 'reactstrap'
import Repository from './Repository';
const { dialog } = window.require('electron').remote;

class App extends Component {
  constructor() {
    super();
    this.state = { repositoryPath: '.' };
  }

  openDialog() {
    const folderNames = dialog.showOpenDialog({ properties: ['openDirectory'], title: 'Gitリポジトリを選択', });
    if(folderNames == null) {
      return;
    }
    const folderName = folderNames[0];
    this.setState({ repositoryPath: folderName });
  }

  render() {
    const {repositoryPath} = this.state;

    return (
      <Container fluid={true}>
        <Menu onOpenRepository={this.openDialog.bind(this)} />
        <Row className="mt-4">
          <Col>
            <Alert color='primary'>
              <span>RepositoryPath: {repositoryPath}</span>
            </Alert>
          </Col>
        </Row>
        <Repository path={repositoryPath} />
      </Container>
    );
  }
}

export default App;
