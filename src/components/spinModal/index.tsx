import React from 'react';
import { Modal, Spin } from 'antd';
import './index.less';

class SpinModal extends React.Component {
  render() {
    let { intl } = this.props;
    return (
      <>
        <Modal
          className="spinModal"
          closable={false}
          visible={true}
          footer={null}
          width={300}
          centered
        >
          <div className="spinContainer">
            <h1 style={{ marginBottom: 0 }}>{intl.get('Processing')}</h1>
            <h1>{intl.get('YourRequest')}</h1>
            <p>{intl.get('SpinTips')}</p>
            <Spin size="large" />
          </div>
        </Modal>
      </>
    );
  }
}
export default SpinModal;
