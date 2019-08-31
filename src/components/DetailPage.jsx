import React, { Component } from 'react'
import { fetch_url, getCookies } from '../utils/utils'
import { imageUrl } from '../utils/constants'

export default class HeaderLine extends Component {
    constructor(props) {
        super(props)

        this.state = {
            imgHoverIndex: 0,
            dateIndex: 0,
            dateArr: [],
            imgList: [],
            detailItem: {},
            teamInfo: {},
            bookNum: 0,
            showVisitorWindow: false,
            showWindow: false,
            Login: false //是否登录态
        }

        this.changeHoverImg = this.changeHoverImg.bind(this)
        this.onHideWindow = this.onHideWindow.bind(this)
        this.onShowWindow = this.onShowWindow.bind(this)
        this.onClickBook = this.onClickBook.bind(this)
        this.onChangeDate = this.onChangeDate.bind(this)
        this.onShowVWindow = this.onShowVWindow.bind(this)
        this.onHideVWindow = this.onHideVWindow.bind(this)
        this.onConfirmBook = this.onConfirmBook.bind(this)
        this.fetchData = this.fetchData.bind(this)
    }

    componentDidMount() {
        this.fetchData()
        const that = this
        window.onhashchange = function() {
            that.fetchData()
        }
        // hack：定时获取cookies
        const justifyLogin = () => {
            this.setState({
                Login: getCookies().userId != undefined
            })
            this.timer = setTimeout(justifyLogin, 3000)
        }
        this.timer = setTimeout(justifyLogin, 3000)
    }

    fetchData() {
        const param = this.props.match.params
        fetch(`${fetch_url}route/detail?rid=${param.id}`, {
            mode: 'cors'
        })
            .then(response => response.json())
            .then(res => {
                const dateArr = res.route.map(item => item.sdate)
                let detailItem = res.route[0]
                detailItem.hotel = res.hotel
                const bookNum = res.route.reduce((prev, item) => {
                    return prev + item.pnum
                }, 0)
                const imgList = imageUrl[res.route[0].rid]
                this.setState({
                    dateArr,
                    detailItem,
                    bookNum,
                    imgList
                })
            })
            .catch(console.log)

        this.setState({
            Login: getCookies().userId != undefined
        })
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
        window.onhashchange = function() {}
    }

    changeHoverImg(i) {
        this.setState({
            imgHoverIndex: i
        })
    }

    onHideWindow() {
        this.setState({
            showWindow: false
        })
    }

    onShowWindow() {
        this.setState({
            showWindow: true
        })
    }

    onShowVWindow() {
        this.setState({
            showVisitorWindow: true
        })
    }

    onHideVWindow() {
        this.setState({
            showVisitorWindow: false
        })
    }

    onClickBook() {
        // 若未登录先提示登录
        if (!this.state.Login) {
            this.onShowWindow()
            return
        }
        this.onShowVWindow()
    }

    onConfirmBook() {
        fetch(`${fetch_url}visitor`, {
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify({
                rid: this.props.match.params.id,
                sdate: this.state.dateArr[this.state.dateIndex],
                vname: this.nameInput.value,
                vsex: this.maleInput.checked
                    ? this.maleInput.value
                    : this.femaleInput.value,
                vage: this.ageInput.value,
                id: this.idInput.value,
                vphone: this.phoneInput.value,
                price: this.state.detailItem.price,
                uid: getCookies().userId
            }),
            headers: {
                'Content-type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.code == 0) {
                    this.setState({
                        teamInfo: {
                            aid: res.team[0].aid,
                            date: res.team[0].date,
                            duration: res.team[0].duration,
                            guide: res.team.map(v => ({
                                gname: v.gname,
                                gphone: v.gphone,
                                gsex: v.gsex,
                                level: v.level
                            }))
                        }
                    })
                    this.onHideVWindow()
                    this.onShowWindow()
                }
            })
            .catch(console.log)
    }

    onChangeDate(i) {
        this.setState({
            dateIndex: i
        })
    }

