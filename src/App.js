import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Menu from './Menu.js'
import { Container, Row, Col } from 'reactstrap'

class App extends Component {
  render() {
    return (
      <Container fluid={true}>
        <Menu></Menu>
      </Container>
    );
  }
}

export default App;
