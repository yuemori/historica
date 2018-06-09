import React, { Component } from 'react';
import { Badge } from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroller';

class Node extends Component {
  render() {
    const {y, commit} = this.props;
    const x = 0;
    const dotStrokeWidth = 10;
    const contentHeight = 30;
    const width = '100%';
    const cx = 15 + x * 30;
    const cy = 15 + contentHeight * y;
    const shortSha = commit.sha().slice(0, 7);
    const shortMessage = commit.message().split('\n')[0]

    return (
      <g key={x + '-' + y} width={width} height={contentHeight} y="30" x={100 * x}>
        <circle cx={cx} cy={cy} r={dotStrokeWidth}/>
        <foreignObject width="100%" height={contentHeight} className="node" x={50} y={contentHeight * y}>
          <Badge className="mr-2" style={{"width": "80px"}}>{shortSha}</Badge>

          {shortMessage}
        </foreignObject>
      </g>
    )
  }
}

export default class History extends Component {
  render() {
    const {loadFunc, hasMore, commits} = this.props;
    const style = {
      overflow: "scroll",
      height: "300px"
    };

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
          <svg width="100%" height={30 * commits.length}>
            {commits.map((commit, i) => {
              return (
                <g key={i}>
                  <Node y={i} commit={commit} />
                </g>
              )
            })}
          </svg>
        </InfiniteScroll>
      </div>
    )
  }
}
