import React from 'react';
import { Modal, Spin } from 'antd';
import './index.less';

class SpinModal extends React.Component {
  render() {
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
            <h1 style={{ marginBottom: 0 }}>Processing</h1>
            <h1>Your Request</h1>
            <p>
              Don't refresh your page and it might take up to 2 to 3 minutes to
              complete your request.
            </p>
            <Spin size="large" />
          </div>
        </Modal>
      </>
    );
  }
}
export default SpinModal;
