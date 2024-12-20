document.addEventListener('DOMContentLoaded', () => {
  const activateSelector = document.getElementById('activate-selector');
  
  activateSelector.addEventListener('click', async () => {
    console.log("Clicked send message");
    
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (!tab) {
        console.error('No active tab found');
        return;
      }
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'activateSelector',
        data: {
          backgroundColor: 'lightblue',
        }
      });
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
});