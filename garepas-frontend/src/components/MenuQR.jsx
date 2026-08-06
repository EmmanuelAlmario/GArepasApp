import { QRCodeSVG } from 'qrcode.react'
import Modal from './Modal'
import Button from './Button'

const MENU_URL = `${window.location.origin}/menu`

export default function MenuQR({ onClose }) {
  return (
    <Modal title="Menú digital — QR" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-200">
          <QRCodeSVG value={MENU_URL} size={200} level="M" includeMargin={false} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{MENU_URL}</p>
          <p className="text-xs muted mt-1">
            Imprime este QR y pégalo en el mostrador o la vitrina: los clientes escanean y ven el menú con precios.
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" className="flex-1" onClick={() => window.open(MENU_URL, '_blank')}>Abrir menú</Button>
        </div>
      </div>
    </Modal>
  )
}