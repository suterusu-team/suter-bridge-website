import React from 'react';
import { Card } from 'antd';
import Mint from '../mint';
import Revert from '../revert';
import Ethereum from '../../static/Ethereum-icon.svg';
import BSC from '../../static/BSC-icon.svg';
import Arrow from '../../static/arrow-icon.svg';
import {
  openNotificationWithIcon,
  EthChainNameMap,
  BscChainNameMap,
} from '../../components/tools';
import './index.less';

const tabList = [
  {
    key: 'Mint',
    tab: 'Mint',
  },
  {
    key: 'Revert',
    tab: 'Revert',
  },
];

const contentList = {
  Mint: function(account) {
    return <Mint account={account} />;
  },
  Revert: function(account) {
    return <Revert account={account} />;
  },
};

class Form extends React.Component {
  constructor(props) {
    super(props);
  }
  tabListWrapper = () => {
    const { formType } = this.props;
    let newTabList = [];
    for (const item of tabList) {
      let newItem = {};
      if (item['key'] !== formType) {
        newItem = { ...item, disabled: true };
      } else {
        newItem = { ...item };
      }
      newTabList.push(newItem);
    }
    return newTabList;
  };

  onTabChange = (key, type) => {
    const { formType } = this.props;
    if (key == formType) {
      return;
    }
    if (key == 'Mint') {
      openNotificationWithIcon(
        'Invalid operation',
        `${key} is not allowed, please connect Metamask to ${EthChainNameMap[ETH_CHAIN_ID]}`,
        'warning',
        4.5,
      );
    } else {
      openNotificationWithIcon(
        'Invalid operation',
        `${key} is not allowed, please connect Metamask to ${BscChainNameMap[BSC_CHAIN_ID]}`,
        'warning',
        4.5,
      );
    }
  };

  render() {
    const { account, formType } = this.props;
    return (
      <div className="form">
        <div className="topCard">
          <div className="exchangeBalance">
            <p>Current Exchangable Balance:</p>
            <h1>987765578888</h1>
          </div>
          <div>
            {formType === 'mint' ? (
              <div className="iconContainer">
                <img src={Ethereum} alt="bsc" />
                <img src={Arrow} alt="arrow" />
                <img src={BSC} alt="ethereum" />
              </div>
            ) : (
              <div className="iconContainer">
                <img src={BSC} alt="bsc" />
                <img src={Arrow} alt="arrow" />
                <img src={Ethereum} alt="ethereum" />
              </div>
            )}
          </div>
        </div>
        <Card
          tabList={tabList}
          activeTabKey={formType}
          onTabChange={key => {
            this.onTabChange(key, 'key');
          }}
        >
          {contentList[formType](account)}
        </Card>
      </div>
    );
  }
}

export default Form;
