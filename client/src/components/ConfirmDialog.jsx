import Modal from './Modal';
import './ConfirmDialog.css';

export default function ConfirmDialog({ open, onClose, onConfirm, message }) {
  return (
    <Modal open={open} onClose={onClose} title="¿Estás seguro?"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Eliminar</button>
        </>
      }>
      <p className="confirm-message">{message}</p>
    </Modal>
  );
}
