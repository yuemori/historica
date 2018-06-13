import React, { Component } from 'react';
import { Table } from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroller';

const dotStrokeWidth = 5;
const contentHeight = 30;

const nextColor = () => {
  // TODO: implement
  return "#000000";
}

const commitBuilder = (commit) => {
  return {
    message: commit.message(),
    sha: commit.id().tostrS(),
    author: commit.author().name(),
    date: commit.date(),
    parentOids: commit.parents().map(oid => oid.tostrS()),
  }
}

const GraphBuilder = (commits) => {
  // TODO
  return [];
}

const Node = (props) => {
  const {x, y} = props;
  const cx = 15 + x * 15;
  const cy = 15 + contentHeight * y;

  return <circle cx={cx} cy={cy} r={dotStrokeWidth} />;
}

const Row = (props) => {
  return (
    <g>
      {props.columns.map((column, x) => {
        // console.log(`commit: ${column.commit}, x: ${x}`)

        if(column.commit != null) {
          return <Node key={x} x={x} y={props.y} />
        }

        return null;
      })}
    </g>
  )
}
const Graph = (props) => {
  const maxY = props.tree.length * contentHeight;

  return (
    <svg height={maxY}>
    {props.tree.map((columns, y) => {
      return <Row key={y} y={y} columns={columns} />
    })}
    </svg>
  )
}

export default class History extends Component {
  render() {
    const {loadFunc, hasMore, commits} = this.props;
    const tree = GraphBuilder(commits);
    const style = {
      overflow: "scroll",
      height: "300px"
    };

    const width = 300;

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
