import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Mint from '../mint';
import Revert from '../revert';
import Ethereum from '../../static/Ethereum-icon.svg';
import BSC from '../../static/BSC-icon.svg';
import Arrow from '../../static/arrow-icon.svg';
var Contract = require('web3-eth-contract');

import './index.less';
class Form extends React.Component {
  state = {
    exchangeBalance: 0,
    accountSuterBalance: 0,
    updateKey: '',
  };
  constructor(props) {
    super(props);
    this.whichFormType = this.whichFormType.bind(this);
    this.getAccountSuterBalance = this.getAccountSuterBalance.bind(this);
    this.getExchangeBalance = this.getExchangeBalance.bind(this);
    this.updateKeyFunc = this.updateKeyFunc.bind(this);
  }

  async componentDidMount() {
    await this.getExchangeBalance();
    await this.getAccountSuterBalance();
  }

  async updateData() {
    await this.getExchangeBalance();
    await this.getAccountSuterBalance();
  }

  async updateKeyFunc() {
    await this.updateData();
    let key = Math.random()
      .toString(36)
      .substr(2, 5);
    this.setState({ updateKey: key });
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

  async getAccountSuterBalance() {
    const { formType, account } = this.props;
    let bridgeInfo = BridgeInfo[formType];
    const suterTokenContract = new Contract(
      bridgeInfo.TOEKN_ABI,
      bridgeInfo.TOEKN_CONTRACT_ADDRESS,
    );
    suterTokenContract.setProvider(window.ethereum);
    let balance = await suterTokenContract.methods.balanceOf(account).call();
    this.setState({ accountSuterBalance: balance / 10 ** 18 });
  }

  whichFormType() {
    const { account, formType, intl } = this.props;
    let { exchangeBalance, accountSuterBalance, updateKey } = this.state;
    return (
      <>
        {formType === 'Mint' ? (
          <Mint
            intl={intl}
            key={updateKey}
            formType={formType}
            account={account}
            exchangeBalance={exchangeBalance}
            suterBalance={accountSuterBalance}
            updateKeyFunc={this.updateKeyFunc}
          />
        ) : (
          <Revert
            intl={intl}
            key={updateKey}
            formType={formType}
            account={account}
            exchangeBalance={exchangeBalance}
            suterBalance={accountSuterBalance}
            updateKeyFunc={this.updateKeyFunc}
          />
        )}
      </>
    );
  }

  render() {
    const { formType, intl } = this.props;
    let { exchangeBalance } = this.state;
    return (
      <div className="form">
        <div className="topCard">
          <div className="exchangeBalance">
            <div className="titleContainer">
              <p>{intl.get('CurrentExchangableBalance')}</p>
              <Tooltip
                placement="topLeft"
                title={intl.get('CurrentExchangableBalanceTips')}
                trigger={['hover', 'click']}
              >
                &nbsp;
                <QuestionCircleOutlined className="i" style={{ zIndex: 100 }} />
              </Tooltip>
            </div>
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
        <Card>{this.whichFormType()}</Card>
      </div>
    );
  }
}

export default Form;
