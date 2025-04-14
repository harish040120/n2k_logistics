import { Dialog } from '@headlessui/react';
import { DELIVERY_STATUSES } from './constants';

function DeliveryUpdateModal({ isOpen, delivery, onClose, onUpdateStatus }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-lg shadow-xl p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Update Delivery Status
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Order ID: {delivery.id}</p>
              <p className="text-sm text-gray-500">Current Status: {delivery.status}</p>
            </div>

            <div className="space-y-2">
              {DELIVERY_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(delivery, status)}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default DeliveryUpdateModal;