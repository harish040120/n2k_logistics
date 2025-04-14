import { useState } from 'react';

function AddVehicleForm() {
  // Static vehicle data -- replace or add as needed
  const staticVehicles = [
    { vehicle_number: 'ABC123', max_capacity_kg: 1000 },
    { vehicle_number: 'XYZ789', max_capacity_kg: 1500 },
    { vehicle_number: 'LMN456', max_capacity_kg: 1200 },
  ];

  const [formData, setFormData] = useState({
    vehicle_number: '',
    max_capacity_kg: '',
    type: '',
    kilometers: '',
    fuelFilled: '',
    fuelPrice: '',
    lastService: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h2>Add Vehicle (Static)</h2>
      <form>
        <input
          type="text"
          name="vehicle_number"
          placeholder="Vehicle Number"
          value={formData.vehicle_number}
          onChange={handleChange}
        />
        <input
          type="number"
          name="max_capacity_kg"
          placeholder="Max Capacity (kg)"
          value={formData.max_capacity_kg}
          onChange={handleChange}
        />
        <input
          type="text"
          name="type"
          placeholder="Vehicle Type"
          value={formData.type}
          onChange={handleChange}
        />
        <input
          type="number"
          name="kilometers"
          placeholder="Kilometers"
          value={formData.kilometers}
          onChange={handleChange}
        />
        <input
          type="number"
          name="fuelFilled"
          placeholder="Fuel Filled"
          value={formData.fuelFilled}
          onChange={handleChange}
        />
        <input
          type="number"
          name="fuelPrice"
          placeholder="Fuel Price"
          value={formData.fuelPrice}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastService"
          placeholder="Last Service"
          value={formData.lastService}
          onChange={handleChange}
        />
      </form>

      <h2>Existing Vehicles (Static Data)</h2>
      <ul>
        {staticVehicles.map((v) => (
          <li key={v.vehicle_number}>
            {v.vehicle_number} - {v.max_capacity_kg} kg
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddVehicleForm;