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
  constructor(x) {
    this.x = x;
  }

  reserve(oid) {
    this.oid = oid.tostrS();
  }

  register(commit) {
    this.commit = commit;
    this.reserve(commit.id())
  }
}

const treeLoader = (repository, count) => {
  const iterator = asyncCommitIterator(repository);
  const columns = [];

  for(let i=0;i<30;i++) {
    columns.push(new TreeColumn(i));
  }
  const rows = [];

  const findColumnByOid = (oid) => {
    return columns.find(c => c.oid === oid.tostrS());
  }

  const findEmptyColumn = () => {
    return columns.find(c => c.oid == null);
  }

  return {
    load: async () => {
      for(let i=0;i<count;i++) {
        const result = await iterator.next();
        if(result.done) {
          return { value: rows, done: true };
        } else {
          const row = new TreeRow();
          const commit = result.value;
          let column = findColumnByOid(commit.id())

          if(column == null) {
            column = findEmptyColumn();
          }

          column.register(commit);
          row.register(columns)
          rows.push(row);
          columns.forEach(c => c.commit = null);
          column.oid = null

          const parents = commit.parents();

          if(parents.length !== 0) {
            if(findColumnByOid(parents[0]) == null) {
              column.reserve(parents[0]);
            }
          }

          parents.slice(1, parents.length).forEach((p) => {
            let column = findColumnByOid(p)

            if(column == null) {
              findEmptyColumn().reserve(p);
            }
          });
        }
      }

      return { value: rows, done: false };
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
        refs: []
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

