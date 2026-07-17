import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-[var(--brand-ink)]/80 mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  )
}
