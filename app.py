import streamlit as st
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
from io import BytesIO
import base64

# Set page config
st.set_page_config(
    page_title="Face Emotion Recognition",
    page_icon="😊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: bold;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #ff7f0e;
        margin: 1rem 0;
    }
    .emotion-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin: 0.5rem 0;
    }
    .metric-card {
        background: #f0f2f6;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #1f77b4;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'model_trained' not in st.session_state:
    st.session_state.model_trained = False
if 'model' not in st.session_state:
    st.session_state.model = None
if 'emotions' not in st.session_state:
    st.session_state.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def create_sample_data():
    """Create sample emotion data for demonstration"""
    np.random.seed(42)
    n_samples = 1000
    n_features = 48 * 48  # Simulating 48x48 pixel images
    
    # Generate random features (simulating facial features)
    X = np.random.rand(n_samples, n_features)
    
    # Generate labels (emotions)
    y = np.random.choice(len(st.session_state.emotions), n_samples)
    
    return X, y

def train_emotion_model():
    """Train a simple emotion recognition model"""
    with st.spinner("Training emotion recognition model..."):
        # Create sample data
        X, y = create_sample_data()
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        
        # Store in session state
        st.session_state.model = model
        st.session_state.model_trained = True
        st.session_state.accuracy = accuracy
        st.session_state.y_test = y_test
        st.session_state.y_pred = y_pred
        
        return model, accuracy

def predict_emotion_from_image(image):
    """Predict emotion from uploaded image"""
    if not st.session_state.model_trained:
        return None, 0.0
    
    # Convert image to grayscale and resize
    img_array = np.array(image.convert('L'))
    img_resized = cv2.resize(img_array, (48, 48))
    img_flattened = img_resized.flatten().reshape(1, -1)
    
    # Normalize
    img_normalized = img_flattened / 255.0
    
    # Predict
    prediction = st.session_state.model.predict(img_normalized)[0]
    confidence = np.max(st.session_state.model.predict_proba(img_normalized))
    
    return prediction, confidence

def plot_confusion_matrix():
    """Plot confusion matrix"""
    if not st.session_state.model_trained:
        return None
    
    cm = confusion_matrix(st.session_state.y_test, st.session_state.y_pred)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=st.session_state.emotions,
                yticklabels=st.session_state.emotions, ax=ax)
    ax.set_title('Confusion Matrix')
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    
    return fig

def plot_emotion_distribution():
    """Plot emotion distribution"""
    if not st.session_state.model_trained:
        return None
    
    # Create sample distribution
    emotion_counts = np.bincount(st.session_state.y_test)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(st.session_state.emotions, emotion_counts, 
                  color=['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
                         '#feca57', '#ff9ff3', '#54a0ff'])
    
    ax.set_title('Emotion Distribution in Test Data')
    ax.set_xlabel('Emotions')
    ax.set_ylabel('Count')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}', ha='center', va='bottom')
    
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    return fig

