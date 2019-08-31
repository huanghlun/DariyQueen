import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { fetch_url } from '../utils/utils'
import { imageUrl } from '../utils/constants'

export default class HeaderLine extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hoverIndex: 0,
            localLine: [],
            HKLine: [],
            globalSLine: [],
            globalLLine: []
        }

        this.lineArray = [
            { label: '国内路线', id: '00' },
            { label: '港澳路线', id: '01' },
            { label: '国际短线', id: '10' },
            { label: '国际长线', id: '11' }
        ]

        this.changeHoverIndex = this.changeHoverIndex.bind(this)
    }

    componentDidMount() {
        // 获取航线
        fetch(`${fetch_url}route`, {
            mode: 'cors'
        })
            .then(response => response.json())
            .then(res => {
                let localLine = [],
                    HKLine = [],
                    globalSLine = [],
                    globalLLine = []
                res.routes.forEach(obj => {
                    if (/^00/.test(obj.rid)) {
                        localLine.push(obj)
                    } else if (/^01/.test(obj.rid)) {
                        HKLine.push(obj)
                    } else if (/^10/.test(obj.rid)) {
                        globalSLine.push(obj)
                    } else {
                        globalLLine.push(obj)
                    }
                })
                this.setState({
                    localLine,
                    HKLine,
                    globalSLine,
                    globalLLine
                })
            })
            .catch(err => console.log(err))
    }

    changeHoverIndex(i) {
        this.setState({
            hoverIndex: i
        })
    }

    render() {
        let showContent = ''
        switch (this.state.hoverIndex) {
            case 0:
                showContent = 'localLine'
                break
            case 1:
                showContent = 'HKLine'
                break
            case 2:
                showContent = 'globalSLine'
                break
            case 3:
                showContent = 'globalLLine'
                break
        }
        return (
            <div className="main">
                <div className="wrapper main-content">
                    <div className="content-container">
                        <ul className="title-list flex-row align-item-center">
                            {this.lineArray.map((obj, index) => {
                                return (
                                    <li
                                        key={index}
                                        onMouseEnter={() =>
                                            this.changeHoverIndex(index)
                                        }
                                        className={
                                            index == this.state.hoverIndex
                                                ? 'hover'
                                                : ''
                                        }
                                    >
                                        <a>{obj.label}</a>
                                    </li>
                                )
                            })}
                        </ul>
                        <ul className="item-list">
                            {this.state[showContent].map((obj, index) => {
                                // console.log(imageUrl, obj.rid)
                                return (
                                    <li key={obj.rid}>
                                        <Link
                                            style={{
                                                display: 'block',
                                                width: '100%'
                                            }}
                                            to={`/detail/${obj.rid}`}
                                        >
                                            <div className="item-wrap">
                                                <div
                                                    className="item-image"
                                                    style={{
                                                        backgroundImage: `url(${
                                                            imageUrl[obj.rid][0]
                                                        })`
                                                    }}
                                                />
                                                <div className="item-desc">
                                                    <p
                                                        className="title"
                                                        title={obj.attractions}
                                                    >
                                                        {obj.attractions.slice(
                                                            0,
                                                            15
                                                        ) + '...'}
                                                    </p>
                                                    <p className="price">
                                                        {'￥' + obj.price}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}
