import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ModalResetPass = (props) => {
  return (
    <>
      <Modal show={props.show} onHide={props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm reset user password</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure to reset password of user: {props.dataModal.vae_user}?</Modal.Body>
        <Modal.Body>Default password: 12345678</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={props.confirmResetPass}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalResetPass;