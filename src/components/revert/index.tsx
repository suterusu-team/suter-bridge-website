import React from "react"
import { Row, Col, Button, notification } from 'antd';
import ERC20SuterCoin from '../../static/erc20_suter_coin.svg';
import TRC20SuterCoin from '../../static/trc20_suter_coin.svg';
import numeral from 'numeral-es6';
import axios from 'axios';
import WAValidator from 'multicoin-address-validator';

class Revert extends React.Component {
  state = {
    suterValue: '',
    suterTxt: 'SUTER',
    dollarValue: 0,
    suterPrice: 0,
    suterValueFontSize: 52,
    destinationAddress: ''
  }

  constructor(props){
    super(props);
    this.handleSuterAmountChange = this.handleSuterAmountChange.bind(this);
    this.fetchSuterPrice = this.fetchSuterPrice.bind(this);
    this.assignRef = this.assignRef.bind(this);
    this.setSuterPrice = this.setSuterPrice.bind(this);
    this.handleDestinationChange = this.handleDestinationChange.bind(this)
  }
  componentDidMount() {
    // this.fetchSuterPrice(this.setSuterPrice, this.openNotificationWithIcon)
  }

  openNotificationWithIcon = (title, desc, type, duration=0) => {
    notification[type]({
      message: title,
      description: desc,
      duration: duration,
    });
  }

  setSuterPrice(price) {
    this.setState({ suterPrice: price })
  }

  fetchSuterPrice(setPriceCallback, notifyCallBack){
    axios.get('/suter_price.json')
     .then(function (response) {
      // handle success
      let price = response.data.result.price;
      let error = response.data.result.error
      if(error == null){
        setPriceCallback(price)
      }else{
        notifyCallBack('Network Error', 'Fetch suter price error', 'warning');
      }
    })
  }

  assignRef(c) {
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

  getSuterValueInteger(suterValue) {
    if(suterValue.indexOf('.') !== -1){
      return parseInt(suterValue.split('.')[0])
    }else{
      return parseInt(suterValue)
    }
  }

  getSuterValueDecimal(suterValue) {
    if(suterValue.indexOf('.') !== -1){
      return `.${suterValue.split('.')[1]}`
    }else{
      return ''
    }
  }
  render () {
    const { onClickFunc } = this.props
    const { suterValue, suterTxt, dollarValue, suterValueFontSize, destinationAddress } = this.state
    const suterValueForInput = `${numeral(this.getSuterValueInteger(suterValue)).format('0,0') }${this.getSuterValueDecimal(suterValue)}`
    const suterAmountValue = (suterValue !== '' ? `${ suterValueForInput } ${suterTxt}` : '')
    // const suterAmountValue = (suterValue !== '' ? `${ suterValue } ${suterTxt}` : '')
    const canNext = (WAValidator.validate(destinationAddress, 'eth')) && ( suterValueForInput.replace(/,/gi, '') > 0)
    return (
      <div className="mint">
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
               <Button type="primary" block disabled={ !canNext } >NEXT</Button>
             </div>
           </Col>
         </Row>
      </div>
    )
  }
}
export default Revert