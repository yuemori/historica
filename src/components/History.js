import React, { Component } from 'react';
import { Table } from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroller';

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
        oid: column.oid,
        x: column.x
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

const treeBuilder = (commits) => {
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

  commits.forEach(commit => {
    const row = new TreeRow();
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
  })

  return rows;
}

class Node extends Component {
  render() {
    const {x, y} = this.props;
    const dotStrokeWidth = 5;
    const contentHeight = 30;
    const cx = 15 + x * 15;
    const cy = 15 + contentHeight * y;

    return (
      <circle cx={cx} cy={cy} r={dotStrokeWidth}/>
    )
  }
}

class Row extends Component {
  render() {
    const {row, y} = this.props;

    return (
      <g>
        {row.map(column => {
          return (column.commit != null) ? <Node key={column.x} x={column.x} y={y} /> : null
        })}
      </g>
    )
  }
}

const calcGraphWidth = (tree) => {
  const min = 90;
  const maxX = Math.max(...tree.map(row => Math.max(...row.columns.filter(column => column.commit != null).map(column => column.x))));

  if(maxX === -Infinity) {
    return min;
  }

  return (maxX * 30 > min) ? maxX * 30 : min;
}

class Graph extends Component {
  render() {
    const {tree} = this.props;

    console.log(tree);

    const width = calcGraphWidth(tree);

    return (
      <svg height={tree.length * 30} width={width}>
        {tree.map((row, y) => {
          return <Row key={y} row={row} y={y} />
        })}
      </svg>
    )
  }
}

export default class History extends Component {
  render() {
    const {loadFunc, hasMore, commits} = this.props;
    console.log(commits);
    const tree = treeBuilder(commits);
    const style = {
      overflow: "scroll",
      height: "300px"
    };

    const width = calcGraphWidth(tree);
    console.log(width);

    return (
      <div style={style}>
        <InfiniteScroll
            pageStart={0}
            loadMore={loadFunc}
            hasMore={hasMore}
            loader={<div className="loader" key={0}>Loading ...</div>}
            threshold={200}
            useWindow={false}
        >
          <Table id="commit-table">
            <thead>
              <tr>
                <th className="commit-table-column-graph" style={{width: width}}>graph</th>
                <th className="commit-table-column-message">message</th>
                <th className="commit-table-column-sha">sha</th>
                <th className="commit-table-column-author">author</th>
                <th className="commit-table-column-date">date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="commit-table-column-graph" rowSpan={commits.length + 10}><Graph tree={tree} /></td>
              </tr>
            {commits.map((commit, y) => {
              return (
                <tr key={y}>
                  <td><div>{commit.message()}</div></td>
                  <td><div>{commit.sha().slice(0, 7)}</div></td>
                  <td><div>{commit.author().name()}</div></td>
                  <td><div>{commit.date().toString()}</div></td>
                </tr>
              )
            })}
            </tbody>
          </Table>
        </InfiniteScroll>
      </div>
    )
  }
}
