document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('device-id');
  const errorDisplay = document.getElementById('error-message');

  // Check if the API exists (only exists on ChromeOS)
  if (chrome.enterprise && chrome.enterprise.deviceAttributes) {
    
    chrome.enterprise.deviceAttributes.getDirectoryDeviceId((id) => {
      if (chrome.runtime.lastError) {
        display.textContent = "Error";
        errorDisplay.textContent = chrome.runtime.lastError.message;
      } else if (id) {
        display.textContent = id;
      } else {
        display.textContent = "Empty";
        errorDisplay.textContent = "Device is not managed or policy is missing.";
      }
    });

  } else {
    display.textContent = "Unsupported";
    errorDisplay.textContent = "This API is only available on managed ChromeOS devices.";
  }
});