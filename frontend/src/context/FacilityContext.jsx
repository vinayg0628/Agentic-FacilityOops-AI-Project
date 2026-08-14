import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFacilities } from '../services/api';

const FacilityContext = createContext();

export const FacilityProvider = ({ children }) => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const loadFacilities = async () => {
    try {
      const data = await fetchFacilities();
      setFacilities(data);
    } catch (err) {
      console.error("Failed to fetch facilities list:", err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <FacilityContext.Provider value={{
      facilities,
      selectedFacilityId,
      setSelectedFacilityId,
      searchQuery,
      setSearchQuery,
      theme,
      toggleTheme,
      isIngestModalOpen,
      setIsIngestModalOpen,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => useContext(FacilityContext);
