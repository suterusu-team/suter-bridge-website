import React from 'react';
import { notification, Tooltip } from 'antd';
import numeral from 'numeral-es6';
import axios from 'axios';

const openNotificationWithIcon = (
  title: string,
  desc: any,
  type: string,
  duration: number = 0,
  onClickFunc = () => {},
) => {
  notification[type]({
    message: title,
    description: desc,
    duration: duration,
    onClick: onClickFunc,
  });
};

const openNotificationWithKey = (
  key: string,
  title: string,
  desc: any,
  type: string,
  duration: number = 0,
  onClickFunc = () => {},
) => {
  const onClickFuncWraper = ckey => () => {
    onClickFunc();
    notification.close(ckey);
  };
  notification[type]({
    key: key,
    message: title,
    description: desc,
    duration: duration,
    onClick: onClickFuncWraper(key),
  });
};

const getSuterValueInteger = (suterValue: string): number => {
  if (suterValue.indexOf('.') !== -1) {
    return parseInt(suterValue.split('.')[0]);
  } else {
    return parseInt(suterValue);
  }
};

const getSuterValueDecimal = (suterValue: string): string => {
  if (suterValue.indexOf('.') !== -1) {
    return `.${suterValue.split('.')[1]}`;
  } else {
    return '';
  }
};

const getSuterValueNumber = (suterValue: string): number => {
  let suterValueProcess = suterValue.replace(/,/g, '');
  if (suterValueProcess != '') {
    return parseFloat(suterValueProcess);
  }
  return 0;
};

function suterValueForInputFunc(suterValue) {
  const suterValueForInput = `${numeral(
    getSuterValueInteger(suterValue),
  ).format('0,0')}${getSuterValueDecimal(suterValue)}`;
  return suterValueForInput;
}

function suterAmountForInput(suterValue, suterTxt) {
  const suterValueForInput = suterValueForInputFunc(suterValue, suterTxt);
  const suterAmountValue =
    suterValue !== '' ? `${suterValueForInput} ${suterTxt}` : '';
  return suterAmountValue;
}

const MessageWithAlink = props => {
  return (
    <a href={props.aLink} target="_blank">
      {props.message}
    </a>
  );
};

const UncompleteTaskMessage = props => {
  const { task, network } = props;
  const message = `View in block chain`;
  const aLinkForApprove =
    network == 'eth'
      ? `${ETHERSCAN}/tx/${task['approveTxid']}`
      : `${BSCSCAN}/#/transaction/${task['approveTxid']}`;
  const aLinkForTransaction =
    network == 'eth'
      ? `${ETHERSCAN}/tx/${task['exchangeTxid']}`
      : `${BSCSCAN}/#/transaction/${task['exchangeTxid']}`;

  return (
    <Tooltip
      placement="topLeft"
      title="Click to continue this task"
      arrowPointAtCenter
    >
      <div>
        <div>Amount: {`${task['amount']} SUTER`}</div>
        <div>
          Destination:{' '}
          {`${task['destinationAddress'].slice(0, 7)}...${task[
            'destinationAddress'
          ].slice(-5)}`}
        </div>
        <div>
          Approve:{' '}
          <a href={aLinkForApprove} target="_blank">
            {message}
          </a>
        </div>
        <div>
          {task['exchangeTxid'] != '' ? (
            <div>
              Exchange:{' '}
              <a href={aLinkForTransaction} target="_blank">
                {message}
              </a>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </Tooltip>
  );
};

const fetchSuterPrice = async () => {
  let suterPrice = 0;
  try {
    let response = await axios.get(
      'kucoin_api/api/v1/market/orderbook/level1?symbol=SUTER-USDT',
    );
    if (response.status == 200) {
      let price = response.data.data.price;
      suterPrice = parseFloat(price);
    } else {
      console.log(response);
      openNotificationWithIcon(
        'Price Api Error',
        'Fetch suter price error',
        'error',
        4.5,
      );
    }
  } catch (error) {
    console.log(error);
    openNotificationWithIcon(
      'Network Error',
      'Fetch suter price error',
      'warning',
      4.5,
    );
  }
  return suterPrice;
};

const EthChainNameMap = {
  '0x1': 'Ethereum Main Network (MainNet)',
  '0x3': 'Ropsten Test Network',
  '0x4': 'Rinkeby Test Network',
  '0x5': 'Goerli Test Network',
  '0x2a': 'Kovan Test Network',
};

const BscChainNameMap = {
  '0x61': 'BSC TestNet',
  '0x38': 'BSC MainNet',
};

const tronChainNameMap = {
  shasta: 'Shasta',
  trongrid: 'MainNet',
};

export {
  openNotificationWithIcon,
  openNotificationWithKey,
  MessageWithAlink,
  suterValueForInputFunc,
  suterAmountForInput,
  getSuterValueNumber,
  UncompleteTaskMessage,
  fetchSuterPrice,
  EthChainNameMap,
  BscChainNameMap,
};
