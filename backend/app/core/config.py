from dotenv import load_dotenv
load_dotenv()
import os

class Settings:
    app_name = os.getenv('APP_NAME', 'Fila Virtual API')
    database_url = os.getenv('DATABASE_URL', 'sqlite:///./fila_virtual.db')
    jwt_secret = os.getenv('JWT_SECRET', 'change-me-in-production')
    jwt_exp_minutes = int(os.getenv('JWT_EXP_MINUTES', '480'))
    _fixed_notice = os.getenv('DEFAULT_FIXED_NOTICE_MINUTES')
    default_fixed_notice_minutes = int(_fixed_notice) if _fixed_notice else None
    min_samples_for_estimate = int(os.getenv('MIN_SAMPLES_FOR_ESTIMATE', '3'))
    cors_origins = [x.strip() for x in os.getenv('CORS_ORIGINS', '*').split(',') if x.strip()]

settings = Settings()
