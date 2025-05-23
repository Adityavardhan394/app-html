// Handle camera functionality
function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('Camera access is not supported by your browser', 'error');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'camera-container';
            videoContainer.innerHTML = `
                <video autoplay playsinline></video>
                <div class="camera-controls">
                    <button class="capture-btn">
                        <i class="material-icons">camera</i>
                    </button>
                    <button class="close-btn">
                        <i class="material-icons">close</i>
                    </button>
                </div>
                <div class="camera-overlay">
                    <div class="prescription-frame"></div>
                    <p>Align your prescription within the frame</p>
                </div>
            `;
            
            document.body.appendChild(videoContainer);
            const video = videoContainer.querySelector('video');
            video.srcObject = stream;
            
            // Handle capture button
            videoContainer.querySelector('.capture-btn').addEventListener('click', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(blob => {
                    handleFile(blob);
                    stream.getTracks().forEach(track => track.stop());
                    videoContainer.remove();
                }, 'image/jpeg', 0.8);
            });
            
            // Handle close button
            videoContainer.querySelector('.close-btn').addEventListener('click', () => {
                stream.getTracks().forEach(track => track.stop());
                videoContainer.remove();
            });
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            showNotification('Could not access camera. Please try file upload instead.', 'error');
        });
}

// Handle file upload
function openFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };
}

// Handle the uploaded file
function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size exceeds 5MB limit', 'error');
        return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a JPG, PNG, or PDF file', 'error');
        return;
    }

    // Show upload progress
    const progressContainer = document.createElement('div');
    progressContainer.className = 'upload-progress';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress"></div>
        </div>
        <p>Uploading prescription...</p>
    `;
    document.body.appendChild(progressContainer);

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        progressContainer.querySelector('.progress').style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            progressContainer.remove();
            showPreview(file);
        }
    }, 100);
}

// Show file preview
function showPreview(file) {
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            showNotification('Prescription uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.src = 'assets/pdf-icon.png';
        previewContainer.style.display = 'block';
        showNotification('PDF uploaded successfully', 'success');
    }
}

// Submit prescription
async function submitPrescription() {
    const submitButton = document.querySelector('.primary-button');
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <i class="material-icons">hourglass_empty</i>
        Processing...
    `;

    try {
        // Simulate prescription processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store prescription in app state
        MediQuickApp.state.currentPrescription = {
            id: 'RX' + Date.now(),
            timestamp: new Date().toISOString(),
            status: 'processing'
        };
        MediQuickApp.saveState();
        
        // Redirect to medicine suggestions
        window.location.href = 'medicine-suggestions.html';
    } catch (error) {
        showNotification('Error processing prescription. Please try again.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Prescription';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 