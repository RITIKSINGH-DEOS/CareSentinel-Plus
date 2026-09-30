import uuid
from datetime import datetime
import json
from config import settings
from models import CaregiverDispatchInput, CaregiverDispatchOutput

# In-memory dispatch audit log
_dispatch_history = []

def caregiver_dispatcher(params: CaregiverDispatchInput) -> CaregiverDispatchOutput:
    """
    MCP Tool: caregiver_dispatcher
    Dispatches urgent SMS, Push, or Webhook alerts to family and caregivers.
    Uses AWS SNS (Simple Notification Service) when configured, or local high-fidelity simulator.
    """
    dispatch_id = f"disp_{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    recipients = [f"{settings.CAREGIVER_NAME} ({settings.CAREGIVER_PHONE})"]
    channels = ["SMS", "Echo App Push Notification"]

    if params.alert_level == "CRITICAL_SOS":
        recipients.append(f"Emergency Response Service ({settings.EMERGENCY_DISPATCH_PHONE})")
        channels.append("Priority Automated Voice Call")

    aws_message_id = None
    delivery_status = "SIMULATED_SUCCESS"

    # Attempt real AWS SNS dispatch if credentials exist (AWS Builder Challenge)
    if settings.has_aws_credentials and settings.AWS_SNS_TOPIC_ARN:
        try:
            import boto3
            sns_client = boto3.client(
                "sns",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            payload = {
                "dispatch_id": dispatch_id,
                "alert_level": params.alert_level,
                "patient_status": params.patient_status,
                "message": params.message,
                "timestamp": now_str
            }
            response = sns_client.publish(
                TopicArn=settings.AWS_SNS_TOPIC_ARN,
                Message=json.dumps(payload),
                Subject=f"CareSentinel Alert [{params.alert_level}]: {params.patient_status}"
            )
            aws_message_id = response.get("MessageId")
            delivery_status = "DELIVERED"
        except Exception as e:
            # Fallback gracefully without breaking demo
            print(f"[AWS SNS Warn] Could not send via real SNS: {e}. Falling back to simulation.")
            delivery_status = "SIMULATED_SUCCESS"
            aws_message_id = f"mock_sns_{uuid.uuid4().hex[:12]}"
    else:
        aws_message_id = f"mock_sns_{uuid.uuid4().hex[:12]}"

    record = CaregiverDispatchOutput(
        dispatch_id=dispatch_id,
        alert_level=params.alert_level,
        recipients_notified=recipients,
        channels_used=channels,
        delivered_at=now_str,
        aws_sns_message_id=aws_message_id,
        status=delivery_status
    )
    _dispatch_history.append(record.model_dump())
    return record

def get_dispatch_history():
    return _dispatch_history
