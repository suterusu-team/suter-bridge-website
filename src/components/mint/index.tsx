import React from "react"
import { Row, Col, Button, notification } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import TRC20SuterCoin from '../../static/trc20_suter_coin.svg';
import axios from 'axios';
import WAValidator from 'multicoin-address-validator';
import { openNotificationWithIcon, MessageWithAlink, suterValueForInputFunc, suterAmountForInput } from '../tools';
import ConfirmModal from '../confirmModal';
import TransactionStatusModal from '../transactionStatusModal';

const Eth = require('ethjs-query');
const EthContract = require('ethjs-contract');

class Mint extends React.Component {
  state = {
    suterValue: '',
    suterTxt: 'SUTER',
    dollarValue: 0,
    suterPrice: 0,
    suterValueFontSize: 52,
    destinationAddress: '',
    showConfirmModal: false,
    approveTxid: ''
  }

  constructor(props){
    super(props);
    this.handleSuterAmountChange = this.handleSuterAmountChange.bind(this);
    this.fetchSuterPrice = this.fetchSuterPrice.bind(this);
    this.assignRef = this.assignRef.bind(this);
    this.setSuterPrice = this.setSuterPrice.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this)
    this.confirmToApprove = this.confirmToApprove.bind(this)
    this.callApprove = this.callApprove.bind(this)
    this.callExchange = this.callExchange.bind(this)
    this.submit = this.submit.bind(this)
    this.handleConfirmOk = this.handleConfirmOk.bind(this)
    this.handleConfirmCancel = this.handleConfirmCancel.bind(this)
    this.recordTask = this.recordTask.bind(this)
  }
  componentDidMount() {
    this.fetchSuterPrice()
  }

  setSuterPrice(price: number) {
    this.setState({ suterPrice: price })
  }

  async fetchSuterPrice(){
    try {
      let response = await axios.get('kucoin_api/api/v1/market/orderbook/level1?symbol=SUTER-USDT')
      if(response.status == 200){
        let price = response.data.data.price;
        this.setSuterPrice(parseFloat(price))
      }else{
        console.log(response)
        openNotificationWithIcon('Price Api Error', 'Fetch suter price error', 'error', 4.5);
      }
    }catch(error){
      console.log(error)
      openNotificationWithIcon('Network Error', 'Fetch suter price error', 'warning', 4.5);
    }
  }

  assignRef(c: HTMLElement) {
    this.inputRef = c;
  }

  handleSuterAmountChange(e) {
    let suterTxt = this.state.suterTxt;
    let suterAmount = e.target.value.replace(` ${suterTxt}`, '').replace(/,/gi, '');
    if (isNaN(suterAmount) || suterAmount < 0 || suterAmount > 10000000000) {
      if(suterAmount > 10000000000){
        this.openNotificationWithIcon("Invalid Suter Amount", "Suter token total supply is 10000000000", 'warning')
      }
      suterAmount = this.state.suterValue
    }
    let suterValueFontSize = this.state.suterValueFontSize

    if(suterAmount.length > 6) {
      suterValueFontSize = Math.max(suterValueFontSize - (suterAmount.length - 6) * 5, 20)
    }else{
      suterValueFontSize = 52
    }
    let dollarValue = this.state.suterPrice * suterAmount
    this.setState({ suterValue: suterAmount, dollarValue: dollarValue, suterValueFontSize: suterValueFontSize}, () => {
      let pos = this.inputRef.value.length - this.state.suterTxt.length - 1
      this.inputRef.selectionStart = pos
      this.inputRef.selectionEnd = pos
    });
  }

  handleDestinationChange(e) {
    this.setState({ "destinationAddress": e.target.value })
  }

  submit() {
    this.confirmToApprove()
  }

  confirmToApprove(){
    this.setState({ showConfirmModal: true })
  }

  handleConfirmOk() {
   this.setState({ showConfirmModal: false })
   this.callApprove()
  }

  handleConfirmCancel(){
    this.setState({ showConfirmModal: false })
  }

  async callApprove(){
    const suterValue = this.state.suterValue
    const suterAmount = parseInt(suterValue) * 1000000000000000000
    const eth = new Eth(web3.currentProvider)
    const contract = new EthContract(eth)
    const suterContract = contract(ETHSUTERUSUABI)
    const suterContractInstance = suterContract.at(ETHSUTERUSUCONTRACTADDRESS)
    let txHash = await suterContractInstance.increaseAllowance(ETHBRIDGECONTRACTADDRESS, suterAmount, { from: this.props.account })
    const message = `View in etherscan`
    const aLink = `${ETHERSCAN}/tx/${txHash}`
    openNotificationWithIcon('Approve transaction has success sent!', <MessageWithAlink message={message} aLink={aLink} />, 'success')
    this.setState({ approveTxid: txHash })
    this.recordTask(txHash)
  }

  async callExchange(){
    const { suterValue, destinationAddress } = this.state
    const eth = new Eth(web3.currentProvider)
    const contract = new EthContract(eth)

    const ethBridgeContract = contract(ETHBRIDGEABI)
    const ethBridgeContractInstance = ethBridgeContract.at(ETHBRIDGECONTRACTADDRESS)

    const suterAmount = parseInt(suterValue) * 1000000000000000000

    let txHash = await ethBridgeContractInstance.exchange(suterAmount, destinationAddress, { from: this.props.account })
    console.log("callExchange txid=" + txHash)
  }

  async recordTask(approve_txid){
  }

  render () {
  	const { onClickFunc } = this.props
    const { suterValue, suterTxt, dollarValue, suterValueFontSize, destinationAddress, showConfirmModal, approveTxid } = this.state
    const suterValueForInput = suterValueForInputFunc(suterValue)
    const suterAmountValue = suterAmountForInput(suterValue, suterTxt)
    const canNext = (WAValidator.validate(destinationAddress, 'Tron')) && (suterValueForInput > 0)
  	return (
  		<div className="mint">
       {  showConfirmModal ? <ConfirmModal visible={showConfirmModal} handleOk={this.handleConfirmOk} handleCancel={this.handleConfirmCancel} title={`Confirm to approve to bridge contract ?`} content={ `Approve ${suterAmountValue} to bridge contract` } /> : ''}
       { approveTxid !== '' ? <TransactionStatusModal visible={true} txid={approveTxid} handleOk={this.callExchange} handleCancel={()=>{}} title={`Approving`} /> : ''}
  		  <Row>
         <Col span={24}>
            <div className="inputContainer container">
              <input inputMode="numeric" className="input" ref={this.assignRef} value={ suterAmountValue } placeholder="0.00 SUTER" type="text" onChange={ this.handleSuterAmountChange } style={{"fontSize": `${suterValueFontSize}px`}} />
              <p className="dollarValue">=${dollarValue}</p>
            </div>
         </Col>
        </Row>
        <Row>
         <Col span={24}>
            <div className="assetContainer container">
              <div>Asset</div>
              <div>
               <img src={ERC20SuterCoin} />
               <span style={{"fontWeight": "bold"}}>ERC20</span>
               <span>SUTER</span>
              </div>
            </div>
         </Col>
        </Row>
        <Row>
         <Col span={24}>
            <div className="destinationContainer container">
              <p>Destination</p>
              <input className="destinationInput" placeholder="Enter TRC20 SUTER Address" type="text" onChange={ this.handleDestinationChange }/>
            </div>
         </Col>
        </Row>
        <Row>
         <Col span={24}>
            <div className="assetContainer container">
              <div>You will receive</div>
              <div>{suterValueForInput}</div>
              <div>
               <img src={TRC20SuterCoin} />
               <span style={{"fontWeight": "bold"}}>TRC20</span>
               <span>SUTER</span>
              </div>
            </div>
         </Col>
        </Row>
         <Row>
           <Col span={24}>
             <div className='btnContainer container'>
               <Button type="primary" block disabled={ !canNext } onClick={this.submit} >NEXT</Button>
             </div>
           </Col>
         </Row>
      </div>
  	)
  }
}

export default Mint