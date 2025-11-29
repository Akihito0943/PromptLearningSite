// PromptQuest - Frontend JavaScript

// Challenge submission handler
async function submitPrompt(challengeId) {
  const promptInput = document.getElementById('prompt-input');
  const submitBtn = document.getElementById('submit-btn');
  const resultBox = document.getElementById('result-box');
  
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    alert(window.translations?.challenge_detail?.prompt_placeholder || 'Please enter a prompt');
    return;
  }
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> ${window.translations?.challenge_detail?.submitting || 'Evaluating...'}`;
  
  try {
    const response = await fetch('/api/submit-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        challengeId: parseInt(challengeId),
        prompt: prompt
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Evaluation failed');
    }
    
    const result = await response.json();
    
    // Display result
    displayResult(result);
    
    // Scroll to result
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
  } catch (error) {
    console.error('Error submitting prompt:', error);
    alert(`Error: ${error.message}`);
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = window.translations?.challenge_detail?.submit || 'Submit';
  }
}

function displayResult(result) {
  const resultBox = document.getElementById('result-box');
  const t = window.translations?.challenge_detail || {};
  
  resultBox.classList.remove('hidden');
  
  resultBox.innerHTML = `
    <h2 class="section-title">${t.result_title || 'Evaluation Result'}</h2>
    <div class="result-score">${result.score}/100</div>
    <div class="text-center mb-3">
      <span class="badge badge-xp" style="font-size: 1.1rem; padding: 0.5rem 1rem;">
        +${result.xp} XP
      </span>
    </div>
    
    <div class="result-section">
      <h3>${t.feedback || 'Feedback'}</h3>
      <p>${result.feedback}</p>
    </div>
    
    ${result.strengths && result.strengths.length > 0 ? `
      <div class="result-section">
        <h3>${t.strengths || 'Strengths'}</h3>
        <ul class="result-list">
          ${result.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${result.improvements && result.improvements.length > 0 ? `
      <div class="result-section">
        <h3>${t.improvements || 'Improvements'}</h3>
        <ul class="result-list">
          ${result.improvements.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div class="text-center mt-4">
      <button class="btn btn-secondary" onclick="tryAgain()">${t.try_again || 'Try Again'}</button>
    </div>
  `;
}

function tryAgain() {
  const resultBox = document.getElementById('result-box');
  resultBox.classList.add('hidden');
  document.getElementById('prompt-input').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Language switcher
function switchLanguage(lang) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('lang', lang);
  window.location.href = currentUrl.toString();
}

// Add enter key handler for prompt input (Ctrl+Enter to submit)
document.addEventListener('DOMContentLoaded', function() {
  const promptInput = document.getElementById('prompt-input');
  if (promptInput) {
    promptInput.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') {
        const challengeId = this.dataset.challengeId;
        if (challengeId) {
          submitPrompt(challengeId);
        }
      }
    });
  }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
