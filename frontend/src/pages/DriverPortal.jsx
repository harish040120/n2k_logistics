import { useState } from 'react';
import { sendSMS } from '../utils/notifications';
import DriverDeliveryList from '../components/driver/DriverDeliveryList';
import DeliveryUpdateModal from '../components/driver/DeliveryUpdateModal';

function DriverPortal() {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleStatusUpdate = async (delivery, newStatus) => {
    // In a real app, this would update the database
    console.log(`Updating delivery ${delivery.id} to ${newStatus}`);
    
    // Send SMS notifications based on status
    if (newStatus === 'Picked Up') {
      await sendSMS(
        delivery.phoneNumber,
        `Your package ${delivery.id} has been picked up and is on its way!`
      );
    } else if (newStatus === 'Delivered') {
      await sendSMS(
        delivery.phoneNumber,
        `Your package ${delivery.id} has been delivered. Thank you for using our service!`
      );
    }

    setIsUpdateModalOpen(false);
    setSelectedDelivery(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Driver Portal</h1>
      
      <DriverDeliveryList 
        onUpdateDelivery={(delivery) => {
          setSelectedDelivery(delivery);
          setIsUpdateModalOpen(true);
        }}
      />

      {selectedDelivery && (
        <DeliveryUpdateModal
          isOpen={isUpdateModalOpen}
          delivery={selectedDelivery}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedDelivery(null);
          }}
          onUpdateStatus={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default DriverPortal;