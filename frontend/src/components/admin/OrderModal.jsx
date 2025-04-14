import { Dialog } from '@headlessui/react';
import PlaceOrderForm from './PlaceOrderForm';

function OrderModal({ isOpen, onClose, onRefresh }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl w-full bg-white rounded-lg shadow-xl p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Place New Order
          </Dialog.Title>
          
          <PlaceOrderForm onClose={onClose} onRefresh={onRefresh} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default OrderModal;