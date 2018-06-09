import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import Git from 'nodegit';
import History from './History';
import Diff from './Diff';

export default class Repository extends Component {
  propTypes: {
    path: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { path: props.path };
    this.onOpen(props.path);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ path: newProps.path, head: null, ref1: null, ref2: null });
    this.onOpen(newProps.path);
  }

  async onOpen(path) {
    try {
      const repository = await Git.Repository.open(path + '/.git');
      const head = await repository.getHeadCommit();
      this.setState({ head: head.sha(), ref1: head.sha(), ref2: head.sha() });
    } catch(err) {
      this.setState({ head: null, ref1: null, ref2: null });
      console.log(err);
    }
  }

  render() {
    return (
      <div>
        <Row className="mt-4">
          <Col>
            <History path={this.state.path} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Diff path={this.state.path} head={this.state.head} ref1={this.state.ref1} ref2={this.state.ref2}/>
          </Col>
        </Row>
      </div>
    )
  }
}

