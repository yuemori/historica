import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, ListGroup, ListGroupItem, Badge } from 'reactstrap'

const NodeGit = require('nodegit');

export default class Repository extends Component {
  propTypes: {
    path: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { commits: [] };
    this.onOpen(props.path);
  }

  componentWillReceiveProps(newProps) {
    console.log(newProps);
    this.onOpen(newProps.path);
  }

  async onOpen(path) {
    try {
      const repository = await NodeGit.Repository.open(path + '/.git');
      const head = await repository.getHeadCommit();
      const history = head.history();
      history.on('end', async (commits) => {
        this.setState({ commits: commits });
      });
      history.start();
    } catch(err) {
      console.log(err);
      this.state = { commits: [] }
    }
  }

  render() {
    return (
      <div>
        <Row className="mt-4">
          <Col>
            <ListGroup>
              {this.state.commits.map((commit) => {
                return <ListGroupItem key={commit.sha()}><Badge pill>{commit.sha().slice(0, 6)}</Badge> {commit.message()}</ListGroupItem>
              })}
            </ListGroup>
          </Col>
        </Row>
      </div>
    )
  }
}

