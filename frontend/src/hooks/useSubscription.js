
import { useState, useEffect } from 'react';
import axios from 'axios';
const FREE_PLAN_FEATURES = {
    advanced_stats: false,
    no_ads: false,
    ai_coach: false,
    injury_prevention: false,
    challenges: true, 
    export_gpx: false,
    audio_coach: false,
    unlimited_history: false,
    unlimited_groups: false,
    unlimited_goals: false,
    create_competitions: false,
    all_videos: false,
    push_notifications: true, 
    heatmap: false,
    advanced_bmi: false,
    elite_hub: false,
    max_groups: 2,
    max_goals: 2,
    history_days: 15
};
const PREMIUM_PLAN_FEATURES = {
    ...FREE_PLAN_FEATURES,
    advanced_stats: true,
    no_ads: true,
    export_gpx: true,
    audio_coach: true,
    heatmap: true,
    advanced_bmi: true,
    create_competitions: true,
    max_groups: 5,
    max_goals: 5,
    history_days: 90
};
const ELITE_PLAN_FEATURES = {
    ...PREMIUM_PLAN_FEATURES,
    ai_coach: true,
    injury_prevention: true,
    all_videos: true,
    elite_hub: true,
    unlimited_history: true,
    unlimited_groups: true,
    unlimited_goals: true,
    max_groups: -1,
    max_goals: -1,
    history_days: -1
};
export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [features, setFeatures] = useState(FREE_PLAN_FEATURES);
    useEffect(() => {
        fetchSubscription();
    }, []);
    const fetchSubscription = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setFeatures(FREE_PLAN_FEATURES);
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:5000/api/subscriptions/current', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscription(response.data);
            let currentFeatures = FREE_PLAN_FEATURES;
            if (response.data.plan_id === 2) currentFeatures = PREMIUM_PLAN_FEATURES;
            if (response.data.plan_id === 3) currentFeatures = ELITE_PLAN_FEATURES;
            setFeatures({ ...currentFeatures, ...(response.data.features || {}) });
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setFeatures(FREE_PLAN_FEATURES);
        } finally {
            setLoading(false);
        }
    };
    const hasFeature = (featureName) => {
        let planFeatures = FREE_PLAN_FEATURES;
        if (subscription?.plan_id === 2) planFeatures = PREMIUM_PLAN_FEATURES;
        if (subscription?.plan_id === 3) planFeatures = ELITE_PLAN_FEATURES;
        const value = features[featureName] !== undefined ? features[featureName] : planFeatures[featureName];
        return value === true || value === -1;
    };
    const getMaxValue = (featureName) => {
        let planFeatures = FREE_PLAN_FEATURES;
        if (subscription?.plan_id === 2) planFeatures = PREMIUM_PLAN_FEATURES;
        if (subscription?.plan_id === 3) planFeatures = ELITE_PLAN_FEATURES;
        const value = features[featureName] !== undefined ? features[featureName] : planFeatures[featureName];
        if (value === -1 || value === true) return Infinity;
        if (value === false || value === undefined) return 0;
        return value;
    };
    const isFree = !subscription || subscription.plan_id === 1 || subscription.is_free === true;
    const isPremium = subscription?.plan_id === 2;
    const isElite = subscription?.plan_id === 3;
    return { subscription, features, loading, hasFeature, getMaxValue, isFree, isPremium, isElite, refresh: fetchSubscription };
};