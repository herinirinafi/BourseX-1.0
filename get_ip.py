import socket

def get_local_ip():
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
        return local_ip
    except Exception:
        return "Unable to determine IP"

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"Your local IP address is: {ip}")
    print(f"Update your Frontend API config to use: http://{ip}:8000/api")
