import React, { Component } from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';

export default class Menu extends Component {
  render() {
    return (
      <div>
        <Navbar color="dark" dark expand={true}>
          <NavbarBrand href="#">Ehistorika</NavbarBrand>
        </Navbar>
      </div>
    )
  }
}
