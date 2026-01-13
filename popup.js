document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('device-id');
  const errorDisplay = document.getElementById('error-message');

  // Uncomment the line below to test the UI with a sample ID
  const fakeId = "f43e0315-7734-4b45-9736-19e612345678";
  
  if (fakeId) {
      display.textContent = fakeId;
      return; // Stop the script here so we don't call the real API
  }
  // ------------------------------------------------

  //Check if the API exists (only exists on ChromeOS)
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