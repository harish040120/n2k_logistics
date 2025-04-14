function StatusBadge({ status, color }) {
  // Default colors based on status if no specific color is provided
  let bgColor = color ? color : getBgColorByStatus(status);
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {status}
    </span>
  );
}

// Fallback function to determine color if not provided from backend
function getBgColorByStatus(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'In Transit':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default StatusBadge;