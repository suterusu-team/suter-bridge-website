import React from 'react';
import { Card } from 'antd';
import Mint from '../mint';
import Revert from '../revert';
import Ethereum from '../../static/Ethereum-icon.svg';
import BSC from '../../static/BSC-icon.svg';
import Arrow from '../../static/arrow-icon.svg';

import Web3 from 'web3';
import SpinModal from '../spinModal';
var Contract = require('web3-eth-contract');

import {
  openNotificationWithIcon,
  EthChainNameMap,
  BscChainNameMap,
} from '../../components/tools';
import './index.less';

const contentList = {
  Mint: function(account) {
    return <Mint account={account} />;
  },
  Revert: function(account) {
    return <Revert account={account} />;
  },
};

class Form extends React.Component {
  state = {
    exchangeBalance: 0,
  };
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    await this.getExchangeBalance();
  }

  async getExchangeBalance() {
    const { formType } = this.props;
    let bridgeInfo = BridgeInfo[formType];
    const suterTokenContract = new Contract(
      bridgeInfo.TOEKN_ABI,
      bridgeInfo.TOEKN_CONTRACT_ADDRESS,
    );
    suterTokenContract.setProvider(window.ethereum);
    let balance = await suterTokenContract.methods
      .balanceOf(bridgeInfo.CONTRACT_ADDRESS)
      .call();
    this.setState({ exchangeBalance: balance / 10 ** 18 });
  }

  render() {
    const { account, formType } = this.props;
    let { exchangeBalance } = this.state;
    return (
      <div className="form">
        <div className="topCard">
          <div className="exchangeBalance">
            <p>Current Exchangable Balance:</p>
            <h1>{exchangeBalance}</h1>
          </div>
          <div>
            {formType === 'mint' ? (
              <div className="iconContainer">
                <img src={Ethereum} alt="bsc" className="coin" />
                <img src={Arrow} alt="arrow" />
                <img src={BSC} alt="ethereum" className="coin" />
              </div>
            ) : (
              <div className="iconContainer">
                <img src={BSC} alt="bsc" className="coin" />
                <img src={Arrow} alt="arrow" />
                <img src={Ethereum} alt="ethereum" className="coin" />
              </div>
            )}
          </div>
        </div>
        <Card>{contentList[formType](account)}</Card>
      </div>
    );
  }
}

export default Form;
