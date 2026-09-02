import os

with open("src/components/AICoachChat.tsx", "r") as f:
    content = f.read()

old_retry_logic = """      let response;
      let retries = 2; // Maximum 2 retries (3 attempts total)
      
      while (retries >= 0) {
        response = await fetch('/api/chat', {"""

new_retry_logic = """      let response;
      let retries = 2; // Maximum 2 retries (3 attempts total)
      
      while (retries >= 0) {
        response = await fetch('/api/chat', {"""

old_if_logic = """        if (response.status === 503 && retries > 0) {
          console.log(`Received 503, retrying in 2 seconds... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
          continue;
        }
        
        break;
      }

      // Check if response is defined (it should be, but TS might complain if not initialized)
      if (!response) {
        throw new Error('No response from fetch');
      }

      console.log('Chat API response status:', response.status);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('503_ERROR');
        }
        const errorText = await response.text();
        console.error('Chat API Error - Status:', response.status, 'Body:', errorText);
        throw new Error(`Server status ${response.status}: ${errorText}`);
      }"""

new_if_logic = """        // Backend now returns 503 if Gemini throws 503, but just in case we also check 500 with text
        const isErrorStatus = response.status === 503 || response.status === 500 || response.status === 429;
        
        if (isErrorStatus && retries > 0) {
          const clone = response.clone();
          const errorText = await clone.text().catch(() => '');
          
          if (response.status === 503 || response.status === 429 || errorText.includes('503') || errorText.includes('UNAVAILABLE') || errorText.includes('high demand') || errorText.includes('quota')) {
            const delay = retries === 2 ? 2000 : 4000;
            console.log(`Received overloaded error, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
            continue;
          }
        }
        
        break;
      }

      if (!response) {
        throw new Error('No response from fetch');
      }

      console.log('Chat API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat API Error - Status:', response.status, 'Body:', errorText);
        
        if (response.status === 503 || response.status === 429 || errorText.includes('503') || errorText.includes('UNAVAILABLE') || errorText.includes('high demand') || errorText.includes('quota')) {
          throw new Error('503_ERROR');
        }
        throw new Error(`Server status ${response.status}: ${errorText}`);
      }"""

content = content.replace(old_if_logic, new_if_logic)

with open("src/components/AICoachChat.tsx", "w") as f:
    f.write(content)

print("Updated AICoachChat.tsx")
