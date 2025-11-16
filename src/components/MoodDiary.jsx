import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { moodAPI } from '../services/dataService.js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodDiary = () => {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    anxiety: 5,
    stress: 5,
    notes: ''
  });
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Load mood entries from data service
    const stored = moodAPI.getUserEntries(user.id);
    setMoodEntries(stored);

    // Calculate streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const hasEntryToday = stored.some(e => new Date(e.date).toDateString() === today);
    const hasEntryYesterday = stored.some(e => new Date(e.date).toDateString() === yesterday);

    let currentStreak = parseInt(moodAPI.getStreak(user.id) || '0');
    if (hasEntryToday) {
      if (hasEntryYesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else if (!hasEntryYesterday) {
      currentStreak = 0;
    }
    setStreak(currentStreak);
    moodAPI.updateStreak(user.id, currentStreak);

    // Load badges
    const userBadges = moodAPI.getBadges(user.id);
    setBadges(userBadges);
  }, [user.id]);

  const saveEntry = () => {
    const entry = {
      ...currentEntry,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    moodAPI.saveEntry(entry);
    const newEntries = [...moodEntries.filter(e => e.date !== currentEntry.date), entry];
    setMoodEntries(newEntries);

    // Award badges
    const newBadges = [...badges];
    if (newEntries.length >= 7 && !badges.includes('week-warrior')) {
      newBadges.push('week-warrior');
    }
    if (newEntries.length >= 30 && !badges.includes('month-master')) {
      newBadges.push('month-master');
    }
    if (streak >= 7 && !badges.includes('streak-champion')) {
      newBadges.push('streak-champion');
    }
    setBadges(newBadges);
    moodAPI.updateBadges(user.id, newBadges);

    alert('Mood entry saved!');
  };

  const getMoodEmoji = (level) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥳', '🤯', '😱'];
    return emojis[level - 1] || '😐';
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const generatePredictions = () => {
    if (moodEntries.length < 3) {
      return <p>🤖 Need more mood entries for accurate predictions. Keep tracking!</p>;
    }

    const recentMoods = moodEntries.slice(-7).map(e => e.mood);
    const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    const trend = recentMoods.length > 1 ? recentMoods[recentMoods.length - 1] - recentMoods[0] : 0;

    const predictions = [];

    if (avgMood < 4) {
      predictions.push({
        type: 'stress',
        message: 'High stress prediction: Your recent mood patterns suggest elevated stress levels. Consider stress management techniques.',
        icon: '😰'
      });
    }

    if (trend < -1) {
      predictions.push({
        type: 'decline',
        message: 'Mood decline trend: Your mood has been trending downward. Professional support might be beneficial.',
        icon: '📉'
      });
    }

    if (moodEntries.slice(-3).every(e => e.energy < 4)) {
      predictions.push({
        type: 'energy',
        message: 'Low productivity prediction: Consistent low energy levels detected. Focus on sleep and nutrition.',
        icon: '⚡'
      });
    }

    if (predictions.length === 0) {
      predictions.push({
        type: 'positive',
        message: 'Stable mood patterns: Your mental health tracking shows positive stability. Keep up the good work!',
        icon: '✅'
      });
    }

    return (
      <div className="ai-predictions">
        {predictions.map((pred, index) => (
          <div key={index} className={`prediction ${pred.type}`}>
            <span className="prediction-icon">{pred.icon}</span>
            <span className="prediction-text">{pred.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: 'Mood',
        data: getLast7Days().map(date => {
          const entry = moodEntries.find(e => e.date === date);
          return entry ? entry.mood : null;
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Energy',
        data: getLast7Days().map(date => {
          const entry = moodEntries.find(e => e.date === date);
          return entry ? entry.energy : null;
        }),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Anxiety',
        data: getLast7Days().map(date => {
          const entry = moodEntries.find(e => e.date === date);
          return entry ? entry.anxiety : null;
        }),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Stress',
        data: getLast7Days().map(date => {
          const entry = moodEntries.find(e => e.date === date);
          return entry ? entry.stress : null;
        }),
        borderColor: 'rgb(255, 205, 86)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mood Tracking - Last 7 Days',
      },
    },
    scales: {
      y: {
        min: 1,
        max: 10,
      },
    },
  };

  return (
    <div className="mood-diary">
      <h2>Mental Health Diary</h2>
      <div className="diary-entry">
        <h3>Today's Entry</h3>
        <div className="slider-group">
          <label>Mood: {getMoodEmoji(currentEntry.mood)} ({currentEntry.mood}/10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentEntry.mood}
            onChange={(e) => setCurrentEntry({...currentEntry, mood: parseInt(e.target.value)})}
          />
        </div>
        <div className="slider-group">
          <label>Energy: {currentEntry.energy}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentEntry.energy}
            onChange={(e) => setCurrentEntry({...currentEntry, energy: parseInt(e.target.value)})}
          />
        </div>
        <div className="slider-group">
          <label>Anxiety: {currentEntry.anxiety}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentEntry.anxiety}
            onChange={(e) => setCurrentEntry({...currentEntry, anxiety: parseInt(e.target.value)})}
          />
        </div>
        <div className="slider-group">
          <label>Stress: {currentEntry.stress}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentEntry.stress}
            onChange={(e) => setCurrentEntry({...currentEntry, stress: parseInt(e.target.value)})}
          />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={currentEntry.notes}
          onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
        />
        <button onClick={saveEntry}>Save Entry</button>
      </div>
      <div className="mood-chart">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="insights">
        <h3>AI Mood Predictions & Insights</h3>
        <div className="predictions">
          {generatePredictions()}
        </div>
        <div className="insights-content">
          <p>Based on your recent entries, you might benefit from relaxation techniques. Consider trying deep breathing exercises.</p>
        </div>
        <div className="export-section">
          <button onClick={() => {
            const data = moodEntries.map(entry => ({
              date: entry.date,
              mood: entry.mood,
              energy: entry.energy,
              anxiety: entry.anxiety,
              stress: entry.stress,
              notes: entry.notes
            }));
            const csvContent = 'data:text/csv;charset=utf-8,' +
              'Date,Mood,Energy,Anxiety,Stress,Notes\n' +
              data.map(row => `${row.date},${row.mood},${row.energy},${row.anxiety},${row.stress},"${row.notes}"`).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'mood_tracking_data.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            Export Mood Data (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodDiary;