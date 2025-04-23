// Font data and configuration
const availableFonts = [
  {
    name: 'Allust',
    family: 'Allust',
    styles: ['regular'],
    features: ['liga', 'dlig', 'calt', 'smcp', 'swsh', 'tnum', 'onum', 'pnum', 'frac', 'zero'],
    stylisticSets: [1, 2], // ss01, ss02
    buyUrl: 'https://gumroad.com/l/allust'
  },
  {
    name: 'Monologue',
    family: 'Monologue',
    styles: ['regular'],
    features: ['liga', 'dlig', 'calt', 'smcp', 'tnum', 'onum', 'pnum', 'frac', 'zero'],
    stylisticSets: [1, 2, 3], // ss01, ss02, ss03
    buyUrl: 'https://gumroad.com/l/monologue'
  },
  {
    name: 'Monologue Rounded',
    family: 'Monologue Rounded',
    styles: ['regular'],
    features: ['liga', 'dlig', 'calt', 'smcp', 'tnum', 'onum', 'pnum', 'frac', 'zero'],
    stylisticSets: [1, 2, 3], // ss01, ss02, ss03
    buyUrl: 'https://gumroad.com/l/monologue-rounded'
  }
];

// Fallback font links if JSON loading fails
let fontLinks = {
  "Allust": "https://gumroad.com/l/allust",
  "Monologue": "https://gumroad.com/l/monologue",
  "Monologue Rounded": "https://gumroad.com/l/monologue-rounded"
};

// Try to load the font links data, but we have a fallback
try {
  fetch('fontLinks.json')
    .then(response => response.json())
    .then(data => {
      fontLinks = data;
      updateBuyButton();
    })
    .catch(error => {
      console.error('Error loading font links JSON, using defaults:', error);
      updateBuyButton();
    });
} catch (error) {
  console.error('Error in fetch operation, using default font links:', error);
  updateBuyButton();
}

// Create an empty stylistic sets object
const initialStylisticSets = {};
// Initialize all 20 possible stylistic sets to false
for (let i = 1; i <= 20; i++) {
  initialStylisticSets[i] = false;
}

// State
const state = {
  fontName: 'Allust',
  fontStyle: 'regular',
  fontSize: window.innerWidth < 768 ? 24 : 72,
  lineHeight: 1.5,
  tracking: 0,
  alignment: 'center',
  textColor: '#000000',
  backgroundColor: '#FFFFFF',
  sampleText: 'pangram',
  openTypeFeatures: {
    ligatures: true,
    contextual: false,
    discretionaryLigatures: false,
    stylisticAlternates: false,
    stylisticSets: initialStylisticSets, // Initialize with all sets disabled
    smallCaps: false,
    swash: false,
    numeralStyle: 'normal',
    fractions: false,
    slashedZero: false
  },
  openTypeOpen: false
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const fontNameSelect = document.getElementById('fontName');
const fontStyleSelect = document.getElementById('fontStyle');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const lineHeightSlider = document.getElementById('lineHeight');
const lineHeightValue = document.getElementById('lineHeightValue');
const trackingSlider = document.getElementById('tracking');
const trackingValue = document.getElementById('trackingValue');
const alignButtons = document.querySelectorAll('[data-align]');
const colorOptions = document.querySelectorAll('.color-option');
const bgColorOptions = document.querySelectorAll('.bg-color-option');
const sampleTextSelect = document.getElementById('sampleText');
const openTypeToggle = document.getElementById('openTypeToggle');
const openTypeContent = document.getElementById('openTypeContent');
const chevronIcon = document.getElementById('chevronIcon');
const textFeatures = document.getElementById('textFeatures');
const numeralStyles = document.getElementById('numeralStyles');
const specialFeatures = document.getElementById('specialFeatures');
const displayContent = document.getElementById('displayContent');
const buyButton = document.getElementById('buyButton');
const featureCount = document.querySelector('.feature-count');

// Initialize the application
function init() {
  populateFontSelect();
  populateStyleSelect();
  setupEventListeners();
  updateSampleText();
  updateDisplayContent();
  updateFeatureCount();
}

// Populate the font select dropdown
function populateFontSelect() {
  fontNameSelect.innerHTML = '';
  availableFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.name;
    option.textContent = font.name;
    fontNameSelect.appendChild(option);
  });
  fontNameSelect.value = state.fontName;
}

