import React from "react"
import { Row, Col, Button, notification } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import TRC20SuterCoin from '../../static/trc20_suter_coin.svg';
import WAValidator from 'multicoin-address-validator';
import ConfirmModal from '../confirmModal';
import { openNotificationWithIcon, openNotificationWithKey, MessageWithAlink, suterValueForInputFunc, suterAmountForInput, getSuterValueNumber, UncompleteTaskMessage, fetchSuterPrice } from '../tools';
import TransactionStatusModal from '../transactionStatusModal';

class Revert extends React.Component {
  state = {
    suterValue: '',
    suterTxt: 'SUTER',
    dollarValue: 0,
    suterPrice: 0,
    suterValueFontSize: 52,
    destinationAddress: '',
    showConfirmModal: false,
    submitApprove: false,
    approveTxid: '',
    approveStatus: 0,
    exchangeTxid: '',
    exchangeStatus: 0,
    uncompleteTasks: []
  }

  constructor(props){
    super(props);
    this.handleSuterAmountChange = this.handleSuterAmountChange.bind(this);
    this.assignRef = this.assignRef.bind(this);
    this.setSuterPrice = this.setSuterPrice.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this)
    this.submit = this.submit.bind(this)
    this.handleConfirmOk = this.handleConfirmOk.bind(this)
    this.handleConfirmCancel = this.handleConfirmCancel.bind(this)
    this.callApprove = this.callApprove.bind(this)
    this.callExchange = this.callExchange.bind(this)
    this.newTask = this.newTask.bind(this)
    this.approveFinished = this.approveFinished.bind(this)
    this.exchangeFinished = this.exchangeFinished.bind(this)
    this.updateExchangeTxid = this.updateExchangeTxid.bind(this)
    this.updateExchangeStatus = this.updateExchangeStatus.bind(this)
  }
  componentDidMount() {
    this.setSuterPrice()
  }

  async setSuterPrice() {
    let price = await fetchSuterPrice()
    this.setState({ suterPrice: price })
  }
  
  assignRef(c) {
    this.inputRef = c;
  }

  submit() {
    this.confirmToApprove()
  }

  confirmToApprove(){
    this.setState({ showConfirmModal: true })
  }

  handleConfirmOk() {
    this.setState({ showConfirmModal: false, submitApprove: true })
    this.callApprove()
   }
   
 
   handleConfirmCancel(){
     this.setState({ showConfirmModal: false })
   }

   async callApprove(){
    const suterValue = this.state.suterValue
    const suterAmount = getSuterValueNumber(suterValue)
    let txHash
    try{
      const suterContract = await window.tronWeb.contract().at(TRONSUTERUSUCONTRACTADDRESS)
      txHash = await suterContract.increaseAllowance(TRONBRIDGECONTRACTADDRESS, `${suterAmount * 1000000000000000000}`).send({
        feeLimit: 1000000,
        callValue: 0,
        shouldPollResponse: false
      })
    }catch(error){
      console.log("callApprove error=", error)
      openNotificationWithIcon('TronLink deny!', "User denied transaction signature", 'warning', 10)
      this.setState({ submitApprove: false })
      return
    }
    const message = `View in tronscan`
    const aLink = `${TRONSCAN}/#/transaction/${txHash}`
    openNotificationWithIcon('Approve transaction has success sent!', <MessageWithAlink message={message} aLink={aLink} />, 'success', 10)
    this.setState({ approveTxid: txHash })
    this.newTask(txHash, suterAmount)
  }

  approveFinished(){
    this.setState({ approveStatus: 1 })
  }
  exchangeFinished(){
    this.setState({ exchangeStatus: 1 })
    this.updateExchangeStatus()
    window.location.reload(false);
  }

  async callExchange(){
    this.approveFinished()
    const { suterValue, destinationAddress } = this.state
    let txHash
    try{
      const tronBridgeContract = await window.tronWeb.contract().at(TRONBRIDGECONTRACTADDRESS)
      const suterAmount = parseInt(suterValue)
      txHash = await tronBridgeContract.exchange(`${suterAmount * 1000000000000000000}`, destinationAddress).send({
        feeLimit: 1000000,
        callValue: 0,
        shouldPollResponse: false
      })
    }catch(error){
      openNotificationWithIcon('TronLink deny!', "User denied transaction signature", 'warning', 10)
      this.setState({ approveStatus: 0 })
      return
    }
    const message = `View in tronscan`
    const aLink = `${TRONSCAN}/#/transaction/${txHash}`
    openNotificationWithIcon('Exchange transaction has success sent!', <MessageWithAlink message={message} aLink={aLink} />, 'success', 10)
    this.setState({ exchangeTxid: txHash })
    this.updateExchangeTxid(txHash)
  }

  newTask(approveTxid: string, amount: number){
    const { destinationAddress } = this.state
    let myTaskKey = `myRevertTask${this.props.account}${approveTxid}`
    let task = {"account": this.props.account, destinationAddress: destinationAddress, "approveTxid": approveTxid, "amount": amount, "exchangeTxid": '', "exchangeStatus": 0 }
    localStorage.setItem(myTaskKey, JSON.stringify(task));

    let revertTaskKey = `${this.props.account}RevertTask`
    let taskQueue = (localStorage.getItem(revertTaskKey) || "").split(",")
    taskQueue = taskQueue.filter(item => item);
    taskQueue.push(myTaskKey)
    localStorage.setItem(revertTaskKey, taskQueue)
  }

  updateExchangeTxid(exchangeTxid: string){
    const { approveTxid } = this.state
    let myTaskKey = `myRevertTask${this.props.account}${approveTxid}`
    let myTask = localStorage.getItem(myTaskKey)
    if(!myTask){
      console.log(`Can't find a task with key ${myTaskKey}`)
      return
    }
   let myTaskObject = JSON.parse(myTask)
    myTaskObject["exchangeTxid"] = exchangeTxid
    localStorage.setItem(myTaskKey, JSON.stringify(myTaskObject));
  }

  updateExchangeStatus(){
    const { approveTxid } = this.state
    let myTaskKey = `myRevertTask${this.props.account}${approveTxid}`
    let myTask = localStorage.getItem(myTaskKey)
    if(!myTask){
      console.log(`Can't find a task with key ${myTaskKey}`)
      return
    }
    let myTaskObject = JSON.parse(myTask)
    myTaskObject["exchangeStatus"] = 1
    const now = new Date()
    // 3 hour expired
    myTaskObject.expiry = now.getTime() + 7200000
    localStorage.setItem(myTaskKey, JSON.stringify(myTaskObject));
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
    if(e.target.value != '' && !WAValidator.validate(e.target.value, 'eth')){
      openNotificationWithIcon("Invalid input", `'${e.target.value}' is not a valid eth address`, 'warning', 2)
    }
  }
  render () {
    const { suterValue, suterTxt, dollarValue, suterValueFontSize, destinationAddress, showConfirmModal, approveTxid, approveStatus, exchangeTxid,  exchangeStatus} = this.state
    const suterValueForInput = suterValueForInputFunc(suterValue)
    const suterAmountValue = suterAmountForInput(suterValue, suterTxt)
    const canNext = (WAValidator.validate(destinationAddress, 'eth')) && (getSuterValueNumber(suterValue) > 0)
    return (
      <div className="mint">
      {  showConfirmModal ? <ConfirmModal visible={showConfirmModal} handleOk={this.handleConfirmOk} handleCancel={this.handleConfirmCancel} title={`Confirm to approve to bridge contract ?`} content={ `Approve ${suterAmountValue} to bridge contract` } /> : ''}
      { (approveTxid !== '' && approveStatus === 0) ? <TransactionStatusModal visible={true} txid={approveTxid} handleOk={this.callExchange} title={`Approving`} okText={'Next'} nextTip={'You will exchange next'} needConfirmBlockNum = {6} /> : '' }
      { (exchangeTxid !== '' && exchangeStatus === 0) ? <TransactionStatusModal visible={true} txid={exchangeTxid} handleOk={()=>{ this.exchangeFinished() }} title={`Exchanging`} okText={'Finished'} needConfirmBlockNum = {6} nextTip={`You will receive ${suterValueForInput} Suter token on tron network next`} /> : '' }
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
               <img src={TRC20SuterCoin} />
               <span style={{"fontWeight": "bold"}}>TRC20</span>
               <span>SUTER</span>
              </div>
            </div>
         </Col>
        </Row>
        <Row>
         <Col span={24}>
            <div className="destinationContainer container">
              <p>Destination</p>
              <input className="destinationInput" placeholder="Enter ERC20 SUTER Address" type="text" onChange={ this.handleDestinationChange }/>
            </div>
         </Col>
        </Row>
        <Row>
         <Col span={24}>
            <div className="assetContainer container">
              <div>You will receive</div>
              <div>{suterValueForInput}</div>
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
             <div className='btnContainer container'>
               <Button type="primary" block disabled={ !canNext }  onClick={this.submit} >NEXT</Button>
             </div>
           </Col>
         </Row>
      </div>
    )
  }
}
export default Revert