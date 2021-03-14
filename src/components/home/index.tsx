import React from 'react';
import { Row, Col, Button, Dropdown, Carousel } from 'antd';
import {
  openNotificationWithIcon,
  BscChainNameMap,
  EthChainNameMap,
} from '../tools';
import { DownOutlined } from '@ant-design/icons';
import Ethereum from '../../static/Ethereum-icon.svg';
import BSC from '../../static/BSC-icon.svg';
import Arrow from '../../static/arrow-icon.svg';
import './index.less';

class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  wrongChainIdNotification(chainId, whichChain) {
    let message =
      whichChain === 'eth'
        ? `Please change metamask to ${EthChainNameMap[`${chainId}`]}`
        : `Please change metamask to ${BscChainNameMap[`${chainId}`]}`;

    openNotificationWithIcon(
      'Block Chain Network Error',
      message,
      'warning',
      4,
    );
  }

  render() {
    const { chainId, connectMetaMask, intl } = this.props;
    return (
      <div className="home">
        <Row>
          <Col span={24}>
            <div className="title">
              <h1>{intl.get('SuterBridgeAlpha')}</h1>
              <h1>{intl.get('AGlanceofSuterVM')}</h1>
            </div>
          </Col>
        </Row>
        <Row className="WhichOperationContainer">
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div
              className={
                chainId === BridgeInfo.Mint.CHAIN_ID ? 'card' : 'card disabled'
              }
              onClick={
                chainId === BridgeInfo.Mint.CHAIN_ID
                  ? connectMetaMask
                  : () => {
                      this.wrongChainIdNotification(
                        BridgeInfo.Mint.CHAIN_ID,
                        'eth',
                      );
                    }
              }
            >
              <div className="iconContainer">
                <img src={Ethereum} alt="ethereum" />
                <img src={Arrow} alt="arrow" />
                <img src={BSC} alt="bsc" />
              </div>
              <h1>{intl.get('EthereumAssetstoBSCAssets')}</h1>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div
              className={
                chainId === BridgeInfo.Revert.CHAIN_ID
                  ? 'card'
                  : 'card disabled'
              }
              onClick={
                chainId === BridgeInfo.Revert.CHAIN_ID
                  ? connectMetaMask
                  : () => {
                      this.wrongChainIdNotification(
                        BridgeInfo.Revert.CHAIN_ID,
                        'bsc',
                      );
                    }
              }
            >
              <div className="iconContainer">
                <img src={BSC} alt="bsc" />
                <img src={Arrow} alt="arrow" />
                <img src={Ethereum} alt="ethereum" />
              </div>
              <h1>{intl.get('BSCAssetstoEthereumAssets')}</h1>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;