// Populate the font style select dropdown
function populateStyleSelect() {
  fontStyleSelect.innerHTML = '';
  const styles = getAvailableStyles(state.fontName);
  styles.forEach(style => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
    fontStyleSelect.appendChild(option);
  });
  fontStyleSelect.value = state.fontStyle;
}

// Get available styles for a font
function getAvailableStyles(fontName) {
  const font = availableFonts.find(f => f.name === fontName);
  return font ? font.styles : ['regular'];
}

// Get available features for a font
function getAvailableFeatures(fontName) {
  const font = availableFonts.find(f => f.name === fontName);
  return font ? font.features : [];
}

// Get buy URL for a font
function getBuyUrl(fontName) {
  // Try to get from fontLinks first
  if (fontLinks[fontName]) {
    return fontLinks[fontName];
  }
  
  // Fall back to the availableFonts array
  const font = availableFonts.find(f => f.name === fontName);
  return font && font.buyUrl ? font.buyUrl : '#';
}

// Get available stylistic sets for a font
function getAvailableStyleSets(fontName) {
  const font = availableFonts.find(f => f.name === fontName);
  return font ? font.stylisticSets : [];
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar toggle (mobile)
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Font name select
  fontNameSelect.addEventListener('change', (e) => {
    state.fontName = e.target.value;
    
    // Initialize OpenType features based on available features
    initializeOpenTypeFeatures();
    
    // Update related elements
    populateStyleSelect();
    updateFeatures();
    updateBuyButton();
    updateDisplayContent();
  });

  // Font style select
  fontStyleSelect.addEventListener('change', (e) => {
    state.fontStyle = e.target.value;
    updateDisplayContent();
  });

  // Font size slider
  fontSizeSlider.addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = `${state.fontSize}px`;
    updateDisplayContent();
  });

  // Line height slider
  lineHeightSlider.addEventListener('input', (e) => {
    state.lineHeight = parseFloat(e.target.value);
    lineHeightValue.textContent = state.lineHeight.toFixed(1);
    updateDisplayContent();
  });

  // Tracking slider
  trackingSlider.addEventListener('input', (e) => {
    state.tracking = parseFloat(e.target.value);
    trackingValue.textContent = state.tracking.toFixed(2);
    updateDisplayContent();
  });

  // Alignment buttons
  alignButtons.forEach(button => {
    button.addEventListener('click', () => {
      const align = button.getAttribute('data-align');
      state.alignment = align;
      
      // Update active state
      alignButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      updateDisplayContent();
    });
  });

  // Text color options
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.getAttribute('data-color');
      state.textColor = color;
      
      // Update active state
      colorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      updateDisplayContent();
    });
  });

  // Background color options
  bgColorOptions.forEach(option => {
    option.addEventListener('click', () => {
      const color = option.getAttribute('data-color');
      state.backgroundColor = color;
      
      // Update active state
      bgColorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      updateDisplayContent();
    });
  });

  // Sample text select
  sampleTextSelect.addEventListener('change', (e) => {
    state.sampleText = e.target.value;
    updateSampleText();
    updateDisplayContent();
  });

  // OpenType features toggle
  openTypeToggle.addEventListener('click', () => {
    state.openTypeOpen = !state.openTypeOpen;
    openTypeContent.classList.toggle('active', state.openTypeOpen);
    chevronIcon.style.transform = state.openTypeOpen ? 'rotate(180deg)' : '';
  });
}

