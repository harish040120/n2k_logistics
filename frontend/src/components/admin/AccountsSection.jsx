import { useState } from 'react';
import VehicleAccounts from './accounts/VehicleAccounts';
import LabourManagement from './accounts/LabourManagement';
import FixedAssets from './accounts/FixedAssets';
import TabButton from './TabButton';

export default function AccountsSection() {
  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex space-x-4 mb-6">
        <TabButton 
          isActive={activeTab === 'vehicles'} 
          onClick={() => setActiveTab('vehicles')}
        >
          Vehicle Accounts
        </TabButton>
        <TabButton 
          isActive={activeTab === 'labour'} 
          onClick={() => setActiveTab('labour')}
        >
          Labour Management
        </TabButton>
        <TabButton 
          isActive={activeTab === 'assets'} 
          onClick={() => setActiveTab('assets')}
        >
          Fixed Assets
        </TabButton>
      </div>

      {activeTab === 'vehicles' && <VehicleAccounts />}
      {activeTab === 'labour' && <LabourManagement />}
      {activeTab === 'assets' && <FixedAssets />}
    </div>
  );
}