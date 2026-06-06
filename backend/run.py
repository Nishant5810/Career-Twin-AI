import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load .env file explicitly
    load_dotenv()
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    print(f"Starting Career Twin AI Backend on http://{host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