// Handle feature toggle
function handleFeatureToggle(feature) {
  console.log(`Toggling feature: ${feature}`);
  
  if (feature.startsWith('ss') && feature.length === 4) {
    const setNumber = parseInt(feature.substring(2), 10);
    console.log(`Toggling stylistic set ${setNumber}`);
    
    if (!isNaN(setNumber)) {
      // Make sure the stylisticSets object exists
      if (!state.openTypeFeatures.stylisticSets) {
        state.openTypeFeatures.stylisticSets = {};
      }
      
      // Toggle stylistic set
      const currentValue = !!state.openTypeFeatures.stylisticSets[setNumber];
      state.openTypeFeatures.stylisticSets[setNumber] = !currentValue;
      
      console.log(`Set ${setNumber} was ${currentValue}, now ${state.openTypeFeatures.stylisticSets[setNumber]}`);
    }
  } else if (feature === 'numeralStyle') {
    // Cycle through numeral styles
    const currentStyle = state.openTypeFeatures.numeralStyle;
    const availableFeatures = getAvailableFeatures(state.fontName);
    
    let nextStyle = 'normal';
    if (currentStyle === 'normal') nextStyle = 'tabular';
    else if (currentStyle === 'tabular') nextStyle = 'oldStyle';
    else if (currentStyle === 'oldStyle') nextStyle = 'proportional';
    else nextStyle = 'normal';
    
    // Only set styles that are available for this font
    if (
      (nextStyle === 'tabular' && !availableFeatures.includes('tnum')) ||
      (nextStyle === 'oldStyle' && !availableFeatures.includes('onum')) ||
      (nextStyle === 'proportional' && !availableFeatures.includes('pnum'))
    ) {
      nextStyle = 'normal';
    }
    
    state.openTypeFeatures.numeralStyle = nextStyle;
    console.log(`Numeral style changed to: ${nextStyle}`);
  } else {
    // Toggle boolean feature
    state.openTypeFeatures[feature] = !state.openTypeFeatures[feature];
    console.log(`Feature ${feature} set to: ${state.openTypeFeatures[feature]}`);
  }
  
  // Generate CSS to check what's being applied
  const css = generateOpenTypeCss();
  console.log(`Generated CSS: ${css}`);
  
  updateFeatureCount();
  updateDisplayContent();
}

// Set numeral style
function setNumeralStyle(style) {
  state.openTypeFeatures.numeralStyle = style;
  updateDisplayContent();
  
  // Update radio button UI
  const radioButtons = numeralStyles.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.checked = radio.value === style;
  });
}

// Update sample text based on selected option
function updateSampleText() {
  let text = '';
  switch(state.sampleText) {
    case 'pangram':
      text = 'The Quick Brown Fox Jumps\nOver The Lazy Dog';
      break;
    case 'lorem':
      text = 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit';
      break;
    case 'alphabet':
      text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz';
      break;
    case 'numbers':
      text = '1234567890\n!@#$%^&*()';
      break;
    default:
      text = 'The Quick Brown Fox Jumps\nOver The Lazy Dog';
  }
  state.displayText = text;
}

// Update the display content based on current state
function updateDisplayContent() {
  // Set the text content
  displayContent.textContent = state.displayText;
  
  // Update styles
  displayContent.style.fontFamily = `"${state.fontName}", sans-serif`;
  displayContent.style.fontSize = `${state.fontSize}px`;
  displayContent.style.fontWeight = state.fontStyle === 'bold' ? 'bold' : 'normal';
  displayContent.style.fontStyle = state.fontStyle === 'italic' ? 'italic' : 'normal';
  displayContent.style.lineHeight = state.lineHeight;
  displayContent.style.letterSpacing = `${state.tracking}em`;
  displayContent.style.textAlign = state.alignment;
  displayContent.style.color = state.textColor;
  document.getElementById('displayArea').style.backgroundColor = state.backgroundColor;
  
  // Set font-feature-settings
  const featureSettings = generateOpenTypeCss();
  displayContent.style.fontFeatureSettings = featureSettings;
}

