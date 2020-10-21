import React from "react"
import { Row, Col, Button, notification } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import TRC20SuterCoin from '../../static/trc20_suter_coin.svg';
import WAValidator from 'multicoin-address-validator';
import ConfirmModal from '../confirmModal';
import { openNotificationWithIcon, openNotificationWithKey, MessageWithAlink, suterValueForInputFunc, suterAmountForInput, getSuterValueNumber, UncompleteTaskMessage, fetchSuterPrice } from '../tools';


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
    // const suterValue = this.state.suterValue
    // const suterAmount = getSuterValueNumber(suterValue)
    // let txHash
    // const eth = new Eth(web3.currentProvider)
    // const contract = new EthContract(eth)
    // const suterContract = contract(ETHSUTERUSUABI)
    // try{
    //   const suterContractInstance = suterContract.at(ETHSUTERUSUCONTRACTADDRESS)
    //   txHash = await suterContractInstance.increaseAllowance(ETHBRIDGECONTRACTADDRESS, suterAmount * 1000000000000000000, { from: this.props.account, gas: "60000"})
    // }catch(error){
    //   openNotificationWithIcon('Metamask deny!', "User denied transaction signature", 'warning', 10)
    //   this.setState({ submitApprove: false })
    //   return
    // }
    // const message = `View in etherscan`
    // const aLink = `${ETHERSCAN}/tx/${txHash}`
    // openNotificationWithIcon('Approve transaction has success sent!', <MessageWithAlink message={message} aLink={aLink} />, 'success', 10)
    // this.setState({ approveTxid: txHash })
    // this.newTask(txHash, suterAmount)
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
    const { suterValue, suterTxt, dollarValue, suterValueFontSize, destinationAddress, showConfirmModal } = this.state
    const suterValueForInput = suterValueForInputFunc(suterValue)
    const suterAmountValue = suterAmountForInput(suterValue, suterTxt)
    const canNext = (WAValidator.validate(destinationAddress, 'eth')) && (getSuterValueNumber(suterValue) > 0)
    return (
      <div className="mint">
      {  showConfirmModal ? <ConfirmModal visible={showConfirmModal} handleOk={this.handleConfirmOk} handleCancel={this.handleConfirmCancel} title={`Confirm to approve to bridge contract ?`} content={ `Approve ${suterAmountValue} to bridge contract` } /> : ''}
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