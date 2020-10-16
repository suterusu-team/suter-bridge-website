import React from "react";
import { Card } from 'antd';
import Mint from '../mint';
import Revert from '../revert';

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
	state = {
    key: 'Mint',
    noTitleKey: 'Mint',
  };

  constructor(props){
    super(props);
  }

  onTabChange = (key, type) => {
    this.setState({ [type]: key });
  };

  render () {
    const { account } = this.props
  	return (
  		<div className='form'>
        <Card
          title=""
          tabList={tabList}
          activeTabKey={this.state.key}
          onTabChange={key => {
            this.onTabChange(key, 'key');
          }}
        >
          {contentList[this.state.key](account)}
        </Card>
  		</div>
  	)
  }
}

export default Form