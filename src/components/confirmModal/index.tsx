import React from "react";
import { Modal, Button } from 'antd';

class ConfirmModal extends React.Component {
  render() {
  	const { title, content, visible, handleOk,  handleCancel} = this.props;
    return (
      <>
        <Modal
          title = {title}
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>{content}</p>
        </Modal>
      </>
    );
  }
}
export default ConfirmModal