// Update the buy button URL
function updateBuyButton() {
  const url = getBuyUrl(state.fontName);
  buyButton.href = url;
  buyButton.textContent = `Buy ${state.fontName}`;
}

// Update the feature count in the OpenType toggle button
function updateFeatureCount() {
  const count = Object.entries(state.openTypeFeatures)
    .filter(([k, v]) => k !== 'numeralStyle' && k !== 'stylisticSets' && v === true)
    .length;
  
  // Add stylistic sets count
  const stylisticSetsCount = Object.values(state.openTypeFeatures.stylisticSets)
    .filter(v => v === true)
    .length;
  
  const totalCount = count + stylisticSetsCount;
  featureCount.textContent = totalCount;
}

// Initialize OpenType features based on available features
function initializeOpenTypeFeatures() {
  const availableFeatures = getAvailableFeatures(state.fontName);
  const availableSets = getAvailableStyleSets(state.fontName);
  
  // Initialize stylistic sets object
  const stylisticSets = {};
  availableSets.forEach(setNum => {
    stylisticSets[setNum] = false; // All sets off by default
  });
  
  state.openTypeFeatures = {
    // Text Features
    ligatures: availableFeatures.includes('liga'), // Only ligatures on by default
    contextual: false,
    discretionaryLigatures: false,
    stylisticAlternates: false,
    stylisticSets: stylisticSets,
    smallCaps: false,
    swash: false,
    
    // Number Features
    numeralStyle: 'normal',
    
    // Special Features
    fractions: false,
    slashedZero: false,
  };
  
  updateFeatures();
}

// Update the OpenType features UI
function updateFeatures() {
  // Clear existing features
  textFeatures.innerHTML = '';
  numeralStyles.innerHTML = '';
  specialFeatures.innerHTML = '';
  
  const availableFeatures = getAvailableFeatures(state.fontName);
  
  // Text Features
  if (availableFeatures.includes('liga')) {
    createToggleFeature(textFeatures, 'Ligatures', 'ligatures');
  }
  
  if (availableFeatures.includes('dlig')) {
    createToggleFeature(textFeatures, 'Discretionary Ligatures', 'discretionaryLigatures');
  }
  
  if (availableFeatures.includes('calt')) {
    createToggleFeature(textFeatures, 'Contextual Alternates', 'contextual');
  }
  
  // Stylistic Sets
  const stylisticSets = getAvailableStyleSets(state.fontName);
  stylisticSets.forEach(setNum => {
    createToggleFeature(textFeatures, `Stylistic Set ${setNum}`, `ss${String(setNum).padStart(2, '0')}`);
  });
  
  if (availableFeatures.includes('smcp')) {
    createToggleFeature(textFeatures, 'Small Caps', 'smallCaps');
  }
  
  if (availableFeatures.includes('swsh')) {
    createToggleFeature(textFeatures, 'Swash', 'swash');
  }
  
  // Numeral Styles
  createRadioButton(numeralStyles, 'Normal', 'normal', state.openTypeFeatures.numeralStyle === 'normal');
  
  if (availableFeatures.includes('tnum')) {
    createRadioButton(numeralStyles, 'Tabular', 'tabular', state.openTypeFeatures.numeralStyle === 'tabular');
  }
  
  if (availableFeatures.includes('onum')) {
    createRadioButton(numeralStyles, 'Old Style', 'oldStyle', state.openTypeFeatures.numeralStyle === 'oldStyle');
  }
  
  if (availableFeatures.includes('pnum')) {
    createRadioButton(numeralStyles, 'Proportional', 'proportional', state.openTypeFeatures.numeralStyle === 'proportional');
  }
  
  // Special Features
  if (availableFeatures.includes('frac')) {
    createToggleFeature(specialFeatures, 'Fractions', 'fractions');
  }
  
  if (availableFeatures.includes('zero')) {
    createToggleFeature(specialFeatures, 'Slashed Zero', 'slashedZero');
  }
}

