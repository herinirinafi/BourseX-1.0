#!/usr/bin/env python
"""
Start Django server for mobile development
This allows connections from mobile devices on the same network
"""
import subprocess
import socket
import sys
import os

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
        return local_ip
    except Exception:
        return "Unable to determine IP"

def main():
    print("🚀 Starting BourseX Django Server for Mobile Development")
    print("=" * 60)
    
    # Get local IP
    local_ip = get_local_ip()
    print(f"📱 Your mobile device should connect to: http://{local_ip}:8000/api")
    print(f"🌐 Web browser can still use: http://127.0.0.1:8000/api")
    print()
    
    # Change to Backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'Backend')
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
        print(f"📂 Changed to: {os.getcwd()}")
    else:
        print("❌ Backend directory not found!")
        sys.exit(1)
    
    # Update mobile config with detected IP
    mobile_config_path = os.path.join('..', 'Frontend', 'src', 'config', 'mobile-config.ts')
    if os.path.exists(mobile_config_path):
        print(f"🔧 Updating mobile config with IP: {local_ip}")
        with open(mobile_config_path, 'r') as f:
            content = f.read()
        
        # Replace IP in the config
        import re
        new_content = re.sub(
            r"IP_ADDRESS: '[^']*'",
            f"IP_ADDRESS: '{local_ip}'",
            content
        )
        
        with open(mobile_config_path, 'w') as f:
            f.write(new_content)
        print("✅ Mobile config updated!")
    
    print()
    print("🔥 Starting Django server...")
    print("   Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        # Start Django server on all interfaces
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

if __name__ == "__main__":
    main()
