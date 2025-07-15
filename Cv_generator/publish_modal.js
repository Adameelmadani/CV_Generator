// ============ PUBLISH MODAL FUNCTIONS ============

function showPublishModal() {
  const modal = document.getElementById('publishModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function hidePublishModal() {
  const modal = document.getElementById('publishModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

async function publishAndDownload() {
  if (!window.generatedCVData || !window.generatedCVData.cv_id) {
    console.error('❌ No CV data available for publishing');
    alert('Erreur: Aucune donnée de CV disponible pour la publication');
    return;
  }
  
  try {
    // Show loading state
    const publishBtn = document.querySelector('.btn-primary');
    const originalText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publication...';
    publishBtn.disabled = true;
    
    // Make publish request
    const formData = new FormData();
    formData.append('cv_id', window.generatedCVData.cv_id);
    formData.append('is_published', '1');
    
    const response = await fetch('publish_cv_mvc.php', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Success - update button and proceed to download
      publishBtn.innerHTML = '<i class="fas fa-check"></i> Publié!';
      publishBtn.style.background = '#28a745';
      
      // Wait a moment then hide modal and start download
      setTimeout(() => {
        hidePublishModal();
        triggerDownload();
      }, 1000);
      
    } else {
      console.error('❌ Publish error:', result.message);
      alert('Erreur lors de la publication: ' + (result.message || 'Erreur inconnue'));
      
      // Reset button
      publishBtn.innerHTML = originalText;
      publishBtn.disabled = false;
      publishBtn.style.background = '';
    }
    
  } catch (error) {
    console.error('❌ Publish error:', error);
    alert('Erreur lors de la publication: ' + error.message);
    
    // Reset button
    const publishBtn = document.querySelector('.btn-primary');
    publishBtn.innerHTML = '<i class="fas fa-share"></i> Publier et télécharger';
    publishBtn.disabled = false;
    publishBtn.style.background = '';
  }
}

function skipPublish() {
  // Hide modal and proceed to download without publishing
  hidePublishModal();
  triggerDownload();
}

function triggerDownload() {
  if (!window.generatedCVData) {
    console.error('❌ No CV data available for download');
    alert('Erreur: Aucune donnée de CV disponible pour le téléchargement');
    return;
  }
  
  // Trigger download
  if (window.generatedCVData.download_url) {
    window.location.href = window.generatedCVData.download_url;
  } else if (window.generatedCVData.pdf_path) {
    window.location.href = window.generatedCVData.pdf_path;
  } else if (window.generatedCVData.cv_id) {
    // Fallback: construct download URL from CV ID
    const downloadUrl = 'download_cv_mvc.php?id=' + window.generatedCVData.cv_id + 
                       '&format=' + window.generatedCVData.selectedFormat;
    window.location.href = downloadUrl;
  }
  
  // Clear the stored data
  window.generatedCVData = null;
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('publishModal');
  if (modal && e.target === modal) {
    hidePublishModal();
    // Still trigger download if user clicks outside
    triggerDownload();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('publishModal');
    if (modal && modal.style.display === 'flex') {
      hidePublishModal();
      // Still trigger download if user presses escape
      triggerDownload();
    }
  }
});

// ============ END PUBLISH MODAL FUNCTIONS ============
