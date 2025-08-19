// Mobile Network Configuration
// To find your IP address, run 'ipconfig' in Command Prompt and look for "IPv4 Address"
// Example: 192.168.1.100, 192.168.0.105, 10.0.0.15, etc.

export const MOBILE_API_CONFIG = {
  // IMPORTANT: Replace this IP with your computer's actual IP address
  // Run 'ipconfig' in Command Prompt to find your IPv4 Address
  // Common patterns: 192.168.1.xxx, 192.168.0.xxx, 10.0.0.xxx
  IP_ADDRESS: '192.168.1.120', // Updated automatically
  PORT: '8000',
  
  get API_URL() {
    return `http://${this.IP_ADDRESS}:${this.PORT}/api`;
  }
};

// Instructions:
// 1. Open Command Prompt (cmd)
// 2. Type: ipconfig
// 3. Look for "IPv4 Address" under your network adapter
// 4. Update IP_ADDRESS above with that value
// 5. Restart your Expo development server
