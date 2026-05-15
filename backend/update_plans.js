const mysql = require('mysql2/promise'); 

async function update() { 
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'partiucorrer' }); 

    const freeFeatures = {
      advanced_stats: false, no_ads: false, ai_coach: false, injury_prevention: false, 
      challenges: false, export_gpx: false, audio_coach: false, unlimited_history: false, 
      unlimited_groups: false, unlimited_goals: false, create_competitions: false, 
      all_videos: false, push_notifications: false, heatmap: false, advanced_bmi: false, 
      elite_hub: false, max_groups: 2, max_goals: 3, history_days: 30
    };

    const premiumFeatures = {
      advanced_stats: true, no_ads: true, ai_coach: true, injury_prevention: true, 
      challenges: true, export_gpx: true, audio_coach: true, unlimited_history: true, 
      unlimited_groups: true, unlimited_goals: true, create_competitions: true, 
      all_videos: true, push_notifications: true, heatmap: true, advanced_bmi: true, 
      elite_hub: false, max_groups: -1, max_goals: -1, history_days: -1
    };

    const eliteFeatures = {
      ...premiumFeatures,
      elite_hub: true
    };

    await pool.execute('UPDATE subscription_plans SET features = ? WHERE id = 1', [JSON.stringify(freeFeatures)]); 
    await pool.execute('UPDATE subscription_plans SET features = ? WHERE id = 2', [JSON.stringify(premiumFeatures)]); 
    await pool.execute('INSERT IGNORE INTO subscription_plans (id, name, price, features) VALUES (3, "Elite", 59.90, ?)', [JSON.stringify(eliteFeatures)]); 
    await pool.execute('UPDATE subscription_plans SET features = ? WHERE id = 3', [JSON.stringify(eliteFeatures)]); 

    console.log('Planos atualizados no BD com todos os recursos!'); 
    process.exit(0); 
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
} 
update();
