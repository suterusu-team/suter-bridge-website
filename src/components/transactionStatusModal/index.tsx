import React from 'react';
import { Modal, Button, Steps, Tooltip } from 'antd';
import { MessageWithAlink } from '../tools';
import './index.less';
import { LoadingOutlined } from '@ant-design/icons';
import MintedIcon from '../../static/minted.svg';
import ErrorIcon from '../../static/error.svg';

const { Step } = Steps;

const titleWraper = (title: string, aLink: string) => {
  return (
    <>
      <Tooltip
        placement="topLeft"
        title="View in block chain"
        arrowPointAtCenter
      >
        <h2 className="title">
          <a href={aLink} target="_blank">
            {title}
          </a>
        </h2>
      </Tooltip>
    </>
  );
};
class TransactionStatusModal extends React.Component {
  state = {
    blockNumber: 0,
    latestBlockNum: 0,
    status: 0,
    currentStep: 0,
  };

  constructor(props) {
    super(props);
    const { initStep } = this.props;
    this.state.currentStep = initStep;
    this.fetchTransactionStatus = this.fetchTransactionStatus.bind(this);
    this.fetchLastedBlockNum = this.fetchLastedBlockNum.bind(this);
    this.fetchTronTransactionStatus = this.fetchTronTransactionStatus.bind(
      this,
    );
    this.fetchTronLastedBlockNum = this.fetchTronLastedBlockNum.bind(this);
  }

  componentDidMount() {
    const { network } = this.props;
    if (network == 'eth') {
      this.interval = setInterval(this.fetchTransactionStatus, 3000);
    } else {
      this.interval = setInterval(this.fetchTronTransactionStatus, 3000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  stepTips(current: number) {
    return (
      <Steps size="small" current={current}>
        <Step title="Approving" />
        <Step title="Approved" />
        <Step title="Exchanging" />
        <Step title="Exchanged" />
      </Steps>
    );
  }

  fetchTransactionStatus() {
    const { blockNumber, latestBlockNum, currentStep } = this.state;
    const { needConfirmBlockNum } = this.props;
    if (latestBlockNum - blockNumber >= needConfirmBlockNum) {
      clearInterval(this.interval);
      return;
    }
    const { txid } = this.props;
    try {
      web3.eth.getTransactionReceipt(txid, (err, receipt) => {
        console.log(err);
        console.log(receipt);
        if (receipt !== null) {
          let status = parseInt(receipt['status']);
          this.setState(
            {
              status: status == 1 ? status : 2,
              blockNumber: receipt['blockNumber'],
            },
            () => {
              this.fetchLastedBlockNum();
            },
          );
        }
      });
    } catch (err) {
      console.log('fetchTransactionStatus error happen', err);
    }
  }

  fetchLastedBlockNum() {
    const { needConfirmBlockNum } = this.props;
    const { blockNumber, currentStep } = this.state;
    try {
      web3.eth.getBlockNumber((err, latestBlockNum) => {
        console.log(err);
        console.log(latestBlockNum);
        this.setState({ latestBlockNum: latestBlockNum });
        if (latestBlockNum - blockNumber >= needConfirmBlockNum) {
          this.setState({ currentStep: currentStep + 1 });
        }
      });
    } catch (error) {
      console.log('fetchLastedBlockNum error happen', error);
    }
  }

  async fetchTronLastedBlockNum() {
    const { needConfirmBlockNum } = this.props;
    const { blockNumber, currentStep } = this.state;
    try {
      let result = await window.tronWeb.trx.getCurrentBlock();
      let latestBlockNum = result['block_header']['raw_data']['number'];
      this.setState({ latestBlockNum: latestBlockNum });
      if (latestBlockNum - blockNumber >= needConfirmBlockNum) {
        this.setState({ currentStep: currentStep + 1 });
      }
    } catch (error) {
      console.log('fetchTronLastedBlockNum error happen', error);
    }
  }

  async fetchTronTransactionStatus() {
    const { needConfirmBlockNum } = this.props;
    const { blockNumber, latestBlockNum } = this.state;
    if (latestBlockNum - blockNumber >= needConfirmBlockNum) {
      clearInterval(this.interval);
      return;
    }
    const { txid } = this.props;
    try {
      let result = await window.tronWeb.trx.getTransactionInfo(txid);
      if (result !== null && result['receipt'] != null) {
        console.log('receipt=', result['receipt']);
        let status = result['receipt']['result'] == 'SUCCESS' ? 1 : 2;
        this.setState(
          { status: status, blockNumber: result['blockNumber'] },
          () => {
            this.fetchTronLastedBlockNum();
          },
        );
      }
    } catch (error) {
      console.log('fetchTronTransactionStatus error happen', error);
    }
  }
  render() {
    const {
      title,
      visible,
      handleOk,
      handleCancel,
      txid,
      okText,
      needConfirmBlockNum,
      network,
    } = this.props;
    const { status, currentStep, blockNumber, latestBlockNum } = this.state;
    let confirmBlockNum = latestBlockNum - blockNumber;
    // let viewText = (network == 'eth' ? 'View in etherscan' : 'View in tronscan')
    let viewLink =
      network == 'eth'
        ? `${ETHERSCAN}/tx/${txid}`
        : `${TRONSCAN}/#/transaction/${txid}`;
    let disableOrLoading =
      status == 0 || (status == 1 && confirmBlockNum < needConfirmBlockNum);
    return (
      <>
        <Modal
          className="transactionStatusModal"
          title={this.stepTips(currentStep)}
          visible={visible}
          closable={false}
          onOk={handleOk}
          footer={[
            <Button
              key="submit"
              shape="round"
              size={'large'}
              type="primary"
              block
              onClick={status == 1 ? handleOk : handleCancel}
              disabled={disableOrLoading}
              loading={disableOrLoading}
            >
              {disableOrLoading ? 'Loading' : status == 1 ? okText : 'Cancel'}
            </Button>,
          ]}
        >
          {titleWraper(title, viewLink)}
          {/* <div className="loadingIconContainer">{confirmBlockNum < needConfirmBlockNum ? <LoadingOutlined /> : ''}</div> */}
          {/* <p>{ <MessageWithAlink message={viewText} aLink={viewLink} /> } </p> */}
          <div className="infoItemContainer">
            <div>{status == 1 ? 'Mined' : status == 0 ? 'Mining' : 'Fail'}</div>
            <div>
              {status === 1 ? (
                <img src={MintedIcon} />
              ) : status == 0 ? (
                <LoadingOutlined />
              ) : (
                <img src={ErrorIcon} />
              )}
            </div>
          </div>
          <div className="infoItemContainer">
            <div>Block Number: </div>
            <div>{blockNumber}</div>
          </div>
          <div className="infoItemContainer">
            <div>Latest Block Number: </div>
            <div>{latestBlockNum}</div>
          </div>
          <div className="infoItemContainer">
            <div>Confirmed Block: </div>
            <div>{confirmBlockNum > 0 ? confirmBlockNum : 0}</div>
          </div>
        </Modal>
      </>
    );
  }
}
export default TransactionStatusModal;
