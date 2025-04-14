function TrackingHistory({ updates }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking History</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {updates.map((update, idx) => (
            <li key={idx}>
              <div className="relative pb-8">
                {idx !== updates.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <svg
                        className="h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">{update.date}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-900">{update.status}</p>
                      <p className="text-sm text-gray-500">{update.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TrackingHistory;