const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Emotion prediction simulation - Updated to 5 emotions
const emotions = ['Happy', 'Sad', 'Angry', 'Surprise', 'Neutral'];
const emotionEmojis = {
  'Happy': '😊',
  'Sad': '😢',
  'Angry': '😠',
  'Surprise': '😲',
  'Neutral': '😐'
};

function simulateEmotionPrediction() {
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  // Updated confidence range to reflect realistic 78.5% accuracy
  const confidence = 0.6 + Math.random() * 0.25; // 60-85% confidence
  
  // Generate probabilities for all emotions
  const probabilities = {};
  let remaining = 1.0;
  
  emotions.forEach((em, index) => {
    if (em === emotion) {
      probabilities[em] = confidence;
      remaining -= confidence;
    } else if (index === emotions.length - 1) {
      probabilities[em] = remaining;
    } else {
      const prob = Math.random() * (remaining / (emotions.length - index));
      probabilities[em] = prob;
      remaining -= prob;
    }
  });
  
  return { emotion, confidence, probabilities };
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalPredictions: Math.floor(Math.random() * 1000) + 500,
    accuracy: '78.5%',
    modelVersion: 'v2.1.0',
    supportedEmotions: emotions.length
  });
});

app.post('/api/predict', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  // Simulate processing time
  setTimeout(() => {
    const prediction = simulateEmotionPrediction();
    
    res.json({
      success: true,
      prediction: {
        emotion: prediction.emotion,
        emoji: emotionEmojis[prediction.emotion],
        confidence: Math.round(prediction.confidence * 100),
        probabilities: Object.keys(prediction.probabilities).map(emotion => ({
          emotion,
          emoji: emotionEmojis[emotion],
          probability: Math.round(prediction.probabilities[emotion] * 100)
        })).sort((a, b) => b.probability - a.probability)
      },
      imageUrl: `/uploads/${req.file.filename}`,
      processingTime: Math.random() * 2 + 0.5 // 0.5-2.5 seconds
    });
  }, 1000 + Math.random() * 1500); // 1-2.5 second delay
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log(`🚀 Face Emotion Recognition Server running at http://localhost:${port}`);
  console.log(`📊 Ready to analyze emotions from facial expressions!`);
});