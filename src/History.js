import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import checkSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare'
import Square from '@fortawesome/fontawesome-free-solid/faSquare'

export default class History extends Component {
  propTypes: {
    repository: PropTypes.object
  }

  constructor(props) {
    super(props);
    console.log(props);
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
    return (
      <ListGroup>
        {this.state.commits.map((commit, i) => {
          return (
            <ListGroupItem key={commit.sha()}>
              <Button color={commit.sha() === this.state.ref1 ? "primary" : "default" } onClick={() => this.onRef1Click(commit)} className="mr-3">
                <FontAwesomeIcon icon={commit.sha() === this.state.ref1 ? checkSquare : Square } />
              </Button>
              <Button color={commit.sha() === this.state.ref2 ? "primary" : "default" } onClick={() => this.onRef2Click(commit)} className="mr-3">
                <FontAwesomeIcon icon={commit.sha() === this.state.ref2 ? checkSquare : Square } />
              </Button>

              <Badge pill className="mr-2" style={{"width": "80px"}}>{commit.sha().slice(0, 7)}</Badge>

              {commit.message()}
            </ListGroupItem>
          )
        })}
      </ListGroup>
    )
  }
}
