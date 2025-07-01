// Global variables
let currentSection = 'home';
let isAnalyzing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStats();
    setupEventListeners();
    animateEmotionCards();
});

// Initialize application
function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Set up file upload
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (imageInput && uploadArea) {
        imageInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => imageInput.click());
    }

    // Set up analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
    }

    // Set up FAQ items
    setupFAQ();
}

// Load statistics from API
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Update stats with animation
        animateCounter('accuracy-stat', stats.accuracy);
        animateCounter('predictions-stat', stats.totalPredictions.toLocaleString());
        animateCounter('emotions-stat', stats.supportedEmotions);
        animateCounter('speed-stat', '< 2s');
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Animate counter numbers
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const isNumber = !isNaN(parseInt(finalValue.toString().replace(/[^\d]/g, '')));
    
    if (isNumber) {
        const target = parseInt(finalValue.toString().replace(/[^\d]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (finalValue.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else if (finalValue.includes(',')) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    } else {
        element.textContent = finalValue;
    }
}

// Switch between sections
function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
        currentSection = sectionName;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup event listeners
function setupEventListeners() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Animate emotion cards
function animateEmotionCards() {
    const emotionCards = document.querySelectorAll('.emotion-card');
    emotionCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s both`;
        }, 500);
    });
}

// File handling functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        displayImagePreview(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            displayImagePreview(file);
            // Update the file input
            const imageInput = document.getElementById('imageInput');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;
        } else {
            showNotification('Please select an image file.', 'error');
        }
    }
}

function displayImagePreview(file) {
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (uploadArea && imagePreview && previewImg) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            imagePreview.classList.add('fade-in');
        };
        reader.readAsDataURL(file);
    }
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');
    const resultsSection = document.getElementById('resultsSection');
    
    if (uploadArea && imagePreview && imageInput && resultsSection) {
        uploadArea.style.display = 'block';
        imagePreview.style.display = 'none';
        resultsSection.style.display = 'none';
        imageInput.value = '';
        isAnalyzing = false;
    }
}

// Analyze image function
async function analyzeImage() {
    if (isAnalyzing) return;
    
    const imageInput = document.getElementById('imageInput');
    const resultsSection = document.getElementById('resultsSection');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContent = document.getElementById('resultsContent');
    
    if (!imageInput.files[0]) {
        showNotification('Please select an image first.', 'error');
        return;
    }

    isAnalyzing = true;
    
    // Show results section with loading
    resultsSection.style.display = 'block';
    loadingIndicator.style.display = 'block';
    resultsContent.style.display = 'none';
    resultsSection.classList.add('fade-in');

    try {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);

        const response = await fetch('/api/predict', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result);
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Failed to analyze image. Please try again.', 'error');
        resultsSection.style.display = 'none';
    } finally {
        isAnalyzing = false;
    }
}

// Display analysis results
function displayResults(result) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContent = document.getElementById('resultsContent');
    const resultEmoji = document.getElementById('resultEmoji');
    const resultEmotion = document.getElementById('resultEmotion');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const probabilityBars = document.getElementById('probabilityBars');
    const processingTime = document.getElementById('processingTime');

    // Hide loading and show results
    loadingIndicator.style.display = 'none';
    resultsContent.style.display = 'block';
    resultsContent.classList.add('slide-up');

    // Update primary result
    if (resultEmoji && resultEmotion && confidenceFill && confidenceText) {
        resultEmoji.textContent = result.prediction.emoji;
        resultEmotion.textContent = result.prediction.emotion;
        
        // Animate confidence bar
        setTimeout(() => {
            confidenceFill.style.width = result.prediction.confidence + '%';
            confidenceText.textContent = result.prediction.confidence + '%';
        }, 300);
    }

    // Update probability bars
    if (probabilityBars) {
        probabilityBars.innerHTML = '';
        result.prediction.probabilities.forEach((prob, index) => {
            const barElement = createProbabilityBar(prob);
            probabilityBars.appendChild(barElement);
            
            // Animate bars with delay
            setTimeout(() => {
                const fill = barElement.querySelector('.probability-fill');
                if (fill) {
                    fill.style.width = prob.probability + '%';
                }
            }, 500 + (index * 100));
        });
    }

    // Update processing time
    if (processingTime) {
        processingTime.textContent = result.processingTime.toFixed(1) + 's';
    }

    // Show success notification
    showNotification(`Detected ${result.prediction.emotion} with ${result.prediction.confidence}% confidence!`, 'success');
}

// Create probability bar element
function createProbabilityBar(prob) {
    const barContainer = document.createElement('div');
    barContainer.className = 'probability-bar';
    
    barContainer.innerHTML = `
        <div class="probability-label">
            <span>${prob.emoji}</span>
            <span>${prob.emotion}</span>
        </div>
        <div class="probability-fill-container">
            <div class="probability-fill" style="width: 0%"></div>
        </div>
        <div class="probability-percentage">${prob.probability}%</div>
    `;
    
    return barContainer;
}

// Setup FAQ functionality
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faq => faq.classList.remove('active'));
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 10000;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#4299e1'
    };
    return colors[type] || colors.info;
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for global access
window.switchSection = switchSection;
window.resetUpload = resetUpload;