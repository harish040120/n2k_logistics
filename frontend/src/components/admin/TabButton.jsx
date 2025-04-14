function TabButton({ isActive, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        isActive ? 'bg-slate-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

export default TabButton;