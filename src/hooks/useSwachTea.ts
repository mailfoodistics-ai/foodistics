import { useSettings } from './useSettings';

export const useSwachTeaEnabled = () => {
  const { getSetting, isLoading, settings } = useSettings();
  
  // Get the setting and handle different value types
  const rawValue = getSetting('swach_tea_enabled');
  let isEnabled = true; // Default to true
  
  if (rawValue === false || rawValue === 'false') {
    isEnabled = false;
  } else if (rawValue === true || rawValue === 'true') {
    isEnabled = true;
  }
  
  return {
    isSwachTeaEnabled: isEnabled,
    isLoading,
    settings,
  };
};
