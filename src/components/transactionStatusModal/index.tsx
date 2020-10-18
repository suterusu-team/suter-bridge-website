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
  }

  componentDidMount() {
    const thisFetchTransactionStatus = this.fetchTransactionStatus.bind(this);
    this.interval = setInterval(thisFetchTransactionStatus, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  fetchTransactionStatus() {
    const { blockNumber, latestBlockNum } = this.state
    if( latestBlockNum - blockNumber >= 12){
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
      console.log("error happen")
      console.log(err)
    }
  }

  fetchLastedBlockNum(){
    try {
      web3.eth.getBlockNumber((err, latestBlockNum) => {
         console.log(err)
         console.log(latestBlockNum)
         this.setState({ latestBlockNum: latestBlockNum })
       })
    } catch (err) {
     console.log("error happen")
     console.log(err)
    }
  }
  render() {
  	const { title, visible, handleOk, txid } = this.props;
    const { status, blockNumber, latestBlockNum } = this.state
    let confirmBlockNum = latestBlockNum - blockNumber
    return (
      <>
        <Modal 
          className="transactionStatusModal"
          title = {titleWraper(title)}
          visible={visible}
          closable={false}
          onOk={handleOk}
          footer={[
            <Button key="submit" type="primary" block onClick={handleOk} disabled={ confirmBlockNum < 12 } loading={ confirmBlockNum < 12}>
              Next
            </Button>
          ]}
        >
          <div className="loadingIconContainer">{confirmBlockNum < 12 ? <LoadingOutlined /> : ''}</div>
          <p>{ MessageWithAlink(`View in etherscan`, `${ETHERSCAN}/tx/${txid}`) } </p>
          <p>{ status !== 1 ? '区块未打包' : '区块已打包' }</p>
          <p>{ `区块号: ${blockNumber}` }</p>
          <p>{ `最新区块号: ${latestBlockNum}` }</p>
          <p>{ `已经确认: ${ confirmBlockNum > 0 ? confirmBlockNum : 0}个区块` }</p>
        </Modal>
      </>
    );
  }
}
export default TransactionStatusModal