# Main app
def main():
    # Header
    st.markdown('<h1 class="main-header">😊 Face Emotion Recognition</h1>', unsafe_allow_html=True)
    
    # Sidebar
    st.sidebar.title("Navigation")
    page = st.sidebar.selectbox("Choose a page", 
                               ["Home", "Train Model", "Predict Emotion", "Model Analysis"])
    
    if page == "Home":
        st.markdown('<h2 class="sub-header">Welcome to Face Emotion Recognition App</h2>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            ### About This Project
            This application demonstrates Face Emotion Recognition using machine learning. 
            The system can identify emotions from facial expressions in images.
            
            **Supported Emotions:**
            """)
            
            for emotion in st.session_state.emotions:
                st.markdown(f'<div class="emotion-card">{emotion}</div>', unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            ### How to Use
            1. **Train Model**: Go to the Train Model page to train the emotion recognition model
            2. **Predict Emotion**: Upload an image to predict the emotion
            3. **Model Analysis**: View model performance metrics and visualizations
            
            ### Features
            - Real-time emotion prediction
            - Model performance analysis
            - Interactive visualizations
            - Support for multiple image formats
            """)
            
            if st.button("🚀 Get Started", type="primary"):
                st.balloons()
                st.success("Navigate to 'Train Model' to begin!")
    
    elif page == "Train Model":
        st.markdown('<h2 class="sub-header">🎯 Train Emotion Recognition Model</h2>', unsafe_allow_html=True)
        
        if not st.session_state.model_trained:
            st.info("Click the button below to train the emotion recognition model.")
            
            if st.button("Train Model", type="primary"):
                model, accuracy = train_emotion_model()
                st.success(f"Model trained successfully! Accuracy: {accuracy:.2%}")
                st.rerun()
        else:
            st.success(f"Model is already trained! Accuracy: {st.session_state.accuracy:.2%}")
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.markdown(f'<div class="metric-card"><h3>Accuracy</h3><h2>{st.session_state.accuracy:.2%}</h2></div>', unsafe_allow_html=True)
            with col2:
                st.markdown(f'<div class="metric-card"><h3>Model Type</h3><h2>Random Forest</h2></div>', unsafe_allow_html=True)
            with col3:
                st.markdown(f'<div class="metric-card"><h3>Features</h3><h2>2304</h2></div>', unsafe_allow_html=True)
            
            if st.button("Retrain Model"):
                st.session_state.model_trained = False
                st.rerun()
    
    elif page == "Predict Emotion":
        st.markdown('<h2 class="sub-header">🔮 Predict Emotion from Image</h2>', unsafe_allow_html=True)
        
        if not st.session_state.model_trained:
            st.warning("Please train the model first!")
            if st.button("Go to Train Model"):
                st.switch_page("Train Model")
        else:
            uploaded_file = st.file_uploader("Choose an image...", 
                                           type=['jpg', 'jpeg', 'png', 'bmp'])
            
            if uploaded_file is not None:
                col1, col2 = st.columns(2)
                
                with col1:
                    image = Image.open(uploaded_file)
                    st.image(image, caption="Uploaded Image", use_column_width=True)
                
                with col2:
                    if st.button("Predict Emotion", type="primary"):
                        with st.spinner("Analyzing emotion..."):
                            prediction, confidence = predict_emotion_from_image(image)
                            
                            if prediction is not None:
                                emotion = st.session_state.emotions[prediction]
                                
                                st.markdown(f"""
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                           padding: 2rem; border-radius: 15px; color: white; text-align: center;">
                                    <h2>Predicted Emotion</h2>
                                    <h1 style="font-size: 3rem; margin: 1rem 0;">{emotion}</h1>
                                    <h3>Confidence: {confidence:.2%}</h3>
                                </div>
                                """, unsafe_allow_html=True)
                                
                                # Show probability distribution
                                st.markdown("### Probability Distribution")
                                probs = st.session_state.model.predict_proba(
                                    np.array(image.convert('L').resize((48, 48))).flatten().reshape(1, -1) / 255.0
                                )[0]
                                
                                prob_df = pd.DataFrame({
                                    'Emotion': st.session_state.emotions,
                                    'Probability': probs
                                }).sort_values('Probability', ascending=False)
                                
                                fig, ax = plt.subplots(figsize=(10, 6))
                                bars = ax.barh(prob_df['Emotion'], prob_df['Probability'])
                                ax.set_xlabel('Probability')
                                ax.set_title('Emotion Probability Distribution')
                                
                                # Color the highest probability bar differently
                                bars[0].set_color('#ff6b6b')
                                
                                st.pyplot(fig)
    
    elif page == "Model Analysis":
        st.markdown('<h2 class="sub-header">📊 Model Performance Analysis</h2>', unsafe_allow_html=True)
        
        if not st.session_state.model_trained:
            st.warning("Please train the model first to view analysis!")
        else:
            # Model metrics
            st.markdown("### Model Performance Metrics")
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Accuracy", f"{st.session_state.accuracy:.2%}")
            with col2:
                st.metric("Model Type", "Random Forest")
            with col3:
                st.metric("Features", "2304")
            with col4:
                st.metric("Classes", len(st.session_state.emotions))
            
            # Visualizations
            tab1, tab2 = st.tabs(["Confusion Matrix", "Emotion Distribution"])
            
            with tab1:
                st.markdown("### Confusion Matrix")
                fig_cm = plot_confusion_matrix()
                if fig_cm:
                    st.pyplot(fig_cm)
            
            with tab2:
                st.markdown("### Emotion Distribution in Test Data")
                fig_dist = plot_emotion_distribution()
                if fig_dist:
                    st.pyplot(fig_dist)
            
            # Classification report
            st.markdown("### Detailed Classification Report")
            if hasattr(st.session_state, 'y_test') and hasattr(st.session_state, 'y_pred'):
                report = classification_report(
                    st.session_state.y_test, 
                    st.session_state.y_pred,
                    target_names=st.session_state.emotions,
                    output_dict=True
                )
                
                report_df = pd.DataFrame(report).transpose()
                st.dataframe(report_df.round(3))

if __name__ == "__main__":
    main()