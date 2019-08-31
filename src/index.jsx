import React, { Component } from 'react'
import ReactDom from 'react-dom'
import { HashRouter, Route, Link, IndexRoute } from 'react-router-dom'
// import App from './components/App'
import MainContent from './components/MainContent'
import Header from './components/Header'
import HeaderLine from './components/HeaderLine'
import OrderList from './components/OrderList'
import DetailPage from './components/DetailPage'
import Footer from './components/Footer'

import './index.less'

ReactDom.render(
    <HashRouter>
        <div>
            <Header />
            <HeaderLine />
            <Route exact path="/" component={MainContent} />
            <Route path="/order/:type/:id" component={OrderList} />
            <Route path="/detail/:id" component={DetailPage} />
            <Footer />
        </div>
    </HashRouter>,
    document.getElementById('app')
)
