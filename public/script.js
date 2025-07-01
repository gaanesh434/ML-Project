// Navigation functionality
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to corresponding nav link
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

// Add click event listeners to navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // File upload functionality
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContent = document.getElementById('resultsContent');

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Analyze button functionality
    analyzeBtn.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);

        // Show results section and loading
        resultsSection.style.display = 'block';
        loadingIndicator.style.display = 'block';
        resultsContent.style.display = 'none';

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        fetch('/api/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayResults(data);
            } else {
                alert('Error analyzing image: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error analyzing image. Please try again.');
        })
        .finally(() => {
            loadingIndicator.style.display = 'none';
        });
    });

    function displayResults(data) {
        const { prediction, processingTime } = data;
        
        // Update primary result
        document.getElementById('resultEmoji').textContent = prediction.emoji;
        document.getElementById('resultEmotion').textContent = prediction.emotion;
        document.getElementById('confidenceText').textContent = prediction.confidence + '%';
        document.getElementById('confidenceFill').style.width = prediction.confidence + '%';
        
        // Update probability bars
        const probabilityBars = document.getElementById('probabilityBars');
        probabilityBars.innerHTML = '';
        
        prediction.probabilities.forEach(prob => {
            const barContainer = document.createElement('div');
            barContainer.className = 'probability-bar';
            
            barContainer.innerHTML = `
                <div class="probability-label">
                    <span>${prob.emoji}</span>
                    <span>${prob.emotion}</span>
                </div>
                <div class="probability-fill-container">
                    <div class="probability-fill" style="width: ${prob.probability}%"></div>
                </div>
                <div class="probability-percentage">${prob.probability}%</div>
            `;
            
            probabilityBars.appendChild(barContainer);
        });
        
        // Update processing time
        document.getElementById('processingTime').textContent = processingTime.toFixed(1) + 's';
        
        // Show results with animation
        resultsContent.style.display = 'block';
        resultsContent.classList.add('fade-in');
    }

    // FAQ functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Animate stats on scroll
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const finalValue = stat.textContent;
            if (typeof finalValue === 'string' && finalValue.includes('%')) {
                const numValue = parseFloat(finalValue);
                animateNumber(stat, 0, numValue, '%');
            } else if (typeof finalValue === 'string' && finalValue.includes('<')) {
                // Handle "< 2s" case
                stat.textContent = finalValue;
            } else {
                const numValue = parseInt(finalValue.replace(/,/g, ''));
                animateNumber(stat, 0, numValue, '');
            }
        });
    }

    function animateNumber(element, start, end, suffix) {
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            
            if (suffix === '%') {
                element.textContent = current.toFixed(1) + suffix;
            } else {
                element.textContent = current.toLocaleString() + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Trigger stats animation when stats section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Emotion card hover effects
    document.querySelectorAll('.emotion-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Reset upload function
function resetUpload() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('imageInput').value = '';
}

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