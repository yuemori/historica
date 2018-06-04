import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap'
import Git from 'nodegit';
import History from './History';
import Diff from './Diff';

export default class Repository extends Component {
  propTypes: {
    path: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { repository: null, commits: [] };
    this.onOpen(props.path);
  }

  componentWillReceiveProps(newProps) {
    this.onOpen(newProps.path);
  }

  async onOpen(path) {
    try {
      const repository = await Git.Repository.open(path + '/.git');
      this.setState({ repository: repository });
      const head = await repository.getHeadCommit();
      const history = head.history();
      history.on('end', async (commits) => {
        this.setState({ commits: commits, ref1: head.sha(), ref2: head.sha() });
      });
      history.start();
    } catch(err) {
      this.setState({ repository: null });
      console.log(err);
    }
  }

  render() {
    const style = {
      overflow: "scroll",
      height: "200px"
    };
    return (
      <div>
        <Row className="mt-4" style={style}>
          <Col>
            <History commits={this.state.commits} ref1={this.state.ref1} ref2={this.state.ref2} onChangeRef={({ref1, ref2}) => this.setState({ ref1: ref1, ref2: ref2 })} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Diff repository={this.state.repository} ref1={this.state.ref1} ref2={this.state.ref2}/>
          </Col>
        </Row>
      </div>
    )
  }
}

