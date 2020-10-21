import React from "react";
import { Modal, Button } from 'antd';
import { MessageWithAlink } from '../tools';
import './index.less'
import { LoadingOutlined } from '@ant-design/icons';
const titleWraper = (title: string) => {
   return <div><h3 className='title'>{title}</h3></div>
}
class TransactionStatusModal extends React.Component {
  state = {
    blockNumber: 0,
    latestBlockNum: 0,
    status: 0,
  }

  constructor(props){
    super(props);
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

  fetchTransactionStatus() {
    const { blockNumber, latestBlockNum, needConfirmBlockNum } = this.state
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
    try {
      web3.eth.getBlockNumber((err, latestBlockNum) => {
         console.log(err)
         console.log(latestBlockNum)
         this.setState({ latestBlockNum: latestBlockNum })
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
  	const { title, visible, handleOk, txid, okText, nextTip, needConfirmBlockNum, network } = this.props;
    const { status, blockNumber, latestBlockNum } = this.state
    let confirmBlockNum = latestBlockNum - blockNumber
    let viewText = (network == 'eth' ? 'View in etherscan' : 'View in tronscan')
    let viewLink = (network == 'eth' ? `${ETHERSCAN}/tx/${txHash}` :  `${TRONSCAN}/#/transaction/${txid}`)
    return (
      <>
        <Modal 
          className="transactionStatusModal"
          title = {titleWraper(title)}
          visible={visible}
          closable={false}
          onOk={handleOk}
          footer={[
            <Button key="submit" type="primary" block onClick={handleOk} disabled={ confirmBlockNum < needConfirmBlockNum } loading={ confirmBlockNum < needConfirmBlockNum}>
              { okText }
            </Button>
          ]}
        >
          <div className="loadingIconContainer">{confirmBlockNum < needConfirmBlockNum ? <LoadingOutlined /> : ''}</div>
          <p>{ <MessageWithAlink message={viewText} aLink={viewLink} /> } </p>
          <p>{ status !== 1 ? '区块未打包' : '区块已打包' }</p>
          <p>{ `区块号: ${blockNumber}` }</p>
          <p>{ `最新区块号: ${latestBlockNum}` }</p>
          <p>{ `已经确认: ${ confirmBlockNum > 0 ? confirmBlockNum : 0}个区块` }</p>
          <p>{ nextTip }</p>
        </Modal>
      </>
    );
  }
}
export default TransactionStatusModal