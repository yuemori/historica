import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import Git from 'nodegit';
import History from './History';
import Diff from './Diff';
import HunkGenerator from './HunkGenerator'

const commitLoader = (repository, count) => {
  const iterator = asyncCommitIterator(repository);
  const commits = [];

  return {
    load: async () => {
      for(let i=0;i<count;i++) {
        const result = await iterator.next();
        if(result.done) {
          return { value: commits, done: true };
        } else {
          commits.push(result.value);
        }
      }

      return { value: commits, done: false };
    }
  }
}

async function* asyncCommitIterator(repository) {
  let index = 0
  let current = await repository.getHeadCommit();
  current.x = 0;
  current.y = index;
  let done = false;

  while(!done) {
    index++;
    yield current;
    const oids = await current.parents();
    if(oids.length === 0) {
      done = true;
    } else {
      current = await repository.getCommit(oids[0]);
      current.x = 0;
      current.y = index;
    }
  }
}

const nullLoader = () => {
  return {
    load: async () => {
      return { value: [], done: true };
    }
  }
}

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
    this.loader = nullLoader();

    try {
      const repository = await Git.Repository.open(path + '/.git');
      const hunkGenerator = new HunkGenerator(repository);
      const fileChanges = await hunkGenerator.getUnCommitedChanges();
      this.loader = commitLoader(repository, 20);
      this.setState({ commits: [], hasMore: true, fileChanges: fileChanges });
    } catch(err) {
      this.setState({ commits: [], hasMore: false, fileChanges: [] });
    }
  }

  async loadCommits() {
    const result = await this.loader.load();
    this.setState({ commits: result.value, hasMore: !result.done });
  }

  render() {
    const {hasMore, commits, fileChanges} = this.state;

    return (
      <div>
        <Row className="mt-4">
          <Col>
            <History commits={commits} loadFunc={this.loadCommits.bind(this)} hasMore={hasMore} />
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

