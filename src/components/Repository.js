import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import History from './History';
import Diff from './Diff';
import { CommitLoader, NullLoader } from '../models/CommitLoader';

export default class Repository extends Component {
  propTypes: {
    path: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { commits: [], hasMore: false, fileChanges: [] };
    this.onOpen(props.path);
  }

  componentWillReceiveProps(newProps) {
    this.onOpen(newProps.path);
  }

  async onOpen(path) {
    this.loader = NullLoader();

    try {
      this.loader = await CommitLoader(path + '/.git', 20);
      this.setState({ commits: [], hasMore: true });
    } catch(err) {
      this.setState({ commits: [], hasMore: false });
    }
  }

  async loadCommitTree() {
    const result = await this.loader.load();
    let fileChanges = result.value[0].fileChanges;
    if(fileChanges == null) {
      fileChanges = [];
    }

    this.setState({ commits: result.value, hasMore: !result.done, fileChanges: fileChanges });
  }

  render() {
    const {hasMore, commits, fileChanges} = this.state;

    return (
      <div>
        <Row className="mt-4">
          <Col>
            <History commits={commits} loadFunc={this.loadCommitTree.bind(this)} hasMore={hasMore} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Diff fileChanges={fileChanges} />
          </Col>
        </Row>
      </div>
    )
  }
}

