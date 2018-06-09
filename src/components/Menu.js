import React, { Component } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

export default class Menu extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <div>
        <Navbar color="dark" dark expand={true}>
          <NavbarBrand href="#">Historica</NavbarBrand>
          <Nav navbar>
            <NavItem>
              <NavLink href="#" onClick={this.props.onOpenRepository} className="mr-2">Open</NavLink>
            </NavItem>
          </Nav>
        </Navbar>
      </div>
    )
  }
}
