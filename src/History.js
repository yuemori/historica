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
    const {contentHeight, width, dotStrokeWidth, maxX} = this.props;
    const {y, x, shortSha, message, refs, parents} = this.props.commit;
    const cx = 15 + x * 30;
    const cy = 15 + contentHeight * y;
    const x1 = cx;
    const y1 = cy;

    return (
      <g key={x + '-' + y} width={width} height={contentHeight} y="30" x={100 * x}>
        <circle cx={cx} cy={cy} r={dotStrokeWidth}/>
        <foreignObject width="100%" height={contentHeight} className="node" x={50 * (maxX + 1)} y={contentHeight * y}>
          <Badge className="mr-2" style={{"width": "80px"}}>{shortSha}</Badge>
          {refs.map((ref, i) => {
            return <Badge key={i} pill color="primary" className="mr-2">{ref}</Badge>
          })}

          {message}
        </foreignObject>
        {parents.filter(p => { return p != null }).map((parent) => {
        const x2 = 15 + parent.x * 30;
        const y2 = 15 + contentHeight * parent.y;
        return <line x1={x1} x2={x2} y1={y1} y2={y2} stroke="#000000" />
        })}
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

  async getOtherReferences(repository, currentRef) {
    const references = await repository.getReferences(Git.Reference.TYPE.OID);
    return references.filter((ref) => { return !ref.isRemote() && ref.isBranch() && ref.name() !== currentRef.name(); })
  }

  // TODO: limit
  async getCommits(repository, branch, x, _commits) {
    const walker = repository.createRevWalk();
    const firstCommit = await repository.getBranchCommit(branch.name());
    // TODO: ちゃんと親子関係でwhileループして取り出す
    walker.push(firstCommit);
    walker.sorting(Git.Revwalk.SORT.Time);
    const commits = await walker.getCommitsUntil((commit) => {
      return !_commits.map(c => c.sha).includes(commit.sha());
    });

    return Promise.all(commits.map((commit) => {
      return {
        sha: commit.sha(),
        shortSha: commit.sha().slice(0, 7),
        message: commit.message().split('\n')[0],
        x: x,
        refs: [],
        parents: commit.parents().map(oid => oid.tostrS()),
        time: commit.time(),
        date: commit.date()
      }
    }));
  }

  async onUpdate() {
    const repository = await Git.Repository.open(this.state.path + '/.git');
    const currentRef = await repository.getCurrentBranch();
    let commits = []
    const currentCommits = await this.getCommits(repository, currentRef, 0, commits);
    commits = commits.concat(currentCommits);
    const branches = await this.getOtherReferences(repository, currentRef);
    console.log(commits);

    for(let i=1;i<branches.length;i++) {
      const branchCommit = await this.getCommits(repository, branches[i], i, commits)
      const _commits = commits.map(c => c.sha);
      commits = commits.concat(branchCommit.filter((commit) => { return !_commits.includes(commit.sha); }));
    }

    commits.sort((a, b) => {
      if(a.time > b.time) return -1;
      if(a.time < b.time) return 1;
      return 0;
    })

    commits = commits.map((commit, y) => {
      commit.parents = commit.parents.map((parent) => {
        return commits.find((c) => { return c.sha === parent });
      });
      commit.y = y;
      return commit;
    });

    console.log(commits);

    const refs = [currentRef].concat(branches);

    refs.forEach((ref) => {
      const commit = commits.find((c) => { return c.sha === ref.target().tostrS() });
      if(commit == null) return;
      commit.refs.push(ref.name().replace('refs/heads/', ''));
    });

    this.setState({ commits: commits });
  }

  render() {
    const commits = this.state.commits.slice(0, 500);
    const {width, contentHeight, dotStrokeWidth} = this.props;
    const maxX = Math.max.apply(null, commits.map(c => c.x));
    const maxY = Math.max.apply(null, commits.map(c => c.y));

    return (
      <svg width={width} height={(maxY + 1) * contentHeight}>
      {commits.map((commit) => {
        return <Commit key={commit.sha} maxX={maxX} contentHeight={contentHeight} dotStrokeWidth={dotStrokeWidth} width={width} commit={commit} />;
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
