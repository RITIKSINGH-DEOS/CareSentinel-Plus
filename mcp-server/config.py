import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # AWS Settings (AWS Builder Challenge)
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_BEDROCK_MODEL_ID: str = os.getenv("AWS_BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    AWS_SNS_TOPIC_ARN: str = os.getenv("AWS_SNS_TOPIC_ARN", "")

    # Caregiver Settings
    CAREGIVER_NAME: str = os.getenv("CAREGIVER_NAME", "Priya (Daughter)")
    CAREGIVER_PHONE: str = os.getenv("CAREGIVER_PHONE", "+15550198234")
    CAREGIVER_EMAIL: str = os.getenv("CAREGIVER_EMAIL", "priya.caregiver@example.com")
    EMERGENCY_DISPATCH_PHONE: str = os.getenv("EMERGENCY_DISPATCH_PHONE", "911")

    @property
    def has_aws_credentials(self) -> bool:
        return bool(self.AWS_ACCESS_KEY_ID and self.AWS_SECRET_ACCESS_KEY)

settings = Settings()
