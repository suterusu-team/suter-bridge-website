import React from "react";
import { Modal, Button } from 'antd';

class TransactionStatusModal extends React.Component {
  state = {
    blockNumber: 0,
    latestBlockNum: 0,
    status: 0,
  }

  constructor(props){
    super(props);
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
        let status = parseInt(receipt["status"])
        this.setState({ status: status, blockNumber: receipt["blockNumber"] })
      })
    } catch (err) {
      console.log("error happen")
      console.log(err)
    }

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
  	const { title, content, visible, handleOk, txid } = this.props;
    const { status, blockNumber, latestBlockNum } = this.state
    return (
      <>
        <Modal
          title = {title}
          visible={visible}
          onOk={handleOk}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Return
            </Button>,
            <Button key="submit" type="primary" onClick={handleOk} disabled={ latestBlockNum - blockNumber < 12 }>
              Submit
            </Button>,
          ]}
        >
          <p>{ status !== 1 ? '区块未打包' : '区块已打包' }</p>
          <p>{ `区块号: ${blockNumber}` }</p>
          <p>{ `最新区块号: ${latestBlockNum}` }</p>
          <p>{ `已经确认: ${latestBlockNum - blockNumber}个区块` }</p>
        </Modal>
      </>
    );
  }
}
export default TransactionStatusModal