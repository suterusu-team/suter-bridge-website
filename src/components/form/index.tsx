import React from "react";
import { Card } from 'antd';
import Mint from '../mint';
import Revert from '../revert';
import { openNotificationWithIcon } from '../tools';
import "./index.less"

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
  Mint: function(account) { return <Mint account={ account } /> },
  Revert: function(account) { return <Revert account={ account } /> },
};

class Form extends React.Component {
  constructor(props){
    super(props);
  }
  tabListWrapper = () => {
    const { formType } = this.props
    let newTabList = []
    for(const item of tabList){
       let newItem = {}
       if(item["key"] !== formType){
        newItem = {...item, disabled: true}
       }else{
         newItem = {...item }
       }
       newTabList.push(newItem)
    }
    return newTabList
  }

  onTabChange = (key, type) => {
    if(key == "Mint"){
      openNotificationWithIcon("Invalid operation", `${key} is not allowed, please connect Metamask`, 'warning', 4.5)
    }else{
      openNotificationWithIcon("Invalid operation", `${key} is not allowed, please connect TronLink`, 'warning', 4.5)
    }
  };

  render () {
    const { account, formType } = this.props
  	return (
  		<div className='form'>
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
  	)
  }
}

export default Form