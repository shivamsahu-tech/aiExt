// Immediately log to verify the script is loading
console.log('Content script loaded');

// Set up message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.action === 'activateSelector') {         
        enableElementSelection();
        sendResponse({ success: true });
    }
    
    return true;
});


// Log to verify the listener is set up
console.log('Content script message listener ready');





function enableElementSelection() {
    // Create overlay for the webpage
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.id = 'element-selection-overlay'; 
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.2)';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'crosshair';
    overlay.style.pointerEvents = 'none'; // Prevent interaction with overlay
  
    document.body.appendChild(overlay);
  
    // Function to get element details
    function getElementDetails(element) {
      const details = {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        attributes: {},
        computedStyles: {},
        textContent: element.textContent.trim(),
        innerHtml: element.innerHTML.trim(),
        boundingRect: element.getBoundingClientRect(),
        xpath: getXPath(element)
      };
  
      for (let attr of element.attributes) {
        details.attributes[attr.name] = attr.value;
      }
  
      // Collect computed styles
      const computedStyle = window.getComputedStyle(element);
      const stylesToCapture = [
        'color', 'backgroundColor', 'display', 'position', 
        'width', 'height', 'margin', 'padding', 
        'fontSize', 'fontWeight', 'textAlign'
      ];
  
      stylesToCapture.forEach(style => {
        details.computedStyles[style] = computedStyle.getPropertyValue(style);
      });
  
      console.log(details);
      return details;
    }
  
    function getXPath(element) {
        if (!element || element.nodeType !== 1) {
            throw new Error("Invalid element provided to getXPath.");
        }
    
        // If the element has an ID, use it for a short and unique XPath
        if (element.id) {
            return `//*[@id='${element.id}']`;
        }
    
        // Build the XPath recursively
        const getPath = (node) => {
            if (!node || node.nodeType !== 1) {
                return '';
            }
    
            const parent = node.parentNode;
            const siblings = parent ? Array.from(parent.children) : [];
            const sameTagSiblings = siblings.filter(sibling => sibling.tagName === node.tagName);
            const index = sameTagSiblings.indexOf(node) + 1; // XPath indices are 1-based
    
            const tagName = node.tagName.toLowerCase(); // Use lowercase for compatibility
            const segment = sameTagSiblings.length > 1 ? `${tagName}[${index}]` : tagName;
    
            return `${getPath(parent)}/${segment}`;
        };
    
        return `/${getPath(element).replace(/^\//, '')}`; // Ensure a single leading slash
    }
  
    // Handle element selection
    function handleElementSelect(e) {
      e.preventDefault();
      e.stopPropagation();
  
      try {
        const overlay = document.getElementById('element-selection-overlay');
        if (overlay) {
            document.body.removeChild(overlay); // Remove overlay after selection
            console.log("Overlay removed");
        }
      } catch (error) {
        console.error("Error removing overlay:", error);
      }
  
      const selectedElement = e.target;
      const originalOutline = selectedElement.style.outline;
      selectedElement.style.outline = '3px dotted red';
  
      const elementDetails = getElementDetails(selectedElement);

      localStorage.setItem('elementDetails', JSON.stringify(elementDetails));

      //pritn result
      document.getElementById('result').textContent = JSON.stringify(elementDetails, null, 2);
  
      // Optionally, you can send the details somewhere
      setTimeout(() => {
        selectedElement.style.outline = originalOutline;
      }, 2000);
  
      cleanupEventListeners()
    }

  
    // Handle mouse over event for element highlighting
    function handleMouseOver(e) {
      e.preventDefault();
      e.stopPropagation();
      e.target.style.outline = '2px solid blue';
    }
  
    // Handle mouse out event to remove highlighting
    function handleMouseOut(e) {
      e.preventDefault();
      e.stopPropagation();
      e.target.style.outline = '';
    }
  
     // Cleanup event listeners
    function cleanupEventListeners() {
        console.log("Event listeners removed.");
        document.removeEventListener('click', handleElementSelect);
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
    }

    // Add event listeners after the overlay is added
    setTimeout(() => {
        document.addEventListener('click', handleElementSelect);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
    }, 100);
  }





