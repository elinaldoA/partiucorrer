
import localforage from 'localforage';
import axios from 'axios';
localforage.config({
    name: 'RunTrackOffline',
    storeName: 'offline_data',
    description: 'Armazenamento offline do RunTrack'
});
let pendingOperations = [];
export const loadPendingOperations = async () => {
    try {
        const saved = await localforage.getItem('pending_operations');
        if (saved && Array.isArray(saved)) {
            pendingOperations = saved;
        }
    } catch (error) {
        console.error('Error loading pending operations:', error);
    }
};
const savePendingOperations = async () => {
    try {
        await localforage.setItem('pending_operations', pendingOperations);
    } catch (error) {
        console.error('Error saving pending operations:', error);
    }
};
export const addToQueue = async (operation) => {
    pendingOperations.push({
        ...operation,
        id: Date.now(),
        retryCount: 0,
        timestamp: new Date().toISOString()
    });
    await savePendingOperations();
    if (navigator.onLine) {
        await syncPendingOperations();
    }
};
const removeFromQueue = async (operationId) => {
    pendingOperations = pendingOperations.filter(op => op.id !== operationId);
    await savePendingOperations();
};
export const syncPendingOperations = async () => {
    if (!navigator.onLine) return;
    const operations = [...pendingOperations];
    let hasError = false;
    for (const operation of operations) {
        try {
            const token = localStorage.getItem('token');
            await axios({
                method: operation.method,
                url: `http://localhost:5000/api${operation.url}`,
                data: operation.data,
                headers: { Authorization: `Bearer ${token}` }
            });
            await removeFromQueue(operation.id);
            console.log(`Operation ${operation.id} synced successfully`);
        } catch (error) {
            console.error(`Error syncing operation ${operation.id}:`, error);
            hasError = true;
            operation.retryCount++;
            if (operation.retryCount > 5) {
                await removeFromQueue(operation.id);
            }
        }
    }
    if (!hasError) {
        await savePendingOperations();
    }
};
export const saveRunOffline = async (runData) => {
    try {
        const offlineRuns = await localforage.getItem('offline_runs') || [];
        offlineRuns.push({
            ...runData,
            offlineId: Date.now(),
            synced: false,
            created_at: new Date().toISOString()
        });
        await localforage.setItem('offline_runs', offlineRuns);
        await addToQueue({
            method: 'POST',
            url: '/runs',
            data: runData
        });
        return true;
    } catch (error) {
        console.error('Error saving run offline:', error);
        return false;
    }
};
export const getOfflineRuns = async () => {
    try {
        return await localforage.getItem('offline_runs') || [];
    } catch (error) {
        console.error('Error getting offline runs:', error);
        return [];
    }
};
export const syncOfflineRuns = async () => {
    if (!navigator.onLine) return 0;
    const offlineRuns = await localforage.getItem('offline_runs') || [];
    let syncedCount = 0;
    for (const run of offlineRuns) {
        if (!run.synced) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:5000/api/runs', {
                    distance: run.distance,
                    duration: run.duration,
                    pace: run.pace,
                    route_data: run.route_data,
                    start_time: run.start_time,
                    end_time: run.end_time,
                    title: run.title,
                    is_competition: run.is_competition,
                    competition_id: run.competition_id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                run.synced = true;
                syncedCount++;
            } catch (error) {
                console.error('Error syncing run:', error);
            }
        }
    }
    await localforage.setItem('offline_runs', offlineRuns);
    return syncedCount;
};
export const clearOldOfflineData = async () => {
    try {
        const offlineRuns = await localforage.getItem('offline_runs') || [];
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filtered = offlineRuns.filter(run => 
            new Date(run.created_at).getTime() > thirtyDaysAgo || !run.synced
        );
        await localforage.setItem('offline_runs', filtered);
    } catch (error) {
        console.error('Error clearing old data:', error);
    }
};
export const isOffline = () => !navigator.onLine;
export const initOfflineListeners = () => {
    window.addEventListener('online', () => {
        console.log('🟢 Back online - Syncing data...');
        syncPendingOperations();
        syncOfflineRuns();
    });
    window.addEventListener('offline', () => {
        console.log('🔴 Offline mode activated');
    });
};