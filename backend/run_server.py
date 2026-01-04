#!/usr/bin/env python3
"""Simple server runner that keeps the server alive"""

import time
import subprocess
import sys

def run_server():
    """Run the server and keep it alive"""
    cmd = [
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "127.0.0.1",
        "--port", "8001",
        "--reload"
    ]

    print("Starting backend server...")
    print(f"Command: {' '.join(cmd)}")

    try:
        # Start the server
        process = subprocess.Popen(
            cmd,
            cwd=".",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        print(f"Server process started with PID: {process.pid}")

        # Keep the script running
        while True:
            time.sleep(1)
            if process.poll() is not None:
                # Process has terminated
                stdout, stderr = process.communicate()
                print("Server process terminated")
                if stdout:
                    print("STDOUT:", stdout)
                if stderr:
                    print("STDERR:", stderr)
                break

    except KeyboardInterrupt:
        print("\nStopping server...")
        if 'process' in locals():
            process.terminate()
            process.wait()
        print("Server stopped")

if __name__ == "__main__":
    run_server()
