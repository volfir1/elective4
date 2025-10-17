// File storage
let uploadedFiles = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadZone = document.getElementById('uploadZone');
const fileList = document.getElementById('fileList');
const recipeText = document.getElementById('recipeText');
const clearTextBtn = document.getElementById('clearTextBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const processBtn = document.getElementById('processBtn');
const statusMessage = document.getElementById('statusMessage');

// Browse button click
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop functionality
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

// Handle files
function handleFiles(files) {
    const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
        showStatus('Please upload only .txt files', 'warning');
        return;
    }
    
    txtFiles.forEach(file => {
        if (!uploadedFiles.find(f => f.name === file.name)) {
            uploadedFiles.push(file);
        }
    });
    
    displayFiles();
    showStatus(`${txtFiles.length} file(s) added successfully!`, 'success');
    
    // Reset file input
    fileInput.value = '';
}

// Display files
function displayFiles() {
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <span>
                <i class="fas fa-file-alt text-primary"></i>
                ${file.name}
                <small class="text-muted">(${formatFileSize(file.size)})</small>
            </span>
            <button class="btn btn-sm btn-outline-danger btn-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFiles();
    showStatus('File removed', 'info');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Clear text button
clearTextBtn.addEventListener('click', () => {
    recipeText.value = '';
    showStatus('Text cleared', 'info');
});

// Clear all button
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all input?')) {
        recipeText.value = '';
        uploadedFiles = [];
        displayFiles();
        showStatus('All input cleared', 'info');
    }
});

// Process button
processBtn.addEventListener('click', () => {
    const text = recipeText.value.trim();
    const hasFiles = uploadedFiles.length > 0;
    
    if (!text && !hasFiles) {
        showStatus('Please add some recipe text or upload files first!', 'warning');
        return;
    }
    
    // Simulate processing
    showStatus('Processing recipes...', 'info');
    
    setTimeout(() => {
        const recipeCount = (text ? 1 : 0) + uploadedFiles.length;
        showStatus(
            `Successfully processed ${recipeCount} recipe(s)! Ready to view in your collection.`,
            'success'
        );
        
        // Here you would normally:
        // 1. Parse the text and files
        // 2. Extract recipe data
        // 3. Store in JSON
        // 4. Navigate to collection page
        
        // For demo purposes, we'll just show success
        setTimeout(() => {
            if (confirm('Recipes processed! Would you like to view your collection?')) {
                // Navigate to collection page
                alert('Navigation to Collection page will be implemented next!');
            }
        }, 1500);
    }, 2000);
});

// Show status message
function showStatus(message, type) {
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const icon = {
        'success': 'fa-check-circle',
        'danger': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    statusMessage.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas ${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alert = statusMessage.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => statusMessage.innerHTML = '', 300);
        }
    }, 5000);
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Recipe Input Page loaded successfully!');
});