import { useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa"; // Import icons from react-icons

// Updated DELIVERY_POINTS with Coimbatore Booking Office
const DELIVERY_POINTS = {
  NAMBIYUR: [
    "Gobi",
    "Nambiur",
    "E. Setipalaiyam",
    "Alukkuli",
    "Kaasiyur",
    "Kurumanthur",
    "Anthiyur",
    "P. Vellalapalayam",
    "Kavandapadi",
    "Appakudal",
    "Pudukaraipudur",
    "S.G. Palayam",
    "K.M. Kovi",
    "Sittur",
    "Bhavani",
    "Vellithiruppoor",
    "Chennampatti",
    "Sanisandhai",
    "Boothapadi",
    "Guruvareddyur",
    "Paruvachchi",
    "Poonachchi",
    "Suttikalmedu",
    "Kalangiyam",
    "Kumarapalayam",
    "Saththiyamangalam",
    "Puliyampatti",
    "Ukkaram",
    "Metukkadai",
    "Ringattur",
    "Chikkarasampalayam",
    "Bhavanisagar",
    "Keelpavani",
    "T.N.Palayam",
    "K.N.Palayam",
    "T.G.Pudur",
    "Kallipatti",
    "Atthani",
    "Keelvani",
    "Pariyur",
    "Arasur",
    "Kodumudi",
    "Kunnathur",
    "Perumanallur",
    "Kolappalur",
    "Vellalangkovil",
    "Pandiyampalayam",
    "Kallampatti",
    "Vijayamangalam",
    "Kaanchikkovil",
    "Nasiyanur",
    "Perundurai",
    "Sengappalli",
    "Vellangoundampalayam",
    "Modakurichi",
    "KandhasamyPalayam",
    "Palliyuthu",
    "Avalpoonthurai",
    "Arachalur",
    "Uthukuli",
    "Chennimalai",
    "Sivagiri",
    "Muthur",
    "Vellodu",
    "Anumanpalli",
    "Ezhumathur",
    "Naduppalayam",
    "Unjalur",
    "Dharapuram",
    "Avinasi",
    "Velampalayam",
    "Mangalam",
    "Palladam",
    "Pongalur",
    "V.Kalipalayam",
    "Mettukadai",
    "Kundadam",
    "Moolanur",
    "Pudupai",
    "Upparudam",
    "K. Andipalayam",
    "Vanjipalayam Pirivu",
    "Koduvay",
    "Kangayam",
    "Tiruppur Town",
    "Udumalai Pettai",
    "Vavipalayam",
    "Kaluveripalayam",
    "Jallipatti",
    "Senjeriputhur",
    "Periyapatti",
    "Poolavadi",
    "Kudimangalam",
    "Othamadam",
    "Sathiram",
    "Thalaivaiyapattinam",
    "Thungavi",
    "Alangiyam",
    "Manoorpalyam",
    "Madathukulam",
    "Kozhumam",
    "Kaniyur",
    "Elaiyamuthur",
    "Kumaralingam",
    "Kallapiram",
    "Kurichikodai",
    "Pedappampatti",
    "Moongil Thozuvu",
    "Pollachi",
    "Vadachithur",
    "Senjerimalai",
    "Negamam",
    "Mannur",
    "Sulur",
    "Karanampettai",
    "Somanur",
    "Selakkarichal",
    "Vadakkipalayam",
    "Vettaikaranpudur",
    "Ambarampalayam",
    "Anaimalai",
    "Meenakshipuram",
    "Ganapathipalayam",
    "Erusinampatti",
    "Kinathukadavu",
    "Nachipalayam",
    "Velanthavanam",
    "Valandhayamaram",
    "Valukkalpirivu",
    "Sundarapuram",
    "Kuniyamuthur",
    "Kovai Pudur",
    "Mettupalayam",
    "Karamadai",
    "Kanuvai Palayam",
    "Thayanur",
    "Velliangadu",
    "SS Kulam",
    "Ganeshapuram",
    "Annur",
    "Karuvallur",
    "Sirumugai",
    "Lingapuram",
    "Sevur",
    "Thudiyalur",
    "Thondamuthur",
    "Kalampalayam",
    "Pooluvapatti",
    "Alandhurai",
    "Narasipuram",
    "Mathampatti",
    "Vellakkinaru",
  ],
  COIMBATORE: [
    "Gobi",
    "Nambiur",
    "E. Setipalaiyam",
    "Alukkuli",
    "Kaasiyur",
    "Kurumanthur",
    "Anthiyur",
    "P. Vellalapalayam",
    "Kavandapadi",
    "Appakudal",
    "Pudukaraipudur",
    "S.G. Palayam",
    "K.M. Kovi",
    "Sittur",
    "Bhavani",
    "Vellithiruppoor",
    "Chennampatti",
    "Sanisandhai",
    "Boothapadi",
    "Guruvareddyur",
    "Paruvachchi",
    "Poonachchi",
    "Suttikalmedu",
    "Kalangiyam",
    "Kumarapalayam",
    "Saththiyamangalam",
    "Puliyampatti",
    "Ukkaram",
    "Metukkadai",
    "Ringattur",
    "Chikkarasampalayam",
    "Bhavanisagar",
    "Keelpavani",
    "T.N.Palayam",
    "K.N.Palayam",
    "T.G.Pudur",
    "Kallipatti",
    "Atthani",
    "Keelvani",
    "Pariyur",
    "Arasur",
    "Kodumudi",
    "Kunnathur",
    "Perumanallur",
    "Kolappalur",
    "Vellalangkovil",
    "Pandiyampalayam",
    "Kallampatti",
    "Vijayamangalam",
    "Kaanchikkovil",
    "Nasiyanur",
    "Perundurai",
    "Sengappalli",
    "Vellangoundampalayam",
    "Modakurichi",
    "KandhasamyPalayam",
    "Palliyuthu",
    "Avalpoonthurai",
    "Arachalur",
    "Uthukuli",
    "Chennimalai",
    "Sivagiri",
    "Muthur",
    "Vellodu",
    "Anumanpalli",
    "Ezhumathur",
    "Naduppalayam",
    "Unjalur",
    "Dharapuram",
    "Avinasi",
    "Velampalayam",
    "Mangalam",
    "Palladam",
    "Pongalur",
    "V.Kalipalayam",
    "Mettukadai",
    "Kundadam",
    "Moolanur",
    "Pudupai",
    "Upparudam",
    "K. Andipalayam",
    "Vanjipalayam Pirivu",
    "Koduvay",
    "Kangayam",
    "Tiruppur Town",
    "Udumalai Pettai",
    "Vavipalayam",
    "Kaluveripalayam",
    "Jallipatti",
    "Senjeriputhur",
    "Periyapatti",
    "Poolavadi",
    "Kudimangalam",
    "Othamadam",
    "Sathiram",
    "Thalaivaiyapattinam",
    "Thungavi",
    "Alangiyam",
    "Manoorpalyam",
    "Madathukulam",
    "Kozhumam",
    "Kaniyur",
    "Elaiyamuthur",
    "Kumaralingam",
    "Kallapiram",
    "Kurichikodai",
    "Pedappampatti",
    "Moongil Thozuvu",
    "Pollachi",
    "Vadachithur",
    "Senjerimalai",
    "Negamam",
    "Mannur",
    "Sulur",
    "Karanampettai",
    "Somanur",
    "Selakkarichal",
    "Vadakkipalayam",
    "Vettaikaranpudur",
    "Ambarampalayam",
    "Anaimalai",
    "Meenakshipuram",
    "Ganapathipalayam",
    "Erusinampatti",
    "Kinathukadavu",
    "Nachipalayam",
    "Velanthavanam",
    "Valandhayamaram",
    "Valukkalpirivu",
    "Sundarapuram",
    "Kuniyamuthur",
    "Kovai Pudur",
    "Mettupalayam",
    "Karamadai",
    "Kanuvai Palayam",
    "Thayanur",
    "Velliangadu",
    "SS Kulam",
    "Ganeshapuram",
    "Annur",
    "Karuvallur",
    "Sirumugai",
    "Lingapuram",
    "Sevur",
    "Thudiyalur",
    "Thondamuthur",
    "Kalampalayam",
    "Pooluvapatti",
    "Alandhurai",
    "Narasipuram",
    "Mathampatti",
    "Vellakkinaru",
  ],
};

export default function DeliveryPointsManager() {
  const [selectedHub, setSelectedHub] = useState("NAMBIYUR");
  const [newPoint, setNewPoint] = useState("");
  const [points, setPoints] = useState(DELIVERY_POINTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;

    setPoints((prev) => ({
      ...prev,
      [selectedHub]: [...prev[selectedHub], newPoint.trim()],
    }));
    setNewPoint("");
  };

  const handleRemovePoint = (point) => {
    setPoints((prev) => ({
      ...prev,
      [selectedHub]: prev[selectedHub].filter((p) => p !== point),
    }));
  };

  // Filter delivery points based on search query
  const filteredPoints = points[selectedHub].filter((point) =>
    point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Manage Delivery Points
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Hub
        </label>
        <select
          value={selectedHub}
          onChange={(e) => setSelectedHub(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(points).map((hub) => (
            <option key={hub} value={hub}>
              {hub}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add New Delivery Point
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter delivery point name"
          />
          <button
            onClick={handleAddPoint}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Delivery Points
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search delivery points"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Current Delivery Points
        </h3>
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredPoints.map((point) => (
            <div
              key={point}
              className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{point}</span>
              <button
                onClick={() => handleRemovePoint(point)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
