let currentStep = 1;
      const totalSteps = 9;
      let previewVisible = false;

      // Photo upload functions
      function handlePhotoUpload(input) {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            const removeBtn = document.getElementById('remove-photo-btn');
            const existingPhotoField = document.getElementById('existing_photo_path');
            
            // Clear existing photo path since we're uploading a new one
            if (existingPhotoField) {
              existingPhotoField.value = '';
            }
            
            // Create img element
            const img = document.createElement('img');
            img.src = e.target.result;
            
            // Clear existing content and add image
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.classList.add('has-image');
            
            // Show remove button
            removeBtn.style.display = 'inline-block';
            
            // Update preview if visible
            if (previewVisible) {
              updatePreview();
            }
          };
          reader.readAsDataURL(file);
        }
      }

      function removePhoto() {
        const preview = document.getElementById('photo-preview');
        const removeBtn = document.getElementById('remove-photo-btn');
        const fileInput = document.getElementById('photo-upload');
        const existingPhotoField = document.getElementById('existing_photo_path');
        
        // Reset preview
        preview.innerHTML = '<i class="fas fa-camera"></i><span>Ajouter une photo (optionnel)</span>';
        preview.classList.remove('has-image');
        
        // Hide remove button
        removeBtn.style.display = 'none';
        
        // Clear file input
        fileInput.value = '';
        
        // Clear existing photo path
        if (existingPhotoField) {
          existingPhotoField.value = '';
        }
        
        // Update preview if visible
        if (previewVisible) {
          updatePreview();
        }
      }

      // Function to load and display existing photo when editing a CV
      function loadExistingPhoto(photoPath) {
        if (!photoPath) return;
        
        const preview = document.getElementById('photo-preview');
        const removeBtn = document.getElementById('remove-photo-btn');
        const existingPhotoField = document.getElementById('existing_photo_path');
        
        // Set the existing photo path in the hidden field
        if (existingPhotoField) {
          existingPhotoField.value = photoPath;
        }
        
        // Create img element with the existing photo
        const img = document.createElement('img');
        img.src = photoPath;
        img.onerror = function() {
          console.warn('Failed to load existing photo:', photoPath);
          // Reset to default state if image fails to load
          preview.innerHTML = '<i class="fas fa-camera"></i><span>Ajouter une photo (optionnel)</span>';
          preview.classList.remove('has-image');
          removeBtn.style.display = 'none';
          if (existingPhotoField) {
            existingPhotoField.value = '';
          }
        };
        img.onload = function() {
          console.log('✅ Existing photo loaded successfully:', photoPath);
          // Clear existing content and add image
          preview.innerHTML = '';
          preview.appendChild(img);
          preview.classList.add('has-image');
          
          // Show remove button
          removeBtn.style.display = 'inline-block';
          
          // Update preview if visible
          if (previewVisible) {
            updatePreview();
          }
        };
      }

      // Add form submission debugging
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM Content Loaded - Initializing form...');
        
        // Check for custom CV name from user_home.html
        const customCVName = sessionStorage.getItem('newCVName');
        if (customCVName) {
          showCustomCVNameNotification(customCVName);
        }
        
        // Check if user is in guest mode (came from main page without authentication)
        const urlParams = new URLSearchParams(window.location.search);
        const isGuestMode = urlParams.get('mode') === 'guest';
        
        // Hide authentication-related buttons in guest mode
        if (isGuestMode) {
          console.log('👤 Guest mode detected - hiding authentication-related buttons');
          hideAuthButtons();
        } else {
          // Optional session check on load - don't redirect if it fails
          checkSessionStatus(false).catch(error => {
            console.warn('⚠️ Initial session check failed, but continuing:', error);
          });
        }
        
        const form = document.getElementById('cvForm');
        
        // Initialize live preview
        initializeLivePreview();
        
        // Check if we're in edit mode
        const editCvId = urlParams.get('edit');
        
        if (editCvId) {
          console.log('🔧 Edit mode detected for CV ID:', editCvId);
          loadCVForEdit(editCvId);
          
          // Update page title and header to indicate edit mode
          document.title = 'CV Generator - Modification du CV';
          const headerTitle = document.querySelector('.header h2');
          if (headerTitle) {
            headerTitle.textContent = 'Modification de votre CV';
          }
          const headerDescription = document.querySelector('.header p');
          if (headerDescription) {
            headerDescription.textContent = 'Modifiez les informations de votre CV existant';
          }
          
          // Update submit button text
          const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à jour le CV';
          }
        }
        
        // Disable HTML5 validation for hidden fields
        function updateRequiredFields() {
          // Remove required from all fields first
          document.querySelectorAll('input[required], textarea[required]').forEach(field => {
            if (!field.closest('.step-content.active')) {
              field.removeAttribute('required');
            }
          });
        }
        
        if (form) {
          // Remove any existing action to prevent redirect
          form.removeAttribute('action');
          form.setAttribute('action', 'javascript:void(0);');
          form.setAttribute('onsubmit', 'return false;');
          
          // Multiple ways to prevent form submission
          form.addEventListener('submit', function(e) {
            console.log('🚫 Form submit intercepted!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Call our custom handler instead
            handleFormSubmissionDirectly();
            return false;
          }, true); // Use capture phase
          
          // Override form submit method
          form.submit = function() {
            console.log('🚫 Form.submit() method overridden!');
            handleFormSubmissionDirectly();
            return false;
          };
          
          console.log('✅ Form submission completely blocked');
        } else {
          console.error('❌ Form not found!');
        }
        
        // Additional safeguard: Override form onsubmit
        if (form) {
          form.onsubmit = function(e) {
            console.log('🚫 Form onsubmit override triggered!');
            e.preventDefault();
            e.stopPropagation();
            
            // Call our custom handler instead
            handleFormSubmissionDirectly();
            return false;
          };
          
          console.log('✅ Form submission handlers installed successfully');
        }
        
        // Add click handler to submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
          // Remove any existing event listeners by cloning the node
          const newSubmitBtn = submitBtn.cloneNode(true);
          submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
          
          // Add our custom click handler
          newSubmitBtn.addEventListener('click', function(e) {
            console.log('🖱️ Submit button clicked!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Don't trigger form submission - handle directly
            handleFormSubmissionDirectly();
          });
          
          // Also prevent any form submission that might be triggered
          newSubmitBtn.addEventListener('submit', function(e) {
            console.log('🚫 Submit event on button intercepted!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          });
          
          console.log('✅ Submit button click handler installed');
        }
        
        // COMPREHENSIVE FORM SUBMISSION BLOCKER
        // This absolutely prevents any form submission from happening
        if (form) {
          // Replace the form's action completely
          form.action = 'javascript:void(0);';
          form.method = 'GET';  // Change to GET to prevent POST redirect
          
          // Create a bulletproof event blocker
          const blockSubmission = function(e) {
            console.log('🛑 BLOCKING FORM SUBMISSION!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Instead, call our custom handler
            handleFormSubmissionDirectly();
            return false;
          };
          
          // Block ALL possible submission events
          form.addEventListener('submit', blockSubmission, true);
          form.addEventListener('submit', blockSubmission, false);
          
          // Override ALL submit-related methods
          form.submit = blockSubmission;
          form.onsubmit = blockSubmission;
          
          // Block Enter key submissions
          form.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.type !== 'textarea') {
              console.log('🛑 BLOCKING ENTER KEY SUBMISSION!');
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              return false;
            }
          }, true);
          
          // Monitor for any button clicks that might trigger submission
          document.addEventListener('click', function(e) {
            if (e.target.form === form && (e.target.type === 'submit' || e.target.id === 'submitBtn')) {
              console.log('🛑 BLOCKING BUTTON SUBMISSION!');
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              // Call our custom handler instead
              handleFormSubmissionDirectly();
              return false;
            }
          }, true);
          
          console.log('🛡️ COMPREHENSIVE FORM SUBMISSION BLOCKER INSTALLED');
        }
        
        // Additional initialization for enhanced features
        initializeEnhancedFeatures();
      });
      
      // Function to check session status
      async function checkSessionStatus(isGuestMode = false) {
        try {
          console.log('🔍 Checking session status...');
          
          const response = await fetch('../Login_Signup/check_session_mvc.php');
          
          if (!response.ok) {
            console.warn('⚠️ Session check failed with status:', response.status);
            // Don't fail hard if session check endpoint has issues
            return true; // Assume session is valid for now
          }
          
          const result = await response.json();
          console.log('📋 Session status:', result);
          
          if (!result.logged_in) {
            if (isGuestMode) {
              console.log('👤 User not logged in but in guest mode - continuing...');
              return false; // Return false but don't redirect
            } else {
              console.warn('⚠️ User not logged in!');
              alert('Session expirée. Vous allez être redirigé vers la page de connexion.');
              window.location.href = '../Login_Signup/auth.html';
              return false;
            }
          }
          
          console.log('✅ User session valid:', result);
          return true;
        } catch (error) {
          console.error('❌ Error checking session:', error);
          // Don't fail the form submission if session check has network issues
          console.log('⚠️ Session check failed, continuing anyway...');
          return true;
        }
      }

      // Function to hide authentication-related buttons for guest users
      function hideAuthButtons() {
        const authButtons = [
          'myCvsLink',
          'userHomeBtn', 
          'logoutBtn'
        ];
        
        authButtons.forEach(buttonId => {
          const button = document.getElementById(buttonId);
          if (button) {
            button.style.display = 'none';
            console.log(`🚫 Hidden button: ${buttonId}`);
          }
        });
        
        // Disable XML, LaTeX, and ZIP download options for guest users (only PDF allowed)
        const restrictedFormats = ['xml', 'latex', 'all'];
        restrictedFormats.forEach(formatValue => {
          const option = document.querySelector(`input[name="format"][value="${formatValue}"]`);
          if (option) {
            option.disabled = true;
            const label = option.closest('label');
            if (label) {
              label.style.opacity = '0.5';
              label.style.cursor = 'not-allowed';
              
              // Add a note about the restriction
              const formatContent = label.querySelector('.format-content');
              if (formatContent) {
                const restriction = document.createElement('span');
                restriction.style.cssText = 'color: #dc3545; font-size: 12px; font-style: italic; display: block; margin-top: 4px;';
                restriction.textContent = 'Non disponible en mode invité - Créez un compte pour cette option';
                formatContent.appendChild(restriction);
              }
            }
            console.log(`🚫 Disabled ${formatValue.toUpperCase()} download option for guest user`);
          }
        });
        
        // Add a note for guest users
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
          const guestNote = document.createElement('span');
          guestNote.className = 'guest-note';
          guestNote.innerHTML = '<i class="fas fa-info-circle"></i> Mode invité - Téléchargement PDF uniquement. <a href="../Login_Signup/auth.html">Créez un compte</a> pour accéder à tous les formats';
          guestNote.style.cssText = 'color: #666; font-size: 14px; margin-right: 15px;';
          headerActions.insertBefore(guestNote, headerActions.firstChild);
        }
      }

      // Function to show a notification about the custom CV name
      function showCustomCVNameNotification(cvName) {
        // Update page title
        document.title = 'CV Generator - Création: ' + cvName;
        
        // Update header title
        const headerTitle = document.querySelector('.header h2');
        if (headerTitle) {
          headerTitle.textContent = 'Nouveau CV: ' + cvName;
        }
        
        // Show notification
        const header = document.querySelector('.header');
        if (header) {
          const notification = document.createElement('div');
          notification.style.cssText = 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 8px; padding: 12px 16px; margin: 10px 0; display: flex; align-items: center; gap: 10px; font-size: 14px;';
          notification.innerHTML = '<i class="fas fa-info-circle"></i><span>Création du CV: <strong>' + cvName + '</strong></span>';
          header.appendChild(notification);
          setTimeout(function() { 
            if (notification.parentElement) notification.remove(); 
          }, 5000);
          console.log('📋 Showing CV name notification:', cvName);
        }
      }

      function showStep(step) {
        // Hide all step contents
        document.querySelectorAll('.step-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Hide all step indicators
        document.querySelectorAll('.step').forEach(stepEl => {
          stepEl.classList.remove('active');
        });
        
        // Show current step content and indicator
        document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
        
        // Update navigation buttons
        document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'inline-block';
        document.getElementById('nextBtn').style.display = step === totalSteps ? 'none' : 'inline-block';
        document.getElementById('submitBtn').style.display = step === totalSteps ? 'inline-block' : 'none';
        
        // Update step text
        document.getElementById('currentStepText').textContent = `Étape ${step} sur ${totalSteps}`;
        
        // Manage required attributes - only required for basic fields, not step-specific ones
        document.querySelectorAll('input, textarea').forEach(field => {
          const basicRequired = ['nom', 'prenom', 'location', 'email', 'telephone', 'profil_description'];
          if (basicRequired.includes(field.name)) {
            field.setAttribute('required', 'required');
          } else {
            field.removeAttribute('required');
          }
        });
      }

      function changeStep(direction) {
        const newStep = currentStep + direction;
        if (newStep >= 1 && newStep <= totalSteps) {
          currentStep = newStep;
          showStep(currentStep);
        }
      }

      // Dynamic form functions
      function addEducation() {
        const container = document.getElementById('education');
        const newEntry = container.querySelector('.education-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeEducation(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function addCertificate() {
        const container = document.getElementById('certificates');
        const newEntry = container.querySelector('.certificate-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeCertificate(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function addExperience() {
        const container = document.getElementById('experiences');
        const newEntry = container.querySelector('.experience-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeExperience(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function addProject() {
        const container = document.getElementById('projects');
        const newEntry = container.querySelector('.project-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeProject(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function addSkill() {
        const container = document.getElementById('skills');
        const newEntry = container.querySelector('.skill-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeSkill(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function addLanguage() {
        const container = document.getElementById('languages');
        const newEntry = container.querySelector('.language-entry').cloneNode(true);
        newEntry.querySelectorAll('input, select').forEach(input => {
          if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
          } else {
            input.value = '';
          }
        });
        newEntry.querySelector('.remove-btn').style.display = 'inline-block';
        container.appendChild(newEntry);
        triggerPreviewUpdate();
      }

      function removeLanguage(button) {
        button.parentElement.remove();
        triggerPreviewUpdate();
      }

      function logout() {
        // Logout functionality
        console.log('Logout clicked');
      }

      // Function to load CV data for editing
      async function loadCVForEdit(cvId) {
        try {
          console.log('📥 Loading CV data for ID:', cvId);
          
          // Show loading indicator
          const headerTitle = document.querySelector('.header h2');
          if (headerTitle) {
            headerTitle.textContent = 'Chargement du CV...';
          }
          
          const response = await fetch(`get_cv_data_mvc.php?cv_id=${cvId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('📥 CV data response:', result);
          
          if (result.status === 'success') {
            // Handle different response formats
            let xmlContent = null;
            if (result.cv && result.cv.data) {
              xmlContent = result.cv.data;
            } else if (result.cv_data) {
              xmlContent = result.cv_data;
            } else if (result.xml_content) {
              xmlContent = result.xml_content;
            }
            
            if (xmlContent) {
              console.log('✅ CV data loaded successfully');
              
              // Set the editing CV ID in the hidden field
              const editingCvIdField = document.getElementById('editing_cv_id');
              if (editingCvIdField) {
                editingCvIdField.value = cvId;
              }
              
              // Update header title to show we're editing
              const headerTitle = document.querySelector('.header h2');
              if (headerTitle) {
                headerTitle.textContent = 'Modification de votre CV';
              }
              
              populateFormWithCVData(xmlContent);
            } else {
              console.error('❌ No CV data found in response');
              alert('Erreur lors du chargement des données du CV');
              window.location.href = 'user_home.html';
            }
          } else {
            console.error('❌ Failed to load CV data:', result.message);
            alert('Erreur lors du chargement des données du CV: ' + (result.message || 'Erreur inconnue'));
            
            // Redirect back to user home on error
            window.location.href = 'user_home.html';
          }
        } catch (error) {
          console.error('❌ Network error loading CV:', error);
          alert('Erreur réseau lors du chargement du CV');
          
          // Redirect back to user home on error
          window.location.href = 'user_home.html';
        }
      }

      // Function to populate form with CV data
      function populateFormWithCVData(xmlContent) {
        console.log('📝 Populating form with XML data...', xmlContent);
        
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
          
          // Check for XML parsing errors
          const parseError = xmlDoc.querySelector('parsererror');
          if (parseError) {
            throw new Error('XML parsing error: ' + parseError.textContent);
          }
          
          console.log('✓ XML parsé avec succès');
          
          // Debug: Show the actual XML structure
          console.log('📋 XML Document structure:');
          console.log('- Root element:', xmlDoc.documentElement.tagName);
          console.log('- Child elements:', Array.from(xmlDoc.documentElement.children).map(el => el.tagName));
          
          // Show available nodes for debugging
          const allNodes = xmlDoc.querySelectorAll('*');
          console.log('- All XML nodes:', Array.from(allNodes).map(node => node.tagName));
          
          // Debug specific sections
          const experiencesNodes = xmlDoc.querySelectorAll('experiences experience');
          console.log('- Experiences found:', experiencesNodes.length);
          if (experiencesNodes.length > 0) {
            experiencesNodes.forEach((exp, index) => {
              console.log(`  Experience ${index}:`, {
                period: exp.querySelector('period')?.textContent,
                position: exp.querySelector('position')?.textContent,
                company: exp.querySelector('company')?.textContent,
                location: exp.querySelector('location')?.textContent
              });
            });
          }
          
          const skillsNodes = xmlDoc.querySelectorAll('skills skill');
          console.log('- Skills found:', skillsNodes.length);
          if (skillsNodes.length > 0) {
            skillsNodes.forEach((skill, index) => {
              console.log(`  Skill ${index}:`, {
                category: skill.querySelector('category')?.textContent,
                items: skill.querySelector('items')?.textContent
              });
            });
          }
          
          // Clear loading message
          const headerTitle = document.querySelector('.header h2');
          if (headerTitle && headerTitle.textContent === 'Chargement du CV...') {
            headerTitle.textContent = 'Modification de votre CV';
          }
          
          // Informations personnelles
          const personalInfo = xmlDoc.querySelector('personalInfo');
          if (personalInfo) {
            console.log('✓ Section personalInfo trouvée');
            
            setFieldValue('prenom', personalInfo.querySelector('firstname')?.textContent || '');
            setFieldValue('nom', personalInfo.querySelector('lastname')?.textContent || '');
            setFieldValue('email', personalInfo.querySelector('email')?.textContent || '');
            setFieldValue('telephone', personalInfo.querySelector('phone')?.textContent || '');
            setFieldValue('linkedin', personalInfo.querySelector('linkedin')?.textContent || '');
            setFieldValue('github', personalInfo.querySelector('github')?.textContent || '');
            setFieldValue('website', personalInfo.querySelector('website')?.textContent || '');
            setFieldValue('location', personalInfo.querySelector('location')?.textContent || '');
            
            // Handle photo if exists
            const photoPath = personalInfo.querySelector('photo')?.textContent || '';
            if (photoPath) {
              loadExistingPhoto(photoPath);
            }
          }
          
          // Profile description (could be in personalInfo or separate profil section)
          let profileDescription = '';
          const personalInfoProfileDesc = xmlDoc.querySelector('personalInfo profileDescription');
          const profilInfo = xmlDoc.querySelector('profil');
          
          if (personalInfoProfileDesc) {
            profileDescription = personalInfoProfileDesc.textContent || '';
          } else if (profilInfo) {
            profileDescription = profilInfo.querySelector('description')?.textContent || '';
          }
          
          if (profileDescription) {
            setFieldValue('profil_description', profileDescription);
          }
          // Expériences professionnelles
          const workExperiences = xmlDoc.querySelectorAll('experiences experience') || xmlDoc.querySelectorAll('experience');
          if (workExperiences.length > 0) {
            console.log('✓ Chargement des expériences:', workExperiences.length);
            const experiencesContainer = document.getElementById('experiences');
            if (experiencesContainer) {
              // Clear existing experience entries but keep the first one as template
              const existingEntries = experiencesContainer.querySelectorAll('.experience-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              workExperiences.forEach((experience, index) => {
                let currentEntry;
                
                if (index === 0 && existingEntries.length > 0) {
                  // Use the first existing entry
                  currentEntry = existingEntries[0];
                } else {
                  // Add new entry
                  addExperience();
                  const entries = experiencesContainer.querySelectorAll('.experience-entry');
                  currentEntry = entries[entries.length - 1];
                }
                
                if (currentEntry) {
                  // Get values from XML - prioritize the correct field names from the XML structure
                  const position = experience.querySelector('position')?.textContent || experience.querySelector('jobTitle, title')?.textContent || '';
                  const company = experience.querySelector('company')?.textContent || experience.querySelector('employer, organization')?.textContent || '';
                  const location = experience.querySelector('location')?.textContent || experience.querySelector('city, place')?.textContent || '';
                  const period = experience.querySelector('period')?.textContent || '';
                  const description = experience.querySelector('description')?.textContent || experience.querySelector('responsibilities, duties')?.textContent || '';
                  
                  console.log(`Experience ${index}:`, { position, company, location, period, description });
                  
                  // Set values using the entry-specific approach
                  setFieldValueInEntry(currentEntry, '[name="experience_company[]"]', company);
                  setFieldValueInEntry(currentEntry, '[name="experience_position[]"]', position);
                  setFieldValueInEntry(currentEntry, '[name="experience_location[]"]', location);
                  setFieldValueInEntry(currentEntry, '[name="experience_dates[]"]', period);
                  setFieldValueInEntry(currentEntry, '[name="experience_description[]"]', description);
                }
              });
            }
          }
          
          // Formation
          const educations = xmlDoc.querySelectorAll('education degree') || xmlDoc.querySelectorAll('education') || xmlDoc.querySelectorAll('degree');
          if (educations.length > 0) {
            console.log('✓ Chargement de la formation:', educations.length);
            const educationContainer = document.getElementById('education');
            if (educationContainer) {
              // Clear existing education entries but keep the first one as template
              const existingEntries = educationContainer.querySelectorAll('.education-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              educations.forEach((education, index) => {
                let currentEntry;
                
                if (index === 0 && existingEntries.length > 0) {
                  // Use the first existing entry
                  currentEntry = existingEntries[0];
                } else {
                  // Add new entry
                  addEducation();
                  const entries = educationContainer.querySelectorAll('.education-entry');
                  currentEntry = entries[entries.length - 1];
                }
                
                if (currentEntry) {
                  // Get values from XML - prioritize the correct field names from the XML structure
                  const title = education.querySelector('title')?.textContent || education.querySelector('name, degree')?.textContent || '';
                  const institution = education.querySelector('institution')?.textContent || education.querySelector('school, university')?.textContent || '';
                  const period = education.querySelector('period')?.textContent || education.querySelector('dates')?.textContent || '';
                  const field = education.querySelector('field')?.textContent || education.querySelector('major, specialization')?.textContent || '';
                  const description = education.querySelector('description')?.textContent || education.querySelector('details')?.textContent || '';
                  
                  console.log(`Education ${index}:`, { title, institution, period, field, description });

                  // Set values using the entry-specific approach
                  setFieldValueInEntry(currentEntry, '[name="education_degree[]"]', title);
                  setFieldValueInEntry(currentEntry, '[name="education_university[]"]', institution);
                  setFieldValueInEntry(currentEntry, '[name="education_field[]"]', field);
                  setFieldValueInEntry(currentEntry, '[name="education_dates[]"]', period);
                  setFieldValueInEntry(currentEntry, '[name="education_details[]"]', description);
                }
              });
            }
          }
          
          // Compétences
          const skills = xmlDoc.querySelector('skills');
          if (skills) {
            console.log('✓ Section compétences trouvée');
            const skillsContainer = document.getElementById('skills');
            if (skillsContainer) {
              // Clear existing skill entries but keep the first one as template
              const existingEntries = skillsContainer.querySelectorAll('.skill-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              // Handle the new XML structure with individual skill entries
              const skillEntries = skills.querySelectorAll('skill');
              if (skillEntries.length > 0) {
                console.log('✓ Chargement des compétences:', skillEntries.length);
                
                skillEntries.forEach((skillEntry, index) => {
                  let currentEntry;
                  
                  if (index === 0 && existingEntries.length > 0) {
                    // Use the first existing entry
                    currentEntry = existingEntries[0];
                  } else {
                    // Add new entry
                    addSkill();
                    const entries = skillsContainer.querySelectorAll('.skill-entry');
                    currentEntry = entries[entries.length - 1];
                  }
                  
                  if (currentEntry) {
                    const category = skillEntry.querySelector('category')?.textContent || '';
                    const items = skillEntry.querySelector('items')?.textContent || '';
                    
                    console.log(`Skill ${index}:`, { category, items });
                    
                    // Set values using the entry-specific approach
                    setFieldValueInEntry(currentEntry, '[name="skill_category[]"]', category);
                    setFieldValueInEntry(currentEntry, '[name="skill_items[]"]', items);
                  }
                });
              } else {
                // Fallback: Handle legacy structure with technical/soft skills
                const technicalSkills = skills.querySelector('technical')?.textContent || '';
                if (technicalSkills && existingEntries.length > 0) {
                  setFieldValueInEntry(existingEntries[0], '[name="skill_category[]"]', 'Compétences techniques');
                  setFieldValueInEntry(existingEntries[0], '[name="skill_items[]"]', technicalSkills);
                }
                
                const softSkills = skills.querySelector('soft')?.textContent || '';
                if (softSkills) {
                  if (technicalSkills) {
                    // Add new entry for soft skills
                    addSkill();
                    const entries = skillsContainer.querySelectorAll('.skill-entry');
                    const softSkillEntry = entries[entries.length - 1];
                    setFieldValueInEntry(softSkillEntry, '[name="skill_category[]"]', 'Compétences personnelles');
                    setFieldValueInEntry(softSkillEntry, '[name="skill_items[]"]', softSkills);
                  } else if (existingEntries.length > 0) {
                    // Use first entry for soft skills if no technical skills
                    setFieldValueInEntry(existingEntries[0], '[name="skill_category[]"]', 'Compétences personnelles');
                    setFieldValueInEntry(existingEntries[0], '[name="skill_items[]"]', softSkills);
                  }
                }
              }
            }
          }
          
          // Langues
          const languages = xmlDoc.querySelectorAll('languages language') || xmlDoc.querySelectorAll('language');
          if (languages.length > 0) {
            console.log('✓ Chargement des langues:', languages.length);
            const languagesContainer = document.getElementById('languages');
            if (languagesContainer) {
              // Clear existing language entries but keep the first one as template
              const existingEntries = languagesContainer.querySelectorAll('.language-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              languages.forEach((language, index) => {
                let currentEntry;
                
                if (index === 0 && existingEntries.length > 0) {
                  // Use the first existing entry
                  currentEntry = existingEntries[0];
                } else {
                  // Add new entry
                  addLanguage();
                  const entries = languagesContainer.querySelectorAll('.language-entry');
                  currentEntry = entries[entries.length - 1];
                }
                
                if (currentEntry) {
                  // Get values from XML - prioritize the correct field names from the XML structure
                  const name = language.querySelector('n')?.textContent || language.querySelector('name, language')?.textContent || '';
                  const level = language.querySelector('level')?.textContent || language.querySelector('proficiency')?.textContent || '';
                  
                  console.log(`Language ${index}:`, { name, level });
                  
                  // Set values using the entry-specific approach
                  setFieldValueInEntry(currentEntry, '[name="language_name[]"]', name);
                  setFieldValueInEntry(currentEntry, '[name="language_level[]"]', level);
                }
              });
            }
          }
          
          // Certificats
          const certificates = xmlDoc.querySelectorAll('certificates certificate') || xmlDoc.querySelectorAll('certificate');
          if (certificates.length > 0) {
            console.log('✓ Chargement des certificats:', certificates.length);
            const certificatesContainer = document.getElementById('certificates');
            if (certificatesContainer) {
              // Clear existing certificate entries but keep the first one as template
              const existingEntries = certificatesContainer.querySelectorAll('.certificate-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              certificates.forEach((certificate, index) => {
                let currentEntry;
                
                if (index === 0 && existingEntries.length > 0) {
                  // Use the first existing entry
                  currentEntry = existingEntries[0];
                } else {
                  // Add new entry
                  addCertificate();
                  const entries = certificatesContainer.querySelectorAll('.certificate-entry');
                  currentEntry = entries[entries.length - 1];
                }
                
                if (currentEntry) {
                  const name = certificate.querySelector('name, title')?.textContent || '';
                  const date = certificate.querySelector('date, issueDate')?.textContent || '';
                  const issuer = certificate.querySelector('issuer, authority, organization')?.textContent || '';
                  const location = certificate.querySelector('location, place')?.textContent || '';
                  const description = certificate.querySelector('description, details')?.textContent || '';
                  
                  console.log(`Certificate ${index}:`, { name, date, issuer, location, description });
                  
                  // Set values using the entry-specific approach
                  setFieldValueInEntry(currentEntry, '[name="certificate_name[]"]', name);
                  setFieldValueInEntry(currentEntry, '[name="certificate_date[]"]', date);
                  setFieldValueInEntry(currentEntry, '[name="certificate_issuer[]"]', issuer);
                  setFieldValueInEntry(currentEntry, '[name="certificate_location[]"]', location);
                  setFieldValueInEntry(currentEntry, '[name="certificate_description[]"]', description);
                }
              });
            }
          }
          
          // Projets
          const projects = xmlDoc.querySelectorAll('projects project') || xmlDoc.querySelectorAll('project');
          if (projects.length > 0) {
            console.log('✓ Chargement des projets:', projects.length);
            const projectsContainer = document.getElementById('projects');
            if (projectsContainer) {
              // Clear existing project entries but keep the first one as template
              const existingEntries = projectsContainer.querySelectorAll('.project-entry');
              for (let i = existingEntries.length - 1; i > 0; i--) {
                existingEntries[i].remove();
              }
              
              projects.forEach((project, index) => {
                let currentEntry;
                
                if (index === 0 && existingEntries.length > 0) {
                  // Use the first existing entry
                  currentEntry = existingEntries[0];
                } else {
                  // Add new entry
                  addProject();
                  const entries = projectsContainer.querySelectorAll('.project-entry');
                  currentEntry = entries[entries.length - 1];
                }
                
                if (currentEntry) {
                  const name = project.querySelector('name, title')?.textContent || '';
                  const link = project.querySelector('link, url, github')?.textContent || '';
                  const description = project.querySelector('description, details')?.textContent || '';
                  
                  console.log(`Project ${index}:`, { name, link, description });
                  
                  // Set values using the entry-specific approach
                  setFieldValueInEntry(currentEntry, '[name="project_name[]"]', name);
                  setFieldValueInEntry(currentEntry, '[name="project_link[]"]', link);
                  setFieldValueInEntry(currentEntry, '[name="project_description[]"]', description);
                }
              });
            }
          }
          
          // Personnalisation (couleur)
          const customization = xmlDoc.querySelector('customization') || xmlDoc.querySelector('theme');
          if (customization) {
            const primaryColor = customization.querySelector('primaryColor, color')?.textContent || '';
            if (primaryColor) {
              console.log('✓ Chargement de la couleur personnalisée:', primaryColor);
              
              // Set the color in both the hidden field and the visible color picker
              setFieldValue('primary_color', primaryColor);
              
              const colorPicker = document.getElementById('primary_color_external');
              if (colorPicker) {
                colorPicker.value = primaryColor;
              }
            }
          }
          
          console.log('✅ Formulaire peuplé avec succès');
          
          // Log summary of what was loaded
          console.log('📊 Résumé du chargement:');
          console.log('- Informations personnelles:', personalInfo ? '✓' : '✗');
          console.log('- Description profil:', profileDescription ? '✓' : '✗');
          console.log('- Expériences:', workExperiences ? workExperiences.length : 0, 'trouvées');
          console.log('- Formations:', educations ? educations.length : 0, 'trouvées');
          console.log('- Compétences:', skills ? '✓' : '✗');
          console.log('- Langues:', languages ? languages.length : 0, 'trouvées');
          
          // Check certificates and projects (need to be declared here)
          const certificatesFound = xmlDoc.querySelectorAll('certificates certificate');
          const projectsFound = xmlDoc.querySelectorAll('projects project');
          const customizationFound = xmlDoc.querySelector('customization') || xmlDoc.querySelector('theme');
          
          console.log('- Certificats:', certificatesFound.length, 'trouvés');
          console.log('- Projets:', projectsFound.length, 'trouvés');
          console.log('- Personnalisation:', customizationFound ? '✓' : '✗');
          
          // Show success message
          const headerTitleElement = document.querySelector('.header h2');
          if (headerTitleElement) {
            headerTitleElement.textContent = 'Modification de votre CV';
          }
          
          // Optional: Show a brief success notification
          setTimeout(() => {
            console.log('🎉 CV chargé et prêt pour modification');
          }, 100);
          
        } catch (error) {
          console.error('❌ Erreur lors du parsing XML:', error);
          alert('Erreur lors du chargement des données du CV: ' + error.message);
        }
      }
      
      // Helper function to decode HTML entities
      function decodeHtmlEntities(text) {
        if (!text) return text;
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
      }

      // Helper function to set field values
      function setFieldValue(fieldName, value) {
        const field = document.querySelector(`[name="${fieldName}"]`) || document.getElementById(fieldName);
        if (field) {
          if (field.type === 'date' && value) {
            // Handle date format conversion if needed
            if (value.includes('/')) {
              const parts = value.split('/');
              if (parts.length === 3) {
                value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }
          // Decode HTML entities before setting the value
          field.value = decodeHtmlEntities(value);
          console.log(`✓ Field ${fieldName} set to: ${decodeHtmlEntities(value)}`);
        } else {
          console.error(`✗ Field ${fieldName} not found`);
        }
      }

      // Helper function to populate certificates
      function populateCertificates(certificatesData) {
        const container = document.getElementById('certificates');
        const existingEntries = container.querySelectorAll('.certificate-entry');
        
        certificatesData.forEach((cert, index) => {
          let currentEntry;
          
          if (index < existingEntries.length) {
            currentEntry = existingEntries[index];
          } else {
            addCertificate();
            const entries = container.querySelectorAll('.certificate-entry');
            currentEntry = entries[entries.length - 1];
          }
          
          if (currentEntry) {
            setFieldValueInEntry(currentEntry, '[name="certificate_name[]"]', cert.name);
            setFieldValueInEntry(currentEntry, '[name="certificate_date[]"]', cert.date);
            setFieldValueInEntry(currentEntry, '[name="certificate_issuer[]"]', cert.issuer);
            setFieldValueInEntry(currentEntry, '[name="certificate_location[]"]', cert.location);
            setFieldValueInEntry(currentEntry, '[name="certificate_description[]"]', cert.description);
          }
        });
      }

      // Helper function to populate experiences
      function populateExperiences(experiencesData) {
        const container = document.getElementById('experiences');
        const existingEntries = container.querySelectorAll('.experience-entry');
        
        experiencesData.forEach((exp, index) => {
          let currentEntry;
          
          if (index < existingEntries.length) {
            currentEntry = existingEntries[index];
          } else {
            addExperience();
            const entries = container.querySelectorAll('.experience-entry');
            currentEntry = entries[entries.length - 1];
          }
          
          if (currentEntry) {
            setFieldValueInEntry(currentEntry, '[name="experience_location[]"]', exp.location);
            setFieldValueInEntry(currentEntry, '[name="experience_dates[]"]', exp.dates);
            setFieldValueInEntry(currentEntry, '[name="experience_company[]"]', exp.company);
            setFieldValueInEntry(currentEntry, '[name="experience_position[]"]', exp.position);
            setFieldValueInEntry(currentEntry, '[name="experience_description[]"]', exp.description);
          }
        });
      }

      // Helper function to populate projects
      function populateProjects(projectsData) {
        const container = document.getElementById('projects');
        const existingEntries = container.querySelectorAll('.project-entry');
        
        projectsData.forEach((project, index) => {
          let currentEntry;
          
          if (index < existingEntries.length) {
            currentEntry = existingEntries[index];
          } else {
            addProject();
            const entries = container.querySelectorAll('.project-entry');
            currentEntry = entries[entries.length - 1];
          }
          
          if (currentEntry) {
            setFieldValueInEntry(currentEntry, '[name="project_name[]"]', project.name);
            setFieldValueInEntry(currentEntry, '[name="project_link[]"]', project.link);
            setFieldValueInEntry(currentEntry, '[name="project_description[]"]', project.description);
          }
        });
      }

      // Helper function to populate skills
      function populateSkills(skillsData) {
        const container = document.getElementById('skills');
        const existingEntries = container.querySelectorAll('.skill-entry');
        
        skillsData.forEach((skill, index) => {
          let currentEntry;
          
          if (index < existingEntries.length) {
            currentEntry = existingEntries[index];
          } else {
            addSkill();
            const entries = container.querySelectorAll('.skill-entry');
            currentEntry = entries[entries.length - 1];
          }
          
          if (currentEntry) {
            setFieldValueInEntry(currentEntry, '[name="skill_category[]"]', skill.category);
            setFieldValueInEntry(currentEntry, '[name="skill_items[]"]', skill.items);
          }
        });
      }

      // Helper function to populate languages
      function populateLanguages(languagesData) {
        const container = document.getElementById('languages');
        const existingEntries = container.querySelectorAll('.language-entry');
        
        languagesData.forEach((lang, index) => {
          let currentEntry;
          
          if (index < existingEntries.length) {
            currentEntry = existingEntries[index];
          } else {
            addLanguage();
            const entries = container.querySelectorAll('.language-entry');
            currentEntry = entries[entries.length - 1];
          }
          
          if (currentEntry) {
            setFieldValueInEntry(currentEntry, '[name="language_name[]"]', lang.name);
            const select = currentEntry.querySelector('[name="language_level[]"]');
            if (select && lang.level) {
              select.value = lang.level;
            }
          }
        });
      }

      // Helper function to set field value within a specific entry
      function setFieldValueInEntry(entry, selector, value) {
        const field = entry.querySelector(selector);
        if (field) {
          if (field.type === 'date' && value) {
            // Handle date format conversion if needed
            if (value.includes('/')) {
              const parts = value.split('/');
              if (parts.length === 3) {
                value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }
          // Decode HTML entities before setting the value
          field.value = decodeHtmlEntities(value);
          console.log(`✓ Field ${selector} in entry set to: ${decodeHtmlEntities(value)}`);
        } else {
          console.error(`✗ Field ${selector} not found in entry`);
        }
      }

      // Function to fill form with test data
      function fillTestData() {
        console.log('🔧 Filling form with test data...');
        
        try {
          // Personal Information
          const setFieldValue = (name, value) => {
            const field = document.querySelector(`[name="${name}"]`);
            if (field) {
              field.value = value;
            } else {
              console.warn(`Field [name="${name}"] not found`);
            }
          };

          // Basic information
          setFieldValue('nom', 'Dupont');
          setFieldValue('prenom', 'Jean');
          setFieldValue('location', 'Paris, France');
          setFieldValue('email', 'jean.dupont@email.com');
          setFieldValue('telephone', '+33 1 23 45 67 89');
          setFieldValue('website', 'https://jeandupont.dev');
          setFieldValue('linkedin', 'https://linkedin.com/in/jeandupont');
          setFieldValue('github', 'https://github.com/jeandupont');
          setFieldValue('profil_description', 'Développeur Full-Stack passionné avec 5 ans d\'expérience dans la création d\'applications web modernes. Expertise en JavaScript, React, Node.js et bases de données. Recherche de nouveaux défis techniques dans une équipe dynamique.');
          
          // Helper function to fill first entry of a dynamic section
          const fillFirstEntry = (sectionName, data) => {
            const container = document.getElementById(sectionName);
            if (!container) {
              console.warn(`Container #${sectionName} not found`);
              return;
            }
            
            Object.entries(data).forEach(([fieldName, value]) => {
              const field = container.querySelector(`[name="${fieldName}"]`);
              if (field) {
                field.value = value;
              } else {
                console.warn(`Field [name="${fieldName}"] not found in ${sectionName}`);
              }
            });
          };

          // Education
          fillFirstEntry('education', {
            'education_degree[]': 'Master en Informatique',
            'education_dates[]': '2020',
            'education_university[]': 'Université Pierre et Marie Curie',
            'education_field[]': 'Génie Logiciel',
            'education_details[]': 'Mention Bien - Spécialisation en développement web et architecture logicielle'
          });

          // Experience
          fillFirstEntry('experiences', {
            'experience_location[]': 'Paris, France',
            'experience_dates[]': 'Jan 2021 – Présent',
            'experience_company[]': 'TechCorp Solutions',
            'experience_position[]': 'Développeur Full-Stack Senior',
            'experience_description[]': 'Développement d\'applications web modernes avec React et Node.js\nGestion et encadrement d\'une équipe de 3 développeurs juniors\nOptimisation des performances applicatives et renforcement de la sécurité\nMise en place de pipelines CI/CD avec Docker et Kubernetes\nConception d\'architectures scalables et maintenables\nParticipation aux décisions techniques et choix technologiques'
          });

          // Projects
          fillFirstEntry('projects', {
            'project_name[]': 'E-Commerce Platform',
            'project_link[]': 'https://github.com/jeandupont/ecommerce-platform',
            'project_description[]': 'Plateforme e-commerce complète développée avec React, Node.js, MongoDB et Stripe. Fonctionnalités: gestion des produits, panier, paiements sécurisés, dashboard admin.'
          });

          // Skills
          fillFirstEntry('skills', {
            'skill_category[]': 'Langages de programmation',
            'skill_items[]': 'JavaScript, TypeScript, Python, Java, PHP, SQL'
          });

          // Languages
          fillFirstEntry('languages', {
            'language_name[]': 'Français',
            'language_level[]': 'Native'
          });

          // Certificates
          fillFirstEntry('certificates', {
            'certificate_name[]': 'AWS Certified Developer',
            'certificate_date[]': 'Mars 2023',
            'certificate_issuer[]': 'Amazon Web Services',
            'certificate_location[]': 'En ligne',
            'certificate_description[]': 'Certification professionnelle en développement d\'applications sur AWS'
          });

          // Trigger preview update if the function exists
          if (typeof triggerPreviewUpdate === 'function') {
            triggerPreviewUpdate();
          }

          console.log('✅ Test data filled successfully!');
          alert('Formulaire rempli avec des données de test !');
        } catch (error) {
          console.error('❌ Error filling test data:', error);
          alert('Erreur lors du remplissage des données de test: ' + error.message);
        }
      }

      // Function to reset button after file download
      function resetButtonAfterDownload(button, originalText) {
        // Method 1: Timer-based reset (fallback)
        const resetTimer = setTimeout(() => {
          console.log('🔄 Resetting button after timeout');
          button.innerHTML = originalText;
          button.disabled = false;
        }, 5000); // Reset after 5 seconds
        
        // Method 2: Focus-based reset (when user returns to page after saving)
        let focusResetDone = false;
        const resetOnFocus = () => {
          if (!focusResetDone) {
            console.log('🔄 Resetting button after window focus');
            clearTimeout(resetTimer);
            button.innerHTML = originalText;
            button.disabled = false;
            focusResetDone = true;
            window.removeEventListener('focus', resetOnFocus);
          }
        };
        
        // Listen for window focus (when user comes back after saving file)
        setTimeout(() => {
          window.addEventListener('focus', resetOnFocus);
        }, 1000); // Small delay to avoid immediate focus detection
        
        // Method 3: Detection via document visibility change
        const handleVisibilityChange = () => {
          if (!document.hidden && !focusResetDone) {
            console.log('🔄 Resetting button after visibility change');
            clearTimeout(resetTimer);
            button.innerHTML = originalText;
            button.disabled = false;
            focusResetDone = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', resetOnFocus);
          }
        };
        
        setTimeout(() => {
          document.addEventListener('visibilitychange', handleVisibilityChange);
        }, 1000);
      }

      // ============ LIVE PREVIEW FUNCTIONALITY (OVERLEAF-STYLE) ============
      
      let previewUpdateTimeout;
      let isPreviewUpdating = false;
      
      function initializeLivePreview() {
        // Add event listeners to all form inputs
        const form = document.getElementById('cvForm');
        
        // Real-time input listening (faster response like Overleaf)
        form.addEventListener('input', handleRealTimeInput);
        form.addEventListener('change', handleFormChange);
        form.addEventListener('paste', handleFormChange);
        form.addEventListener('keyup', handleRealTimeInput);
        
        // Listen for dynamic content changes (when adding/removing sections)
        const observer = new MutationObserver((mutations) => {
          let shouldUpdate = false;
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && 
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
              shouldUpdate = true;
            }
          });
          if (shouldUpdate) {
            schedulePreviewUpdate(100);
          }
        });
        
        observer.observe(form, {
          childList: true,
          subtree: true,
          attributes: false
        });
        
        // Initialize preview if form has data
        if (previewVisible) {
          updatePreview();
        }
      }
      
      function handleRealTimeInput(e) {
        // Add typing indicator
        const formGroup = e.target.closest('.form-group');
        if (formGroup) {
          formGroup.classList.add('typing');
          setTimeout(() => {
            formGroup.classList.remove('typing');
          }, 1000);
        }
        
        // Detect which section is being edited and highlight it
        const editingSection = detectEditingSection(e.target);
        if (editingSection) {
          setTimeout(() => {
            highlightPreviewSection(editingSection);
          }, 500); // Delay to allow preview update first
        }
        
        // Immediate update for short text inputs
        if (e.target.type === 'text' || e.target.type === 'email' || e.target.type === 'tel') {
          schedulePreviewUpdate(150); // Very fast like Overleaf
        } else {
          schedulePreviewUpdate(300);
        }
      }
      
      function handleFormChange(e) {
        // Immediate update for dropdowns, checkboxes, etc.
        schedulePreviewUpdate(50);
      }
      
      function schedulePreviewUpdate(delay = 200) {
        if (!previewVisible) return;
        
        // Show that preview is out of sync (removed preview status indicator)
        
        clearTimeout(previewUpdateTimeout);
        previewUpdateTimeout = setTimeout(() => {
          updatePreviewWithIndicator();
        }, delay);
      }
      
      async function updatePreviewWithIndicator() {
        if (isPreviewUpdating) return;
        
        isPreviewUpdating = true;
        const previewContainer = document.querySelector('.preview-container');
        const cvPreview = document.querySelector('.cv-preview');
        
        // Show updating indicator
        previewContainer.classList.add('updating');
        cvPreview.classList.add('updating');
        
        try {
          // Wait for the async PDF generation
          await updatePreview();
          
        } catch (error) {
          console.error('Preview update failed:', error);
        }
        
        // Remove updating classes
        previewContainer.classList.remove('updating');
        cvPreview.classList.remove('updating');
        
        // Reset status after delay
        setTimeout(() => {
          isPreviewUpdating = false;
        }, 800);
      }

      function togglePreview() {
        const previewSection = document.getElementById('previewSection');
        const toggleBtn = document.getElementById('previewToggleBtn');
        
        previewVisible = !previewVisible;
        
        if (previewVisible) {
          previewSection.style.display = 'block';
          toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Masquer';
          toggleBtn.style.background = '#dc3545';
          
          // Initialize live preview immediately
          initializeLivePreview();
          
          // Immediate first update with indicator
          updatePreviewWithIndicator();
          
          // Auto-scroll to show preview
          setTimeout(() => {
            previewSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
          
        } else {
          previewSection.style.display = 'none';
          toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Aperçu';
          toggleBtn.style.background = '#28a745';
          
          // Clear any pending updates
          clearTimeout(previewUpdateTimeout);
          isPreviewUpdating = false;
        }
      }

      async function updatePreview() {
        if (!previewVisible) return;
        
        const previewContainer = document.getElementById('cvPreview');
        if (!previewContainer) return;
        
        try {
          // Get form data
          const formData = new FormData(document.getElementById('cvForm'));
          
          // Convert FormData to JSON object for API call
          const jsonData = {};
          
          // Convert arrays properly
          const arrayFields = [
            'education_degree', 'education_dates', 'education_university', 'education_field', 'education_details',
            'experience_location', 'experience_dates', 'experience_company', 'experience_position', 'experience_description',
            'project_name', 'project_link', 'project_description',
            'skill_category', 'skill_items',
            'language_name', 'language_level',
            'certificate_name', 'certificate_date', 'certificate_issuer', 'certificate_location', 'certificate_description'
          ];
          
          // Initialize arrays
          arrayFields.forEach(field => {
            jsonData[field] = [];
          });
          
          // Process form data
          for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
              const fieldName = key.replace('[]', '');
              if (!jsonData[fieldName]) {
                jsonData[fieldName] = [];
              }
              jsonData[fieldName].push(value);
            } else {
              jsonData[key] = value;
            }
          }
          
          // Handle photo preview if available
          const photoPreview = document.getElementById('photo-preview');
          if (photoPreview && photoPreview.classList.contains('has-image')) {
            const img = photoPreview.querySelector('img');
            if (img && img.src) {
              jsonData['photo_preview_src'] = img.src;
            }
          }
          
          // Show loading state
          previewContainer.innerHTML = `
            <div class="preview-loading">
              <div class="loading-spinner"></div>
              <p>Compilation du PDF en cours...</p>
            </div>
          `;
          
          // Make API call to generate PDF preview (using actual MVC endpoint)
          const response = await fetch('generate_live_preview_mvc.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
          });
          
          // Check if response is OK and contains JSON
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const responseText = await response.text();
          // console.log('🔍 Raw response from server:', responseText); // Removed for cleaner console
          
          // Try to parse JSON, catch any errors
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            // console.error('📄 Raw response that failed to parse:', responseText); // Removed for cleaner console
            throw new Error(`Server returned invalid JSON. Check server logs for details.`);
          }
          
          if (result.success && result.pdf_base64) {
            // Display PDF using embedded PDF viewer
            const pdfDataUri = `data:application/pdf;base64,${result.pdf_base64}`;
            previewContainer.innerHTML = `
              <div class="pdf-preview-container">
                <embed src="${pdfDataUri}" type="application/pdf" width="100%" height="800px" />
              </div>
            `;
          } else {
            // Show error with fallback to HTML preview
            console.error('PDF generation failed:', result.error);
            console.log('LaTeX output:', result.latex_output);
            previewContainer.innerHTML = `
              <div class="preview-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur de compilation PDF</p>
                <small>Aperçu HTML affiché à la place</small>
                <details style="margin-top: 10px;">
                  <summary>Détails de l'erreur</summary>
                  <pre style="font-size: 10px; max-height: 200px; overflow: auto;">${result.error || 'Erreur inconnue'}</pre>
                </details>
              </div>
            `;
            
            // Fallback to HTML preview after brief delay
            setTimeout(() => {
              const previewHTML = generatePreviewHTML(formData);
              previewContainer.innerHTML = previewHTML;
              updatePreviewColors();
            }, 2000);
          }
          
        } catch (error) {
          console.error('Preview update error:', error);
          
          // Fallback to HTML preview on network error
          const formData = new FormData(document.getElementById('cvForm'));
          const previewHTML = generatePreviewHTML(formData);
          previewContainer.innerHTML = `
            <div class="preview-error">
              <i class="fas fa-wifi"></i>
              <p>Erreur réseau</p>
              <small>Aperçu HTML affiché à la place</small>
            </div>
            <hr>
            ${previewHTML}
          `;
          updatePreviewColors();
        }
      }

      function generatePreviewHTML(formData) {
        const nom = formData.get('nom') || '[Nom]';
        const prenom = formData.get('prenom') || '[Prénom]';
        const location = formData.get('location') || '[Localisation]';
        const email = formData.get('email') || '[Email]';
        const telephone = formData.get('telephone') || '[Téléphone]';
        const website = formData.get('website');
        const linkedin = formData.get('linkedin');
        const github = formData.get('github');
        const profil = formData.get('profil_description') || '';
        
        // Check if we have any data to show
        const hasBasicData = nom !== '[Nom]' || prenom !== '[Prénom]' || location !== '[Localisation]' || 
                            email !== '[Email]' || telephone !== '[Téléphone]' || profil;
        
        if (!hasBasicData) {
          return `
            <div class="preview-placeholder">
              <i class="fas fa-file-alt"></i>
              <p>Commencez à remplir le formulaire pour voir l'aperçu de votre CV</p>
            </div>
          `;
        }
        
        // Get photo if uploaded
        const photoPreview = document.getElementById('photo-preview');
        const hasPhoto = photoPreview && photoPreview.classList.contains('has-image');
        let photoSrc = '';
        if (hasPhoto) {
          const img = photoPreview.querySelector('img');
          if (img) {
            photoSrc = img.src;
          }
        }
        
        let html = `
          <div class="preview-header-section">
            ${hasPhoto ? `
            <div class="preview-photo">
              <img src="${photoSrc}" alt="Photo de profil" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-right: 20px; margin-bottom: 10px;" />
            </div>
            ` : ''}
            <div class="preview-info">
              <div class="preview-name">${prenom} ${nom}</div>
              <div class="preview-contact">
                <div>${location}</div>
                <div>${email} • ${telephone}</div>
                ${website ? `<div><a href="${website}" style="color: #667eea;">Site web: ${website}</a></div>` : ''}
                ${linkedin ? `<div><a href="${linkedin}" style="color: #667eea;">LinkedIn: ${linkedin}</a></div>` : ''}
                ${github ? `<div><a href="${github}" style="color: #667eea;">GitHub: ${github}</a></div>` : ''}
              </div>
            </div>
          </div>
        `;
        
        // Profile section
        if (profil) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Profil</h3>
              <div>${profil}</div>
            </div>
          `;
        }
        
        // Education section
        const educationHTML = generateEducationPreview(formData);
        if (educationHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Formation</h3>
              ${educationHTML}
            </div>
          `;
        }
        
        // Certificates section
        const certificatesHTML = generateCertificatesPreview(formData);
        if (certificatesHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Certificats</h3>
              ${certificatesHTML}
            </div>
          `;
        }
        
        // Experience section
        const experienceHTML = generateExperiencePreview(formData);
        if (experienceHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Expérience</h3>
              ${experienceHTML}
            </div>
          `;
        }
        
        // Projects section
        const projectsHTML = generateProjectsPreview(formData);
        if (projectsHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Projets</h3>
              ${projectsHTML}
            </div>
          `;
        }
        
        // Skills section
        const skillsHTML = generateSkillsPreview(formData);
        if (skillsHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Compétences</h3>
              ${skillsHTML}
            </div>
          `;
        }
        
        // Languages section
        const languagesHTML = generateLanguagesPreview(formData);
        if (languagesHTML) {
          html += `
            <div class="preview-section">
              <h3 style="color: #667eea; border-bottom: 2px solid #667eea;">Langues</h3>
              ${languagesHTML}
            </div>
          `;
        }
        
        return html;
      }

      function generateEducationPreview(formData) {
        const degrees = formData.getAll('education_degree[]');
        const dates = formData.getAll('education_dates[]');
        const universities = formData.getAll('education_university[]');
        const fields = formData.getAll('education_field[]');
        const details = formData.getAll('education_details[]');
        
        let html = '';
        
        for (let i = 0; i < degrees.length; i++) {
          if (degrees[i] || dates[i] || universities[i]) {
            html += `
              <div class="preview-entry">
                <div class="preview-entry-header">
                  <span><strong>${degrees[i] || '[Diplôme]'}</strong></span>
                  <span>${dates[i] || '[Dates]'}</span>
                </div>
                ${universities[i] || fields[i] ? `
                  <div class="preview-entry-details">
                    ${universities[i] || '[Université]'}${fields[i] ? ' • ' + fields[i] : ''}
                  </div>
                ` : ''}
                ${details[i] ? `<div class="preview-description">${details[i]}</div>` : ''}
              </div>
            `;
          }
        }
        
        return html;
      }

      function generateCertificatesPreview(formData) {
        const names = formData.getAll('certificate_name[]');
        const dates = formData.getAll('certificate_date[]');
        const issuers = formData.getAll('certificate_issuer[]');
        const locations = formData.getAll('certificate_location[]');
        const descriptions = formData.getAll('certificate_description[]');
        
        let html = '';
        
        for (let i = 0; i < names.length; i++) {
          if (names[i]) {
            html += `
              <div class="preview-entry">
                <div class="preview-entry-header">
                  <span><strong>${names[i]}</strong></span>
                  <span>${dates[i] || '[Date]'}</span>
                </div>
                ${issuers[i] || locations[i] ? `
                  <div class="preview-entry-details">
                    ${issuers[i] || '[Organisme]'}${locations[i] ? ' • ' + locations[i] : ''}
                  </div>
                ` : ''}
                ${descriptions[i] ? `<div class="preview-description">${descriptions[i]}</div>` : ''}
              </div>
            `;
          }
        }
        
        return html;
      }

      function generateExperiencePreview(formData) {
        const locations = formData.getAll('experience_location[]');
        const dates = formData.getAll('experience_dates[]');
        const companies = formData.getAll('experience_company[]');
        const positions = formData.getAll('experience_position[]');
        const descriptions = formData.getAll('experience_description[]');
        
        let html = '';
        
        for (let i = 0; i < locations.length; i++) {
          if (locations[i] || companies[i] || positions[i]) {
            html += `
              <div class="preview-entry">
                <div class="preview-entry-header">
                  <span><strong>${locations[i] || '[Lieu]'}</strong></span>
                  <span>${dates[i] || '[Dates]'}</span>
                </div>
                ${companies[i] || positions[i] ? `
                  <div class="preview-entry-details">
                    ${companies[i] || '[Entreprise]'}${positions[i] ? ' • ' + positions[i] : ''}
                  </div>
                ` : ''}
                ${descriptions[i] ? `
                  <div class="preview-description">
                    <ul>
                      ${descriptions[i].split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `;
          }
        }
        
        return html;
      }

      function generateProjectsPreview(formData) {
        const names = formData.getAll('project_name[]');
        const links = formData.getAll('project_link[]');
        const descriptions = formData.getAll('project_description[]');
        
        let html = '';
        
        for (let i = 0; i < names.length; i++) {
          if (names[i]) {
            html += `
              <div class="preview-entry">
                <div class="preview-entry-header">
                  <span><strong>${names[i]}</strong></span>
                </div>
                ${descriptions[i] ? `<div class="preview-description">${descriptions[i]}</div>` : ''}
                ${links[i] ? `<div class="preview-description"><em>Lien: ${links[i]}</em></div>` : ''}
              </div>
            `;
          }
        }
        
        return html;
      }

      function generateSkillsPreview(formData) {
        const categories = formData.getAll('skill_category[]');
        const items = formData.getAll('skill_items[]');
        
        let html = '';
        
        for (let i = 0; i < categories.length; i++) {
          if (categories[i] && items[i]) {
            html += `
              <div class="preview-entry">
                <div class="preview-skills-grid">
                  <strong>${categories[i]}:</strong> ${items[i]}
                </div>
              </div>
            `;
          }
        }
        
        return html;
      }

      function generateLanguagesPreview(formData) {
        const names = formData.getAll('language_name[]');
        const levels = formData.getAll('language_level[]');
        
        let html = '';
        const languageEntries = [];
        
        for (let i = 0; i < names.length; i++) {
          if (names[i] && levels[i]) {
            languageEntries.push(`<strong>${names[i]}:</strong> ${levels[i]}`);
          }
        }
        
        if (languageEntries.length > 0) {
          html = `
            <div class="preview-entry">
              <div class="preview-languages-list">
                ${languageEntries.join(' • ')}
              </div>
            </div>
          `;
        }
        
        return html;
      }

      // Debounce function to limit update frequency
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

      // Update existing functions to trigger preview updates
      const originalAddFunctions = {
        addEducation: typeof addEducation !== 'undefined' ? addEducation : null,
        addCertificate: typeof addCertificate !== 'undefined' ? addCertificate : null,
        addExperience: typeof addExperience !== 'undefined' ? addExperience : null,
        addProject: typeof addProject !== 'undefined' ? addProject : null,
        addSkill: typeof addSkill !== 'undefined' ? addSkill : null,
        addLanguage: typeof addLanguage !== 'undefined' ? addLanguage : null
      };

      // Update existing functions to trigger preview updates
      function triggerPreviewUpdate() {
        schedulePreviewUpdate(100);
      }

      // ============ END LIVE PREVIEW FUNCTIONALITY ============

      // ============ KEYBOARD SHORTCUTS (OVERLEAF-STYLE) ============
      
      function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
          // Ctrl/Cmd + P to toggle preview (like Overleaf)
          if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            togglePreview();
          }
          
          // Ctrl/Cmd + Enter to compile/update preview
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (previewVisible) {
              updatePreviewWithIndicator();
            }
          }
          
          // Escape to close preview
          if (e.key === 'Escape' && previewVisible) {
            togglePreview();
          }
        });
      }
      
      // ============ AUTO-SAVE FUNCTIONALITY ============
      
      let autoSaveTimeout;
      
      function scheduleAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
          if (typeof autoSaveForm === 'function') {
            autoSaveForm();
          }
        }, 5000); // Auto-save every 5 seconds of inactivity
      }
      
      function initializeAutoSave() {
        const form = document.getElementById('cvForm');
        form.addEventListener('input', scheduleAutoSave);
        form.addEventListener('change', scheduleAutoSave);
      }
      
      // ============ ENHANCED FORM INITIALIZATION ============
      
      function initializeEnhancedFeatures() {
        initializeKeyboardShortcuts();
        initializeAutoSave();
        initializeColorPicker();
        
        // Show keyboard shortcuts hint
        const previewBtn = document.getElementById('previewToggleBtn');
        if (previewBtn) {
          previewBtn.title = 'Aperçu en temps réel (Ctrl+P)';
        }
      }
      
      // Initialize all enhanced features when DOM is ready
      document.addEventListener('DOMContentLoaded', function() {
        // ...existing code...
        initializeEnhancedFeatures();
      });
      
      // Initialize the form
      showStep(1);

      // ============ COLOR CUSTOMIZATION FUNCTIONALITY ============
      
      function initializeColorPicker() {
        const externalColorPicker = document.getElementById('primary_color_external');
        const hiddenColorInput = document.getElementById('primary_color');
        const colorPresets = document.querySelectorAll('.color-preset');
        
        // Set initial color
        updateColorPreview(externalColorPicker.value);
        
        // External color picker change event
        externalColorPicker.addEventListener('change', function() {
          const color = this.value;
          hiddenColorInput.value = color; // Sync with hidden form field
          updateColorPreview(color);
          updatePresetSelection(color);
          schedulePreviewUpdate(100);
        });
        
        externalColorPicker.addEventListener('input', function() {
          const color = this.value;
          hiddenColorInput.value = color; // Sync with hidden form field
          updateColorPreview(color);
          updatePresetSelection(color);
          schedulePreviewUpdate(50); // Faster for real-time dragging
        });
        
        // Color preset click events
        colorPresets.forEach(preset => {
          preset.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            externalColorPicker.value = color;
            hiddenColorInput.value = color; // Sync with hidden form field
            updateColorPreview(color);
            updatePresetSelection(color);
            schedulePreviewUpdate(100);
          });
        });
        
        // Initialize preset selection
        updatePresetSelection(externalColorPicker.value);
      }
      
      function updateColorPreview(color) {
        // Color preview has been removed - this function is kept for compatibility
        // The live preview will show the color changes in real-time
      }
      
      function updatePresetSelection(selectedColor) {
        const colorPresets = document.querySelectorAll('.color-preset');
        colorPresets.forEach(preset => {
          if (preset.getAttribute('data-color') === selectedColor) {
            preset.classList.add('selected');
          } else {
            preset.classList.remove('selected');
          }
        });
      }
      
      function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }
      
      function darkenColor(hex, percent) {
        const rgb = hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = (100 - percent) / 100;
        const r = Math.round(rgb.r * factor);
        const g = Math.round(rgb.g * factor);
        const b = Math.round(rgb.b * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      // Update the real-time preview to use selected color (ONLY CV PREVIEW)
      function updatePreviewColors() {
        const selectedColor = document.getElementById('primary_color_external')?.value || 
                             document.getElementById('primary_color')?.value || '#667eea';
        const previewContainer = document.querySelector('.cv-preview');
        
        if (previewContainer) {
          // Update ONLY the CV preview content, not UI elements
          const previewName = previewContainer.querySelector('.preview-name');
          if (previewName) {
            previewName.style.color = selectedColor;
          }
          
          // Update section headers in CV preview only
          const sectionHeaders = previewContainer.querySelectorAll('.preview-section h3');
          sectionHeaders.forEach(header => {
            header.style.color = selectedColor;
            header.style.borderBottomColor = selectedColor;
          });
          
          // Update contact info icons/links in CV preview
          const contactLinks = previewContainer.querySelectorAll('.preview-contact a, .preview-contact span[style*="color"]');
          contactLinks.forEach(link => {
            link.style.color = selectedColor;
          });
          
          // Update any accent elements in CV preview
          const accentElements = previewContainer.querySelectorAll('.preview-accent, .preview-highlight');
          accentElements.forEach(element => {
            element.style.color = selectedColor;
            element.style.borderColor = selectedColor;
          });
        }
      }

      // Initialize color picker on DOMContentLoaded
      document.addEventListener('DOMContentLoaded', function() {
        initializeColorPicker();
      });

      // ============ FORM SUBMISSION HANDLER ============
      
      async function handleFormSubmissionDirectly() {
        console.log('🚀 Custom form submission handler called');
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération en cours...';
        
        try {
          // Check if we're in guest mode
          const urlParams = new URLSearchParams(window.location.search);
          const isGuestMode = urlParams.get('mode') === 'guest';
          
          // Check session first (only redirect if not in guest mode)
          const sessionValid = await checkSessionStatus(isGuestMode);
          if (!sessionValid && !isGuestMode) {
            return; // checkSessionStatus will handle redirect
          }
          
          // Get form data
          const form = document.getElementById('cvForm');
          const formData = new FormData(form);
          
          // Add guest mode indicator if applicable
          if (isGuestMode) {
            formData.append('guest_mode', 'true');
          }
          
          // Check for custom CV name from session storage (if coming from user_home.html)
          const customCVName = sessionStorage.getItem('newCVName');
          if (customCVName) {
            formData.append('custom_cv_name', customCVName);
            console.log('📝 Using custom CV name:', customCVName);
            // Clear it after use
            sessionStorage.removeItem('newCVName');
          }
          
          // Add additional data
          const editingCvId = document.getElementById('editing_cv_id')?.value;
          if (editingCvId) {
            formData.append('editing_cv_id', editingCvId);
          }
          
          console.log('📤 Sending form data...');
          
          // Debug: Log the selected format
          const selectedFormat = document.querySelector('input[name="format"]:checked')?.value || 'pdf';
          console.log('🎯 Selected download format:', selectedFormat);
          
          // Make the API call with proper headers
          const response = await fetch('generate_cv_mvc.php', {
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
          console.log('📥 Server response:', result);
          
          if (result.success === true || result.status === 'success') {
            console.log('✅ CV generated successfully!');
            
            // Update button to show success
            submitBtn.innerHTML = '<i class="fas fa-check"></i> CV généré avec succès!';
            submitBtn.style.background = '#28a745';
            
            // Trigger download immediately without notification
            if (result.download_url) {
              window.location.href = result.download_url;
            } else if (result.pdf_path) {
              window.location.href = result.pdf_path;
            } else if (result.cv_id) {
              // Fallback: construct download URL from CV ID with correct parameters
              // Get the selected format from the form
              const selectedFormat = document.querySelector('input[name="format"]:checked')?.value || 'pdf';
              window.location.href = 'download_cv_mvc.php?id=' + result.cv_id + '&format=' + selectedFormat;
            }
            
            // Reset button after download
            resetButtonAfterDownload(submitBtn, originalText);
            
          } else {
            console.error('❌ Server error:', result.message);
            alert('Erreur: ' + (result.message || 'Erreur inconnue lors de la génération du CV'));
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
          }
          
        } catch (error) {
          console.error('❌ Form submission error:', error);
          alert('Erreur lors de la génération du CV: ' + error.message);
          
          // Reset button
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }
      }
      
      // ============ END FORM SUBMISSION HANDLER ============
