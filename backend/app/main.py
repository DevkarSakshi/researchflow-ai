from fastapi import FastAPI

app = FastAPI(title="ResearchFlow AI")


@app.get("/")
def root():
    return {"message": "ResearchFlow AI API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}