// Create a toggle feature UI element
function createToggleFeature(container, label, feature) {
  const div = document.createElement('div');
  div.className = 'feature-item';
  div.innerHTML = `
    <span class="text-sm">${label}</span>
    <label class="toggle-switch">
      <input type="checkbox" ${isFeatureActive(feature) ? 'checked' : ''}>
      <span class="toggle-slider"></span>
    </label>
  `;
  
  const checkbox = div.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    handleFeatureToggle(feature);
  });
  
  container.appendChild(div);
}

// Create a radio button for numeral styles
function createRadioButton(container, label, value, checked) {
  const div = document.createElement('div');
  div.className = 'radio-item';
  div.innerHTML = `
    <input type="radio" id="numeral-${value}" name="numeralStyle" value="${value}" ${checked ? 'checked' : ''}>
    <label for="numeral-${value}">${label}</label>
  `;
  
  const radio = div.querySelector('input[type="radio"]');
  radio.addEventListener('change', () => {
    if (radio.checked) {
      setNumeralStyle(value);
      updateFeatureCount();
    }
  });
  
  container.appendChild(div);
}

// Check if a feature is active
function isFeatureActive(feature) {
  if (feature.startsWith('ss') && feature.length === 4) {
    const setNumber = parseInt(feature.substring(2), 10);
    
    // Make sure stylisticSets exists
    if (!state.openTypeFeatures.stylisticSets) {
      state.openTypeFeatures.stylisticSets = {};
      return false;
    }
    
    // Check if the specific stylistic set is active
    return !!state.openTypeFeatures.stylisticSets[setNumber];
  }
  
  // For regular features, check if they exist and are true
  return !!state.openTypeFeatures[feature];
}

// Generate CSS for OpenType features
function generateOpenTypeCss() {
  let featureSettings = '';
  
  // Text Features
  if (state.openTypeFeatures.ligatures) featureSettings += '"liga" on, ';
  if (state.openTypeFeatures.discretionaryLigatures) featureSettings += '"dlig" on, ';
  if (state.openTypeFeatures.contextual) featureSettings += '"calt" on, ';
  if (state.openTypeFeatures.smallCaps) featureSettings += '"smcp" on, ';
  if (state.openTypeFeatures.swash) featureSettings += '"swsh" on, ';
  
  // Stylistic Sets
  if (state.openTypeFeatures.stylisticSets) {
    // Loop through all possible stylistic sets (1-20)
    for (let i = 1; i <= 20; i++) {
      if (state.openTypeFeatures.stylisticSets[i] === true) {
        // Create the ss01, ss02, etc. format with padding to ensure two digits
        const ssCode = `ss${String(i).padStart(2, '0')}`;
        featureSettings += `"${ssCode}" on, `;
        console.log(`Adding stylistic set ${i} to CSS`);
      }
    }
  }
  
  // Number Features
  if (state.openTypeFeatures.numeralStyle === 'tabular') featureSettings += '"tnum" on, ';
  if (state.openTypeFeatures.numeralStyle === 'oldStyle') featureSettings += '"onum" on, ';
  if (state.openTypeFeatures.numeralStyle === 'proportional') featureSettings += '"pnum" on, ';
  
  // Special Features
  if (state.openTypeFeatures.fractions) featureSettings += '"frac" on, ';
  if (state.openTypeFeatures.slashedZero) featureSettings += '"zero" on, ';
  
  // Remove trailing comma and space
  if (featureSettings.endsWith(', ')) {
    featureSettings = featureSettings.slice(0, -2);
  }
  
  // Return empty string if no features are enabled to avoid CSS errors
  return featureSettings || 'normal';
}

// Helper function to get feature code
function getFeatureCode(feature) {
  switch (feature) {
    case 'ligatures': return 'liga';
    case 'contextual': return 'calt';
    case 'discretionaryLigatures': return 'dlig';
    case 'stylisticAlternates': return 'salt';
    case 'smallCaps': return 'smcp';
    case 'swash': return 'swsh';
    case 'fractions': return 'frac';
    case 'slashedZero': return 'zero';
    default: return null;
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);