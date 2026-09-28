from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.research import router as research_router


app = FastAPI(title="ResearchFlow AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(research_router)

@app.get("/")
def root():
    return {"message": "ResearchFlow AI API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}