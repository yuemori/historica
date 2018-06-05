import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Git from 'nodegit';
import { Badge } from 'reactstrap';
// import { Badge, Button } from 'reactstrap';
// import FontAwesomeIcon from '@fortawesome/react-fontawesome'
// import checkSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare'
// import Square from '@fortawesome/fontawesome-free-solid/faSquare'

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

async function* asyncCommitIterator(path) {
  const repository = await Git.Repository.open(path);
  let index = 0
  let current = await repository.getHeadCommit();
  current.x = 0;
  current.y = index;
  let done = false;

  while(!done) {
    index++;
    yield current
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

export default class History extends Component {
  constructor(props) {
    super(props);
    this.state = { path: props.path, commits: [], iterator: null };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ path: newProps.path, commits: []});
    const iterator = asyncCommitIterator(this.state.path + '/.git');

    this.onNext(iterator, {done: false, value: null})
  }

  onNext(iterator, result) {
    if(result.done) {
      return;
    }

    if(result.value != null) {
      this.setState({ commits: this.state.commits.concat([result.value]) });
    }

    iterator.next().then((result) => {
      this.onNext(iterator, result);
    })
  }

  render() {
    const {commits} = this.state;

    return (
      <svg width="100%" height={30 * commits.length}>
        {commits.map((commit, i) => {
          const next = commits[i + 1];
          const line = (next != null) ? (
            <line x1={15 + 30 * commit.x} x2={15 + 30 * next.x} y1={15 + 30 * commit.y} y2={15 + 30 * next.y} stroke="#000000" />
          ) : null

          return (
            <g key={commit.y}>
              <Node x={commit.x} y={commit.y} commit={commit} />
              {line}
            </g>
          )
        })}
      </svg>
    )
  }
}
