import React from 'react';
import { Row, Col, Button } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import BEP20SuterCoin from '../../static/bep20_suter.svg';
import WAValidator from 'multicoin-address-validator';
import Web3 from 'web3';
import SpinModal from '../spinModal';
var Contract = require('web3-eth-contract');
import { openNotificationWithIcon, MessageWithAlink } from '../tools';
import './index.less';

class Mint extends React.Component {
  state = {
    suterAmount: '',
    destinationAddress: '',
    proccesing: false,
    suterBalance: 0,
    btnTxt: 'Confirm',
  };

  constructor(props) {
    super(props);
    this.handleSuterAmountChange = this.handleSuterAmountChange.bind(this);
    this.assignRef = this.assignRef.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this);
    this.callApprove = this.callApprove.bind(this);
    this.callExchange = this.callExchange.bind(this);
    this.submit = this.submit.bind(this);
  }
  componentDidMount() {}

  assignRef(c: HTMLElement) {
    this.inputRef = c;
  }

  checkNumber(theObj) {
    var reg = /^[0-9]+.?[0-9]*$/;
    if (reg.test(theObj)) {
      return true;
    }
    return false;
  }

  handleSuterAmountChange(e) {
    let { suterBalance, exchangeBalance } = this.props;
    let { destinationAddress } = this.state;
    let suterAmount = e.target.value;
    if (!this.checkNumber(suterAmount)) {
      this.setState({ suterAmount: 0 });
      return;
    }
    this.setState({ suterAmount: parseFloat(suterAmount) });
    if (suterAmount > exchangeBalance) {
      openNotificationWithIcon(
        'Invalid Amount!',
        'Suter Bridge Contract Insuffient Balance, Please Wait for a while',
        'warning',
        10,
      );
    }
    let validDestination = WAValidator.validate(destinationAddress, 'eth');
    if (suterAmount > suterBalance) {
      this.setState({ btnTxt: 'InsuffientBalance' });
    } else if (destinationAddress !== '' && !validDestination) {
      this.setState({ btnTxt: 'InvalidDestinationAddress' });
    } else {
      this.setState({ btnTxt: 'Confirm' });
    }
  }

  handleDestinationChange(e) {
    this.setState({ destinationAddress: e.target.value });
    let validDestination = WAValidator.validate(e.target.value, 'eth');
    let { suterAmount } = this.state;
    let { suterBalance } = this.props;
    if (e.target.value !== '' && !validDestination) {
      this.setState({ btnTxt: 'InvalidDestinationAddress' });
    } else if (suterAmount > suterBalance) {
      this.setState({ btnTxt: 'InsuffientBalance' });
    } else {
      this.setState({ btnTxt: 'Confirm' });
    }
  }

  async submit() {
    let { updateKeyFunc } = this.props;
    const suterAmount = this.state.suterAmount;
    var lastestWeb3 = new Web3(window.ethereum);
    let amount = lastestWeb3.utils.toWei(suterAmount.toString());
    // check if allowance is enough
    const { formType, account } = this.props;
    let bridgeInfo = BridgeInfo[formType];

    const suterContract = new Contract(
      bridgeInfo.TOEKN_ABI,
      bridgeInfo.TOEKN_CONTRACT_ADDRESS,
    );
    suterContract.setProvider(window.ethereum);
    let allowance = await suterContract.methods
      .allowance(account, bridgeInfo.CONTRACT_ADDRESS)
      .call();

    if (allowance - amount >= 0) {
      this.callExchange();
    } else {
      await this.callApprove();
      await this.callExchange();
    }
    // this.setState({suterAmount: '', destinationAddress: ''})
    updateKeyFunc();
  }

  async callApprove() {
    this.setState({ proccesing: true });
    const suterAmount = this.state.suterAmount;
    const { formType, account } = this.props;
    let bridgeInfo = BridgeInfo[formType];
    const suterContract = new Contract(
      bridgeInfo.TOEKN_ABI,
      bridgeInfo.TOEKN_CONTRACT_ADDRESS,
    );
    suterContract.setProvider(window.ethereum);
    let txHash;
    let transaction;
    try {
      var lastestWeb3 = new Web3(window.ethereum);
      let amount = lastestWeb3.utils.toWei(suterAmount.toString());
      transaction = await suterContract.methods
        .increaseAllowance(bridgeInfo.CONTRACT_ADDRESS, amount)
        .send({ from: account, gas: '60000' });
    } catch (error) {
      console.log('callApprove error=', error);
      openNotificationWithIcon(
        'Metamask deny!',
        'User denied transaction signature',
        'warning',
        10,
      );
      this.setState({ proccesing: false });
      return;
    }
    txHash = transaction['transactionHash'];
    const message = `View in etherscan`;
    const aLink = `${bridgeInfo.SCAN}/tx/${txHash}`;
    openNotificationWithIcon(
      'Approve transaction has success sent!',
      <MessageWithAlink message={message} aLink={aLink} />,
      'success',
      10,
    );
    this.setState({ proccesing: false });
  }

  async callExchange() {
    this.setState({ proccesing: true });
    const { formType, account } = this.props;
    let bridgeInfo = BridgeInfo[formType];

    const { suterAmount, destinationAddress } = this.state;
    let txHash;
    let transaction;
    const bridgeContract = new Contract(
      bridgeInfo.ABI,
      bridgeInfo.CONTRACT_ADDRESS,
    );
    bridgeContract.setProvider(window.ethereum);
    try {
      var lastestWeb3 = new Web3(window.ethereum);
      let amount = lastestWeb3.utils.toWei(suterAmount.toString());
      transaction = await bridgeContract.methods
        .exchange(amount, destinationAddress)
        .send({ from: account, gas: '100000' });
    } catch (error) {
      console.log('callExchange error=', error);
      openNotificationWithIcon(
        'Metamask deny!',
        'User denied transaction signature',
        'warning',
        10,
      );
      this.setState({
        proccesing: false,
      });
      return;
    }
    this.setState({ proccesing: false });
    txHash = transaction['transactionHash'];
    const message = `View in etherscan`;
    const aLink = `${bridgeInfo.SCAN}/tx/${txHash}`;
    openNotificationWithIcon(
      'Exchange transaction has success sent!',
      <MessageWithAlink message={message} aLink={aLink} />,
      'success',
      10,
    );
  }
  render() {
    const { suterAmount, destinationAddress, proccesing, btnTxt } = this.state;
    const { suterBalance } = this.props;
    const validDestination = WAValidator.validate(destinationAddress, 'eth');
    const canConfirm =
      validDestination && suterAmount > 0 && suterAmount <= suterBalance;
    return (
      <div className="mint">
        {proccesing ? <SpinModal /> : ''}
        <h1 className="title">Mint</h1>
        <Row>
          <Col span={24}>
            <div className="inputContainer container">
              <p className="inputDesc">Amount</p>
              <input
                className={`input ${
                  suterAmount > suterBalance ? 'invalid' : ''
                }`}
                ref={this.assignRef}
                value={suterAmount}
                placeholder="0 SUTER"
                type="text"
                onChange={this.handleSuterAmountChange}
              />
              <div className="inputAppend">
                <img src={ERC20SuterCoin} />
                <span>ERC20 SUTER</span>
              </div>
              <p
                className={`balance ${
                  suterAmount > suterBalance ? 'insuffientBalance' : ''
                }`}
              >
                Your SUTER Balance: {suterBalance.toLocaleString()}
              </p>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="inputContainer container">
              <p className="inputDesc">Recipient Address</p>
              <input
                className={`destinationInput ${
                  destinationAddress !== '' && !validDestination
                    ? 'invalid'
                    : ''
                }`}
                placeholder="Enter BEP20 SUTER Address"
                value={destinationAddress}
                type="text"
                onChange={this.handleDestinationChange}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="assetContainer container">
              <div className="title">You will receive</div>
              <div className="assets">
                <div>{suterAmount.toLocaleString()}</div>
                <div className="assetsDesc">
                  <img src={BEP20SuterCoin} />
                  &nbsp;
                  <span style={{ fontWeight: 'bold' }}>BEP20</span>&nbsp;
                  <span>SUTER</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="btnContainer container">
              <Button
                shape="round"
                block
                disabled={!canConfirm}
                onClick={this.submit}
              >
                {btnTxt}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Mint;
