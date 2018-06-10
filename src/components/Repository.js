import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import Git from 'nodegit';
import History from './History';
import Diff from './Diff';
import HunkGenerator from '../models/HunkGenerator'

class TreeRow {
  constructor() {
    this.columns = [];
  }

  map(callback) {
    return this.columns.map(callback)
  }

  register(columns) {
    columns.forEach((column) => {
      this.columns.push({
        commit: column.commit,
        oid: column.oid
      });
    });
  }
}

class TreeColumn {
  reserve(commit) {
    this.commit = commit;
    this.oid = commit.id().tostrS();
  }
}

const treeLoader = (repository, count) => {
  const iterator = asyncCommitIterator(repository);
  const rows = [];

  return {
    load: async () => {
      for(let i=0;i<count;i++) {
        const result = await iterator.next();
        if(result.done) {
          return { value: rows, done: true };
        } else {
          const row = new TreeRow();
          const commit = result.value;
          const column = new TreeColumn();
          column.reserve(commit);
          row.register([column])

          rows.push(row);
        }
      }

      return { value: rows, done: false };
    }
  }
}

async function* asyncCommitIterator(repository) {
  let current = await repository.getHeadCommit();
  let done = false;

  while(!done) {
    yield current;
    const oids = await current.parents();
    if(oids.length === 0) {
      done = true;
    } else {
      current = await repository.getCommit(oids[0]);
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
    this.state = { rows: [], hasMore: false, fileChanges: [] };
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
      this.loader = await treeLoader(repository, 20);
      this.setState({ rows: [], hasMore: true, fileChanges: fileChanges });
    } catch(err) {
      this.setState({ rows: [], hasMore: false, fileChanges: [] });
    }
  }

  async loadCommitTree() {
    const result = await this.loader.load();
    const rows = [];
    if(this.state.fileChanges.length !== 0) {
      const commit = {
        sha: () => { return '' },
        message: () => { return 'uncommitted changes' },
        date: () => { return '' },
      }
      const column = {
        commit: commit,
        oid: ''
      }
      rows.push([column]);
    }
    this.setState({ rows: rows.concat(result.value), hasMore: !result.done });
  }

  render() {
    const {hasMore, rows, fileChanges} = this.state;

    return (
      <div>
        <Row className="mt-4">
          <Col>
            <History rows={rows} loadFunc={this.loadCommitTree.bind(this)} hasMore={hasMore} />
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

