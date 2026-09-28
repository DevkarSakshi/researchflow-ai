from pymongo import MongoClient

from core.settings import settings


client = MongoClient(settings.mongodb_url)

db = client[settings.database_name]