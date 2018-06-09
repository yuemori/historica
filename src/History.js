import React, { Component } from 'react';
import Git from 'nodegit';
import { Badge } from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroller';

class Node extends Component {
  render() {
    const {x, y, commit} = this.props;
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

const commitLoader = (path, count) => {
  const iterator = asyncCommitIterator(path);
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

async function* asyncCommitIterator(path) {
  const repository = await Git.Repository.open(path);
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
      return [];
    }
  }
}

export default class History extends Component {
  constructor(props) {
    super(props);
    this.loader = nullLoader();
    this.state = { commits: [], hasMore: false };
  }

  componentWillReceiveProps(newProps) {
    const {path} = newProps;
    this.loader = commitLoader(path + '/.git', 20);
    this.setState({ commits: [], hasMore: true });
  }

  async loadCommits() {
    const result = await this.loader.load();
    this.setState({ commits: result.value, hasMore: !result.done });
  }

  render() {
    const {commits} = this.state;
    const style = {
      overflow: "scroll",
      height: "300px"
    };

    return (
      <div style={style}>
        <InfiniteScroll
            pageStart={0}
            loadMore={(page) => this.loadCommits(page)}
            hasMore={this.state.hasMore}
            loader={<div className="loader" key={0}>Loading ...</div>}
            threshold={200}
            useWindow={false}
        >
          <svg width="100%" height={30 * commits.length}>
            {commits.map((commit, i) => {
              const next = commits[i + 1];
              const line = (next != null) ? (
                <line x1={15 + 30 * commit.x} x2={15 + 30 * next.x} y1={15 + 30 * commit.y} y2={15 + 30 * next.y} stroke="#000000" />
              ) : null

              return (
                <g key={i}>
                  <Node x={commit.x} y={commit.y} commit={commit} />
                  {line}
                </g>
              )
            })}
          </svg>
        </InfiniteScroll>
      </div>
    )
  }
}
