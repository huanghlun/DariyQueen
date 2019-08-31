import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { setCookies, getCookies, fetch_url } from '../utils/utils'

class Header extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showSelect: false,
            selectIndex: 0,
            showSearchBox: false,
            showLoginWindow: false,
            chosenDepatrue: 0,
            chosenDestination: -1,
            userName: '',
            userId: '',
            loginFail: false, // 登陆成功或失败
            comfirm: true, // 1代表密码验证正确，0不正确
            loginOrNot: false, // 0未登陆，1已登录
            loginOrSignUp: 0 // 0代表登录，1代表注册
        }

        this.selectArray = [
            {
                label: '出发地/目的地',
                value: 'position'
            },
            {
                label: '游客号',
                value: 'id'
            }
        ]
        this.departure = ['广州', '上海', '北京']
        this.destination = {
            0: ['云南', '西藏', '内蒙古', '马来西亚', '澳洲'],
            1: ['云南', '西藏', '内蒙古', '日本', '港澳', '西葡'],
            2: ['云南', '西藏', '内蒙古', '日本', '港澳', '加拿大']
        }

        this.onClickSelect = this.onClickSelect.bind(this)
        this.onChangeSelect = this.onChangeSelect.bind(this)
        this.onFocusInput = this.onFocusInput.bind(this)
        this.onHideBox = this.onHideBox.bind(this)
        this.onChoseDepature = this.onChoseDepature.bind(this)
        this.onChoseDestination = this.onChoseDestination.bind(this)
        this.onChangeLogin = this.onChangeLogin.bind(this)
        this.onShowLoginWindow = this.onShowLoginWindow.bind(this)
        this.onHideLoginWindow = this.onHideLoginWindow.bind(this)
        this.comfirmPassword = this.comfirmPassword.bind(this)
        this.onLogin = this.onLogin.bind(this)
        this.onLogOut = this.onLogOut.bind(this)
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.onSignUp = this.onSignUp.bind(this)
        this.onSearch = this.onSearch.bind(this)
        this.searchRoute = this.searchRoute.bind(this)
        this.searchOrder = this.searchOrder.bind(this)
    }

    componentDidMount() {
        const cookies = getCookies()
        if (cookies.userName && cookies.userId) {
            this.login(cookies)
        }
    }

    login(obj) {
        this.setState({
            loginOrNot: true,
            userName: obj.userName,
            userId: obj.userId
        })
        setCookies(obj)
    }

    logout() {
        this.setState({
            loginOrNot: false,
            userName: '',
            userId: ''
        })
        //设置cookie过期
        var _date = new Date()
        _date.setDate(_date.getDate() - 1)
        setCookies(
            {
                userName: '',
                userId: ''
            },
            {
                date: _date
            }
        )
    }

    onSignUp() {
        const userName = this.SignUpUserInput.value,
            password = this.SignUpPassInput.value
        fetch(`${fetch_url}signup`, {
            mode: 'cors',
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ userName, password })
        })
            .then(Response => Response.json())
            .then(myJson => {
                if (myJson.code == 0) {
                    //代表成功
                    this.setState({
                        showLoginWindow: false
                    })
                }
            })
            .catch(err => console.log(err))
    }

    onClickSelect() {
        // debugger
        this.setState(prevState => ({
            showSelect: !prevState.showSelect
        }))
    }

    onChangeSelect(index) {
        this.setState({
            selectIndex: index
        })
    }

    onFocusInput() {
        if (this.state.selectIndex == 0) {
            this.setState({
                showSearchBox: true
            })
        }
    }

    onHideBox() {
        this.setState({
            showSearchBox: false
        })
    }

    onChoseDepature(index) {
        this.setState({
            chosenDepatrue: index
        })
    }

    onChoseDestination(index) {
        this.setState({
            chosenDestination: index
        })
    }

    onChangeLogin(i) {
        this.setState({
            loginOrSignUp: i
        })
    }

    onShowLoginWindow(i) {
        this.onChangeLogin(i)
        this.setState({
            showLoginWindow: true
        })
    }

    onHideLoginWindow() {
        this.setState({
            showLoginWindow: false
        })
    }

    comfirmPassword() {
        const v1 = this.SignUpPassInput.value,
            v2 = this.repeatInput.value
        this.setState({
            comfirm: v1 === v2
        })
    }

    onLogin() {
        fetch(
            `${fetch_url}login?user=${this.loginUserInput.value}&password=${
                this.loginPassInput.value
            }`,
            {
                mode: 'cors'
            }
        )
            .then(response => {
                return response.json()
            })
            .then(myJson => {
                if (myJson.code == 0) {
                    // 登陆成功
                    this.login({
                        userName: myJson.userName,
                        userId: myJson.userId
                    })
                    this.setState({
                        loginFail: false,
                        showLoginWindow: false
                    })
                } else {
                    // 登陆失败
                    this.setState({
                        loginFail: true
                    })
                }
            })
    }

    onLogOut() {
        this.logout()
    }

    onSearch() {
        if (this.state.selectIndex == 0) this.searchRoute()
        else this.searchOrder()
    }

    searchRoute() {
        fetch(
            `${fetch_url}route/search?depature=${encodeURIComponent(
                this.departure[this.state.chosenDepatrue]
            )}&destination=${encodeURIComponent(
                this.destination[this.state.chosenDepatrue][
                    this.state.chosenDestination
                ]
            )}`,
            {
                mode: 'cors'
            }
        )
            .then(response => response.json())
            .then(res => {
                const rid = res.routes[0].rid
                this.props.history.push(`/detail/${rid}`)
                this.setState({
                    showSearchBox: false
                })
            })
            .catch(err => console.log(err))
    }

    searchOrder() {
        // 跳转去订单页再查询
        this.props.history.push(`/order/1/${this.searchInput.value}`)
    }

    render() {
        return (
            <div className="header wrapper flex-row align-item-center">
                <div
                    className="flex-none"
                    style={{ width: '200px', height: '100%' }}
                >
                    <Link className="logo" to="/" />
                </div>
                <div className="search-form flex-auto flex-row align-item-center">
                    <div
                        className="select-group flex-none"
                        onClick={this.onClickSelect}
                    >
                        <span>
                            {this.selectArray[this.state.selectIndex].label}
                        </span>
                        <ul
                            className={
                                this.state.showSelect
                                    ? 'select active'
                                    : 'select'
                            }
                        >
                            {this.selectArray.map((obj, index) => {
                                return (
                                    <li
                                        key={index}
                                        className={
                                            this.state.selectIndex == index
                                                ? 'active'
                                                : ''
                                        }
                                        onClick={() =>
                                            this.onChangeSelect(index)
                                        }
                                    >
                                        <a>{obj.label}</a>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <input
                        type="text"
                        name="search"
                        placeholder="请输入或选择查询内容"
                        className="flex-1"
                        onFocus={this.onFocusInput}
                        onBlur={this.onBlurInput}
                        ref={i => (this.searchInput = i)}
                    />
                    <div className="search-button" onClick={this.onSearch} />

                    <div
                        className={
                            (this.state.showSearchBox ? 'active ' : '') +
                            'search-box'
                        }
                        // onClick={() => console.log('!!!')}
                    >
                        <div className="table-row">
                            <p>出发地</p>
                            <p>
                                {this.departure.map((val, index) => {
                                    return (
                                        <span
                                            key={index}
                                            onClick={() =>
                                                this.onChoseDepature(index)
                                            }
                                            className={
                                                this.state.chosenDepatrue ==
                                                index
                                                    ? 'chosen'
                                                    : ''
                                            }
                                        >
                                            {val}
                                        </span>
                                    )
                                })}
                            </p>
                        </div>
                        <div className="table-row">
                            <p>目的地</p>
                            <p>
                                {this.destination[
                                    this.state.chosenDepatrue
                                ].map((val, index) => {
                                    return (
                                        <span
                                            key={index}
                                            onClick={() =>
                                                this.onChoseDestination(index)
                                            }
                                            className={
                                                this.state.chosenDestination ==
                                                index
                                                    ? 'chosen'
                                                    : ''
                                            }
                                        >
                                            {val}
                                        </span>
                                    )
                                })}
                            </p>
                        </div>

                        <a className="up-tangle" onClick={this.onHideBox} />
                    </div>
                </div>
                <div className="login-form flex-none flex-row align-item-center">
                    {this.state.loginOrNot && (
                        <span
                            style={{ flex: '1.5', position: 'relative' }}
                            className="user-name-span"
                        >
                            <a>{this.state.userName}</a>

                            <span className="login-out-window">
                                <a onClick={this.onLogOut}>退出登录</a>
                            </span>
                        </span>
                    )}
                    {!this.state.loginOrNot && (
                        <span>
                            <a onClick={() => this.onShowLoginWindow(1)}>
                                注册
                            </a>
                        </span>
                    )}
                    {!this.state.loginOrNot && (
                        <span>
                            <a onClick={() => this.onShowLoginWindow(0)}>
                                登录
                            </a>
                        </span>
                    )}
                    <span>
                        <Link
                            to={
                                '/order' +
                                (this.state.userId
                                    ? `/2/${this.state.userId}`
                                    : '')
                            }
                        >
                            我的订单
                        </Link>
                    </span>
                </div>

                <div
                    className={
                        'login-window' +
                        (this.state.showLoginWindow ? ' active' : '')
                    }
                >
                    <a
                        className="close-button"
                        onClick={this.onHideLoginWindow}
                    />
                    <div className="login-list flex-row align-item-center">
                        <div
                            className={
                                (this.state.loginOrSignUp ? '' : 'active ') +
                                'flex-1'
                            }
                            onClick={() => this.onChangeLogin(0)}
                        >
                            登录
                        </div>
                        <div
                            className={
                                (this.state.loginOrSignUp ? 'active ' : '') +
                                'flex-1'
                            }
                            onClick={() => this.onChangeLogin(1)}
                        >
                            注册
                        </div>
                    </div>
                    {!this.state.loginOrSignUp ? (
                        <div>
                            <ul className="input-list">
                                <li>
                                    <input
                                        type="text"
                                        name="account"
                                        placeholder="请输入登录账号"
                                        className={
                                            this.state.loginFail ? 'error' : ''
                                        }
                                        ref={i => (this.loginUserInput = i)}
                                    />
                                </li>
                                <li>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="请输入密码"
                                        className={
                                            this.state.loginFail ? 'error' : ''
                                        }
                                        ref={i => (this.loginPassInput = i)}
                                    />
                                    {this.state.loginFail && (
                                        <p className="input-error">
                                            登陆账号或密码错误
                                        </p>
                                    )}
                                </li>
                            </ul>
                            <button onClick={this.onLogin}>登录</button>
                        </div>
                    ) : (
                        <div>
                            <ul className="input-list">
                                <li>
                                    <input
                                        type="text"
                                        name="signUpAccount"
                                        placeholder="请输入注册账号"
                                        ref={i => (this.SignUpUserInput = i)}
                                    />
                                </li>
                                <li>
                                    <input
                                        type="password"
                                        name="signUpPassword"
                                        placeholder="请输入密码"
                                        ref={i => (this.SignUpPassInput = i)}
                                    />
                                </li>
                                <li>
                                    <input
                                        type="password"
                                        name="repeatPassword"
                                        placeholder="重复输入密码以确认"
                                        onBlur={this.comfirmPassword}
                                        ref={i => (this.repeatInput = i)}
                                        className={
                                            !this.state.comfirm ? 'error' : ''
                                        }
                                    />
                                    {!this.state.comfirm && (
                                        <p className="input-error">
                                            重复输入密码错误
                                        </p>
                                    )}
                                </li>
                            </ul>
                            <button
                                onClick={this.onSignUp}
                                disabled={!this.state.comfirm}
                            >
                                注册
                            </button>
                        </div>
                    )}

                    <div className="login-footer" />
                </div>
            </div>
        )
    }
}

export default withRouter(Header)
