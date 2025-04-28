import React, { ReactNode } from 'react';

interface ContentSyncProviderProps {
    children: ReactNode;
}

/**
 * Provider component for content - no longer syncs with database
 * Now simply loads translations from local JSON files
 */
const ContentSyncProvider: React.FC<ContentSyncProviderProps> = ({
    children,
}) => {
    // Simply render the children, no sync logic needed
    return <>{children}</>;
};

export default ContentSyncProvider;
