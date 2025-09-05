// @ts-nocheck
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'budget-tracker-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip API requests and handle them separately
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Return offline page for navigation requests when cache fails
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// Background sync for expense data (when available)
self.addEventListener('sync', (event) => {
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncExpenses());
  }
});

async function syncExpenses() {
  try {
    // Get pending expenses from IndexedDB
    const pendingExpenses = await getPendingExpenses();
    
    for (const expense of pendingExpenses) {
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense),
        });
        
        // Remove from pending queue
        await removePendingExpense(expense.id);
      } catch (error) {
        console.error('Failed to sync expense:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers for offline data storage
async function getPendingExpenses(): Promise<any[]> {
  // Implementation would use IndexedDB to store pending expenses
  // when offline and sync them when online
  return [];
}

async function removePendingExpense(id: string): Promise<void> {
  // Implementation would remove expense from IndexedDB
}

export {};