    render() {
        return (
            <div className="main main-content">
                <div className="detail-page wrapper">
                    <p className="title">{this.state.detailItem.attractions}</p>
                    <p className="li-title">{`产品编号：${
                        this.state.detailItem.rid
                    }`}</p>
                    <div className="flex-row align-item-start">
                        <div className="image-container flex-none">
                            <img
                                src={
                                    this.state.imgList[this.state.imgHoverIndex]
                                }
                                style={{ width: '100%' }}
                            />
                            <div className="scroll-list-container">
                                <ul className="scroll-list flex-row align-item-center">
                                    {this.state.imgList.map((url, index) => {
                                        return (
                                            <li key={index} className="flex-1">
                                                <img
                                                    src={url}
                                                    className={
                                                        this.state
                                                            .imgHoverIndex ==
                                                        index
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onMouseEnter={() =>
                                                        this.changeHoverImg(
                                                            index
                                                        )
                                                    }
                                                />
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div
                            className="flex-1"
                            style={{ position: 'relative' }}
                        >
                            <p className="price">{`￥${
                                this.state.detailItem.price
                            }`}</p>
                            <div style={{ paddingLeft: '20px' }}>
                                <p className="book-line">
                                    <em>{this.state.bookNum}</em>人预订
                                </p>
                                <div className="table">
                                    <div
                                        className="table-row"
                                        style={{ lineHeight: '2em' }}
                                    >
                                        <p style={{ textAlign: 'left' }}>
                                            出发城市
                                        </p>
                                        <p>{this.state.detailItem.origin}</p>
                                    </div>
                                    <div
                                        className="table-row"
                                        style={{ lineHeight: '2em' }}
                                    >
                                        <p style={{ textAlign: 'left' }}>
                                            目的城市
                                        </p>
                                        <p>
                                            {this.state.detailItem.destination}
                                        </p>
                                    </div>
                                    <div
                                        className="table-row"
                                        style={{ lineHeight: '2em' }}
                                    >
                                        <p style={{ textAlign: 'left' }}>
                                            行程天数
                                        </p>
                                        <p>{`${
                                            this.state.detailItem.duration
                                        }天`}</p>
                                    </div>
                                    <div
                                        className="table-row"
                                        style={{ lineHeight: '2em' }}
                                    >
                                        <p style={{ textAlign: 'left' }}>
                                            酒店信息
                                        </p>
                                        <p>
                                            {this.state.detailItem.hotel &&
                                                this.state.detailItem.hotel
                                                    .map(obj => obj.hname)
                                                    .join('、')}
                                        </p>
                                    </div>
                                    <div
                                        className="table-row"
                                        style={{ lineHeight: '2em' }}
                                    >
                                        <p style={{ textAlign: 'left' }}>
                                            开团时间
                                        </p>
                                        <p className="button-group">
                                            {this.state.dateArr.map(
                                                (date, index) => {
                                                    return (
                                                        <button
                                                            key={index}
                                                            className={
                                                                this.state
                                                                    .dateIndex ==
                                                                index
                                                                    ? 'active'
                                                                    : ''
                                                            }
                                                            onClick={() =>
                                                                this.onChangeDate(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            {date}
                                                        </button>
                                                    )
                                                }
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={this.onClickBook}
                                    className="book-button"
                                >
                                    立即预订
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            'book-window' +
                            (this.state.showWindow ? ' active' : '')
                        }
                        style={{ height: this.state.Login ? 'auto' : '300px' }}
                    >
                        <a
                            className="close-button"
                            onClick={this.onHideWindow}
                        />
                        {!this.state.Login ? (
                            <div>
                                <img src={require('../assets/mark.png')} />
                                <p className="info">请先登录账号</p>
                            </div>
                        ) : (
                            <div>
                                <h2
                                    style={{
                                        textAlign: 'center',
                                        margin: '20px',
                                        fontWeight: '540'
                                    }}
                                >
                                    预订成功
                                </h2>
                                <img src={require('../assets/click.png')} />
                                <div
                                    className="flex-row align-item-start"
                                    style={{ paddingBottom: '30px' }}
                                >
                                    <div className="flex-1">
                                        <div className="table">
                                            <div className="table-row">
                                                <p>航班号</p>
                                                <p>{this.state.teamInfo.aid}</p>
                                            </div>
                                            <div className="table-row">
                                                <p>启程时间</p>
                                                <p>
                                                    {this.state.teamInfo.date}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="flex-1"
                                        style={{ flex: '1.5' }}
                                    >
                                        <div className="table">
                                            <div className="table-row">
                                                <p>导游信息</p>
                                                <p>
                                                    {this.state.teamInfo
                                                        .guide &&
                                                        this.state.teamInfo.guide.map(
                                                            (g, index) => {
                                                                return (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {`${
                                                                            g.gname
                                                                        } ${
                                                                            g.gphone
                                                                        } ${
                                                                            g.level
                                                                        }`}
                                                                    </span>
                                                                )
                                                            }
                                                        )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="book-footer" />
                    </div>

                    <div
                        className={
                            'login-window' +
                            (this.state.showVisitorWindow ? ' active' : '')
                        }
                        style={{ height: '500px' }}
                    >
                        <a
                            className="close-button"
                            onClick={this.onHideVWindow}
                        />
                        <h2
                            style={{
                                textAlign: 'center',
                                marginTop: '20px',
                                fontWeight: '540'
                            }}
                        >
                            请输入游客信息
                        </h2>
                        <div>
                            <ul className="input-list">
                                <li>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="请输入游客真实姓名"
                                        ref={i => (this.nameInput = i)}
                                    />
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        name="sex"
                                        id="male"
                                        value="M"
                                        defaultChecked
                                        ref={i => (this.maleInput = i)}
                                    />
                                    <label htmlFor="male">男</label>
                                    <input
                                        type="radio"
                                        name="sex"
                                        id="female"
                                        value="F"
                                        ref={i => (this.femaleInput = i)}
                                    />
                                    <label htmlFor="female">女</label>
                                </li>
                                <li>
                                    <input
                                        type="number"
                                        name="age"
                                        placeholder="请输入游客岁数"
                                        ref={i => (this.ageInput = i)}
                                    />
                                    {this.state.loginFail && (
                                        <p className="input-error">
                                            登陆账号或密码错误
                                        </p>
                                    )}
                                </li>
                                <li>
                                    <input
                                        type="text"
                                        name="creditId"
                                        placeholder="请输入游客身份证号"
                                        ref={i => (this.idInput = i)}
                                    />
                                </li>
                                <li>
                                    <input
                                        type="number"
                                        name="phone"
                                        placeholder="请输入游客手机号码"
                                        ref={i => (this.phoneInput = i)}
                                    />
                                </li>
                            </ul>
                            <button onClick={this.onConfirmBook}>
                                确认预订
                            </button>
                        </div>

                        <div className="login-footer" />
                    </div>
                </div>
            </div>
        )
    }
}
