import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import Git from 'nodegit';
import History from './History';
import Diff from './Diff';
import HunkGenerator from '../models/HunkGenerator'

const commitLoader = async (repository, count) => {
  const iterator = asyncCommitIterator(repository);
  const commits = [];

  const hunkGenerator = new HunkGenerator(repository);
  const fileChanges = await hunkGenerator.getUnCommitedChanges();

  if(fileChanges.length !== 0) {
    const head = await repository.getHeadCommit();

    const commit = {
      id: () => {
        return {
          tostrS: () => { return '' }
        }
      },
      sha: () => { return '' },
      message: () => { return 'uncommitted changes' },
      date: () => { return '' },
      refs: [],
      author: () => {
        return { 
          name: () => { return '' }
        }
      },
      parents: () => {
        return [head.id()]
      },
      fileChanges: fileChanges
    }

    commits.push(commit);
  }

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
  const worker = await repository.createRevWalk();
  const refs = await repository.getReferences(Git.Reference.TYPE.OID);
  refs.forEach(ref => worker.push(ref));
  worker.pushHead();
  worker.sorting(Git.Revwalk.SORT.TOPOLOGICAL);

  let done = false;

  while(!done) {
    let oid = null;
    try {
      oid = await worker.next();
    } catch(err) {
      // for empty repository
      done = true;
    }

    if(oid != null) {
      const current = await repository.getCommit(oid);
      current.refs = refs.filter(r => { return r.target().equal(current.id()); });

      yield current;

      const oids = await current.parents();
      if(oids.length === 0) {
        done = true;
      }
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
      this.loader = await commitLoader(repository, 20);
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

