import React, { ReactNode } from 'react';
import useContentSync from '../hooks/useContentSync';

interface ContentSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up automatic synchronization between 
 * landing section content in the database and translations
 */
const ContentSyncProvider: React.FC<ContentSyncProviderProps> = ({ children }) => {
  // Use the content sync hook to listen for changes
  useContentSync();
  
  // Simply render the children, the hook handles the sync logic
  return <>{children}</>;
};

export default ContentSyncProvider;
