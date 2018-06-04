import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import checkSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare'
import Square from '@fortawesome/fontawesome-free-solid/faSquare'

class Commit {
  constructor({ sha, message, time, date }) {
    this.sha = sha;
    this.message = message;
    this.time = time;
    this.date = date;
    this.children = [];
  }

  add(commit) {
    this.children.push(commit);
  }
}

class Branch {
  constructor(name) {
    this.commits = [];
    this.name = name
  }

  commit({ sha, message}) {
    const commit = new Commit({ sha: sha, message: message })

    if(this.commits.length !== 0) {
      this.commits[this.commits.length - 1].add(commit);
    }

    this.commits.push(commit);
  }
}

class GitGraph {
  constructor({ width, contentHeight, dotStrokeWidth, lineStokeWidth }) {
    this.width = width;
    this.contentHeight = contentHeight;
    this.dotStrokeWidth = dotStrokeWidth;
    this.lineStokeWidth = lineStokeWidth;
    this.branches = [];
  }

  branch(name) {
    const branch = new Branch(name);
    this.branches.push(branch);
    return branch;
  }

  commits() {
    return Array.prototype.concat.apply([], this.branches.map((branch) => branch.commits));
  }

  render() {
    const cx = 15;
    const cy = 15;

    return (
      <svg width={this.width} height={this.commits().length * this.contentHeight}>
      {this.commits().map((commit, i) => {
        return (
          <g width={this.width} height={this.contentHeight} y="30">
            <circle cx={cx} cy={cy + this.contentHeight * i} r={this.dotStrokeWidth}/>

            <foreignObject width="100%" height={this.contentHeight} className="node" x="50" y={this.contentHeight * i}>
              <Badge pill className="mr-2" style={{"width": "80px"}}>{commit.sha.slice(0, 7)}</Badge>

              {commit.message}
            </foreignObject>
            <line x1={cx} x2={cx} y1={cy + this.contentHeight * i} y2={cy + this.contentHeight * (i + 1)} stroke="#000000" />
          </g>
        )
      })}
      </svg>
    )
  }
}

export default class History extends Component {
  propTypes: {
    repository: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = { commits: [] };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ commits: newProps.commits, ref1: newProps.ref1, ref2: newProps.ref2 });
  }

  onRef1Click(commit) {
    this.props.onChangeRef({ ref1: commit.sha(),  ref2: this.state.ref2 });
  }

  onRef2Click(commit) {
    this.props.onChangeRef({ ref1: this.state.ref1,  ref2: commit.sha() });
  }

  render() {
    const {commits} = this.state;
    const graph = new GitGraph({
      width: "947px",
      contentHeight: 50,
      dotStrokeWidth: 10,
      lineStokeWidth: 1,
    });
    const master = graph.branch('master');

    commits.forEach((commit) => {
      master.commit({ sha: commit.sha(), message: commit.message(), time: commit.time(), date: commit.date()});
    });

    return graph.render();
  }
}
