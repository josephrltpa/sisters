import React, { useState } from 'react';
import { BusinessType } from './types';
import HomeScreen from './HomeScreen';
import BusinessScreen from './BusinessScreen';

function App() {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType | null>(null);

  if (!selectedBusiness) {
    return <HomeScreen onSelectBusiness={setSelectedBusiness} />;
  }

  return (
    <BusinessScreen
      business={selectedBusiness}
      onBack={() => setSelectedBusiness(null)}
    />
  );
}

export default App;
