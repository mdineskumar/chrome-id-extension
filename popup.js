document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('device-id');
  const errorDisplay = document.getElementById('error-message');
  const macAddressText = document.getElementById('mac-address-text');
  const barcodeDisplay = document.getElementById('barcode-container');
  const barcodeCanvas = document.getElementById('barcode-canvas');
  const copyMacButton = document.getElementById('copy-mac-btn');

  // --- CONFIGURATION ---
  const FLASK_SERVER_URL = "http://127.0.0.1:5000/get-device-info";
  // Set to null to use real ChromeOS API
  // const fakeId = "dd9a4d51-0051-4d8b-8d4c-6aaeb642e041"; 
  const fakeId = null; 
  // 1. Initial Logic to get Device ID
  if (fakeId) {
    display.textContent = fakeId;
    fetchMacDetails(fakeId);
  } else if (chrome.enterprise && chrome.enterprise.deviceAttributes) {
    chrome.enterprise.deviceAttributes.getDirectoryDeviceId((id) => {
      if (chrome.runtime.lastError) {
        showError("API Error: " + chrome.runtime.lastError.message);
      } else if (id) {
        display.textContent = id;
        fetchMacDetails(id);
      } else {
        showError("Device is not managed or policy is missing.");
      }
    });
  } else {
    display.textContent = "Unsupported";
    showError("This API is only available on managed ChromeOS devices.");
  }

  // 2. Fetch MAC from Flask Server
  async function fetchMacDetails(deviceId) {
    macAddressText.textContent = "Fetching from server...";
    
    try {
      const response = await fetch(`${FLASK_SERVER_URL}?deviceId=${deviceId}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.bluetoothMac && data.bluetoothMac !== 'N/A') {
        macAddressText.textContent = data.bluetoothMac;
        generateBarcode(data.bluetoothMac);
      } else {
        macAddressText.textContent = "MAC Not Found";
        showError("Bluetooth MAC address is not available for this device in Google Admin.");
      }
    } catch (err) {
      showError("Fetch Error: " + err.message);
      macAddressText.textContent = "Error";
    }
  }

  // 3. Barcode Generation (bwip-js)
  function generateBarcode(macAddress) {
    barcodeDisplay.style.display = 'block';
    copyMacButton.style.display = 'inline-block';

    // Remove colons/hyphens for the barcode data
    const sanitizedMac = macAddress.replace(/[:-]/g, '');
    const barcodeValue = `^FNC3PH11A${sanitizedMac}`;

    try {
      bwipjs.toCanvas(barcodeCanvas, {
        bcid: 'code128',
        text: barcodeValue,
        scaleX: 2,
        scaleY: 2,
        height: 15,
        includetext: false,
        alttext: macAddress,
        parsefnc: true, // Required for ^FNC3
      }, function (err) {
        if (err) {
          console.error(err);
          showError("Barcode gen failed: " + err.message);
        }
      });
    } catch (e) {
      showError("Fatal barcode error.");
    }
  }

  // 4. Copy to Clipboard Utility
  copyMacButton.addEventListener('click', () => {
    const text = macAddressText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyMacButton.textContent;
      copyMacButton.textContent = "Copied!";
      setTimeout(() => { copyMacButton.textContent = originalText; }, 2000);
    });
  });

  function showError(msg) {
    errorDisplay.textContent = msg;
  }
});