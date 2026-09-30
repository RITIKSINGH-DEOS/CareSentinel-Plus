from datetime import datetime
from typing import Dict
from models import SmartLockInput, SmartLockOutput

# In-memory virtual deadbolt actuator state
_lock_state: Dict[str, str] = {
    "front_door": "UNLOCKED",
    "back_door": "LOCKED"
}

def control_smart_lock(params: SmartLockInput) -> SmartLockOutput:
    """
    MCP Tool: control_smart_lock
    Interfaces with Ring Smart Lock actuator or simulated deadbolt to lock, unlock,
    or verify physical security status.
    """
    door_id = params.door_id
    current_status = _lock_state.get(door_id, "UNLOCKED")
    action = params.action.upper()
    now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if action == "CHECK_STATE":
        return SmartLockOutput(
            door_id=door_id,
            status=current_status,
            previous_status=current_status,
            success=True,
            timestamp=now_iso,
            message=f"{door_id.replace('_', ' ').title()} is currently {current_status}."
        )

    if action == "LOCK":
        _lock_state[door_id] = "LOCKED"
        return SmartLockOutput(
            door_id=door_id,
            status="LOCKED",
            previous_status=current_status,
            success=True,
            timestamp=now_iso,
            message=f"Deadbolt successfully engaged. {door_id.replace('_', ' ').title()} is now securely LOCKED."
        )

    if action == "UNLOCK":
        _lock_state[door_id] = "UNLOCKED"
        return SmartLockOutput(
            door_id=door_id,
            status="UNLOCKED",
            previous_status=current_status,
            success=True,
            timestamp=now_iso,
            message=f"{door_id.replace('_', ' ').title()} is now UNLOCKED."
        )

    return SmartLockOutput(
        door_id=door_id,
        status=current_status,
        previous_status=current_status,
        success=False,
        timestamp=now_iso,
        message=f"Unsupported action: {action}"
    )

def get_current_lock_state(door_id: str = "front_door") -> str:
    return _lock_state.get(door_id, "UNLOCKED")
