import os
import signal
import time
import psutil

# Kill uvicorn processes
for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
    try:
        cmdline = ' '.join(proc.info['cmdline'] or [])
        if 'uvicorn' in cmdline and 'main:app' in cmdline:
            print(f"Killing process {proc.info['pid']}: {proc.info['name']}")
            proc.kill()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        pass

print("Waiting for processes to terminate...")
time.sleep(3)

# Start new uvicorn
os.chdir('backend')
print("Starting uvicorn...")
os.system('start /B cmd /C "venv\\Scripts\\activate && uvicorn main:app --reload --host 127.0.0.1 --port 8000"')
print("Backend restarted!")
