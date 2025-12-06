import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Import Google Maps API key with fallback
let GOOGLE_MAPS_API_KEY = '';
try {
    // Try to import the config file
    const mapsConfig = require('../config/maps');
    GOOGLE_MAPS_API_KEY = mapsConfig.GOOGLE_MAPS_API_KEY || '';
} catch (error: any) {
    // Config file doesn't exist or has issues, will use mock data
    // This is expected if config/maps.ts is not created yet
    if (error.code !== 'MODULE_NOT_FOUND') {
        console.warn('Google Maps API key not configured. Using mock location data.');
    }
}

import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { useColorScheme } from './useColorScheme';

interface LocationAutocompleteProps {
  placeholder?: string;
  value: string;
  onLocationSelect: (location: string) => void;
  icon?: React.ReactNode;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationAutocomplete({ 
  placeholder, 
  value, 
  onLocationSelect,
  icon 
}: LocationAutocompleteProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchText, setSearchText] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setSearchText(value);
  }, [value]);

  const fetchPredictions = async (input: string) => {
    if (input.length < 1) {
      setPredictions([]);
      return;
    }

    // If API key is not configured or is placeholder, use mock data directly
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setLoading(true);
      setTimeout(() => {
        setPredictions(getMockCities(input));
        setLoading(false);
      }, 300); // Simulate network delay
      return;
    }

    setLoading(true);
    
    try {
      // Using Google Places Autocomplete API
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Google Places API Error:', data.error_message);
        // Fallback to mock data if API key is not configured
        setPredictions(getMockCities(input));
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // Fallback to mock data on error
      setPredictions(getMockCities(input));
    } finally {
      setLoading(false);
    }
  };

  const getMockCities = (input: string): Prediction[] => {
    const locations = [
      // Telangana - Major Cities
      'Hyderabad, Telangana, India',
      'Secunderabad, Telangana, India',
      'Warangal, Telangana, India',
      'Karimnagar, Telangana, India',
      'Khammam, Telangana, India',
      'Nizamabad, Telangana, India',
      'Ramagundam, Telangana, India',
      'Mahbubnagar, Telangana, India',
      'Nalgonda, Telangana, India',
      'Adilabad, Telangana, India',
      'Suryapet, Telangana, India',
      'Miryalaguda, Telangana, India',
      'Jagtial, Telangana, India',
      'Mancherial, Telangana, India',
      'Nirmal, Telangana, India',
      'Kamareddy, Telangana, India',
      'Siddipet, Telangana, India',
      'Bhongir, Telangana, India',
      
      // Telangana - Hyderabad Areas
      'HITEC City, Hyderabad, Telangana',
      'Gachibowli, Hyderabad, Telangana',
      'Kukatpally, Hyderabad, Telangana',
      'MGBS, Hyderabad, Telangana',
      'Secunderabad Railway Station, Telangana',
      'Begumpet, Hyderabad, Telangana',
      'Ameerpet, Hyderabad, Telangana',
      'Dilsukhnagar, Hyderabad, Telangana',
      'LB Nagar, Hyderabad, Telangana',
      'Uppal, Hyderabad, Telangana',
      'Madhapur, Hyderabad, Telangana',
      'Banjara Hills, Hyderabad, Telangana',
      'Jubilee Hills, Hyderabad, Telangana',
      'Shamshabad Airport, Hyderabad, Telangana',
      
      // Andhra Pradesh - Major Cities
      'Vijayawada, Andhra Pradesh, India',
      'Visakhapatnam, Andhra Pradesh, India',
      'Guntur, Andhra Pradesh, India',
      'Nellore, Andhra Pradesh, India',
      'Kurnool, Andhra Pradesh, India',
      'Rajahmundry, Andhra Pradesh, India',
      'Tirupati, Andhra Pradesh, India',
      'Kakinada, Andhra Pradesh, India',
      'Anantapur, Andhra Pradesh, India',
      'Eluru, Andhra Pradesh, India',
      'Kadapa, Andhra Pradesh, India',
      'Vizianagaram, Andhra Pradesh, India',
      'Ongole, Andhra Pradesh, India',
      'Machilipatnam, Andhra Pradesh, India',
      'Tenali, Andhra Pradesh, India',
      'Proddatur, Andhra Pradesh, India',
      'Chittoor, Andhra Pradesh, India',
      'Hindupur, Andhra Pradesh, India',
      'Bhimavaram, Andhra Pradesh, India',
      'Madanapalle, Andhra Pradesh, India',
      'Guntakal, Andhra Pradesh, India',
      'Dharmavaram, Andhra Pradesh, India',
      'Gudivada, Andhra Pradesh, India',
      'Narasaraopet, Andhra Pradesh, India',
      'Tadipatri, Andhra Pradesh, India',
      'Mangalagiri, Andhra Pradesh, India',
      'Chirala, Andhra Pradesh, India',
      
      // Andhra Pradesh - Towns & Villages
      'Amaravati, Andhra Pradesh, India',
      'Kondapalli, Andhra Pradesh, India',
      'Gannavaram, Andhra Pradesh, India',
      'Nuzvid, Andhra Pradesh, India',
      'Jaggaiahpet, Andhra Pradesh, India',
      'Nandigama, Andhra Pradesh, India',
      'Penamaluru, Andhra Pradesh, India',
      'Sattenapalle, Andhra Pradesh, India',
      'Vinukonda, Andhra Pradesh, India',
      'Bapatla, Andhra Pradesh, India',
      'Repalle, Andhra Pradesh, India',
      'Kavali, Andhra Pradesh, India',
      'Sullurpeta, Andhra Pradesh, India',
      'Venkatagiri, Andhra Pradesh, India',
      'Atmakur, Andhra Pradesh, India',
      'Markapur, Andhra Pradesh, India',
      'Kandukur, Andhra Pradesh, India',
      'Addanki, Andhra Pradesh, India',
      'Podili, Andhra Pradesh, India',
      
      // Karnataka - Major Cities
      'Bangalore, Karnataka, India',
      'Bengaluru, Karnataka, India',
      'Mysore, Karnataka, India',
      'Mysuru, Karnataka, India',
      'Mangalore, Karnataka, India',
      'Hubli, Karnataka, India',
      'Belgaum, Karnataka, India',
      'Belagavi, Karnataka, India',
      'Davangere, Karnataka, India',
      'Bellary, Karnataka, India',
      'Ballari, Karnataka, India',
      'Tumkur, Karnataka, India',
      'Shimoga, Karnataka, India',
      'Shivamogga, Karnataka, India',
      'Raichur, Karnataka, India',
      'Bidar, Karnataka, India',
      'Hospet, Karnataka, India',
      'Gadag, Karnataka, India',
      'Udupi, Karnataka, India',
      'Hassan, Karnataka, India',
      'Chitradurga, Karnataka, India',
      'Mandya, Karnataka, India',
      'Kolar, Karnataka, India',
      'Bagalkot, Karnataka, India',
      'Gulbarga, Karnataka, India',
      'Kalaburagi, Karnataka, India',
      
      // Karnataka - Bangalore Areas
      'Whitefield, Bangalore, Karnataka',
      'Koramangala, Bangalore, Karnataka',
      'Indiranagar, Bangalore, Karnataka',
      'Electronic City, Bangalore, Karnataka',
      'HSR Layout, Bangalore, Karnataka',
      'BTM Layout, Bangalore, Karnataka',
      'Marathahalli, Bangalore, Karnataka',
      'Jayanagar, Bangalore, Karnataka',
      'MG Road, Bangalore, Karnataka',
      'Majestic Bus Stand, Bangalore, Karnataka',
      'Kempegowda Airport, Bangalore, Karnataka',
      'Yelahanka, Bangalore, Karnataka',
      'JP Nagar, Bangalore, Karnataka',
      'Banashankari, Bangalore, Karnataka',
      
      // Karnataka - Towns & Districts
      'Yadgir, Karnataka, India',
      'Koppal, Karnataka, India',
      'Haveri, Karnataka, India',
      'Dharwad, Karnataka, India',
      'Karwar, Karnataka, India',
      'Sirsi, Karnataka, India',
      'Bhatkal, Karnataka, India',
      'Manipal, Karnataka, India',
      'Puttur, Karnataka, India',
      'Madikeri, Karnataka, India',
      'Chikmagalur, Karnataka, India',
      'Ranebennur, Karnataka, India',
      'Bhadravati, Karnataka, India',
      'Chamrajnagar, Karnataka, India',
      'Ramanagara, Karnataka, India',
      
      // Other Neighboring States
      'Chennai, Tamil Nadu, India',
      'Coimbatore, Tamil Nadu, India',
      'Madurai, Tamil Nadu, India',
      'Salem, Tamil Nadu, India',
      'Trichy, Tamil Nadu, India',
      'Mumbai, Maharashtra, India',
      'Pune, Maharashtra, India',
      'Nagpur, Maharashtra, India',
      'Solapur, Maharashtra, India',
    ];

    const filtered = locations.filter(location => 
      location.toLowerCase().includes(input.toLowerCase())
    );

    // Sort by relevance - exact matches and starts-with first
    filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const inputLower = input.toLowerCase();
      
      const aStartsWith = aLower.startsWith(inputLower);
      const bStartsWith = bLower.startsWith(inputLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.localeCompare(b);
    });

    return filtered.slice(0, 10).map((location, index) => {
      const parts = location.split(', ');
      return {
        place_id: `mock_${index}`,
        description: location,
        structured_formatting: {
          main_text: parts[0],
          secondary_text: parts.slice(1).join(', '),
        },
      };
    });
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);

    // Clear any pending debounce timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only show dropdown if text is being entered
    if (text.length > 0) {
      setShowDropdown(true);
      debounceTimer.current = setTimeout(() => {
            fetchPredictions(text);
      }, 300);
    } else {
      setShowDropdown(false);
      setPredictions([]);
    }
  };

  const handleSelectLocation = (prediction: Prediction) => {
    setSearchText('');
    onLocationSelect(prediction.description);
    setPredictions([]);
    setShowDropdown(false);
    
    // Clear any pending debounce timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const renderPrediction = ({ item }: { item: Prediction }) => (
    <TouchableOpacity
      style={[styles.predictionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={(e) => {
        e.stopPropagation();
        handleSelectLocation(item);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.locationIcon}>📍</Text>
      <View style={styles.predictionText}>
        <Text style={[styles.mainText, { color: colors.text }]}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          placeholder={placeholder}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={() => {
            // Only show dropdown if there's text and no predictions yet
            if (searchText.length >= 1 && predictions.length === 0) {
              fetchPredictions(searchText);
            }
          }}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {showDropdown && predictions.length > 0 && (
        <View style={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={predictions}
            renderItem={renderPrediction}
            keyExtractor={(item) => item.place_id}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  icon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 300,
    overflow: 'hidden',
    zIndex: 2000,
    ...Shadows.medium,
    elevation: 10,
  },
  predictionsList: {
    maxHeight: 300,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  predictionText: {
    flex: 1,
  },
  mainText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: FontSizes.sm,
  },
});

