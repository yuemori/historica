import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap'

export default class History extends Component {
  propTypes: {
    repository: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = { commits: [] };
  }

  componentWillReceiveProps(newProps) {
    this.onOpen(newProps.repository);
  }

  async onOpen(repository) {
    if(repository === null) {
      this.setState({ commits: [] });
      return;
    }

    const head = await repository.getHeadCommit();
    const history = head.history();
    history.on('end', async (commits) => {
      this.setState({ commits: commits });
    });
    history.start();
  }

  render() {
    return (
      <ListGroup>
        {this.state.commits.map((commit) => {
          return <ListGroupItem key={commit.sha()}><Badge pill>{commit.sha().slice(0, 6)}</Badge> {commit.message()}</ListGroupItem>
        })}
      </ListGroup>
    )
  }
}
