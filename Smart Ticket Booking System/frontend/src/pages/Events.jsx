import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/Events.css";

const cities = ["All", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Goa"];

export default function Events() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCity, setSelectedCity] = useState(() => {
    const urlCity = new URLSearchParams(window.location.search).get('city');
    const storedCity = localStorage.getItem('selectedCity');
    return urlCity || storedCity || 'All';
  });
  const [selectedType, setSelectedType] = useState(() => {
    const urlType = new URLSearchParams(window.location.search).get('type');
    return urlType || 'all';
  });
  const [sortBy, setSortBy] = useState("recommended");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [favorites, setFavorites] = useState([]);

  const movies = [
    {
      id: 0,
      name: "Dhurandhar",
      city: "Mumbai",
      price: 360,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/dhurandhar-the-revenge-et00478890-1772893614.jpg",
    },
    {
      id: 1,
      name: "KGF Chapter 2",
      city: "Bangalore",
      price: 300,
      type: "movies",
      image:
        "https://m.media-amazon.com/images/M/MV5BZjY0NzdiODktZTUwYi00MDU5LWE2NjgtOTg3YjUyMmMxZGNhXkEyXkFqcGc@._V1_QL75_UX582_.jpg",
    },
    {
      id: 2,
      name: "RRR",
      city: "Hyderabad",
      price: 250,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/extra/vertical_logo/mobile/thumbnail/xxlarge/rrr-et00094579-1700135873.jpg",
    },
    {
      id: 3,
      name: "Kantara",
      city: "Bangalore",
      price: 220,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kantara-hindi-et00342025-1665304124.jpg",
    },
    {
      id: 4,
      name: "Jawan",
      city: "Mumbai",
      price: 350,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/jawan-et00330424-1693892482.jpg",
    },
    {
      id: 5,
      name: "Pathaan",
      city: "Delhi",
      price: 320,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/pathaan-et00323848-1674372556.jpg",
    },
    {
      id: 6,
      name: "Leo",
      city: "Chennai",
      price: 280,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/leo-et00351731-1675663884.jpg",
    },
    {
      id: 7,
      name: "Salaam",
      city: "Pune",
      price: 300,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/salaam--marathi--et00021681-24-03-2017-17-22-46.jpg",
    },
    {
      id: 8,
      name: "Animal",
      city: "Mumbai",
      price: 340,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/animal-et00311762-1672646524.jpg",
    },
  ];

  const upcomingMovies = [
    {
      id: 21,
      name: "Pushpa 2",
      city: "All",
      price: 350,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/pushpa-2-the-rule-et00356724-1737184762.jpg",
    },
    {
      id: 22,
      name: "Dunki",
      city: "All",
      price: 300,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/dunki-et00326964-1703064829.jpg",
    },
    {
      id: 23,
      name: "Game Changer",
      city: "All",
      price: 330,
      type: "movies",
      image:
        "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/game-changer-et00311772-1731311322.jpg",
    },
  ];

  const events = [
    {
      id: 101,
      name: "Arijit Singh Live",
      city: "Bangalore",
      price: 1500,
      type: "music",
      venue: "Phoenix Arena",
      venueAddress: "Phoenix Arena, 560001, MG Road, Ashok Nagar, Bengaluru, Karnataka",
      image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    },
    {
      id: 102,
      name: "Standup Comedy Night",
      city: "Pune",
      price: 800,
      type: "comedy",
      venue: "Bal Gandharva Rang Mandir",
      venueAddress: "Bal Gandharva Rang Mandir, JM Road, Shivajinagar, Pune, Maharashtra 411005",
      image: "https://in.bmscdn.com/Artist/1085821.jpg",
    },
    {
      id: 103,
      name: "Tech Conference 2026",
      city: "Hyderabad",
      price: 1200,
      type: "play",
      venue: "HITEX Exhibition Centre",
      venueAddress: "HITEX Exhibition Centre, Izzat Nagar, Kondapur, Hyderabad, Telangana 500084",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    },
    {
      id: 104,
      name: "EDM Festival Goa",
      city: "Goa",
      price: 2500,
      type: "music",
      venue: "Vagator Beach Grounds",
      venueAddress: "Vagator Beach Grounds, Vagator, Bardez, North Goa, Goa 403509",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    },
    {
      id: 105,
      name: "Coldplay Concert",
      city: "Mumbai",
      price: 5000,
      type: "music",
      venue: "DY Patil Stadium",
      venueAddress: "DY Patil Stadium, Sector 7, Nerul, Navi Mumbai, Maharashtra 400706",
      image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae",
    },
    {
      id: 106,
      name: "IPL Match - MI vs CSK",
      city: "Mumbai",
      price: 2000,
      type: "sports",
      venue: "Wankhede Stadium",
      venueAddress: "Wankhede Stadium, D Road, Churchgate, Mumbai, Maharashtra 400020",
      image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c",
    },
  ];

  const upcomingEvents = [
    {
      id: 201,
      name: "Sunburn Festival 2026",
      city: "Goa",
      price: 3500,
      type: "music",
      venue: "Sunburn Arena",
      venueAddress: "Sunburn Arena, Candolim Beach Road, Candolim, Goa 403515",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
    },
    {
      id: 202,
      name: "Startup Summit India",
      city: "Bangalore",
      price: 1800,
      type: "play",
      venue: "KTPO Trade Center",
      venueAddress: "KTPO Trade Center, Whitefield, Bengaluru, Karnataka 560066",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    },
    {
      id: 203,
      name: "Comedy Fest",
      city: "Mumbai",
      price: 900,
      type: "comedy",
      venue: "Nehru Centre Auditorium",
      venueAddress: "Nehru Centre Auditorium, Dr Annie Besant Road, Worli, Mumbai, Maharashtra 400018",
      image:
        "https://assets-in.bmscdn.com/nmcms/events/banner/weblisting/vipul-goyal-unleashed-surat-et00476535-2025-12-16-t-8-33-46.jpg",
    },
  ];

  // Handle search query from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    // Search is handled through URL params
  }, [searchParams]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedType(typeParam.toLowerCase());
    } else if (!typeParam) {
      setSelectedType('all');
    }
  }, [searchParams]);

  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam && cities.includes(cityParam)) {
      setSelectedCity(cityParam);
    } else if (!cityParam) {
      const storedCity = localStorage.getItem('selectedCity');
      if (storedCity && cities.includes(storedCity)) {
        setSelectedCity(storedCity);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);



  const allItems = useMemo(
    () => [...movies, ...upcomingMovies, ...events, ...upcomingEvents],
    []
  );

  const filteredCount = useMemo(() => {
    const searchQuery = searchParams.get('search') || '';
    return allItems.filter((item) => {
      const cityMatch =
        selectedCity === "All" ||
        item.city?.toLowerCase() === selectedCity.toLowerCase() ||
        item.city === "All";
      const typeMatch = selectedType === 'all' || item.type === selectedType;
      const priceMatch = item.price <= maxPrice;
      const searchMatch = !searchQuery || 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return cityMatch && typeMatch && priceMatch && searchMatch;
    }).length;
  }, [allItems, maxPrice, selectedCity, selectedType, searchParams]);

  const applyFiltersAndSort = (data) => {
    const searchQuery = searchParams.get('search') || '';
    const filtered = data.filter((item) => {
      const cityMatch =
        selectedCity === "All" ||
        item.city?.toLowerCase() === selectedCity.toLowerCase() ||
        item.city === "All";
      const typeMatch = selectedType === 'all' || item.type === selectedType;
      const priceMatch = item.price <= maxPrice;
      const searchMatch = !searchQuery || 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return cityMatch && typeMatch && priceMatch && searchMatch;
    });

    if (sortBy === "priceLow") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "priceHigh") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getRating = (id) => (8 + (id % 20) / 10).toFixed(1);

  const renderRow = (title, subtitle, data) => {
    const rows = applyFiltersAndSort(data);

    return (
      <section className="events-section" aria-label={title}>
        <div className="events-section__head">
          <div>
            <h2 className="events-section-title">{title}</h2>
            <p className="events-section-sub">{subtitle}</p>
          </div>
          <span className="events-count-pill">{rows.length} results</span>
        </div>

        {rows.length === 0 ? (
          <div className="events-empty">
            <p>No matches for current filters in this section.</p>
          </div>
        ) : (
          <div className="events-row">
            {rows.map((item) => {
              const isFav = favorites.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="events-card"
                  onClick={() => navigate(`/event/${item.id}`, { state: item })}
                >
                  <div className="events-card__media">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="events-card__poster"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://picsum.photos/seed/ticketx-fallback/400/600";
                      }}
                    />
                    <span className="events-card__rating">{getRating(item.id)} IMDb</span>
                    <button
                      type="button"
                      className={`events-card__fav${isFav ? " events-card__fav--active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      aria-label={isFav ? "Remove favorite" : "Add favorite"}
                    >
                      {isFav ? "❤" : "♡"}
                    </button>
                  </div>
                  <h4 className="events-card__name">{item.name}</h4>
                  <p className="events-card__city">{item.city}</p>
                  <div className="events-card__foot">
                    <p className="events-card__price">Rs. {item.price}</p>
                    <span className="events-card__cta">Book</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="events-page">
      <header className="events-hero">
        <h1 className="events-hero__title">Discover Events and Movies</h1>
        <p className="events-hero__sub">Filter by city, refine by budget, and book in seconds.</p>
      </header>

      <section className="events-toolbar" aria-label="Filters and sorting">
        <div className="events-toolbar__group">
          <label htmlFor="sortBy">Sort</label>
          <select
            id="sortBy"
            className="events-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <div className="events-toolbar__group events-toolbar__group--range">
          <label htmlFor="maxPrice">Max Price: Rs. {maxPrice}</label>
          <input
            id="maxPrice"
            type="range"
            min="200"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div className="events-toolbar__summary">
          Showing <strong>{filteredCount}</strong> items
        </div>
      </section>


      {(selectedType === 'all' || selectedType === 'movies') && renderRow("Now Showing", "Current theatrical releases", movies)}
      {(selectedType === 'all' || selectedType === 'movies') && renderRow("Upcoming Movies", "Advance booking now open", upcomingMovies)}
      {(selectedType === 'all' || ['music', 'comedy', 'play', 'sports'].includes(selectedType)) && renderRow("Live Events", "Concerts, comedy and tech gatherings", events)}
      {(selectedType === 'all' || ['music', 'comedy', 'play'].includes(selectedType)) && renderRow("Upcoming Events", "Plan your next outing ahead", upcomingEvents)}
    </div>
  );
}
