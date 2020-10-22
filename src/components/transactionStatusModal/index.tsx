import React from "react";
import { Modal, Button, Steps, Tooltip } from 'antd';
import { MessageWithAlink } from '../tools';
import './index.less'
import { LoadingOutlined } from '@ant-design/icons';
import MintedIcon from  '../../static/minted.svg';

const { Step } = Steps;

const titleWraper = (title: string, aLink: string) => {
   return(<>
          <Tooltip placement="topLeft" title="View in block chain" arrowPointAtCenter>
            <h2 className='title'><a href={aLink} target='_blank'>{title}</a></h2>
          </Tooltip>
       </>)
}
class TransactionStatusModal extends React.Component {
  state = {
    blockNumber: 0,
    latestBlockNum: 0,
    status: 0,
    currentStep: 0,
  }

  constructor(props){
    super(props);
    const { initStep } = this.props
    this.state.currentStep = initStep
    this.fetchTransactionStatus = this.fetchTransactionStatus.bind(this)
    this.fetchLastedBlockNum = this.fetchLastedBlockNum.bind(this)
    this.fetchTronTransactionStatus = this.fetchTronTransactionStatus.bind(this)
    this.fetchTronLastedBlockNum = this.fetchTronLastedBlockNum.bind(this)
  }

  componentDidMount() {
    const { network } = this.props
    if(network == 'eth'){
      this.interval = setInterval(this.fetchTransactionStatus, 3000);
    }else{
      this.interval = setInterval(this.fetchTronTransactionStatus, 3000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  stepTips(current: number){
    return( 
    <Steps size="small" current={current}>
      <Step title="Approving" />
      <Step title="Approved" />
      <Step title="Exchanging" />
      <Step title="Exchanged" />
    </Steps>)
  }

  fetchTransactionStatus() {
    const { blockNumber, latestBlockNum, currentStep } = this.state
    const { needConfirmBlockNum } = this.props
    if( latestBlockNum - blockNumber >= needConfirmBlockNum){
      clearInterval(this.interval)
      return
    }
    const { txid } = this.props;
    try {
        web3.eth.getTransactionReceipt(txid, (err, receipt) => {
        console.log(err)
        console.log(receipt)
        if(receipt !== null){
          let status = parseInt(receipt["status"])
          this.setState({ status: status, blockNumber: receipt["blockNumber"] })
          this.fetchLastedBlockNum()
        }
      })
    } catch (err) {
      console.log("fetchTransactionStatus error happen", err)
    }
  }

  fetchLastedBlockNum(){
    const { needConfirmBlockNum } = this.props
    const { blockNumber, currentStep } = this.state
    try {
      web3.eth.getBlockNumber((err, latestBlockNum) => {
         console.log(err)
         console.log(latestBlockNum)
         this.setState({ latestBlockNum: latestBlockNum })
         if( latestBlockNum - blockNumber >= needConfirmBlockNum){
           this.setState({currentStep: currentStep + 1})
         }
       })
    } catch (error) {
     console.log("fetchLastedBlockNum error happen", error)
    }
  }

  async fetchTronLastedBlockNum(){
    const { blockNumber, latestBlockNum, needConfirmBlockNum } = this.state
    if( latestBlockNum - blockNumber >= needConfirmBlockNum){
      clearInterval(this.interval)
      return
    }
    try {
      let result = await window.tronWeb.trx.getCurrentBlock()
      this.setState({ latestBlockNum: result["block_header"]["raw_data"]["number"] })
    } catch (error) {
     console.log("fetchTronLastedBlockNum error happen", error)
    }
  }

  async fetchTronTransactionStatus() {
    const { txid } = this.props;
    try {
      let result = await window.tronWeb.trx.getTransactionInfo(txid);
      if(result !== null && result["receipt"] != null){
        let status = result["receipt"]["result"] == "success" ? 1 : 0
        this.setState({ status: status, blockNumber: result["blockNumber"] })
        this.fetchTronLastedBlockNum()
      } 
    }catch(error){
      console.log("fetchTronTransactionStatus error happen", error)
    }
  }
  render() {
  	const { title, visible, handleOk, txid, okText, needConfirmBlockNum, network } = this.props;
    const { status, currentStep, blockNumber, latestBlockNum } = this.state
    let confirmBlockNum = latestBlockNum - blockNumber
    // let viewText = (network == 'eth' ? 'View in etherscan' : 'View in tronscan')
    let viewLink = (network == 'eth' ? `${ETHERSCAN}/tx/${txid}` :  `${TRONSCAN}/#/transaction/${txid}`)
    return (
      <>
        <Modal 
          className="transactionStatusModal"
          title = {this.stepTips(currentStep)}
          visible={visible}
          closable={false}
          onOk={handleOk}
          footer={[
            <Button key="submit" type="primary" block onClick={handleOk} disabled={ confirmBlockNum < needConfirmBlockNum } loading={ confirmBlockNum < needConfirmBlockNum}>
              { okText }
            </Button>
          ]}
        > 
          { titleWraper(title, viewLink) }
          {/* <div className="loadingIconContainer">{confirmBlockNum < needConfirmBlockNum ? <LoadingOutlined /> : ''}</div> */}
          {/* <p>{ <MessageWithAlink message={viewText} aLink={viewLink} /> } </p> */}
          <div className="infoItemContainer">
            <div>{ status !== 1 ? 'Mining' : 'Mined' }</div>
            <div>{ status === 1 ? <img src={MintedIcon} /> : <LoadingOutlined /> }</div>
          </div>
          <div className="infoItemContainer">
            <div>Block Number: </div>
            <div>{ blockNumber }</div>
          </div>
          <div className="infoItemContainer">
            <div>Latest Block Number: </div>
            <div>{ latestBlockNum }</div>
          </div>
          <div className="infoItemContainer">
            <div>Confirmed Block: </div>
            <div>{ confirmBlockNum > 0 ? confirmBlockNum : 0 }</div>
          </div>
        </Modal>
      </>
    );
  }
}
export default TransactionStatusModal