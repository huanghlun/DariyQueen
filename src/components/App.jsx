import React, { Component } from 'react'
import Header from './Header'
import HeaderLine from './HeaderLine'
import Footer from './Footer'

export default class App extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <Header />
                <HeaderLine />
                {this.props.children}
                <Footer />
            </div>
        )
    }
}
