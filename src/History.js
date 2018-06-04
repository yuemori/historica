import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Git from 'nodegit';
import { Badge } from 'reactstrap';
// import { Badge, Button } from 'reactstrap';
// import FontAwesomeIcon from '@fortawesome/react-fontawesome'
// import checkSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare'
// import Square from '@fortawesome/fontawesome-free-solid/faSquare'

class Commit extends Component {
  render() {
    const {y, contentHeight, width, dotStrokeWidth} = this.props;
    const {x, shortSha, message, refs} = this.props.commit;
    const cx = 15 + x * 30;
    const cy = 15;

    return (
      <g key={x + '-' + y} width={width} height={contentHeight} y="30" x={100 * x}>
        <circle cx={cx} cy={cy + contentHeight * y} r={dotStrokeWidth}/>
        <foreignObject width="100%" height={contentHeight} className="node" x="50" y={contentHeight * y}>
          <Badge className="mr-2" style={{"width": "80px"}}>{shortSha}</Badge>
          {refs.map((ref, i) => {
            return <Badge key={i} pill color="primary" className="mr-2" style={{"width": "80px"}}>{ref}</Badge>
          })}

          {message}
        </foreignObject>
        <line x1={cx} x2={cx} y1={cy + contentHeight * y} y2={cy + contentHeight * (y + 1)} stroke="#000000" />
      </g>
    )
  }
}

export default class History extends Component {
  constructor(props) {
    super(props);
    this.state = { path: props.path, commits: [] };
  }

  componentDidMount() {
    this.onUpdate();
  }

  componentWillReceiveProps(newProps) {
    this.setState({ path: newProps.path, commits: [] });
    this.onUpdate();
  }

  async getBranchNames(repository) {
    const references = await repository.getReferences(Git.Reference.TYPE.OID);
    const localRefs = references.filter((ref) => { return !ref.isRemote() && ref.isBranch(); })
    return localRefs.map((ref) => { return ref.name().replace('refs/heads/', ''); });
  }

  async getCommits(repository, branch, x) {
    const walker = repository.createRevWalk();
    const firstCommit = await repository.getBranchCommit(branch.name());
    walker.push(firstCommit);
    walker.sorting(Git.Revwalk.SORT.Time);
    const commits = await walker.getCommits(100);
    return Promise.all(commits.map((commit) => {
      return {
        sha: commit.sha(),
        shortSha: commit.sha().slice(0, 7),
        message: commit.message(),
        x: x,
        refs: [],
        time: commit.time(),
        date: commit.date()
      }
    }));
  }

  async onUpdate() {
    const repository = await Git.Repository.open(this.state.path + '/.git');
    const currentRefs = await repository.getCurrentBranch();
    const commits = await this.getCommits(repository, currentRefs, 0);
    const refs = [currentRefs];

    refs.forEach((ref) => {
      const commit = commits.find((c) => { return c.sha === ref.target().tostrS() });
      commit.refs.push(ref.name().replace('refs/heads/', ''));
    });

    this.setState({ commits: commits });
  }

  render() {
    const {width, contentHeight, dotStrokeWidth} = this.props;

    return (
      <svg width={width} height={300 * contentHeight}>
      {this.state.commits.map((commit, y) => {
        return <Commit key={y} contentHeight={contentHeight} dotStrokeWidth={dotStrokeWidth} width={width} commit={commit} y={y} />;
      })}
      </svg>
    )
  }
}

History.defaultProps = {
  width: '100%',
  contentHeight: 30,
  dotStrokeWidth: 10,
  lineStokeWidth: 1,
  repository: null
}
