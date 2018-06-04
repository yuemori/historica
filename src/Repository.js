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
    this.state = { repository: null };
    this.onOpen(props.path);
  }

  componentWillReceiveProps(newProps) {
    this.onOpen(newProps.path);
  }

  async onOpen(path) {
    try {
      const repository = await Git.Repository.open(path + '/.git');
      console.log(repository);
      this.setState({ repository: repository });
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
            <History repository={this.state.repository} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Diff repository={this.state.repository} />
          </Col>
        </Row>
      </div>
    )
  }
}

