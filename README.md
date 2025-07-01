# Face Emotion Recognition Streamlit App

This project implements Face Emotion Recognition using Python, machine learning, and Streamlit for a web-based interface.

## Features

- 🎯 Train emotion recognition models
- 🔮 Real-time emotion prediction from images
- 📊 Model performance analysis and visualizations
- 😊 Support for 7 different emotions: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
- 🎨 Beautiful, interactive web interface

## Live Demo

You can run this application locally or deploy it to various platforms.

## Local Setup

1. Clone the repository:
```bash
git clone https://github.com/gaanesh434/FER-Project.git
cd FER-Project
```

2. Install dependencies:
```bash
python -m pip install -r requirements.txt
```

3. Run the Streamlit app:
```bash
streamlit run app.py
```

4. Open your browser and navigate to `http://localhost:8501`

## Deployment Options

### 1. Streamlit Cloud (Recommended)
1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your GitHub repository
4. Deploy with one click!

### 2. Heroku
1. Create a `Procfile`:
```
web: sh setup.sh && streamlit run app.py
```

2. Create `setup.sh`:
```bash
mkdir -p ~/.streamlit/
echo "\
[server]\n\
headless = true\n\
port = $PORT\n\
enableCORS = false\n\
\n\
" > ~/.streamlit/config.toml
```

3. Deploy to Heroku

### 3. PythonAnywhere
1. Upload your files to PythonAnywhere
2. Create a web app with manual configuration
3. Set up the WSGI file to run Streamlit
4. Install requirements in a virtual environment

## Usage

1. **Home Page**: Overview of the application and features
2. **Train Model**: Train the emotion recognition model using sample data
3. **Predict Emotion**: Upload an image to predict emotions
4. **Model Analysis**: View detailed performance metrics and visualizations

## Technology Stack

- **Frontend**: Streamlit
- **Backend**: Python
- **Machine Learning**: Scikit-learn (Random Forest)
- **Image Processing**: OpenCV, PIL
- **Visualization**: Matplotlib, Seaborn
- **Data Handling**: Pandas, NumPy

## Model Details

The application uses a Random Forest classifier trained on facial feature data to recognize emotions. The model supports 7 different emotion categories and provides confidence scores for predictions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.