import React from 'react';
import { Row, Col, Button, Dropdown, Carousel } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Ethereum from '../../static/Ethereum-icon.svg';
import BSC from '../../static/BSC-icon.svg';
import Arrow from '../../static/arrow-icon.svg';
import './index.less';

class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { chainId } = this.props;
    return (
      <div className="home">
        <Row>
          <Col span={24}>
            <div className="title">
              <h1>Suter Bridge Alpha</h1>
              <h1>A Glance of Suter VM</h1>
            </div>
          </Col>
        </Row>
        <Row className="WhichOperationContainer">
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div
              className={chainId === ETH_CHAIN_ID ? 'card' : 'card disabled'}
            >
              <div className="iconContainer">
                <img src={Ethereum} alt="ethereum" />
                <img src={Arrow} alt="arrow" />
                <img src={BSC} alt="bsc" />
              </div>
              <h1>Bridge Ethereum Assets to BSC Assets</h1>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div
              className={chainId === BSC_CHAIN_ID ? 'card' : 'card disabled'}
            >
              <div className="iconContainer">
                <img src={BSC} alt="bsc" />
                <img src={Arrow} alt="arrow" />
                <img src={Ethereum} alt="ethereum" />
              </div>
              <h1>Bridge BSC Assets to Ethereum Assets</h1>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;
