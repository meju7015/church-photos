'use client';

import { useEffect } from 'react';

export default function BulletinReadMarker({ bulletinId }: { bulletinId: string }) {
  useEffect(() => {
    fetch(`/api/bulletins/${bulletinId}/read`, { method: 'POST' });
  }, [bulletinId]);

  return null;
}
