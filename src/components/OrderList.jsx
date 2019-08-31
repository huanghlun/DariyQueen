import React, { Component } from 'react'
import { fetch_url } from '../utils/utils'
import { imageUrl } from '../utils/constants'

export default class OrderList extends Component {
    constructor(props) {
        super(props)

        this.state = {
            orderList: []
        }
        // console.log(props)
        this.fetchData = this.fetchData.bind(this)
    }

    componentDidMount() {
        this.fetchData()
        const that = this
        window.onhashchange = function(e) {
            that.fetchData()
        }
    }

    componentWillUnmount() {
        // 取消绑定
        window.onhashchange = function(e) {}
    }

    fetchData() {
        const param = this.props.match.params
        if (param.type == 1) {
            // 根据游客号查询
            fetch(`${fetch_url}visitor?vid=${encodeURIComponent(param.id)}`, {
                mode: 'cors'
            })
                .then(response => response.json())
                .then(res => {
                    let item = {
                        pnum: res.order[0].count,
                        oid: res.order[0].oid,
                        rid: res.route[0].rid,
                        destination: res.route[0].destination,
                        price: res.route[0].price
                    }
                    this.setState({
                        orderList: [item]
                    })
                })
                .catch(err => console.log(err))
        } else {
            // 根据用户号查询
            fetch(
                `${fetch_url}order/uname?uid=${encodeURIComponent(param.id)}`,
                {
                    mode: 'cors'
                }
            )
                .then(response => response.json())
                .then(res => {
                    const route = res.route
                    this.setState({
                        orderList: route
                    })
                })
                .catch(err => console.log(err))
        }
    }

    render() {
        return (
            <div className="main main-content">
                <div className="order-list-container wrapper">
                    <p className="title">全部订单</p>
                    {this.state.orderList.length ? (
                        <ul>
                            {this.state.orderList.map((item, index) => {
                                return (
                                    <li key={index}>
                                        <div className="order-title">
                                            {`订单号: ${item.oid}`}
                                        </div>
                                        <div className="order-content flex-row align-item-center">
                                            <div
                                                className="flex-none order-image"
                                                style={{
                                                    backgroundImage: `url(${
                                                        imageUrl[item.rid][0]
                                                    })`
                                                }}
                                            />
                                            <div className="flex-none order-name">
                                                {item.destination}
                                            </div>
                                            <div className="flex-1">{`${
                                                item.pnum
                                            }人`}</div>
                                            <div className="flex-1">{`￥${
                                                item.price
                                            }`}</div>
                                            <div className="flex-1">
                                                订单完成
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <div className="no-order-placehold">
                            <img
                                src={require('../assets/order-placehold.png')}
                                style={{
                                    width: '300px',
                                    margin: '0 auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
