import React, { useState } from 'react';
import { Drawer } from 'antd';
import { DropMenu } from '../../components/nav';
import { MenuOutlined } from '@ant-design/icons';
import './index.less';

const MobileNav = props => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <div className="mobbile-MenuOutlined">
        <span onClick={showDrawer}>
          <MenuOutlined className="MenuOutlined" />
        </span>
      </div>
      <Drawer
        className="mobileNav"
        title={props.intl.get('DiscoverMore')}
        placement="right"
        closable={true}
        onClose={onClose}
        visible={visible}
        height={100}
      >
        {DropMenu(props.intl, props.currentNav)}
      </Drawer>
    </div>
  );
};

export default MobileNav;
